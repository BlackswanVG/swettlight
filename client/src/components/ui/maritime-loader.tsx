import { cn } from "@/lib/utils";
import { Ship, Anchor, Waves } from "lucide-react";

interface MaritimeLoaderProps {
  variant?: "ship" | "anchor" | "waves";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function MaritimeLoader({
  variant = "ship",
  size = "default",
  className,
}: MaritimeLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = {
    ship: "animate-float",
    anchor: "animate-bounce",
    waves: "animate-wave",
  };

  const Icon = {
    ship: Ship,
    anchor: Anchor,
    waves: Waves,
  }[variant];

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "text-primary",
          containerClasses[variant],
          className
        )}
      >
        <Icon className={cn("animate-pulse", sizeClasses[size])} />
      </div>
    </div>
  );
}