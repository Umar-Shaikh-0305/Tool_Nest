/**
 * ToolNest Client-Side & Supabase Authentication & History Isolation
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

const STORAGE_KEY_USER = "toolnest_active_user";
const STORAGE_KEY_USERS_DB = "toolnest_registered_users_db";

export function getActiveUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEY_USER);
  } else {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }
  window.dispatchEvent(new Event("toolnest_auth_change"));
}

export function signupUser(email: string, password: string, name?: string): { success: boolean; error?: string; user?: AuthUser } {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters long." };
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    const dbRaw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const db: Record<string, { id: string; email: string; password: string; name?: string; created_at?: string }> = dbRaw ? JSON.parse(dbRaw) : {};

    if (db[cleanEmail]) {
      return { success: false, error: "An account with this email already exists. Please sign in." };
    }

    const newUser: AuthUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split("@")[0],
      created_at: new Date().toISOString(),
    };

    db[cleanEmail] = { ...newUser, password };
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
    setActiveUser(newUser);

    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create account" };
  }
}

export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { success: false, error: "Please enter your password." };
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    const dbRaw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const db: Record<string, { id: string; email: string; password: string; name?: string; created_at?: string }> = dbRaw ? JSON.parse(dbRaw) : {};

    const existing = db[cleanEmail];
    if (!existing) {
      const newUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        created_at: new Date().toISOString(),
      };
      db[cleanEmail] = { ...newUser, password };
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
      setActiveUser(newUser);
      return { success: true, user: newUser };
    }

    if (existing.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const user: AuthUser = {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      created_at: existing.created_at,
    };
    setActiveUser(user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sign in" };
  }
}

export function logoutUser(): void {
  setActiveUser(null);
}

export function getUserHistory(userEmail?: string): any[] {
  if (typeof window === "undefined") return [];
  const targetEmail = userEmail?.toLowerCase() || getActiveUser()?.email.toLowerCase();
  if (!targetEmail) return [];
  try {
    const raw = localStorage.getItem(`toolnest_history_${targetEmail}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserHistoryItem(item: any, userEmail?: string): void {
  if (typeof window === "undefined") return;
  const targetEmail = userEmail?.toLowerCase() || getActiveUser()?.email.toLowerCase();
  if (!targetEmail) return;
  try {
    const existing = getUserHistory(targetEmail);
    const updated = [item, ...existing.filter((i) => i.id !== item.id).slice(0, 49)];
    localStorage.setItem(`toolnest_history_${targetEmail}`, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error saving user history", e);
  }
}

export function clearUserHistory(userEmail?: string): void {
  if (typeof window === "undefined") return;
  const targetEmail = userEmail?.toLowerCase() || getActiveUser()?.email.toLowerCase();
  if (!targetEmail) return;
  localStorage.removeItem(`toolnest_history_${targetEmail}`);
}
