import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function PostCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden border transition-all duration-500 rounded-2xl">
      {/* 图片骨架 */}
      <Skeleton className="w-full h-48 rounded-t-2xl" />
      
      {/* 内容骨架 */}
      <CardContent className="p-5">
        {/* 标题骨架 */}
        <Skeleton className="h-6 w-3/4 mb-3" />
        
        {/* 内容骨架 */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* 标签骨架 */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        
        {/* 用户信息骨架 */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>

      {/* 互动按钮骨架 */}
      <CardFooter className="flex items-center justify-between pt-4 border-t border-border px-5 pb-5">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </CardFooter>
    </Card>
  )
}