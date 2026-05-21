import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Receipt,
  Wallet,
  BarChart3,
  SlidersHorizontal,
ShieldCheck,
Database,
  X,
  Building2,
  Package,
  List,
  MapPin,
  ArrowDownToLine,
  Repeat,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  ShoppingBag,
  Users,
  FileText,
  Undo2,
  CreditCard,
  ScrollText,
  BookOpen,
  ListTree,
  FilePenLine,
  NotebookTabs,
  Scale,
  PieChart,
Landmark,
Activity,
BadgePercent,
} from "lucide-react";
import { Settings } from "lucide-react";

const links = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Expenses", path: "/expenses", icon: Wallet },
 
];

const salesLinks = [
  { name: "Customers", path: "/sales/customers", icon: Users },
  { name: "Invoices", path: "/sales/invoices", icon: FileText },
  { name: "Sales Return", path: "/sales/return", icon: Undo2 },
  {
    name: "Payments Received",
    path: "/sales/payments-received",
    icon: CreditCard,
  },
  {
    name: "Customer Statement",
    path: "/sales/customer-statement",
    icon: ScrollText,
  },
];

const purchaseLinks = [
  { name: "Vendors", path: "/purchase/vendors", icon: Truck },
  { name: "Bills", path: "/purchase/bills", icon: Receipt },
  { name: "Purchase Return", path: "/purchase/return", icon: Undo2 },
  {
    name: "Vendor Statement",
    path: "/purchase/vendor-statement",
    icon: FileText,
  },
  {
    name: "Payments Made",
    path: "/purchase/payments-made",
    icon: CreditCard,
  },
];

const accountsLinks = [
  // {
  //   name: "Chart of Accounts",
  //   path: "/accounts/chart",
  //   icon: ListTree,
  // },
  {
    name: "Journal Entries",
    path: "/accounts/journal",
    icon: FilePenLine,
  },
  {
    name: "Ledger",
    path: "/accounts/ledger",
    icon: NotebookTabs,
  },
  // {
  //   name: "Trial Balance",
  //   path: "/accounts/trial-balance",
  //   icon: Scale,
  // },
];

const inventoryLinks = [
  { name: "Products", path: "/inventory", icon: List },
  {
    name: "Stock Management",
    path: "/inventory/stock-management",
    icon: ArrowDownToLine,
  },
  { name: "Warehouses", path: "/inventory/warehouses", icon: MapPin },
  { name: "Stock Transfer", path: "/inventory/transfer", icon: Repeat },
  // { name: "Inventory Reports", path: "/inventory/reports", icon: BarChart3 },
];

const reportsLinks = [
  {
    name: "Profit & Loss",
    path: "/reports/profit-loss",
    icon: PieChart,
  },
 
{ name: "GST Reports", path: "/reports/gst-reports", icon: FileText },
  // {
  //   name: "Balance Sheet",
  //   path: "/reports/balance-sheet",
  //   icon: Landmark,
  // },

  // {
  //   name: "Cash Flow",
  //   path: "/reports/cash-flow",
  //   icon: Activity,
  // },

 
  {
    name: "Sales Report",
    path: "/reports/sales-report",
    icon: ShoppingCart,
  },

  {
    name: "Purchase Report",
    path: "/reports/purchase-report",
    icon: ShoppingBag,
  },
  

  
];

const settingsLinks = [
  {
    name: "Company Profile",
    path: "/settings/company-profile",
    icon: Building2,
  },
  // {
  //   name: "Taxes / GST",
  //   path: "/settings/taxes-gst",
  //   icon: BadgePercent,
  // },
  {
    name: "Invoice Settings",
    path: "/settings/invoice-settings",
    icon: SlidersHorizontal,
  },
  {
    name: "Users & Roles",
    path: "/settings/users-roles",
    icon: ShieldCheck,
  },
  {
    name: "Backup",
    path: "/settings/backup",
    icon: Database,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isSalesActive = location.pathname.startsWith("/sales");
  const isPurchaseActive = location.pathname.startsWith("/purchase");
  const isAccountsActive = location.pathname.startsWith("/accounts");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isReportsActive = location.pathname.startsWith("/reports");
  const isSettingsActive = location.pathname.startsWith("/settings");
  

  const [openSales, setOpenSales] = useState(isSalesActive);
  const [openPurchase, setOpenPurchase] = useState(isPurchaseActive);
  const [openAccounts, setOpenAccounts] = useState(isAccountsActive);
  const [openInventory, setOpenInventory] = useState(isInventoryActive);
  const [openReports, setOpenReports] = useState(isReportsActive);
  const [openSettings, setOpenSettings] = useState(isSettingsActive);
 

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-[var(--sidebar)] text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 p-5 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 text-[var(--accent)]">
                  <Building2 size={26} />
                </div>

                <div>
                  <h1 className="text-xl font-black">Namdev Traders</h1>
                  <p className="text-xs text-slate-300">Accounting Software</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg bg-white/10 p-2 text-white lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-5 pb-5">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-lg"
                        : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  {link.name}
                </NavLink>
              );
            })}

            <div>
              <button
                type="button"
                onClick={() => setOpenSales(!openSales)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isSalesActive
                    ? "bg-[var(--primary)] text-white shadow-lg"
                    : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart size={19} />
                  Sales
                </span>

                {openSales ? (
                  <ChevronDown size={17} />
                ) : (
                  <ChevronRight size={17} />
                )}
              </button>

              {openSales && (
                <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
                  {salesLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "bg-white text-[var(--sidebar)]"
                              : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={15} />
                        {link.name}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenPurchase(!openPurchase)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isPurchaseActive
                    ? "bg-[var(--primary)] text-white shadow-lg"
                    : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag size={19} />
                  Purchase
                </span>

                {openPurchase ? (
                  <ChevronDown size={17} />
                ) : (
                  <ChevronRight size={17} />
                )}
              </button>

              {openPurchase && (
                <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
                  {purchaseLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "bg-white text-[var(--sidebar)]"
                              : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={15} />
                        {link.name}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenAccounts(!openAccounts)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isAccountsActive
                    ? "bg-[var(--primary)] text-white shadow-lg"
                    : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <BookOpen size={19} />
                  Accounts
                </span>

                {openAccounts ? (
                  <ChevronDown size={17} />
                ) : (
                  <ChevronRight size={17} />
                )}
              </button>

              {openAccounts && (
                <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
                  {accountsLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "bg-white text-[var(--sidebar)]"
                              : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={15} />
                        {link.name}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenInventory(!openInventory)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isInventoryActive
                    ? "bg-[var(--primary)] text-white shadow-lg"
                    : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Package size={19} />
                  Inventory
                </span>

                {openInventory ? (
                  <ChevronDown size={17} />
                ) : (
                  <ChevronRight size={17} />
                )}
              </button>

              {openInventory && (
                <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
                  {inventoryLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === "/inventory"}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "bg-white text-[var(--sidebar)]"
                              : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={15} />
                        {link.name}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
  <button
    type="button"
    onClick={() => setOpenReports(!openReports)}
    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isReportsActive
        ? "bg-[var(--primary)] text-white shadow-lg"
        : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
    }`}
  >
    <span className="flex items-center gap-3">
      <BarChart3 size={19} />
      Reports
    </span>

    {openReports ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
  </button>

  {openReports && (
    <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
      {reportsLinks.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-[var(--sidebar)]"
                  : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
              }`
            }
          >
            <Icon size={15} />
            {link.name}
          </NavLink>
        );
      })}
    </div>
  )}
</div>

<div>
  <button
    type="button"
    onClick={() => setOpenSettings(!openSettings)}
    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isSettingsActive
        ? "bg-[var(--primary)] text-white shadow-lg"
        : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
    }`}
  >
    <span className="flex items-center gap-3">
      <Settings size={19} />
      Settings
    </span>

    {openSettings ? (
      <ChevronDown size={17} />
    ) : (
      <ChevronRight size={17} />
    )}
  </button>

  {openSettings && (
    <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
      {settingsLinks.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-[var(--sidebar)]"
                  : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
              }`
            }
          >
            <Icon size={15} />
            {link.name}
          </NavLink>
        );
      })}
    </div>
  )}
</div>
          </nav>

          <div className="shrink-0 border-t border-white/10 p-5">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-300">Current Plan</p>
              <h3 className="mt-1 text-sm font-black">Professional</h3>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/4 rounded-full bg-[var(--accent)]" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}