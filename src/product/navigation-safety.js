export function shouldBlockNavigation(dirty, bypass = false) {
  return Boolean(dirty && !bypass);
}

export function createBeforeUnloadHandler(getDirty) {
  return (event) => {
    if (!getDirty()) return;
    event.preventDefault();
    event.returnValue = "";
  };
}
