# Xtrack

Find local events, save confirmed RSVPs, share event invites, and search with the built-in event chat.

## Requirements

- Node.js 20.19+ (or 22.12+)
- MongoDB Atlas cluster or local MongoDB
- Ticketmaster Discovery API consumer key

## Setup

1. Copy `.env.example` to `.env` in the repository root.
2. Set `MONGODB_URI` to your MongoDB connection string and `TICKETMASTER_API_KEY` to your Ticketmaster key. Keep `.env` private; Git ignores it.
3. Keep `PORT=4000` and `CLIENT_URL=http://localhost:5173` for local development.
4. Install and start the backend in a terminal:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

5. Install and start the frontend in a second terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

6. Open `http://localhost:5173`. The API health endpoint is `http://localhost:4000/api/health`.

The API requires MongoDB to connect before it starts listening. Event search and chat require a valid Ticketmaster key. For Atlas, add your current IP to Network Access and use a database user with read/write access. URL-encode reserved characters in the connection-string username or password.

## Environment Variables

| Variable | Purpose | Local default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | None; required |
| `TICKETMASTER_API_KEY` | Ticketmaster Discovery API key | None; required for event search |
| `PORT` | Backend HTTP and Socket.IO port | `4000` |
| `CLIENT_URL` | Allowed frontend origin and share-link base URL | `http://localhost:5173` |

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/events?city=&keyword=&month=&date=&page=&size=` | Normalized Ticketmaster events and server-computed calendar counts |
| `GET` | `/api/users/:userId` | Read user profile |
| `PUT` | `/api/users/:userId` | Save profile name and email |
| `GET` | `/api/users/:userId/rsvps` | List confirmed event attendance |
| `POST` | `/api/users/:userId/rsvps` | Confirm event attendance |
| `DELETE` | `/api/users/:userId/rsvps/:eventId` | Remove RSVP |
| `GET` | `/api/users/:userId/reminders` | List reminder preferences |
| `PUT` | `/api/users/:userId/reminders/:eventId` | Save a reminder preference |
| `POST` | `/api/share-links` | Create or reuse an RSVP-gated share link |
| `GET` | `/api/share/:token?userId=` | Record a click and return the shared event/count |
| `POST` | `/api/chat` | Search events from a chat message and city |

Socket.IO clients join event rooms with `events:join` and receive `friends-attending:update` when an invite click is recorded.

## Architecture

- `backend/src/routes` validates API requests and delegates to controllers.
- `backend/src/controllers` coordinates HTTP responses; `backend/src/services` contains Ticketmaster, RSVP, invite-count, and chat behavior.
- `backend/src/models` defines MongoDB user, RSVP, reminder, share-link, and invite-click schemas and indexes.
- `backend/src/sockets` manages Socket.IO rooms and live count updates.
- `frontend/src/pages` and `components` render the discovery, RSVP, invite, and chat interfaces. `frontend/src/services` makes REST and Socket.IO connections; `frontend/src/state` shares client state.
- There is no authentication system. A stable browser-local user ID is used to associate profile, RSVP, and invite-click records.

## Invite Count Rule

Each visitor counts once per share token. The Friends Attending value deduplicates a visitor across every invite link for the same event, and a link creator’s own clicks do not count. The server applies this rule when writing clicks and computing event-feed counts.

## Checks

```powershell
cd backend
npm test
```

```powershell
cd frontend
npm run build
npm run lint
```