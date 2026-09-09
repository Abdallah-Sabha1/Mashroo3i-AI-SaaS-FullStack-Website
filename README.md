<div align="center">

![Mashroo3i Logo](https://github.com/Abdallah-Sabha1/Mashroo3i-AI-SaaS-FullStack-Website/raw/main/Frontend/public/logo1%20green%20%26%20black.svg)

# Mashroo3i — مشروعي

**Your AI co-founder for the Jordanian market**

[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-10.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)](https://supabase.com/)

</div>

---

## Overview

Most business ideas fail not because they're bad — but because founders never stress-tested them before spending money.

Mashroo3i gives Jordanian entrepreneurs an honest, data-grounded answer to one question: *is this idea worth pursuing?* You describe your idea, and the platform returns a full investment-grade report — scoring across five dimensions, a SWOT breakdown, competitive positioning, market sizing, and a 12-month financial model — all calibrated to Jordan's economy, not some generic global dataset.

It's not a chatbot. It's a structured evaluation workflow with a credit-based business model, user accounts, and persistent results — built to be a real product.

---

## The Platform

### Landing Page

![Hero](screenshots/landing-hero.png)

![Problem](screenshots/landing-problem.png)

![How It Works](screenshots/landing-how-it-works.png)

![Principles](screenshots/landing-principles.png)

![CTA](screenshots/landing-cta.png)

![Footer](screenshots/landing-footer.png)

---

### AI Evaluation Report

Submit your idea and get back a scored, structured report across four tabs — AI Evaluation, SWOT & Risk, Market, and Financial Projections.

**Scoring & Recommendations**

![Evaluation Score](screenshots/evaluation-score.jpeg)

**SWOT & Risk Analysis**

![SWOT Analysis](screenshots/evaluation-swot.jpeg)

**Market Analysis**

![Market Analysis](screenshots/evaluation-market.jpeg)

---

### Financial Projections

An interactive 3-step financial model. Dial in your costs, revenue assumptions, and growth rate — then see your full Year 1 P&L, break-even month, and ROI.

**Step 1 — Investment Setup**

![Investment Setup](screenshots/financial-investment.jpeg)

**Step 2 — Revenue Model**

![Revenue Model](screenshots/financial-revenue.jpeg)

**Step 3 — Results**

![Financial Results](screenshots/financial-results.jpeg)

**AI Insights**

![AI Insights](screenshots/financial-insights.jpeg)

---

## Key Capabilities

**For the entrepreneur**
- Submit a business idea and receive a scored, written evaluation within minutes
- Understand strengths, risks, and market position before committing any capital
- Build and adjust a financial model interactively — see break-even, revenue curve, and ROI update in real time
- Get AI-generated financial insights benchmarked against Jordanian SME norms

**For the business**
- Credit-based monetization — users pay per evaluation, not a flat subscription
- Persistent user accounts with evaluation history and financial plans
- Built to scale: stateless API, managed database, containerized deployment

---

## Technology

| | |
|---|---|
| **Backend** | ASP.NET Core — handles the API, authentication, and orchestrates the AI evaluation pipeline |
| **Frontend** | React — single-page application with full Arabic/English support |
| **Database** | PostgreSQL via Supabase — stores users, ideas, evaluations, and payment records |
| **AI** | Groq (Llama 3.3 70B) — powers the evaluation, SWOT, market analysis, and financial insights |
| **Deployment** | Railway for the backend, Netlify for the frontend |

---

## Local Development

Prerequisites:

- .NET 10 SDK
- Node.js 20.19 or newer
- PostgreSQL
- An API key for an OpenAI-compatible AI provider

Create `Backend/Mashroo3i/appsettings.Development.json`. This file is ignored by Git so local secrets are not committed:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=mashroo3i;Username=postgres;Password=your-password"
  },
  "Jwt": {
    "Key": "replace-with-a-long-random-development-secret",
    "Issuer": "Mashroo3i",
    "Audience": "Mashroo3i",
    "AccessTokenExpiryMinutes": 120
  },
  "AIProvider": {
    "Active": "Groq",
    "Groq": {
      "ApiKey": "your-api-key",
      "Model": "your-model-name",
      "BaseUrl": "your-provider-base-url"
    }
  }
}
```

Start the backend:

```powershell
cd Backend/Mashroo3i
dotnet restore
dotnet ef database update
dotnet run
```

Start the frontend in a second terminal:

```powershell
cd Frontend
npm ci
npm run dev
```

The frontend opens at `http://localhost:5173`, and the API uses `http://localhost:5057`. After the API starts, use `Backend/Mashroo3i/Mashroo3i.http` in Visual Studio or Rider to exercise the complete register → login → payment → idea → evaluation flow.

## Backend Flow

The code intentionally uses a small, interview-friendly structure:

```text
React page
  → frontend service
  → ASP.NET Core controller
  → focused application service when business logic is substantial
  → EF Core DbContext
  → PostgreSQL
```

- Controllers own HTTP concerns: authorization, status codes, and response contracts.
- Services own reusable business operations and external AI/payment communication.
- DTOs define data crossing the API boundary.
- Models and `AppDbContext` define persistent application data and relationships.
- The evaluation start operation uses a database transaction so credit deduction and status transition remain consistent.

---

## Deployment

See the [Deploy branch](https://github.com/Abdallah-Sabha1/Mashroo3i-AI-SaaS-FullStack-Website/tree/Deploy) for production configuration.

---

## License

MIT

---

<div align="center">
Built in Jordan 🇯🇴 — for Jordanian entrepreneurs
</div>
