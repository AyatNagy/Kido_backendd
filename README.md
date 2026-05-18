# Kido Backend

> RESTful API for **Kido** — a children's educational app that helps kids learn through interactive levels, assessments, and progress tracking. Built and deployed.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)](https://prisma.io)
[![MySQL](https://img.shields.io/badge/MySQL-Database-orange?logo=mysql)](https://mysql.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://kido-backendd.vercel.app)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)

---

## 📌 About

Kido Backend is the server-side of the Kido educational platform. It handles user authentication, child account management, lesson progress tracking, and assessment scoring — all built and maintained by **Ayat Nagy**, independently.

**Live API:** `https://kido-backendd.vercel.app/api`

---

## ✨ Features

- 🔐 **JWT Authentication** — separate tokens for parents and children
- 📧 **Email Verification** — OTP-based signup and password reset via Nodemailer
- 👨‍👩‍👧 **Parent & Child Accounts** — parents manage children, children learn independently
- 📚 **3-Level Curriculum** — levels unlock progressively based on assessment scores
- ✅ **Progress Tracking** — lesson completion tracked per child
- 📝 **Assessment System** — score-based level unlocking (pass threshold: 70%)
- 🌱 **Database Seeding** — pre-populated levels, categories, and lessons
- 🐳 **Docker Support** — containerized for easy deployment
- 🚀 **CI/CD** — automated deployment via GitHub Actions to Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Prisma |
| Database | MySQL |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail) |
| Deployment | Vercel |
| Containerization | Docker |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
src/
├── controllers/
│   ├── authController.js        # Register, login, OTP, reset password
│   ├── ChildController.js       # Child register, login, set level
│   ├── userController.js        # CRUD for parent users
│   ├── assessmentController.js  # Submit & retrieve assessments
│   └── progressController.js   # Track lesson completion
├── middlewares/
│   └── authmiddleware.js        # JWT verification
├── routes/
│   ├── authRoutes.js
│   ├── childAuthRoutes.js
│   ├── userRoutes.js
│   ├── assessmentRoutes.js
│   └── progressRoutes.js
├── utils/
│   └── emailService.js          # Nodemailer setup
└── app.js / server.js
prisma/
├── schema.prisma                # Database schema
└── seed.js                      # Seed levels & lessons
```

---

## 🗄️ Database Schema

```
User (Parent)
  ├── id, username, email, password, phone
  ├── isVerified, resetToken, resetTokenExpiry
  └── children[]

Child
  ├── id, motherId, username, name, dateOfBirth
  ├── allowedLevel (default: 1, max: 3)
  └── progress[], assessments[]

Level → Category → Lesson
Progress (childId + lessonId + isCompleted)
Assessment (childId + score + level + createdAt)
Role / UserRole
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new parent (sends OTP) |
| POST | `/verify-otp` | Verify email with OTP |
| POST | `/login` | Login and get JWT token |
| POST | `/forget` | Request password reset OTP |
| POST | `/reset-password` | Reset password with OTP |

### Child — `/api/child`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a child | Parent JWT |
| POST | `/login` | Child login | Public |
| GET | `/my` | Get all children for logged-in parent | Parent JWT |
| POST | `/set-level` | Set initial allowed level | Parent JWT |

### Assessment — `/api/assessment`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/submit` | Submit exam score — auto-unlocks next level if score ≥ 70% | Parent JWT + childId |
| GET | `/child/:childId` | Get all assessments for a child | JWT |

### Progress — `/api/progress`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/complete` | Mark lesson as completed | Child JWT |
| GET | `/my` | Get child's grouped progress | Child JWT |

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="mysql://user:password@host:3306/kido_db"
JWT_SECRET="your_jwt_secret"
EMAIL="your_gmail@gmail.com"
EMAIL_PASS="your_gmail_app_password"
```

---

##  Getting Started

### Local Setup

```bash
# Clone the repo
git clone https://github.com/AyatNagy/Kido_backendd.git
cd Kido_backendd

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx prisma migrate dev

# Seed the database with levels & lessons
node prisma/seed.js

# Start the server
npm run dev
```

### Docker Setup

```bash
docker-compose up --build
```

---

## 🌱 Database Seeding

The seed script populates:
- **Level 1** — 8 categories (Counting, Sorting, Pegboard, Senses, Matching, Drawing, Self Care, Feelings)
- **Level 2** — 7 categories (Draw Line, Big, Small, Tall, Short, Thin, Shapes)
- **Level 3** — 7 categories (Letters, Numbers, Colors, Fruits, Vegetables, Family, Animals)

```bash
node prisma/seed.js
```

---

## 🧠 Assessment & Level Logic

- Child completes an exam → Flutter app sends `score` (0–100) + `level` + `childId`
- If `score >= 70` → backend automatically increments `allowedLevel` in DB
- Parent's home screen refreshes and shows the updated level in real time

---

## 📮 Postman Collection

A full Postman collection is included in the repo:
```
Kido_API_Collection.postman_collection.json
```
Import it in Postman to test all endpoints immediately.

---

## 👩‍💻 Built By

**Ayat Nagy** — Designed, built, and deployed this backend as part of the Kido graduation project.

- GitHub: [@AyatNagy](https://github.com/AyatNagy)

---

## 📄 License

This project is for educational purposes.
