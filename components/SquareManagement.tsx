"use client";

import { useState, useTransition } from "react";
import { Square } from "@/types";
import { togglePaidAction, clearSquareAction } from "@/app/admin/actions";

interface SquareManagementProps {
  squares: Square[];
  onUpdate: () => void;
}

export function SquareManagement({ squares, onUpdate }: SquareManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

  const filteredSquares = squares.filter((square) => {
    if (filter === "paid") return square.paid;
    if (filter === "unpaid") return !square.paid;
    return true;
  });

  const paidCount = squares.filter((s) => s.paid).length;
  const unpaidCount = squares.filter((s) => !s.paid).length;

  const handleTogglePaid = (square: Square) => {
    startTransition(async () => {
      await togglePaidAction(square.row, square.col, !square.paid);
      onUpdate();
    });
  };

  const handleClear = (square: Square) => {
    if (!confirm(`Clear square [${square.row}, ${square.col}] owned by ${square.owner}?`)) {
      return;
    }
    startTransition(async () => {
      await clearSquareAction(square.row, square.col);
      onUpdate();
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            All ({squares.length})
          </button>
          <button
            onClick={() => setFilter("unpaid")}
            className={`px-3 py-1 rounded ${
              filter === "unpaid" ? "bg-red-600 text-white" : "bg-gray-200"
            }`}
          >
            Unpaid ({unpaidCount})
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-3 py-1 rounded ${
              filter === "paid" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Paid ({paidCount})
          </button>
        </div>
        {isPending && <span className="text-gray-500">Updating...</span>}
      </div>

      {filteredSquares.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No squares to display</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Position</th>
                <th className="border p-2 text-left">Owner</th>
                <th className="border p-2 text-left">Claimed</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSquares.map((square) => (
                <tr key={`${square.row}-${square.col}`} className="hover:bg-gray-50">
                  <td className="border p-2">
                    [{square.row}, {square.col}]
                  </td>
                  <td className="border p-2 font-medium">{square.owner}</td>
                  <td className="border p-2 text-sm text-gray-600">
                    {square.claimedAt
                      ? new Date(square.claimedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="border p-2">
                    {square.paid ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePaid(square)}
                        disabled={isPending}
                        className={`px-2 py-1 text-xs rounded ${
                          square.paid
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        } disabled:opacity-50`}
                      >
                        {square.paid ? "Mark Unpaid" : "Mark Paid"}
                      </button>
                      <button
                        onClick={() => handleClear(square)}
                        disabled={isPending}
                        className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
