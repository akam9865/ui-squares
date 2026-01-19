export const Quarters = {
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  F: "F",
} as const;

export type Quarter = (typeof Quarters)[keyof typeof Quarters];

export interface WinningBadgeProps {
  quarter: Quarter;
  size?: "sm" | "md" | "lg";
}

export function WinningBadge({ quarter, size = "md" }: WinningBadgeProps) {
  const isFinal = quarter === "F";

  const sizeClasses = {
    sm: "w-4 h-4 text-[7px]",
    md: "w-5 h-5 text-[9px]",
    lg: "w-6 h-6 text-[10px]",
  };

  return (
    <div
      className={`${
        sizeClasses[size]
      } rounded-full flex items-center justify-center ${
        isFinal ? "bg-yellow-500" : "bg-blue-500"
      }`}
    >
      <span className="font-bold text-white">{quarter}</span>
    </div>
  );
}
