"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { authStore } from "@/stores/AuthStore";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const AuthenticatedLayout = observer(({
  children,
  requireAdmin = false,
}: AuthenticatedLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const isAdminPage = pathname.startsWith("/admin");
  const isBoardPage = pathname.startsWith("/board/");
  const hasShareToken = searchParams.get("share") !== null;

  useEffect(() => {
    authStore.checkSession();
  }, []);

  useEffect(() => {
    // Skip auth redirect if this is a share link on a board page
    const isShareAccess = isBoardPage && (hasShareToken || authStore.isShareUser);

    if (!authStore.isLoading && !authStore.isAuthenticated && !isShareAccess) {
      router.push(`/?redirect=${encodeURIComponent(pathname)}`);
    } else if (requireAdmin && !authStore.isLoading && !authStore.isAdmin) {
      router.push(boardId ? `/board/${boardId}` : "/boards");
    }
  }, [authStore.isLoading, authStore.isAuthenticated, authStore.isAdmin, authStore.isShareUser, router, pathname, boardId, requireAdmin, isBoardPage, hasShareToken]);

  if (authStore.isLoading && !authStore.sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Allow share users on board pages
  const isShareAccess = isBoardPage && (hasShareToken || authStore.isShareUser);

  if (!authStore.isAuthenticated && !isShareAccess) {
    return null;
  }

  if (requireAdmin && !authStore.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Squares Board Inc.</h1>
          <div className="flex items-center gap-4">
            {authStore.isShareUser && (
              <span className="text-sm text-gray-600">
                Viewing as: <span className="font-medium">{authStore.shareDisplayName}</span>
              </span>
            )}
            {isAdminPage && boardId && (
              <Link
                href={`/board/${boardId}`}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Back to Board
              </Link>
            )}
            {!isAdminPage && authStore.isAdmin && boardId && !authStore.isShareUser && (
              <Link
                href={`/admin/${boardId}`}
                className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded"
              >
                Manage Squares
              </Link>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
});
