const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create project
router.post('/', auth, [
  body('name').notEmpty().withMessage('Project name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = new Project({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id]
    });

    await project.save();
    await project.populate('admin members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate('admin members', 'name email');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate('admin members', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from project
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (project.admin.toString() === req.params.memberId) {
      return res.status(400).json({ message: 'Cannot remove the project admin' });
    }

    project.members = project.members.filter(
      memberId => memberId.toString() !== req.params.memberId
    );

    await project.save();
    await project.populate('admin members', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
