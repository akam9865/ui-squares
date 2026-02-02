"use client";

import { useState } from "react";
import { observer } from "mobx-react-lite";
import { authStore } from "@/stores/AuthStore";

interface DisplayNamePromptProps {
  boardId: string;
  shareToken: string;
  onSuccess: () => void;
}

export const DisplayNamePrompt = observer(
  ({ boardId, shareToken, onSuccess }: DisplayNamePromptProps) => {
    const [displayName, setDisplayName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!displayName.trim()) {
        setError("Please enter a display name");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const result = await authStore.setShareDisplayName(
        displayName.trim(),
        shareToken,
        boardId
      );

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to set display name");
      }

      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-semibold mb-4">Enter Your Name</h2>
          <p className="text-gray-600 mb-4">
            Enter your name to claim squares on this board. This name will be
            shown on any squares you claim.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full px-3 py-2 border rounded mb-4"
              autoFocus
              maxLength={50}
            />

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Joining..." : "Join Board"}
            </button>
          </form>
        </div>
      </div>
    );
  }
);
