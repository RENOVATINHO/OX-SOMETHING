## 1. Visão Geral do Projeto

O **Easy Cattle** é um sistema de gestão de fazendas pecuárias. O produto permite ao produtor rural cadastrar e gerenciar seu rebanho, controlar o estoque de insumos, registrar compras e vendas de animais, e visualizar tudo por meio de um dashboard analítico com gráficos.

**Nome no app:** Easy Cattle  

**Público-alvo:** Pecuaristas / Produtores rurais  

**Deploy:** Frontend na Vercel, backend em servidor Node.js próprio  

**Banco de dados:** MySQL

---

## 2. Stack Tecnológica

### Frontend

- **React 18** com TypeScript
- **Vite** como bundler
- **React Router v6** para navegação SPA
- **TailwindCSS** para estilização
- **shadcn/ui** para componentes de UI
- **Recharts** para gráficos (AreaChart, componentes customizados)
- **@tanstack/react-query** instalado mas **pouco utilizado** — a maioria dos dados é buscada com `fetch` + `useEffect` direto nas páginas
- **Zod** instalado mas **não utilizado** para validação de formulários
- **@supabase/supabase-js** instalado mas **completamente não utilizado**

### Backend

- **Node.js** com **Express v5** (versão bem nova — lançada em 2024)
- **MySQL** via `mysql2`
- **JWT** para autenticação (`jsonwebtoken`)
- **bcryptjs v3** para hash de senhas (versão desatualizada — atual é v5)
- **dotenv** para variáveis de ambiente
- **CORS** configurado via variável `CORS_ORIGIN`
