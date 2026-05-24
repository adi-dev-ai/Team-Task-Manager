# Team Task Manager

A full-stack team task management application built with React, Node.js, Express, and MongoDB.

🌐 **Live Demo:** [team-task-manager-aditya.up.railway.app](https://team-task-manager-aditya.up.railway.app)

---

## Features

- User authentication (register, login) with JWT
- Create and manage projects
- Create, assign, and track tasks
- Dashboard with project/task statistics
- Role-based access control

---

## Tech Stack

**Frontend**
- React 18
- React Router v6
- Axios
- Context API for state management

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator

**Deployment**
- Railway (frontend + backend)
- MongoDB Atlas

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   ├── public/
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 14
- MongoDB (local or Atlas)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/adi-dev-ai/Team-Task-Manager.git
cd Team-Task-Manager
```

**2. Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend:
```bash
npm start
```

**3. Setup Frontend**
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

The app will be running at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/dashboard` | Get dashboard statistics |

---

## Deployment

This project is deployed on [Railway](https://railway.app).

- **Frontend:** [team-task-manager-aditya.up.railway.app](https://team-task-manager-aditya.up.railway.app)
- **Backend:** [team-task-manager-production-27ce.up.railway.app](https://team-task-manager-production-27ce.up.railway.app)

---