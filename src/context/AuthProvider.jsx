import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth, authConfigurationError } from "../services/firebase";
import { logoutUser } from "../services/auth";
import {
  failedAuthState,
  initialAuthState,
  resolvedAuthState,
} from "../services/auth-state";
import toast from "react-hot-toast";

import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(() =>
    initialAuthState(authConfigurationError),
  );

  const logout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("We could not sign you out. Try again.");
      if (import.meta.env.DEV) console.error(error);
    }
  };

  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onIdTokenChanged(
      auth,
      (currentUser) => setState(resolvedAuthState(currentUser)),
      () => {
        setState(failedAuthState());
        toast.error("We could not restore your PersonaCV session.");
      },
    );

    return () => unsubscribe();
  }, []);

  const authInfo = {
    ...state,
    loading: state.status === "initializing",
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
