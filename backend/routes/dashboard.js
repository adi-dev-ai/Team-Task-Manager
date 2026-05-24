const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const userProjects = await Project.find({ members: req.user._id });
    const projectIds = userProjects.map(p => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name');

    const totalTasks = allTasks.length;
    const tasksByStatus = {
      'To Do': allTasks.filter(t => t.status === 'To Do').length,
      'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
      'Done': allTasks.filter(t => t.status === 'Done').length
    };

    const myTasks = allTasks.filter(t => t.assignedTo?._id?.toString() === req.user._id.toString());
    const overdueTasks = allTasks.filter(t =>
      new Date(t.dueDate) < new Date() && t.status !== 'Done'
    ).length;

    const tasksByUser = {};
    allTasks.forEach(task => {
      const userName = task.assignedTo?.name || 'Unassigned';
      tasksByUser[userName] = (tasksByUser[userName] || 0) + 1;
    });

    res.json({
      totalTasks,
      myTasks: myTasks.length,
      tasksByStatus,
      tasksByUser,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
