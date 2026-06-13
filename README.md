# 📑 Bank Statement Analyzer

Correm Bank Statement Analyzer is a production-ready, full-stack financial analytics application designed to parse HDFC Bank PDF statements (supporting both digital text-based PDFs and scanned image PDFs), extract transaction ledgers with 100% accuracy, run balance chain validation, automatically categorize transactions, visualize cash flows, and export professionally formatted Excel reports.

---

# 🌐 Live Deployment

## Frontend
https://correm-assignment.onrender.com

## Backend
https://correm-backend.onrender.com

---

## 🚀 Key Features & Architectural Deep-Dive

### 1. Dual-Path PDF Parsing & Extraction Engine
* **Digital PDF Extraction**: Uses `pdfplumber` and `PyMuPDF` (`fitz`) to directly extract tabular transaction data from native digital PDFs, ensuring maximum speed and accuracy.
* **Scanned PDF OCR Pipeline**: Falls back to an advanced image processing pipeline when digital text is unavailable:
  * Converts PDF pages to high-resolution images via `pdf2image` (utilizing `poppler`).
  * Applies image preprocessing (grayscale conversion, thresholding, and binarization) to optimize clarity.
  * Utilizes `pytesseract` (Tesseract OCR Engine) to read data and parse rows using custom alignment regex.

### 2. Balance Chain Reconciliation & Audit Ledger
* Performs a rigorous mathematical check on every extracted transaction row:
  $$\text{Previous Balance} - \text{Debit} + \text{Credit} == \text{Current Balance}$$
* If any transaction is dropped or misparsed, the system flags a **Discrepancy** status, tracks the exact row indices where validation failed, and outputs a detailed mismatch report.
* A **SUCCESS** status is only granted if the entire statement reconciles perfectly from opening to closing balance.

### 3. Rules-Based Smart Categorization
* Features a classification engine with **100+ keyword regex configurations** mapped into **16 unique financial categories** (e.g., *Salary, EMI / Loan, Rent, Food & Dining, Shopping, Utilities, Travel, Telecom*).
* Returns a classification confidence percentage and defaults to **Other** if no keyword matching is met.

### 4. Advanced Pattern Recognition (Salary & EMI Detection)
* **Salary Detection**: Analyzes repeating monthly/bi-weekly credits from corporate payees, computing payment frequencies, source names, and confidence scores.
* **EMI / Recurring Outflow Detection**: Identifies recurring debits (like home/car loans or subscriptions) by scanning transaction intervals, payees, and uniform debit amounts.

### 5. Premium Interactive Dashboard & Visualizations
* **Recharts Visualizations**: Interactive area, bar, and pie charts showing **Balance Trends**, **Monthly Inflow vs. Outflow**, and **Category Spend Distribution**.
* **Visual Polish & Theme Context**:
  * Outfitted with custom fonts (*Outfit* and *Inter*) and styled using glassmorphic UI components.
  * **Optimized Dark Mode**: Features a unified dark theme utilizing semantic color-grouped category badges (Green for Inflow, Rose for Liabilities, Blue for Transfers, and Neutral Slate for general expenses) to eliminate color noise and provide maximum legibility.

### 6. Excel Exporter (.xlsx)
* Compiles and outputs a styled 3-sheet spreadsheet using `openpyxl`:
  1. **Account Details**: Quick summary of the account holder, bank metadata, opening/closing balances, and audit status.
  2. **Transaction Ledger**: Structured transaction list with frozen headers, formatted dates, and currency styling (₹).
  3. **Analytics Summary**: Monthly cash flow metrics and category-wise spending breakdowns.

---

## 📁 Repository Structure

```text
Correm Assignment/
├── backend/
│   ├── app/
│   │   ├── models/            # Pydantic & database schemas
│   │   ├── routes/            # API endpoints (Auth, Statements, Analytics, Export)
│   │   ├── services/          # PDF Parser, OCR pipeline, Categorizer, Analytics engine
│   │   ├── utils/             # JWT, Bcrypt helpers, openpyxl Excel exporter
│   │   ├── config.py          # Environment settings
│   │   ├── db.py              # Motor MongoDB client setup
│   │   └── main.py            # FastAPI app bootstrap
│   ├── uploads/               # Storage directory for uploaded PDFs
│   ├── tests/                 # Python Pytest suites
│   ├── requirements.txt       # Python packages list
│   └── .env                   # Backend configuration variables
├── frontend/
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── assets/            # App images & icons
│   │   ├── components/        # Layout, route guards, loading skeletons
│   │   ├── context/           # AuthContext and ThemeContext
│   │   ├── pages/             # Pages: Dashboard, Statement Detail, Login, Signup
│   │   ├── services/          # Axios client (api.js)
│   │   ├── App.css            # Root styles
│   │   ├── index.css          # Tailwind utilities & custom animation layers
│   │   ├── App.jsx            # React route router mapping
│   │   └── main.jsx           # App entry point
│   ├── index.html             # Entry HTML document
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── vite.config.js         # Vite configuration
│   └── .env                   # Frontend environment variables
├── render.yaml                # Render Fullstack cluster deploy blueprints
└── README.md                  # Project manual (This document)
```

---

## 📸 Screenshots

<img width="1889" height="899" alt="{6BA82B42-FDD8-4F6C-BD54-3DBB599DD478}" src="https://github.com/user-attachments/assets/a4b3ba19-b9c3-4dc4-94be-de6d37559093" />
---
<img width="1871" height="869" alt="{4EC83F03-083C-4ED7-ABE2-512C1D02F6A6}" src="https://github.com/user-attachments/assets/3f3160db-7544-4c42-b16c-1e8210f3ebc6" />

---
<img width="1226" height="749" alt="{269C3EF9-B223-41E9-A634-C35731E0FA9C}" src="https://github.com/user-attachments/assets/5bba999c-7d12-482f-bbf3-e6be70f26a32" />
---
<img width="1178" height="838" alt="{0E4B9F53-C809-4134-A471-DE7FDC347040}" src="https://github.com/user-attachments/assets/a51c93b8-74e0-4eaf-987d-2a4c712ca796" />

---
<img width="1874" height="893" alt="{4DEEE518-9697-48D3-866F-A96CD9E817EF}" src="https://github.com/user-attachments/assets/4350d73c-9797-4698-8699-c1d0db90faf9" />


<img width="883" height="471" alt="{00FB7431-E955-4294-B1DB-E692010C3DB7}" src="https://github.com/user-attachments/assets/2efbbe7a-e9c7-4443-afb7-92ffc0b53a93" />
---

<img width="1102" height="856" alt="{E00B6F0E-BDF4-4435-A87E-225F773E4B85}" src="https://github.com/user-attachments/assets/62e35693-e042-490c-a4da-2fce49d669fc" />
---
<img width="696" height="856" alt="{FA2E43A8-D6A2-4C57-985E-16E518874E58}" src="https://github.com/user-attachments/assets/205531a7-ae45-40fb-b59b-d675935f3462" />

---

## 🛠️ Local Installation & Setup

### Prerequisites
* **Python 3.10+**
* **Node.js v18+ & npm**
* **MongoDB** (Local instance or MongoDB Atlas Cloud URI)
* **Tesseract OCR Binary** (Required for OCR PDF processing)
* **Poppler Utilities** (Required for PDF-to-image conversions)

---

### Phase 1: Installing System Dependencies

#### For Windows:
1. **Tesseract OCR**:
   * Download the Windows installer from [UB-Mannheim Tesseract Wiki](https://github.com/UB-Mannheim/tesseract/wiki).
   * Run the installer and note the installation path (typically `C:\Program Files\Tesseract-OCR\tesseract.exe`).
2. **Poppler**:
   * Download the latest binary zip file from [poppler-windows releases](https://github.com/oschwartz10612/poppler-windows/releases).
   * Extract the zip folder (e.g. to `C:\poppler`) and add the `bin` folder path (e.g. `C:\poppler\Library\bin` or `C:\poppler\bin`) to your system's environment variables or configure it in the backend `.env` file.

#### For macOS:
Install via Homebrew:
```bash
brew install tesseract poppler
```

#### For Linux (Ubuntu/Debian):
Install via apt:
```bash
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-eng poppler-utils
```

---

### Phase 2: Backend Setup
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory and configure your variables (refer to the [Environment Variables](#environment-variables-checklists) section).
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   * The API should now be running locally at `http://localhost:8000`. You can access the interactive Swagger API documentation at `http://localhost:8000/docs`.

---

### Phase 3: Frontend Setup
1. Navigate to the `frontend/` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Run the Vite React development server:
   ```bash
   npm run dev
   ```
   * The frontend application will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables Checklists

### Backend Configuration (`backend/.env`)
| Key | Type | Default | Description |
|---|---|---|---|
| `ENV` | String | `development` | Environment environment (`development` or `production`). |
| `PORT` | Integer | `8000` | Port for the FastAPI server to bind to. |
| `HOST` | String | `0.0.0.0` | Host IP address for binding the server. |
| `MONGO_URI` | String | `mongodb://localhost:27017` | MongoDB connection string URI. |
| `DB_NAME` | String | `correm_analyzer` | Name of the database in MongoDB. |
| `JWT_SECRET` | String | *[Secret Key]* | Key used to sign JWT session tokens. |
| `TESSERACT_CMD` | String | `""` | *(Windows only)* Absolute file path to the `tesseract.exe` binary. Leave blank on macOS/Linux. |
| `POPPLER_PATH` | String | `""` | *(Windows only)* Path to the Poppler `bin/` directory. Leave blank on macOS/Linux. |

### Frontend Configuration (`frontend/.env`)
| Key | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Base URL endpoint for backend REST API calls. |

---

## 📡 API Endpoints

### 🔑 Authentication Routing (`/api/auth`)
* `POST /api/auth/register`
  * Registers a new user. Returns user profile details and a signed JWT access token.
* `POST /api/auth/login`
  * Authenticates user credentials. Returns JWT access token.
* `GET /api/auth/me`
  * Verifies session token in the authorization header and returns profile data.
* `POST /api/auth/forgot-password`
  * Initiates simulated password recovery workflow.
* `POST /api/auth/reset-password`
  * Resets password to a new value using a verification context.

### 📄 Bank Statements Routing (`/api/statements`)
* `POST /api/statements/upload`
  * Accepts a bank statement `.pdf` file. Triggers parsing pipelines, performs mathematical balance checks, runs auto-categorization and recurring pattern algorithms, stores metrics in the database, and returns statement metadata.
* `GET /api/statements`
  * Fetches all statements metadata uploaded by the current authenticated user.
* `GET /api/statements/{id}`
  * Returns detailed account info, analytics parameters, and the full transaction ledger array.
* `DELETE /api/statements/{id}`
  * Deletes database documents associated with the statement ID.

### 📊 Analytics Routing (`/api/analytics`)
* `GET /api/analytics/{id}`
  * Returns calculated analytical values (monthly summary cashflow structures, category summary distributions, repeating inflow/outflow schedules).

### 📤 Exporter Routing (`/api/export`)
* `GET /api/export/excel/{id}`
  * Generates and downloads the styled 3-sheet Excel spreadsheet report.

---

## ☁️ Deploying to Render

### Option 1: Render Blueprints (Automatic Full-Stack Deploy)
The project includes a `render.yaml` configuration that sets up both services concurrently:

1. Commit and push your local branch changes (making sure MongoDB Atlas credentials/variables are managed safely) to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New** $\rightarrow$ **Blueprint**.
3. Select your repository.
4. Render will parse `render.yaml` and provision:
   * **correm-backend**: Native Python web service running FastAPI.
   * **correm-frontend**: Native Static web service hosting the built React SPA.
5. In the setup menu:
   * Set **`MONGO_URI`** to your MongoDB Atlas cluster URI.
6. Click **Approve** to begin builds.
7. Once deployed, copy your live backend URL (e.g. `https://correm-backend.onrender.com`).
8. Go to **correm-frontend** static site settings $\rightarrow$ **Environment Variables**, and set `VITE_API_URL` to `https://correm-backend.onrender.com/api`. Re-deploy the static site for variables to take effect.

> [!NOTE]
> When using Render's native Python environment, you may need to configure a custom build script to fetch and install Tesseract and Poppler libraries, or alternatively deploy the backend as a **Docker Web Service** using the provided `backend/Dockerfile` to ensure these system utilities build correctly.

---

### Option 2: Manual Dashboard Deploy

#### 1. Backend Service
1. Click **New** $\rightarrow$ **Web Service** on Render.
2. Choose your repository and set **Runtime** to **Docker** (recommended) or **Python**.
3. If using **Docker**:
   * **Docker Context**: `backend`
   * **Dockerfile Path**: `backend/Dockerfile`
4. If using **Python**:
   * **Build Command**: `pip install -r backend/requirements.txt`
   * **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, configure:
   * `ENV` = `production`
   * `MONGO_URI` = *[Your MongoDB Atlas URI]*
   * `DB_NAME` = `correm_analyzer`
   * `JWT_SECRET` = *[Your Secret Key]*

#### 2. Frontend Service
1. Click **New** $\rightarrow$ **Static Site** on Render.
2. Select your repository.
3. Configure settings:
   * **Build Command**: `cd frontend && npm install && npm run build`
   * **Publish Directory**: `frontend/dist`
4. Under **Environment Variables**, add:
   * `VITE_API_URL` = `https://[your-backend-url].onrender.com/api`
5. Under **Redirects/Rewrites**, add a rule:
   * **Source**: `/*`
   * **Destination**: `/index.html`
   * **Action**: `Rewrite` *(This enables standard SPA client-side routing on refreshes)*

---

## 🧪 Running Tests
The backend contains a test suite built on `pytest` to verify API routes, authentication logic, and the statement parsing engine.

1. Activate your virtual environment and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Run tests:
   ```bash
   pytest
   ```

---

## ⚖️ AI Tools Used:

ChatGPT – Used to understand the assignment requirements, architecture planning, implementation approaches, debugging, and problem-solving.

Claude – Used during application development, optimization, and implementation assistance.

Gemini – Used for reviewing implementation approaches, and improving code quality.
