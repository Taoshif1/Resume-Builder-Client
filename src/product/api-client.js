async function errorPayload(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {};
  return response.json().catch(() => ({}));
}

export async function requestApi(
  auth,
  baseUrl,
  path,
  { method = "GET", body, signal, blob = false } = {},
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in required.");

  const request = async (forceRefresh = false) => {
    const token = await user.getIdToken(forceRefresh);
    return fetch(baseUrl + "/api" + path, {
      method,
      signal,
      headers: {
        Authorization: "Bearer " + token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let response = await request();

  if (response.status === 401 && auth.currentUser?.uid === user.uid) {
    response = await request(true);
  }

  if (auth.currentUser?.uid !== user.uid)
    throw new Error("Account changed. Please retry.");

  if (!response.ok) {
    const data = await errorPayload(response);
    throw Object.assign(
      new Error(data.error || "Unable to contact PersonaCV. Please try again."),
      { status: response.status },
    );
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
