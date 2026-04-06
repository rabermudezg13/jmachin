# Machin & Co. Tax Services — Web App

## Stack
| Layer | Tech |
|-------|------|
| Backend | Python 3.11+ · FastAPI · SQLAlchemy · SQLite |
| Frontend | React 18 · Vite · Tailwind CSS |
| PDF Export | ReportLab |
| Excel Export | openpyxl |
| Auth | JWT (python-jose + bcrypt) |

---

## BACKEND SETUP

### 1. Go to the backend folder
```bash
cd /Volumes/macmini/machin/backend
```

### 2. Create and activate a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be running at: http://localhost:8000
Interactive docs at: http://localhost:8000/docs

---

## FRONTEND SETUP

### 1. Go to the frontend folder
```bash
cd /Volumes/macmini/machin/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the dev server
```bash
npm run dev
```

The app will be running at: http://localhost:5173

---

## FIRST-TIME SETUP (run both servers, then):

1. Open http://localhost:5173
2. Click **Accountant Login** → **Register**
3. Create your accountant account
4. Log in → you now have access to the Dashboard

---

## HOW IT WORKS

### Client Flow
1. Client visits the landing page
2. Clicks **Start Questionnaire**
3. Fills out the 4-step form
4. Signs and submits
5. Gets a **Thank You** page with:
   - Download as PDF button
   - Download as Excel button
   - A personal edit link (save it to fix mistakes)

### Accountant Flow
1. Login at `/login`
2. Dashboard shows all submissions sorted by date
3. Search by name or filter by date
4. Click any submission to see full details
5. Download PDF or Excel per submission
6. Copy the client's edit link to send back to them
7. Delete submissions if needed

---

## PROJECT STRUCTURE

```
machin/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # SQLAlchemy + SQLite
│   │   ├── models.py        # DB models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # JWT authentication
│   │   ├── routers/
│   │   │   ├── auth.py      # /api/auth/*
│   │   │   ├── submissions.py # /api/submissions/*
│   │   │   └── exports.py   # /api/export/*
│   │   └── utils/
│   │       ├── pdf_gen.py   # ReportLab PDF generator
│   │       └── excel_gen.py # openpyxl Excel generator
│   ├── requirements.txt
│   └── .env
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx       # Home page
        │   ├── Login.jsx         # Accountant login
        │   ├── Register.jsx      # Accountant register
        │   ├── Questionnaire.jsx # 4-step form
        │   ├── Dashboard.jsx     # Accountant roster
        │   └── ThankYou.jsx      # Post-submit page
        ├── api/api.js            # Axios API calls
        ├── context/AuthContext.jsx
        └── components/ProtectedRoute.jsx
```

---

## DEPLOY TO GITHUB

```bash
cd /Volumes/macmini/machin
git init
git add .
git commit -m "Initial commit: Machin & Co. Tax Services app"
git remote add origin https://github.com/rabermudezg13/jmachin.git
git push -u origin main
```
