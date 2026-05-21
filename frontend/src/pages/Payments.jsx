import { useState } from "react";
import Table from "../components/Table";
import { Plus, CreditCard } from "lucide-react";

export default function Payments() {
  const [payments, setPayments] = useState([
    { type: "Customer Payment", party: "Rahul Traders", amount: 25000, mode: "UPI", date: "2026-05-09" },
    { type: "Vendor Payment", party: "Textile Supplier", amount: 10000, mode: "Bank", date: "2026-05-09" },
  ]);

  const [form, setForm] = useState({
    type: "Customer Payment",
    party: "",
    amount: "",
    mode: "UPI",
  });

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPayments([
      {
        type: form.type,
        party: form.party,
        amount: Number(form.amount),
        mode: form.mode,
        date: new Date().toISOString().slice(0, 10),
      },
      ...payments,
    ]);
    setForm({ type: "Customer Payment", party: "", amount: "", mode: "UPI" });
  };

  const data = payments.map((p) => ({
    type: p.type,
    party: p.party,
    amount: `₹${p.amount}`,
    mode: p.mode,
    date: p.date,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Payments</h1>
        <p className="mt-2 text-slate-300">Track received and paid payments.</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--primary)]">
            <CreditCard />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--muted)]">Total Payments</p>
            <h2 className="text-2xl font-black">₹{totalPayments}</h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm md:grid-cols-5">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]">
          <option>Customer Payment</option>
          <option>Vendor Payment</option>
          <option>Expense Payment</option>
        </select>

        <input value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="Party Name" required className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
        <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" type="number" required className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]" />

        <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]">
          <option>UPI</option>
          <option>Cash</option>
          <option>Bank</option>
          <option>Card</option>
        </select>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white hover:bg-[var(--primary-dark)]">
          <Plus size={18} /> Add
        </button>
      </form>

      <Table columns={["Type", "Party", "Amount", "Mode", "Date"]} data={data} />
    </div>
  );
}