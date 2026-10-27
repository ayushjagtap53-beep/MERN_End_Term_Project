# MediFlow: Smart Healthcare Appointment & Clinical Triage System
> **End-Term Software Engineering Capstone Project**  
> Built with MongoDB, Express.js, React (Vite + Tailwind CSS), and Node.js.

---

## 📌 Project Overview

| Attribute | Details |
|---|---|
| **Project Name** | **MediFlow** |
| **Domain** | Healthcare Information & Clinical Operations Platform |
| **Architecture** | Decoupled Client-Server MERN Architecture |
| **Database** | MongoDB Atlas / Local MongoDB (Mongoose ODM) |
| **Authentication** | Stateless JWT (JSON Web Tokens) with Role-Based Access Control |
| **Key Innovation** | Automated Algorithmic Pre-Consultation Symptom Triage & Conflict-Free Slot Engine |

---

## 🩺 1. Problem Statement

Conventional clinic appointment platforms are typically basic booking calendars that treat medical appointments like restaurant reservations. This creates severe clinical and operational drawbacks:

1. **Absence of Pre-Consultation Triage:** Patients with acute, high-risk symptoms (such as cardiac distress, acute respiratory failure, or severe neurological symptoms) wait in the same chronological line as routine checkups.
2. **Double-Booking & Race Conditions:** Poor concurrency handling leads to overlapping appointments and physician schedule fragmentation.
3. **Disconnected Post-Consultation Workflow:** Prescriptions and medical advice are frequently given on paper or disconnected channels, preventing patients from accessing their structured clinical history.

---

## 🎯 2. Target Users

1. **Patients:** Individuals seeking specialized medical consultation who need immediate symptom urgency evaluation, transparent slot booking, and continuous access to their digital prescriptions.
2. **Specialist Physicians & Doctors:** Healthcare practitioners requiring a triage-prioritized patient queue, instant access to clinical intake vitals, and a structured authoring tool for digital prescriptions.
3. **Clinical Administrators:** Health centers overseeing physician schedules, booking volumes, and triage severity metrics.

---

## 💡 3. Solution

**MediFlow** transforms medical appointment scheduling into an intelligent clinical intake workflow:

- **Algorithmic Clinical Triage:** During booking, patient-reported symptoms are evaluated against a clinical urgency scoring matrix and emergency red-flag indicators, categorizing cases into `URGENT` (Red), `MEDIUM` (Amber), and `LOW` (Green).
- **Conflict-Free Slot Engine:** Server dynamically calculates available 30-minute intervals from physician working hours, actively subtracting active reservations to guarantee zero double-booking.
- **End-to-End Status Lifecycle:** Full state machine transition: `CONFIRMED` &rarr; `CHECKED_IN` &rarr; `IN_CONSULTATION` &rarr; `COMPLETED` (or `CANCELLED`).
- **Integrated Digital Prescriptions:** Attending physicians record diagnoses, vitals (BP, SpO2, Heart Rate, Temperature), and multi-drug prescriptions that patients can view and print anytime.

---

## 🚀 4. Key Workflows & Features

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────────────┐
│  1. Search &    │ ----> │  2. Conflict-Free Slot │ ----> │  3. Clinical Intake &   │
│  Filter Doctors │       │     Calculation        │       │     Triage Scoring      │
└─────────────────┘       └────────────────────────┘       └─────────────────────────┘
                                                                        │
                                                                        ▼
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────────────┐
│  6. Digital Rx  │ <---- │  5. Physician Queue &  │ <---- │  4. Confirmed Booking   │
│     & History   │       │     Consultation       │       │     & Reference Token   │
└─────────────────┘       └────────────────────────┘       └─────────────────────────┘
```

### Workflow 1: Specialist Discovery & Search
- Search by doctor name, medical specialty, or hospital facility.
- Specialty filters (Cardiology, Neurology, Dermatology, Pediatrics, General Medicine, Orthopedics).
- Sort by highest rating, clinical experience, or consultation fee.

### Workflow 2: Dynamic Available Slot Engine
- Server dynamically generates 30-minute slots based on doctor working hours.
- Automatic exclusion of past hours on current date.
- Real-time exclusion of existing booked slots preventing race conditions and double bookings.

### Workflow 3: Clinical Intake & Automated Triage Scoring
- Multi-parameter clinical intake: chief complaint, symptom severity slider (1-10), duration, temperature, pre-existing comorbidities.
- Red flag keyword detector (e.g., chest pain, shortness of breath, slurred speech).
- Automated assignment of urgency score (0-100) and triage tier (`URGENT`, `MEDIUM`, `LOW`).

### Workflow 4: Patient Lifecycle Management
- Instant unique reference token generation (e.g. `MDF-2026-URG01`).
- Self-service check-in (`CONFIRMED` &rarr; `CHECKED_IN`).
- Cancellation with automatic slot release back to the available pool.

### Workflow 5: Physician Portal & Digital Prescription
- Doctor queue ordered by triage urgency score and appointment time.
- Emergency alert banners for patients requiring priority attention.
- Integrated prescription authoring: record vitals (Blood Pressure, Heart Rate, Temp, SpO2), clinical diagnosis, and medications with dosage/frequency.
- Instant transition to `COMPLETED` upon prescription issuance.

---

## 🛠️ 5. Technology Stack

- **Frontend:**
  - React 19 (via Vite)
  - Tailwind CSS v4 (Modern responsive utility styling)
  - Lucide React (Clinical iconography)
  - React Router DOM v7 (Client-side routing with role guards)
  - Axios (HTTP client with JWT request interceptors)
- **Backend:**
  - Node.js & Express.js (RESTful API architecture)
  - MongoDB Atlas (Cloud NoSQL Database)
  - Mongoose ODM (Schema validation, compound indexes, relationship population)
  - JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` (Secure password hashing and stateless authentication)
  - Morgan (HTTP request logging) & CORS
- **Tooling & Environment:**
  - Git version control
  - Dotenv configuration

---

## 🏛️ 6. System Architecture

```text
├── client/                     # Frontend React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, BookingModal)
│   │   ├── context/            # AuthContext (JWT session state)
│   │   ├── pages/              # Views (Home, DoctorList, DoctorDetail, MyAppointments, DoctorDashboard, Prescriptions, Login, Register)
│   │   ├── services/           # Axios API client with token interceptor
│   │   ├── App.jsx             # Route definitions & ProtectedRoute guards
│   │   └── main.jsx            # React root mount
│   ├── vite.config.js          # Vite config with API proxy to port 5000
│   └── package.json
│
├── server/                     # Backend Node.js / Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── controllers/        # Business logic (auth, doctors, appointments, prescriptions, stats)
│   │   ├── middleware/         # JWT protection & role authorization, error handling
│   │   ├── models/             # Mongoose schemas (User, DoctorProfile, Appointment, Prescription, Review)
│   │   ├── routes/             # REST endpoints (/api/auth, /api/doctors, /api/appointments, etc.)
│   │   ├── utils/              # Clinical triage engine & sample data seeder
│   │   └── server.js           # Server bootstrap & middleware setup
│   ├── .env.example            # Sample environment variables
│   ├── .env                    # Local secrets (ignored by Git)
│   └── package.json
│
├── .gitignore                  # Protection against secret leakage (.env, node_modules)
└── package.json                # Root workspace orchestration scripts
```

---

## ⚙️ 7. Local Setup Instructions

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, tested on v22)
- **npm** (v9.0.0 or higher)
- **MongoDB** connection string (MongoDB Atlas cluster or local MongoDB instance)

### Step 1: Clone Repository & Open Workspace
```bash
git clone <your-repository-url>
cd MERN_End_Term_Project
```

### Step 2: Configure MongoDB Connection String
Open `server/.env` and replace `PASTE_YOUR_MONGODB_URI_HERE` with your actual MongoDB connection string:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mediflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Security Note:** `server/.env` is strictly ignored by `.gitignore` and is never committed to Git. A sanitized template is maintained in `server/.env.example`.

### Step 3: Install Dependencies
```bash
# From the root directory:
npm run install:all
```

### Step 4: Seed Initial Specialist Data & Demo Accounts
Run the automated seed script to populate realistic specialist doctors and sample triage appointments:

```bash
npm run seed
```

### Step 5: Start the Development Servers

In terminal 1 (Backend API on port 5000):
```bash
npm run server
```

In terminal 2 (Frontend Client on port 5173):
```bash
npm run client
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 8. Evaluator Demo Credentials

Pre-seeded credentials available for immediate testing:

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Patient** | `patient@mediflow.com` | `password123` | Search doctors, choose slots, submit triage intake, view appointments & prescriptions |
| **Doctor** | `doctor@mediflow.com` | `password123` | Review clinical queue, inspect triage urgency scores, start consult, issue prescriptions |

*(1-Click demo fill buttons are also built directly into the login screen for instant grading convenience).*

---

## 🛡️ 9. Security & Error Handling

- **Credential Protection:** Passwords securely hashed with `bcryptjs` (salt rounds: 10).
- **Secret Isolation:** All keys (`MONGODB_URI`, `JWT_SECRET`) strictly stored in `.env` and omitted from version control.
- **Role-Based Authorization:** Doctor routes (such as issuing prescriptions and reviewing clinical queues) require verified JWTs with `doctor` role permissions.
- **Race Condition Prevention:** Dynamic slot generator checks existing active appointments at the moment of query and validates uniqueness at insertion.
- **Centralized Error Handling:** Global middleware catches CastErrors, ValidationError, duplicate key codes (11000), and JWT expiration.

---

## 📝 10. Submission Metadata Template

```text
Project Name: MediFlow - Smart Healthcare Appointment & Clinical Triage System

Student Name: Ayush Jagtap

Problem Statement: Traditional clinic appointments lack pre-consultation triage, causing critical patients to wait behind routine checkups while clinic schedules suffer from double-booking and disconnected prescription workflows.

GitHub Repository: https://github.com/ayushjagtap53-beep/MERN_End_Term_Project

Deployed Application / Build: [Your Deployed Link, e.g. Vercel/Render]

Demo Video: [Your 3-5 Minute Demo Video URL]

Tech Stack: MongoDB Atlas, Express.js, React 19, Node.js, Tailwind CSS, JWT, Axios, Lucide React

Major Features:
1. Real-time dynamic conflict-free slot calculation
2. Algorithmic pre-consultation symptom triage scoring & red-flag detection
3. End-to-end appointment status machine (CONFIRMED -> CHECKED_IN -> IN_CONSULTATION -> COMPLETED)
4. Physician clinical portal with triage-prioritized patient queue
5. Digital prescription authoring with vitals recording and printable patient medical records
```
