# 🎨 DrawSpace - Collaborative Drawing Made Simple

A real-time collaborative drawing application built with Next.js, WebSocket, and PostgreSQL. Draw together with your team, no matter where they are.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2-black)

## ✨ Features

### 🎯 Core Features
- **Real-time Collaboration** - Multiple users can draw on the same canvas simultaneously
- **Multiple Drawing Tools** - Rectangle, Circle, Line, Pencil, and Selection tools
- **Undo/Redo** - Full history management with keyboard shortcuts
- **Room-based System** - Create or join drawing rooms
- **Persistent Storage** - Drawings are saved to PostgreSQL database
- **Responsive Design** - Works on desktop and tablet devices

### 🚀 Advanced Features
- **Async Performance Optimization** - Broadcasts happen instantly (1-5ms), database saves asynchronously
- **WebSocket Real-time** - Low-latency real-time updates
- **JWT Authentication** - Secure user authentication
- **Rate Limiting** - Protection against abuse
- **Comprehensive Logging** - Winston-based structured logging
- **Toast Notifications** - User-friendly feedback for all actions
- **Loading States** - Clear visual feedback during operations
- **Keyboard Shortcuts** - Quick access to all tools

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Sonner** - Toast notifications
- **Axios** - HTTP client
- **Radix UI** - Accessible UI components

### Backend
- **Node.js** - JavaScript runtime
- **WebSocket (ws)** - Real-time bidirectional communication
- **Express** - HTTP server for REST API
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Zod** - Schema validation

### Infrastructure
- **Turborepo** - Monorepo build system
- **pnpm** - Fast, disk-efficient package manager

## 📁 Project Structure

```
excalidraw/
├── apps/
│   ├── excalidraw-frontend/    # Next.js frontend
│   ├── http-backend/           # Express REST API
│   └── ws-backend/             # WebSocket server
├── packages/
│   ├── backend-common/         # Shared backend utilities
│   ├── common/                 # Shared types & validation
│   ├── db/                     # Prisma schema & client
│   ├── ui/                     # Shared UI components
│   └── typescript-config/      # Shared TS configs
└── turbo.json                  # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **pnpm 9.0+**
- **PostgreSQL 15+**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sarthak1940/excalidraw.git
cd excalidraw
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create `.env` files in:
- `apps/http-backend/.env`
- `apps/ws-backend/.env`
- `apps/excalidraw-frontend/.env.local`

**Backend (http-backend & ws-backend):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/drawspace"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5050
WS_PORT=8080
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

**Frontend:**
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:5050"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:8080"
```

4. **Set up the database**
```bash
cd packages/db
pnpm prisma migrate dev
```

5. **Start the development servers**

Open 3 terminal windows:

**Terminal 1 - HTTP Backend:**
```bash
cd apps/http-backend
pnpm dev
```

**Terminal 2 - WebSocket Backend:**
```bash
cd apps/ws-backend
pnpm dev
```

**Terminal 3 - Frontend:**
```bash
cd apps/excalidraw-frontend
pnpm dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `R` | Rectangle tool |
| `C` | Circle tool |
| `L` | Line tool |
| `P` | Pencil tool |
| `V` | Select tool |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Ctrl + Y` | Redo (alternative) |
| `Esc` | Deselect |
| `Cmd/Ctrl + ?` | Show keyboard shortcuts dialog |

**Pro Tip:** Click the keyboard icon in the bottom-right corner to see all shortcuts!

## 📖 API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/v1/user/signup` - Create new account
- `POST /api/v1/user/login` - Sign in

#### Rooms
- `POST /api/v1/user/room` - Create room
- `GET /api/v1/user/get-all-rooms` - Get user's rooms
- `GET /api/v1/user/get-roomId/:slug` - Get room by slug
- `GET /api/v1/user/get-existing-shapes/:roomId` - Get room shapes

### WebSocket Events

#### Client → Server
```javascript
// Join room
{ type: "join_room", payload: { roomId: number } }

// Draw shape
{ type: "shape", payload: { data, type, strokeColor, ... } }

// Undo
{ type: "undo", payload: { roomId, id } }

// Redo
{ type: "redo", payload: { shape, roomId } }
```

#### Server → Client
```javascript
// Shape broadcast
{ type: "shape", payload: { ...shapeData } }

// Shape ID update (after DB save)
{ type: "shape_id_update", payload: { tempId, shapeId, roomId } }

// Shape save failed
{ type: "shape_save_failed", payload: { tempId, roomId, message } }
```

## 🏗️ Architecture Decisions

### Performance Optimization
The app uses an **async broadcast pattern** for optimal performance:

1. **Immediate Broadcast** - Shape is sent to all users instantly (1-5ms)
2. **Async Database Save** - PostgreSQL write happens in background (100-500ms)
3. **ID Update** - Real database ID sent once available

**Result:** 30-100x faster perceived performance!

### Why No Redis?
For a portfolio/learning project with < 1000 concurrent users, PostgreSQL provides sufficient performance. Redis would add complexity without significant benefits at this scale.

### Monorepo Structure
Using Turborepo for:
- Shared packages (types, UI components, utilities)
- Parallel task execution
- Efficient caching
- Clear separation of concerns

## 🛡️ Security Features

- ✅ JWT authentication with HttpOnly cookies
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Message size limits
- ✅ Connection limits

## 🎓 What I Learned

- Real-time WebSocket communication
- Async performance optimization patterns
- Monorepo management with Turborepo
- Database design with Prisma
- JWT authentication & security
- Rate limiting strategies
- Type-safe development with TypeScript
- Canvas API and drawing algorithms

## 🗺️ Roadmap

- [ ] Mobile responsive canvas
- [ ] Export to PNG/SVG
- [ ] User avatars and presence
- [ ] Collaborative cursors
- [ ] Text tool
- [ ] Color picker
- [ ] Layer management
- [ ] Room permissions

## 👤 Author

**Sarthak Godse**
- GitHub: [@Sarthak1940](https://github.com/Sarthak1940)

## 📝 License

This project is licensed under the MIT License.

---

**⭐ If you found this project helpful, please give it a star!**
