# Daily Review (JWT)

1日1件の振り返りを記録できるシンプルなWebアプリです。  
JWT認証でログインし、日付を切り替えて **作成（POST）/ 更新（PATCH）** できます。

> ✅ 仕様のポイント  
> - **(user, date) をDB制約で一意**にし、1日1件を保証  
> - 同日作成（POST）で重複した場合は **自動で更新（PATCH）** に切り替えて保存

---

## Demo / Screenshot
`![](docs/screenshot.png)`

---

## Features
- JWTログイン（access/refresh、localStorageに保存して復帰）
- 日付切り替え（前日/翌日、date picker）
- 1日1件の振り返り（title / good / bad / next / mood 1〜5）
- 自分の記録のみ閲覧・編集（認可）
- 同日重複時（POST）は自動PATCHで更新（UX改善）

---

## Tech Stack
- Frontend: React (Vite)
- Backend: Django / Django REST Framework / SimpleJWT

---

## API（主要）
- `POST /api/token/` ログイン（access/refresh発行）
- `POST /api/token/refresh/` access再発行
- `GET /api/entries/` 一覧（自分のもののみ）
- `POST /api/entries/` 作成
- `PATCH /api/entries/:id/` 更新

---

## Setup

### 1) Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver