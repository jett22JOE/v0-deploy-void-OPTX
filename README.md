# 🦔 JETT Optics - HEDGEHOG Server

**Handshake Encryption Delegated Gesture Envelope Handler Optical Gateway**

Complete eye-tracking authentication platform combining Python FastAPI backend (HEDGEHOG) with Next.js frontend, featuring gaze-based authentication, Model Context Protocol (MCP) integration, and the JOE AI agent powered by Grok.

---

## 🎯 Project Overview

JETT Optics is an advanced gaze-based authentication and interaction platform that leverages eye-tracking technology to enable secure authentication and intuitive eye-typing interfaces. The platform consists of:

- **HEDGEHOG Server**: Python FastAPI backend handling authentication, gaze data, WebSocket chat, and MCP integration
- **Next.js Frontend**: Modern React application with Clerk authentication, Convex realtime database, and theme-aware UI
- **JOE Agent**: AI-powered assistant integrated with Grok 4 for gaze classification and chat interaction
- **MCP Tools**: Model Context Protocol integration for AI-enhanced gaze analysis

---

## 📋 Current Features

### Backend (HEDGEHOG Server)
- ✅ **JWT Authentication** - Secure signup, login, refresh token flow
- ✅ **Gaze Classification** - COG/ENV/EMO tensor classification via MCP
- ✅ **WebSocket Chat** - Real-time messaging with JWT authentication  
- ✅ **MCP Integration** - Grok 4-powered gaze analysis and OTP generation
- ✅ **Tracking Data** - Store and retrieve gaze/optical tracking data
- ✅ **Social/Friends** - Add/remove friends by username
- ✅ **SQLite Database** - User accounts, sessions, and tracking data

### Frontend (Next.js)
- ✅ **Next.js 15** - Modern React framework with App Router
- ✅ **Clerk Authentication** - User management and authentication UI
- ✅ **Convex Database** - Realtime database with TypeScript support
- ✅ **Platform Indicator** - DOJO/MOJO mode toggle with theme switching
- ✅ **Starfield Animation** - Dynamic background with light/dark mode inversion
- ✅ **Floating Dock Navigation** - macOS-style animated navigation (Aceternity UI)
- ✅ **Theme System** - Light/dark mode with persistent localStorage
- ✅ **JOENAVUX** - Custom navigation system for app-wide routing
- ✅ **Shadcn UI** - Tailwind-based component library with orange theme

### AI & MCP
- ✅ **JOE Agent** - Grok 4 integration for gaze classification
- ✅ **MCP Tools** - Three core tools:
  - `joe_classify_gaze` - Classify gaze coordinates into tensors
  - `joe_generate_otp` - Generate OTP from gaze pattern sequence
  - `joe_process_chat_input` - Process real-time gaze for eye-typing

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+** - Core backend language
- **FastAPI** - Modern async web framework
- **SQLModel** - SQLAlchemy + Pydantic for database models
- **JWT** - JSON Web Token authentication (PyJWT)
- **WebSockets** - Real-time bidirectional communication
- **MCP SDK** - Model Context Protocol integration
- **Grok API** - AI-powered gaze analysis (via x.ai)

### Frontend
- **Next.js 15.1.6** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Clerk** - Authentication and user management
- **Convex** - Realtime database with TypeScript support
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Customizable component library
- **Motion (Framer Motion)** - Animation library
- **Lucide React & Tabler Icons** - Icon libraries
- **Aceternity UI** - Premium UI components (TextHoverEffect, FloatingDock)

### Infrastructure
- **PostgreSQL** - Production database (Supabase/Railway)
- **Convex** - Real-time database for frontend
- **Vercel** - Next.js webapp deployment only
- **Conda** - Python environment management (`josh-spatial`)

---

## 🚀 Quick Start

### 🌍 Remote Access (Production)

**jOSH-Spatial is now accessible remotely via Cloudflare Tunnel!**

- **Frontend:** https://app.jettoptics.ai
- **Backend API:** https://api.jettoptics.ai
- **Convex Database:** Cloud-hosted (no VPN needed)

**For Remote Development (Mac/Other Devices):**
```bash
# No installation needed - just access the URLs above!
# Backend API available at https://api.jettoptics.ai
# Perfect for React Native iOS development
```

---

### Prerequisites (For Running Local Server)

#### Windows (Server Host)
- **Python:** 3.10+ (3.11.5 recommended)
- **Conda:** 23.7.4+ with `josh-spatial` environment
- **Node.js:** v18+ (v25.0.0 recommended)
- **Git:** For version control
- **PowerShell:** For running scripts
- **Cloudflared:** For tunnel (optional, already configured)

#### MacOS (Remote Development)
- **No server setup needed!** Access via https://app.jettoptics.ai
- **For React Native:** Xcode 15+, CocoaPods
- **Optional:** Node.js v18+ for local frontend testing

#### All Platforms
- **XAI API Key:** For Grok 4.1 integration
- **Clerk Account:** For authentication (optional for testing)
- **Convex Account:** For realtime database (optional for testing)

---

### Windows Installation & Startup

#### One-Time Setup

1. **Clone the repository:**
   ```powershell
   git clone <repository-url>
   cd jett-optical-auth
   ```

2. **Activate conda environment:**
   ```powershell
   conda activate josh-spatial
   ```

3. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Create environment file:**
   ```powershell
   cp .env.example .env
   ```

5. **Generate secure SECRET_KEY:**
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Copy the output and update `SECRET_KEY` in `.env`

6. **Configure environment variables:**
   Add to `.env`:
   ```
   XAI_API_KEY=your_xai_api_key
   GROK_API_KEY=your_grok_api_key
   DATABASE_URL=sqlite:///./jett_optical.db
   ```

#### Start All Services (3 Terminals)

**Terminal 1: Python Backend (HEDGEHOG)**
```powershell
conda activate josh-spatial
cd C:\Users\joshu\jett-optical-auth
python hedgehog_server.py
```
Server starts on **http://localhost:8000**
Check: http://localhost:8000/docs

**Terminal 2: Convex Real-time Database**
```powershell
cd C:\Users\joshu\jett-optical-auth\frontend
npx convex dev
```

**Terminal 3: Next.js Frontend**
```powershell
cd C:\Users\joshu\jett-optical-auth\frontend
npm run dev
```
Frontend starts on **http://localhost:3000**

#### Windows Auto-Boot Configuration

The system includes automatic boot configuration for Windows:

**Boot Script Location:**
- `C:\Users\joshu\jett-optical-auth\josh_spatial_boot.bat`
- Copied to: `C:\Users\joshu\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`

**What Happens on Boot:**
1. Windows loads and executes startup script
2. Environment variables are set automatically:
   - `XAI_API_KEY` - Grok 4 API access
   - `GROK_API_KEY` - Alternative Grok API key
   - `DATABASE_URL` - SQLite database path
3. jOSH-spatial initialization runs:
   - Checks MCP configuration
   - Verifies agent definitions
   - Validates database connection
   - Confirms Python packages
   - Tests HEDGEHOG MCP server
4. Boot window displays status for 10 seconds
5. Window closes automatically

**After Reboot:**
Launch Claude Code and verify HEDGEHOG MCP connection:
```bash
claude mcp list
# Should show: ✓ hedgehog-mcp: Connected
```

---

### MacOS Installation & Startup

#### One-Time Setup

1. **Clone the repository:**
   ```bash
   cd ~
   git clone <repository-url>
   cd jett-optical-auth
   ```

2. **Create and activate conda environment:**
   ```bash
   conda create -n jOSH-spatial python=3.11
   conda activate jOSH-spatial
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install numpy scipy opencv-python
   ```

4. **Setup activation script:**
   ```bash
   chmod +x setup-env.sh
   ./setup-env.sh
   ```

5. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Update with your API keys and configuration.

#### Quick Activation (Every New Terminal)

```bash
source activate-josh
```

This single command:
- Activates the conda environment
- Shows HEDGEHOG status
- Loads all development commands
- Sets up pretty terminal prompt

#### Available Commands After Activation

**Grok Queries:**
```bash
grok "your question"              # Query with full project context
grok-quick "your question"        # Quick query (no context)
grok-search "search query"        # Web search with Grok
grok-cto "strategic query"        # CTO-level analysis (saves report)
```

**Development Shortcuts:**
```bash
josh-status    # Check HEDGEHOG status
josh-logs      # View MCP logs
josh-db        # Access database
dojo           # Start frontend dev server
convex         # Start Convex
joe            # Start Python backend
```

**Git Shortcuts:**
```bash
gst            # git status
glog           # git log --oneline --graph
```

#### Start All Services (MacOS)

Use the automated startup script:
```bash
chmod +x macos-services-startup.sh
./macos-services-startup.sh
```

Or manually:
```bash
# Terminal 1: Python Backend
conda activate jOSH-spatial
python hedgehog_server.py

# Terminal 2: Convex
cd frontend && npx convex dev

# Terminal 3: Next.js
cd frontend && npm run dev
```

Check service status:
```bash
./check-services-status.sh
```

---

## 📚 API Documentation

Once the server is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🔐 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login with username/password | No |
| POST | `/auth/refresh` | Get new access token | No (refresh token) |
| POST | `/auth/logout` | Revoke all user sessions | Yes |
| GET | `/auth/me` | Get current user info | Yes |

### Chat (`/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| WS | `/chat?token=JWT` | WebSocket real-time chat | Yes (JWT in query) |
| GET | `/chat` | Get chat service info | No |

### Social (`/social`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/social/add-friend` | Add friend by username | Yes |
| DELETE | `/social/remove-friend` | Remove friend | Yes |
| GET | `/social/friends` | Get friends list | Yes |

### Account (`/account`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/account/update` | Update email/username | Yes |
| GET | `/account/view` | View account details | Yes |

### MCP - Model Context Protocol (`/mcp`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/mcp` | Send message to AI | Yes |
| GET | `/mcp` | Get MCP service info | No |

### Tracking Data (`/tracking-data`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/tracking-data` | Store gaze/optical tracking data | Yes |
| GET | `/tracking-data?limit=50` | Get tracking history | Yes |

### Static Content

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pricing` | Get pricing tiers | No |
| GET | `/features` | Get platform features | No |

---

## 🌐 Cloudflare Tunnel Setup (Remote Access)

### Overview
jOSH-Spatial uses Cloudflare Tunnel to provide secure remote access to your Windows PC server from anywhere in the world.

### Production URLs
- **Frontend:** https://app.jettoptics.ai
- **Backend API:** https://api.jettoptics.ai
- **Tunnel Name:** josh-spatial
- **Tunnel ID:** 544e44cf-b610-47bd-8014-c52e203a1de8

### Quick Start Tunnel

**On Windows PC (Server Host):**
```powershell
# Start all services
cd scripts/cloudflare
.\start-all-servers.ps1      # Starts FastAPI, Convex, Next.js

# Start Cloudflare Tunnel
.\start-cloudflare-tunnel.ps1  # Exposes services via HTTPS
```

**On Mac/Remote Device:**
```bash
# Access the services (no setup needed!)
open https://app.jettoptics.ai
curl https://api.jettoptics.ai/health
```

### Configuration Files
- **Tunnel Config:** `C:\Users\joshu\.cloudflared\config.yml`
- **Credentials:** `C:\Users\joshu\.cloudflared\544e44cf-b610-47bd-8014-c52e203a1de8.json`
- **Setup Guide:** `scripts/cloudflare/CLOUDFLARE_TUNNEL_SETUP.md`

### DNS Records (Cloudflare Dashboard)
```
Type: CNAME  |  Name: app  |  Target: 544e44cf-b610-47bd-8014-c52e203a1de8.cfargotunnel.com
Type: CNAME  |  Name: api  |  Target: 544e44cf-b610-47bd-8014-c52e203a1de8.cfargotunnel.com
```

### Benefits
- ✅ **Secure HTTPS** - Automatic SSL certificates
- ✅ **No Port Forwarding** - Works behind NAT/firewall
- ✅ **Zero Trust** - No public IP exposure
- ✅ **Global Access** - Accessible from anywhere
- ✅ **Custom Domain** - Professional jettoptics.ai URLs

---

## 🔑 Authentication Flow

### 1. Signup
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "josh", "email": "josh@example.com", "password": "securepass123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=josh&password=securepass123"
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### 3. Use Access Token
```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token (when access token expires)
```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

---

## 💬 WebSocket Chat Example

### Connect to WebSocket (requires JWT):
```javascript
// Node.js/Browser
const token = "YOUR_ACCESS_TOKEN";
const ws = new WebSocket(`ws://localhost:8000/chat?token=${token}`);

ws.onopen = () => {
  console.log("Connected to HEDGEHOG chat");
  ws.send(JSON.stringify({ type: "message", content: "Hello!" }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};
```

---

## 📊 Tracking Data Example

### Post Gaze Tracking Data:
```bash
curl -X POST http://localhost:8000/tracking-data \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cog_value": 0.85,
    "env_value": 0.62,
    "emo_value": 0.73,
    "gaze_x": 0.45,
    "gaze_y": 0.32,
    "event_type": "gaze_update",
    "confidence": 0.91
  }'
```

### Get Tracking History:
```bash
curl http://localhost:8000/tracking-data?limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🗂️ Project Structure

```
jett-optical-auth/
├── README.md                          # This file - Complete project documentation
├── hedgehog_server.py                 # Main FastAPI backend server
├── mcp_server.py                      # Model Context Protocol server (JOE Agent)
├── requirements.txt                   # Python backend dependencies
├── .env                               # Environment variables (SECRET_KEY, etc.)
├── jett_optical.db                    # SQLite database (auto-created)
│
├── app/                               # Backend application code
│   ├── core/
│   │   ├── config.py                  # Configuration & settings
│   │   └── security.py                # JWT & password utilities
│   ├── models/
│   │   └── database.py                # SQLModel database models (User, Session, etc.)
│   └── routes/
│       ├── auth.py                    # Authentication routes
│       ├── chat.py                    # WebSocket chat routes
│       ├── social.py                  # Friend management
│       ├── account.py                 # Account management
│       ├── mcp.py                     # MCP integration routes
│       └── tracking_data.py           # Gaze tracking data storage
│
├── frontend/                          # Next.js frontend application
│   ├── package.json                   # Node.js dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── next.config.ts                 # Next.js configuration
│   │
│   ├── app/                           # Next.js App Router pages
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Landing page (starfield + logo)
│   │   ├── globals.css                # Global styles & shadcn theme
│   │   ├── hub/                       # JOE Hub (JOENAVUX navigation)
│   │   ├── dojo/                      # DOJO interface pages
│   │   ├── sign-in/                   # Clerk sign-in page
│   │   └── sign-up/                   # Clerk sign-up page
│   │
│   ├── components/                    # React components
│   │   ├── PlatformIndicator.tsx      # DOJO/MOJO toggle with theme
│   │   ├── StarfieldHERO.tsx          # Animated starfield background
│   │   ├── ConvexClientProvider.tsx   # Convex database provider
│   │   └── ui/                        # Shadcn & Aceternity UI components
│   │       ├── floating-dock.tsx      # macOS-style navigation dock
│   │       ├── text-hover-effect.tsx  # Animated title text
│   │       └── button.tsx             # Shadcn button component
│   │
│   ├── convex/                        # Convex backend functions
│   │   ├── users.ts                   # User management functions
│   │   └── schema.ts                  # Database schema
│   │
│   ├── public/                        # Static assets
│   │   ├── JOE_darkmode.png           # Logo for dark mode
│   │   ├── JOE_lightmode.png          # Logo for light mode
│   │   ├── JOE_founder_icon.png       # Founder icon for navigation
│   │   └── favicon files              # App icons
│   │
│   └── lib/                           # Utility functions
│       └── utils.ts                   # Helper utilities
│
├── GROK_NOTES.md                      # 📋 SINGLE SOURCE OF TRUTH
│                                      #    - Agentic context & current work
│                                      #    - Grok 4.1 validated architecture
│                                      #    - DePIN implementation plan
│                                      #    - Security analysis & roadmap
│
├── archive/                           # Historical documentation (58 files)
│   ├── docs/                          # Archived setup guides, specs
│   └── *.md                           # Completed features & old plans
│
└── tests/                             # Test files
    ├── test_joe_automated.py          # Automated JOE agent tests
    ├── test_mcp_server.py             # MCP server tests
    ├── test_otp_flow.py               # OTP generation tests
    └── test_grok_integration.py       # Grok API integration tests
```

---

## 🛠️ Development

### Run in Debug Mode:
Set `DEBUG=True` in `.env`, then:
```powershell
python hedgehog_server.py
```
Server will auto-reload on file changes.

### View Database:
```powershell
sqlite3 jett_optical.db
.tables
SELECT * FROM users;
```

### Generate New Secret Key:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains secrets
2. **Change SECRET_KEY in production** - Use a cryptographically secure random key
3. **Use HTTPS in production** - Never send JWT tokens over HTTP
4. **Rotate tokens regularly** - Implement token refresh flow
5. **Hash passwords** - Already handled by bcrypt in the code
6. **JWT tokens** - HS256 algorithm with 15min access, 7day refresh
7. **Email OTP verification** - Required for new accounts
8. **SHA-256 gaze pattern hashing** - For secure pattern storage
9. **Quantum-resistant encryption** - Ready for implementation
10. **CORS configured** - localhost:3000 and localhost:3001 allowed

---

## 🔧 Important Configuration Notes

### Environment Variables

**Required for Backend:**
```env
SECRET_KEY=<your-secret-key>
XAI_API_KEY=<your-xai-api-key>
GROK_API_KEY=<your-grok-api-key>
DATABASE_URL=postgresql://user:pass@host:5432/jett_optical
DEBUG=False
```

**Required for Frontend:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

### Database Configuration

**PostgreSQL (Production - Backend):**
- Managed via SQLModel/SQLAlchemy
- User accounts, sessions, gaze events, XAI API tracking
- Migrate from SQLite: `scripts/migrate_sqlite_to_postgres.py`

**Convex (Production - Frontend Realtime):**
- Schema defined in `frontend/convex/schema.ts`
- Tables: users, gazeEvents, chatMessages, dojoSessions, gazeSessions, mojoGazeSessions
- **NEW DePIN Tables:** depinBindings, pinAttempts, depinSessions, tensorSnapshots
- TypeScript support built-in
- Real-time sync with Clerk authentication

**Schema Includes:**
- User accounts with Clerk integration
- Gaze events with COG/ENV/EMO tensors
- DePIN wallet bindings with Argon2id PIN hashing
- Session management with rate limiting
- Tensor snapshots for biometric drift detection

### Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| HEDGEHOG Backend | 8000 | FastAPI server, API endpoints |
| Next.js Frontend | 3000 | React application |
| Hedgehog MCP | 3000 | MCP server (if running) |
| Joe Gaze Classifier | 5001 | Gaze tensor classification |
| Joe OTP Generator | 5002 | OTP from gaze patterns |
| Joe Chat Processor | 5003 | Eye-typing processing |
| Optical Auth | 5100 | Encryption services |
| jOSH Spatial | 5200 | Spatial computing |

### MCP Tools Available

**HEDGEHOG MCP Tools (via Claude Code):**
1. `hedgehog_grok_query` - Query Grok 4.1 with project context
2. `hedgehog_get_context` - Retrieve project security state
3. `hedgehog_store_gaze_data` - Store COG/ENV/EMO tensors
4. `hedgehog_retrieve_gaze_data` - Get gaze history
5. `hedgehog_analyze_gaze_pattern` - AI-powered gaze analysis
6. `hedgehog_chat_completion` - Multi-model AI chat
7. `hedgehog_xai_api_history` - API call audit trail
8. `hedgehog_xai_api_stats` - Usage statistics

**Joe Agent MCP Tools (via Warp Terminal - MacOS):**
1. `joe_classify_gaze` - Classify gaze into COG/ENV/EMO
2. `joe_generate_otp` - Generate OTP from gaze patterns
3. `joe_process_chat_input` - Real-time eye-typing with AGT
4. `test_hedgehog_apis` - Test Grok, Perplexity, Claude, Together AI

### Agent Definitions

**jOSH-cto System (4 Specialized Agents):**
1. **jOSH-cto** (Purple) - Supreme orchestrator, strategic decisions
2. **joe-webapp** (Blue) - Frontend: Next.js, React, JOENAVUX
3. **joe-native** (Green) - Apple: Swift, ARKit, TrueDepth
4. **joe-spatial** (Cyan) - Security: Cryptography, encryption, quantum-resistant

### DePIN Architecture (Active Development - Grok 4.1 Validated)

**Two-Factor Authentication System:**
1. **4-digit PIN** (offchain) - **Argon2id** hashed (Grok-recommended upgrade from SHA-256)
2. **Wallet Signature** (onchain) - SIWE (Sign-In With Ethereum) + AARON protocol audit trail
3. **AGT Tensor Binding** - Biometric gaze signature (COG/ENV/EMO) hashed with FuzzyVault

**Security Model (Post-Grok Review):**
- **PIN Hashing:** Argon2id(PIN, salt=clerkId, time=3, mem=64MiB)
- **Rate Limiting:** Exponential backoff (2^N minutes) + CAPTCHA
- **Session Tokens:** JWT with JWE encryption (Kyber-512 ready)
- **Liveness Detection:** pSNN gaze challenges via knot polynomials

**Blockchain Components:**
- **$OPTX Token**: Solana SPL token
  - Mint Address: `FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H`
- **AARON Protocol**: Asynchronous Audit RAG Optical Node (Solana)
- **Web3 Domain**: astro.knots TLD (Polygon registry)
- **DApp Hosting**: poof.new deployment

**📋 See [GROK_NOTES.md](GROK_NOTES.md) for complete DePIN specification and Grok 4.1 security analysis.**

### Deployment Notes

**Frontend (Next.js):**
- Deploy to Vercel (webapp only)
- Automatic builds from Git push
- Environment variables via Vercel dashboard
- Edge functions for API routes

**Backend (Python/HEDGEHOG):**
- Deploy to Railway, Render, or custom VPS
- PostgreSQL recommended for production (SQLite for dev)
- Redis for session management
- WebSocket support required

**NOT Deployed to Vercel:**
- Python backend (use Railway/Render)
- MCP servers (local development only)
- Database services

### Testing & Verification

**Health Checks:**
```bash
# Backend health
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs

# Frontend
open http://localhost:3000
```

**Test Gaze Classification:**
```bash
curl -X POST http://localhost:8000/tracking-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cog_value": 0.85, "env_value": 0.62, "emo_value": 0.73, "gaze_x": 0.45, "gaze_y": 0.32}'
```

**Performance Metrics:**
- Database operations: < 50ms
- API response time: < 100ms average
- Grok 4.1 queries: ~2s response
- JWT auth: 15min access, 7day refresh tokens

---

## 🎯 Project Scope & Current State

### ✅ Completed Components

**Backend (HEDGEHOG Server)**
- Complete FastAPI server with JWT authentication
- WebSocket chat infrastructure
- MCP server integration with Grok 4
- Gaze classification and OTP generation
- SQLite database with user management
- Friend/social system foundation

**Frontend (Next.js)**
- Landing page with animated starfield and logo switching
- Platform indicator (DOJO/MOJO) with theme toggle
- Floating dock navigation with hover effects
- Clerk authentication integration
- Convex realtime database setup
- Shadcn UI with orange theme customization
- Light/dark mode with localStorage persistence

**AI & Automation**
- JOE Agent with three core MCP tools
- Grok 4 API integration for gaze analysis
- Automated testing infrastructure
- Training session support

### 🔧 In Development

**Gaze Authentication UI**
- [ ] GazeOTPCapture component for pattern capture
- [ ] Gaze-based login page
- [ ] Gaze-based signup page
- [ ] Protected route middleware
- [ ] Visual feedback for gaze classification

**Eye-Typing Interface**
- [ ] Real-time gaze input processing
- [ ] Symbol grid with AGT weight visualization
- [ ] Character selection via dwell time
- [ ] Word prediction integration

**Enhanced Chat**
- [ ] WebSocket chat with gaze input mode
- [ ] Message persistence to database
- [ ] Typing indicators
- [ ] Read receipts

---

## 🚀 Future Integration Plans

### Phase 1: Core Gaze Authentication (Q1 2025)
**Priority: HIGH**

- **Gaze OTP UI Components**
  - Complete GazeOTPCapture React component
  - Integrate with Clerk authentication flow
  - Add visual feedback for COG/ENV/EMO classification
  - Implement retry logic for failed authentications

- **DOJO Interface Enhancement**
  - Eye tracking calibration wizard
  - Real-time gaze position visualization
  - Pattern recording and playback
  - OTP verification UI

- **Security Hardening**
  - Rate limiting on authentication endpoints
  - Brute force protection for OTP attempts
  - Session management improvements
  - HTTPS enforcement

### Phase 2: Eye-Typing & Chat (Q2 2025)
**Priority: HIGH**

- **Eye-Typing System**
  - Symbol grid interface (9-zone layout)
  - Real-time gaze tracking with AGT weights
  - Dwell-time based selection
  - Word prediction engine
  - Auto-correction for common patterns

- **Enhanced Chat Features**
  - Gaze-driven message composition
  - Voice-to-text fallback
  - Emoji selection via gaze
  - Group chat support
  - File sharing

- **JOE Widget Integration**
  - Floating assistant for gaze prompts
  - Context-aware suggestions
  - Quick actions via gaze gestures

### Phase 3: Social & Collaboration (Q3 2025)
**Priority: MEDIUM**

- **Friend System**
  - Friend requests and acceptance
  - Online/offline status
  - Friend profiles with gaze history
  - Privacy controls

- **Multiplayer Features**
  - Shared gaze sessions
  - Collaborative eye-typing
  - Gaze-based games
  - Competition leaderboards

- **User Profiles**
  - Profile pictures and avatars
  - Gaze pattern statistics
  - Achievement system
  - Customizable themes

### Phase 4: Mobile & Accessibility (Q4 2025)
**Priority: MEDIUM**

- **MOJO (Mobile) Platform**
  - React Native mobile app
  - Mobile camera-based eye tracking
  - Touch + gaze hybrid interaction
  - Offline mode support

- **Accessibility Features**
  - Screen reader integration
  - High contrast mode
  - Adjustable gaze sensitivity
  - Voice command fallbacks

- **Hardware Integration**
  - Tobii eye tracker support
  - Webcam-based tracking improvements
  - VR headset integration
  - Specialized accessibility devices

### Phase 5: Web3 & Advanced Features (2026+)
**Priority: LOW**

- **Blockchain Integration**
  - Gaze-based wallet authentication
  - NFT minting via gaze patterns
  - Decentralized identity (DID)
  - Smart contract interaction

- **AI Enhancements**
  - Personalized gaze models per user
  - Emotion detection via gaze patterns
  - Intent prediction
  - Adaptive UI based on gaze behavior

- **Analytics & Insights**
  - Gaze heatmaps
  - Usage pattern analysis
  - Performance metrics dashboard
  - Research data export

### Infrastructure Roadmap

**Immediate (2025 Q1)**
- [ ] Deploy to Vercel (Next.js webapp only)
- [ ] Deploy HEDGEHOG to Railway/Render
- [ ] Set up CI/CD pipelines
- [ ] PostgreSQL migration
- [ ] Redis for session management

**Short-term (2025 Q2-Q3)**
- [ ] CDN for static assets
- [ ] Database backups and replication
- [ ] Monitoring and alerting (Sentry, DataDog)
- [ ] Load balancing
- [ ] Docker containerization

**Long-term (2025 Q4+)**
- [ ] Kubernetes orchestration
- [ ] Multi-region deployment
- [ ] Edge computing for low-latency gaze processing
- [ ] Compliance certifications (HIPAA, GDPR)

---

## 📊 Development Priorities

### Current Sprint Focus
1. **Complete Gaze OTP UI** - Finish GazeOTPCapture component
2. **Integrate with Clerk** - Connect gaze auth to Clerk workflows
3. **DOJO Testing Interface** - Enhance eye tracking test page
4. **Documentation** - Update all technical docs

### Next Sprint
1. **Eye-Typing Foundation** - Build symbol grid component
2. **Real-time Gaze Processing** - Optimize AGT weight calculation
3. **Chat Integration** - Connect WebSocket to gaze input
4. **Performance Optimization** - Reduce latency in gaze classification

### Backlog
- Mobile app prototyping
- Advanced AI model training
- Web3 wallet integration research
- Accessibility audit and improvements

---

## 📝 License

MIT License - JETT Optical Encryption

---

## 🙋 Support & Contact

For questions, issues, or collaboration:
- **GitHub**: [@jettoptics](https://github.com/jettoptics)
- **Email**: support@jettoptics.ai
- **Documentation**: See [DOCS_INDEX.md](DOCS_INDEX.md) for complete documentation
- **Issues**: [GitHub Issues](https://github.com/jettoptics/jett-optical-auth/issues)

### Getting Help
- **Agentic Context & Current Work**: See [GROK_NOTES.md](GROK_NOTES.md) - Single source of truth
- **Architecture Decisions**: See [GROK_NOTES.md](GROK_NOTES.md) - Includes Grok 4.1 validated plans
- **Archived Documentation**: See [archive/](archive/) - Historical docs and completed features

---

## 🎉 Acknowledgments

- **Clerk** - Authentication infrastructure
- **Convex** - Realtime database platform
- **Aceternity UI** - Premium UI components
- **Shadcn/ui** - Component library foundation
- **x.ai** - Grok 4 AI integration
- **Anthropic** - Claude AI & MCP standard

---

**Built with ❤️ by the JETT Optics Team**
**Last Updated**: December 2025
**Version**: 1.0.0-beta

---

## 📋 Documentation Structure

| File | Purpose |
|------|---------|
| **[GROK_NOTES.md](GROK_NOTES.md)** | Single source of truth - Agentic context, current work, Grok 4.1 analyses |
| **README.md** | Project overview, setup guides, API reference |
| **[archive/](archive/)** | Historical documentation (58 archived files) |

**All updates and new work tracked in GROK_NOTES.md**
