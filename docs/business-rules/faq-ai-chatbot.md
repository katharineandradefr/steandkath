# FAQ e chatbot com IA

## Visão geral

Módulos **futuros** para base de conhecimento (**FAQ**) e **assistente com IA**, com papéis distintos para designers e coordenadores.

**Estado no código:** cliente OpenAI em `src/server/ai/openai.ts`; páginas **Explorar** (`/explorar`) e **Aprendizado** (`/aprendizado`) existem como placeholders sem integração com FAQ ou pendências.

---

## Regras de negócio conhecidas

### RN-FAQ01 — Alimentação da FAQ por designers

**Designers** (tipos 1 e 2) podem criar e editar conteúdo da futura tela de FAQ do sistema.

### RN-FAQ02 — Aprovação

Fluxo de aprovação pelo coordenador **não definido** — ver perguntas em aberto.

### RN-IA01 — Contextos do Designer

**Designers** poderão fornecer **novos contextos** para o chatbot de IA (documentação, processos, exemplos).

### RN-IA02 — Uso pelo Coordenador

**Coordenadores** utilizam o chatbot para **novos questionamentos** sobre como executar tarefas (orientação operacional, não necessariamente editar contextos).

### RN-IA03 — Separação de responsabilidades

| Papel | Papel na IA |
|-------|-------------|
| Designer 1 / Designer | Alimentar contexto e FAQ |
| Coordenador | Consumir / perguntar |
| Subcoordenador | A definir (provavelmente só consumo) |

---

## Requisitos funcionais (planejados)

### RF-FAQ01 — CRUD de artigos

Designers criam artigos com título, corpo Markdown, tags de projeto/área.

### RF-FAQ02 — Publicação

Estados: rascunho, em revisão, publicado (workflow a definir).

### RF-IA01 — Ingestão de contexto

Designer envia documentos ou textos; sistema indexa para RAG (retrieval).

### RF-IA02 — Sessão de pergunta

Coordenador faz pergunta; resposta cita fontes (FAQ + contextos).

---

## Relação com outras telas

| Tela | Rota | Relação futura |
|------|------|----------------|
| Explorar | `/explorar` | Possível protótipo de FAQ |
| Aprendizado | `/aprendizado` | Candidata ao chatbot para coordenadores |
| Pendências | `/` | IA pode sugerir checklist ou links |

---

## Lacunas no código

| Item | Status |
|------|--------|
| Modelo `FaqArticle`, `AiContext` | Não existe |
| RAG / vector store | Não existe |
| UI FAQ dedicada | Não existe |

---

## Perguntas em aberto

14. Chatbot IA responde **dentro do chat** ou em tela separada (Aprendizado)?
15. Contextos do Designer são por **projeto**, por **área** ou **globais**?
16. Coordenador pode **ver e editar** contextos criados pelo Designer?
17. FAQ publicada passa por **aprovação do Coordenador**?
18. IA pode **criar rascunho de pendência** a partir de pergunta do coordenador?

Ver também [chat-collaboration.md](./chat-collaboration.md) e [pendencies-kanban.md](./pendencies-kanban.md).
