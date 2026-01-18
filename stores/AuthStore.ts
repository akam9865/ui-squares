import { makeAutoObservable, runInAction } from "mobx";

class AuthStore {
  username: string | null = null;
  isAdmin: boolean = false;
  isAuthenticated: boolean = false;
  isLoading: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  async checkSession() {
    try {
      const response = await fetch("/api/session");
      const data = await response.json();

      runInAction(() => {
        if (data.authenticated) {
          this.username = data.username;
          this.isAdmin = data.isAdmin;
          this.isAuthenticated = true;
        } else {
          this.username = null;
          this.isAdmin = false;
          this.isAuthenticated = false;
        }
        this.isLoading = false;
      });
    } catch {
      runInAction(() => {
        this.username = null;
        this.isAdmin = false;
        this.isAuthenticated = false;
        this.isLoading = false;
      });
    }
  }

  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      runInAction(() => {
        this.username = data.username;
        this.isAdmin = data.isAdmin;
        this.isAuthenticated = true;
      });

      return { success: true };
    } catch {
      return { success: false, error: "Failed to login" };
    }
  }

  async logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      runInAction(() => {
        this.username = null;
        this.isAdmin = false;
        this.isAuthenticated = false;
      });
    }
  }
}

export const authStore = new AuthStore();
