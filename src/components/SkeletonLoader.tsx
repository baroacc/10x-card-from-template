import { Skeleton } from './ui/skeleton';

interface SkeletonLoaderProps {
  'data-testid'?: string;
}

export function SkeletonLoader({ 'data-testid': dataTestId }: SkeletonLoaderProps) {
  return (
    <div className="space-y-4 mt-8" data-testid={dataTestId || "skeleton-loader"}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[250px]" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4 border rounded-lg p-6" data-testid={`skeleton-item-${i}`}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  );
} 