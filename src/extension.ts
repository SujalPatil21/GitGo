import * as vscode from "vscode";
import { publishSolution } from "./commands/publishSolution";
import { changeRepository } from "./commands/changeRepository";
import { configureDashboard } from "./commands/configureDashboard";
import { syncDashboard } from "./commands/syncDashboard";

export function activate(context: vscode.ExtensionContext) {

  const publishCmd = vscode.commands.registerCommand(
    "gitgo.publishSolution",
    publishSolution
  );

  const changeRepoCmd = vscode.commands.registerCommand(
    "gitgo.changeRepository",
    changeRepository
  );

  const configureDashboardCmd = vscode.commands.registerCommand(
    "gitgo.configureDashboard",
    configureDashboard
  );

  const syncDashboardCmd = vscode.commands.registerCommand(
    "gitgo.syncDashboard",
    syncDashboard
  );

  context.subscriptions.push(publishCmd);
  context.subscriptions.push(changeRepoCmd);
  context.subscriptions.push(configureDashboardCmd);
  context.subscriptions.push(syncDashboardCmd);
}

export function deactivate() {}
