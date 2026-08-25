# 🩺 Health Sage - AI-Powered Health Report Analysis Platform

> 
Health Sage is a full-stack AI-powered healthcare application that helps users understand their medical reports in a simple and organized way.
Users can upload laboratory reports, extract important health metrics, identify abnormal values, view historical trends, receive AI-generated insights, and ask questions about their reports using an intelligent chatbot and receive AI-powered metric extraction, patient-friendly explanations, clinical summaries, historical trends, report-based AI assistance, specialist recommendations, and nearby healthcare facility suggestions.

---

## ✨ Features

### 📄 AI- Powered Report Analysis

* Upload and analyze PDF-based medical and laboratory reports
    * Automatically extract important health metrics
    * Identify abnormal values and highlight potential concerns
    * Generate structured report insights using AI

        ### 🤖 AI-Powered Summaries

    * Patient-friendly summary for easier understanding
    * Clinical-style summary for detailed interpretation
    * Clear explanations of abnormal health metrics
    * Context-aware insights based on uploaded report data

        ### 💬 Report-Based AI Chatbot

        Ask questions directly about your uploaded health report.

        Example questions:

    * `What is my problem?`
    * `Which values are abnormal?`
    * `Explain my TSH level`
    * `Which specialist should I consult?`

        ### 📈 Historical Health Trends

    * Track health metrics across multiple reports
    * Visualize changes over time
    * Compare previous and current health values
    * Monitor important laboratory metrics


    ### 👨‍⚕️ Specialist Recommendations

    Health Sage maps abnormal health metrics to relevant healthcare specialists.

    Examples:

    | Health Metric        | Suggested Specialist            |
    | -------------------- | ------------------------------- |
    | TSH                  | Endocrinologist                 |
    | Cholesterol          | Cardiologist                    |
    | Blood Sugar          | Diabetologist / Endocrinologist |
    | Abnormal Blood Count | General Physician               |
    | Liver Metrics        | Gastroenterologist              |

    ### 🏥 Nearby Healthcare Suggestions

    * Find nearby hospitals and clinics
    * Get recommendations based on detected health concerns
    * Discover relevant healthcare facilities

    ### 🔐 Authentication & Security

    * User registration and login
    * JWT-based authentication
    * Protected API routes
    * Password hashing
    * Input validation
    * Environment variable protection

    ---

    # 🚀 Upcoming Features

    Health Sage is designed to expand beyond PDF laboratory reports.

    Future versions may include:

    ### 🖼️ Medical Image Analysis

    * X-Ray image analysis
    * MRI report and image explanation
    * CT Scan analysis
    * Ultrasound / Ultrasonography report explanation
    * Medical image-based AI insights

    ### 📷 Scan & Image Upload

    Users will be able to upload supported medical images and reports for AI-assisted explanation.

    ### 🧠 Enhanced AI Assistant

    * More context-aware medical report conversations
    * Better explanations for complex reports
    * Multi-report comparison
    * Personalized health trend analysis

    ### 📊 Advanced Health Dashboard

    * More detailed visualizations
    * Health history timeline
    * Metric comparison
    * Long-term health monitoring

---

# 🛠️ Tech Stack

## Backend

![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge\&logo=node.js\&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge\&logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge\&logo=mongoose\&logoColor=white)

### Backend Services

![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-File%20Upload-FF6B6B?style=for-the-badge)
![Zod](https://img.shields.io/badge/Zod-Validation-3068B7?style=for-the-badge)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-339933?style=for-the-badge\&logo=nodemailer\&logoColor=white)

## Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-Data%20Visualization-FF6384?style=for-the-badge\&logo=chart.js\&logoColor=white)

## AI Infrastructure

![Groq](https://img.shields.io/badge/Groq-AI%20Inference-F55036?style=for-the-badge)
![Llama](https://img.shields.io/badge/Llama_3.3_70B-AI%20Model-6B4FBB?style=for-the-badge)

## APIs & Healthcare Services

![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Location%20Data-7EBC6F?style=for-the-badge\&logo=openstreetmap\&logoColor=white)
![Geoapify](https://img.shields.io/badge/Geoapify-Location%20API-008CFF?style=for-the-badge)
![Wikidata](https://img.shields.io/badge/Wikidata-Knowledge%20Base-006699?style=for-the-badge\&logo=wikidata\&logoColor=white)

---
# 🏗️ Project Architecture

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
            ```

---
### 🔄 Application Workflow

```text
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
    ```

---
# 📡 API Overview
---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Rohitdas07/health-sage.git
```

```bash
cd health-sage
```

## 2. Setup Backend

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Run the backend:

```bash
npm run dev
```

The backend will run on:

```text
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

The application will be available at:

```text
http://localhost:5173
```
---
```


# 🧠 AI Capabilities

Health Sage uses AI to process medical report information and provide:

* Structured metric extraction
* Patient-friendly explanations
* Clinical summaries
* Abnormal value identification
* Context-aware report conversations
* Specialist recommendations

The AI system is designed to work with the information extracted from uploaded reports rather than generating completely unrelated responses.

---

# 📊 Supported Health Insights

Examples of metrics that can be tracked include:

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

Additional metrics can be supported as the application evolves.

---

### 🔮 Future Roadmap

### 🩻 Medical Image & Report Support

Future versions may include support for:

X-ray images and reports
CT Scan images and reports
MRI images and reports
Ultrasound / Ultrasonography images and reports
Medical image explanation using AI
Combined image and report analysis
Planned Workflow
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

   🌟 Additional Future Improvements

🎙️ Voice-based health assistant
🌐 Multi-language support
📈 Advanced health analytics
🔔 Personalized health reminders
👨‍⚕️ Doctor appointment integration
📱 Improved mobile experience

---

  🤝 Contributing

Contributions, feature suggestions, and improvements are welcome.

```bash
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Create a Pull Request
```

---

### 🔒 Security & Privacy

Health information is sensitive. The application includes:

* JWT authentication
* Password hashing
* Protected API routes
* Environment variable protection
* API key protection through .env
* Input validation

---

### 🎯 Project Goal

Health Sage aims to make complex medical information easier for everyday users to understand.

The platform focuses on helping users understand:

* What their health values mean
* Which values are abnormal
* How health metrics change over time
* What questions they can ask their doctor
* Which type of specialist may be relevant

---


# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Rohit Das**
Full-Stack Developer | AI Enthusiast

![GitHub](https://img.shields.io/badge/GitHub-Rohitdas07-181717?style=for-the-badge\&logo=github\&logoColor=white)
---

---

# 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/Rohitdas07/health-sage?style=for-the-badge\&logo=github)
![GitHub Forks](https://img.shields.io/github/forks/Rohitdas07/health-sage?style=for-the-badge\&logo=github)
![GitHub Issues](https://img.shields.io/github/issues/Rohitdas07/health-sage?style=for-the-badge\&logo=github)

---

<div align="center">

### Made with ❤️ for better health understanding

### ⭐ Star this repository if you find it helpful!

</div>
