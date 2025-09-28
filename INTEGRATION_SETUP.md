# Incentra Backend-Frontend Integration Setup Guide

## Complete Setup - Step by Step

### Prerequisites
1. **Python 3.8+** ✅ (Already installed)
2. **Node.js 18+** ❌ (Needs to be installed)
3. **Git** (Optional, for version control)

### Step 1: Install Node.js and npm
1. Download Node.js from https://nodejs.org/ (LTS version)
2. Install Node.js (this will also install npm)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Backend Setup (Python FastAPI)

#### 2.1 Navigate to Backend Directory
```bash
cd "c:\Users\lohar\Downloads\Incentra\Incentra\backend"
```

#### 2.2 Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 2.3 Verify Google Cloud Credentials
- Ensure `northern-window-vision.json` is in the backend directory
- The file should contain valid Google Cloud Vision API credentials

#### 2.4 Start Backend Server
```bash
python main.py
```
✅ **Backend should now be running on http://localhost:8000**

### Step 3: Frontend Setup (Next.js)

#### 3.1 Navigate to Frontend Directory
```bash
cd "c:\Users\lohar\Downloads\Incentra\Incentra"
```

#### 3.2 Install Node.js Dependencies
```bash
npm install
```

#### 3.3 Start Frontend Development Server
```bash
npm run dev
```
✅ **Frontend should now be running on http://localhost:3000**

### Step 4: Test the Integration

#### 4.1 Open the Application
1. Open your web browser
2. Go to http://localhost:3000
3. Navigate to Login → Select "Entrepreneur"
4. Go to the entrepreneur dashboard

#### 4.2 Test PDF Upload Flow
1. Go to "Submit Idea" tab
2. Click "Choose File" under "Upload Notes"
3. Select a PDF business plan from the `pdf/` folder
4. Click "Submit Idea for Analysis"
5. Wait for AI analysis (may take 30-60 seconds)
6. Check "Business Canvas" and "AI Feedback" tabs for results

### Step 5: Troubleshooting

#### Backend Issues
- **Port 8000 in use**: Change port in `main.py` line `uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)`
- **Google Vision API errors**: Verify credentials file and API quota
- **Gemini API errors**: Check API key in `main.py`

#### Frontend Issues
- **Port 3000 in use**: Next.js will auto-increment to 3001
- **CORS errors**: Ensure backend CORS allows `http://localhost:3000`
- **API connection errors**: Verify backend is running on http://localhost:8000

#### Integration Issues
- **"Backend error" messages**: Check if backend server is running
- **No analysis results**: Check browser developer console for API errors
- **Slow analysis**: PDF processing with Vision API takes time

### API Endpoints

#### Backend API Documentation
- **Base URL**: http://localhost:8000
- **Health Check**: `GET /health`
- **PDF Analysis**: `POST /api/analyze-pdf` (multipart/form-data)
- **Text Analysis**: `POST /api/analyze-text` (JSON)
- **API Docs**: http://localhost:8000/docs (FastAPI automatic docs)

### File Structure
```
Incentra/
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── requirements.txt           # Python dependencies
│   ├── northern-window-vision.json # Google Cloud credentials
│   └── package.json              # Backend metadata
├── src/
│   ├── app/entrepreneur/page.tsx  # Entrepreneur dashboard
│   └── components/               # UI components
├── pdf/                          # Sample PDF files for testing
└── package.json                  # Next.js dependencies
```

### Current Status
✅ Backend FastAPI server created and running
✅ Frontend updated with API integration
✅ PDF upload and analysis flow implemented
✅ Business canvas display with AI results
✅ Error handling and loading states
❌ Node.js needs to be installed for frontend

### Next Steps
1. Install Node.js from https://nodejs.org/
2. Run `npm install` in the main directory
3. Start both servers (backend: python main.py, frontend: npm run dev)
4. Test the complete flow with a PDF business plan

### Features Implemented
- **PDF Upload**: Entrepreneurs can upload PDF business plans
- **Vision API Integration**: Text extraction from PDF documents
- **Gemini AI Enhancement**: Intelligent business analysis
- **Business Model Canvas**: AI-generated 9-block canvas
- **SWOT Analysis**: Automated strengths/weaknesses/opportunities/threats
- **Recommendations**: AI-powered business suggestions
- **Real-time Analysis**: Live processing with loading indicators
- **Error Handling**: Comprehensive error messages and recovery

### Sample Test Flow
1. **Upload Sample PDF**: Use `pdf/sample_hindi_1.pdf`
2. **Submit for Analysis**: Click submit button
3. **Wait for Processing**: Vision API + Gemini analysis
4. **View Results**: Business canvas, SWOT, recommendations
5. **Export Options**: (Future: PDF reports, sharing)