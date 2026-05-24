import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <div className="stat-number">{stats.totalTasks}</div>
          </div>

          <div className="stat-card">
            <h3>My Tasks</h3>
            <div className="stat-number">{stats.myTasks}</div>
          </div>

          <div className="stat-card">
            <h3>Overdue Tasks</h3>
            <div className="stat-number overdue">{stats.overdueTasks}</div>
          </div>

          <div className="stat-card">
            <h3>Tasks by Status</h3>
            <div className="status-breakdown">
              <div>To Do: {stats.tasksByStatus['To Do']}</div>
              <div>In Progress: {stats.tasksByStatus['In Progress']}</div>
              <div>Done: {stats.tasksByStatus['Done']}</div>
            </div>
          </div>

          <div className="stat-card">
            <h3>Tasks by User</h3>
            <div className="user-breakdown">
              {Object.entries(stats.tasksByUser).map(([user, count]) => (
                <div key={user}>{user}: {count}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
