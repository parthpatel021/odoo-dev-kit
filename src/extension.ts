import * as vscode from "vscode";
import { SidebarViewProvider } from "./views/sidebar-provider";

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "odoo-dev-kit" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand("odoo-dev-kit.helloOdoo", () => {
			vscode.window.showInformationMessage("Hello Odooers from Parth!");
		}),
	);

	const sidebarProvider = new SidebarViewProvider(context, context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidebarViewProvider.viewType,
			sidebarProvider
		),
	);
	context.subscriptions.push(sidebarProvider);
}

export function deactivate() {}
