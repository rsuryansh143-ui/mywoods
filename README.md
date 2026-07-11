# 🌿 MyWoods

A full-stack web application for exploring and managing wood types.

## Project Structure

```
mywoods/
├── frontend/       # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Page-level feature components
│   │   ├── routes/       # Route definitions
│   │   ├── layout/       # Layout wrappers
│   │   ├── utils/        # Utility functions
│   │   └── sampleData/   # Static/sample data
│   ├── public/           # Static assets (images, icons)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/        # Node.js + Express + MongoDB API
    ├── config/     # Database config
    ├── middleware/ # Auth middleware
    ├── models/     # Mongoose models
    ├── routes/     # API routes
    ├── server.js
    └── package.json
```

## Tech Stack

### Frontend
- **React 19** with Vite
- **React Router DOM v7** for routing
- **Bootstrap 5** + React Bootstrap for UI
- **React Icons** for iconography

### Backend
- **Node.js** + **Express** REST API
- **MongoDB Atlas** via Mongoose
- **JWT** authentication
- **Helmet** + **rate-limit** for security

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

> Make sure to add a `.env` file in the `backend/` folder (see `.env.example` if available).
