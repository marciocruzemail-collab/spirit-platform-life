# Spirit Platform Life - IEQ.V Ferraz

Portal web da **Igreja do Evangelho Quadrangular de Campos do Jordão** com recursos completos de comunidade, educação e engajamento digital.

## 🌟 Recursos Principais

- 📖 **Bíblia com IA** - Enciclopédia Bíblica com inteligência artificial
- 🎓 **Cursos e Estudos** - Conteúdo bíblico estruturado
- 📻 **Rádio Online** - Transmissão ao vivo de cultos e programas
- 🚐 **Serviço de Transporte** - Organização de carona para membros
- 💝 **Doações** - Plataforma segura para contribuições
- 👥 **Comunidade** - Fórum de estudos, mural de avisos
- 🔐 **Autenticação** - Login seguro com Supabase

## 🚀 Quick Start

### Pré-requisitos
- Node.js >=18.0.0
- npm ou yarn
- Conta Supabase (desenvolvimento/produção)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/marciocruzemail-collab/spirit-platform-life.git
cd spirit-platform-life

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar em http://localhost:5173
```

### Build para Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview

# Lint e formatação
npm run lint
npm run format
```

## 📁 Estrutura do Projeto

```
src/
├── routes/                 # Páginas (TanStack Router)
│   ├── __root.tsx         # Layout raiz
│   ├── index.tsx          # Home
│   ├── biblia.tsx         # Bíblia com IA
│   ├── cursos.tsx         # Cursos
│   ├── admin.tsx          # Painel administrativo
│   └── ...                # Outras rotas
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes Radix UI
│   └── Layout.tsx        # Layout principal
├── lib/                  # Utilitários e configurações
├── integrations/         # Integrações (Supabase, APIs)
├── hooks/                # React hooks customizados
├── server.ts             # Entry point do servidor (SSR)
└── start.ts              # Configuração TanStack Start

public/                   # Arquivos estáticos
dist/                     # Build gerado (gitignored)
```

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|----------|
| **Framework** | TanStack Start + React 19 |
| **Roteamento** | TanStack Router |
| **UI** | Radix UI + Tailwind CSS |
| **Estado** | TanStack React Query |
| **Formulários** | React Hook Form + Zod |
| **Backend** | Supabase (PostgreSQL) |
| **Build** | Vite 7 |
| **Linguagem** | TypeScript 5 |
| **Linting** | ESLint + Prettier |

## 📋 Scripts Disponíveis

```bash
npm run dev          # Iniciar dev server
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
npm run preview      # Preview do build
npm run lint         # Verificar código
npm run format       # Formatar código
```

## 🔐 Variáveis de Ambiente

Criar `.env.local` baseado em `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5173/api
VITE_ENV=development
VITE_DEBUG=false
```

## 🚢 Deploy

### Vercel (Recomendado)

```bash
# 1. Conectar repositório no Vercel dashboard
# 2. Configurar variáveis de ambiente
# 3. Deploy automático ao fazer push
```

**Arquivo:** `vercel.json` - Configurado para SPA com rewrites

### Cloudflare Pages

```bash
# Usar wrangler.jsonc para configuração específica
npm run build
# Vercel cuida do deploy automático
```

## 🐛 Troubleshooting

### Erro 404 em rotas dinâmicas
- ✅ `vercel.json` com rewrite para `/index.html` (configurado)
- Limpar cache: `rm -rf .output dist`

### Problema de variáveis de ambiente
- Verificar `.env.local` existe e tem valores corretos
- Reiniciar dev server após mudanças

### Build falha com erro de tipo
```bash
npm run lint -- --fix  # Corrigir automaticamente
npm run build          # Tentar novamente
```

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Abrir Pull Request

## 📝 Convenções

- **Commits:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Branches:** `feature/`, `fix/`, `refactor/`
- **Componentes:** PascalCase (`Button.tsx`)
- **Arquivos utilitários:** camelCase (`utils.ts`)

## 📞 Suporte

- 📧 Email: marciocruzemail@gmail.com
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

## 📄 Licença

© 2026 IEQ.V Ferraz - Todos os direitos reservados

---

**Desenvolvido com ❤️ para a comunidade de Campos do Jordão**
