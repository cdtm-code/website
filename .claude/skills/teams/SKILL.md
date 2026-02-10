---
name: teams
description: This skill should be used when the user asks to "create a team", "spawn agents", "coordinate teammates", "use agent teams", "swarm agents", "parallel agents", "multi-agent workflow", or needs guidance on team creation, task management, inter-agent messaging, or team lifecycle management.
user-invocable: true
argument-hint: "[team-name]"
---

# Agent Teams

Coordinate multiple Claude Code agents working in parallel on a shared project. Teams enable a lead agent to create tasks, spawn specialized teammates, assign work, and orchestrate completion through messaging and task tracking.

## Quick Start

Minimal complete lifecycle for a team named `$ARGUMENTS` (or use a descriptive name):

```
1. TeamCreate({ team_name: "feature-auth", description: "Implement auth system" })
2. TaskCreate({ subject: "Implement login API", description: "...", activeForm: "Implementing login API" })
3. TaskCreate({ subject: "Create login UI", description: "...", activeForm: "Creating login UI" })
4. Task({ prompt: "...", subagent_type: "general-purpose", team_name: "feature-auth", name: "backend-dev" })
5. TaskUpdate({ taskId: "1", owner: "backend-dev", status: "in_progress" })
6. SendMessage({ type: "shutdown_request", recipient: "backend-dev", content: "Work complete" })
7. TeamDelete()
```

## Team Lifecycle

Seven phases from creation to cleanup:

```
Create Team → Create Tasks → Spawn Teammates → Assign Work → Monitor/Coordinate → Shutdown Teammates → Delete Team
```

### Phase 1: Create Team

```
TeamCreate({
  team_name: "my-team",        // required: lowercase, hyphens allowed
  description: "Purpose",      // optional: what the team works on
  agent_type: "coordinator"    // optional: role of team lead
})
```

Creates `~/.claude/teams/{team-name}/config.json` and `~/.claude/tasks/{team-name}/`.

### Phase 2: Create Tasks

```
TaskCreate({
  subject: "Implement feature X",           // imperative form title
  description: "Detailed requirements...",   // full context for the assignee
  activeForm: "Implementing feature X"       // present continuous, shown in spinner
})
```

Set up dependencies between tasks when order matters:

```
TaskUpdate({ taskId: "2", addBlockedBy: ["1"] })   // task 2 waits for task 1
```

### Phase 3: Spawn Teammates

Use the Task tool with `team_name` and `name` to spawn agents that join the team:

```
Task({
  prompt: "Implement the login API endpoint...",
  subagent_type: "general-purpose",
  team_name: "my-team",
  name: "backend-dev"
})
```

#### Agent Type Selection

| subagent_type | Can Edit Files | Best For |
|---------------|---------------|----------|
| `general-purpose` | Yes | Implementation, full-capability work |
| `Explore` | No | Codebase research, file search, reading |
| `Plan` | No | Architecture planning, design review |
| `golang-backend-dev` | Yes | Go backend development (if agent defined) |
| `hub-ui-vue-developer` | Yes | Hub UI Vue work (if agent defined) |
| `bob-ui-vue-developer` | Yes | Bob UI Vue work (if agent defined) |
| `vue-app-launcher-dev` | Yes | App launcher Vue work (if agent defined) |
| `go-backend-reviewer` | Yes | Go code review (if agent defined) |
| `vue-frontend-reviewer` | Yes | Vue code review (if agent defined) |

**Read-only agents** (Explore, Plan) cannot edit or write files. Only assign research, search, or planning tasks to them.

**Custom agents** defined in `.claude/agents/` are available as subagent_type values. Check their descriptions for tool restrictions.

### Phase 4: Assign Work

Assign tasks to teammates by name:

```
TaskUpdate({ taskId: "1", owner: "backend-dev", status: "in_progress" })
```

Teammates can also self-assign by calling TaskList to find unblocked, unowned tasks.

### Phase 5: Monitor and Coordinate

Messages from teammates are delivered automatically. No manual inbox checking required.

Send direct messages to coordinate:

```
SendMessage({
  type: "message",
  recipient: "backend-dev",
  content: "The API spec changed, update the endpoint path to /v2/auth",
  summary: "API spec update for auth endpoint"
})
```

Use TaskList periodically to check overall progress and identify blocked work.

### Phase 6: Shutdown Teammates

After all work is complete, shut down each teammate:

```
SendMessage({
  type: "shutdown_request",
  recipient: "backend-dev",
  content: "All tasks complete, shutting down"
})
```

The teammate receives the request and responds with approve (exits) or reject (continues working).

### Phase 7: Delete Team

Only after ALL teammates have shut down:

```
TeamDelete()
```

Removes the team directory and task directory. Fails if any teammate is still active.

## Tool Reference

### Team Management

| Tool | Required Params | Optional Params | Purpose |
|------|----------------|-----------------|---------|
| `TeamCreate` | `team_name` | `description`, `agent_type` | Create team + task list |
| `TeamDelete` | — | — | Remove team (all members must be shut down) |

### Task Management

| Tool | Required Params | Optional Params | Purpose |
|------|----------------|-----------------|---------|
| `TaskCreate` | `subject`, `description` | `activeForm`, `metadata` | Create a new task |
| `TaskList` | — | — | List all tasks with status/owner/blockers |
| `TaskGet` | `taskId` | — | Full task details |
| `TaskUpdate` | `taskId` | `status`, `owner`, `subject`, `description`, `activeForm`, `addBlocks`, `addBlockedBy`, `metadata` | Update any task field |

**Task status flow:** `pending` → `in_progress` → `completed` (or `deleted`)

### Communication

| Tool | Required Params | Optional Params | Purpose |
|------|----------------|-----------------|---------|
| `SendMessage` (type: `message`) | `recipient`, `content`, `summary` | — | Direct message to one teammate |
| `SendMessage` (type: `broadcast`) | `content`, `summary` | — | Message ALL teammates (expensive) |
| `SendMessage` (type: `shutdown_request`) | `recipient` | `content` | Request teammate shutdown |
| `SendMessage` (type: `shutdown_response`) | `request_id`, `approve` | `content` | Respond to shutdown request |
| `SendMessage` (type: `plan_approval_response`) | `request_id`, `recipient`, `approve` | `content` | Approve/reject teammate plan |

### Spawning

| Tool | Required Params | Optional Params | Purpose |
|------|----------------|-----------------|---------|
| `Task` | `prompt`, `subagent_type` | `team_name`, `name`, `mode`, `model`, `run_in_background` | Spawn a teammate into the team |

## Task Dependencies

Block tasks that depend on others:

```
TaskCreate({ subject: "Build API", description: "..." })           // id: 1
TaskCreate({ subject: "Write API tests", description: "..." })     // id: 2
TaskUpdate({ taskId: "2", addBlockedBy: ["1"] })                   // tests wait for API
```

Check blocked work:

```
TaskList()   // shows blockedBy for each task
```

Resolve by completing blocking tasks — downstream tasks automatically unblock.

## Communication Patterns

### Direct Message (preferred)

```
SendMessage({
  type: "message",
  recipient: "researcher",
  content: "Found the auth module at src/auth/. Focus your search there.",
  summary: "Auth module location found"
})
```

### Broadcast (use sparingly)

Sends a separate message to EVERY teammate. Only for critical team-wide announcements:

```
SendMessage({
  type: "broadcast",
  content: "Blocking bug found in shared module. Stop all work until resolved.",
  summary: "Critical blocking issue found"
})
```

### Discovering Teammates

Read the team config to find all members:

```
Read ~/.claude/teams/{team-name}/config.json
```

Contains a `members` array with each teammate's `name`, `agentId`, and `agentType`. Always refer to teammates by `name`.

## Critical Rules

- **Idle is normal.** Teammates go idle between turns. Sending a message wakes them.
- **Use names, not UUIDs.** Always refer to teammates by their human-readable name (e.g., "researcher", "backend-dev").
- **Messages auto-deliver.** No manual inbox polling needed. Messages arrive as new conversation turns.
- **Broadcast is expensive.** N teammates = N separate message deliveries. Default to direct messages.
- **Shutdown before delete.** TeamDelete fails if any teammate is still active.
- **Read-only agents can't edit.** Explore and Plan agents have no write access. Match agent type to task needs.
- **Prefer task ID order.** When multiple unblocked tasks are available, work on lower IDs first.
- **Provide detailed prompts.** Spawned agents start fresh — include all necessary context in the Task prompt.
- **Run agents in background.** Use `run_in_background: true` on the Task tool to spawn teammates without blocking.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Do Instead |
|--------------|-------------|------------|
| Broadcasting for routine updates | Wastes tokens, N messages sent | Direct message the relevant teammate |
| Assigning edit tasks to Explore agents | Explore is read-only, will fail | Use general-purpose or a custom dev agent |
| Deleting team before shutdown | TeamDelete fails with active members | Send shutdown_request to each teammate first |
| Using UUIDs for recipients | Harder to read, error-prone | Use teammate names from team config |
| Spawning too many agents | Resource-intensive, hard to coordinate | 2-4 focused agents per team |
| Skipping task descriptions | Teammate lacks context, produces poor work | Write detailed descriptions with requirements |
| Polling for messages | Messages auto-deliver | Wait for automatic delivery |
| Treating idle as an error | Idle is the normal resting state | Send a message if the teammate needs to act |

## Additional Resources

For detailed team patterns and complete workflow examples:
- **[references/patterns.md](references/patterns.md)** — Common team patterns (research swarm, parallel dev, dev+review cycle, full-stack feature, competing hypotheses)

For diagnosing and resolving common issues:
- **[references/troubleshooting.md](references/troubleshooting.md)** — TeamDelete failures, stuck tasks, messaging issues, agent type mismatches
