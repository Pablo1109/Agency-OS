export default function AppLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-20 animate-pulse rounded-lg border border-white/70 bg-white/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border border-white/70 bg-white/70" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-80 animate-pulse rounded-lg border border-white/70 bg-white/70" />
        <div className="h-80 animate-pulse rounded-lg border border-white/70 bg-white/70" />
      </div>
    </div>
  );
}
