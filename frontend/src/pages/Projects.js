import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [memberEmails, setMemberEmails] = useState({});

  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, create: '' });

    try {
      await axios.post(`${API_URL}/projects`, { name, description });
      setName('');
      setDescription('');
      fetchProjects();
    } catch (error) {
      setErrors({ ...errors, create: error.response?.data?.message || 'Unable to create project' });
    }
  };

  const handleAddMember = async (projectId) => {
    const email = memberEmails[projectId]?.trim();
    if (!email) return;

    try {
      await axios.post(`${API_URL}/projects/${projectId}/members`, { email });
      setMemberEmails({ ...memberEmails, [projectId]: '' });
      setErrors({ ...errors, [projectId]: '' });
      fetchProjects();
    } catch (error) {
      setErrors({ ...errors, [projectId]: error.response?.data?.message || 'Unable to add member' });
    }
  };

  const handleRemoveMember = async (projectId, memberId) => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}/members/${memberId}`);
      setErrors({ ...errors, [projectId]: '' });
      fetchProjects();
    } catch (error) {
      setErrors({ ...errors, [projectId]: error.response?.data?.message || 'Unable to remove member' });
    }
  };

  return (
    <div className="projects-page">
      <h1>Projects</h1>

      <div className="project-form-card">
        <h2>Create New Project</h2>
        {errors.create && <div className="error-message">{errors.create}</div>}
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label>Project Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Create Project</button>
        </form>
      </div>

      <div className="project-list">
        <h2>Your Projects</h2>
        {loading ? (
          <p>Loading projects...</p>
        ) : (
          projects.length ? (
            projects.map(project => {
              const isAdmin = currentUser?.id === project.admin?._id;
              return (
                <div key={project._id} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description provided.'}</p>
                  <p>Admin: {project.admin?.name}</p>

                  <div className="project-members">
                    <h4>Members</h4>
                    {project.members?.map(member => (
                      <div key={member._id} className="member-row">
                        <span>{member.name} ({member.email})</span>
                        {isAdmin && member._id !== project.admin?._id && (
                          <button
                            className="btn-secondary"
                            onClick={() => handleRemoveMember(project._id, member._id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="project-add-member">
                      <input
                        type="email"
                        placeholder="Invite member by email"
                        value={memberEmails[project._id] || ''}
                        onChange={(e) => setMemberEmails({
                          ...memberEmails,
                          [project._id]: e.target.value
                        })}
                      />
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => handleAddMember(project._id)}
                      >
                        Add Member
                      </button>
                      {errors[project._id] && <div className="error-message">{errors[project._id]}</div>}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No projects found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default Projects;
