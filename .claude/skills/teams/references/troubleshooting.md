# Troubleshooting

Common issues when working with agent teams and how to resolve them.

## TeamDelete Fails

**Symptom:** `TeamDelete()` returns an error about active members.

**Cause:** One or more teammates are still running or haven't confirmed shutdown.

**Fix:**
1. Send `shutdown_request` to each active teammate:
   ```
   SendMessage({ type: "shutdown_request", recipient: "teammate-name", content: "Shutting down" })
   ```
2. Wait for each teammate to respond with `shutdown_response` (approve: true).
3. Retry `TeamDelete()` after all confirmations received.

## Teammate Appears Stuck or Unresponsive

**Symptom:** Teammate went idle and hasn't produced output.

**Cause:** Idle is the normal resting state between turns. Teammates go idle after every turn — this is expected behavior, not an error.

**Fix:**
- Send a direct message to wake the teammate:
  ```
  SendMessage({ type: "message", recipient: "teammate-name", content: "Please continue with task X", summary: "Follow up on task X" })
  ```
- If the teammate was waiting for input, include the information in the message.

## Tasks Permanently Blocked

**Symptom:** `TaskList()` shows tasks with `blockedBy` that never resolve.

**Cause:** Blocking task was never completed, was deleted, or has its own unresolved blockers.

**Fix:**
1. Run `TaskGet(blockingTaskId)` to check the blocking task's status.
2. If the blocking task is stuck, assign it or unblock it.
3. If the blocking task is no longer needed, complete or delete it:
   ```
   TaskUpdate({ taskId: "blocking-id", status: "completed" })
   ```
4. Downstream tasks automatically unblock when their dependencies complete.

## Messages Not Delivered

**Symptom:** Teammate doesn't react to a sent message.

**Cause:** Wrong recipient name, or teammate has already shut down.

**Fix:**
- Verify the recipient name matches the `name` field used when spawning (not the UUID).
- Read `~/.claude/teams/{team-name}/config.json` to check current member names.
- Confirm the teammate is still active (not shut down).

## Read-Only Agent Cannot Edit Files

**Symptom:** Agent reports it cannot write or edit files.

**Cause:** Explore and Plan agents are read-only by design. They lack Edit, Write, and Bash tools for file modification.

**Fix:**
- Use `general-purpose` or a custom dev agent (e.g., `golang-backend-dev`) for tasks requiring file changes.
- Reserve Explore agents for research, search, and analysis only.
- Reserve Plan agents for architecture planning and design review only.

## Too Many Agents Spawned

**Symptom:** System becomes slow, context limits reached, coordination overhead exceeds benefit.

**Fix:**
- Limit teams to 2-4 focused agents. More agents means more coordination overhead.
- Prefer fewer agents with broader scope over many narrow agents.
- Use sequential workflows (task dependencies) instead of spawning dedicated agents for every step.

## Teammate Doesn't See Task Updates

**Symptom:** Teammate continues working on old version of a task.

**Cause:** Teammates don't automatically poll for task changes. They read task details when first assigned.

**Fix:**
- Send a direct message with the updated information:
  ```
  SendMessage({ type: "message", recipient: "teammate-name", content: "Requirements changed: [new details]", summary: "Updated requirements for task" })
  ```

## Teammate Rejects Shutdown

**Symptom:** Shutdown response comes back with `approve: false`.

**Cause:** Teammate has unfinished work and chose to continue.

**Fix:**
- Read the rejection reason in the response content.
- Allow the teammate to finish, or send a follow-up message with instructions.
- Re-send `shutdown_request` when work is complete.
