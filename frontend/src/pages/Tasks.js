import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignedTo: '',
    project: ''
  });
  const [error, setError] = useState('');

  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const selectedProject = projects.find((project) => project._id === newTask.project);
  const projectMembers = selectedProject?.members || [];
  const isProjectAdmin = selectedProject?.admin?._id === currentUser?.id;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API_URL}/tasks`, newTask);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        assignedTo: '',
        project: ''
      });
      setShowCreateForm(false);
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Hide Form' : 'Create Task'}
        </button>
      </div>

      {showCreateForm && (
        <div className="task-form-card">
          <h2>Create Task</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Title</label>
              <input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Project</label>
              <select
                value={newTask.project}
                onChange={(e) => setNewTask({ ...newTask, project: e.target.value, assignedTo: '' })}
                required
              >
                <option value="">Select project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Assigned To</label>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                required
                disabled={!selectedProject}
              >
                <option value="">Select a team member</option>
                {projectMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={!selectedProject || !projectMembers.length}>
              Create Task
            </button>
          </form>
          {!selectedProject && <p className="form-note">Select a project to choose an assignee.</p>}
        </div>
      )}

      <div className="task-list">
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          tasks.length ? (
            tasks.map(task => (
              <div key={task._id} className="task-card">
                <div className="task-card-header">
                  <h3>{task.title}</h3>
                  <span className={`task-status status-${task.status.replace(/\s/g, '-').toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
                <p>{task.description || 'No description'}</p>
                <div className="task-meta">
                  <span>Project: {task.project?.name || 'Unknown'}</span>
                  <span>Assigned: {task.assignedTo?.name || 'Unknown'}</span>
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="task-actions">
                  {['To Do', 'In Progress', 'Done'].map(option => (
                    <button
                      key={option}
                      className="btn-secondary"
                      onClick={() => updateTaskStatus(task._id, option)}
                      disabled={task.status === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No tasks found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default Tasks;
