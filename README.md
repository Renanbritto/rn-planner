# RN Planner ⚡
> *Personal Operating System & Daily Execution Dashboard*

Um planner pessoal minimalista, modular e de alta produtividade construído sob medida para gerenciamento de tempo, rotinas, hábitos, metas estratégicas e blocos de deep work.

Desenvolvido com **Next.js (App Router)**, **Shadcn UI**, **Tailwind CSS** e preparado para **Nuvem Gratuita (Supabase)** com persistência offline-first via `LocalStorage`.

---

## 🎨 Paleta de Cores & Design System

Projetado com estética moderna Dark Obsidian e semântica neon de alta precisão para reduzir a fadiga visual e priorizar ações críticas:

- **Background Principal:** `#090d16` (Obsidian profundo, eliminando o preto puro que cansa a vista).
- **Cards & Superfícies:** `#0b0f1a` com leve transparência `backdrop-blur-2xl` e bordas sutis `border-white/10` (`hover:border-white/20`).
- **Glow & Destaques Neon (Semântica Fintech/IA):**
  - 🔴 **Rose / Magenta (`#f43f5e` / `text-rose-400`):** Métricas críticas, prazos urgentes e alertas de risco.
  - 🟡 **Amber / Dourado (`#f59e0b` / `text-amber-400`):** Tarefas em andamento, notas rápidas e atenção moderada.
  - 🔵 **Cyan / Azul Elétrico (`#06b6d4` / `text-cyan-400`):** Deep Work, tech, arquitetura e blocos de foco.
  - 🟢 **Emerald / Verde Menta (`#10b981` / `text-emerald-400`):** Hábitos consolidados, streaks e tarefas finalizadas.

---

## 🚀 Funcionalidades

1. **Dashboard de Métricas Executivas:** Contagem imediata de itens críticos, tarefas na esteira, dias de foco consecutivo e taxa de adesão aos hábitos diários.
2. **Gestão de Tarefas & Prioridades:**
   - Filtros rápidos (`Todas`, `Pendentes`, `Críticas`, `Concluídas`).
   - Categorias: Tech/Trabalho, Estudo, Saúde/Treino, Finanças e Pessoal.
   - Níveis de prioridade: Crítica (com indicador pulsante neon), Média e Baixa.
3. **Matriz de Consistência de Hábitos:** Check-in diário em um clique, cálculo de streaks e metas semanais.
4. **Metas Estratégicas (OKRs):** Barras de progresso com gradiente e acompanhamento de entregas de longo prazo.
5. **Braindump & Notas Rápidas:** Captura instantânea de ideias, insights e regras operacionais.
6. **Dual Mode (Local & Nuvem):**
   - Funciona 100% offline nativamente usando `localStorage`.
   - Conexão opcional e transparente com **Supabase** via variáveis de ambiente.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router & Turbopack)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4 + Tailwind Animate
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/) (Dialog, Badge, Button, Input, Tooltip)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend / Nuvem:** Supabase JS Client (`@supabase/supabase-js`, `@supabase/ssr`)

---

## 💻 Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/Renanbritto/rn-planner.git
cd rn-planner
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure a conexão com o Supabase:
Copie o arquivo `.env.example` para `.env.local` e preencha suas chaves:
```bash
cp .env.example .env.local
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📦 Repositório

- **URL:** [https://github.com/Renanbritto/rn-planner](https://github.com/Renanbritto/rn-planner)
