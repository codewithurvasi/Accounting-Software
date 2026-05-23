import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

//import Demo from "./pages/Demo";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import AutoTranslator from "./components/AutoTranslator";


import Customers from "./pages/Sales/Customers";
import Vendors from "./pages/Purchase/Vendors";
import Invoices from "./pages/Sales/Invoices";
import Bills from "./pages/Purchase/Bills";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";

import Inventory from "./pages/Inventory/Index";
import StockTransfer from "./pages/Inventory/StockTransfer";
import InventoryReports from "./pages/Inventory/InventoryReports";
import StockManagement from "./pages/Inventory/StockManagement";
import Warehouses from "./pages/Inventory/Warehouses";

import SalesReturn from "./pages/Sales/SalesReturn";
import PaymentsReceived from "./pages/Sales/PaymentsReceived";
import CustomerStatement from "./pages/Sales/CustomerStatement";

import PaymentsMade from "./pages/Purchase/PaymentMade";
import PurchaseReturn from "./pages/Purchase/PurchaseReturn";
import VendorStatement from "./pages/Purchase/VendorStatement";

import ChartOfAccounts from "./pages/Accounts/ChartOfAccounts";
import JournalEntries from "./pages/Accounts/JournalEntries";
import Ledger from "./pages/Accounts/Ledger";
import TrialBalance from "./pages/Accounts/TrialBalance";


import ProfitLoss from "./pages/Reports/ProfitLoss";
import BalanceSheet from "./pages/Reports/BalanceSheet";
import CashFlow from "./pages/Reports/CashFlow";
import TaxReport from "./pages/Reports/TaxReport";
import SalesReport from "./pages/Reports/SalesReport";
import PurchaseReport from "./pages/Reports/PurchaseReport";
import InventoryReport from "./pages/Reports/InventoryReport";
import CashBankBook from "./pages/reports/CashBankBook";
import PurchaseRegister from "./pages/Reports/PurchaseRegiter";

import CompanyProfile from "./pages/Settings/CompanyProfile";
import TaxesGst from "./pages/Settings/TaxesGst";
import InvoiceSettings from "./pages/Settings/InvoiceSettings";
import UsersRoles from "./pages/Settings/UserRoles";
import Backup from "./pages/Settings/Backup";

import GstReports from "./pages/Reports/GstReports";

function Layout({ setLanguage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBF6EA] text-[#151512]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <Navbar
  onMenuClick={() => setSidebarOpen(true)}
  setLanguage={setLanguage}
/>

        <main className="p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="/demo" element={<Demo />} /> */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/purchase/vendors" element={<Vendors />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/purchase/bills" element={<Bills />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payments" element={<Payments />} />

            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/stock-management" element={<StockManagement />} />
            <Route path="/inventory/warehouses" element={<Warehouses />} />
            <Route path="/inventory/transfer" element={<StockTransfer />} />
            <Route path="/inventory/reports" element={<InventoryReports />} />

            <Route path="/sales/customers" element={<Customers />} />
            <Route path="/sales/invoices" element={<Invoices />} />
            <Route path="/sales/return" element={<SalesReturn />} />
            <Route
              path="/sales/payments-received"
              element={<PaymentsReceived />}
            />
            <Route
              path="/purchase/vendor-statement"
              element={<VendorStatement />}
            />
            <Route path="/purchase/return" element={<PurchaseReturn />} />
            <Route
              path="/sales/customer-statement"
              element={<CustomerStatement />}
            />

            <Route path="/purchase/payments-made" element={<PaymentsMade />} />

            <Route path="*" element={<Navigate to="/" replace />} />

            <Route path="/accounts/chart" element={<ChartOfAccounts />} />
            <Route path="/accounts/journal" element={<JournalEntries />} />
            <Route path="/accounts/ledger" element={<Ledger />} />
            <Route path="/accounts/trial-balance" element={<TrialBalance />} />

            <Route path="/reports/profit-loss" element={<ProfitLoss />} />
            <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
            <Route path="/reports/cash-flow" element={<CashFlow />} />
            <Route path="/reports/tax-report" element={<TaxReport />} />  
            <Route path="/reports/sales-report" element={<SalesReport />} />
            <Route path="/reports/purchase-report" element={<PurchaseReport />} />
            <Route path="/reports/inventory-report" element={<InventoryReport />} />
            <Route path="/reports/gst-reports" element={<GstReports />} />
            <Route path="/reports/cash-bank-book" element={<CashBankBook />} />
            <Route path="/reports/purchase-register" element={<PurchaseRegister />} />
            <Route path="settings/company-profile" element={<CompanyProfile />} />
<Route path="settings/taxes-gst" element={<TaxesGst />} />
<Route path="settings/invoice-settings" element={<InvoiceSettings />} />
<Route path="settings/users-roles" element={<UsersRoles />} />
<Route path="settings/backup" element={<Backup />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");

  return (
    <>
      <AutoTranslator language={language} />

      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout setLanguage={setLanguage} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}