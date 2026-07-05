#!/usr/bin/env bash
# Create stubs for missing files referenced by the source
# Usage: ./scripts/fix-missing.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# Find all .ts/.tsx files that import files that don't exist
# This is a helper to find and fix common missing files

# Check specific known missing files from build failures
missing_files=(
  "src/types/connectorText.ts"
  "src/services/contextCollapse/index.ts"
  "src/services/contextCollapse/operations.ts"
  "src/services/contextCollapse/persist.ts"
  "src/proactive/index.ts"
  "src/proactive/useProactive.ts"
  "src/assistant/index.ts"
  "src/assistant/gate.ts"
  "src/assistant/sessionDiscovery.ts"
  "src/assistant/AssistantSessionChooser.ts"
  "src/commands/torch.ts"
  "src/commands/subscribe-pr.ts"
  "src/commands/force-snip.ts"
  "src/commands/workflows/index.ts"
  "src/commands/peers/index.ts"
  "src/commands/fork/index.ts"
  "src/commands/buddy/index.ts"
  "src/commands/assistant/assistant.ts"
  "src/utils/attributionTrailer.ts"
  "src/utils/attributionHooks.ts"
  "src/utils/udsClient.ts"
  "src/utils/udsMessaging.ts"
  "src/utils/ultraplan/prompt.txt"
  "src/utils/telemetry/instrumentation.ts"
  "src/tools/SleepTool/SleepTool.ts"
  "src/tools/MonitorTool/MonitorTool.ts"
  "src/tools/SendUserFileTool/SendUserFileTool.ts"
  "src/tools/SendUserFileTool/prompt.ts"
  "src/tools/PushNotificationTool/PushNotificationTool.ts"
  "src/tools/SubscribePRTool/SubscribePRTool.ts"
  "src/tools/VerifyPlanExecutionTool/VerifyPlanExecutionTool.ts"
  "src/tools/OverflowTestTool/OverflowTestTool.ts"
  "src/tools/CtxInspectTool/CtxInspectTool.ts"
  "src/tools/TerminalCaptureTool/TerminalCaptureTool.ts"
  "src/tools/WebBrowserTool/WebBrowserTool.ts"
  "src/tools/WebBrowserTool/WebBrowserPanel.ts"
  "src/tools/SnipTool/SnipTool.ts"
  "src/tools/ListPeersTool/ListPeersTool.ts"
  "src/tools/WorkflowTool/bundled/index.ts"
  "src/tools/WorkflowTool/WorkflowTool.ts"
  "src/tools/WorkflowTool/createWorkflowCommand.ts"
  "src/tools/WorkflowTool/WorkflowPermissionRequest.ts"
  "src/tools/TungstenTool/TungstenTool.ts"
  "src/tools/TungstenTool/TungstenLiveMonitor.ts"
  "src/tools/SendMessageTool/SendMessageTool.ts"
  "src/tools/SkillTool/SkillTool.ts"
  "src/tools/AgentTool/AgentTool.tsx"
  "src/tools/ReviewArtifactTool/ReviewArtifactTool.ts"
  "src/tools/MonitorTool/MonitorTool.ts"
  "src/services/skillSearch/localSearch.ts"
  "src/services/skillSearch/remoteSkillState.ts"
  "src/services/skillSearch/remoteSkillLoader.ts"
  "src/services/skillSearch/telemetry.ts"
  "src/services/skillSearch/featureCheck.ts"
  "src/services/skillSearch/prefetch.ts"
  "src/services/sessionTranscript/sessionTranscript.ts"
  "src/services/compact/reactiveCompact.ts"
  "src/services/compact/snipCompact.ts"
  "src/services/compact/snipProjection.ts"
  "src/services/voice.ts"
  "src/services/mcp/auth.ts"
  "src/services/mcp/xaaIdpLogin.ts"
  "src/tasks/LocalWorkflowTask/LocalWorkflowTask.ts"
  "src/tasks/MonitorMcpTask/MonitorMcpTask.ts"
  "src/components/agents/SnapshotUpdateDialog.tsx"
  "src/components/agents/ToolSelector.tsx"
  "src/skills/bundled/index.ts"
  "src/skills/bundled/dream.ts"
  "src/skills/bundled/hunter.ts"
  "src/skills/bundled/runSkillGenerator.ts"
  "src/skills/bundled/verifyContent.ts"
  "src/skills/bundled/claudeApiContent.ts"
  "src/skills/mcpSkills.ts"
  "src/utils/sessionFileAccessHooks.ts"
  "src/utils/permissions/yoloClassifier.ts"
  "src/server/parseConnectUrl.ts"
  "src/server/server.ts"
  "src/server/sessionManager.ts"
  "src/server/backends/dangerousBackend.ts"
  "src/server/serverBanner.ts"
  "src/server/serverLog.ts"
  "src/server/lockfile.ts"
  "src/server/connectHeadless.ts"
  "src/utils/filePersistence/types.ts"
  "src/ssh/createSSHSession.ts"
  "src/bridge/initReplBridge.ts"
  "src/bridge/peerSessions.ts"
  "src/memdir/memoryShapeTelemetry.ts"
)

for f in "${missing_files[@]}"; do
  if [ ! -f "$f" ]; then
    mkdir -p "$(dirname "$f")"
    case "$f" in
      *.tsx)
        echo 'export {};' > "$f"
        ;;
      *.txt)
        echo "" > "$f"
        ;;
      *)
        echo 'export {};' > "$f"
        ;;
    esac
    echo "Created stub: $f"
  fi
done

echo "Done creating stubs"
