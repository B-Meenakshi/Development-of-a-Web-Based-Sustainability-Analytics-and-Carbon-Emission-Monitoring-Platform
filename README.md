# CarbonTrack 🌱

### Track Today, Save Tomorrow

CarbonTrack is a web-based sustainability analytics and carbon emission monitoring platform designed to help users track their daily activities, understand their carbon footprint, and adopt more sustainable habits.

The platform provides carbon emission calculations, analytics, personalized recommendations, sustainability goals, achievements, peer benchmarking, notifications, AI-powered assistance, and role-based dashboards.

---

## 📁 Project Structure

```text
CarbonFootprintTracker/
│
├── README.md
│
├── carbon-backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
│
└── carbon-frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── ...
```

---

## ✨ Features

### 👤 User Features

- User registration and login
- Role-based authentication
- Activity logging
- Carbon emission calculation
- Activity history
- Daily, weekly, and monthly carbon analytics
- Category-wise emission analysis
- Sustainability goals
- Goal progress tracking
- Personalized sustainability recommendations
- AI-powered chatbot
- Peer benchmarking
- Badges and achievements
- Notifications
- Multilingual support
- Responsive user dashboard
- Progressive Web App (PWA) support

### 📊 Activity Categories

Carbon emissions can be tracked for different activity categories, including:

- 🚗 Transport
- ⚡ Electricity
- 🍽️ Food
- 🛍️ Shopping
- 🌱 Other Activities

Users can enter activity details and quantities, and the system calculates the corresponding carbon emissions in kg CO₂e.

---

## 🤖 AI-Powered Features

### AI Recommendations

The system analyzes a user's recent activities and provides personalized recommendations based on their carbon-emission patterns.

### AI Chatbot

The chatbot provides assistance related to CarbonTrack features and dashboard information.

The chatbot is designed according to the user's role and available dashboard information.

---

## 🎯 Sustainability Goals

Users can create and monitor sustainability goals.

The platform provides:

- Goal creation
- Progress tracking
- Goal completion status
- Notifications
- Achievement-related functionality

---

## 🏆 Badges and Achievements

CarbonTrack encourages sustainable behavior through achievement-based features.

Users can receive badges based on their sustainability activities and progress.

---

## 📈 Analytics Dashboard

The dashboard provides visual insights into carbon emissions.

Analytics include:

- Total carbon emissions
- Monthly carbon footprint
- Category-wise emissions
- Activity trends
- Progress toward sustainability goals
- Peer benchmarking

Charts and visualizations help users understand their environmental impact more easily.

---

## 👥 Role-Based Access

CarbonTrack supports multiple user roles.

### USER

Regular users can:

- Log activities
- View their carbon footprint
- Track goals
- View analytics
- Receive recommendations
- Use the AI chatbot
- View achievements and notifications

### ADMIN

Administrators can:

- Monitor registered users
- Manage users
- View system-level information
- Monitor activities and emissions
- Manage administrative functionality
- Access administrative analytics

### ORGANIZATION

Organization users can:

- Monitor organization employees
- View employee activities
- Analyze employee carbon emissions
- View category-wise organizational analytics
- Monitor sustainability performance

---

## 🏢 Organization Analytics

The organization dashboard provides organization-level sustainability information.

It can include:

- Employee count
- Employee activity data
- Total organization emissions
- Category-wise emissions
- Employee emission analysis
- Sustainability analytics

---

## 🔔 Notifications

CarbonTrack provides notifications for relevant user activities and system events.

Notifications can be used for:

- Sustainability goal updates
- Goal completion
- Support-related updates
- Other relevant CarbonTrack events

---

## 📱 Progressive Web App

CarbonTrack supports Progressive Web App functionality.

The PWA allows the application to provide an app-like experience through a supported web browser.

Features include:

- Installable web application
- Standalone display mode
- Responsive interface
- Mobile-friendly experience
- PWA manifest
- Service worker support

---

## 🌐 Multilingual Support

CarbonTrack includes multilingual functionality to make the platform more accessible to users from different language backgrounds.

---

# 🛠️ Technologies Used

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- React Router
- Recharts
- React Icons

## Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- REST APIs
- Maven

## Database

- MySQL

## AI

- Google Gemini API

## Development and Testing

- Visual Studio Code
- IntelliJ IDEA / Java development tools
- Postman
- Git
- GitHub

---

# 🏗️ System Architecture

The application follows a frontend-backend architecture.

```text
                  ┌──────────────────────┐
                  │      User / Admin    │
                  │    / Organization    │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   React Frontend     │
                  │      Vite            │
                  └──────────┬───────────┘
                             │
                       REST API Calls
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Spring Boot Backend │
                  │       Java           │
                  └──────────┬───────────┘
                             │
                  ┌──────────┴───────────┐
                  │                      │
                  ▼                      ▼
          ┌───────────────┐      ┌───────────────┐
          │    MySQL      │      │ Gemini AI API │
          │   Database    │      │               │
          └───────────────┘      └───────────────┘
```

---

# 🔐 Authentication and Security

CarbonTrack uses role-based authentication to provide different access levels for users, administrators, and organization users.

The application manages user information and uses role-based routing to provide appropriate dashboards and functionality.

---

# 🧮 Carbon Emission Calculation

CarbonTrack calculates carbon emissions using activity quantities and corresponding emission factors.

The general calculation is:

```text
Carbon Emission = Activity Quantity × Emission Factor
```

The calculated result is represented in:

```text
kg CO₂e
```

The emission data is then used for analytics, recommendations, goals, benchmarking, and dashboard visualizations.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following software is installed:

- Java 21
- Node.js
- npm
- MySQL 8+
- Git

---

# ⚙️ Backend Setup

Navigate to the backend folder:

```bash
cd carbon-backend
```

Configure the MySQL database and application properties according to your local environment.

Then start the Spring Boot application.

Using Maven:

```bash
mvn spring-boot:run
```

The backend normally runs on:

```text
http://localhost:8080
```

---

# 💻 Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd carbon-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

---

# 🗄️ Database

CarbonTrack uses MySQL for persistent data storage.

Create the required database before running the backend.

Example:

```sql
CREATE DATABASE carbon_tracker;
```

Database configuration should be added to the Spring Boot application configuration according to the local environment.

---

# 🔄 Application Flow

```text
User Login
     ↓
Role Verification
     ↓
Dashboard
     ↓
Log Activity
     ↓
Carbon Emission Calculation
     ↓
Store Activity in Database
     ↓
Analytics & Visualization
     ↓
Recommendations / Goals / Achievements
```

---

# 🧪 Testing

The application can be tested using:

- Postman for REST API testing
- Browser-based frontend testing
- Backend integration testing
- Authentication and authorization testing
- Activity calculation testing
- Dashboard and analytics testing
- Role-based access testing

---

# 📌 Main Modules

| Module | Description |
|---|---|
| Authentication | User registration, login and role-based access |
| Activity Logging | Records daily sustainability activities |
| Emission Calculation | Calculates carbon emissions in kg CO₂e |
| Activity History | Displays previously recorded activities |
| Analytics | Provides carbon emission insights and charts |
| Sustainability Goals | Tracks environmental goals and progress |
| Recommendations | Provides personalized sustainability suggestions |
| AI Chatbot | Provides CarbonTrack-related assistance |
| Badges & Achievements | Encourages sustainable behavior |
| Peer Benchmarking | Allows users to compare sustainability metrics |
| Notifications | Provides relevant system and goal updates |
| Organization Dashboard | Provides employee and organization analytics |
| Admin Dashboard | Provides administrative monitoring |
| PWA | Provides an installable app-like web experience |
| Multilingual Support | Improves accessibility for different users |

---

# 🌱 Sustainability Impact

CarbonTrack aims to make carbon footprint tracking easier and more understandable for individuals and organizations.

By providing measurable carbon-emission information, analytics, goals, and personalized recommendations, the platform encourages users to understand their environmental impact and make more informed sustainability decisions.

---

# 🔮 Future Scope

Potential future enhancements include:

- Integration with wearable and IoT devices
- Automated activity tracking
- More detailed organizational sustainability reports
- Advanced AI-based sustainability insights
- Integration with additional environmental datasets
- Improved carbon-offset tracking
- Expanded multilingual support
- Cloud deployment and scalable infrastructure
- Advanced sustainability reporting

---

# 👩‍💻 Project

**Project Name:** CarbonTrack

**Project Title:** Development of a Web-Based Sustainability Analytics and Carbon Emission Monitoring Platform

**Internship:** Infosys Springboard Virtual Internship 7.0

**Batch:** Batch 3

**Duration:** 8 Weeks

---

# 📄 License

This project was developed as part of the Infosys Springboard Virtual Internship 7.0 program for educational and project-development purposes.

---

## 🌿 CarbonTrack

### Track Today, Save Tomorrow
