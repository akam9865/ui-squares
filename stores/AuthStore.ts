import { makeAutoObservable, runInAction } from "mobx";

class AuthStore {
  username: string | null = null;
  isAdmin: boolean = false;
  isAuthenticated: boolean = false;
  isLoading: boolean = true;
  sessionChecked: boolean = false;

  // Share session state
  shareDisplayName: string | null = null;
  shareBoardId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isShareUser(): boolean {
    return this.shareDisplayName !== null && !this.isAuthenticated;
  }

  async checkSession() {
    // Skip if already checked
    if (this.sessionChecked) {
      return;
    }

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
        this.sessionChecked = true;
      });
    } catch {
      runInAction(() => {
        this.username = null;
        this.isAdmin = false;
        this.isAuthenticated = false;
        this.isLoading = false;
        this.sessionChecked = true;
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
        this.sessionChecked = false;
        this.isLoading = true;
      });
    }
  }

  async checkShareSession(boardId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/share/${boardId}/session`);
      const data = await response.json();

      if (data.valid) {
        runInAction(() => {
          this.shareDisplayName = data.displayName;
          this.shareBoardId = boardId;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async setShareDisplayName(
    displayName: string,
    shareToken: string,
    boardId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/share/${boardId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, shareToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      runInAction(() => {
        this.shareDisplayName = data.displayName;
        this.shareBoardId = boardId;
      });

      return { success: true };
    } catch {
      return { success: false, error: "Failed to set display name" };
    }
  }
}

export const authStore = new AuthStore();
