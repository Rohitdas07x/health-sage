<div align="center">

# 🩺 Health Sage

### AI-Powered Health Report Analysis Platform

**Health Sage helps users upload laboratory reports and receive AI-powered metric extraction, patient-friendly explanations, clinical summaries, historical trends, report-based AI assistance, specialist recommendations, and nearby healthcare facility suggestions.**

<br>

![Health Sage](https://img.shields.io/badge/Health%20Sage-AI%20Healthcare-0d9488?style=for-the-badge)

![GitHub Stars](https://img.shields.io/github/stars/im-raj5832/health-sage?style=for-the-badge\&logo=github)

![GitHub Forks](https://img.shields.io/github/forks/im-raj5832/health-sage?style=for-the-badge\&logo=github)

![GitHub Issues](https://img.shields.io/github/issues/im-raj5832/health-sage?style=for-the-badge\&logo=github)

</div>

---

## 📌 About Health Sage

<div align="center">

**Health Sage** is a full-stack AI-powered healthcare application designed to help users understand complex medical and laboratory reports in a simple, organized, and user-friendly way.

</div>

Users can upload PDF-based medical reports, extract important health metrics, identify abnormal values, generate AI-powered summaries, track health trends over time, ask questions about their reports, receive specialist recommendations, and discover nearby healthcare facilities.

The platform combines **React, Node.js, Express.js, MongoDB, Groq, and Llama 3.3 70B** to provide an intelligent health-report analysis experience.

---

# ✨ Features

## 📄 AI-Powered Medical Report Analysis

Health Sage allows users to upload PDF-based laboratory and medical reports.

The system can:

* Upload PDF medical/laboratory reports
* Extract text from uploaded reports
* Automatically identify important health metrics
* Detect abnormal or out-of-range values
* Organize extracted information into structured data
* Generate AI-powered insights from report information

---

## 🤖 AI-Powered Health Summaries

Health Sage provides different types of AI-generated explanations to make medical information easier to understand.

### 👤 Patient-Friendly Summary

A simple explanation designed for everyday users.

It helps users understand:

* What their report contains
* Which values may require attention
* What specific metrics mean
* Important observations from the report

### 👨‍⚕️ Clinical-Style Summary

A more structured summary containing:

* Important medical metrics
* Abnormal findings
* Relevant observations
* Report-based clinical context

---

## 💬 Report-Based AI Chatbot

Users can ask questions directly about their uploaded medical report.

Example questions:

```text
What is my problem?

Which values are abnormal?

Explain my TSH level.

What does my platelet count mean?

Which specialist should I consult?

What should I ask my doctor about this report?
```

The chatbot is designed to provide answers based on the information extracted from the uploaded report.

---

## 📈 Historical Health Trends

Health Sage can track important metrics across multiple reports.

Users can:

* View historical health values
* Compare previous and current reports
* Visualize metric changes over time
* Monitor important laboratory measurements
* Identify trends across multiple reports

Example metrics include:

* TSH
* Free T4
* Hemoglobin
* WBC Count
* RBC Count
* Platelet Count
* Blood Sugar
* LDL Cholesterol
* HDL Cholesterol
* Triglycerides
* Total Cholesterol

---

## 🚨 Abnormal Metric Detection

The system identifies potentially abnormal health values from uploaded reports.

Abnormal metrics can be highlighted and used for:

* AI-generated explanations
* Specialist recommendations
* Health trend analysis
* Report-based chatbot conversations

---

## 👨‍⚕️ Specialist Recommendations

Health Sage maps detected abnormal health metrics to relevant healthcare specialists.

| Health Metric                | Suggested Specialist            |
| ---------------------------- | ------------------------------- |
| TSH / Thyroid-related values | Endocrinologist                 |
| Cholesterol                  | Cardiologist                    |
| Blood Sugar                  | Diabetologist / Endocrinologist |
| Abnormal Blood Count         | General Physician               |
| Liver-related Metrics        | Gastroenterologist              |

These recommendations are intended to help users understand which type of healthcare professional may be relevant to discuss their results with.

---

## 🏥 Nearby Healthcare Suggestions

Health Sage can provide nearby healthcare facility suggestions based on location-related services.

The system can help users discover:

* Nearby hospitals
* Clinics
* Healthcare facilities
* Relevant healthcare locations

The project uses external location and knowledge services such as **OpenStreetMap, Geoapify, and Wikidata**.

---

## 🔐 Authentication & Security

Health Sage includes security-focused backend functionality such as:

* User registration
* User login
* JWT-based authentication
* Protected API routes
* Password hashing
* Request/input validation
* Environment variable protection
* API key protection through `.env`

---

# 🛠️ Tech Stack

<div align="center">

## Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)

![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)

![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)

![Chart.js](https://img.shields.io/badge/Chart.js-Data%20Visualization-FF6384?style=for-the-badge\&logo=chart.js\&logoColor=white)

## Backend

![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge\&logo=node.js\&logoColor=white)

![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge\&logo=express\&logoColor=white)

![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)

![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge\&logo=mongoose\&logoColor=white)

## Backend Services

![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)

![Multer](https://img.shields.io/badge/Multer-File%20Upload-FF6B6B?style=for-the-badge)

![Zod](https://img.shields.io/badge/Zod-Validation-3068B7?style=for-the-badge)

![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-339933?style=for-the-badge\&logo=nodemailer\&logoColor=white)

## AI Infrastructure

![Groq](https://img.shields.io/badge/Groq-AI%20Inference-F55036?style=for-the-badge)

![Llama](https://img.shields.io/badge/Llama_3.3_70B-AI%20Model-6B4FBB?style=for-the-badge)

## APIs & Healthcare Services

![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Location%20Data-7EBC6F?style=for-the-badge\&logo=openstreetmap\&logoColor=white)

![Geoapify](https://img.shields.io/badge/Geoapify-Location%20API-008CFF?style=for-the-badge)

![Wikidata](https://img.shields.io/badge/Wikidata-Knowledge%20Base-006699?style=for-the-badge\&logo=wikidata\&logoColor=white)

</div>

---
# 🏗️ Project Architecture
               ```text

<<<<<<< HEAD
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
                 │   │   ├── emailService.js
                 │   │   ├── geoapifyService.js
                 │   │   ├── groqService.js
                 │   │   ├── hospitalService.js
                 │   │   ├── placesService.js
                 │   │   └── wikidataService.js
                 │   │
                 │   ├── utils/
                 │   │   ├── hash.js
                 │   │   └── specialistMap.js
                 │   │
                 │   ├── .env
                 │   ├── package.json
                 │   ├── package-lock.json
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
                 │   ├── index.html
                 │   ├── package.json
                 │   ├── package-lock.json
                 │   └── vite.config.js
                 │
                 ├── .gitignore
                 ├── README.md
                 ├── sample.pdf
                 └── test.http
         
          
---
<<<<<<< HEAD
### 🔄 Application Workflow

`
                        ┌───────────────┐
                        │     User      │
                        └───────┬───────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ Upload Medical Report   │
                    │        PDF File         │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   PDF Text Extraction   │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  AI-Powered Analysis    │
                    │  Groq + Llama 3.3 70B   │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │    Extract Metrics      │
                    │  Detect Abnormal Values │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │     MongoDB Storage     │
                    │ Reports + Metrics + User│
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Health Sage Analysis  │
                    └───────────┬─────────────┘
                                │
                ┌──────┼────────┬───────────┬───────────┐
                │      │        │           │           │
                ▼      ▼        ▼           ▼           ▼
            ┌────────┐ ┌──────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
            │   AI   │ │Abnormal│ │Historical│ │Specialist│ │ Nearby  │
            │Summary │ │ Values │ │  Trends │ │Recommend │ │Hospitals │
            └────────┘ └──────┘ └─────────┘ └─────────┘ └──────────┘
                │         │          │            │            │
                └─────────┴──────────┴────────────┴────────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Report-Based AI Chat  │
                            │ Ask Questions About   │
                            │ Your Health Report    │
                            └───────────┬───────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Health Sage Dashboard │
                            └───────────────────────┘
    ``

---
=======
🔄 Application Workflow
┌───────────────┐
│     User      │
└───────┬───────┘
        │
        ▼
┌─────────────────────────┐
│ Upload Medical Report   │
│        PDF File         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   PDF Text Extraction   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  AI-Powered Analysis    │
│  Groq + Llama 3.3 70B   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    Extract Metrics      │
│  Detect Abnormal Values │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     MongoDB Storage     │
│ Reports + Metrics + User│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Health Sage Analysis  │
└───────────┬─────────────┘
            │
     ┌──────┼────────┬───────────┬───────────┐
     │      │        │           │           │
     ▼      ▼        ▼           ▼           ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
│   AI   │ │Abnormal│ │Historical│ │Specialist│ │ Nearby  │
│Summary │ │ Values │ │  Trends │ │Recommend │ │Hospitals │
└────────┘ └──────┘ └─────────┘ └─────────┘ └──────────┘
     │         │          │            │            │
     └─────────┴──────────┴────────────┴────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Report-Based AI Chat  │
                  │ Ask Questions About   │
                  │ Your Health Report    │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Health Sage Dashboard │
                  └───────────────────────┘
>>>>>>> 33179d7 (docs: update project architecture and workflow)
# 📡 API Overview
=======
```text
health-sage/
│
├── backend/
│   │
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
│   │   ├── emailService.js
│   │   ├── geoapifyService.js
│   │   ├── groqService.js
│   │   ├── hospitalService.js
│   │   ├── placesService.js
│   │   └── wikidataService.js
│   │
│   ├── utils/
│   │   ├── hash.js
│   │   └── specialistMap.js
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   │
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
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
├── sample.pdf
└── test.http
```

---

# 🔄 Application Workflow

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Upload Medical Report   │
                    │       PDF File          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    PDF Text Extraction  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    AI Metric Extraction │
                    │     Groq + Llama 3.3    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Abnormal Value        │
                    │      Detection          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     MongoDB Storage     │
                    │ Reports + Metrics + User│
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼───────────────────┐
              │                  │                   │
              ▼                  ▼                   ▼
       ┌─────────────┐   ┌─────────────┐    ┌──────────────┐
       │ AI Summary  │   │ Abnormal    │    │ Historical   │
       │ Patient +   │   │   Metric    │    │ Health Trends│
       │ Clinical    │   │ Detection   │    │              │
       └──────┬──────┘   └──────┬──────┘    └──────┬───────┘
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ Specialist Recommendation│
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Nearby Hospitals / Clinics│
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Report-Based AI Chat  │
                    │ Ask Questions About     │
                    │ Your Medical Report     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Health Sage Dashboard │
                    └─────────────────────────┘
```

>>>>>>> c1f513c (Update README)
---

# ⚙️ Installation

## 1. Clone the Repository

<<<<<<< HEAD
``
git clone https://github.com/Rohitdas07/health-sage.git
=======
```bash
git clone https://github.com/im-raj5832/health-sage.git
>>>>>>> c1f513c (Update README)
```

```
cd health-sage
```

---

## 2. Setup Backend

```
cd backend
```

Install dependencies:

```
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Run the backend:

```
npm run dev
```

Backend:

```
http://localhost:5000
```

---

## 3. Setup Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 📡 API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

<<<<<<< HEAD
```
=======
## Reports

```text
POST /api/reports/upload
GET  /api/reports
GET  /api/reports/:id
GET  /api/reports/metrics/trends
```

## AI Chat

```text
POST /api/chat
```

---

>>>>>>> c1f513c (Update README)
# 🧠 AI Capabilities

Health Sage uses AI to transform extracted medical report information into structured and understandable insights.

The current AI capabilities include:

* Structured health metric extraction
* Abnormal value identification
* Patient-friendly explanations
* Clinical-style summaries
* Report-grounded conversations
* Context-aware health report assistance
* Specialist recommendations
* Health metric interpretation
* Historical health trend support

The AI system is designed to work with information extracted from uploaded reports rather than generating completely unrelated responses.

---

# 📊 Supported Health Insights

Examples of health metrics that can be tracked include:

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
* Blood Sugar
* Liver-related Metrics

Additional metrics can be supported as the application evolves.

---

# 🔮 Future Roadmap

Health Sage is designed to expand beyond traditional PDF laboratory reports.

Future versions aim to support additional medical reports and AI-assisted medical image understanding.

## 🩻 Medical Image & Report Support

Future versions may include:

* X-Ray image analysis
* X-Ray report explanation
* CT Scan image analysis
* CT Scan report explanation
* MRI image analysis
* MRI report explanation
* Ultrasound / Ultrasonography image analysis
* Ultrasound / Ultrasonography report explanation
* Medical image-based AI insights
* Combined image and report analysis

---
``

## 📷 Scan & Image Upload

Future versions will allow users to upload supported medical images and reports for AI-assisted analysis.

<<<<<<< HEAD
```
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Create a Pull Request
=======
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
 Suggest Questions for Healthcare Professional
>>>>>>> c1f513c (Update README)
```

---

## 🧠 Enhanced AI Assistant

Future AI improvements may include:

* More context-aware medical report conversations
* Better explanations for complex reports
* Multi-report comparison
* Personalized health trend analysis
* Image + report-based conversations
* Advanced report interpretation

---

## 📊 Advanced Health Dashboard

Planned improvements include:

* More detailed visualizations
* Health history timeline
* Metric comparison
* Long-term health monitoring
* Advanced health analytics
* Improved health insights

---

## 🌟 Additional Future Improvements

* 🎙️ Voice-based health assistant
* 🌐 Multi-language support
* 📈 Advanced health analytics
* 🔔 Personalized health reminders
* 👨‍⚕️ Doctor appointment integration
* 📱 Improved mobile experience

---

# 🔒 Security & Privacy

Health information is sensitive. Health Sage includes:

* JWT authentication
* Password hashing
* Protected API routes
* Environment variable protection
* API key protection through `.env`
* Input validation
* Secure authentication flow

---

# 🎯 Project Goal

The goal of **Health Sage** is to make complex medical information easier for everyday users to understand.

The platform focuses on helping users understand:

* What their health values mean
* Which values may be abnormal
* How health metrics change over time
* What questions they can ask their healthcare professional
* Which type of specialist may be relevant
* Where nearby healthcare facilities may be available

Health Sage is designed as an **AI-assisted health information platform** to support understanding of medical information.

---

# 🙏 Acknowledgments

* **Node.js** — JavaScript runtime environment
* **Express.js** — Backend web framework
* **MongoDB** — NoSQL database
* **Mongoose** — MongoDB object modeling
* **React** — Frontend UI library
* **Vite** — Frontend development tooling
* **Tailwind CSS** — Utility-first CSS framework
* **Chart.js** — Data visualization
* **Groq** — Fast AI inference
* **Llama** — Large language model
* **Geoapify** — Location and geospatial services
* **OpenStreetMap** — Geographic data
* **Wikidata** — Structured knowledge base

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

# 👨‍💻 Author

### Rohit Das

**Full-Stack Developer | AI Enthusiast**

<br>

<a href="https://github.com/im-raj5832">
<img src="https://img.shields.io/badge/GitHub-im--raj5832-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
</a>

<a href="https://www.linkedin.com/in/rohit-das-dev/">
<img src="https://img.shields.io/badge/LinkedIn-Rohit%20Das-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>

<a href="mailto:dasr35266@gmail.com">
<img src="https://img.shields.io/badge/Email-dasr35266%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
</a>

<br><br>

### Made with ❤️ for better health understanding

### ⭐ Star this repository if you find it helpful!

</div>
