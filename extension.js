const vscode = require("vscode");
const path = require("path");

// The Claude Code webview cannot receive drops from the Explorer when VS Code
// does not see Shift during the drag (macOS). No extension can reach into
// another extension's webview, so this one goes through the clipboard: build
// "@path" mentions, focus the chat, paste.

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("addToClaude.add", (uri, uris) =>
      addToClaude(uri, uris)
    )
  );
}

async function addToClaude(uri, uris) {
  const targets = uris && uris.length ? uris : uri ? [uri] : activeUri();
  if (!targets.length) {
    vscode.window.showInformationMessage("Nothing selected to add to Claude.");
    return;
  }

  const mentions = [];
  for (const u of targets) mentions.push(await mentionFor(u));
  const text = mentions.join(" ") + " ";

  const previous = await vscode.env.clipboard.readText();
  await vscode.env.clipboard.writeText(text);

  try {
    await vscode.commands.executeCommand("claude-vscode.focus");
  } catch (err) {
    vscode.window.showWarningMessage(
      `Copied ${mentions.length} mention(s), but could not focus Claude Code: ${err.message}`
    );
    return;
  }

  const autoPaste = vscode.workspace
    .getConfiguration("addToClaude")
    .get("autoPaste", true);
  if (!autoPaste) {
    vscode.window.setStatusBarMessage(
      `Claude: copied ${mentions.join(" ")} — press Cmd+V`,
      5000
    );
    return;
  }

  // The chat webview needs a moment to take focus before the paste lands.
  await delay(150);
  await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
  await delay(150);
  await vscode.env.clipboard.writeText(previous);
}

function activeUri() {
  const ed = vscode.window.activeTextEditor;
  return ed ? [ed.document.uri] : [];
}

// "@relative/path" for files, "@relative/dir/" for folders. Relative to the
// workspace folder that contains the item (Claude Code sessions start there);
// absolute when outside every workspace folder. Paths with spaces are quoted,
// the way Claude Code writes them.
async function mentionFor(uri) {
  let p = vscode.workspace.asRelativePath(uri, false);
  if (path.isAbsolute(p)) p = uri.fsPath;
  if (await isDirectory(uri)) p = p.replace(/\/?$/, "/");
  return /\s/.test(p) ? `@"${p}"` : `@${p}`;
}

async function isDirectory(uri) {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return (stat.type & vscode.FileType.Directory) !== 0;
  } catch {
    return false;
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function deactivate() {}

module.exports = { activate, deactivate };
