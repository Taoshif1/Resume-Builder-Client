export const emptyHistory = () => ({ undo: [], redo: [] });

export function recordHistory(history, workspace) {
  return { undo: [...history.undo.slice(-49), workspace], redo: [] };
}

export function undoHistory(history, currentWorkspace) {
  if (!history.undo.length) return null;
  return {
    workspace: history.undo.at(-1),
    history: {
      undo: history.undo.slice(0, -1),
      redo: [currentWorkspace, ...history.redo].slice(0, 50),
    },
  };
}

export function redoHistory(history, currentWorkspace) {
  if (!history.redo.length) return null;
  return {
    workspace: history.redo[0],
    history: {
      undo: [...history.undo, currentWorkspace].slice(-50),
      redo: history.redo.slice(1),
    },
  };
}

export function editorShortcut(event) {
  if (!(event.ctrlKey || event.metaKey)) return null;
  const key = event.key.toLowerCase();
  if (key === "s") return "save";
  if (key === "z") return event.shiftKey ? "redo" : "undo";
  return null;
}
