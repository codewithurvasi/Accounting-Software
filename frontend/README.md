# Frontend README

## Overview

This frontend is a React-based accounting dashboard built with Vite. It includes user authentication, a sidebar navigation layout, dashboard analytics, sales/purchase/inventory/accounting reports, and an auto-translation system for Hindi.

The app is primarily client-side and stores data in the browser via Redux and `localStorage`. The only external network call comes from the translation helper that sends text to a backend translation endpoint at `http://localhost:5000/translate-batch`.

---

## Tech Stack

- React 19
- React Router DOM 7
- Redux Toolkit
- Vite
- Tailwind CSS via `@tailwindcss/vite`
- Recharts for chart visualization
- i18next + react-i18next (installed but not fully wired into the current UI)
- lucide-react for icons

---

## Folder Structure

- `src/`
  - `App.jsx` - main route and auth gate logic
  - `main.jsx` - application entrypoint, Redux provider, router wrapper
  - `components/` - shared UI widgets and layout pieces
  - `pages/` - screen-level page components grouped by domain
  - `redux/` - Redux slices and store configuration
  - `utils/` - helper functions for storage, accounting, reports, translation

---

## Application Flow

### Entry point

- `src/main.jsx`
  - Wraps the app in `<Provider store={store}>`
  - Wraps the app in `<BrowserRouter>`
  - Renders `<App />`

### App shell and routing

- `src/App.jsx`
  - Reads auth state from Redux: `state.auth.isAuthenticated`
  - Maintains `language` state from `localStorage` (defaults to `en`)
  - Renders `AutoTranslator` to translate page text on the fly
  - Protects all routes behind login, except `/login`
  - Uses `Layout` for the main application shell when authenticated

### Layout

- `Layout` component in `App.jsx`
  - Controls mobile sidebar open/close state
  - Renders `Sidebar` and `Navbar`
  - Defines all protected page routes using React Router

### Navigation

- `src/components/Sidebar.jsx`
  - Displays primary navigation groups:
    - Dashboard
    - Sales
    - Purchase
    - Inventory
    - Accounts
    - Reports
    - Settings
  - Tracks active section using `useLocation()` and submenu expansion state
  - Uses `NavLink` to highlight current routes

- `src/components/Navbar.jsx`
  - Renders dashboard header and user summary
  - Includes the hamburger menu trigger for mobile
  - Contains language toggle buttons (`EN` / `हिन्दी`)
  - Dispatches `logout()` action when the Logout button is clicked

---

## Authentication

- `src/pages/Login.jsx`
  - Provides a demo login form
  - On submit, dispatches `login()` with static admin data
  - No backend authentication is performed in current implementation

- `src/redux/authSlice.js`
  - `login(state, action)` stores the user and sets `isAuthenticated` to `true`
  - `logout(state)` clears auth state and removes `ledgerUser` from localStorage
  - Initial auth state is hydrated from `localStorage` key `ledgerUser`

### Auth connection

- Login stores user details in Redux and localStorage.
- App checks auth state to decide whether to render `Login` or `Layout`.
- `Navbar` calls `logout()` to return the user to the login page.

---

## Redux State and Persistence

### Store configuration

- `src/redux/store.js`
  - Combines these slices:
    - `auth`
    - `invoices`
    - `customers`
    - `payments`
    - `salesReturns`
    - `products`
    - `vendors`
    - `bills`
    - `purchaseReturns`
    - `paymentsMade`
    - `expenses`

### Persistence helpers

- `src/utils/storage.js`
  - `STORAGE_KEYS` defines localStorage keys for invoices, customers, vendors, payments, and sales returns
  - `getData(key, defaultValue)` reads JSON data from localStorage and returns a safe default
  - `saveData(key, data)` writes JSON data into localStorage

### Slice pattern

Each data slice follows a common pattern:

- Read persisted initial state from `localStorage` via `getData`
- Define default seed data when no persisted state exists
- On add/update/delete actions, write the updated slice back to `localStorage`

Example: `src/redux/invoiceSlice.js`
- `addInvoice`
- `updateInvoice`
- `updateInvoicePaymentStatus`
- `deleteInvoice`

Example: `src/redux/customerSlice.js`
- `addCustomer`
- `updateCustomer`
- `deleteCustomer`

This means the frontend data is saved across refreshes, with browser storage as the canonical persistence layer.

---

## Auto-Translation

### How translation works

- `src/components/AutoTranslator.jsx`
  - Runs a DOM walker over `document.body` text nodes
  - Skips non-translatable tags like `SCRIPT`, `STYLE`, `INPUT`, `TEXTAREA`, `SELECT`, `OPTION`, `SVG`, and `PATH`
  - Ignores numeric-only or very long strings
  - Stores original text in a `WeakMap` to preserve original English values
  - Stores translated Hindi text in a cache and also in localStorage with keys like `hi:<originalText>`

- `src/utils/translate.js`
  - Calls `POST http://localhost:5000/translate-batch`
  - Expects a response containing `results` with `original` and `translated`
  - Returns a `Map` of translated text for the component to apply

### Connection

- `Navbar` changes language using `setLanguage()` and stores selection in `localStorage`
- `AutoTranslator` watches `language` prop and re-translates the visible UI when `hi` is selected
- If language is `en`, it restores the original English text

---

## Report and Accounting Helpers

### `src/utils/reportHelpers.js`

This file contains reusable financial helper functions for invoices, bills, GST, and payment status.

Key functions:
- `getTaxableAmount(qty, rate)`
- `getGstAmount(taxableAmount, gstRate)`
- `getItemTaxableAmount(item)`
- `getItemGstAmount(item)`
- `getItemTotal(item)`
- `getInvoiceTotal(invoice)`
- `getInvoiceNo(invoice)` / `getInvoiceDate(invoice)` / `getCustomerName(invoice)`
- `getBillTotal(bill)` / `getBillNo(bill)` / `getVendorName(bill)`
- `calculateItemValues(item, companyState)` splits GST into CGST/SGST or IGST
- `calculateInvoiceTotals(invoices, companyState)` and `calculateBillTotals(bills, companyState)`
- `getPaidAmount(entry)`, `getDueAmount(total, paid)`, `formatCurrency(amount)`
- `getInvoiceStatus(invoice)` / `getBillStatus(bill)`

### `src/utils/accountingHelpers.js`

Provides convenience wrappers and localStorage fallback logic.
- `getSavedInvoices()` returns persisted invoice data
- `getSavedPayments()` tries several localStorage keys to load payment records
- `getInvoiceGST()` and `getInvoiceTaxable()` delegate to report helpers

---

## UI Components

### Shared components

- `src/components/Sidebar.jsx`
  - Menu structure and route links
  - Controlled using internal section state for expandable submenus
  - Shows the currently active route using `location.pathname`

- `src/components/Navbar.jsx`
  - Top bar with mobile menu button, user card, language toggles, and logout

- `src/components/Table.jsx`
  - Generic table renderer used for lists and reports
  - Automatically applies badge styling for statuses like Paid, Partial, Unpaid

- `src/components/ReportCard.jsx`
  - Used on the Dashboard for summary metrics
  - Displays title, value, trend text, and icon

---

## Route Map and Feature Pages

### Top-level pages

- `/login` - Login screen
- `/` - Dashboard
- `/expenses` - Expenses page
- `/payments` - Payments page

### Sales

- `/sales/customers` - Customers
- `/sales/invoices` - Invoices
- `/sales/return` - Sales Return
- `/sales/payments-received` - Payments Received
- `/sales/customer-statement` - Customer Statement

### Purchase

- `/purchase/vendors` - Vendors
- `/purchase/bills` - Bills
- `/purchase/return` - Purchase Return
- `/purchase/vendor-statement` - Vendor Statement
- `/purchase/payments-made` - Payments Made

### Inventory

- `/inventory` - Products list
- `/inventory/stock-management` - Stock Management
- `/inventory/warehouses` - Warehouses
- `/inventory/transfer` - Stock Transfer
- `/inventory/reports` - Inventory Reports

### Accounts

- `/accounts/chart` - Chart of Accounts
- `/accounts/journal` - Journal Entries
- `/accounts/ledger` - Ledger
- `/accounts/trial-balance` - Trial Balance

### Reports

- `/reports/profit-loss` - Profit & Loss
- `/reports/balance-sheet` - Balance Sheet
- `/reports/cash-flow` - Cash Flow
- `/reports/tax-report` - Tax Report
- `/reports/sales-report` - Sales Report
- `/reports/purchase-report` - Purchase Report
- `/reports/inventory-report` - Inventory Report
- `/reports/gst-reports` - GST Reports

### Settings

- `/settings/company-profile` - Company Profile
- `/settings/taxes-gst` - Taxes / GST
- `/settings/invoice-settings` - Invoice Settings
- `/settings/users-roles` - User Roles
- `/settings/backup` - Backup

> Note: Some routes appear in `App.jsx` even though the sidebar link is currently commented out in `Sidebar.jsx`.
>
> The app also contains commented UI and code paths that indicate partially supported or disabled features:
>
> - `src/components/Sidebar.jsx` has several commented-out links for `Chart of Accounts`, `Trial Balance`, `Inventory Reports`, `Balance Sheet`, and `Cash Flow`.
> - `src/App.jsx` still registers routes such as `/accounts/chart`, `/accounts/trial-balance`, `/reports/balance-sheet`, and `/reports/cash-flow`.
> - `src/components/Navbar.jsx` includes a commented search input block, showing planned search functionality that is not currently active.
> - Several commented imports in `App.jsx` suggest pages that were previously part of the navigation or may be added back in later.
>
> These commented sections are useful signals for future feature restoration, but they do not currently render in the production UI.

---

## Dashboard Behavior

- `src/pages/Dashboard.jsx`
  - Reads `invoices`, `customers`, `bills`, and `expenses` from Redux
  - Reads `journalEntries` from `localStorage` key `ledgerpro_journal_entries`
  - Computes:
    - total sales and invoice count
    - customer count
    - net profit as sales minus purchase/expense totals
    - pending receivables and payables
    - monthly revenue trend
    - expense composition for chart display
  - Renders:
    - report cards for summary metrics
    - revenue line chart
    - expense bar chart
    - recent invoices table/card

### Data connections

- `Dashboard` imports helper functions from `src/utils/reportHelpers.js`
- The displayed values are derived from Redux state and localStorage
- Charts are rendered using `recharts`

---

## How to Run

From the `frontend/` directory:

```bash
npm install
npm run dev
```

Common commands:

- `npm run dev` - start development server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

---

## Extending the Frontend

### Add a new page

1. Create the page component in `src/pages/...`
2. Add a route in `src/App.jsx` inside the `<Routes>` block
3. Add a sidebar link in `src/components/Sidebar.jsx`
4. If the page needs persisted data, add a Redux slice and localStorage key

### Add a new persisted state slice

1. Create a slice in `src/redux/`
2. Add persistence using `src/utils/storage.js`
3. Register the reducer in `src/redux/store.js`
4. Use the slice actions in the page component

### Add translation support for new text

- New static text will be translated automatically by `AutoTranslator` unless placed inside a skipped tag.
- Use the existing translation backend endpoint if Hindi text is needed.

---

## Notes

- Frontend data persistence is browser-based through `localStorage`.
- Translation requires a backend API at `http://localhost:5000/translate-batch`.
- Authentication is currently a demo stub and not backed by a real server.

---

## Core Connections

- `main.jsx` → `store.js` + `BrowserRouter`
- `App.jsx` → auth gate and `Layout`
- `Layout` → `Sidebar`, `Navbar`, route pages
- `Navbar` → logout and language toggles
- `Sidebar` → navigation and active route state
- `authSlice` → localStorage auth persistence
- `invoiceSlice`, `customerSlice`, etc. → localStorage data persistence
- `AutoTranslator` + `translate.js` → external translation backend
- `Dashboard` + `reportHelpers` → calculated financial metrics

---

This README documents the frontend routes, components, Redux flow, persistence, translation system, and how the app modules connect together.
