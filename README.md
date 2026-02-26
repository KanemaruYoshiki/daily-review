# Daily Review (JWT)

1日1件の振り返りを記録できるシンプルなWebアプリです。  
JWT認証でログインし、日付を切り替えて POST（新規）/ PATCH（更新）で保存できます。

## Features
- JWTログイン（access/refresh）
- 日付切り替え（前日/翌日、date picker）
- 1日1件の記録（title / good / bad / next / mood 1〜5）
- 自分の記録だけ閲覧・編集（認可）
- (user, date) をDBで一意制約（事故防止）

## Tech Stack
- Frontend: React (Vite)
- Backend: Django / Django REST Framework / SimpleJWT

## Setup

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm i
cp .env.example .env
npm run dev
```

## ENV

Frontend uses:
- `VITE_API_BASE` (example in `frontend/.env.example`)