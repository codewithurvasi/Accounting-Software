import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  getInvoiceDate,
  getInvoiceNo,
  getInvoiceTotal,
  getPaidAmount,
  getTaxableAmount,
  getCustomerName,
  getInvoiceStatus,
  getBillTaxableAmount,
  getBillTotal,
} from "../utils/reportHelpers";
import {
  IndianRupee,
  FileText,
  Users,
  TrendingUp,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import ReportCard from "../components/ReportCard";
import Table from "../components/Table";

export default function Dashboard() {

  const invoices = useSelector((state) => state.invoices?.invoices || []);
const customers = useSelector((state) => state.customers?.customers || []);
const bills = useSelector((state) => state.bills?.bills || []);
const expenses = useSelector((state) => state.expenses?.expenses || []);

const journalEntries = JSON.parse(
  localStorage.getItem("ledgerpro_journal_entries") || "[]"
);

 const dashboardData = useMemo(() => {
  const salesTotal = invoices.reduce(
    (sum, inv) => sum + Number(getInvoiceTotal(inv) || 0),
    0
  );

  const paidTotal = invoices.reduce(
    (sum, inv) => sum + Number(getPaidAmount(inv) || inv.paidAmount || 0),
    0
  );

  const pendingReceivables = salesTotal - paidTotal;

  const purchaseTotal = bills.reduce(
    (sum, bill) => sum + Number(getBillTotal(bill) || 0),
    0
  );

  const expenseTotal = expenses.reduce(
    (sum, exp) =>
      sum + Number(exp.amount || exp.total || exp.expenseAmount || 0),
    0
  );

  const journalExpense = journalEntries
    .filter((entry) => entry.status === "Posted")
    .flatMap((entry) => entry.lines || [])
    .filter((line) =>
      ["Rent Expense", "Salary Expense", "Bank Charges", "Office Expense"].includes(
        line.account
      )
    )
    .reduce(
      (sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0),
      0
    );

  const totalExpenses = purchaseTotal + expenseTotal + journalExpense;
  const netProfit = salesTotal - totalExpenses;

  const recentInvoices = [...invoices]
    .slice()
    .reverse()
    .slice(0, 5)
    .map((invoice) => ({
      invoice: getInvoiceNo(invoice),
      customer: getCustomerName(invoice),
      amount: `₹${Number(getInvoiceTotal(invoice) || 0).toLocaleString("en-IN")}`,
      status: getInvoiceStatus(invoice),
    }));

  const monthMap = {};

  invoices.forEach((invoice) => {
    const date = new Date(getInvoiceDate(invoice));
    const month = date.toLocaleString("en-IN", { month: "short" });

    monthMap[month] =
      (monthMap[month] || 0) + Number(getInvoiceTotal(invoice) || 0);
  });

  const revenueData = Object.entries(monthMap).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  const expenseData = [
    { name: "Purchases", value: purchaseTotal },
    { name: "Expenses", value: expenseTotal },
    { name: "Journal Exp.", value: journalExpense },
  ];

  return {
    salesTotal,
    totalInvoices: invoices.length,
    customersCount: customers.length,
    netProfit,
    pendingReceivables,
    pendingPayables: purchaseTotal,
    recentInvoices,
    revenueData,
    expenseData,
  };
}, [invoices, customers, bills, expenses, journalEntries]);

  

 

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Financial Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Real-time overview of income, expenses, invoices and business health.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard title="Total Sales" value={`₹${dashboardData.salesTotal.toLocaleString("en-IN")}`} icon={IndianRupee} trend="From sales invoices" />
<ReportCard title="Total Invoices" value={dashboardData.totalInvoices} icon={FileText} trend="Saved invoices" />
<ReportCard title="Customers" value={dashboardData.customersCount} icon={Users} trend="Total customers" />
<ReportCard title="Net Profit" value={`₹${dashboardData.netProfit.toLocaleString("en-IN")}`} icon={TrendingUp} trend="Sales - expenses" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-black text-[var(--text)]">Monthly Revenue</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-black text-[var(--text)]">Expense Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.expenseData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <Wallet className="mb-3 text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted)]">Pending Receivables</p>
          <h3 className="text-3xl font-black text-[var(--text)]">₹{dashboardData.pendingReceivables.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <Receipt className="mb-3 text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted)]">Pending Payables</p>
          <h3 className="text-3xl font-black text-[var(--text)]">₹{dashboardData.pendingPayables.toLocaleString("en-IN")}</h3>
        </div>
      </div>

     <div>
  <h2 className="mb-4 text-xl font-black text-[var(--text)]">
    Recent Invoices
  </h2>

  {/* Mobile Card View */}
  <div className="grid gap-4 md:hidden">
    {dashboardData.recentInvoices.map((invoice, index) => (
      <div
        key={index}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-lg font-black">{invoice.invoice}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {invoice.customer}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              invoice.status === "Paid"
                ? "bg-green-100 text-green-700"
                : invoice.status === "Partial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {invoice.status}
          </span>
        </div>

        <div className="mt-3 rounded-xl bg-[var(--surface-soft)] p-3">
          <p className="text-xs font-bold uppercase text-[var(--muted)]">
            Amount
          </p>
          <p className="mt-1 text-lg font-black">{invoice.amount}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Desktop Table View */}
  <div className="hidden md:block">
    <Table
      columns={["Invoice", "Customer", "Amount", "Status"]}
      data={dashboardData.recentInvoices}
    />
  </div>
</div>
    </div>
  );
}