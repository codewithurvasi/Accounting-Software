export default function ReportCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">{title}</p>
          <h3 className="mt-2 text-2xl font-black text-[var(--text)]">
            {value}
          </h3>

          {trend && (
            <p className="mt-2 text-xs font-bold text-[var(--accent)]">
              {trend}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--primary)]">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}   