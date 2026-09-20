import test from "node:test";
import assert from "node:assert/strict";
import {
  editorShortcut,
  emptyHistory,
  recordHistory,
  redoHistory,
  undoHistory,
} from "./editor-history.js";
import {
  createBeforeUnloadHandler,
  shouldBlockNavigation,
} from "./navigation-safety.js";

test("navigation is blocked only while dirty and can be explicitly bypassed", () => {
  assert.equal(shouldBlockNavigation(true), true);
  assert.equal(shouldBlockNavigation(false), false);
  assert.equal(shouldBlockNavigation(true, true), false);
});

test("browser unload warns for dirty workspaces and leaves clean workspaces alone", () => {
  let dirty = true;
  let prevented = 0;
  const event = {
    returnValue: undefined,
    preventDefault() {
      prevented += 1;
    },
  };
  const handler = createBeforeUnloadHandler(() => dirty);
  handler(event);
  assert.equal(prevented, 1);
  assert.equal(event.returnValue, "");
  dirty = false;
  event.returnValue = undefined;
  handler(event);
  assert.equal(prevented, 1);
  assert.equal(event.returnValue, undefined);
});

test("undo and redo preserve both history stacks", () => {
  const original = { value: "a" };
  const changed = { value: "b" };
  const history = recordHistory(emptyHistory(), original);
  const undone = undoHistory(history, changed);
  assert.deepEqual(undone.workspace, original);
  assert.equal(undone.history.undo.length, 0);
  assert.deepEqual(undone.history.redo, [changed]);
  const redone = redoHistory(undone.history, original);
  assert.deepEqual(redone.workspace, changed);
  assert.deepEqual(redone.history.undo, [original]);
  assert.equal(redone.history.redo.length, 0);
});

test("keyboard shortcuts support Ctrl and Cmd save, undo, and redo", () => {
  assert.equal(editorShortcut({ ctrlKey: true, metaKey: false, shiftKey: false, key: "s" }), "save");
  assert.equal(editorShortcut({ ctrlKey: false, metaKey: true, shiftKey: false, key: "S" }), "save");
  assert.equal(editorShortcut({ ctrlKey: true, metaKey: false, shiftKey: false, key: "z" }), "undo");
  assert.equal(editorShortcut({ ctrlKey: false, metaKey: true, shiftKey: true, key: "Z" }), "redo");
  assert.equal(editorShortcut({ ctrlKey: false, metaKey: false, shiftKey: false, key: "z" }), null);
});
