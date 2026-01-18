"use client";

import { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/AuthStore";
import { Square } from "@/types";
import { SquareManagement } from "@/components/SquareManagement";
import { getClaimedSquaresAction } from "./actions";

const AdminPage = observer(function AdminPage() {
  const router = useRouter();
  const [squares, setSquares] = useState<Square[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSquares = useCallback(async () => {
    try {
      const claimed = await getClaimedSquaresAction();
      setSquares(claimed);
    } catch (err) {
      console.error("Failed to fetch squares:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    authStore.checkSession();
  }, []);

  useEffect(() => {
    if (!authStore.isLoading && !authStore.isAuthenticated) {
      router.push("/");
    } else if (!authStore.isLoading && !authStore.isAdmin) {
      router.push("/board");
    }
  }, [authStore.isLoading, authStore.isAuthenticated, authStore.isAdmin, router]);

  useEffect(() => {
    if (authStore.isAdmin) {
      fetchSquares();
    }
  }, [authStore.isAdmin, fetchSquares]);

  const handleLogout = async () => {
    await authStore.logout();
    router.push("/");
  };

  if (authStore.isLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <a
              href="/board"
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Back to Board
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Square Management</h2>
          <SquareManagement squares={squares} onUpdate={fetchSquares} />
        </div>
      </div>
    </div>
  );
});

export default AdminPage;
