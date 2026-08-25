# 🩺 Health Sage

> **AI-Powered Health Report Analysis Platform**

Health Sage is a full-stack AI-powered healthcare application that helps users understand their medical reports in a simple and organized way.

Users can upload laboratory reports, extract important health metrics, identify abnormal values, view historical trends, receive AI-generated insights, and ask questions about their reports using an intelligent chatbot.

> ⚠️ **Disclaimer:** Health Sage is intended for educational and informational purposes only. It does not replace professional medical advice, diagnosis, or treatment.

---

# ✨ Features

## 📄 AI-Powered Report Analysis

* Upload laboratory reports in PDF format
* Automatically extract important health metrics
* Detect abnormal or out-of-range values
* Generate AI-powered health insights
* Provide simplified explanations of medical information

## 🤖 Report-Aware AI Chatbot

Users can ask questions directly about their uploaded health reports.

Example questions:

* What is my problem?
* Which values are abnormal?
* What does my TSH level mean?
* What should I discuss with my doctor?

## 📊 Historical Health Trends

Track health metrics across multiple reports.

Supported metrics can include:

* WBC Count
* RBC Count
* Platelet Count
* Hemoglobin
* TSH
* Free T4
* LDL Cholesterol
* HDL Cholesterol
* Triglycerides
* Total Cholesterol

## 🩺 Specialist Recommendations

Based on abnormal health metrics, Health Sage can recommend relevant specialists such as:

* General Physician
* Cardiologist
* Endocrinologist

## 📍 Nearby Healthcare Search

Users can search for nearby hospitals and healthcare facilities.

## 🔐 Authentication & Security

* User registration and login
* JWT-based authentication
* Protected routes
* Password hashing
* Request validation
* Environment variable protection

---

# 🛠️ Tech Stack

## Backend & Database

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square\&logo=node.js\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square\&logo=mongodb\&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square\&logo=mongoose\&logoColor=white)
![REST API](https://img.shields.io/badge/REST-API-6DB33F?style=flat-square)

## Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=flat-square\&logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat-square\&logo=tailwindcss\&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-Visualization-FF6384?style=flat-square\&logo=chart.js\&logoColor=white)

## AI & Intelligence

![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)
![Llama](https://img.shields.io/badge/Llama-3.3_70B-0467DF?style=flat-square)
![AI](https://img.shields.io/badge/AI-Report_Analysis-8A2BE2?style=flat-square)
![Chatbot](https://img.shields.io/badge/AI-Report_Aware_Chatbot-7B61FF?style=flat-square)

## Authentication & Security

![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square\&logo=jsonwebtokens\&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-Password_Hashing-338033?style=flat-square)
![Zod](https://img.shields.io/badge/Zod-Validation-3068B7?style=flat-square)

## APIs & Services

![Geoapify](https://img.shields.io/badge/Geoapify-Location_API-00A991?style=flat-square)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Overpass_API-7EBC6F?style=flat-square\&logo=openstreetmap\&logoColor=white)
![Wikidata](https://img.shields.io/badge/Wikidata-Data_Service-006699?style=flat-square\&logo=wikidata\&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Email_Service-339933?style=flat-square)

## Developer Tools

![Git](https://img.shields.io/badge/Git-Version_Control-F05032?style=flat-square\&logo=git\&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square\&logo=github\&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-Editor-007ACC?style=flat-square\&logo=visualstudiocode\&logoColor=white)

---

# 📁 Project Structure

```text
health-sage/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   └── reportController.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── models/
│   │   ├── Metric.js
│   │   ├── Report.js
│   │   └── user.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── services/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── sample.pdf
├── test.http
└── README.md
```

---

# ⚙️ How It Works

```text
User
 │
 ▼
Upload Medical Report
 │
 ▼
PDF Text Extraction
 │
 ▼
AI-Powered Metric Analysis
 │
 ├── Extract Health Metrics
 ├── Detect Abnormal Values
 └── Generate AI Insights
 │
 ▼
MongoDB Database
 │
 ▼
Health Sage Dashboard
 │
 ├── Health Metrics
 ├── AI Summary
 ├── Historical Trends
 ├── AI Chatbot
 └── Specialist Recommendations
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Rohitdas07x/health-sage.git
```

```bash
cd health-sage
```

---

# 🔧 Backend Setup

## Install Dependencies

```bash
cd backend
npm install
```

## Create Environment File

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

## Start Backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

# 🎨 Frontend Setup

Open a new terminal.

```bash
cd frontend
npm install
```

Then run:

```bash
npm run dev
```

Frontend will typically run on:

```text
http://localhost:5173
```

---

# 📊 Core Functionality

Health Sage currently provides:

* User authentication
* PDF health report upload
* AI-powered metric extraction
* Abnormal value detection
* AI-generated health insights
* Historical health trends
* Report-aware AI chatbot
* Specialist recommendations
* Nearby healthcare search

---

# 🔮 Future Roadmap

The next version of Health Sage aims to support additional types of medical reports and AI-assisted medical image understanding.

## 🩻 Medical Image & Report Support

Future versions may include support for:

* X-ray images and reports
* CT Scan images and reports
* MRI images and reports
* Ultrasound / Ultrasonography images and reports
* Medical image explanation using AI
* Combined image and report analysis

### Planned Workflow

```text
Upload Medical Image or Report
              │
              ▼
      AI-Assisted Analysis
              │
              ▼
 Identify Important Information
              │
              ▼
 Generate Simple Explanation
              │
              ▼
 Suggest Questions for a Healthcare Professional
```

> ⚠️ Future AI image features are intended to assist with understanding medical information and are not designed to provide a definitive medical diagnosis.

## 🌟 Additional Future Improvements

* 🎙️ Voice-based health assistant
* 🌐 Multi-language support
* 📄 Downloadable AI health summary
* 📈 Advanced health analytics
* 🔔 Personalized health reminders
* 👨‍⚕️ Doctor appointment integration
* 📱 Improved mobile experience

---

# 🔒 Security & Privacy

Health information is sensitive. The application includes:

* JWT authentication
* Password hashing
* Protected API routes
* Environment variable protection
* API key protection through `.env`
* Input validation

> `.env` files and sensitive credentials should never be committed to GitHub.

---

# 🎯 Project Goal

Health Sage aims to make complex medical information easier for everyday users to understand.

The platform focuses on helping users understand:

* What their health values mean
* Which values are abnormal
* How health metrics change over time
* What questions they can ask their doctor
* Which type of specialist may be relevant

---

# 👨‍💻 Author

**Rohit Das**

Full-Stack Developer | AI Enthusiast

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐.
