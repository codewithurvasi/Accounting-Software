import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { Building2, Lock, Mail, ShieldCheck } from "lucide-react";

const demoUsers = [
  {
    id: 1,
    fullName: "Admin User",
    name: "Admin User",
    email: "admin@acc.com",
    password: "123456",
    role: "Admin",
    status: "Active",
    permissions: [
  "All Access",
  "Dashboard",
  "Expenses",

  "Customers",
  "Invoices",
  "Sales Return",
  "Payments Received",
  "Customer Statement",

  "Vendors",
  "Bills",
  "Purchase Return",
  "Vendor Statement",
  "Payments Made",

  "Journal Entries",
  "Ledger",

  "Inventory",
  "Stock Management",
  "Warehouses",
  "Stock Transfer",

  "Profit & Loss",
  "GST Reports",
  "Sales Report",
  "Purchase Report",

  "Company Profile",
  "Invoice Settings",
  "Users & Roles",
  "Backup",
],
  },
  {
    id: 2,
    fullName: "Account Manager",
    name: "Account Manager",
    email: "accounts@acc.com",
    password: "123456",
    role: "Accountant",
    status: "Active",
    permissions: [
      "Dashboard",
      "Customers",
      "Vendors",
      "Invoices",
      "Bills",
      "Payments",
      "Reports",
    ],
  },
  {
    id: 3,
    fullName: "Sales User",
    name: "Sales User",
    email: "sales@acc.com",
    password: "123456",
    role: "Sales",
    status: "Active",
    permissions: ["Dashboard", "Customers", "Invoices", "Payments"],
  },
];

export default function Login() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("admin@acc.com");
  const [password, setPassword] = useState("123456");

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUsers = JSON.parse(localStorage.getItem("usersRoles")) || [];

    const allUsers = [...demoUsers, ...storedUsers];

    if (!storedUsers.length) {
      localStorage.setItem("usersRoles", JSON.stringify(demoUsers));
    }

    const user = allUsers.find(
      (u) =>
        String(u.email).toLowerCase() === email.toLowerCase() &&
        String(u.password) === String(password)
    );

    if (!user) {
      alert("Invalid email or password");
      return;
    }

    if (user.status !== "Active") {
      alert("This user is inactive. Please contact admin.");
      return;
    }

    const loggedInUser = {
      id: user.id,
      name: user.fullName || user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      status: user.status,
    };

    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

    dispatch(login(loggedInUser));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-[var(--sidebar)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-[var(--accent)]">
              <Building2 size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black">Namdev Traders</h1>
              <p className="text-sm text-slate-300">Accounting Admin Suite</p>
            </div>
          </div>

          <div>
            <ShieldCheck className="mb-5 text-[var(--accent)]" size={46} />
            <h2 className="text-4xl font-black leading-tight">
              Manage business finance with confidence.
            </h2>
            <p className="mt-4 text-slate-300">
              Invoices, customers, vendors, expenses, payments and reports in
              one professional dashboard.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <h3 className="text-xl font-black">₹2.4L</h3>
              <p className="text-xs text-slate-300">Revenue</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <h3 className="text-xl font-black">128</h3>
              <p className="text-xs text-slate-300">Invoices</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <h3 className="text-xl font-black">54</h3>
              <p className="text-xs text-slate-300">Clients</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <h1 className="text-3xl font-black text-[var(--text)]">
              Namdev Traders
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Accounting Admin Suite
            </p>
          </div>

          <h2 className="text-3xl font-black text-[var(--text)]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Login to access your accounting dashboard.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[var(--text)]">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                <Mail size={18} className="text-[var(--muted)]" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[var(--text)]">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                <Lock size={18} className="text-[var(--muted)]" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <button className="w-full rounded-xl bg-[var(--primary)] py-3 font-black text-white hover:bg-[var(--primary-dark)]">
              Login
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">
            Demo Login:
            <div className="mt-2 font-bold text-[var(--text)]">
              Admin: admin@acc.com / 123456
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}