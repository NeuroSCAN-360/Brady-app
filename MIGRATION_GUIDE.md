# Backend Migration to Next.js API Routes - Complete Guide

## ✅ What Was Done

The standalone backend (`backend/server.js`) has been migrated into Next.js API routes for a unified deployment.

### Files Created

1. **API Routes** (Next.js 14 App Router)
   - `/app/api/device/csv/route.ts` - Fetch CSV from FSR device
   - `/app/api/device/stream/route.ts` - Camera stream proxy
   - `/app/api/session/stop/route.ts` - Stop streaming session
   - `/app/api/session/start/route.ts` - Start streaming session
   - `/app/api/analyze/csv/route.ts` - CSV analysis endpoint

2. **WebSocket Manager**
   - `/lib/websocket-manager.ts` - Manages FSR device WebSocket connection

3. **Custom Server**
   - `/server.js` - Custom Next.js server with WebSocket support

### Files Updated

1. **package.json**
   - Updated scripts to use custom server
   - Added dependencies: `ws`, `csv-parse`, `pdfkit`, `qrcode`
   - Added dev dependencies for TypeScript types

2. **Frontend Files**
   - `/app/session/page.tsx` - Updated to use `/api/*` routes
   - `/app/analyze/page.tsx` - Updated to use `/api/analyze/csv`
   - `/app/page.tsx` - Updated status display

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install the new dependencies:
- `ws` - WebSocket library
- `csv-parse` - CSV parsing
- `pdfkit` - PDF generation
- `qrcode` - QR code generation

### Step 2: Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The app will run on **http://localhost:3000** with:
- ✅ Frontend UI
- ✅ API routes
- ✅ WebSocket server at `ws://localhost:3000/api/ws`

### Step 3: Delete Old Backend (Optional)

Once you verify everything works, you can delete:
```bash
rm -rf backend/
```

## 📋 Architecture Changes

### Before (Separate Backend)
```
┌─────────────────┐         ┌─────────────────┐
│  Frontend       │         │  Backend        │
│  Port: 3000     │ ◄─────► │  Port: 5000     │
│  Next.js        │  CORS   │  Express.js     │
└─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  FSR Device     │
                            │  192.168.0.51   │
                            └─────────────────┘
```

### After (Integrated)
```
┌───────────────────────────────────────┐
│  Next.js App (Port: 3000)             │
│  ┌─────────────┐  ┌─────────────┐     │
│  │  Frontend   │  │  API Routes │     │
│  │  /app/*     │  │  /api/*     │     │
│  └─────────────┘  └─────────────┘     │
│         │                │            │
│         └────────────────┘            │
│                │                      │
│         WebSocket Server              │
└────────────────┼───────────────────-──┘
                 │
                 ▼
        ┌─────────────────┐
        │  FSR Device     │
        │  192.168.0.51   │
        └─────────────────┘
```

## 🔧 API Endpoints

All endpoints are now relative paths (no CORS issues):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/device/csv` | GET | Fetch CSV from FSR device |
| `/api/device/stream` | GET | Camera stream proxy |
| `/api/session/stop` | POST | Stop data streaming |
| `/api/session/start` | POST | Resume data streaming |
| `/api/analyze/csv` | POST | Analyze uploaded CSV |
| `/api/ws` | WebSocket | Real-time FSR data |

## 🌐 Deployment

### Vercel Deployment

**Note:** Vercel has limitations with WebSockets. For full functionality:

1. **Option A: Deploy without WebSocket (CSV only)**
   - Comment out WebSocket code in `server.js`
   - Use only CSV fetch functionality
   - Deploy normally to Vercel

2. **Option B: Use Vercel + External WebSocket Server**
   - Deploy frontend to Vercel
   - Deploy WebSocket server separately (Railway, Render, etc.)
   - Update `BACKEND_WS` to point to external server

3. **Option C: Deploy to VPS/Cloud (Recommended)**
   - Deploy entire app to DigitalOcean, AWS EC2, or similar
   - Full WebSocket support
   - Single server deployment

### Environment Variables

Create `.env.local`:
```env
# FSR Device IP (optional, defaults in code)
FSR_DEVICE_IP=192.168.0.51
FSR_DEVICE_WS_PORT=82
FSR_DEVICE_STREAM_PORT=81
```

## ✅ Testing Checklist

- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Start a session - WebSocket should connect
- [ ] Tap FSR sensor - data should appear on chart
- [ ] Click "Fetch CSV from Device" - should download CSV
- [ ] Click "Stop Session" - streaming should stop
- [ ] Check browser console for errors

## 🐛 Troubleshooting

### TypeScript Errors
The lint errors about missing modules will resolve after running `npm install`.

### WebSocket Not Connecting
1. Check FSR device is reachable at `192.168.0.51:82`
2. Check browser console for WebSocket errors
3. Verify custom server is running (not `next dev`)

### Camera Stream Not Showing
1. Verify device camera is at `192.168.0.51:81/stream`
2. Check API route `/api/device/stream` is accessible
3. Check browser network tab for errors

## 📦 What to Keep vs Delete

### Keep
- ✅ All `/app/*` files
- ✅ All `/lib/*` files
- ✅ All `/components/*` files
- ✅ `server.js` (new custom server)
- ✅ `package.json` (updated)

### Can Delete
- ❌ `/backend/` folder (entire directory)
- ❌ `/backend/server.js` (old backend)
- ❌ `/backend/package.json` (old backend deps)
- ❌ `/backend/node_modules/` (old backend modules)

## 🎉 Benefits

1. **No CORS Issues** - Same origin for frontend and backend
2. **Single Deployment** - One codebase, one server
3. **Easier Development** - One `npm run dev` command
4. **Better Performance** - No extra network hop
5. **Simpler Maintenance** - One package.json, one repo
6. **Vercel Ready** - Can deploy to Vercel (with limitations on WebSocket)

## 📝 Next Steps

1. Test all functionality
2. Delete old `/backend` folder
3. Update documentation
4. Deploy to production
5. Celebrate! 🎉
