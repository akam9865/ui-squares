"use client";

import { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authStore } from "@/stores/AuthStore";
import { BoardMeta } from "@/types";
import { listBoardsAction, createBoardAction } from "./actions";

const BoardsPage = observer(function BoardsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardId, setNewBoardId] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [newGameId, setNewGameId] = useState("");
  const [newSport, setNewSport] = useState<"nfl" | "cfb">("nfl");
  const [newPrice, setNewPrice] = useState("10");
  const [createError, setCreateError] = useState("");

  const fetchBoards = useCallback(async () => {
    try {
      const data = await listBoardsAction();
      setBoards(data);
    } catch (err) {
      console.error("Failed to fetch boards:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await authStore.checkSession();
      if (!authStore.isAuthenticated) {
        router.push(`/?redirect=${encodeURIComponent(pathname)}`);
      } else {
        fetchBoards();
      }
    };
    init();
  }, [router, fetchBoards, pathname]);

  const handleLogout = async () => {
    await authStore.logout();
    router.push("/");
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    const price = parseFloat(newPrice) || 10;

    const result = await createBoardAction(
      newBoardId,
      newBoardName,
      newGameId || null,
      newSport,
      price
    );

    if (result.success) {
      setShowCreateForm(false);
      setNewBoardId("");
      setNewBoardName("");
      setNewGameId("");
      setNewSport("nfl");
      setNewPrice("10");
      fetchBoards();
    } else {
      setCreateError(result.error || "Failed to create board");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading boards...</p>
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
          <h1 className="text-2xl font-bold">Squares Board Inc.</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {authStore.username}
              {authStore.isAdmin && " (Admin)"}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {authStore.isAdmin && (
          <div className="mb-6">
            {showCreateForm ? (
              <form
                onSubmit={handleCreateBoard}
                className="bg-white p-4 rounded-lg shadow"
              >
                <h3 className="font-semibold mb-4">Create New Board</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Board ID
                    </label>
                    <input
                      type="text"
                      value={newBoardId}
                      onChange={(e) => setNewBoardId(e.target.value)}
                      placeholder="super-bowl-2025"
                      className="w-full px-3 py-2 border rounded text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Super Bowl 20256"
                      className="w-full px-3 py-2 border rounded text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sport
                    </label>
                    <select
                      value={newSport}
                      onChange={(e) =>
                        setNewSport(e.target.value as "nfl" | "cfb")
                      }
                      className="w-full px-3 py-2 border rounded text-black"
                      required
                    >
                      <option value="nfl">NFL</option>
                      <option value="cfb">College Football (CFB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ESPN Game ID (optional)
                    </label>
                    <input
                      type="text"
                      value={newGameId}
                      onChange={(e) => setNewGameId(e.target.value)}
                      placeholder="401772982"
                      className="w-full px-3 py-2 border rounded text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price per Square ($)
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="10"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded text-black"
                      required
                    />
                  </div>
                </div>
                {createError && (
                  <p className="text-red-500 text-sm mb-4">{createError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + Create Board
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold p-4 border-b">Boards</h2>
          {boards.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No boards yet</p>
          ) : (
            <div className="divide-y">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{board.name}</h3>
                      <p className="text-sm text-gray-500">
                        {board.sport.toUpperCase()} • {board.claimedCount}/100
                        squares claimed
                        {board.gameId && ` • Game: ${board.gameId}`}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(board.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default BoardsPage;
