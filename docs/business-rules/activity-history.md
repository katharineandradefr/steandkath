# Histórico e auditoria

## Visão geral

**Regra de negócio #7:** todos os passos relevantes do fluxo de trabalho devem ficar registrados em um **histórico** com **nome do usuário**, **data** e **hora**.

O histórico é a fonte de verdade para rastrear o ciclo designer → coordenador → subcoordenador e para auditoria de mudanças em pendências e metas.

---

## Estado implementado

| Item | Situação |
|------|----------|
| `createdAt` / `updatedAt` na pendência | Sim — Mongoose timestamps em `src/server/db/models/pendency.ts` |
| Quem fez a ação (`userId`, `userName`) | **Não** |
| Log de eventos por ação | **Não** |
| Exibição de timeline na UI | **Não** |
| Vínculo com comentários | **Não** (comentários também não existem) |

---

## Regras de negócio alvo

### RN-H01 — Imutabilidade
Entradas de histórico são **append-only**. Não editar nem excluir eventos (exceto política de retenção administrativa, se definida).

### RN-H02 — Identificação do autor
Cada evento registra:
- `userId` (referência ao usuário autenticado)
- `userDisplayName` (nome exibido no momento da ação — desnormalizado para preservar histórico se o nome mudar)
- `occurredAt` (ISO 8601, timezone UTC no servidor)

### RN-H03 — Granularidade
Registrar **cada** ação listada em "Eventos auditáveis" abaixo, não apenas a última atualização da entidade.

### RN-H04 — Visibilidade
Todos os papéis com acesso à pendência podem **ler** o histórico completo daquela pendência (salvo decisão contrária nas perguntas em aberto).

### RN-H05 — Sincronia com chat (futuro)
Mensagens de chat que referenciem uma pendência podem gerar evento espelhado no histórico da pendência — ver [chat-collaboration.md](./chat-collaboration.md).

---

## Eventos auditáveis

### Pendências

| Tipo de evento | Payload sugerido |
|----------------|------------------|
| `pendency.created` | id, título, status inicial, projectKey |
| `pendency.updated` | id, campos alterados (diff) |
| `pendency.deleted` | id, título |
| `pendency.status_changed` | id, `fromStatus`, `toStatus` |
| `pendency.reordered` | id, status, position (ou batch) |
| `pendency.comment_added` | id, commentId, trecho |
| `pendency.checklist_item_toggled` | id, itemId, checked |
| `pendency.attachment_added` | id, attachmentId, fileName |
| `pendency.attachment_removed` | id, attachmentId |
| `pendency.dates_set` | id, startDate, dueDate |

### Metas (calendário — futuro)

| Tipo de evento | Payload sugerido |
|----------------|------------------|
| `meta.created` | id, título, datas |
| `meta.updated` | id, diff |
| `meta.status_changed` | id, from, to |
| `meta.completed` | id |

### Usuários / permissões (futuro)

| Tipo de evento | Payload sugerido |
|----------------|------------------|
| `user.role_changed` | userId, fromRole, toRole |
| `user.coordinator_authorized` | userId, granted: boolean |

---

## Modelo de dados sugerido

```typescript
type ActivityLogEntry = {
  id: string;
  entityType: "pendency" | "meta" | "user";
  entityId: string;
  action: string; // ex.: "pendency.status_changed"
  actorUserId: string;
  actorDisplayName: string;
  occurredAt: string; // ISO datetime
  metadata?: Record<string, unknown>; // diff, status, etc.
};
```

**Coleção MongoDB sugerida:** `activity_logs` com índice `{ entityType: 1, entityId: 1, occurredAt: -1 }`.

---

## Requisitos funcionais

### RF-H01 — Registro automático
O servidor registra o evento na mesma transação lógica da mutação (ou imediatamente após sucesso).

### RF-H02 — Timeline na UI
Modal ou painel da pendência exibe linha do tempo ordenada (mais recente primeiro ou mais antiga primeiro — definir na UI).

### RF-H03 — Diff legível
Campos alterados aparecem em linguagem natural (ex.: "Urgência alterada de Média para Alta").

### RF-H04 — API de consulta
`tRPC activity.listByEntity({ entityType, entityId })` com paginação.

---

## Requisitos não funcionais

### RNF-H01 — Performance
Consulta de histórico por pendência deve responder em < 500 ms para até 500 eventos (paginar acima disso).

### RNF-H02 — Retenção
Definir política de retenção (ex.: 2 anos) — pendente de decisão de negócio.

### RNF-H03 — Integridade
`actorUserId` obrigatório em mutações autenticadas; rejeitar mutação se sessão inválida.

---

## Lacunas no código

| Item | Ação necessária |
|------|-----------------|
| Collection `activity_logs` | Criar modelo Mongoose |
| Hook pós-mutação em `pendencyRouter` | Registrar eventos |
| Campo `createdBy` na pendência | Adicionar no create |
| UI timeline | Novo componente no modal |

---

## Perguntas em aberto

1. Histórico de comentários do coordenador é público para todos os papéis?
2. Exibir histórico no card (resumo) ou só no modal?
3. Exportar histórico (CSV/PDF) é requisito?
4. Eventos de reorder em lote geram um evento ou um por card?
