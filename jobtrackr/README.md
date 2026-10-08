# JobTrackr

**Track. Apply. Follow Up. Get Hired.**

JobTrackr is a full-stack **Job Application Tracking System**. Users create an account and manage their
whole job search from one dashboard: add applications, search and filter them, change statuses, add
interview details and follow-up dates, and see live statistics and reminders.

Built as a Python Full Stack Developer portfolio project with **Django + Django REST Framework + MySQL + React**.

---

## Features

- Register, login (username **or** email), logout with JWT authentication
- Dashboard: statistic cards, status chart, recent applications, upcoming follow-ups (all calculated from the database)
- Full CRUD for job applications (view, add, edit, delete with confirmation)
- Search (company, job title, location) and filters (status, job type, location, application-date range) handled by the backend
- Pagination (10 per page) and responsive table / mobile card layout
- Quick status change on the details page
- Reminders page: today's, overdue and upcoming follow-ups, plus upcoming interviews
- Profile page (update name, username, email)
- Strict data isolation: every user can only see and change **their own** applications
- Django admin for users and applications
- 22 automated backend tests, sample-data management command

## Technology stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.12+, Django 5.2, Django REST Framework, django-cors-headers, SimpleJWT |
| Database | MySQL 8 (driver: PyMySQL) |
| Frontend | React 18, React Router 6, Axios, Bootstrap 5, Recharts, Vite |
| Tools | Git, GitHub, VS Code, Postman |

## Project architecture

```
jobtrackr/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── jobtrackr/                 # project settings, root urls
│   └── applications/              # the app
│       ├── models.py              # JobApplication model
│       ├── serializers.py         # JSON <-> model + validation
│       ├── views.py               # API endpoints
│       ├── urls.py                # /api/... routes
│       ├── permissions.py         # IsOwner permission
│       ├── exceptions.py          # clean JSON errors
│       ├── admin.py
│       ├── tests.py               # 22 tests
│       └── management/commands/seed_sample_data.py
├── frontend/
│   ├── package.json, vite.config.js, index.html
│   └── src/
│       ├── api/api.js             # ALL backend calls + token handling
│       ├── context/AuthContext.js # logged-in user state
│       ├── components/            # Navbar, Sidebar, Layout, StatusBadge, forms, ...
│       ├── pages/                 # Login, Register, Dashboard, Applications, ...
│       ├── styles/                # global.css, dashboard.css, forms.css
│       └── utils/                 # auth.js (tokens), format.js, constants.js
└── README.md
```

> **Why Vite instead of Create React App?** Create React App is deprecated and no longer maintained.
> Vite is the modern replacement; `npm start` still works and the app still runs on `http://localhost:3000`.
> That is also why `index.html` sits in the `frontend/` folder instead of `frontend/public/`.

## Screenshots

_Add your screenshots here after running the project (login, dashboard, applications, details, reminders)._

---

## 1. Database setup (MySQL)

1. Install **MySQL Server 8** (https://dev.mysql.com/downloads/mysql/) and remember the `root` password you choose.
2. Create the database (MySQL Workbench or the `mysql` command line):

   ```sql
   CREATE DATABASE jobtrackr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Django creates all tables for you in step 2 below (migrations). You never create tables by hand.

## 2. Backend setup (Django)

```bash
cd backend
python -m venv venv

# Windows (Command Prompt / PowerShell)
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create your environment file:

```bash
# Windows
copy .env.example .env
# macOS / Linux
cp .env.example .env
```

Open `.env` and set at least `DB_PASSWORD` and `SECRET_KEY`. Generate a secret key with:

```bash
python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
```

Then:

```bash
python manage.py makemigrations     # (the migration file is already included; this says "No changes detected")
python manage.py migrate            # creates the tables in MySQL
python manage.py createsuperuser    # optional: admin login
python manage.py runserver
```

Backend: **http://127.0.0.1:8000/** (API under `/api/`, admin at `/admin/`)

## 3. Frontend setup (React)

Open a **second** terminal:

```bash
cd frontend
npm install
npm start
```

Frontend: **http://localhost:3000/**

The frontend talks to `http://127.0.0.1:8000/api` by default. If your backend is elsewhere, copy
`frontend/.env.example` to `frontend/.env` and change `VITE_API_URL`.

## Environment variables (`backend/.env`)

| Variable | Meaning | Example |
|----------|---------|---------|
| `SECRET_KEY` | Django secret key (required when `DEBUG=False`) | long random string |
| `DEBUG` | `True` for development | `True` |
| `ALLOWED_HOSTS` | Hosts allowed to serve the app | `127.0.0.1,localhost` |
| `DB_NAME` | MySQL database name | `jobtrackr` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | _(yours)_ |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed to call the API | `http://localhost:3000,http://127.0.0.1:3000` |

Never commit `.env` (it is in `.gitignore`).

## API endpoints

All endpoints except register/login/logout/token-refresh need the header `Authorization: Bearer <access_token>`.

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/register/` | Create account (first_name, last_name, email, username, password, confirm_password) |
| POST | `/api/login/` | Body `{username, password}` (username may be an email). Returns `access`, `refresh`, `user` |
| POST | `/api/logout/` | Body `{refresh}`. Blacklists the refresh token |
| POST | `/api/token/refresh/` | Body `{refresh}`. Returns a new `access` token |
| GET | `/api/applications/` | List **your** applications. Query: `search`, `status`, `job_type`, `location`, `date_from`, `date_to`, `ordering`, `page` |
| POST | `/api/applications/` | Create an application |
| GET | `/api/applications/<id>/` | One application |
| PUT / PATCH | `/api/applications/<id>/` | Replace / partially update |
| DELETE | `/api/applications/<id>/` | Delete (204) |
| GET | `/api/dashboard/` | Stats, chart data, recent applications, upcoming follow-ups |
| GET | `/api/reminders/` | Today's / overdue / upcoming follow-ups and interviews |
| GET / PUT | `/api/profile/` | Read / update your profile |

Status values: `applied`, `under_review`, `shortlisted`, `interview`, `selected`, `rejected`, `withdrawn`.
Job type values: `full_time`, `part_time`, `internship`, `contract`, `freelance`.

HTTP codes used: 200, 201, 204, 400 (validation), 401 (not logged in / bad token), 404 (not found / not yours), 500 (server error, generic message).

## Sample data (optional)

Nothing is inserted automatically. To add demo data (TCS, Infosys, Wipro, Accenture, Cognizant, Deloitte, Tech Mahindra, ...):

```bash
python manage.py seed_sample_data                    # creates user "demo" (password: Demo@12345) with 8 applications
python manage.py seed_sample_data --username prem    # add the data to an existing user instead
python manage.py seed_sample_data --clear            # remove that user's applications first
```

Sample credentials exist **only** if you run this command: `demo` / `Demo@12345`.

## Running the tests

```bash
cd backend
python manage.py test
```

Django creates a separate `test_jobtrackr` database, so your real data is never touched
(the MySQL user needs permission to create databases; `root` has it).
The tests cover registration, login, logout, create/list/retrieve/update/delete, validation, search & filters,
dashboard statistics, reminders, profile, unauthorized access and ownership protection.

## Common errors and solutions

| Problem | Solution |
|---------|----------|
| `Access denied for user 'root'@'localhost'` | Wrong `DB_USER`/`DB_PASSWORD` in `.env`. |
| `Unknown database 'jobtrackr'` | Run `CREATE DATABASE jobtrackr ...;` first (step 1). |
| `Can't connect to MySQL server on 'localhost'` | MySQL service is not running (Windows: Services -> MySQL80 -> Start). Check `DB_HOST`/`DB_PORT`. |
| `RuntimeError: 'cryptography' package is required for sha256_password or caching_sha2_password` | Run `pip install -r requirements.txt` again (it installs `cryptography`). |
| `Did you install mysqlclient?` | Not needed: this project uses PyMySQL (set up in `backend/jobtrackr/__init__.py`). |
| `ModuleNotFoundError: No module named 'django'` | Activate the virtual environment, then `pip install -r requirements.txt`. |
| `SECRET_KEY environment variable is required` | Create `backend/.env` from `.env.example` (or keep `DEBUG=True` for local development). |
| Browser console shows a **CORS error** | Open the frontend on `http://localhost:3000` (or `127.0.0.1:3000`) and keep both in `CORS_ALLOWED_ORIGINS`; restart Django after changing `.env`. |
| "Cannot reach the server" in the app | Backend is not running on port 8000, or `VITE_API_URL` is wrong. |
| `Port 3000 is already in use` | Close the other app using port 3000 and run `npm start` again. |
| Login works but pages show "session expired" | Access tokens last 30 min; refresh happens automatically. If it still fails, log in again. |

## How the project works (interview guide)

1. **Why Django?** Batteries included: ORM, migrations, authentication/users, admin panel, security defaults (password hashing, SQL-injection protection through the ORM).
2. **Why Django REST Framework?** Turns Django into a JSON API quickly: serializers (validation + conversion), generic views, permissions, pagination, status codes.
3. **How does React talk to Django?** React runs in the browser on port 3000 and sends HTTP requests (Axios) to `http://127.0.0.1:8000/api/...`. Django answers with JSON. CORS settings tell Django that port 3000 is allowed.
4. **How do REST APIs work?** URLs represent resources (`/api/applications/5/`), HTTP methods are the actions (GET read, POST create, PUT/PATCH update, DELETE remove), and status codes say what happened.
5. **How is MySQL connected?** `settings.py` -> `DATABASES` reads `DB_*` values from `.env`. PyMySQL is the driver; Django's ORM turns model classes (`JobApplication`) into tables via migrations.
6. **How does authentication work?** Login checks the password and returns two JWTs: a short-lived *access* token (30 min) and a *refresh* token (7 days). React stores them and Axios adds `Authorization: Bearer <access>` to every request (`api/api.js`). When the access token expires, an interceptor silently requests a new one. Logout blacklists the refresh token.
7. **How does CRUD work?** `ApplicationListCreateView` (list + create) and `ApplicationDetailView` (retrieve, update, delete) use `JobApplicationSerializer`. The React pages call `applicationsAPI.list/create/update/remove`.
8. **How is user data protected?** The views always start from `JobApplication.objects.filter(user=request.user)`, so another user's id simply gives **404**. The owner is set on the server from the token (never from the request body), and an `IsOwner` permission adds a second safety net. Tests prove it.
9. **How are dashboard statistics calculated?** `DashboardView` runs one `GROUP BY status` query (`values('status').annotate(Count('id'))`) and returns the numbers; nothing is hard-coded.
10. **How do search and filtering work?** React sends query parameters (`?search=tcs&status=interview`). The view adds `.filter(...)` calls to the queryset (`icontains` for text search with `Q` objects), so MySQL does the work and pagination stays correct.
11. **How do follow-up reminders work?** Compare `follow_up_date` with today's date (`timezone.localdate()`): equal = today, smaller = overdue, larger = upcoming. Closed applications (selected / rejected / withdrawn) are skipped. Interviews use `interview_date >= now`.
12. **How are the frontend components structured?** `pages/` are full screens, `components/` are reusable pieces (`ApplicationForm` is shared by Add and Edit), `context/AuthContext` holds the logged-in user, `ProtectedRoute` guards private pages, `api/api.js` is the only file that knows backend URLs.

## Future improvements

- Email or push notifications for follow-ups and interviews
- Calendar view and `.ics` export
- File uploads (resume / cover letter per application)
- Status history timeline
- Kanban board with drag and drop
- CSV export, Docker setup and CI (GitHub Actions)
- httpOnly-cookie authentication for production hardening
