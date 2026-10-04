export default function DashboardLoading() {
  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-8 sm:px-7 lg:px-9" aria-label="Carregando workspace" aria-busy="true">
      <div className="mx-auto max-w-6xl">
        <div className="dashboard-skeleton h-3 w-24 rounded" />
        <div className="dashboard-skeleton mt-4 h-9 w-64 max-w-full rounded-lg" />
        <div className="dashboard-skeleton mt-3 h-4 w-96 max-w-full rounded" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="dashboard-skeleton h-4 w-28 rounded" />
              <div className="dashboard-skeleton mt-5 h-8 w-36 rounded" />
              <div className="dashboard-skeleton mt-4 h-3 w-full rounded" />
              <div className="dashboard-skeleton mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
