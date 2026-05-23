# Regras de negócio — steandkath

Documentação oficial de regras de negócio e requisitos. A IA do Cursor **deve consultar estes arquivos** antes de implementar features.

## Como usar

1. Antes de implementar, leia o documento do módulo correspondente.
2. Nos prompts, referencie: `@docs/business-rules/pendencies-kanban.md`
3. Atualize estes docs quando regras mudarem.
4. Features novas: use `docs/features/FEATURE_TEMPLATE.md`

## Índice

| Arquivo | Conteúdo | Status |
|---------|----------|--------|
| [pendencies-kanban.md](./pendencies-kanban.md) | Tela `/` — Kanban de pendências | Implementado (parcial) + alvo |
| [user-roles-permissions.md](./user-roles-permissions.md) | 4 papéis e matrizes de permissão | Definido; código pendente |
| [activity-history.md](./activity-history.md) | Log de ações por usuário | Futuro |
| [calendar-goals.md](./calendar-goals.md) | Metas com datas no calendário | Futuro |
| [chat-collaboration.md](./chat-collaboration.md) | Chat entre usuários | Futuro |
| [faq-ai-chatbot.md](./faq-ai-chatbot.md) | FAQ e chatbot com contextos | Futuro |

## Legenda de papéis

| Código | Papel |
|--------|-------|
| **1** | Designer 1 (sênior/líder) |
| **2** | Designer (operacional) |
| **3** | Coordenador |
| **4** | Subcoordenador |

## Contexto geral

Ver também [docs/project-context.md](../project-context.md).

## Regras da IA (Cursor)

Comportamento da assistente: `.cursor/rules/` (pensar antes de agir, perguntar, revisar planos, sync Git, **explicar comandos de terminal**).
