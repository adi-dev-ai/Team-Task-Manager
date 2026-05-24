const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create task
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('project').notEmpty().withMessage('Project is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate, priority, assignedTo, project } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectDoc.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can create tasks' });
    }

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    if (!projectDoc.members.includes(assignedUser._id)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      project,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('assignedTo createdBy project', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks
router.get('/', auth, async (req, res) => {
  try {
    const { project } = req.query;
    let query = {};

    if (project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc || !projectDoc.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      query.project = project;
    } else {
      const userProjects = await Project.find({ members: req.user._id });
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo createdBy project', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['To Do', 'In Progress', 'Done'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    await task.save();
    await task.populate('assignedTo createdBy project', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
