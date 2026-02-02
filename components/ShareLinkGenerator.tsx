"use client";

import { useState } from "react";
import { observer } from "mobx-react-lite";

interface ShareLinkGeneratorProps {
  boardId: string;
}

export const ShareLinkGenerator = observer(({ boardId }: ShareLinkGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);

    try {
      const response = await fetch(`/api/board/${boardId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate share link");
      }

      const data = await response.json();
      setShareUrl(data.url);
    } catch (err) {
      console.error("Failed to generate share link:", err);
      alert("Failed to generate share link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Share Link</h2>
      <p className="text-sm text-gray-600 mb-4">
        Generate a share link to let others claim squares with their display name.
        Share users can only claim empty squares - they cannot unclaim or access admin features.
      </p>

      {!shareUrl ? (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Share Link"}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 border rounded bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-sm text-blue-600 hover:underline"
          >
            Generate new link
          </button>
        </div>
      )}
    </div>
  );
});
