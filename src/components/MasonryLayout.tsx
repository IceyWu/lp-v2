import { Children, type ReactNode } from "react";

interface MasonryLayoutProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
  className?: string;
}

export default function MasonryLayout({
  children,
  columns = 3,
  gap = 16,
  className = "",
}: MasonryLayoutProps) {
  const items = Children.toArray(children);

  return (
    <div
      className={`w-full ${className}`}
      style={{
        columnCount: columns,
        columnGap: `${gap}px`,
        columnFill: "balance",
      }}
    >
      {items.map((child) => (
        <div
          className="mb-4 w-full break-inside-avoid"
          key={(child as any).key ?? undefined}
          style={{
            display: "inline-block",
            width: "100%",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
