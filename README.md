# Add to Claude

A personal VSCode extension: **right-click files or folders in the Explorer →
"Add to Claude Code"** to @-mention them in the Claude Code chat.

## Why

Dragging a file from the Explorer into the Claude Code chat needs Shift held
during the drag: VS Code blocks pointer events on every webview while a drag is
in progress and only lifts the block when the drag events carry `shiftKey`.
On some macOS setups Shift never reaches those events, so the drop never lands
and the file opens in the editor instead. No extension can reach into another
extension's webview, so this one uses the clipboard.

## What it does

- **Add to Claude Code** in the Explorer context menu (multi-select works) and
  in the editor tab context menu.
- Builds one mention per item: `@src/app.ts`, `@src/components/` for folders,
  `@"path with spaces"` when needed. Paths are relative to the workspace folder.
- Focuses the Claude Code chat (`claude-vscode.focus`) and pastes the mentions
  into its input, then restores your previous clipboard.
- `addToClaude.autoPaste: false` skips the paste: the mentions stay on the
  clipboard for you to paste with `Cmd+V`.

## Test (dev)

1. Open this folder in VSCode.
2. `F5` → launches an "Extension Development Host" window with the extension active.
3. In that window, right-click a file in the Explorer → **Add to Claude Code**.

## Install

1. Build the package (needs Node; uses `@vscode/vsce` via `npx`):

   ```bash
   ./package.sh
   ```

2. Extensions view (`Cmd+Shift+X`) → **`...`** → **"Install from VSIX..."** →
   pick `add-to-claude-<version>.vsix`.
