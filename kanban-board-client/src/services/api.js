const API_BASE_URL = "http://localhost:4000";

/* -------------------- HELPERS -------------------- */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldFail() {
  return Math.random() < 0.1; // 10% simulated failure
}

/* -------------------- SYNC ACTION -------------------- */

export async function syncAction(syncItem) {
  await delay(400 + Math.random() * 600);

  if (shouldFail()) {
    throw new Error("Simulated network failure");
  }

  const res = await fetch(`${API_BASE_URL}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(syncItem),
  });

  if (res.status === 409) {
    const conflict = await res.json();
    const err = new Error("Version conflict");
    err.type = "CONFLICT";
    err.data = conflict;
    throw err;
  }

  if (!res.ok) {
    throw new Error("Server error");
  }

  return res.json();
}

/* -------------------- SERVER STATE -------------------- */

export async function getServerState() {
  try {
    const res = await fetch(`${API_BASE_URL}/state`);

    if (!res.ok) {
      throw new Error("Failed to fetch server state");
    }

    return res.json();
  } catch (err) {
    console.error("getServerState failed:", err);
    return { exists: false };
  }
}

/* -------------------- SNAPSHOT MIGRATION -------------------- */

export async function migrateSnapshot(snapshot) {
  const res = await fetch(`${API_BASE_URL}/migrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });

  if (!res.ok) {
    throw new Error("Migration failed");
  }

  return res.json();
}
