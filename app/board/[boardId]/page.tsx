"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter, useParams, usePathname } from "next/navigation";
import { authStore } from "@/stores/AuthStore";
import { boardStore } from "@/stores/BoardStore";
import { Board } from "@/components/Board";
import { AdminPanel } from "@/components/AdminPanel";
import { Score } from "@/components/Score";
import { UserStats } from "@/components/UserStats";
import { GameInfo } from "@/lib/espn";

const BoardPage = observer(function BoardPage() {
  const router = useRouter();
  const params = useParams<{ boardId: string }>();
  const pathname = usePathname();
  const boardId = params.boardId;
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    authStore.checkSession();
  }, []);

  useEffect(() => {
    if (!authStore.isLoading && !authStore.isAuthenticated) {
      router.push(`/?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authStore.isLoading, authStore.isAuthenticated, router, pathname]);

  useEffect(() => {
    const fetchGameInfo = async () => {
      if (boardStore.gameId && boardStore.sport) {
        try {
          const response = await fetch(
            `/api/game/${boardStore.gameId}?sport=${boardStore.sport}`
          );
          if (response.ok) {
            const data = await response.json();
            setGameInfo(data);
          }
        } catch (error) {
          console.error("Failed to fetch game info:", error);
        }
      }
    };

    if (!boardStore.isLoading) {
      fetchGameInfo();
    }
  }, [boardStore.gameId, boardStore.sport, boardStore.isLoading]);

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Squares Board Inc.</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {authStore.username}
              {authStore.isAdmin && " (Admin)"}
            </span>
            {authStore.isAdmin && (
              <a
                href={`/admin/${boardId}`}
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

        <div className="flex justify-center gap-6">
          <Board
            boardId={boardId}
            gameInfo={gameInfo}
            hoveredSquare={hoveredSquare}
          />
          <div className="flex flex-col gap-4 w-64 mt-[84px] h-[640px]">
            {boardStore.gameId && (
              <Score
                gameId={boardStore.gameId}
                sport={boardStore.sport}
                pollInterval={10000}
              />
            )}
            <UserStats
              homeTeam={gameInfo?.homeTeam.name}
              awayTeam={gameInfo?.awayTeam.name}
              onSquareHover={setHoveredSquare}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default BoardPage;
