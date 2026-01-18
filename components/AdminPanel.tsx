"use client";

import { observer } from "mobx-react-lite";
import { useState } from "react";
import { authStore } from "@/stores/AuthStore";
import { boardStore } from "@/stores/BoardStore";

export const AdminPanel = observer(function AdminPanel() {
  const [isRandomizing, setIsRandomizing] = useState(false);

  if (!authStore.isAdmin) {
    return null;
  }

  if (boardStore.numbersLocked) {
    return null;
  }

  const handleRandomize = async () => {
    if (isRandomizing) return;

    const confirmed = window.confirm(
      "Are you sure you want to randomize the numbers? This can only be done once."
    );

    if (!confirmed) return;

    setIsRandomizing(true);
    const result = await boardStore.randomizeNumbers();

    if (!result.success) {
      alert(result.error || "Failed to randomize numbers");
    }

    setIsRandomizing(false);
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleRandomize}
        disabled={isRandomizing}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRandomizing ? "Randomizing..." : "Randomize Numbers"}
      </button>
    </div>
  );
});
