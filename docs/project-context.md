# Contexto do projeto — steandkath

## Público-alvo

Equipe de conteúdo educacional (designers, coordenadores, subcoordenadores) com **baixa familiaridade técnica**. Parte do time usa o Cursor para construir features com IA ("vibe coding").

## Objetivo do produto

Gestão de **pendências de conteúdo** via Kanban na rota `/`, com fluxo **designer → coordenador → subcoordenador**. Módulos futuros: calendário de metas, chat, FAQ e chatbot com IA.

## Restrições importantes

- Sistema deve ser **simples** de usar e de manter
- **Rastreabilidade**: todo passo relevante no histórico (usuário, data, hora)
- **RBAC** por 4 papéis + coordenador autorizado (ver `business-rules/user-roles-permissions.md`)
- Textos de interface em **português**

## Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js App Router, Tailwind CSS |
| API | tRPC |
| Banco | MongoDB via Mongoose |
| Auth | NextAuth (Google OAuth opcional) |
| Storage | Cloudinary (anexos de imagem) |
| IA | OpenAI (`src/server/ai/openai.ts`) |

## Prioridades

1. **Confiabilidade** das regras de negócio documentadas
2. **Clareza** para usuários leigos (UI + explicações da IA)
3. **Manutenção** fácil (mudanças mínimas, docs atualizados)
4. Features futuras: calendário, histórico, chat, FAQ

## Evitar

- Overengineering e abstrações prematuras
- APIs públicas sem auth em produção
- Assumir permissões ou fluxos não documentados
- "Vibe coding suicida" — implementar sem ler `docs/business-rules/`

## Onde encontrar regras

| Tipo | Caminho |
|------|---------|
| Regras de negócio | `docs/business-rules/` |
| Regras da IA (Cursor) | `.cursor/rules/` |
| Template de feature | `docs/features/FEATURE_TEMPLATE.md` |
| Decisões arquiteturais | `docs/decisions/` |

## Grande área atual (UI)

**Clínica Médica** — fixa no Kanban por enquanto (`DEFAULT_AREA_TITLE`).

## Projetos (tags)

- Extensivo 27
- Internato
- USA Fichas
