# INSU Admin — สบายใจประกันภัย (ฝั่ง Admin)

เว็บแอปพลิเคชันสำหรับ Admin ของ สบายใจประกันภัย ใช้จัดการสมาชิก ผลิตภัณฑ์ และ users

> **หมายเหตุ:** Repo นี้คือ **ฝั่ง Admin เท่านั้น** — ระบบลูกค้าแยกเป็นอีก repo ต่างหาก (`customer_frontend`)

---

## Tech Stack

| หมวด            | เทคโนโลยี                                                       |
| --------------- | --------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)                              |
| Runtime         | Bun                                                             |
| Language        | TypeScript (strict mode)                                        |
| Styling         | Tailwind CSS v4 + design tokens ใน `globals.css`                |
| API Layer       | Elysia (รันใน Next.js API route ผ่าน catch-all `[[...routes]]`) |
| Client ↔ API    | Eden Treaty (type-safe, เรียก Elysia จาก server actions โดยตรง) |
| Database        | PostgreSQL (Docker) + Prisma ORM (pg adapter)                   |
| Code Generation | Prismabox (สร้าง TypeBox schema จาก Prisma model)               |
| Auth            | JWT via jose (HS256), cookie-based, token rotation              |
| Password Hash   | argon2                                                          |

---

## เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
bun install
```

### 2. เตรียม Database

```bash
# เปิด PostgreSQL ผ่าน Docker (จาก root ของ monorepo)
docker compose up -d

# Copy env
cp .env.example .env
# แก้ไข .env ตามต้องการ

# Generate Prisma Client + Prismabox
bun run generate

# รัน Migration
bunx prisma migrate dev
```

### 3. รัน Development Server

```bash
bun run dev
```

เปิด [http://localhost:3001](http://localhost:3001)

---

## Scripts

| คำสั่ง                  | คำอธิบาย                                                |
| ----------------------- | ------------------------------------------------------- |
| `bun run dev`           | เปิด dev server (port 3001, Turbopack)                  |
| `bun run build`         | Build สำหรับ production                                 |
| `bun run start`         | รัน production server                                   |
| `bun run lint`          | ตรวจโค้ดด้วย ESLint                                     |
| `bun run generate`      | รัน `prisma generate` + fix prismabox imports อัตโนมัติ |
| `bun run fix:prismabox` | แก้ prismabox imports แยก (ใช้เมื่อลืมรัน generate)     |

---

## โครงสร้างโปรเจกต์

```
admin_frontend/
├── app/
│   ├── (admin)/              # Route group (protected, server-side auth)
│   │   ├── layout.tsx         # Server: ตรวจ auth → redirect
│   │   └── admin/             # /admin pages (dashboard, members, etc.)
│   ├── login/                 # หน้า login
│   ├── api/
│   │   └── [[...routes]]/     # Elysia API routes
│   │       ├── route.ts       # Root: รวม routes + swagger + cors
│   │       ├── auth/          # POST /login, /register, /auth/refresh, /sign-out, GET /auth/me
│   │       └── health/        # GET /health
│   ├── generated/             # Auto-generated (Prisma + Prismabox)
│   ├── globals.css            # Design tokens + utility classes
│   └── layout.tsx             # Root layout
├── components/
│   └── admin/                 # Sidebar, Dashboard, Layout client
├── services/                  # Server Actions (auth)
├── libs/
│   └── api.ts                 # Eden Treaty client (in-process)
├── types/                     # Shared TypeScript types
├── config/                    # Environment validation (Zod)
├── db/                        # Prisma client + Elysia plugin
├── utils/                     # Utility functions (auth, jwt, error)
├── prisma/                    # Schema + migrations
├── scripts/                   # Build scripts (fix-prismabox-imports)
└── proxy.ts                   # Middleware: JWT verify + redirect
```

---

## API Architecture

API ใช้ **Elysia** รันภายใน Next.js API route (`app/api/[[...routes]]/route.ts`):

- Server Actions ใน `services/` เรียก API ผ่าน **Eden Treaty** แบบ in-process (ไม่ผ่าน HTTP)
- Schema validation ใช้ **TypeBox** ผ่าน Elysia `t.Object()`
- Error handling ใช้ `toResult()` จาก `lyney` (Result pattern)

```
Client Component → Server Action (services/) → Eden Treaty (libs/api.ts) → Elysia API → Prisma → DB
```

---

## หมายเหตุสำคัญ

- **`.env` ไม่ได้ commit** — ใช้ `.env.example` เป็นตัวอย่าง แล้ว copy ไปสร้าง `.env` เอง
- **ใช้ DB เดียวกัน** กับ customer*frontend (`insu_customer_db`) — admin tables มี prefix `admin*`ผ่าน Prisma`@@map`
- **Prismabox bug:** Generated code ใช้ `import { Type }` แต่ Elysia export `t` — ใช้ `bun run generate` (ไม่ใช่ `prisma generate` ตรงๆ) เพื่อ fix อัตโนมัติ
- **`"use server"` files** ห้าม export type หรือ const ที่ไม่ใช่ async function — เก็บ types ไว้ใน `types/`
