# Alkaa Business + (Next.js 15 + Prisma + Neon Serverless)

A 100% **Serverless, Free-to-Deploy** Course Admissions, Billing, Staff Payroll, and Smart Accounting Platform powered by **Next.js 15, Prisma ORM, and Neon PostgreSQL**.

---

## 🌟 Architecture (100% Free Cloud)

- **Frontend & Serverless API**: Next.js 15 deployed on **Vercel** (Hobby Plan = Free).
- **ORM & Type Safety**: **Prisma 6** (`prisma/schema.prisma`).
- **Cloud Database**: **Neon Serverless PostgreSQL** (Free Tier = 0.5 GB storage, autoscaling to zero when idle).
- **Total Cost**: **$0.00 / month forever**. No VPS required.

---

## 🚀 3-Step Setup with Neon DB

### 1. Get Your Free Neon Database
1. Go to **[https://console.neon.tech](https://console.neon.tech)** and sign up (Free, no credit card required).
2. Create a new project (e.g. `hisab-production`).
3. Copy your connection string (`Connection details` on the dashboard):
   ```text
   postgres://username:password@ep-cool-fog-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Configure Environment Variable
In `nextjs/.env.local` (or in your **Vercel Project Settings > Environment Variables**), set:
```env
DATABASE_URL="postgres://username:password@ep-your-subdomain-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="alkaa-business-plus-secure-jwt-key-2026"
```

### 3. Push Schema & Seed Initial Admin
Run in terminal:
```bash
cd nextjs
npm run db:push
```
Then visit **`http://localhost:3000/api/system/init-db`** (or your live Vercel URL) to automatically seed the default accounts and admin:
- **Default Username**: `admin`
- **Default Password**: `admin123`

---

## 🌐 Deploy to Vercel (1-Click)

1. Push this repository to GitHub.
2. In **Vercel**, click **"Add New Project"** and select this repo.
3. Set **Root Directory** to: `nextjs`.
4. In **Environment Variables**, add:
   - `DATABASE_URL` = (Your Neon connection string)
   - `JWT_SECRET` = (Any secure string)
5. Click **Deploy**. Vercel will build and launch your full application globally for free!
