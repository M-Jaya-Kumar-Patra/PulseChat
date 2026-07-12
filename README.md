# Realtime Chat App

A full-stack real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB. It supports instant message delivery, persistent chat history, timestamps, dummy username login, typing indicators, online user presence, and read receipts.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Real-time: Socket.io
- Database: MongoDB
- Styling: Plain CSS with reusable React components

## Project Structure

```text
.
|-- client/                 # React frontend
|   `-- src/
|       |-- components/     # Reusable UI components
|       |-- hooks/          # Chat state and socket logic
|       |-- services/       # REST and Socket.io clients
|       `-- utils/          # Formatting helpers
|-- server/                 # Express + Socket.io backend
|   `-- src/
|       |-- config/         # Environment and database config
|       |-- controllers/    # REST controllers
|       |-- repositories/   # MongoDB message persistence
|       |-- routes/         # API routes
|       |-- services/       # Business logic
|       |-- socket/         # Socket.io event handlers
|       `-- utils/          # Shared server helpers
|-- scripts/                # Smoke tests
`-- package.json            # Workspace scripts
```

## Environment Variables

Create or edit `server/.env`. A dummy MongoDB URI is included so you can replace it with your own Atlas or local MongoDB connection string:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb+srv://chat_user:chat_password@cluster0.example.mongodb.net/realtime-chat?retryWrites=true&w=majority
MONGODB_DB_NAME=realtime-chat
MONGODB_MESSAGES_COLLECTION=messages
```

For a local MongoDB server, `MONGODB_URI` can look like this:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/realtime-chat
```

Create `client/.env` if you need to point the frontend at a different backend URL:

```env
VITE_API_URL=http://localhost:5000
```

## Setup

Install dependencies from the project root:

```bash
npm install
```

## Run the Backend

Replace the dummy `MONGODB_URI` in `server/.env`, then run:

```bash
npm run dev:server
```

The backend starts on `http://localhost:5000`.

## Run the Frontend

In a second terminal:

```bash
npm run dev:client
```

The frontend starts on `http://localhost:5173`.

You can also run both together:

```bash
npm run dev
```

## Build the Frontend

```bash
npm run build
```

## REST API

### Health Check

```http
GET /api/health
```

### Fetch Chat History

```http
GET /api/messages
GET /api/messages?limit=50
```

### Send Message

```http
POST /api/messages
Content-Type: application/json

{
  "username": "Maya",
  "text": "Hello everyone"
}
```

### Mark Message As Read

```http
PATCH /api/messages/:messageId/read
Content-Type: application/json

{
  "username": "Maya"
}
```

## Socket.io Events

Client emits:

- `user:join` with `{ username }`
- `message:send` with `{ username, text, clientId }`
- `typing:start` with `{ username }`
- `typing:stop` with `{ username }`
- `message:read` with `{ messageId, username }`

Server emits:

- `message:new`
- `message:read`
- `presence:update`
- `typing:update`
- `error:message`

## Smoke Test

With the backend running and connected to MongoDB, verify Socket.io delivery between two simulated clients:

```bash
npm run smoke:socket
```

## Design Decisions

- React web is used because the assignment accepts React or React Native. This keeps setup simple while still meeting the real-time chat requirements.
- Socket.io is the primary messaging path. REST APIs are also implemented for sending messages and fetching chat history.
- MongoDB stores messages so chat history remains available after refreshing the frontend or restarting the backend.
- The backend uses controller, service, repository, route, socket, and config folders to keep responsibilities separate.
- The frontend uses one custom hook, `useChat`, to coordinate socket state, messages, presence, typing, and read receipts.
- Message sending uses optimistic UI with a `clientId`, so the sender sees a pending message immediately while the server confirms and broadcasts the stored message.

## Assumptions

- This is a single public chat room.
- Authentication is dummy username-based login stored in `localStorage`.
- Delivery means the server accepted and broadcast the message.
- Read receipts are tracked by username.
- The backend and frontend run locally during review unless deployment variables are added.
