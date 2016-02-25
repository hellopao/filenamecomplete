"use strict";

import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";


function getRange(pos1: vscode.Position, pos2: vscode.Position): vscode.Range {
    return new vscode.Range(pos1, pos2)
}

function getPosition(line: number, character: number): vscode.Position {
    return new vscode.Position(line, character);
}

/**
 * get path string in quote
 * 
 * @param document vscode.TextDocument Document of the activeTextEditor
 * @param position vscode.Position Position of the cursor
 */
function getPathString(document: vscode.TextDocument, position: vscode.Position): string {
    let pathStr: string = "";

    // right quote position
    const rCharPos = getPosition(position.line, position.character + 1);
    // right quote character
    const rChar = document.getText(getRange(position, rCharPos));

    var searchIndex = rCharPos.character - 1;
    while (searchIndex > 0) {
        const searchPos = getPosition(position.line, searchIndex);
        const searchPosChar = document.getText(getRange(getPosition(position.line, searchIndex - 1), searchPos));

        if (searchPosChar === rChar || (rChar === ")" && searchPosChar === "(")) {
            pathStr = document.getText(getRange(getPosition(position.line, searchIndex), position));
            break;
        }
        searchIndex--;
    }

    return pathStr;
}

export default class FilenameCompletionProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

        const activeDocument = vscode.window.activeTextEditor.document;

        return new Promise((resolve, reject) => {
            var completionItems = [];

            const activeFilePath = path.dirname(activeDocument.fileName);
            const activeLineText = activeDocument.lineAt(position);

            const rChar = document.getText(getRange(position, getPosition(position.line, position.character + 1)));
            
            if ((rChar === ")" && /\.(css|less|scss|md)$/.test(activeDocument.fileName))
                || /\b(include|import|require|href|src)/.test(activeLineText.text)) {
                const pathStr = getPathString(activeDocument, position);

                const selectPath = path.join(activeFilePath, pathStr);
                fs.readdir(selectPath, (err, files) => {
                    if (err) {
                        reject(completionItems);
                    } else {
                        completionItems = files
                            .filter(file => path.join(selectPath,file) !== activeDocument.fileName)
                            .map(file => new vscode.CompletionItem(path.basename(file)));

                        resolve(completionItems);
                    }
                })
            } else {
                return resolve(completionItems);
            }
        })
    }
}