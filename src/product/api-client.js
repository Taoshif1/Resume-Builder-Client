async function errorPayload(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {};
  return response.json().catch(() => ({}));
}

const TRANSIENT_STATUS = new Set([502, 503, 504]);

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (!signal) return;
    if (signal.aborted) {
      clearTimeout(timer);
      reject(signal.reason || new DOMException("Aborted", "AbortError"));
      return;
    }
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason || new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

export async function requestApi(
  auth,
  baseUrl,
  path,
  { method = "GET", body, signal, blob = false } = {},
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in required.");

  const canRetryTransient =
    (method === "PUT" && path === "/admin/settings") ||
    (method === "GET" && path === "/admin");

  const request = async (forceRefresh = false) => {
    const token = await user.getIdToken(forceRefresh);
    try {
      return await fetch(baseUrl + "/api" + path, {
        method,
        signal,
        headers: {
          Authorization: "Bearer " + token,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw Object.assign(
        new Error(
          "Unable to reach PersonaCV right now. Check your connection and retry.",
        ),
        { status: 0, cause: error },
      );
    }
  };

  const requestWithTransientRetry = async (forceRefresh = false) => {
    try {
      let response = await request(forceRefresh);
      if (canRetryTransient && TRANSIENT_STATUS.has(response.status)) {
        await wait(250, signal);
        response = await request(forceRefresh);
      }
      return response;
    } catch (error) {
      if (!canRetryTransient || error.status !== 0) throw error;
      await wait(250, signal);
      return request(forceRefresh);
    }
  };

  let response = await requestWithTransientRetry();

  if (response.status === 401 && auth.currentUser?.uid === user.uid) {
    response = await requestWithTransientRetry(true);
  }

  if (auth.currentUser?.uid !== user.uid)
    throw new Error("Account changed. Please retry.");

  if (!response.ok) {
    const data = await errorPayload(response);
    const fallback = TRANSIENT_STATUS.has(response.status)
      ? "PersonaCV is temporarily unavailable. Please retry in a moment."
      : `PersonaCV request failed (HTTP ${response.status}). Please retry.`;
    throw Object.assign(new Error(data.error || fallback), {
      status: response.status,
    });
  }

  if (blob) return response.blob();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "PersonaCV API returned an invalid response. Please retry or contact support.",
    );
  }

  return response.json();
}
