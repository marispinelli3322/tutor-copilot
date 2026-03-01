# Tutor Co-Pilot — Simulation Business Game Analytics

## Project Overview
AI-powered analytics dashboard for tutors/professors of the Simulation Hospital Business Game.
Reads directly from the Simulation MySQL database and generates comparative analysis reports.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS v4 + shadcn/ui + Recharts
- **Database**: MySQL (simulationdb, acesso direto via env vars DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD)
- **AI**: Anthropic Claude API (for narrative generation in M4)
- **Hosting**: Vercel
- **Repo**: github.com/marispinelli3322/tutor-copilot

## Architecture
- SQL queries extract data from Simulation database (read-only)
- Business rules calculate KPIs deterministically (no AI for math)
- AI only used for generating narrative insights and facilitation questions (M4)
- All text in PT-BR

## Modules
- **M1**: Eficiência Operacional (capacity vs demand per service)
- **M2**: Diagnóstico de Lucratividade (margins by service line)
- **M3**: Benchmarking Inter-Equipes (comparative ranking)
- **M4**: Guia de Facilitação (AI-generated tutor questions)
- **M5**: Evolução Estratégica (timeseries charts)
- **M6**: Risco Financeiro (cash, leverage, revolving credit)
- **M7**: Alinhamento Estratégico (weights vs results)
- **M8**: Precificação Inteligente (prices, market share, convenios)
- **M9**: Governança Corporativa (6-component score)
- **M10**: Qualidade Assistencial (infection, certifications, ANVISA)
- **M11**: Receita Perdida (overload vs idleness revenue loss)
- **M12**: Glossário de Dados (indicator definitions, formulas, usage)

## Key Tables
- `grupo_industrial` — game sessions
- `empresa` — teams within a game
- `variavel_empresarial` — computed results per team per period
- `hospital` — hospital-specific data
- `item_decisao` — team decisions
- `peso_item_estrategia` — strategic objective weights

## Brand Colors
- Primary (Navy): #1A365D
- Accent (Gold): #C5A832
- Background: #F8FAFC
- Success: #16A34A | Warning: #EAB308 | Danger: #DC2626

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- Database: acesso direto (sem VPN), env vars configuradas no `.env.local` e Vercel
