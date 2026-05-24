import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          TaskManager
        </Link>

        {currentUser ? (
          <div className="nav-menu">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/projects" className="nav-link">Projects</Link>
            <Link to="/tasks" className="nav-link">Tasks</Link>
            <span className="nav-user">Welcome, {currentUser.name}</span>
            <button onClick={handleLogout} className="nav-logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-menu">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
