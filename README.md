# Realtime Chat App

A full-stack chat application built with React, Node.js, Express, and Socket.io. It supports instant message delivery, persistent chat history, timestamps, dummy username login, typing indicators, online user presence, and read receipts.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Real-time: Socket.io
- Storage: File-backed JSON message store
- Styling: Plain CSS with reusable React components

## Project Structure

```text
.
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── hooks/          # Chat state and socket logic
│       ├── services/       # REST and Socket.io clients
│       └── utils/          # Formatting helpers
├── server/                 # Express + Socket.io backend
│   └── src/
│       ├── config/         # Environment config
│       ├── controllers/    # REST controllers
│       ├── repositories/   # Message persistence
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── socket/         # Socket.io event handlers
│       └── utils/          # Shared server helpers
└── package.json            # Workspace scripts
```

## Environment Variables

Create `server/.env` from the example file:

```bash
cp server/.env.example server/.env
```

Available backend variables:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
MESSAGE_STORE_PATH=server/data/messages.json
```

Create `client/.env` from the example file:

```bash
cp client/.env.example client/.env
```

Available frontend variables:

```env
VITE_API_URL=http://localhost:5000
```

## Setup

Install dependencies from the project root:

```bash
npm install
```

## Run the Backend

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

With the backend running, verify Socket.io delivery between two simulated clients:

```bash
npm run smoke:socket
```

## Design Decisions

- React web was used because the assignment accepts React or React Native. This keeps setup and review simple while still showing a polished chat experience.
- Socket.io is the main messaging path. REST APIs are also implemented for assignment requirements and as a fallback if the socket is temporarily unavailable.
- A file-backed JSON store keeps messages after refresh without requiring MongoDB or a native SQLite build. The repository layer is isolated so it can be replaced with MongoDB or SQLite later.
- The frontend uses one custom hook, `useChat`, to keep socket state, messages, presence, typing, and read receipts in one predictable place.
- Message sending uses optimistic UI with a `clientId`, so the sender sees their message immediately while the server confirms and broadcasts the stored message.

## Assumptions

- This is a single public chat room.
- Authentication is dummy username-based login stored in `localStorage`.
- Delivery means the server accepted and broadcast the message.
- Read receipts are tracked by username.
- The backend and frontend run locally during review.

## Submission Notes

- GitHub repository: create a new GitHub repository and push this project.
- APK: not required because this version uses React web.
- Screen recording: open two browser windows with different usernames and record message delivery, typing, presence, refresh history, and read receipts.
