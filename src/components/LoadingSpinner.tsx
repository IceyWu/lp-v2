import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'spinner' | 'skeleton';
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  variant = 'spinner' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        sizeClasses[size], 
        "border-2 border-muted border-t-primary rounded-full animate-spin"
      )}></div>
    </div>
  );
}