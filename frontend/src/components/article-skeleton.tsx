export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="h-4 w-40 animate-pulse rounded bg-emerald-900/10" />
      <div className="mt-6 h-12 w-full animate-pulse rounded bg-emerald-900/10" />
      <div className="mt-3 h-12 w-3/4 animate-pulse rounded bg-emerald-900/10" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-4 animate-pulse rounded bg-emerald-900/10"
          />
        ))}
      </div>
    </div>
  );
}
