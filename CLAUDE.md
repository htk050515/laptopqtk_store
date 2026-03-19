# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

E-commerce platform (phone/laptop store) with a separated backend API and frontend SPA.

- **Backend**: Django 4.2 + Django REST Framework API at `BE/laptop_store/`
- **Frontend**: React 18 + Vite SPA at `FE/laptop-store/`
- **Auth**: Token-based authentication with role-based access (admin/customer)
- **Payment**: VNPay integration for invoice payments
- **AI**: Gemini API for chatbot, scikit-learn for product recommendations

## Commands

### Backend (from `BE/laptop_store/`)

```bash
source venv/Scripts/activate       # Activate virtual environment (Windows Git Bash)
pip install -r requirements.txt    # Install Python dependencies
python manage.py migrate           # Run database migrations
python manage.py runserver         # Start dev server (port 8000)
python manage.py test              # Run tests
python manage.py createsuperuser   # Create admin user
```

### Frontend (from `FE/laptop-store/`)

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server (port 3000)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Architecture

### Backend

- **Django Apps** (`apps/`): accounts, catalog, cart, orders, reviews, dashboard, chatbot, recommendations
- **URLs**: Each app has its own `urls.py`, included from `laptop_store/urls.py`
- **Settings**: `laptop_store/settings.py` — uses `python-dotenv` for env config
- **Middleware**: Custom middleware in `middleware/`
- **Storage**: Product/category/variation images stored in `storage/` directory
- **Async**: Celery + Redis for background tasks (optional)

### Frontend

- **Entry**: `src/App.jsx` defines all routes wrapped in `AuthProvider` context.
- **State Management**: `src/Contexts/AuthContext.jsx` — React Context API for auth state (user, login, logout). Tokens stored in localStorage via `src/utils/auth.js`.
- **API Layer**: `src/api/` — separated into `AdminApi/`, `UserApi/`, and `PublicApi/` modules using Axios. Base URL configured via `REACT_APP_API_URL` env var (default: `http://localhost:8000`).
- **Routing**: `src/constants/path.jsx` defines all route paths. Protected routes use `PrivateRouter` components (`AdminRoute`, `CustomerRoute`, `PublicRoute`) in `src/components/PrivateRouter/`.
- **Pages**: `src/pages/` — organized by feature (Home, ProductDetail, Cart, Checkout, Profile, HistoryOrder, admin management pages under Manage* directories).
- **Styling**: Tailwind CSS with custom config (Nunito font, custom spacing/shadows in `tailwind.config.js`).

### Database

MySQL database `ecommerce_laptop_store`. Django migrations in each app's `migrations/` directory cover: users (with role/status), categories, products (with slug, featured, status), product_images, product_variations, attribute_types, attribute_values, variation_attributes, variation_images, inventory, cart_items, orders, order_items, invoices, reviews, review_replies, statistics.

## Environment Configuration

- Backend `.env` (`BE/laptop_store/.env`): MySQL config (root, no password, localhost:3306), storage path, VNPay keys, Celery/Redis URL, Gemini API key.
- Frontend `.env` (`FE/laptop-store/.env`): `PORT=3000`, `REACT_APP_API_URL=http://localhost:8000`.
