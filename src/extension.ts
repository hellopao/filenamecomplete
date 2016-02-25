'use strict';

import * as vscode from 'vscode';

import FilenameCompletionProvider from "./filenameCompletionProvider";

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.languages.registerCompletionItemProvider("*",new FilenameCompletionProvider(),'"', '\'', '/')

	context.subscriptions.push(disposable);
}

export function deactivate() {
}