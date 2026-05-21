function getStatusClass(value) {
  const status = String(value).toLowerCase();

  if (status === "paid" || status === "ready") return "status-paid";
  if (status === "unpaid") return "status-unpaid";
  if (status === "partial") return "status-partial";

  return "";
}

export default function Table({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-5 py-4 text-xs font-black uppercase tracking-wide text-[var(--muted)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-[var(--border)] transition hover:bg-[var(--surface-soft)]"
                >
                  {Object.values(row).map((value, i) => {
                    const badgeClass = getStatusClass(value);

                    return (
                      <td key={i} className="px-5 py-4 text-sm font-semibold">
                        {badgeClass ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${badgeClass}`}
                          >
                            {String(value)}
                          </span>
                        ) : (
                          <span className="text-[var(--text)]">
                            {String(value)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-sm font-semibold text-[var(--muted)]"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}