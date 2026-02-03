# 🔐 Login System Implementation Guide

> Step-by-step guide สำหรับระบบ Authentication ของ Admin Panel

---

## 📊 Progress Overview

| Section | Status | Progress |
|---------|--------|----------|
| Backend - Database | ✅ Done | 100% |
| Backend - API | ✅ Done | 100% |
| Frontend - UI | ✅ Done | 100% |
| Frontend - Logic | ✅ Done | 100% |

---

## 🗄️ Phase 1: Backend - Database & Schema

### 1.1 Prisma Schema

- [x] สร้าง User model ใน `prisma/schema.prisma`
- [x] กำหนด UserRole enum (Employee, Super, Affiliate)
- [x] เพิ่ม fields: id, username, email, password, role, isActive, timestamps

**File:** `prisma/schema.prisma`

### 1.2 Domain Model

- [x] สร้าง User type ใน `server/domain/user.ts`
- [x] กำหนด UserRole type

**File:** `server/domain/user.ts`

---

## ⚙️ Phase 2: Backend - Configuration

### 2.1 Environment Variables

- [x] สร้าง env schema ด้วย Zod ใน `config/env.ts`
- [x] กำหนด required variables:
  - [x] `NODE_ENV`
  - [x] `DATABASE_URL`
  - [x] `JWT_ACCESS_SECRET` (min 32 chars)
  - [x] `JWT_REFRESH_SECRET` (min 32 chars)
  - [x] `JWT_ACCESS_TTL` (e.g., "15m")
  - [x] `JWT_REFRESH_TTL` (e.g., "30d")

**File:** `config/env.ts`

### 2.2 JWT Utilities

- [x] สร้าง JWT helper functions ใน `server/libs/jwt.ts`
  - [x] `signAccessToken()`
  - [x] `signRefreshToken()`
  - [x] `verifyAccessToken()`
  - [x] `verifyRefreshToken()`

**File:** `server/libs/jwt.ts`

### 2.3 Prisma Client

- [x] สร้าง Prisma client singleton ใน `server/libs/prisma.ts`
- [x] ใช้ PostgreSQL adapter

**File:** `server/libs/prisma.ts`

---

## 🔌 Phase 3: Backend - API Layer

### 3.1 DTO & Validation

- [x] สร้าง validation schemas ใน `server/dto/auth.dto.ts`
  - [x] `LoginDto` - email + password (min 8)
  - [x] `RegisterDto` - username + email + password

**File:** `server/dto/auth.dto.ts`

### 3.2 Repository Layer

- [x] สร้าง interface `IUserRepository` ใน `server/repositories/user.repository.ts`
- [x] Implement `UserPrismaRepository` ใน `server/repositories/user.prisma.ts`
  - [x] `findByEmail()`
  - [x] `findById()`
  - [x] `create()`

**Files:**
- `server/repositories/user.repository.ts`
- `server/repositories/user.prisma.ts`

### 3.3 UseCase Layer (Business Logic)

- [x] สร้าง `AuthUseCase` ใน `server/usecases/auth.usecase.ts`
  - [x] `register()` - สร้าง user ใหม่, hash password
  - [x] `login()` - verify credentials, generate tokens
  - [x] `refreshToken()` - verify refresh token, issue new access token

**File:** `server/usecases/auth.usecase.ts`

### 3.4 Controller Layer

- [x] สร้าง `AuthController` ใน `server/controllers/auth.controller.ts`
  - [x] `register` - POST handler
  - [x] `login` - POST handler + set cookie
  - [x] `refresh` - POST handler
  - [x] `logout` - POST handler + clear cookie

**File:** `server/controllers/auth.controller.ts`

### 3.5 Routes

- [x] สร้าง auth routes ใน `server/routes/auth.route.ts`
  - [x] `POST /api/auth/register`
  - [x] `POST /api/auth/login`
  - [x] `POST /api/auth/refresh`
  - [x] `POST /api/auth/logout`

**File:** `server/routes/auth.route.ts`

### 3.6 Hono Server Setup

- [x] สร้าง Hono app ใน `server/app.ts`
- [x] เพิ่ม middleware (logger, cors)
- [x] Mount auth routes
- [x] Health check endpoint

**File:** `server/app.ts`

---

## 🎨 Phase 4: Frontend - UI

### 4.1 Login Page Mockup

- [x] สร้างหน้า Login ใน `app/login/page.tsx`
- [x] ออกแบบ UI (two-column layout)
- [x] Form fields: email, password
- [x] Remember me checkbox
- [x] Forgot password link (placeholder)
- [x] Submit button

**File:** `app/login/page.tsx`

---

## 🔧 Phase 5: Frontend - Logic (TO DO)

### 5.1 Install Dependencies

- [x] ติดตั้ง state management library (zustand@5.0.11)

```bash
bun add zustand
```

### 5.2 API Client

- [x] สร้าง API client ใน `lib/api/client.ts`
  - [x] Base fetch wrapper with error handling
  - [x] Auto attach access token to requests
  - [x] Handle 401 responses (auto refresh token)

- [x] สร้าง auth API functions ใน `lib/api/auth.ts`
  - [x] `loginApi(email, password)`
  - [x] `logoutApi()`
  - [x] `refreshTokenApi()`
  - [x] `getCurrentUserApi()`

- [x] สร้าง barrel export ใน `lib/api/index.ts`

- [x] เพิ่ม `/api/auth/me` endpoint (Backend)
  - [x] `AuthController.me()` - ดึงข้อมูล user จาก JWT
  - [x] `AuthUseCase.getUserById()` - query user by ID

**Files created:**
- `lib/api/client.ts` ✅
- `lib/api/auth.ts` ✅
- `lib/api/index.ts` ✅

**Files updated:**
- `server/controllers/auth.controller.ts` ✅
- `server/usecases/auth.usecase.ts` ✅
- `server/routes/auth.route.ts` ✅

### 5.3 Auth Store (Zustand)

- [x] สร้าง auth store ใน `stores/auth.store.ts`
  - [x] State: `user`, `isAuthenticated`, `isLoading`, `isInitialized`, `error`
  - [x] Actions: `login()`, `logout()`, `setUser()`, `refreshToken()`, `initialize()`, `clearError()`
  - [x] Persist token ใน memory (ไม่เก็บใน localStorage เพื่อความปลอดภัย)
  - [x] Selector hooks: `useUser()`, `useIsAuthenticated()`, `useAuthLoading()`, `useAuthError()`

- [x] สร้าง barrel export ใน `stores/index.ts`

**Files created:**
- `stores/auth.store.ts` ✅
- `stores/index.ts` ✅

### 5.4 Auth Provider

- [x] สร้าง AuthProvider ใน `providers/auth-provider.tsx`
  - [x] Wrap app with auth context
  - [x] Auto refresh token on mount (via `initialize()`)
  - [x] Show loading screen while initializing

- [x] สร้าง barrel export ใน `providers/index.ts`

- [x] เพิ่ม AuthProvider ใน `app/layout.tsx`

**Files created:**
- `providers/auth-provider.tsx` ✅
- `providers/index.ts` ✅

**Files updated:**
- `app/layout.tsx` ✅

### 5.5 Connect Login Form

- [x] อัปเดต `app/login/page.tsx`
  - [x] เพิ่ม form state (useState)
  - [x] Handle form submission
  - [x] Call login API via auth store
  - [x] Show loading state (spinner + disabled inputs)
  - [x] Show error messages
  - [x] Redirect หลัง login สำเร็จ (`/admin`)
  - [x] Redirect ถ้า authenticated แล้ว
  - [x] Clear error เมื่อ form เปลี่ยน

**File updated:** `app/login/page.tsx` ✅

### 5.6 Protected Routes

- [x] สร้าง Next.js Proxy ใน `proxy.ts` (Next.js 16+ เปลี่ยนชื่อจาก Middleware เป็น Proxy)
  - [x] ตรวจสอบ authentication (ตรวจ refresh_token cookie)
  - [x] Redirect ไป /login ถ้าไม่ได้ login
  - [x] กำหนด protected paths ด้วย `config.matcher`
  - [x] เก็บ redirect URL ไว้ใน query param เพื่อ redirect กลับหลัง login
  - [x] Redirect ไป /admin ถ้า login แล้วแต่เข้าหน้า /login

**File created:** `proxy.ts` ✅

> **Note:** ตั้งแต่ Next.js 16 เป็นต้นไป, Middleware ถูกเปลี่ยนชื่อเป็น Proxy เพื่อให้สอดคล้องกับวัตถุประสงค์การใช้งานมากขึ้น (functionality เหมือนเดิม)

### 5.7 Auth Guard Component

- [x] สร้าง `AuthGuard` component ใน `components/auth/auth-guard.tsx`
  - [x] Client-side protection
  - [x] Loading state (verifying access / redirecting)
  - [x] Redirect logic (ถ้าไม่ได้ login)
  - [x] Custom fallback support
  - [x] `withAuthGuard` HOC สำหรับ page-level protection

- [x] สร้าง barrel export ใน `components/auth/index.ts`

- [x] เพิ่ม AuthGuard ใน `app/(admin)/layout.tsx`

**Files created:**
- `components/auth/auth-guard.tsx` ✅
- `components/auth/index.ts` ✅

**Files updated:**
- `app/(admin)/layout.tsx` ✅

### 5.8 Logout Functionality

- [x] เพิ่มปุ่ม Logout ใน Admin layout (`components/admin/admin-layout-client.tsx`)
- [x] เรียก logout API via auth store
- [x] Clear auth store (handled by `logout()` action)
- [x] Redirect ไปหน้า login
- [x] แสดง loading state ขณะ logout
- [x] แสดงข้อมูล user จริง (username, email, avatar initials)

**File updated:** `components/admin/admin-layout-client.tsx` ✅

### 5.9 Auto Token Refresh

- [x] สร้าง `useTokenRefresh` hook ใน `hooks/use-token-refresh.ts`
  - [x] Decode JWT token เพื่อดึง expiration time
  - [x] Schedule refresh ก่อน token หมดอายุ 1 นาที
  - [x] Handle refresh failure (auto logout)
  - [x] Refresh เมื่อ tab กลับมา active (visibility change)
  - [x] Prevent concurrent refreshes

- [x] สร้าง barrel export ใน `hooks/index.ts`

- [x] เพิ่ม `useTokenRefresh` ใน `providers/auth-provider.tsx`

**Files created:**
- `hooks/use-token-refresh.ts` ✅
- `hooks/index.ts` ✅

**Files updated:**
- `providers/auth-provider.tsx` ✅

---

## 📁 File Structure (After Implementation)

```
insu_frontend_admin/
├── app/
│   ├── login/
│   │   └── page.tsx          # ✅ Done (UI) / ⏳ Update (Logic)
│   └── (admin)/
│       └── ...
├── components/
│   └── auth/
│       └── auth-guard.tsx    # ⏳ To create
├── lib/
│   └── api/
│       ├── client.ts         # ✅ Done
│       ├── auth.ts           # ✅ Done
│       └── index.ts          # ✅ Done
├── stores/
│   ├── auth.store.ts         # ✅ Done
│   └── index.ts              # ✅ Done
├── hooks/
│   ├── use-token-refresh.ts  # ✅ Done
│   └── index.ts              # ✅ Done
├── providers/
│   ├── auth-provider.tsx     # ✅ Done
│   └── index.ts              # ✅ Done
├── components/
│   └── auth/
│       ├── auth-guard.tsx    # ✅ Done
│       └── index.ts          # ✅ Done
├── proxy.ts                  # ✅ Done (Next.js 16+ Proxy)
├── server/
│   ├── app.ts                # ✅ Done
│   ├── controllers/
│   │   └── auth.controller.ts # ✅ Done
│   ├── usecases/
│   │   └── auth.usecase.ts   # ✅ Done
│   ├── repositories/
│   │   ├── user.repository.ts # ✅ Done
│   │   └── user.prisma.ts    # ✅ Done
│   ├── dto/
│   │   └── auth.dto.ts       # ✅ Done
│   ├── domain/
│   │   └── user.ts           # ✅ Done
│   ├── libs/
│   │   ├── jwt.ts            # ✅ Done
│   │   └── prisma.ts         # ✅ Done
│   └── routes/
│       └── auth.route.ts     # ✅ Done
├── config/
│   └── env.ts                # ✅ Done
└── prisma/
    └── schema.prisma         # ✅ Done
```

---

## 🔄 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | สร้างบัญชีใหม่ | ❌ |
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| POST | `/api/auth/refresh` | ขอ Access Token ใหม่ | 🍪 Cookie |
| POST | `/api/auth/logout` | ออกจากระบบ | 🍪 Cookie |

### Request/Response Examples

#### Login

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@company.com",
      "role": "Super",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## 🔐 Security Considerations

- [x] Password hashing with bcrypt (cost factor: 10)
- [x] JWT tokens with separate secrets for access/refresh
- [x] HttpOnly cookies for refresh token
- [x] Secure cookie flag in production
- [x] SameSite: strict for CSRF protection
- [ ] Rate limiting on login endpoint
- [ ] Account lockout after failed attempts
- [ ] Audit logging for auth events

---

## 📝 Notes

### Token Strategy
- **Access Token**: Short-lived (15m), stored in memory
- **Refresh Token**: Long-lived (30d), stored in HttpOnly cookie

### Why not localStorage?
- HttpOnly cookies ป้องกัน XSS attacks
- Access token ใน memory จะหายไปเมื่อ refresh page (ต้อง call refresh endpoint)

---

## 🚀 Next Steps

✅ **ระบบ Login Implementation เสร็จสมบูรณ์แล้ว!**

### สิ่งที่ทำเสร็จแล้ว:
1. ✅ ติดตั้ง Zustand
2. ✅ สร้าง API client และ auth functions
3. ✅ สร้าง auth store
4. ✅ เชื่อมต่อ login form กับ API
5. ✅ เพิ่ม protected routes (Proxy + AuthGuard)
6. ✅ เพิ่ม logout functionality
7. ✅ เพิ่ม auto token refresh

### สิ่งที่ควรทำต่อ (Optional Enhancements):
- [ ] Rate limiting on login endpoint
- [ ] Account lockout after failed attempts
- [ ] Audit logging for auth events
- [ ] Forgot password functionality
- [ ] Remember me functionality (extend token lifetime)

---

*Last updated: 2025*