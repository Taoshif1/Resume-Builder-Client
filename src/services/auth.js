import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
const googleProvider = new GoogleAuthProvider();
const configuredAuth = () => {
  if (!auth)
    throw Object.assign(new Error("PersonaCV configuration is incomplete."), {
      code: "auth/configuration-not-found",
    });
  return auth;
};
export const loginUser = (email, password) => signInWithEmailAndPassword(configuredAuth(), email, password);
export async function registerUser(name, email, password) { const credential = await createUserWithEmailAndPassword(configuredAuth(), email, password); if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() }); return credential; }
export const googleLogin = () => signInWithPopup(configuredAuth(), googleProvider);
export const logoutUser = () => signOut(configuredAuth());
