# Calendário e metas

## Visão geral

Módulo **futuro** para visualização e gestão de **metas** com **data de início** e **data limite**, integrado ao fluxo de pendências. Somente usuários autorizados criam e editam metas; todos os papéis podem visualizar.

**Estado no código:** calendário **não implementado**. Não há rotas, componentes nem modelos de meta.

---

## Regras de negócio

### RN-C01 — Quem gerencia metas

| Ação | Designer 1 (1) | Designer (2) | Coordenador (3) | Subcoordenador (4) |
|------|:--------------:|:------------:|:---------------:|:------------------:|
| Adicionar meta | ✓ | | ✓* | |
| Visualizar meta | ✓ | ✓ | ✓ | ✓ |
| Editar meta | ✓ | | ✓* | |
| Marcar meta concluída | ✓ | | ✓* | |

\* Coordenador com flag **autorizado** para ações de calendário (mesmo subtipo usado para datas em pendências).

### RN-C02 — Datas em pendências

**Estabelecer datas** (início e limite) em uma pendência:

| Papel | Permissão |
|-------|-----------|
| Designer 1 | ✓ |
| Designer | ✗ |
| Coordenador (autorizado) | ✓ |
| Subcoordenador | ✗ |

Alinhado à matriz em [user-roles-permissions.md](./user-roles-permissions.md).

### RN-C03 — Registro no calendário

Somente **Designer 1** e **Coordenador autorizado** podem registrar novas pendências ou metas no calendário com data início e data limite (regra de negócio #8).

### RN-C04 — Status da meta

Fluxo de status **independente** do status da pendência:

| Status | Chave sugerida | Quem pode definir |
|--------|---------------|-------------------|
| Pendente | `pending` | Designer 1, Coordenador |
| Em execução | `in_progress` | Designer 1, Designer, Coordenador, Subcoordenador |
| Concluído | `completed` | Designer 1, Coordenador |
| Adiado | `postponed` | Designer 1, Coordenador |
| Cancelado | `cancelled` | Designer 1, Coordenador |

### RN-C05 — Histórico
Toda mudança de meta gera evento no histórico — ver [activity-history.md](./activity-history.md).

---

## Relação pendência ↔ meta

**A definir.** Possibilidades:

- Uma meta agrupa várias pendências
- Uma pendência referencia uma meta opcional
- Metas são entidades paralelas no calendário sem vínculo obrigatório

Documentar decisão nas perguntas em aberto.

---

## Requisitos funcionais (planejados)

### RF-C01 — Visualização calendário
Exibir metas em vista mensal/semanal com indicador de status e urgência.

### RF-C02 — CRUD de meta
Criar, editar e alterar status conforme matriz de permissões.

### RF-C03 — Datas obrigatórias
Meta exige `startDate` e `dueDate`; `dueDate` >= `startDate`.

### RF-C04 — Vínculo com pendência
(opcional) Associar pendências existentes a uma meta.

### RF-C05 — Filtros
Filtrar por projeto, área, responsável, status.

---

## Requisitos não funcionais

### RNF-C01 — Fuso horário
Armazenar datas em UTC; exibir no fuso do usuário (browser).

### RNF-C02 — Performance
Calendário mensal não deve carregar todas as pendências do sistema — apenas metas e itens com data no intervalo visível.

---

## Lacunas no código

| Item | Status |
|------|--------|
| Rota `/calendario` ou similar | Não existe |
| Modelo `Meta` | Não existe |
| Campos `startDate` / `dueDate` em `Pendency` | Não existem |
| Item de menu na sidebar | Não existe |

---

## Perguntas em aberto

1. Meta e pendência são a mesma entidade com flag ou entidades separadas?
2. Pendência sem meta pode aparecer no calendário só pela data limite?
3. Alertas de vencimento (e-mail/in-app) são necessários?
4. Subcoordenador pode adiar meta ou só marcar Em execução?
5. Vista padrão: mês, semana ou lista?
