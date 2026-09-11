import { assertWorkspace, isRecord } from "../data/workspace.js";

export const LEGACY_STORAGE_KEY = "resume-data";
export const workspaceStorageKey = (uid) => `personacv:workspace:v1:${uid}`;

export class WorkspaceStorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "WorkspaceStorageError";
    this.cause = cause;
  }
}

const getStorage = (storage) => {
  if (storage) return storage;
  try {
    return globalThis.localStorage;
  } catch (error) {
    throw new WorkspaceStorageError("Workspace storage is unavailable.", error);
  }
};

export function loadWorkspace(uid, storage) {
  if (!uid) return null;
  const target = getStorage(storage);
  if (!target) return null;
  let raw;
  try {
    raw = target.getItem(workspaceStorageKey(uid));
  } catch (error) {
    throw new WorkspaceStorageError("Unable to read workspace storage.", error);
  }
  if (!raw) return null;
  let workspace;
  try {
    workspace = JSON.parse(raw);
  } catch (error) {
    throw new WorkspaceStorageError("Stored workspace is not valid JSON.", error);
  }
  try {
    return assertWorkspace(workspace, uid);
  } catch (error) {
    throw new WorkspaceStorageError("Stored workspace failed validation.", error);
  }
}

export function saveWorkspace(workspace, storage) {
  const target = getStorage(storage);
  if (!target) {
    throw new WorkspaceStorageError("Workspace storage is unavailable.");
  }
  assertWorkspace(workspace, workspace.ownerUid);
  try {
    target.setItem(workspaceStorageKey(workspace.ownerUid), JSON.stringify(workspace));
    return true;
  } catch (error) {
    throw new WorkspaceStorageError("Unable to save workspace.", error);
  }
}

export function readLegacyResume(storage) {
  const target = getStorage(storage);
  if (!target) return null;
  try {
    const raw = target.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    return isRecord(value) ? value : null;
  } catch (error) {
    console.error("Legacy resume data is malformed and was ignored.", error);
    return null;
  }
}
