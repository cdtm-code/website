# Team Patterns

Common team configurations and coordination workflows. Each pattern includes when to use it, the team structure, and the coordination flow.

## Research Swarm

Parallelize codebase exploration by assigning different search areas to multiple read-only agents.

**When to use:** Broad codebase questions, understanding unfamiliar code, investigating issues with unknown root cause.

**Team structure:**

| Teammate | subagent_type | Focus |
|----------|--------------|-------|
| researcher-api | Explore | API layer and route definitions |
| researcher-data | Explore | Data layer, models, database queries |
| researcher-ui | Explore | Frontend components and state management |

**Workflow:**

```
1. TeamCreate({ team_name: "research-auth", description: "Understand auth system" })

2. Create tasks:
   TaskCreate({ subject: "Map API auth endpoints", description: "Find all auth-related routes, middleware, handlers", activeForm: "Mapping auth API endpoints" })
   TaskCreate({ subject: "Map auth data models", description: "Find user/session models, DAL queries, migrations", activeForm: "Mapping auth data models" })
   TaskCreate({ subject: "Map auth UI components", description: "Find login/signup pages, auth guards, token storage", activeForm: "Mapping auth UI components" })

3. Spawn all three in parallel (single message, multiple Task tool calls):
   Task({ prompt: "Research auth API endpoints...", subagent_type: "Explore", team_name: "research-auth", name: "researcher-api" })
   Task({ prompt: "Research auth data models...", subagent_type: "Explore", team_name: "research-auth", name: "researcher-data" })
   Task({ prompt: "Research auth UI components...", subagent_type: "Explore", team_name: "research-auth", name: "researcher-ui" })

4. Assign tasks → wait for results → synthesize findings
5. Shutdown all → TeamDelete
```

## Parallel Development

Multiple dev agents working on independent features simultaneously.

**When to use:** Multiple unrelated features or fixes that don't conflict with each other.

**Team structure:**

| Teammate | subagent_type | Focus |
|----------|--------------|-------|
| dev-feature-a | general-purpose | Feature A implementation |
| dev-feature-b | general-purpose | Feature B implementation |

**Workflow:**

```
1. TeamCreate({ team_name: "parallel-features", description: "Implement features A and B" })

2. Create independent tasks (no dependencies):
   TaskCreate({ subject: "Implement feature A", description: "Full requirements...", activeForm: "Implementing feature A" })
   TaskCreate({ subject: "Implement feature B", description: "Full requirements...", activeForm: "Implementing feature B" })

3. Spawn both in parallel:
   Task({ prompt: "Implement feature A...", subagent_type: "general-purpose", team_name: "parallel-features", name: "dev-feature-a" })
   Task({ prompt: "Implement feature B...", subagent_type: "general-purpose", team_name: "parallel-features", name: "dev-feature-b" })

4. Assign tasks → monitor progress → shutdown → TeamDelete
```

**Key consideration:** Ensure features touch different files to avoid merge conflicts.

## Dev + Review Cycle

One agent develops, another reviews. Iterate until the reviewer approves.

**When to use:** Code changes that require quality validation before completion.

**Team structure:**

| Teammate | subagent_type | Focus |
|----------|--------------|-------|
| developer | general-purpose (or custom dev agent) | Implementation |
| reviewer | general-purpose (or custom reviewer agent) | Code review |

**Workflow:**

```
1. TeamCreate({ team_name: "feature-review", description: "Implement and review feature X" })

2. Create tasks with dependencies:
   TaskCreate({ subject: "Implement feature X", description: "...", activeForm: "Implementing feature X" })
   TaskCreate({ subject: "Review feature X", description: "Review for correctness, style, security", activeForm: "Reviewing feature X" })
   TaskUpdate({ taskId: "2", addBlockedBy: ["1"] })   // review waits for implementation

3. Spawn developer → assign task 1 → wait for completion
4. Spawn reviewer → assign task 2 → wait for verdict

5. If rejected:
   TaskCreate({ subject: "Fix review issues", description: "Address: [reviewer feedback]", activeForm: "Fixing review issues" })
   SendMessage({ type: "message", recipient: "developer", content: "Review rejected. Fix: [details]", summary: "Review feedback for feature X" })
   // Repeat review after fixes

6. If approved → shutdown all → TeamDelete
```

## Full-Stack Feature

Coordinate backend, frontend, and review agents through task dependencies.

**When to use:** Features spanning multiple layers (API + UI + tests) with natural ordering.

**Team structure:**

| Teammate | subagent_type | Focus |
|----------|--------------|-------|
| backend-dev | general-purpose | API endpoint implementation |
| frontend-dev | general-purpose | UI component implementation |
| reviewer | general-purpose | Cross-layer code review |

**Task dependency chain:**

```
Task 1: "Implement API endpoint"          (no blockers)
Task 2: "Implement UI component"          (blocked by task 1 — needs API contract)
Task 3: "Review full implementation"       (blocked by tasks 1 and 2)
```

**Workflow:**

```
1. TeamCreate({ team_name: "full-stack-auth", description: "Auth feature end-to-end" })

2. Create all tasks upfront with dependencies:
   TaskCreate({ subject: "Implement auth API", ... })                        // id: 1
   TaskCreate({ subject: "Implement auth UI", ... })                         // id: 2
   TaskCreate({ subject: "Review auth implementation", ... })                // id: 3
   TaskUpdate({ taskId: "2", addBlockedBy: ["1"] })
   TaskUpdate({ taskId: "3", addBlockedBy: ["1", "2"] })

3. Spawn backend-dev → assign task 1
4. When task 1 completes, task 2 unblocks → spawn frontend-dev → assign task 2
5. When task 2 completes, task 3 unblocks → spawn reviewer → assign task 3
6. Handle review feedback → shutdown all → TeamDelete
```

## Competing Hypotheses

Multiple agents test different approaches to the same problem in parallel.

**When to use:** Debugging with unclear root cause, evaluating multiple implementation approaches, performance optimization with multiple strategies.

**Team structure:**

| Teammate | subagent_type | Focus |
|----------|--------------|-------|
| hypothesis-a | general-purpose | Approach A |
| hypothesis-b | general-purpose | Approach B |

**Workflow:**

```
1. TeamCreate({ team_name: "debug-perf", description: "Investigate performance issue" })

2. Create parallel investigation tasks:
   TaskCreate({ subject: "Test hypothesis: N+1 query", description: "Check for N+1 queries in the user list endpoint", activeForm: "Testing N+1 query hypothesis" })
   TaskCreate({ subject: "Test hypothesis: missing index", description: "Check if the users table is missing an index on email", activeForm: "Testing missing index hypothesis" })

3. Spawn both in parallel → assign tasks → wait for results
4. Compare findings → pick the correct diagnosis → implement fix
5. Shutdown all → TeamDelete
```

**Key consideration:** Give each agent a clear, focused hypothesis. Avoid overlapping investigation areas.
