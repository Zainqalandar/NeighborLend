# NeighborLend

NeighborLend is a full-stack community lending marketplace. Users can list useful items, discover items shared by nearby neighbors, send borrowing requests, and manage the lending lifecycle from one place.

The project is organized as a monorepo with a Next.js frontend and an Express/MongoDB backend.

## Features

- JWT-based registration and login
- Protected item creation, editing, and deletion
- Browse available items with search, category filtering, and pagination
- Item owner information with populated user data
- Borrow request workflow: pending, approved, rejected, and returned
- Owner and borrower request views
- AI-powered item description enhancement using Gemini
- Dynamic home page categories and featured items
- Responsive UI built with Tailwind CSS

## Tech stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios

### Backend

- Node.js and Express 5
- TypeScript
- MongoDB with Mongoose
- JWT and bcryptjs authentication
- Google Gemini API for description enhancement

## Project structure

```text
NeighborLend/
├── backend/
│   └── src/
│       ├── configs/       # Database connection
│       ├── controller/    # Auth, item, and request handlers
│       ├── middleware/    # Authentication middleware
│       ├── models/        # User, Item, and Request schemas
│       ├── routes/        # API routes
│       ├── scripts/       # Seed scripts
│       └── server.ts
├── frontend/
│   ├── app/               # Next.js routes and pages
│   ├── components/        # Shared UI components
│   ├── context/           # Notification context
│   ├── types/             # Shared frontend types
│   └── utils/             # Axios and auth helpers
└── README.md
```

## Requirements

- Node.js 18+
- npm
- MongoDB database, local or MongoDB Atlas
- Gemini API key for AI description enhancement

## Local setup

Clone the project and install dependencies in both workspaces:

```bash
cd NeighborLend/backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/neighborlend
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000/api
```

Start the backend and frontend in separate terminals:

```bash
# Terminal 1
cd NeighborLend/backend
npm run dev
```

```bash
# Terminal 2
cd NeighborLend/frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:5000](http://localhost:5000).

## Demo data

Register at least one user first, then seed demo items for that user:

```bash
cd NeighborLend/backend
npm run seed:items
```

The seed script skips seeding when the earliest user already has items.

## API overview

All API routes are prefixed with `/api`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Sign in and receive a JWT |
| GET | `/api/items` | No | Browse items with search, category, and pagination |
| GET | `/api/items/:id` | No | Get one item |
| POST | `/api/items` | Yes | List an item |
| PUT | `/api/items/:id` | Yes | Update an owned item |
| DELETE | `/api/items/:id` | Yes | Delete an owned item |
| POST | `/api/items/ai-enhance` | Yes | Enhance a description with Gemini |
| POST | `/api/requests` | Yes | Request to borrow an item |
| GET | `/api/requests/my-requests` | Yes | View sent requests |
| GET | `/api/requests/received` | Yes | View requests for owned items |
| PATCH | `/api/requests/:id/approve` | Yes | Approve a request |
| PATCH | `/api/requests/:id/reject` | Yes | Reject a request |
| PATCH | `/api/requests/:id/return` | Yes | Mark an item as returned |

The items endpoint supports query parameters such as:

```text
/api/items?search=drill&category=Power%20tools&page=1&limit=6
```

## Core data relationships

- An `Item` belongs to one `User` through `owner`.
- A `Request` connects an `Item`, a borrower, and an owner.
- Item statuses include `available`, `requested`, and `borrowed`.
- Request statuses include `pending`, `approved`, `rejected`, and `returned`.

## Scripts

### Frontend

```bash
npm run dev       # Start Next.js development server
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Run ESLint
```

### Backend

```bash
npm run dev       # Start the TypeScript API with reload
npm run seed:items # Insert demo items for the first user
```

## Future improvements

- Item image uploads instead of image URLs
- Due dates and automated return reminders
- Email and in-app notifications
- Ratings and reviews
- Neighbor-to-neighbor messaging
- Deployment with Vercel, Render, and MongoDB Atlas

