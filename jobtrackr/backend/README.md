# JobTrackr Backend (Django + DRF + MySQL)

Quick start (details in the root `README.md`):

```bash
python -m venv venv
venv\Scripts\activate            # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env           # macOS/Linux: cp .env.example .env  (then edit DB_PASSWORD, SECRET_KEY)
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- API root: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/
- Tests: `python manage.py test`
- Sample data: `python manage.py seed_sample_data`
