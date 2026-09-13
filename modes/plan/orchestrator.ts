import chalk from "chalk";
import { confirm, isCancel } from "@clack/prompts";
import { ToolLoopAgent, stepCountIs } from "ai";
import { getAgentModel } from "../../ai";
import { ActionTracker } from "../agent/action-tracker";
import { ToolExecutor } from "../agent/tool-executor";
import { createAgentTools } from "../agent/agent-tools";
import { defaultAgentConfig } from "../agent/types";
import { runApprovalFlow } from "../agent/approval";
import { renderTerminalMarkdown } from "../../tui/terminal-md";


export async function runPlanMode():Promise<void> {
    console.log(chalk.bold("\n🧭 Plan Mode\n"))
}