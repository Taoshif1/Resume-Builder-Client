import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const googleLogin = () => {
  return signInWithPopup(auth, googleProvider);
};
export const logoutUser = () => {
  return signOut(auth);
};
