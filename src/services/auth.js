import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
const googleProvider = new GoogleAuthProvider();
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export async function registerUser(name, email, password) { const credential = await createUserWithEmailAndPassword(auth, email, password); if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() }); return credential; }
export const googleLogin = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);
