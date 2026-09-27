# WhatsApp Pro CRM & SmartFollow AI

> **Agentic AI Sales Automation & Omnichannel Lead Management Platform**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![E2E Tests](https://img.shields.io/badge/E2E_Tests-11%2F11_Passed-brightgreen.svg)]()

**WhatsApp Pro CRM (SmartFollow AI)** is an enterprise Agentic AI CRM and Sales Automation platform built to unify multi-channel customer conversations, automate follow-up workflows, analyze customer buying intent signals, and empower sales teams with real-time AI assistance.

---

## 🌟 Core Features

| Feature | Description |
|---|---|
| 💬 **WhatsApp Pro & Omnichannel Inbox** | 1-click WhatsApp web dispatch (`https://wa.me/...`), unified multi-channel message timeline (WhatsApp, Email, Calls, Live Chat), and AI Knowledge auto-response. |
| 🤖 **SmartFollow AI Drafts** | Generate personalized follow-up messages tailored to client stage & deal context with 1-click prompt chips (`15% Discount`, `Post-Meeting`) and copy feedback. |
| 🎯 **Buying Signals & Intent Analysis** | Real-time lead intent detection badges (`🎯 High Intent 94%`, `💰 Budget Approved 85%`, `⚡ Engaged 72%`) in the pipeline directory. |
| ⚡ **AI Workflows & Automation Suite** | 14-day automated lead drip sequences, AI meeting transcript summarizer with objection extraction, and high-churn-risk manager escalation bot. |
| 🎨 **White-Label & Knowledge Hub** | Live custom branding (accent colors, portal title, logo) plus business knowledge rules configuration (products, pricing, policies, FAQs). |
| 🇸🇦 **Full Bilingual & RTL Support** | Complete English and Arabic SaaS localization with dynamic `dir="rtl"` / `dir="ltr"` direction switching. |
| 🔒 **RBAC & Security Hardening** | 4-tier role separation (`ADMIN`, `MANAGER`, `USER`, `VIEWER`) enforced with strict API middleware role guards. |
| 📱 **Responsive Mobile Drawer** | Hamburger menu toggle, mobile top header, glassmorphism theme switcher, and backdrop overlay. |
| 🧪 **Built-in E2E Automation Tests** | Integrated API automated test runner (`npm run test:automation`) with 100% pass rate. |

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** 18+ and npm
- **Git**

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/AbdoLailah586/whatsapp-pro-crm.git
cd whatsapp-pro-crm

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Initialize Database & Seed Demo Data

```bash
cd server
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Servers

```bash
# Start backend API server (Port 3000)
cd server
npm start

# In a new terminal, start frontend Vite client (Port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| 👑 **Administrator** | `admin@micromind.com` | `admin123` | Full administrative control, users, branding, pipeline. |
| 💼 **Sales Representative** | `user@acme.com` | `user123` | Pipeline management, SmartFollow AI, lead follow-ups. |

---

## 🧪 Running Automated E2E Tests

The project includes an automated end-to-end integration test suite verifying authentication, lead CRUD, AI message generation, task completion, call summarization, drip sequences, and RBAC security:

```bash
cd server
npm run test:automation
```

**Expected Output:**
```text
====================================================
🧪 MicroMind SmartFollow AI — E2E Automation Test Suite
====================================================

✅ [PASS] API Health Check Endpoint (/api/health)
✅ [PASS] Admin Authentication Login (/api/auth/login)
✅ [PASS] Sales Representative Authentication Login (/api/auth/login)
✅ [PASS] SmartFollow Lead Creation (/api/customers)
✅ [PASS] SmartFollow Pipeline Directory & Tasks Retrieval
✅ [PASS] SmartFollow AI Message Generation (/api/customers/:id/ai-suggest)
✅ [PASS] Follow-up Task Completion (/api/customers/followups/tasks/:taskId)
✅ [PASS] AI Meeting Notes Summarizer (/api/automations/summarize-call)
✅ [PASS] Automated Drip Sequences Retrieval (/api/automations/sequences)
✅ [PASS] RBAC Security Check — Sales Rep Cannot Patch Branding
✅ [PASS] Customer Lead Deletion (/api/customers/:id)

====================================================
📊 Automation Test Execution Summary:
   Passed: 11
   Failed: 0
   Total:  11
====================================================
```

---

## 🏗️ Production Build

To verify production bundle build:

```bash
cd client
npm run build
```

Output assets will be generated in `client/dist`.

---

## 📂 Project Structure

```
whatsapp-pro-crm/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # App layout, Sidebar, AIAgentChat, LanguageSwitcher
│   │   ├── locales/           # i18n translation files (en.json, ar.json)
│   │   ├── pages/             # SmartFollow, Automations, Branding, Users, Projects
│   │   ├── sdk/               # Executive Gold UI component library
│   │   └── services/          # Axios API service layers
│   └── package.json
│
├── server/                     # Node.js + Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma      # SQLite Prisma database schema
│   │   └── seed.js            # Demo data seeder
│   ├── src/
│   │   ├── routes/            # Auth, Customers, Automations, Branding, Users, Projects
│   │   └── index.js           # Express app server entry point
│   ├── test-automation.js     # E2E Automated Integration Test Suite
│   └── package.json
│
└── DEMO_PITCH_SCRIPT.md        # 3-Minute Live Demo Pitch Script
```

---

## 👨‍💻 Author & Acknowledgements

Built with ❤️ by **Abdul Lailah** for the **MicroMind Agentic AI** Program.

Special thanks to Eng. **Ahmed Abd El-Ghaffar** for continuous mentorship and guidance, and the **AI MicroMind** team.

---

## 📜 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
