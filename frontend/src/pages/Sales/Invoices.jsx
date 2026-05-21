import { useEffect, useRef, useState } from "react";
import { toWords } from "number-to-words";
import { useDispatch, useSelector } from "react-redux";
import { addPayment } from "../../redux/paymentSlice";
import { addCustomer } from "../../redux/customerSlice";
import { addProduct, reduceProductStock } from "../../redux/productSlice";
import { addPaymentMade } from "../../redux/paymentMadeSlice";
import {
  addInvoice,
  updateInvoice,
  updateInvoicePaymentStatus,
  deleteInvoice,
} from "../../redux/invoiceSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  Printer,
  MessageCircle,
} from "lucide-react";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

const numberToWords = (amount) => {
  const num = Math.round(Number(amount || 0));

  return `${toWords(num).replace(/\b\w/g, (c) => c.toUpperCase())} Only`;
};

export default function Invoices() {
  const dispatch = useDispatch();

  const { invoices } = useSelector((state) => state.invoices);
  const { payments } = useSelector((state) => state.payments);

  const { customers } = useSelector((state) => state.customers);

  const products = useSelector((state) => state.products?.products || []);
  const warehouses = JSON.parse(localStorage.getItem("warehouses")) || [];

  console.log("Invoice products from Redux:", products);
  const handleProductSelect = (index, product) => {
    const updatedItems = [...form.items];

    const savedWarehouses =
      JSON.parse(localStorage.getItem("warehouses")) || [];

    const activeWarehouses = savedWarehouses.filter(
      (w) => (w.status || "Active") === "Active",
    );

    const productWarehouses =
      product.stockByWarehouse?.length > 0
        ? product.stockByWarehouse
        : product.warehouseStocks?.length > 0
          ? product.warehouseStocks.map((w, i) => ({
              warehouseId: w.warehouseId || w.id || w.warehouse || `WH-${i}`,
              warehouseName:
                w.warehouseName || w.name || w.warehouse || "Main Warehouse",
              stock: Number(w.stock || w.qty || 0),
            }))
          : [
              {
                warehouseId: product.warehouse || "Main Warehouse",
                warehouseName: product.warehouse || "Main Warehouse",
                stock: Number(
                  product.currentStock || product.openingStock || 0,
                ),
              },
            ];

    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.id,
      product: product.name || product.productName || "",
      hsn: product.hsn || product.hsnCode || "",
      qty: 1,
      rate: product.salePrice || product.sellingPrice || product.price || 0,
      discount: 0,
      gst: product.gst || product.gstRate || 0,
      stock: Number(productWarehouses[0]?.stock || 0),

      warehouses: productWarehouses,
      warehouseId: productWarehouses[0]?.warehouseId || "",
      warehouseName: productWarehouses[0]?.warehouseName || "",
    };

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const companyProfile =
    JSON.parse(localStorage.getItem("companyProfile")) || {};

  const itemInputRefs = useRef([]);

  const [showModal, setShowModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printInvoiceData, setPrintInvoiceData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentInvoice, setPaymentInvoice] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const generateInvoiceNo = () => `INV-${1000 + invoices.length + 1}`;

  const createDefaultItem = () => ({
    product: "",
    hsn: "",
    qty: 1,
    rate: "",
    discount: 0,
    gst: 0,
    stock: 0,
    productId: null,

    warehouses: [],
    warehouseId: "",
    warehouseName: "",
  });

  const getEmptyForm = () => ({
    id: null,
    invoiceNo: generateInvoiceNo(),

    customerId: "",
    customer: "",
    customerPhone: "",
    customerEmail: "",
    customerGSTIN: "",
    customerAddress: "",
    customerCity: "",
    customerState: "",

    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",

    status: "Unpaid",

    paymentMode: "",
    paymentStatus: "Unpaid",
    paidAmount: 0,
    balanceAmount: 0,

    notes: "",

    items: [createDefaultItem()],
  });

  const [form, setForm] = useState(getEmptyForm());

  const calculateInvoiceTotals = (items = []) => {
    const validItems = items.filter(
      (item) => item.product && Number(item.rate || 0) > 0,
    );

    const subtotal = validItems.reduce((sum, item) => {
      const amount = Number(item.qty || 0) * Number(item.rate || 0);
      const discount = Number(item.discount || 0);
      return sum + Math.max(amount - discount, 0);
    }, 0);

    const totalDiscount = validItems.reduce(
      (sum, item) => sum + Number(item.discount || 0),
      0,
    );

    const gstAmount = validItems.reduce((sum, item) => {
      const amount = Number(item.qty || 0) * Number(item.rate || 0);
      const discount = Number(item.discount || 0);
      const taxable = Math.max(amount - discount, 0);

      return sum + (taxable * Number(item.gst || 0)) / 100;
    }, 0);

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    const exactGrandTotal = subtotal + gstAmount;
    const grandTotal = Math.round(exactGrandTotal);
    const roundOff = grandTotal - exactGrandTotal;

    return {
      subtotal,
      totalDiscount,
      gstAmount,
      cgst,
      sgst,
      grandTotal,
      roundOff,
    };
  };

  const {
    subtotal,
    totalDiscount,
    gstAmount,
    cgst,
    sgst,
    grandTotal,
    roundOff,
  } = calculateInvoiceTotals(form.items);

  const handleCustomerSelect = (customer) => {
    if (!customer) return;

    setForm({
      ...form,
      customerId: customer.id,
      customer: customer.name || "",
      customerPhone: customer.phone || "",
      customerEmail: customer.email || "",
      customerGSTIN: customer.gstin || "",
      customerAddress: customer.billingAddress || "",
      customerCity: customer.city || "",
      customerState: customer.state || "",
    });
  };

  const clearCustomer = () => {
    setForm({
      ...form,
      customerId: "",
      customer: "",
      customerPhone: "",
      customerEmail: "",
      customerGSTIN: "",
      customerAddress: "",
      customerCity: "",
      customerState: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "status") {
      if (value === "Unpaid") {
        setForm({
          ...form,
          status: value,
          paymentMode: "",
          paidAmount: 0,
        });

        return;
      }

      if (value === "Paid") {
        setForm({
          ...form,
          status: value,
          paidAmount: grandTotal,
        });

        return;
      }
    }

    setForm({
      ...form,
      [name]: value,
    });
  };
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    const currentItem = updatedItems[index];

    if (field === "qty") {
      const qty = Number(value || 0);
      const stock = Number(currentItem.stock || 0);

      if (currentItem.product && stock > 0 && qty > stock) {
        alert(`Available stock sirf ${stock} hai.`);
        return;
      }
    }

    updatedItems[index] = {
      ...currentItem,
      [field]: value,
    };

    setForm({ ...form, items: updatedItems });
  };

  const focusItemInput = (index) => {
    setTimeout(() => {
      itemInputRefs.current[index]?.focus();
    }, 80);
  };

  const addItemRow = () => {
    const lastItem = form.items[form.items.length - 1];

    if (!lastItem.product || Number(lastItem.rate || 0) <= 0) {
      alert("Product name aur price/rate add karna zaroori hai.");
      focusItemInput(form.items.length - 1);
      return;
    }

    const newIndex = form.items.length;

    setForm({
      ...form,
      items: [...form.items, createDefaultItem()],
    });

    focusItemInput(newIndex);
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;

    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setForm(getEmptyForm());
    setShowModal(false);
    setEditMode(false);
  };

  const saveInvoiceAndReturn = () => {
    if (!form.customer) {
      alert("Please select a customer.");
      return null;
    }

    const invalidItem = form.items.find(
      (item) =>
        !item.product ||
        !item.warehouseId ||
        Number(item.qty || 0) <= 0 ||
        Number(item.rate || 0) <= 0,
    );

    if (invalidItem) {
      alert("Please fill product, warehouse, valid quantity and rate.");
      return null;
    }

    const stockInvalidItem = form.items.find(
      (item) =>
        item.product &&
        Number(item.stock || 0) > 0 &&
        Number(item.qty || 0) > Number(item.stock || 0),
    );

    if (stockInvalidItem) {
      alert(
        `${stockInvalidItem.product} ka available stock sirf ${stockInvalidItem.stock} hai.`,
      );
      return null;
    }

    const totals = calculateInvoiceTotals(form.items);

    const paidAmount = Number(form.paidAmount || 0);
    const balanceAmount = Math.max(totals.grandTotal - paidAmount, 0);

    const invoiceData = {
      ...form,
      id: editMode ? form.id : Date.now(),

      subtotal: totals.subtotal,
      discountAmount: totals.totalDiscount,
      gstAmount: totals.gstAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      roundOff: totals.roundOff,

      amount: totals.grandTotal,
      total: totals.grandTotal,

      paidAmount,
      balanceAmount,

      paymentMode: form.paymentMode || "Cash",

      status:
        paidAmount >= totals.grandTotal
          ? "Paid"
          : paidAmount > 0
            ? "Partial"
            : "Unpaid",
    };
    if (editMode) {
      dispatch(updateInvoice(invoiceData));
    } else {
      dispatch(addInvoice(invoiceData));

      dispatch(
        reduceProductStock(
          invoiceData.items.map((item) => ({
            productId: item.productId,
            warehouseId: item.warehouseId,
            warehouseName: item.warehouseName,
            qty: item.qty,
          })),
        ),
      );
      if (Number(invoiceData.paidAmount || 0) > 0) {
        dispatch(
          addPayment({
            id: Date.now() + 1,
            paymentNo: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
            date: invoiceData.invoiceDate,
            customer: invoiceData.customer,
            customerName: invoiceData.customer,
            invoice: invoiceData.invoiceNo,
            invoiceNo: invoiceData.invoiceNo,
            amount: Number(invoiceData.paidAmount || 0),
            mode: invoiceData.paymentMode || "Cash",
            paymentMode: invoiceData.paymentMode || "Cash",
            status: invoiceData.status,
            notes: `Auto payment from invoice ${invoiceData.invoiceNo}`,
          }),
        );
      }
    }

    return invoiceData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedInvoice = saveInvoiceAndReturn();
    if (!savedInvoice) return;

    setShowModal(false);
    setEditMode(false);
    setForm(getEmptyForm());
  };

  const handleSaveAndPreview = () => {
    const savedInvoice = saveInvoiceAndReturn();
    if (!savedInvoice) return;

    setSelectedInvoice(savedInvoice);
  };

  const handleSaveAndWhatsapp = () => {
    const savedInvoice = saveInvoiceAndReturn();
    if (!savedInvoice) return;

    sendWhatsApp(savedInvoice);
  };

  const handleSaveAndPrint = () => {
    const savedInvoice = saveInvoiceAndReturn();
    if (!savedInvoice) return;

    setSelectedInvoice(savedInvoice);

    setTimeout(() => {
      printInvoice();

      setTimeout(() => {
        setSelectedInvoice(null);
      }, 200);
    }, 200);
  };

  const handleEdit = (invoice) => {
    setForm({
      ...getEmptyForm(),
      ...invoice,
      items: invoice.items?.length ? invoice.items : [createDefaultItem()],
    });

    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this invoice?");
    if (!ok) return;

    dispatch(deleteInvoice(id));
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);

    if (toDate && new Date(toDate) < new Date(value)) {
      setToDate(value);
    }
  };

  const handleToDateChange = (value) => {
    if (fromDate && new Date(value) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setToDate(value);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const text =
      `${invoice.invoiceNo} ${invoice.customer} ${invoice.customerPhone} ${invoice.customerGSTIN} ${invoice.amount}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : invoice.status === statusFilter;

    const invoiceDate = new Date(invoice.invoiceDate);

    const matchesFrom = fromDate ? invoiceDate >= new Date(fromDate) : true;
    const matchesTo = toDate ? invoiceDate <= new Date(toDate) : true;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0,
  );

  const paidCount = filteredInvoices.filter((i) => i.status === "Paid").length;
  const unpaidCount = filteredInvoices.filter(
    (i) => i.status === "Unpaid",
  ).length;

  const exportInvoices = () => {
    const headers = [
      "Invoice No",
      "Customer",
      "Phone",
      "Amount",
      "Status",
      "Date",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNo,
      invoice.customer,
      invoice.customerPhone,
      invoice.amount,
      invoice.status,
      invoice.invoiceDate,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendWhatsApp = (invoice) => {
    const phone = invoice.customerPhone?.replace(/\D/g, "");

    if (!phone) {
      alert("Customer phone number not found.");
      return;
    }

    const message = `Hello ${invoice.customer}, your invoice ${invoice.invoiceNo} amount is ${money(
      invoice.amount,
    )}. Thank you.`;

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const printInvoice = () => {
    const printContent = document.getElementById("invoice-print");

    if (!printContent) {
      alert("Invoice preview not found.");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    doc.open();
    doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: A4;
            margin: 8mm;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
            color: #0f172a;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #invoice-print {
            width: 194mm !important;
            min-height: 281mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }
            .page-break {
  page-break-before: always !important;
  break-before: page !important;
}

.invoice-page {
  width: 194mm !important;
  background: white !important;
  margin-bottom: 0 !important;
}
  .page-break {
  page-break-before: always !important;
  break-before: page !important;
}


          tr, td, th, div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Invoices</h1>
          <p className="mt-2 text-slate-300">Manage GST sales invoices.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white "
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total Invoice Value" value={money(totalAmount)} />
        <StatCard title="Paid Invoices" value={paidCount} />
        <StatCard title="Unpaid Invoices" value={unpaidCount} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice, customer, phone..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <Input
            label="Start Date"
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => handleToDateChange(e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-bold">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <FileText className="text-[var(--primary)]" />
          Invoice List
        </h2>

        <button
          onClick={exportInvoices}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <div className="space-y-4 md:hidden">
        {sortedInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-lg font-black">{invoice.invoiceNo}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {invoice.invoiceDate}
                </p>
              </div>

              <StatusBadge status={invoice.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileBox label="Customer" value={invoice.customer} />
              <MobileBox label="Phone" value={invoice.customerPhone || "-"} />
              <MobileBox label="GSTIN" value={invoice.customerGSTIN || "-"} />
              <MobileBox label="Amount" value={money(invoice.amount)} strong />
              <MobileBox label="Paid" value={money(invoice.paidAmount || 0)} />
              <MobileBox
                label="Balance"
                value={money(invoice.balanceAmount || invoice.amount || 0)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
              <ActionButton
                color="blue"
                onClick={() => setSelectedInvoice(invoice)}
              >
                <Eye size={16} />
              </ActionButton>

              <ActionButton color="yellow" onClick={() => handleEdit(invoice)}>
                <Pencil size={16} />
              </ActionButton>

              <ActionButton
                color="red"
                onClick={() => handleDelete(invoice.id)}
              >
                <Trash2 size={16} />
              </ActionButton>

              {/* <ActionButton color="green" onClick={() => sendWhatsApp(invoice)}>
                <MessageCircle size={16} />
              </ActionButton> */}
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
            No invoices found
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] md:block">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-[var(--surface-soft)]">
            <tr>
              <Th>Invoice No</Th>
              <Th>Customer</Th>
              <Th>Phone</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Paid</Th>
              <Th>Balance</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {sortedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-t border-[var(--border)] hover:bg-[var(--surface-soft)]"
              >
                <Td bold>{invoice.invoiceNo}</Td>
                <Td>{invoice.customer}</Td>
                <Td>{invoice.customerPhone || "-"}</Td>
                <Td bold>{money(invoice.amount)}</Td>
                <Td>
                  <StatusBadge status={invoice.status} />
                </Td>
                <Td bold>{money(invoice.paidAmount || 0)}</Td>
                <Td bold>
                  {money(invoice.balanceAmount || invoice.amount || 0)}
                </Td>
                <Td>{invoice.invoiceDate}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <ActionButton
                      color="blue"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye size={16} />
                    </ActionButton>

                    <ActionButton
                      color="yellow"
                      onClick={() => handleEdit(invoice)}
                    >
                      <Pencil size={16} />
                    </ActionButton>

                    <ActionButton
                      color="red"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      <Trash2 size={16} />
                    </ActionButton>

                    {/* <ActionButton
                      color="green"
                      onClick={() => sendWhatsApp(invoice)}
                    >
                      <MessageCircle size={16} />
                    </ActionButton> */}
                  </div>
                </Td>
              </tr>
            ))}

            {filteredInvoices.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-[var(--muted)]"
                >
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div className="max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-5 shadow-2xl">
           <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  {editMode ? "Edit Invoice" : "Create Invoice"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[var(--border)] p-2"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Section title="">
                <Input
                  label="Invoice No"
                  name="invoiceNo"
                  value={form.invoiceNo}
                  onChange={handleChange}
                />

                <CustomerSearchBox
                  customers={customers}
                  selectedCustomer={form.customer}
                  onSelect={handleCustomerSelect}
                  onClear={clearCustomer}
                  onAddCustomer={() => setShowCustomerModal(true)}
                  editMode={editMode}
                />

                <Input
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={form.invoiceDate}
                  onChange={handleChange}
                />

                <Input
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  min={form.invoiceDate}
                  onChange={(e) => {
                    if (
                      form.invoiceDate &&
                      new Date(e.target.value) < new Date(form.invoiceDate)
                    ) {
                      alert("Due date invoice date se pehle nahi ho sakti.");
                      return;
                    }

                    handleChange(e);
                  }}
                />
              </Section>

              {form.customer && (
                <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 md:grid-cols-4">
                  <Info label="Customer" value={form.customer} />
                  <Info label="Phone" value={form.customerPhone || "-"} />
                  <Info label="GSTIN" value={form.customerGSTIN || "-"} />
                  <Info label="State" value={form.customerState || "-"} />
                </div>
              )}

              <div>
               <div className="relative w-full overflow-visible rounded-2xl border border-[var(--border)]">
                 <table className="w-full border-separate border-spacing-y-2 text-sm">
                    <thead className="bg-[var(--surface-soft)]">
                      <tr>
                       <Th className="w-[220px]">Product</Th>
                        <Th className="w-[190px]">Warehouse</Th>
                        <Th>HSN</Th>
                       <Th className="w-[90px]">Qty</Th>
<Th className="w-[110px]">Rate</Th>
<Th className="w-[110px]">Discount</Th>
<Th className="w-[90px]">GST %</Th>
                       
                        <Th className="w-[120px]">Amount</Th>
<Th className="w-[120px]">Total</Th>
                        <Th>Action</Th>
                      </tr>
                    </thead>

                    <tbody>
                      {form.items.map((item, index) => {
                        const amount =
                          Number(item.qty || 0) * Number(item.rate || 0);

                        const discount = Number(item.discount || 0);

                        const taxable = Math.max(amount - discount, 0);

                        const itemGst = (taxable * Number(item.gst || 0)) / 100;

                        const itemTotal = taxable + itemGst;

                        return (
                          <tr
  key={index}
  className="rounded-xl bg-white"
>
                            <Td>
                              <ProductSearchBox
                                products={products || []}
                                value={item.product}
                                inputRef={(el) =>
                                  (itemInputRefs.current[index] = el)
                                }
                                onChange={(value) =>
                                  handleItemChange(index, "product", value)
                                }
                                onSelect={(product) =>
                                  handleProductSelect(index, product)
                                }
                                onAddProduct={() => setShowProductModal(true)}
                              />
                            </Td>

                            <Td>
                              <select
                                value={item.warehouseId || ""}
                                onChange={(e) => {
                                  const selectedWarehouse = (
                                    item.warehouses || []
                                  ).find(
                                    (w) =>
                                      String(w.warehouseId) ===
                                      String(e.target.value),
                                  );

                                  const updatedItems = [...form.items];

                                  updatedItems[index] = {
                                    ...updatedItems[index],
                                    warehouseId: e.target.value,
                                    warehouseName:
                                      selectedWarehouse?.warehouseName || "",
                                    stock: Number(
                                      selectedWarehouse?.stock || 0,
                                    ),
                                    qty:
                                      Number(updatedItems[index].qty || 0) >
                                      Number(selectedWarehouse?.stock || 0)
                                        ? 1
                                        : updatedItems[index].qty,
                                  };

                                  setForm({
                                    ...form,
                                    items: updatedItems,
                                  });
                                }}
                                disabled={!item.product}
                               className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                <option value="">
                                  {!item.product
                                    ? "Select product first"
                                    : "Select Warehouse"}
                                </option>

                                {(item.warehouses || []).map((warehouse) => (
                                  <option
                                    key={warehouse.warehouseId}
                                    value={warehouse.warehouseId}
                                  >
                                    {warehouse.warehouseName} - Stock:{" "}
                                    {warehouse.stock}
                                  </option>
                                ))}
                              </select>
                            </Td>
                            <Td>
                              <input
                                value={item.hsn}
                                onChange={(e) =>
                                  handleItemChange(index, "hsn", e.target.value)
                                }
                                placeholder="HSN"
                                className="w-28 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                              />
                            </Td>

                            <Td>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) =>
                                  handleItemChange(index, "qty", e.target.value)
                                }
                                className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                              />
                            </Td>
                            {/* {item.product && (
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                Stock: {item.stock || 0}
                              </p>
                            )} */}

                            <Td>
                              <input
                                type="number"
                                min="0"
                                value={item.rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "rate",
                                    e.target.value,
                                  )
                                }
                                className="w-32 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                              />
                            </Td>

                            <Td>
                              <input
                                type="number"
                                min="0"
                                value={item.discount || 0}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "discount",
                                    e.target.value,
                                  )
                                }
                                className="w-28 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                              />
                            </Td>

                            <Td>
                              <input
                                type="number"
                                min="0"
                                value={item.gst}
                                onChange={(e) =>
                                  handleItemChange(index, "gst", e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Tab" &&
                                    !e.shiftKey &&
                                    index === form.items.length - 1
                                  ) {
                                    e.preventDefault();
                                    addItemRow();
                                  }
                                }}
                                className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                              />
                            </Td>

                            <Td bold>{money(taxable)}</Td>
                            <Td bold>{money(itemTotal)}</Td>

                            <Td>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={addItemRow}
                                  className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700"
                                >
                                  + Add
                                </button>

                                {form.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItemRow(index)}
                                    className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="ml-auto max-w-md space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <SummaryRow label="Taxable Amount" value={money(subtotal)} />

                {totalDiscount > 0 && (
                  <SummaryRow label="Discount" value={money(totalDiscount)} />
                )}

                {gstAmount > 0 && (
                  <>
                    <SummaryRow label="CGST" value={money(cgst)} />
                    <SummaryRow label="SGST" value={money(sgst)} />
                    <SummaryRow label="GST Amount" value={money(gstAmount)} />
                  </>
                )}

                {roundOff !== 0 && (
                  <SummaryRow label="Round Off" value={money(roundOff)} />
                )}

                <div className="border-t border-[var(--border)] pt-4">
                  <SummaryRow
                    label="Grand Total"
                    value={money(grandTotal)}
                    strong
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Notes</label>
                <textarea
                  rows="4"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Invoice notes..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                />
              </div>

              <Section title="">
                <div>
                  <label className="mb-1 block text-sm font-bold">
                    Payment Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold">
                    Payment Mode
                  </label>

                  <select
                    name="paymentMode"
                    value={form.paymentMode}
                    onChange={handleChange}
                    disabled={form.status === "Unpaid"}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {form.status === "Unpaid"
                        ? "No Payment"
                        : "Select Payment Mode"}
                    </option>

                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <Input
                  label="Paid Amount"
                  type="number"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  readOnly={form.status === "Unpaid"}
                  max={grandTotal}
                />

                <Input
                  label="Due Amount"
                  value={Math.max(
                    Number(grandTotal || 0) - Number(form.paidAmount || 0),
                    0,
                  )}
                  readOnly
                />
              </Section>

              <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndWhatsapp}
                  className="rounded-xl bg-green-600 px-5 py-3 font-black text-white"
                >
                  Send WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-black text-white"
                >
                  Print Invoice
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndPreview}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white"
                >
                  Preview
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
                >
                  {editMode ? "Update Invoice" : "Save Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <InvoicePreviewModal
          invoice={selectedInvoice}
          companyProfile={companyProfile}
          money={money}
          sendWhatsApp={sendWhatsApp}
          printInvoice={printInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {showPaymentModal && paymentInvoice && (
        <QuickPaymentModal
          invoice={paymentInvoice}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(paymentInvoice);
            setPaymentInvoice(null);
          }}
          onSave={(paymentData) => {
            dispatch(addPayment(paymentData));

            const updatedInvoice = {
              ...paymentInvoice,
              paidAmount:
                Number(paymentInvoice.paidAmount || 0) +
                Number(paymentData.amount || 0),
              balanceAmount:
                Number(paymentInvoice.amount || 0) -
                (Number(paymentInvoice.paidAmount || 0) +
                  Number(paymentData.amount || 0)),
              status:
                Number(paymentInvoice.paidAmount || 0) +
                  Number(paymentData.amount || 0) >=
                Number(paymentInvoice.amount || 0)
                  ? "Paid"
                  : Number(paymentData.amount || 0) > 0
                    ? "Partial"
                    : "Unpaid",
            };

            dispatch(
              updateInvoicePaymentStatus({
                invoiceNo: paymentInvoice.invoiceNo,
                paidAmount: paymentData.amount,
              }),
            );

            setShowPaymentModal(false);
            setPaymentInvoice(null);

            setSelectedInvoice(updatedInvoice);
          }}
        />
      )}

      {showCustomerModal && (
        <QuickAddCustomerModal
          onClose={() => setShowCustomerModal(false)}
          onSave={(customerData) => {
            dispatch(addCustomer(customerData));
            handleCustomerSelect(customerData);
            setShowCustomerModal(false);
          }}
        />
      )}

      {showProductModal && (
        <QuickAddProductModal
          onClose={() => setShowProductModal(false)}
          onSave={(productData) => {
            dispatch(addProduct(productData));
            setShowProductModal(false);
          }}
        />
      )}
    </div>
  );
}
function InvoicePreviewModal({
  invoice,
  companyProfile,
  money,
  sendWhatsApp,
  printInvoice,
  onClose,
}) {
  const hasGST = invoice.items?.some((item) => Number(item.gst || 0) > 0);

  const subtotal = Number(invoice.subtotal || 0);
  const gstAmount = Number(invoice.gstAmount || 0);
  const cgst = Number(invoice.cgst || 0);
  const sgst = Number(invoice.sgst || 0);
  const grandTotal = Number(invoice.amount || invoice.total || 0);
  const roundOff = Number(invoice.roundOff || 0);

  const items = invoice.items || [];

  const FIRST_PAGE_LIMIT = hasGST ? 20 : 16;
  const hasMultiplePages = items.length > FIRST_PAGE_LIMIT;

  const firstPageItems = hasMultiplePages
    ? items.slice(0, FIRST_PAGE_LIMIT)
    : items;

  const secondPageItems = hasMultiplePages ? items.slice(FIRST_PAGE_LIMIT) : [];

  const emptyRows =
    !hasMultiplePages && items.length <= 4
      ? 8
      : !hasMultiplePages && items.length <= 8
        ? 2
        : 0;

  const renderTableHead = () => (
    <thead>
      <tr className="bg-slate-100">
        <th className="border-b border-r border-slate-800 px-2 py-2">#</th>
        <th className="border-b border-r border-slate-800 px-2 py-2 text-left">
          Product / Service
        </th>
        <th className="border-b border-r border-slate-800 px-2 py-2">HSN</th>
        <th className="border-b border-r border-slate-800 px-2 py-2">Qty</th>
        <th className="border-b border-r border-slate-800 px-2 py-2 text-right">
          Rate
        </th>
        <th className="border-b border-r border-slate-800 px-2 py-2 text-right">
          Discount
        </th>

        <th className="border-b border-r border-slate-800 px-2 py-2 text-right">
          Amount
        </th>
        {hasGST && (
          <th className="border-b border-r border-slate-800 px-2 py-2">GST</th>
        )}
        <th className="border-b border-slate-800 px-2 py-2 text-right">
          Total
        </th>
      </tr>
    </thead>
  );

  const renderItemRows = (list, startIndex = 0) =>
    list.map((item, index) => {
      const amount = Number(item.qty || 0) * Number(item.rate || 0);

      const discount = Number(item.discount || 0);

      const taxable = Math.max(amount - discount, 0);

      const itemGst = (taxable * Number(item.gst || 0)) / 100;

      const total = taxable + itemGst;

      return (
        <tr key={`${startIndex}-${index}`}>
          <td className="border-r border-slate-800 px-2 py-2 text-center">
            {startIndex + index + 1}
          </td>
          <td className="border-r border-slate-800 px-2 py-2 font-bold">
            {item.product || "-"}
          </td>
          <td className="border-r border-slate-800 px-2 py-2 text-center">
            {item.hsn || "-"}
          </td>
          <td className="border-r border-slate-800 px-2 py-2 text-center">
            {item.qty || 0}
          </td>
          <td className="border-r border-slate-800 px-2 py-2 text-right">
            {money(item.rate)}
          </td>

          <td className="border-r border-slate-800 px-2 py-2 text-right">
            {money(item.discount || 0)}
          </td>

          <td className="border-r border-slate-800 px-2 py-2 text-right">
            {money(taxable)}
          </td>
          {hasGST && (
            <td className="border-r border-slate-800 px-2 py-2 text-center">
              {item.gst || 0}%
            </td>
          )}
          <td className="px-2 py-2 text-right font-black">{money(total)}</td>
        </tr>
      );
    });

  const renderFooterDetails = () => (
    <>
      <div className="grid grid-cols-2 border-t border-slate-800">
        <div className="border-r border-slate-800 p-3 text-xs">
          <div>
            <b className="font-bold">Amount in Words:</b>
            <p className="mt-2 text-[11px] leading-5">
              {numberToWords(grandTotal)}
            </p>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-black uppercase">Bank Details</h3>
            <div className="text-[10.5px] leading-5">
              <p>Bank Name: {companyProfile.bankName || "-"}</p>
              <p>A/C No: {companyProfile.accountNumber || "-"}</p>
              <p>IFSC: {companyProfile.ifsc || "-"}</p>
              <p>UPI: {companyProfile.upi || "-"}</p>

              <div className="border-t border-slate-800 py-2 mt-5">
                <h3 className="mb-2 text-xs font-black uppercase">
                  Terms & Conditions
                </h3>
                <p className="mx-auto max-w-[170mm] text-[10px] leading-4">
                  {companyProfile.terms ||
                    "Goods once sold will not be taken back. Payment should be made within the due date."}
                </p>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-5">
              <b>Notes:</b>
              <p className="mt-1 text-[11px] leading-5">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between text-xs">
          <div>
            <TotalRow
              label={hasGST ? "Taxable Amount" : "Sub Total"}
              value={money(subtotal)}
            />
            {Number(invoice.discountAmount || 0) > 0 && (
              <TotalRow
                label="Discount"
                value={money(invoice.discountAmount)}
              />
            )}

            {hasGST && gstAmount > 0 && (
              <>
                <TotalRow label="CGST" value={money(cgst)} />
                <TotalRow label="SGST" value={money(sgst)} />
                <TotalRow label="GST Amount" value={money(gstAmount)} bold />
              </>
            )}
            <TotalRow label="Round Off" value={money(roundOff)} />

            <div className="flex justify-between border-t border-slate-800 px-4 py-3 text-lg font-black">
              <span>Grand Total</span>
              <span>{money(grandTotal)}</span>
            </div>
          </div>

          <div className="px-4 pb-3 pt-6 text-right">
            <p className="mb-8 text-xs font-black">
              For {companyProfile.companyName || "ABC INFOTECH"}
            </p>
            <div className="ml-auto w-48 border-b border-slate-800" />
            <p className="mt-2 text-xs font-black">Authorized Signature</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
        <div
          id="invoice-print"
          className="mx-auto bg-white text-slate-900"
          style={{
            width: "194mm",
            padding: "0",
            boxSizing: "border-box",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div className="invoice-page border border-slate-800">
            <div className="border-b border-slate-800 p-4">
              <div className="mx-auto flex w-fit items-center justify-center gap-4 text-center">
                {/* {companyProfile.logo ? (
      <img
        src={companyProfile.logo}
        alt="Logo"
        className="h-14 w-14 object-contain"
      />
    ) : (
      <div className="flex h-14 w-14 items-center justify-center border border-slate-700 text-[10px] font-bold">
        LOGO
      </div>
    )} */}

                <div className="text-center">
                  <h1 className="text-xl font-black uppercase tracking-wide">
                    {companyProfile.companyName || "Namdev Traders"}
                  </h1>

                  <p className="mt-1 text-[10.5px] leading-4">
                    {companyProfile.address ||
                      "MP Nagar, Bhopal, Madhya Pradesh"}
                  </p>

                  {hasGST && (
                    <p className="text-[10.5px] leading-4">
                      GSTIN: {companyProfile.gstin || "-"}
                    </p>
                  )}

                  <p className="text-[10.5px] leading-4">
                    Phone: {companyProfile.phone || "-"} | Email:{" "}
                    {companyProfile.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* {hasMultiplePages && (
                    <p>
                      Page: <b>1/2</b>
                    </p>
                  )} */}

            <div className="grid grid-cols-2 border-b border-slate-800">
              <div className="border-r border-slate-800 p-4">
                <h3 className="mb-2 text-xs font-black uppercase">
                  Bill To: {invoice.customer}
                </h3>

                <div className="mt-2 text-[10.5px] leading-5">
                  <p>{invoice.customerAddress || "-"}</p>
                  <p>
                    {invoice.customerCity || ""} {invoice.customerState || ""}
                  </p>
                  {hasGST && <p>GSTIN: {invoice.customerGSTIN || "-"}</p>}
                  <p>Phone: {invoice.customerPhone || "-"}</p>
                  <p>Email: {invoice.customerEmail || "-"}</p>
                </div>
              </div>

              <div className="p-4">
                <h3 className="mb-2 text-xs font-black uppercase">
                  Invoice Details
                </h3>

                <div className="text-[10.5px] leading-5">
                  <p>
                    Invoice No: <b>{invoice.invoiceNo}</b>
                  </p>
                  <p>
                    Invoice Date: <b>{invoice.invoiceDate || "-"}</b>
                  </p>

                  <p>
                    Status: <b>{invoice.status || "Unpaid"} </b> Due Date:{" "}
                    <b>{invoice.dueDate || "-"}</b>
                  </p>

                  <p>
                    Paid Amount: <b>{money(invoice.paidAmount || 0)}</b>
                  </p>

                  <p>
                    Remaining Amount:{" "}
                    <b>{money(invoice.balanceAmount ?? invoice.amount ?? 0)}</b>
                  </p>
                  {/* <p>
      Due Date: <b>{invoice.dueDate || "-"}</b>
    </p> */}
                  <p>
                    Place of Supply: <b>{invoice.customerState || "-"}</b>
                  </p>
                  {hasMultiplePages && (
                    <p>
                      Page: <b>1/2</b>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <table className="w-full border-collapse text-[10.5px]">
              {renderTableHead()}
              <tbody>
                {renderItemRows(firstPageItems, 0)}

                {!hasMultiplePages &&
                  Array.from({ length: emptyRows }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="h-7 border-r border-slate-800">&nbsp;</td>
                      <td className="border-r border-slate-800"></td>
                      <td className="border-r border-slate-800"></td>
                      <td className="border-r border-slate-800"></td>
                      <td className="border-r border-slate-800"></td>
                      <td className="border-r border-slate-800"></td>
                      <td className="border-r border-slate-800"></td>
                      {hasGST && (
                        <td className="border-r border-slate-800"></td>
                      )}
                      <td></td>
                    </tr>
                  ))}

                {hasMultiplePages && (
                  <tr>
                    <td
                      colSpan={hasGST ? 8 : 7}
                      className="border-t border-slate-800 px-3 py-3 text-center text-xs font-black"
                    >
                      Continued on next page...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {!hasMultiplePages && renderFooterDetails()}
          </div>

          {hasMultiplePages && (
            <div className="invoice-page page-break border border-slate-800">
              <div className="grid grid-cols-[1fr_190px] border-b border-slate-800 p-4">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wide">
                    {companyProfile.companyName || "WEBIX INFOTECH"}
                  </h1>
                  <p className="text-[10.5px] leading-4">
                    Invoice continued...
                  </p>
                </div>

                <div className="text-right">
                  <h2 className="text-1xl font-black uppercase">
                    {hasGST ? "Invoice Details" : "Invoice"}
                  </h2>
                  <div className="mt-2 text-[10.5px] leading-5">
                    <p>
                      Invoice No: <b>{invoice.invoiceNo}</b>
                    </p>
                    <p>
                      Date: <b>{invoice.invoiceDate || "-"}</b>
                    </p>
                    <p>
                      Page: <b>2/2</b>
                    </p>
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse text-[10.5px]">
                {renderTableHead()}
                <tbody>
                  {renderItemRows(secondPageItems, FIRST_PAGE_LIMIT)}
                </tbody>
              </table>

              {renderFooterDetails()}
            </div>
          )}
        </div>

        <div className="no-print mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            onClick={() => sendWhatsApp(invoice)}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white"
          >
            <MessageCircle size={17} /> WhatsApp
          </button>

          <button
            onClick={printInvoice}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
          >
            <Printer size={17} /> Print Invoice
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value, bold }) {
  return (
    <div
      className={`flex justify-between px-4 py-2 ${bold ? "font-black" : "font-bold"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-4 md:grid-cols-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  max,
  placeholder = "",
  required = false,
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        onChange={onChange}
       className={`w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none ${
          readOnly
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : "bg-[var(--surface-soft)]"
        }`}
      />
    </div>
  );
}

function CustomerSearchBox({
  customers,
  selectedCustomer,
  onSelect,
  onClear,
  onAddCustomer,
  editMode = false,
}) {
  const [query, setQuery] = useState(selectedCustomer || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedCustomer || "");
    setOpen(false);
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter((customer) => {
    const text = `${customer.name || ""} ${customer.phone || ""} ${
      customer.email || ""
    } ${customer.gstin || ""}`.toLowerCase();

    return text.includes(query.toLowerCase());
  });

  const handleChange = (value) => {
    setQuery(value);
    setOpen(true);

    const cleanValue = value.replace(/\D/g, "");

    const matchedByPhone = customers.find(
      (customer) =>
        customer.phone &&
        customer.phone.replace(/\D/g, "").includes(cleanValue) &&
        cleanValue.length >= 5,
    );

    if (matchedByPhone) {
      onSelect(matchedByPhone);
    }
  };

  const handleSelect = (customer) => {
    setQuery(`${customer.name} - ${customer.phone || ""}`);
    setOpen(false);
    onSelect(customer);
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    onClear();
  };

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-bold">Customer</label>

      <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
        {/* <Search size={17} className="text-[var(--muted)]" /> */}

        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Customer Name or Phone"
          required
          className="w-full bg-transparent py-3 outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-black text-red-500"
          >
            ×
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 top-[74px] z-[80] max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          {filteredCustomers.length > 0
            ? filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelect(customer)}
                  className="w-full border-b border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-soft)]"
                >
                  <p className="font-black">{customer.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {customer.phone || "-"}
                  </p>
                </button>
              ))
            : !editMode && (
                <div className="space-y-3 px-4 py-4">
                  <p className="text-sm text-[var(--muted)]">
                    No customer found
                  </p>

                  <button
                    type="button"
                    onClick={onAddCustomer}
                    className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white"
                  >
                    + Add New Customer
                  </button>
                </div>
              )}
        </div>
      )}
    </div>
  );
}

function ProductSearchBox({
  products = [],
  value,
  onChange,
  onSelect,
  inputRef,
  onAddProduct,
}) {
  const [open, setOpen] = useState(false);

  const query = String(value || "")
    .trim()
    .toLowerCase();

  const filteredProducts = products.filter((product) => {
    if (Number(product.currentStock || 0) <= 0) return false;
    const text = `
      ${product.name || ""}
      ${product.productName || ""}
      ${product.itemName || ""}
      ${product.sku || ""}
      ${product.hsn || ""}
      ${product.category || ""}
    `.toLowerCase();

    return query.length >= 1 && text.includes(query);
  });

  const handleSelect = (product) => {
    onSelect(product);
    setOpen(false);
  };

  return (
  <div className="relative w-full overflow-visible">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search product name / SKU / HSN"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />

      {open && query.length >= 1 && (
       <div className="absolute left-0 top-[48px] z-[9999999] w-[330px] overflow-visible rounded-xl border border-[var(--border)] bg-white shadow-2xl">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(product);
                }}
                className="w-full border-b border-slate-200 px-4 py-3 text-left hover:bg-slate-100"
              >
                <p className="font-black text-slate-900">
                  {product.name || product.productName || product.itemName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  SKU: {product.sku || "-"} | HSN: {product.hsn || "-"} | Rate:
                  ₹
                  {product.salePrice ||
                    product.sellingPrice ||
                    product.price ||
                    0}{" "}
                  | GST: {product.gst || product.gstRate || 0}%
                </p>
              </button>
            ))
          ) : (
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm text-slate-500">No product found</p>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAddProduct();
                }}
                className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white"
              >
                + Add New Product
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickAddCustomerModal({ onClose, onSave }) {
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    gstin: "",
    billingAddress: "",
    city: "",
    state: "",
  });

  const handleChange = (e) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerForm.name || !customerForm.phone) {
      alert("Customer name aur phone number zaroori hai.");
      return;
    }

    const newCustomer = {
      id: Date.now(),
      ...customerForm,
    };

    onSave(newCustomer);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Add New Customer</h2>
            <p className="text-sm text-[var(--muted)]">
              Create customer directly from invoice.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Customer Name"
              name="name"
              value={customerForm.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              value={customerForm.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              value={customerForm.email}
              onChange={handleChange}
            />

            <Input
              label="GSTIN"
              name="gstin"
              value={customerForm.gstin}
              onChange={handleChange}
            />

            <Input
              label="Billing Address"
              name="billingAddress"
              value={customerForm.billingAddress}
              onChange={handleChange}
            />

            <Input
              label="City"
              name="city"
              value={customerForm.city}
              onChange={handleChange}
            />

            <Input
              label="State"
              name="state"
              value={customerForm.state}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 break-words font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status = "Unpaid" }) {
  const styles = {
    Paid: "bg-green-100 text-green-700",
    Unpaid: "bg-red-100 text-red-700",
    Partial: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[status] || styles.Unpaid
      }`}
    >
      {status}
    </span>
  );
}

function ActionButton({ children, onClick, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 ${styles[color]}`}
    >
      {children}
    </button>
  );
}

function MobileBox({ label, value, strong }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-1 ${
        strong ? "text-lg font-black" : "text-sm font-bold"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function QuickPaymentModal({ invoice, onClose, onSave }) {
  const { payments } = useSelector((state) => state.payments);

  const generatePaymentNo = () =>
    `PAY-${String(payments.length + 1).padStart(3, "0")}`;

  const [payment, setPayment] = useState({
    paymentNo: generatePaymentNo(),
    date: new Date().toISOString().split("T")[0],
    customer: invoice.customer,
    invoice: invoice.invoiceNo,

    invoiceAmount: Number(invoice.amount || invoice.total || 0),
    paidAmount: Number(invoice.paidAmount || 0),
    remainingAmount: Number(invoice.balanceAmount ?? invoice.amount ?? 0),
    currentPayment: Number(invoice.balanceAmount ?? invoice.amount ?? 0),
    balanceAfterPayment: 0,

    mode: "",
    bankAccount: "",
    referenceNo: "",
    status: "Paid",
    notes: `Payment received against ${invoice.invoiceNo}`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "status") {
      const remaining = Number(payment.remainingAmount || 0);

      setPayment({
        ...payment,
        status: value,
        currentPayment: value === "Paid" ? remaining : "",
        balanceAfterPayment: value === "Paid" ? 0 : remaining,
        mode: value === "Pending" ? "" : payment.mode,
        bankAccount: value === "Pending" ? "" : payment.bankAccount,
        referenceNo: value === "Pending" ? "" : payment.referenceNo,
      });

      return;
    }

    if (name === "paidAmount") {
      const paid = Number(value || 0);

      if (paid > grandTotal) {
        alert("Paid amount total amount se zyada nahi ho sakta.");
        return;
      }

      setForm({
        ...form,
        paidAmount: value,
        status: paid >= grandTotal ? "Paid" : paid > 0 ? "Partial" : "Unpaid",
        paymentMode: paid > 0 ? form.paymentMode : "",
      });

      return;
    }

    if (name === "currentPayment") {
      const payNow = Number(value || 0);
      const remaining = Number(payment.remainingAmount || 0);

      setPayment({
        ...payment,
        currentPayment: value,
        balanceAfterPayment: Math.max(remaining - payNow, 0),
        status:
          payNow >= remaining ? "Paid" : payNow > 0 ? "Partial" : "Pending",
      });

      return;
    }

    setPayment({
      ...payment,
      [name]: value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(payment.currentPayment || 0);

    if (payment.status !== "Pending" && amount <= 0) {
      alert("Payment amount enter karo.");
      return;
    }

    if (payment.status !== "Pending" && !payment.mode) {
      alert("Payment mode select karo.");
      return;
    }

    if (amount > Number(payment.remainingAmount || 0)) {
      alert("Payment remaining amount se zyada nahi ho sakta.");
      return;
    }

    onSave({
      ...payment,
      id: Date.now(),
      amount,
    });
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Record Payment</h2>

            <p className="text-sm text-[var(--muted)]">
              Invoice saved successfully.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              label="Payment No"
              name="paymentNo"
              value={payment.paymentNo}
              onChange={handleChange}
            />

            <Input
              label="Payment Date"
              type="date"
              name="date"
              value={payment.date}
              onChange={handleChange}
            />

            <Input
              label="Customer"
              name="customer"
              value={payment.customer}
              onChange={handleChange}
              readOnly
            />

            <Input
              label="Invoice No"
              name="invoice"
              value={payment.invoice}
              onChange={handleChange}
              readOnly
            />

            {/* <Input
  label="Old Remaining"
  name="remainingAmount"
  type="number"
  value={payment.remainingAmount}
  onChange={handleChange}
  readOnly
/> */}

            {payment.status !== "Pending" && (
              <Input
                label={
                  payment.status === "Partial" ? "Pay Now" : "Current Payment"
                }
                name="currentPayment"
                type="number"
                value={payment.currentPayment}
                onChange={handleChange}
                required
              />
            )}

            <Input
              label="Balance After Payment"
              name="balanceAfterPayment"
              type="number"
              value={payment.balanceAfterPayment || 0}
              onChange={handleChange}
              readOnly
            />

            <div>
              <label className="mb-1 block text-sm font-bold">
                Payment Mode
              </label>

              <select
                name="mode"
                value={payment.mode}
                onChange={handleChange}
                disabled={payment.status === "Pending"}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <Input
              label="Bank / Cash Account"
              name="bankAccount"
              value={payment.bankAccount}
              onChange={handleChange}
            />

            <Input
              label="Reference No"
              name="referenceNo"
              value={payment.referenceNo}
              onChange={handleChange}
            />

            <div>
              <label className="mb-1 block text-sm font-bold">Status</label>

              <select
                name="status"
                value={payment.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              Skip
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-3 text-left text-xs font-black uppercase whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, bold }) {
  return (
  <td
  className={`px-3 py-2 align-middle text-sm whitespace-nowrap ${bold ? "font-bold" : ""}`}
>
      {children}
    </td>
  );
}

function QuickAddProductModal({ onClose, onSave }) {
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "Pcs",
    hsn: "",
    warehouse: "",
    openingStock: "",
    currentStock: "",
    reorderLevel: "",
    purchasePrice: "",
    salePrice: "",
    gst: "18",
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProductForm({
      ...productForm,
      [name]: value,
      ...(name === "openingStock" ? { currentStock: value } : {}),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!productForm.name || !productForm.sku) {
      alert("Product name aur SKU zaroori hai.");
      return;
    }

    if (Number(productForm.currentStock || 0) <= 0) {
      alert("Stock 0 se zyada hona chahiye.");
      return;
    }

    if (Number(productForm.salePrice || 0) <= 0) {
      alert("Sale price zaroori hai.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      ...productForm,
      openingStock: Number(productForm.openingStock || 0),
      currentStock: Number(
        productForm.currentStock || productForm.openingStock || 0,
      ),
      reorderLevel: Number(productForm.reorderLevel || 0),
      purchasePrice: Number(productForm.purchasePrice || 0),
      salePrice: Number(productForm.salePrice || 0),
      gst: Number(productForm.gst || 0),
    };

    onSave(newProduct);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Add New Product</h2>
            <p className="text-sm text-[var(--muted)]">
              Create product directly from invoice.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Product Details">
            <Input
              label="Product Name"
              name="name"
              value={productForm.name}
              onChange={handleChange}
              required
            />
            <Input
              label="SKU"
              name="sku"
              value={productForm.sku}
              onChange={handleChange}
              required
            />
            <Input
              label="Category"
              name="category"
              value={productForm.category}
              onChange={handleChange}
            />
            <Input
              label="HSN Code"
              name="hsn"
              value={productForm.hsn}
              onChange={handleChange}
            />
          </Section>

          <Section title="Stock & Price">
            <Input
              label="Opening Stock"
              name="openingStock"
              type="number"
              value={productForm.openingStock}
              onChange={handleChange}
              required
            />
            <Input
              label="Current Stock"
              name="currentStock"
              type="number"
              value={productForm.currentStock}
              onChange={handleChange}
              required
            />
            <Input
              label="Sale Price"
              name="salePrice"
              type="number"
              value={productForm.salePrice}
              onChange={handleChange}
              required
            />
            <Input
              label="GST %"
              name="gst"
              type="number"
              value={productForm.gst}
              onChange={handleChange}
            />
          </Section>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
