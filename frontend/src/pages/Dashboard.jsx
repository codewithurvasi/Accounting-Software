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
const salesReturns = useSelector(
  (state) =>
    state.salesReturns?.salesReturns ||
    state.salesReturn?.salesReturns ||
    state.salesReturn?.returns ||
    []
);

const journalEntries = JSON.parse(
  localStorage.getItem("ledgerpro_journal_entries") || "[]"
);

 const dashboardData = useMemo(() => {
 const salesTotal = invoices.reduce((sum, inv) => {
  const taxable = Number(
    inv.taxableAmount ||
      inv.subtotal ||
      inv.subTotal ||
      inv.amount ||
      getTaxableAmount(inv) ||
      0
  );

  const total = Number(getInvoiceTotal(inv) || 0);
  const gst = Number(inv.gstAmount || inv.gst || inv.totalGst || 0);

  return sum + (taxable || Math.max(total - gst, 0));
}, 0);

const salesReturnTotal = salesReturns.reduce((sum, item) => {
  const itemsTaxable = (item.items || []).reduce((s, row) => {
    const qty = Number(row.qty || row.returnQty || row.quantity || 0);
    const rate = Number(row.rate || row.price || 0);
    return s + qty * rate;
  }, 0);

  return (
    sum +
    Number(
      item.taxableAmount ||
        item.subtotal ||
        item.subTotal ||
        item.returnTaxable ||
        itemsTaxable ||
        0
    )
  );
}, 0);

const netSalesTotal = Math.max(salesTotal - salesReturnTotal, 0);





  

 

  const paidTotal = invoices.reduce(
    (sum, inv) => sum + Number(getPaidAmount(inv) || inv.paidAmount || 0),
    0
  );

 const pendingReceivables = Math.max(
  invoices.reduce((sum, inv) => sum + Number(getInvoiceTotal(inv) || 0), 0) -
    salesReturns.reduce((sum, item) => {
      const itemsTotal = (item.items || []).reduce((s, row) => {
        const qty = Number(row.qty || row.returnQty || row.quantity || 0);
        const rate = Number(row.rate || row.price || 0);
        const gstRate = Number(row.gst || row.gstRate || 0);
        const taxable = qty * rate;
        return s + taxable + (taxable * gstRate) / 100;
      }, 0);

      return (
        sum +
        Number(
          item.totalAmount ||
            item.grandTotal ||
            item.returnAmount ||
            item.total ||
            item.amount ||
            itemsTotal ||
            0
        )
      );
    }, 0) -
    paidTotal,
  0
);

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
  const netProfit = netSalesTotal - totalExpenses;

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
   salesTotal: netSalesTotal,
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
  <div className="space-y-7">
    {/* SaaS Header */}
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-7 text-white shadow-xl">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
            Accounting Overview
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Financial Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Track sales, invoices, receivables, payables and business performance
            from one clean workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
          <p className="text-xs text-slate-300">Business Health</p>
          <p className="mt-1 text-2xl font-black">
            {dashboardData.netProfit >= 0 ? "Profitable" : "Loss"}
          </p>
        </div>
      </div>
    </div>

    {/* Top Cards */}
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <ReportCard
        title="Total Sales"
        value={`₹${Math.round(dashboardData.salesTotal).toLocaleString("en-IN")}`}
        icon={IndianRupee}
        trend="From sales invoices"
      />
      <ReportCard
        title="Total Invoices"
        value={dashboardData.totalInvoices}
        icon={FileText}
        trend="Saved invoices"
      />
      <ReportCard
        title="Customers"
        value={dashboardData.customersCount}
        icon={Users}
        trend="Total customers"
      />
      <ReportCard
        title={dashboardData.netProfit >= 0 ? "Net Profit" : "Net Loss"}
        value={`₹${Math.abs(Math.round(dashboardData.netProfit)).toLocaleString("en-IN")}`}
        icon={TrendingUp}
        trend="Sales - expenses"
      />
    </div>

    {/* Charts */}
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Monthly Revenue
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sales performance by month
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData.revenueData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) =>
                  `₹${Number(value || 0).toLocaleString("en-IN")}`
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={4}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Expense Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Purchases, direct expenses and journal expenses
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.expenseData}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) =>
                  `₹${Number(value || 0).toLocaleString("en-IN")}`
                }
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Receivable / Payable */}
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Pending Receivables
            </p>
            <h3 className="mt-2 text-3xl font-black text-slate-950">
              ₹{Math.round(dashboardData.pendingReceivables).toLocaleString("en-IN")}
            </h3>
            <p className="mt-2 text-xs font-semibold text-emerald-600">
              Amount to receive from customers
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
            <Wallet size={28} />
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Pending Payables
            </p>
            <h3 className="mt-2 text-3xl font-black text-slate-950">
              ₹{Math.round(dashboardData.pendingPayables).toLocaleString("en-IN")}
            </h3>
            <p className="mt-2 text-xs font-semibold text-rose-600">
              Amount to pay to vendors
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">
            <Receipt size={28} />
          </div>
        </div>
      </div>
    </div>

    {/* Recent Invoices */}
    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Recent Invoices</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest saved sales invoices
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {dashboardData.recentInvoices.map((invoice, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  {invoice.invoice}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
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

            <p className="mt-4 text-lg font-black text-slate-950">
              {invoice.amount}
            </p>
          </div>
        ))}
      </div>

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