import test from "node:test";
import assert from "node:assert/strict";
import {
  createAutosaveScheduler,
  createSaveCoordinator,
} from "./save-workspace.js";

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

function setup(persist) {
  let workspace = { value: "saved" };
  const states = [];
  const coordinator = createSaveCoordinator({
    initialWorkspace: workspace,
    initialRevision: 3,
    getWorkspace: () => workspace,
    persist,
    onChange: (state) => states.push(state),
  });
  return {
    coordinator,
    states,
    edit(value) {
      workspace = { value };
      coordinator.markChanged();
    },
  };
}

test("debounced autosave coalesces rapid edits into one delayed save", async () => {
  const timers = new Map();
  let timerId = 0;
  let saves = 0;
  const scheduler = createAutosaveScheduler(
    () => {
      saves += 1;
    },
    {
      delay: 1500,
      setTimer(callback, delay) {
        assert.equal(delay, 1500);
        timerId += 1;
        timers.set(timerId, callback);
        return timerId;
      },
      clearTimer(id) {
        timers.delete(id);
      },
    },
  );
  scheduler.schedule();
  scheduler.schedule();
  assert.equal(timers.size, 1);
  timers.values().next().value();
  await Promise.resolve();
  assert.equal(saves, 1);
});

test("save success advances the revision and marks the exact snapshot saved", async () => {
  const calls = [];
  const model = setup(async (workspace, revision) => {
    calls.push({ workspace, revision });
    return { revision: revision + 1 };
  });
  model.edit("new");
  await model.coordinator.save();
  assert.deepEqual(calls, [{ workspace: { value: "new" }, revision: 3 }]);
  assert.equal(model.coordinator.getState().state, "saved");
  assert.equal(model.coordinator.getState().revision, 4);
  assert.equal(model.coordinator.getState().saved, '{"value":"new"}');
});

test("save failure remains visible and preserves dirty data", async () => {
  const failure = Object.assign(new Error("offline"), { status: 0 });
  const model = setup(async () => {
    throw failure;
  });
  model.edit("local");
  await assert.rejects(model.coordinator.save(), /offline/);
  assert.equal(model.coordinator.getState().state, "failed");
  assert.equal(model.coordinator.getState().saved, '{"value":"saved"}');
  assert.equal(model.coordinator.getState().error, failure);
});

test("retry sends the latest local edit after a failed request", async () => {
  let attempts = 0;
  const values = [];
  const model = setup(async (workspace, revision) => {
    attempts += 1;
    values.push({ value: workspace.value, revision });
    if (attempts === 1) throw new Error("temporary failure");
    return { revision: revision + 1 };
  });
  model.edit("first");
  await assert.rejects(model.coordinator.save());
  model.edit("newer after failure");
  await model.coordinator.save();
  assert.deepEqual(values, [
    { value: "first", revision: 3 },
    { value: "newer after failure", revision: 3 },
  ]);
  assert.equal(model.coordinator.getState().state, "saved");
});

test("concurrent save calls share one request instead of racing revisions", async () => {
  const request = deferred();
  let calls = 0;
  const model = setup(() => {
    calls += 1;
    return request.promise;
  });
  model.edit("new");
  const first = model.coordinator.save();
  const second = model.coordinator.save();
  assert.equal(first, second);
  assert.equal(calls, 1);
  request.resolve({ revision: 4 });
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(model.coordinator.getState().state, "saved");
});

test("stale revision conflicts are distinct and never advance the baseline", async () => {
  const conflict = Object.assign(new Error("Another tab saved changes."), {
    status: 409,
  });
  const model = setup(async () => {
    throw conflict;
  });
  model.edit("local");
  await assert.rejects(model.coordinator.save(), /Another tab/);
  assert.equal(model.coordinator.getState().state, "conflict");
  assert.equal(model.coordinator.getState().revision, 3);
  assert.equal(model.coordinator.getState().saved, '{"value":"saved"}');
});

test("edits made during a save are queued with the returned revision", async () => {
  const requests = [deferred(), deferred()];
  const calls = [];
  const model = setup((workspace, revision) => {
    calls.push({ value: workspace.value, revision });
    return requests[calls.length - 1].promise;
  });
  model.edit("first");
  const saving = model.coordinator.save();
  model.edit("second");
  requests[0].resolve({ revision: 4 });
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(calls, [
    { value: "first", revision: 3 },
    { value: "second", revision: 4 },
  ]);
  requests[1].resolve({ revision: 5 });
  await saving;
  assert.equal(model.coordinator.getState().state, "saved");
  assert.equal(model.coordinator.getState().saved, '{"value":"second"}');
});
