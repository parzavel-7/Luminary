import { cn } from "../lib/utils";

interface SeverityBadgeProps {
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const styles = {
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
    serious: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    moderate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    minor: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm",
      styles[severity] || styles.minor,
      className
    )}>
      {severity}
    </span>
  );
}
