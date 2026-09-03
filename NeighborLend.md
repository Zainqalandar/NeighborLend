# NeighborLend — Project Proposal
### Mohalle/Office ka Tool-Sharing Network (MERN Stack)

---

## 1. Project Overview

**NeighborLend** ek community-based tool-sharing platform hai jahan users apne ghar/office ke tools aur equipment (drill machine, ladder, camping gear, projector, etc.) list kar sakte hain jo doosre neighbors/colleagues borrow kar sakein. Platform ka core idea hai **resource sharing** — har cheez khareedne ki zaroorat nahi, jo pehle se kisi ke paas hai use borrow karo.

**Har user do roles play karta hai:**
- **Owner** — jab wo apna item list karta hai
- **Borrower** — jab wo kisi aur ka item request karta hai

Yani role-based access control ka simple lekin real-world use-case yahan milta hai — same user database mein ek hi type ka hai, lekin context ke hisaab se uske permissions/actions change hote hain.

---

## 2. Problem Statement

- Log aksar aik dafa use hone wale expensive tools (drill, ladder) khareedte hain jo saal mein sirf 2-3 baar use hote hain
- Mohalle/office mein log ek dusre se cheezein mangte to hain lekin koi tracking system nahi hota (kisne li, kab wapas karni hai)
- Return dates bhool jaate hain, items kho jate hain ya der se wapas hote hain
- Koi centralized record nahi hota ke kis ke paas kya hai

**NeighborLend in sab problems ka digital, trackable solution deta hai.**

---

## 3. Objectives (Learning Goals)

Ye project specifically in concepts par grip banane ke liye design kiya gaya hai:

| # | Concept | Kahan Apply Hoga |
|---|---------|-------------------|
| 1 | **JWT Authentication + bcrypt** | User signup/login, password hashing, protected routes |
| 2 | **Role-based logic** | Same user, dynamic owner/borrower permissions |
| 3 | **Mongoose Relations (ref/populate)** | Item ↔ User ↔ Request models ka linkage |
| 4 | **Status State-Machine** | `available → requested → borrowed → returned` (aur `rejected`) |
| 5 | **node-cron** | Daily background job jo due-dates check kare |
| 6 | **Nodemailer** | Automatic reminder emails jab return date miss ho |
| 7 | **(Bonus) AI Integration** | Item description auto-improve/categorize (via LLM API) |

---

## 4. Tech Stack

**Frontend**
- React.js (Vite)
- React Router (navigation)
- Axios (API calls)
- Context API / Redux Toolkit (auth state management)
- Tailwind CSS (styling)

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose (ODM)
- JWT (jsonwebtoken) + bcrypt.js
- node-cron (scheduled jobs)
- Nodemailer (email service — Gmail SMTP ya Resend/SendGrid)
- (Bonus) OpenAI/Claude API for description enhancement

**Dev Tools**
- Postman (API testing)
- MongoDB Atlas (cloud DB)
- dotenv (env variables)
- Git/GitHub (version control)

---

## 5. Database Schema (Mongoose Models)

### `User` Model
```js
{
  name: String,
  email: { type: String, unique: true, required: true },
  password: String, // bcrypt hashed
  phone: String,
  address: String,
  createdAt: Date
}
```

### `Item` Model
```js
{
  owner: { type: ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  category: String, // e.g. "Power Tools", "Camping", "Electronics"
  imageUrl: String,
  status: {
    type: String,
    enum: ['available', 'requested', 'borrowed'],
    default: 'available'
  },
  createdAt: Date
}
```

### `Request` Model (core relation table)
```js
{
  item: { type: ObjectId, ref: 'Item', required: true },
  borrower: { type: ObjectId, ref: 'User', required: true },
  owner: { type: ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned'],
    default: 'pending'
  },
  requestDate: Date,
  approvedDate: Date,
  dueDate: Date,       // return deadline
  returnedDate: Date,
  reminderSent: { type: Boolean, default: false }
}
```

**Relation Logic:**
- `Item.owner` → `User` (populate karke owner ka naam/email nikalna)
- `Request.item`, `Request.borrower`, `Request.owner` → sab `.populate()` se joinable
- Ye teeno models mil kar tumhe real `ref`/`populate` ka practical hands-on dete hain

---

## 6. Status State-Machine (Core Logic)

```
Item Status:      available ──► requested ──► borrowed ──► available (loop)

Request Status:   pending ──► approved ──► returned
                      │
                      └────► rejected
```

**Flow:**
1. Borrower kisi `available` item par request bhejta hai → `Request.status = 'pending'`, `Item.status = 'requested'`
2. Owner approve kare → `Request.status = 'approved'`, `Item.status = 'borrowed'`, `dueDate` set hoti hai
3. Owner reject kare → `Request.status = 'rejected'`, `Item.status` wapas `'available'`
4. Borrower/Owner item return mark kare → `Request.status = 'returned'`, `Item.status = 'available'`

Ye state-machine tumhe sikhayega ke real apps mein ek simple `enum` field kaise multiple business rules control karta hai.

---

## 7. Core Features (MVP)

### Authentication
- Signup/Login (JWT token issue)
- Protected routes (middleware se token verify)
- Password bcrypt hashed store

### Item Management
- Add/Edit/Delete item (sirf owner)
- Browse all available items (search + category filter)
- Item detail page

### Request/Borrow System
- "Request to Borrow" button
- Owner ke dashboard mein "Pending Requests" (Approve/Reject)
- Borrower ke dashboard mein "My Requests" (status tracking)
- "My Lent Items" (owner ke active loans)

### Automatic Reminder System (node-cron + Nodemailer)
- Daily cron job (e.g. har raat 9 PM) chale
- Jo bhi `Request` ka `dueDate` aaj se pehle hai aur `status='approved'` (abhi tak returned nahi) — us borrower ko reminder email jaye
- `reminderSent` flag se duplicate emails avoid karo

### Return Flow
- Borrower/Owner "Mark as Returned" button
- Item status wapas `available`

---

## 8. Bonus Feature — AI-Powered Description

Jab owner item add kare, ek "✨ Auto-improve with AI" button ho:
- User rough description likhe (e.g. "old drill machine, works fine")
- Backend AI API (OpenAI/Claude) ko call kare → polished description + suggested category return kare
- User accept/edit kar ke save kare

Ye feature tumhe **3rd-party API integration in a real product context** sikhayega — bahut acha resume point banega.

---

## 9. API Endpoints (Suggested Structure)

```
Auth
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me            (protected)

Items
GET    /api/items              (all available, filter/search)
GET    /api/items/:id
POST   /api/items              (protected, owner)
PUT    /api/items/:id          (protected, owner only)
DELETE /api/items/:id          (protected, owner only)
POST   /api/items/ai-enhance   (bonus)

Requests
POST   /api/requests                     (borrower creates request)
GET    /api/requests/my-requests         (borrower view)
GET    /api/requests/received            (owner view — pending on their items)
PATCH  /api/requests/:id/approve
PATCH  /api/requests/:id/reject
PATCH  /api/requests/:id/return
```

---

## 10. Suggested 1-Week Timeline

| Day | Focus |
|-----|-------|
| **Day 1** | Project setup (backend + frontend boilerplate), MongoDB Atlas connect, folder structure |
| **Day 2** | User model + JWT auth (signup/login) + bcrypt + auth middleware |
| **Day 3** | Item model + CRUD APIs + frontend Add/Browse Item pages |
| **Day 4** | Request model + full state-machine logic (request/approve/reject/return) |
| **Day 5** | Owner & Borrower dashboards (frontend) — connect all APIs |
| **Day 6** | node-cron + Nodemailer reminder system + testing |
| **Day 7** | Bonus AI feature + UI polish + deployment (Render/Vercel) |

---

## 11. Deployment Plan
- **Backend:** Render / Railway
- **Frontend:** Vercel / Netlify
- **Database:** MongoDB Atlas (free tier)
- **Email:** Gmail SMTP (app password) ya Resend free tier

---

## 12. Stretch Goals (Agar time bache)
- Rating/review system (borrower rates owner ka item condition)
- In-app notifications (na sirf email)
- Chat between owner-borrower for handover coordination
- Image upload via Cloudinary
- Admin panel for reported/disputed items

---

## 13. Skills Demonstrated on Resume

> "Built a full-stack MERN application implementing JWT-based authentication, role-based access control, relational data modeling with Mongoose, a status-driven state machine for a borrow/lend workflow, and an automated email reminder system using node-cron and Nodemailer. Integrated an AI API for auto-generating item descriptions."

---

**Next Step:** Agar chaho to main is proposal ke basis par actual folder structure + starter code (backend routes, models, auth middleware) bhi bana sakta hoon.