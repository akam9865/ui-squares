"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { boardStore } from "@/stores/BoardStore";
import { Square } from "./Square";

export const Board = observer(function Board() {
  useEffect(() => {
    boardStore.startPolling();
    return () => {
      boardStore.stopPolling();
    };
  }, []);

  if (boardStore.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading board...</p>
      </div>
    );
  }

  if (boardStore.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{boardStore.error}</p>
      </div>
    );
  }

  const displayRowNumbers = boardStore.numbersLocked
    ? boardStore.rowNumbers
    : Array(10).fill("?");
  const displayColNumbers = boardStore.numbersLocked
    ? boardStore.colNumbers
    : Array(10).fill("?");

  return (
    <div className="inline-block">
      <div className="mb-2 text-center">
        <span className="text-lg font-bold text-blue-600">CHIEFS</span>
      </div>

      <div className="flex">
        <div className="w-8" />
        {displayColNumbers.map((num, idx) => (
          <div
            key={idx}
            className="w-12 h-8 flex items-center justify-center font-bold text-blue-600"
          >
            {num}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col">
          <div className="h-4" />
          {displayRowNumbers.map((num, idx) => (
            <div
              key={idx}
              className="w-8 h-12 flex items-center justify-center font-bold text-red-600"
            >
              {num}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
            <span className="text-lg font-bold text-red-600">EAGLES</span>
          </div>

          <div className="grid grid-cols-10 gap-0">
            {boardStore.squares.map((row, rowIdx) =>
              row.map((square, colIdx) => (
                <div key={`${rowIdx}-${colIdx}`} className="w-12 h-12">
                  <Square square={square} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
