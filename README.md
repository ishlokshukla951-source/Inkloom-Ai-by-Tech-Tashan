# Inkloom AI — Consistent Content. Confident Publishing.

**Production-Ready AI Brand Governance & Pre-Publication Assurance Platform**

Inkloom AI protects organizational credibility by reviewing content before publication against approved brand guidelines, legal disclosures, and verified facts. Rather than arbitrary black-box filtering, Inkloom AI combines a **deterministic regex rule parser** with **context-aware Google Gemini semantic analysis**, providing explainable evidence, human approval workflows, and an immutable audit trail.

---

## 1. Problem Statement & Key Architecture

Growing organizations publish content across dozens of employees, agencies, and generative AI tools, making it difficult to maintain a consistent and trustworthy brand identity. Off-brand claims, outdated statistics, and missing legal disclaimers damage enterprise credibility.

Inkloom AI implements a **Dual-Engine Pipeline**:
1. **Deterministic Rule Engine (`src/lib/ruleEngine.ts`)**:
   - Zero-latency, in-process regex pattern matching.
   - Evaluates prohibited phrases, mandatory disclaimers, preferred terminology, outdated facts, and accessibility issues.
   - Identifies exact character start/end spans with 100% confidence.
   - Operates independently even if external AI APIs are unreachable.
2. **Semantic AI Analysis (`server.ts` & Google Gemini API)**:
   - Evaluates brand writing tone, voice nuance, and subtle unverified promotional puffery.
   - Validates JSON schema outputs to ensure structural reliability.
   - Provides contextual recommendations that preserve the author's original message.

---

## 2. Core Capabilities

- **Brand Guidelines Registry**: Configure active rules across Claims, Terminology, Disclaimers, Tone, and Accessibility with customizable severity levels (Critical, High, Medium, Low).
- **Verified Facts Assurance**: Register audited company statistics (e.g., customer scale, SLA benchmarks, accreditations) to automatically catch superseded claims.
- **Review Results & Before/After Diff**: Inspect side-by-side highlighted text, review evidence cards, apply suggestions in one click, or dismiss with documented rationale.
- **Role-Based Approvals (RBAC)**: Distinct permissions for **Administrator**, **Manager**, **Reviewer**, and **Creator** ensuring only authorized personnel register official publishing sign-offs.
- **Collaborative Review Threads**: Reviewers and creators can exchange comments and request revisions directly on drafts.
- **Executive Analytics**: Track review cadence, consistency score indices, severity distributions, and repeated violations with Recharts.
- **Immutable Audit Trail**: Cryptographically timestamped compliance logging for every scan, applied fix, dismissal, and approval decision.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Motion.
- **Backend**: Node.js & Express API with full-stack Vite development middleware.
- **AI Engine**: Google GenAI SDK (`@google/genai`) targeting Gemini models (`gemini-2.5-flash` / `gemini-1.5-flash`).
- **Database Architecture**: PostgreSQL with Supabase Row Level Security (RLS) migrations in `supabase/migrations/`.
- **Unit Testing**: Node's built-in test runner (`tsx --test`).

---

## 4. Getting Started

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npx tsx --test src/lib/ruleEngine.test.ts

# 3. Start full-stack dev server (Express + Vite)
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 5. Security & Trust Architecture

- **Zero Foundation Model Training**: Customer content scanned through Inkloom AI is never used to train public or proprietary foundation models.
- **Tenant Isolation**: Multi-tenant database design isolates guidelines, reviews, and audit records between organizations via PostgreSQL Row Level Security.
- **Fail-Safe Fallback**: If an external AI provider experiences latency or outages, the deterministic rule engine continues executing at 100% precision.
