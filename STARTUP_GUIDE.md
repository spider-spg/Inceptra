# 🚀 Incentra Local Development Guide

## Quick Start (Both Servers)

### Method 1: Single Command Start
```bash
# Navigate to your project folder
cd "c:\Users\lohar\Downloads\Incentra\Incentra"

# Run the startup script
.\start-incentra.bat
```

### Method 2: Manual Start (Recommended for Development)

#### Step 1: Start Backend Server
```bash
# Open PowerShell/CMD and navigate to backend folder
cd "c:\Users\lohar\Downloads\Incentra\Incentra\backend"

# Start the FastAPI server
python main.py
```
✅ Backend will be running at: **http://localhost:8000**

#### Step 2: Start Frontend Server (New Terminal)
```bash
# Open a NEW PowerShell/CMD window
cd "c:\Users\lohar\Downloads\Incentra\Incentra"

# Start the Next.js server
.\start-frontend-fixed.bat
```
✅ Frontend will be running at: **http://localhost:3000**

---

## 🛑 How to Stop the Servers

### Stop Backend:
- In the backend terminal window: Press `Ctrl + C`
- Or close the terminal window

### Stop Frontend:
- In the frontend terminal window: Press `Ctrl + C`
- Or close the terminal window

---

## 🔄 How to Restart the Servers

### If Servers are Running:
1. **Stop both servers** (Ctrl + C in each terminal)
2. **Wait 2-3 seconds**
3. **Restart using the steps above**

### If Servers Stopped Unexpectedly:
1. **Check if ports are free:**
   ```bash
   netstat -an | findstr :8000    # Check backend port
   netstat -an | findstr :3000    # Check frontend port
   ```

2. **If ports are still occupied, kill the processes:**
   ```bash
   # Kill processes on port 8000 (backend)
   netstat -ano | findstr :8000
   taskkill /F /PID [PID_NUMBER]
   
   # Kill processes on port 3000 (frontend)
   netstat -ano | findstr :3000
   taskkill /F /PID [PID_NUMBER]
   ```

3. **Restart normally**

---

## 🔧 Troubleshooting

### Backend Won't Start:
- ✅ Check if `northern-window-vision.json` exists in backend folder
- ✅ Verify Python dependencies: `pip install -r requirements.txt`
- ✅ Check if port 8000 is available

### Frontend Won't Start:
- ✅ Check if Node.js is installed: `node --version`
- ✅ Install dependencies: `npm install --legacy-peer-deps`
- ✅ Check if port 3000 is available
- ✅ Use the fixed batch file: `.\start-frontend-fixed.bat`

### Connection Refused Error:
- ✅ Make sure both servers are running
- ✅ Wait 10-15 seconds after starting for full initialization
- ✅ Check firewall/antivirus isn't blocking ports 3000 and 8000

---

## 📋 Development Workflow

### Daily Startup:
1. Open 2 terminal windows
2. Terminal 1: `cd backend && python main.py`
3. Terminal 2: `cd .. && .\start-frontend-fixed.bat`
4. Open browser: `http://localhost:3000`

### Testing Changes:
- **Backend changes**: Automatically reloads (FastAPI reload=True)
- **Frontend changes**: Automatically reloads (Next.js hot reload)
- **No restart needed for code changes!**

### Clean Restart:
```bash
# Stop all servers (Ctrl + C)
# Wait 5 seconds
# Restart both servers
```

---

## 🎯 Quick Commands Reference

```bash
# Navigate to project
cd "c:\Users\lohar\Downloads\Incentra\Incentra"

# Start backend (Terminal 1)
cd backend && python main.py

# Start frontend (Terminal 2 - from project root)
.\start-frontend-fixed.bat

# Check if servers are running
curl http://localhost:8000/health     # Backend health check
curl http://localhost:3000            # Frontend check

# View logs
# Backend logs appear in Terminal 1
# Frontend logs appear in Terminal 2
```

---

## 🌐 Access Points

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## ⚡ Pro Tips

1. **Keep terminals open** - Don't close them while developing
2. **Use Ctrl+C to stop** - Never force-close terminals
3. **Wait for "Ready"** - Frontend shows "✓ Ready in X.Xs" when fully loaded
4. **Check logs** - Error messages appear in the terminal windows
5. **Bookmark URLs** - Save http://localhost:3000 for quick access