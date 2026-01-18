"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/AuthStore";
import { Board } from "@/components/Board";
import { AdminPanel } from "@/components/AdminPanel";
import { Score } from "@/components/Score";

const BoardPage = observer(function BoardPage() {
  const router = useRouter();

  useEffect(() => {
    authStore.checkSession();
  }, []);

  useEffect(() => {
    if (!authStore.isLoading && !authStore.isAuthenticated) {
      router.push("/");
    }
  }, [authStore.isLoading, authStore.isAuthenticated, router]);

  const handleLogout = async () => {
    await authStore.logout();
    router.push("/");
  };

  if (authStore.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authStore.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Super Bowl Squares</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {authStore.username}
              {authStore.isAdmin && " (Admin)"}
            </span>
            {authStore.isAdmin && (
              <a
                href="/admin"
                className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded"
              >
                Manage Squares
              </a>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <AdminPanel />

        <div className="mb-6">
          <Score team1="BUF" team2="DEN" pollInterval={10000} />
        </div>

        <div className="flex justify-center">
          <Board />
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Click on an empty square to claim it.</p>
          <p>
            Green squares are yours, gray squares are claimed by others.
          </p>
        </div>
      </div>
    </div>
  );
});

export default BoardPage;
