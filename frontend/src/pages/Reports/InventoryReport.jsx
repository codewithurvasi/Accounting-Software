export default function InventoryReport() {
  const items = [
    {
      product: "Premium Shirt",
      stock: 120,
      warehouse: "Main Warehouse",
      value: "₹1,08,000",
    },
    {
      product: "Cotton Hoodie",
      stock: 45,
      warehouse: "Retail Storage",
      value: "₹67,500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Inventory Report</h1>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          Analyze stock quantity, inventory value and warehouse distribution.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--muted)]">Total Products</p>
          <h2 className="mt-2 text-2xl font-black">165</h2>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--muted)]">Inventory Value</p>
          <h2 className="mt-2 text-2xl font-black">₹1,75,500</h2>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--muted)]">Warehouses</p>
          <h2 className="mt-2 text-2xl font-black">2</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-xl font-black">Inventory Summary</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Value</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.product} className="border-b">
                  <td className="p-4 font-bold">{item.product}</td>
                  <td className="p-4">{item.stock}</td>
                  <td className="p-4">{item.warehouse}</td>
                  <td className="p-4">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}