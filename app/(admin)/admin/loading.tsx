export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-bg-soft rounded-lg" />
        <div className="h-4 w-72 bg-bg-soft rounded-lg mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-border-light shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-bg-soft rounded" />
                <div className="h-7 w-12 bg-bg-soft rounded" />
              </div>
              <div className="h-12 w-12 bg-bg-soft rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-light/50">
          <div className="h-5 w-40 bg-bg-soft rounded" />
          <div className="h-3 w-60 bg-bg-soft rounded mt-2" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-32 bg-bg-soft rounded" />
              <div className="h-4 w-24 bg-bg-soft rounded" />
              <div className="h-4 w-40 bg-bg-soft rounded" />
              <div className="h-4 w-20 bg-bg-soft rounded" />
              <div className="h-4 w-28 bg-bg-soft rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
