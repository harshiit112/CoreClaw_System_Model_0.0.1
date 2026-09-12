#!/usr/bin/env bun

import { Command } from "commander";
import { runWakeup } from "./tui/wakeup";

const program = new Command();

program.name("CoreClaw").description("CoreClaw Model").version("0.0.1");

program
    .command("wakeup")
    .description("Show the banner and pick CLI or Telegram mode")
    .action(async () => {
        await runWakeup()
    });

await program.parseAsync(process.argv);
