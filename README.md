# CoSketch Whiteboard

CoSketch is a full-stack collaborative whiteboard app with user authentication, saved canvases, canvas sharing, and a browser-based drawing board.
<img width="1870" height="900" alt="image" src="https://github.com/user-attachments/assets/09da4aa3-277d-416c-bf9f-a8e986b2c55b" />

<img width="1893" height="898" alt="image" src="https://github.com/user-attachments/assets/5ac0bae9-219a-4a65-8b93-1d0db58b7127" />


## Features

- Email/password authentication with JWT-protected routes
- Google sign-in support
- Dashboard for creating, opening, sharing, and deleting canvases
- Persistent canvas storage in MongoDB
- Drawing tools powered by RoughJS and Perfect Freehand
- Text, brush, shape, undo/redo, pan, and zoom support
- Socket.IO setup for real-time canvas room updates
- Frontend/backend health check for hosted deployments

## Tech Stack

**Frontend**

- React 18
- React Router
- Tailwind CSS
- RoughJS
- Perfect Freehand
- Socket.IO Client

**Backend**

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Google Auth Library
- Resend
- Socket.IO

## Project Structure

```text
whiteboard/
|-- Backend/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- db.js
|   |-- index.js
|   `-- package.json
|-- Frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- store/
|   |   |-- Toolbar/
|   |   `-- utils/
|   `-- package.json
`-- README.md
```

## Prerequisites

- Node.js and npm
- MongoDB connection string
- Google OAuth client ID, if using Google login
- Resend API key, if enabling email delivery

## Environment Variables

Create `Backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:3000
```

Create `Frontend/.env` if the backend is not running on `http://localhost:5000`:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Getting Started

Install backend dependencies:

```bash
cd Backend
npm install
```

Install frontend dependencies:

```bash
cd ../Frontend
npm install
```

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd Frontend
npm start
```

The frontend runs at [http://localhost:3000](http://localhost:3000), and the backend runs at [http://localhost:5000](http://localhost:5000) by default.

## Available Scripts

### Backend

```bash
npm start
```

Runs the Express server with Node.

```bash
npm run dev
```

Runs the Express server with Nodemon for development.

### Frontend

```bash
npm start
```

Runs the React app in development mode.

```bash
npm run build
```

Builds the React app for production.

```bash
npm test
```

Runs the React test runner.

## API Overview

### Auth

- `POST /register` - create a new account
- `POST /login` - log in with email and password
- `POST /google-login` - log in with Google
- `POST /verify` - verify an email code
- `GET /user` - get the authenticated user profile

### Canvas

- `GET /canvas` - list canvases available to the authenticated user
- `POST /canvas/create` - create a canvas
- `GET /canvas/:id` - get a canvas by ID
- `PUT /canvas/update` - save canvas elements
- `DELETE /canvas/delete` - delete a canvas
- `POST /canvas/share/:id` - share a canvas with another user

## Notes

- Protected API routes expect an `Authorization: Bearer <token>` header.
- The frontend stores the current JWT in `localStorage`.
- Canvas updates are saved to MongoDB and Socket.IO rooms are available for collaborative update broadcasts.
- Large canvas payloads are supported by the backend request body limit.
