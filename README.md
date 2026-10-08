# 💼 JobTrackr

### Full-Stack Job Application Tracking System

A full-stack **Job Application Tracking System** developed using **Python, Django, React, and MySQL** that helps users organize, manage, and track their job applications from a centralized dashboard.

JobTrackr allows users to add job applications, update application statuses, manage company and job details, track interview progress, set reminders, and monitor their overall job search activity.

---

## 📌 Project Overview

**JobTrackr** is designed to simplify the job search process by providing a centralized platform for managing multiple job applications.

Instead of maintaining job applications manually in spreadsheets or notes, users can store and manage all their applications in one place.

The application provides features such as:

* User registration and login
* Job application management
* Application status tracking
* Company and job details
* Interview tracking
* Follow-up reminders
* Dashboard statistics
* CRUD operations
* REST API integration
* MySQL database management

The project follows a modern **full-stack architecture** with a Python-based backend, React frontend, REST APIs, and MySQL database.

---

# 🎯 Objectives

The main objectives of JobTrackr are:

* 💼 Manage job applications efficiently
* 📊 Track the status of every application
* 🏢 Store company and job information
* 📅 Track interview and follow-up dates
* 🔔 Manage application reminders
* 📈 Provide job search statistics
* 🔐 Provide secure user authentication
* 💾 Store application data in a centralized database
* ⚡ Reduce manual job tracking
* 🚀 Improve the overall job search experience

---

# ✨ Key Features

## 👤 User Features

✔ User Registration
✔ User Login
✔ Session-Based Authentication
✔ User Dashboard
✔ User Logout
✔ Profile Management

---

## 💼 Job Application Management

✔ Add Job Application
✔ View Job Applications
✔ Update Job Applications
✔ Delete Job Applications
✔ Search Job Applications
✔ Filter Job Applications
✔ Store Company Details
✔ Store Job Role
✔ Store Job Location
✔ Store Job Description
✔ Store Application Date
✔ Store Job URL

---

## 📊 Application Status Tracking

Users can track applications using different statuses:

```text
Applied
   ↓
Under Review
   ↓
Shortlisted
   ↓
Interview
   ↓
Selected / Rejected
```

Example statuses:

* 📨 Applied
* 🔍 Under Review
* 📋 Shortlisted
* 📞 Interview
* ✅ Selected
* ❌ Rejected
* ⏸️ On Hold

---

## 📅 Interview & Reminder Management

Users can keep track of important job-related dates such as:

* Interview Date
* Follow-up Date
* Application Deadline
* Reminder Date

This helps users avoid missing important job-search activities.

---

# 📊 Dashboard

The JobTrackr dashboard provides an overview of the user's job search activity.

Example dashboard statistics:

```text
╔════════════════════════════════════╗
║          JOBTRACKR DASHBOARD       ║
╠════════════════════════════════════╣
║ Total Applications     : 25        ║
║ Applied                : 10        ║
║ Under Review           : 5         ║
║ Shortlisted            : 4         ║
║ Interviews             : 3         ║
║ Selected               : 1         ║
║ Rejected               : 2         ║
╚════════════════════════════════════╝
```

The dashboard helps users understand their job search progress at a glance.

---

# 🔄 Application Workflow

The basic JobTrackr workflow is:

```text
Register
   ↓
Login
   ↓
Dashboard
   ↓
Add Job Application
   ↓
Store Job Details
   ↓
Track Application Status
   ↓
Update Status
   ↓
Schedule Interview / Reminder
   ↓
Monitor Job Search Progress
```

---

# 🏗️ System Architecture

JobTrackr follows a full-stack architecture:

```text
                ┌─────────────────────┐
                │        User         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   React Frontend    │
                │   HTML / CSS / JS   │
                └──────────┬──────────┘
                           │
                           │ HTTP Requests
                           ▼
                ┌─────────────────────┐
                │    REST API Layer   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Python Backend      │
                │ Django / REST API   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │       MySQL         │
                │      Database       │
                └─────────────────────┘
```

---

# 🛠️ Technologies Used

## 💻 Backend

* Python
* Django
* Django REST Framework
* RESTful APIs
* Django ORM

## 🎨 Frontend

* React JS
* JavaScript
* HTML5
* CSS3
* Bootstrap

## 🗄️ Database

* MySQL

## 🔧 Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman
* MySQL Workbench

---

# 📂 Project Structure

```text
JobTrackr/
│
├── backend/
│   │
│   ├── manage.py
│   │
│   ├── JobTrackr/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   └── jobs/
│       ├── migrations/
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── urls.py
│       ├── views.py
│       └── tests.py
│
├── frontend/
│   │
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── assets/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── .gitignore
├── requirements.txt
└── README.md
```

> **Note:** Update the folder structure according to your actual GitHub project structure.

---

# 🗄️ Database Design

JobTrackr uses **MySQL** to store user and job application information.

## 👤 User

Stores user information such as:

```text
User
├── ID
├── Name
├── Email
├── Password
└── Created Date
```

---

## 💼 Job Application

Stores information about each job application:

```text
JobApplication
├── ID
├── User
├── Company Name
├── Job Title
├── Job Location
├── Job Type
├── Job URL
├── Job Description
├── Application Date
├── Status
├── Interview Date
├── Follow-up Date
├── Notes
└── Created Date
```

---

## 📊 Application Status

The application status represents the current stage of a job application.

```text
Applied
Under Review
Shortlisted
Interview
Selected
Rejected
On Hold
```

---

# 🔐 Authentication

JobTrackr provides authentication functionality to protect user data.

The authentication workflow is:

```text
                ┌─────────────┐
                │    User     │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        ┌───────────┐     ┌───────────┐
        │ Register  │     │   Login   │
        └─────┬─────┘     └─────┬─────┘
              │                 │
              └────────┬────────┘
                       ▼
                ┌──────────────┐
                │  Dashboard   │
                └──────────────┘
```

Users can:

* Create an account
* Log in
* Access their dashboard
* Manage their applications
* Log out

---

# 💼 Job Application Management

Users can create a new job application by entering details such as:

```text
Company Name
Job Title
Location
Job Type
Job URL
Application Date
Status
Interview Date
Follow-up Date
Notes
```

Example:

```text
Company       : ABC Technologies
Job Role      : Python Developer
Location      : Pune
Job Type      : Full Time
Status        : Interview
Applied Date  : 05/10/2026
Interview     : 15/10/2026
```

---

# 🔄 CRUD Operations

JobTrackr implements complete **CRUD operations** for job applications.

### Create

Users can add new job applications.

### Read

Users can view their saved applications.

### Update

Users can update:

* Job details
* Application status
* Interview information
* Follow-up dates
* Notes

### Delete

Users can remove applications that are no longer required.

```text
CREATE
   ↓
READ
   ↓
UPDATE
   ↓
DELETE
```

---

# 🌐 REST API

The backend provides REST APIs for communication between the React frontend and Python backend.

Example API structure:

```text
/api/
│
├── register/
├── login/
├── logout/
│
├── jobs/
│   ├── GET
│   ├── POST
│   ├── PUT
│   └── DELETE
│
└── dashboard/
```

Example API operations:

```text
GET     /api/jobs/
POST    /api/jobs/
GET     /api/jobs/<id>/
PUT     /api/jobs/<id>/
DELETE  /api/jobs/<id>/
```

The APIs can be tested using **Postman**.

---

# 📊 Dashboard Statistics

The dashboard can provide useful job-search statistics such as:

```text
Total Applications
        │
        ├── Applied
        ├── Under Review
        ├── Shortlisted
        ├── Interview
        ├── Selected
        ├── Rejected
        └── On Hold
```

This provides users with a quick overview of their current job search.

---

# 🔎 Search & Filtering

Users can easily find applications using search and filtering functionality.

Possible filters include:

* Company Name
* Job Title
* Location
* Application Status
* Job Type
* Application Date

Example:

```text
Search: Python Developer

        ↓

Python Developer
Python Backend Developer
Python Full Stack Developer
Django Developer
```

---

# 📅 Reminder & Follow-Up Tracking

JobTrackr helps users keep track of follow-ups and interviews.

Example:

```text
Company: ABC Technologies

Interview:
15 October 2026

Follow-up:
18 October 2026

Status:
Interview
```

This makes it easier to organize multiple job applications.

---

# 🗄️ MySQL Configuration

Create a MySQL database:

```sql
CREATE DATABASE JobTrackr;
```

Configure the database in:

```text
settings.py
```

Example:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'JobTrackr',
        'USER': 'root',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

> Replace `your_password` with your MySQL password.

---

# 📦 Backend Installation

Clone the repository:

```bash
git clone https://github.com/premspatil/JobTrackr.git
```

Navigate to the project:

```bash
cd JobTrackr
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

---

# 🔄 Run Migrations

Execute:

```bash
python manage.py makemigrations
```

Then:

```bash
python manage.py migrate
```

---

# ▶️ Run Backend

Start the Django development server:

```bash
python manage.py runserver
```

Backend will be available at:

```text
http://127.0.0.1:8000/
```

---

# 🎨 Run Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

---

# 🧪 Testing

The following functionalities can be tested:

## 👤 Authentication Testing

* User registration
* User login
* Invalid login validation
* Logout
* Protected dashboard access

## 💼 Job Application Testing

* Add job application
* View applications
* Update application
* Delete application
* Search applications
* Filter applications
* Update application status

## 📊 Dashboard Testing

* Total application count
* Status-wise application count
* Application statistics
* Recent applications

## 🌐 API Testing

REST APIs can be tested using **Postman**.

Test:

```text
GET
POST
PUT
DELETE
```

---

# 🖥️ Application Screenshots

## 🔐 Login Page

```text
![Login Page](screenshots/login.png)
```

---

## 📊 Dashboard

```text
![Dashboard](screenshots/dashboard.png)
```

---

## 💼 Job Applications

```text
![Job Applications](screenshots/job-applications.png)
```

---

## ➕ Add Job Application

```text
![Add Job](screenshots/add-job.png)
```

---

## ✏️ Update Application

```text
![Update Application](screenshots/update-job.png)
```

---

## 📈 Application Statistics

```text
![Statistics](screenshots/statistics.png)
```

> Add your actual screenshots to the `screenshots/` folder and update the image names if required.

---

# 🔒 Security Features

The application provides basic security features including:

* 🔐 User authentication
* 🔑 Password-based login
* 🚪 Logout functionality
* 👤 User-specific application data
* 🛡️ API validation
* 🔒 Protected routes
* 🗄️ Database-backed data management
* ✅ Server-side validation

---

# 🚀 Future Enhancements

The project can be enhanced with the following features:

* 📧 Email notifications
* 🔔 Automatic job reminders
* 📅 Calendar integration
* 📄 Resume management
* 🔗 Job portal integration
* 🤖 AI-powered job recommendations
* 📝 Resume-to-job matching
* 📊 Advanced analytics
* 📈 Application success-rate analysis
* 📱 Mobile application
* 🌐 Chrome extension
* ☁️ Cloud deployment
* 🔐 JWT authentication
* 👥 Multi-user collaboration
* 📤 Export applications to Excel/CSV
* 📄 Generate job-search reports

---

# 💡 Advantages

✔ Centralized job application management
✔ Easy application status tracking
✔ User-friendly dashboard
✔ CRUD-based application management
✔ Search and filtering
✔ Interview and follow-up tracking
✔ REST API integration
✔ MySQL database integration
✔ Full-stack architecture
✔ Scalable application structure
✔ Reduces manual job tracking

---

# 🎓 Learning Outcomes

Through this project, I gained practical experience in:

* Python Programming
* Django Web Development
* Django REST Framework
* REST API Development
* React JS
* JavaScript
* MySQL Database Management
* CRUD Operations
* Authentication
* Session Management
* API Integration
* Database Integration
* Frontend Development
* Backend Development
* HTTP Methods
* JSON Data Handling
* Git & GitHub
* Postman API Testing
* Full-Stack Application Development

---

# 📌 Project Highlights

```text
🐍 Python
🌐 Django
⚛️ React JS
🔗 REST APIs
🗄️ MySQL
🔐 Authentication
💼 Job Application Tracking
📊 Dashboard
📈 Application Statistics
🔎 Search & Filtering
📅 Interview Tracking
🔔 Reminder Management
✏️ CRUD Operations
🧪 API Testing
💻 Full-Stack Web Application
```

---

# 📄 License

This project is created for **educational and portfolio purposes**.

You are welcome to explore the project and learn from the implementation.

---

# 👨‍💻 Author

### Prem Patil

**B.Tech Computer Engineering | Python Full Stack Developer**

GitHub: [github.com/premspatil](https://github.com/premspatil)

---

### 🚀 Built with Python, Django, React & MySQL ❤️
