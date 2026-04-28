# 👗 Outfitly

Outfitly to inteligentna platforma do zarządzania wirtualną garderobą. Aplikacja wykorzystuje model **Gemini 3 Flash** do automatycznej analizy obrazu, kategoryzacji ubrań oraz generowania spersonalizowanych propozycji stylizacji na podstawie posiadanych zasobów.

## 🚀 Stack Technologiczny

- **Frontend:** React + Vite (Tailwind CSS)
- **Backend:** Django REST Framework
- **Baza Danych:** PostgreSQL 15
- **AI Integration:** Google Gemini 3 Flash (Multimodal)
- **Konteneryzacja:** Docker & Docker Compose

## 🛠️ Instrukcja Instalacji i Pełna Konfiguracja

Projekt jest w pełni kontenerowy. Całe środowisko (Python, Node.js, Postgres) jest odizolowane i nie wymaga instalacji dodatkowych narzędzi na systemie hosta poza Dockerem.

### 1. Klonowanie repozytorium
```bash
git clone https://github.com/CardBid/cardbid-core.git
cd outfitly
```

### 2. Konfiguracja Zmiennych Środowiskowych (.env)
Aplikacja przechowuje wrażliwe dane w pliku `.env`. Przed uruchomieniem musisz stworzyć ten plik w folderze `backend/`:

```bash
# Skopiuj szablon
cp backend/.env.example backend/.env
```

Następnie edytuj plik `backend/.env` i upewnij się, że zawiera poniższe dane:

```plaintext
SECRET_KEY=twoj_wygenerowany_klucz_django
DEBUG=True
DB_NAME=outfitly_db
DB_USER=user
DB_PASSWORD=pass
DB_HOST=db
DB_PORT=5432
GEMINI_API_KEY=wklej_tutaj_klucz_z_google_ai_studio
```

*Klucz Gemini wygenerujesz bezpłatnie na stronie [Google AI Studio](https://aistudio.google.com/).*

### 3. Uruchomienie Infrastruktury (Docker)
W głównym folderze projektu uruchom budowanie i start kontenerów:

```bash
docker compose up -d --build
```

### 4. Inicjalizacja Bazy Danych
Zastosuj migracje, aby stworzyć tabele w bazie PostgreSQL:

```bash
docker compose exec backend python manage.py migrate
```

### 5. Tworzenie Konta Administratora
Aby zarządzać ubraniami przez panel WWW, stwórz konto:

```bash
docker compose exec backend python manage.py createsuperuser
```

## 🌐 Dostęp do Usług

- **Aplikacja Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000/api/](http://localhost:8000/api/)
- **Panel Admina Django:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

## 📂 Struktura Projektu

- `/backend` — Kod źródłowy API (Django).
  - `/api` — Modele szafy, widoki API i serwis Gemini AI.
  - `/core` — Główna konfiguracja projektu.
  - `/media` — Przechowywanie zdjęć ubrań (wolumen Dockerowy).
- `/frontend` — Kod źródłowy aplikacji klienckiej (React).
  - `/src` — Komponenty i logika UI.
- `docker-compose.yml` — Definicja orkiestracji usług (Frontend, Backend, Database).

## 🤖 Funkcje AI (Gemini 3 Flash)

Aplikacja integruje się z modelem Gemini w celu:

- **Automatycznej kategoryzacji:** Rozpoznawanie typu odzieży, koloru i materiału na podstawie przesłanego zdjęcia.
- **Sugestii Outfitów:** Generowanie zestawów ubrań na podstawie okazji (np. praca, randka, siłownia) przy użyciu analizy posiadanej garderoby.

## 🔐 Autoryzacja
Większość endpointów wymaga nagłówka: `Authorization: Bearer <access_token>`

| Endpoint | Metoda | Opis |
| :--- | :--- | :--- |
| `/auth/login/` | `POST` | Pobranie tokenów (Login + Hasło) |
| `/auth/refresh/` | `POST` | Odświeżenie wygasłego tokena Access |
| `/auth/logout/` | `POST` | Wylogowanie |

---

## 👕 Zarządzanie Szafą (Wardrobe CRUD)

| Endpoint | Metoda | Opis | Uwagi |
| :--- | :--- | :--- | :--- |
| `/clothes/` | `GET` | Lista wszystkich ubrań użytkownika | Zawiera linki do zdjęć i tagi |
| `/clothes/<id>/` | `GET` | Detale ubrania | Pobiera dane konkretnej sztuki |
| `/clothes/<id>/` | `DELETE` | Usunięcie ubrania | Czyści rekord i plik z serwera |
| `/clothes/upload/` | `POST` | **AI Upload** (Prześlij zdjęcie) | Gemini automatycznie opisuje i taguje ciuch |
| `/clothes/manual/` | `POST` | Ręczne dodanie ubrania | Pomija analizę AI |
| `/clothes/<id>/update/` | `PUT` | Edycja danych ubrania | Poprawka koloru, opisu lub kategorii |

> **🛡️ AI Bouncer:** Jeśli użytkownik wyśle zdjęcie, które nie jest ubraniem, API zwróci `400 Bad Request` z komunikatem o błędzie i nie zapisze pliku.

---

## 🧠 AI Stylista i Kompozycje

| Endpoint | Metoda | Opis | Body |
| :--- | :--- | :--- | :--- |
| `/clothes/suggest/` | `POST` | **Generuj Stylizację** | `{"occasion": "Wesele"}` |
| `/compositions/` | `GET` | Historia zapisanych zestawów | Zwraca zestawy z pełnymi danymi ubrań |

---

## 📂 Przechowywanie Danych (Storage)
* **Zdjęcia:** Tymczasowo przechowywane lokalnie w wolumenie Dockera `/app/media`. 
* **Pole image_url:** Backend zwraca pełny adres (absolutny URI), dzięki czemu Frontend (React) może bezpośrednio wyświetlać grafiki.

---

## 👥 Zespół Projektowy

- **Backend:** Bartłomiej Zygmunt, Norbert Mazur
- **Frontend:** Jan Burghardt, Wojciech Żurowski
- **Baza danych:** Bartłomiej Wilk
- **QA / Dokumentacja:** Kamil Wójcik

---
*Projekt realizowany jako MVP systemu Outfitly w ramach przedmiotów projektowych inżynieria oprogramowania oraz bazy danych.*