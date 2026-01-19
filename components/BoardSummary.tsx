"use client";

import { observer } from "mobx-react-lite";
import { boardStore } from "@/stores/BoardStore";

export const BoardSummary = observer(function BoardSummary() {
  const filledSquares = boardStore.filledSquaresCount;
  const emptySquares = boardStore.emptySquaresCount;
  const totalPaid = boardStore.totalPaidCount;
  const stats = boardStore.userStats;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">Board Summary</h3>
        <div className="text-sm text-gray-600">
          <span className="mr-4">Filled: {filledSquares}</span>
          <span className="mr-4">Empty: {emptySquares}</span>
          <span>Paid: {totalPaid}</span>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">Paid</th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">Unpaid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                No squares claimed yet
              </td>
            </tr>
          ) : (
            stats.map((stat) => (
              <tr key={stat.displayName} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{stat.displayName}</td>
                <td className="px-4 py-2 text-right">{stat.totalSquares}</td>
                <td className="px-4 py-2 text-right text-green-600">{stat.paidSquares}</td>
                <td className="px-4 py-2 text-right text-red-600">{stat.unpaidSquares}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});
