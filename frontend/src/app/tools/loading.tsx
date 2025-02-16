import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {/* DevTools Table Skeleton */}
          <div className="container h-full flex-1 flex-col space-y-8 md:p-8">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <Skeleton className="h-8 w-[300px] mb-2" />
                <Skeleton className="h-4 w-[500px] hidden md:flex" />
              </div>
            </div>

            {/* Table Toolbar Skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-8 w-[250px]" /> {/* Search Input */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-[100px]" /> {/* Category Filter */}
                  <Skeleton className="h-8 w-[100px]" />{" "}
                  {/* Ecosystem Filter */}
                  <Skeleton className="h-8 w-[80px]" /> {/* Likes Button */}
                </div>
              </div>
              <Skeleton className="h-8 w-[100px]" /> {/* View Options */}
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
              <div className="space-y-4">
                {/* Header */}
                <div className="bg-muted/50 p-2">
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-8 w-[100px]" />
                  </div>
                </div>
                {/* Rows */}
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="p-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-8 w-[200px]" />
                      <Skeleton className="h-8 w-[150px]" />
                      <Skeleton className="h-8 w-[150px]" />
                      <Skeleton className="h-8 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
