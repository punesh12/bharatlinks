const Loading = () => {
  return (
    <div className="space-y-8 w-full animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
          <div className="h-4 w-64 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded"></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="h-6 w-24 bg-slate-200 rounded"></div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-200 rounded"></div>
              <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
