const serialize = (value) => JSON.stringify(value);

export function createSaveCoordinator({
  initialWorkspace,
  initialRevision,
  getWorkspace,
  persist,
  onChange = () => {},
}) {
  let revision = initialRevision;
  let saved = serialize(initialWorkspace);
  let state = "saved";
  let error = null;
  let requested = false;
  let active = null;

  const emit = (nextState, nextError = null) => {
    state = nextState;
    error = nextError;
    onChange({ state, error, revision, saved });
  };

  async function drain() {
    let result;
    while (requested) {
      requested = false;
      const snapshot = getWorkspace();
      const serialized = serialize(snapshot);
      if (serialized === saved) continue;
      emit("saving");
      try {
        result = await persist(snapshot, revision);
      } catch (saveError) {
        requested = false;
        emit(saveError.status === 409 ? "conflict" : "failed", saveError);
        throw saveError;
      }
      revision = result.revision;
      saved = serialized;
      const hasNewerEdits = serialize(getWorkspace()) !== saved;
      requested = hasNewerEdits;
      emit(hasNewerEdits ? "saving" : "saved");
    }
    return result;
  }

  return {
    save() {
      requested = true;
      if (!active) {
        active = drain().finally(() => {
          active = null;
        });
      }
      return active;
    },
    markChanged() {
      if (active) requested = true;
      if (state !== "saving" && state !== "failed" && state !== "conflict")
        emit("unsaved");
    },
    getState() {
      return { state, error, revision, saved, saving: Boolean(active) };
    },
  };
}

export function createAutosaveScheduler(
  save,
  {
    delay = 1500,
    setTimer = globalThis.setTimeout,
    clearTimer = globalThis.clearTimeout,
    onError = () => {},
  } = {},
) {
  let timer = null;
  return {
    schedule() {
      if (timer !== null) clearTimer(timer);
      timer = setTimer(() => {
        timer = null;
        Promise.resolve(save()).catch(onError);
      }, delay);
    },
    cancel() {
      if (timer !== null) clearTimer(timer);
      timer = null;
    },
  };
}
