import { useState } from "react";
import { Plus } from "lucide-react";

export default function InvoiceForm({ onAdd }) {
  const [form, setForm] = useState({
    customer: "",
    amount: "",
    status: "Unpaid",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
      id: Date.now(),
      invoiceNo: `INV-${Date.now().toString().slice(-4)}`,
      customer: form.customer,
      amount: Number(form.amount),
      status: form.status,
      date: new Date().toISOString().slice(0, 10),
    });

    setForm({
      customer: "",
      amount: "",
      status: "Unpaid",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm md:grid-cols-4"
    >
      <input
        value={form.customer}
        onChange={(e) => setForm({ ...form, customer: e.target.value })}
        placeholder="Customer Name"
        required
        className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]"
      />

      <input
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        placeholder="Amount"
        type="number"
        required
        className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]"
      />

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]"
      >
        <option>Paid</option>
        <option>Unpaid</option>
        <option>Partial</option>
      </select>

      <button className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white hover:bg-[var(--primary-dark)]">
        <Plus size={18} />
        Add Invoice
      </button>
    </form>
  );
}