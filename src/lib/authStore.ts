type AuthState = { loggedIn: boolean };

const STORAGE_KEY = "auth_logged_in";
const listeners = new Set<(state: AuthState) => void>();

const getInitial = (): AuthState => {
  if (typeof window === "undefined") return { loggedIn: false };
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return { loggedIn: stored === "true" };
};

let authState: AuthState = getInitial();

export const getAuthState = () => authState;

export const setAuthState = (next: AuthState) => {
  authState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(next.loggedIn));
  }
  listeners.forEach((cb) => cb(authState));
};

export const subscribeAuth = (cb: (state: AuthState) => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

