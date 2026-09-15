import { firebaseServices } from "./firebase.js";
const uid = process.env.OWNER_BOOTSTRAP_UID;
if (!uid || uid.includes("/"))
  throw new Error("Set OWNER_BOOTSTRAP_UID to an existing Firebase Auth UID.");
const { auth, db } = firebaseServices();
const user = await auth.getUser(uid);
await db
  .collection("users")
  .doc(uid)
  .set(
    {
      uid,
      email: user.email || "",
      displayName: user.displayName || "",
      role: "owner",
      plan: "pro",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );
console.log(
  "Owner role persisted. Remove OWNER_BOOTSTRAP_UID from the environment.",
);
