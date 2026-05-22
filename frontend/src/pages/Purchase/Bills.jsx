import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBill, updateBill, deleteBill } from "../../redux/billSlice";
import { addVendor } from "../../redux/vendorSlice";
import { addProduct, increaseProductStock } from "../../redux/productSlice";
import { addPaymentMade } from "../../redux/paymentMadeSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  FileText,
} from "lucide-react";

const initialBills = [
  {
    id: 1,
    billNo: "BILL-001",
    vendor: "Textile Supplier",
    vendorBillNo: "SUP-8891",
    billDate: "2026-05-09",
    dueDate: "2026-05-25",
    status: "Unpaid",
    notes: "Fabric purchase bill.",
    items: [
      {
        product: "Cotton Fabric",
        qty: 10,
        rate: 3500,
        gst: 18,
      },
    ],
  },
];

const emptyForm = {
  id: null,

  billNo: "",
  vendor: "",
  vendorId: "",

  vendorPhone: "",
  vendorGSTIN: "",

  vendorBillNo: "",

  billDate: new Date().toISOString().split("T")[0],
  dueDate: "",

  status: "Unpaid",

  paymentMode: "",
  paidAmount: 0,
  balanceAmount: 0,

  notes: "",

 items: [
  {
    productId: "",
    product: "",
    warehouseId: "",
    warehouseName: "",
    qty: 1,
    rate: 0,
    discount: 0,
    gst: 18,
  },
],
};

export default function Bills() {
  const vendors = useSelector((state) => state.vendors?.vendors || []);
  const products = useSelector((state) => state.products?.products || []);

  const warehouses = JSON.parse(localStorage.getItem("warehouses")) || [];

const activeWarehouses = warehouses.filter(
  (w) => (w.status || "Active") === "Active"
);

  const paymentsMade = useSelector(
  (state) => state.paymentsMade?.paymentsMade || []
);

  const itemInputRefs = useRef([]);

  const dispatch = useDispatch();
  const bills = useSelector((state) => state.bills?.bills || []);
  const [form, setForm] = useState({
    ...emptyForm,
    billNo: `BILL-${String(initialBills.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const calculateSubtotal = (items = []) =>
    items.reduce((sum, item) => {
  const gross =
    Number(item.qty || 0) * Number(item.rate || 0);

  const discount = Number(item.discount || 0);

  return sum + Math.max(gross - discount, 0);
}, 0);
  const calculateGST = (items = []) =>
    items.reduce((sum, item) => {
      const gross =
        Number(item.qty || 0) * Number(item.rate || 0);

      const discount = Number(item.discount || 0);

      const taxable = Math.max(gross - discount, 0);

      return sum + (taxable  * Number(item.gst || 0)) / 100;
    }, 0);

  const calculateTotal = (items = []) =>
    calculateSubtotal(items) + calculateGST(items);

  const generateBillNo = () =>
    `BILL-${String(bills.length + 1).padStart(3, "0")}`;

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

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const text =
        `${bill.billNo} ${bill.vendor} ${bill.vendorBillNo} ${bill.status}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || bill.status === statusFilter;

      const billDate = new Date(bill.billDate);
      const matchesFrom = fromDate ? billDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? billDate <= new Date(toDate) : true;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [bills, search, statusFilter, fromDate, toDate]);

  const totalBillValue = filteredBills.reduce(
    (sum, bill) => sum + calculateTotal(bill.items),
    0,
  );

  const paidCount = filteredBills.filter(
    (bill) => bill.status === "Paid",
  ).length;
  const unpaidCount = filteredBills.filter(
    (bill) => bill.status === "Unpaid",
  ).length;
  const partialCount = filteredBills.filter(
    (bill) => bill.status === "Partial",
  ).length;

  const resetForm = () => {
    setForm({
      ...emptyForm,
      billNo: generateBillNo(),
    });
    setEditMode(false);
    setShowModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

const handleChange = (e) => {
  const { name, value } = e.target;

 const rawTotal = calculateTotal(form.items);

const total = Math.round(rawTotal);

const roundOff = Number(
  (total - rawTotal).toFixed(2)
);


  if (name === "status") {
    if (value === "Unpaid") {
      setForm({
        ...form,
        status: value,
        paymentMode: "",
        paidAmount: 0,
        balanceAmount: total,
      });

      return;
    }

    if (value === "Paid") {
      setForm({
        ...form,
        status: value,
        paidAmount: total,
        balanceAmount: 0,
      });

      return;
    }
  }

  if (name === "paidAmount") {
    const paid = Number(value || 0);

    if (paid > total) {
      alert("Paid amount bill amount se zyada nahi ho sakta.");
      return;
    }

    setForm({
      ...form,
      paidAmount: paid,
      balanceAmount: Math.max(total - paid, 0),

      status:
        paid >= total
          ? "Paid"
          : paid > 0
          ? "Partial"
          : "Unpaid",
    });

    return;
  }

  setForm({
    ...form,
    [name]: value,
  });
};

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const handleVendorSelect = (vendor) => {
    setForm({
      ...form,
      vendorId: vendor.id,
      vendor: vendor.name || "",
      vendorPhone: vendor.phone || "",
      vendorGSTIN: vendor.gstin || "",
    });
  };

  const clearVendor = () => {
    setForm({
      ...form,
      vendorId: "",
      vendor: "",
      vendorPhone: "",
      vendorGSTIN: "",
    });
  };

  const handleProductSelect = (index, product) => {
    const selectedProductId = product.id;

    const existingIndex = form.items.findIndex(
      (item, i) =>
        i !== index && String(item.productId) === String(selectedProductId),
    );

    let updatedItems = [...form.items];

    if (existingIndex !== -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        qty: Number(updatedItems[existingIndex].qty || 0) + 1,
      };

      updatedItems = updatedItems.filter((_, i) => i !== index);
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        product: product.name || product.productName || product.itemName || "",
        qty: Number(updatedItems[index].qty || 1),
        rate:
          product.purchasePrice ||
          product.purchaseRate ||
          product.costPrice ||
          product.sellingPrice ||
          product.salePrice ||
          product.price ||
          product.rate ||
          0,
        gst: product.taxRate || product.gst || product.gstRate || 0,
        sku: product.sku || "",
      };
    }

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const addItemRow = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
       {
  productId: "",
  product: "",
  warehouseId: "",
  warehouseName: "",
  qty: 1,
  rate: 0,
  discount: 0,
  gst: 18,
},
      ],
    });
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };
const handleSubmit = (e) => {

  const invalidItem = form.items.find(
  (item) =>
    !item.productId ||
    !item.warehouseId ||
    Number(item.qty || 0) <= 0 ||
    Number(item.rate || 0) <= 0
);

if (invalidItem) {
  alert("Product, warehouse, valid qty aur rate required hai.");
  return;
}

  e.preventDefault();

  const total = calculateTotal(form.items);

  const paidAmount = Number(form.paidAmount || 0);

  const balanceAmount = Math.max(total - paidAmount, 0);

  const payload = {
    ...form,

    id: editMode ? form.id : Date.now(),

    total,
    amount: total,
    roundOff,

    paidAmount,
    balanceAmount,

    paymentMode: form.paymentMode || "Cash",

    status:
      paidAmount >= total
        ? "Paid"
        : paidAmount > 0
        ? "Partial"
        : "Unpaid",
  };

  if (editMode) {
    dispatch(updateBill(payload));
  } else {
    dispatch(addBill(payload));

   dispatch(
  increaseProductStock(
    payload.items.map((item) => ({
      productId: item.productId,
      productName: item.product,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      qty: Number(item.qty || 0),
    }))
  )
);

    if (paidAmount > 0) {
      dispatch(
        addPaymentMade({
          id: Date.now() + 1,

          paymentNo: `PM-${String(
            paymentsMade.length + 1
          ).padStart(3, "0")}`,

          vendor: payload.vendor,

          billNo: payload.billNo,

          amount: paidAmount,

          mode: payload.paymentMode || "Cash",

          paymentMode: payload.paymentMode || "Cash",

          date: payload.billDate,

          status:
            paidAmount >= total
              ? "Paid"
              : "Partial",

          notes: `Auto payment from bill ${payload.billNo}`,
        })
      );
    }
  }

  resetForm();
};

  const handleEdit = (bill) => {
    setForm({
      ...bill,
      items: bill.items?.length ? bill.items : emptyForm.items,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this bill?");
    if (!ok) return;

    dispatch(deleteBill(id));
  };

  const exportCSV = () => {
    const headers = [
      "Bill No",
      "Vendor",
      "Vendor Bill No",
      "Bill Date",
      "Due Date",
      "Amount",
      "Status",
    ];

    const rows = filteredBills.map((bill) => [
      bill.billNo,
      bill.vendor,
      bill.vendorBillNo,
      bill.billDate,
      bill.dueDate,
      calculateTotal(bill.items),
      bill.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "purchase-bills.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

 const formSubtotal = calculateSubtotal(form.items);

const formGST = calculateGST(form.items);

const grossTotal = formSubtotal + formGST;

const roundedTotal = Math.round(grossTotal);

const roundOff = Number(
  (roundedTotal - grossTotal).toFixed(2)
);

const formTotal = roundedTotal;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Bills</h1>
          <p className="mt-2 text-slate-300">
            Manage purchase bills, GST input credit and vendor payable.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              ...emptyForm,
              billNo: generateBillNo(),
            });
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Create Bill
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Bill Value" value={`₹${totalBillValue}`} />
        <StatCard title="Paid Bills" value={paidCount} />
        <StatCard title="Unpaid Bills" value={unpaidCount} />
        <StatCard title="Partial Bills" value={partialCount} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill, vendor..."
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
          Bill List
        </h2>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="grid gap-4 md:hidden">
        {filteredBills.map((bill) => (
          <div
            key={bill.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-lg font-black">{bill.billNo}</h3>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {bill.vendor}
                </p>
              </div>

              <StatusBadge status={bill.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileInfo
                label="Vendor Bill"
                value={bill.vendorBillNo || "-"}
              />

              <MobileInfo
                label="Amount"
                value={`₹${calculateTotal(bill.items)}`}
                strong
              />

              <MobileInfo label="Bill Date" value={bill.billDate} />

              <MobileInfo label="Due Date" value={bill.dueDate || "-"} />
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
              <IconButton color="blue" onClick={() => setViewBill(bill)}>
                <Eye size={16} />
              </IconButton>

              <IconButton color="yellow" onClick={() => handleEdit(bill)}>
                <Pencil size={16} />
              </IconButton>

              {/* <IconButton color="red" onClick={() => handleDelete(bill.id)}>
                <Trash2 size={16} />
              </IconButton> */}
            </div>
          </div>
        ))}

        {filteredBills.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
            No bills found
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[var(--surface-soft)]">
            <tr>
              <Th>Bill No</Th>
              <Th>Vendor</Th>
              <Th>Vendor Bill</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Paid</Th>
<Th>Balance</Th>
              <Th>Bill Date</Th>
              <Th>Due Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredBills.map((bill) => (
              <tr
                key={bill.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <Td bold>{bill.billNo}</Td>
                <Td>{bill.vendor}</Td>
                <Td>{bill.vendorBillNo || "-"}</Td>
                <Td bold>₹{calculateTotal(bill.items)}</Td>

                <Td>
                  <StatusBadge status={bill.status} />
                </Td>

                <Td bold>
  ₹{Number(bill.paidAmount || 0).toFixed(2)}
</Td>

<Td bold>
  ₹{Number(
    bill.balanceAmount || bill.amount || 0
  ).toFixed(2)}
</Td>

                <Td>{bill.billDate}</Td>

                <Td>{bill.dueDate || "-"}</Td>

                <Td>
                  <div className="flex items-center gap-2">
                    <IconButton color="blue" onClick={() => setViewBill(bill)}>
                      <Eye size={16} />
                    </IconButton>

                    <IconButton color="yellow" onClick={() => handleEdit(bill)}>
                      <Pencil size={16} />
                    </IconButton>

                    {/* <IconButton
                      color="red"
                      onClick={() => handleDelete(bill.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton> */}
                  </div>
                </Td>
              </tr>
            ))}

            {filteredBills.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <BillModal
          title={editMode ? "Edit Purchase Bill" : "Create Purchase Bill"}
          form={form}
          vendors={vendors}
          products={products}
           activeWarehouses={activeWarehouses}
          dispatch={dispatch}
          onVendorSelect={handleVendorSelect}
          clearVendor={clearVendor}
          onAddVendor={() => setShowVendorModal(true)}
          onProductSelect={handleProductSelect}
          onAddProduct={() => setShowProductModal(true)}
          itemInputRefs={itemInputRefs}
          handleChange={handleChange}
          handleItemChange={handleItemChange}
          addItemRow={addItemRow}
          removeItemRow={removeItemRow}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          subtotal={formSubtotal}
          gstAmount={formGST}
          roundOff={roundOff}
          total={formTotal}
          editMode={editMode}
        />
      )}

      {viewBill && (
        <ViewBillModal
          bill={viewBill}
          onClose={() => setViewBill(null)}
          calculateSubtotal={calculateSubtotal}
          calculateGST={calculateGST}
          calculateTotal={calculateTotal}
        />
      )}

      {showVendorModal && (
        <QuickAddVendorModal
          onClose={() => setShowVendorModal(false)}
          onSave={(vendorData) => {
            dispatch(addVendor(vendorData));
            handleVendorSelect(vendorData);
            setShowVendorModal(false);
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

function BillModal({
  title,
  form,
  vendors,
  products,
  activeWarehouses,
  dispatch,
  onVendorSelect,
  clearVendor,
  onAddVendor,
  onProductSelect,
  onAddProduct,
  itemInputRefs,
  handleChange,
  handleItemChange,
  addItemRow,
  removeItemRow,
  handleSubmit,
  resetForm,
  subtotal,
  gstAmount,
  roundOff,
  total,
  editMode,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Record vendor purchase bill with item, tax and payable details.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-black">Bill Details</h3>

            <div className="grid gap-4 md:grid-cols-4">
              <Input
                label="Bill No"
                name="billNo"
                value={form.billNo}
                onChange={handleChange}
                required
              />

              <div>
                <label className="mb-1 block text-sm font-bold">Vendor</label>

                <VendorSearchBox
                  vendors={vendors}
                  selectedVendor={form.vendor}
                  onSelect={onVendorSelect}
                  onClear={clearVendor}
                  onAddVendor={onAddVendor}
                  editMode={editMode}
                />
              </div>

              <Input
                label="Vendor Bill No"
                name="vendorBillNo"
                value={form.vendorBillNo}
                onChange={handleChange}
              />

              <Input
                label="Bill Date"
                name="billDate"
                type="date"
                value={form.billDate}
                onChange={handleChange}
                required
              />

              <Input
                label="Due Date"
                name="dueDate"
                type="date"
                min={form.billDate}
                value={form.dueDate}
                onChange={handleChange}
              />

              {/* <div>
                <label className="mb-1 block text-sm font-bold">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div> */}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Bill Items</h3>

             
            </div>

         <div className="relative w-full overflow-visible rounded-2xl border border-[var(--border)] bg-white">
              <table className="w-full border-separate border-spacing-y-2 text-sm">
                <thead className="bg-[var(--surface-soft)]">
                  <tr>
                    <Th>Product / Service</Th>
                    <Th>Warehouse</Th>
                    <Th>Qty</Th>
                    <Th>Rate</Th>
                    <Th>Discount</Th>
                    <Th>GST %</Th>
                    <Th>Amount</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>

                <tbody>
                  {form.items.map((item, index) => {
                   const gross =
  Number(item.qty || 0) * Number(item.rate || 0);

const discount = Number(item.discount || 0);

const taxable = Math.max(gross - discount, 0);

const gstAmount =
  (taxable * Number(item.gst || 0)) / 100;

const amount = taxable + gstAmount;

                    return (
                      <tr
                        key={index}
                        className="border-t border-[var(--border)]"
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
                              onProductSelect(index, product)
                            }
                            onAddProduct={onAddProduct}
                          />
                        </Td>

                        <Td>
  <select
    value={item.warehouseId || ""}
    onChange={(e) => {
      const wh = activeWarehouses.find(
        (w) => String(w.id) === String(e.target.value)
      );

      handleItemChange(index, "warehouseId", wh?.id || "");
      handleItemChange(index, "warehouseName", wh?.name || wh?.warehouseName || "");
    }}
    className="w-[180px] rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-2.5 text-sm outline-none"
    required
  >
    <option value="">Select Warehouse</option>
    {activeWarehouses.map((wh) => (
      <option key={wh.id} value={wh.id}>
        {wh.name || wh.warehouseName}
      </option>
    ))}
  </select>
</Td>

                        <Td>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                            className="w-[90px] rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 outline-none"
                          />
                        </Td>

                        <Td>
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(index, "rate", e.target.value)
                            }
                            className="w-[110px] rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 outline-none"
                          />
                        </Td>

                        <Td>
  <input
    type="number"
    min="0"
    value={item.discount || 0}
    onChange={(e) =>
      handleItemChange(index, "discount", e.target.value)
    }
    className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
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
                            className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td bold>₹{amount}</Td>

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

          <div className="ml-auto max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
            <SummaryRow label="GST Input" value={`₹${gstAmount}`} />
            <SummaryRow
  label="Round Off"
  value={`₹${roundOff > 0 ? "+" : ""}${roundOff}`}
/>

            <div className="border-t border-[var(--border)] pt-4">
              <SummaryRow label="Grand Total" value={`₹${total}`} large />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>
            <textarea
              rows="4"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Bill notes..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
          </div>

          <div>
  <h3 className="mb-4 text-lg font-black">
    Payment Details
  </h3>

  <div className="grid gap-4 md:grid-cols-4">

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
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      >
        <option value="">
          Select Payment Mode
        </option>

        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Bank Transfer">
          Bank Transfer
        </option>
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
    />

    <Input
      label="Due Amount"
      value={Math.max(
        Number(total || 0) -
          Number(form.paidAmount || 0),
        0
      )}
      readOnly
    />
  </div>
</div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
            >
              {editMode ? "Update Bill" : "Save Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewBillModal({
  bill,
  onClose,
  calculateSubtotal,
  calculateGST,
  calculateTotal,
}) {
  const subtotal = calculateSubtotal(bill.items);
  const gst = calculateGST(bill.items);
  const total = calculateTotal(bill.items);

  return (
   <div className="fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-slate-50">
  <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">   
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Bill Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete purchase bill and payable information.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Info label="Bill No" value={bill.billNo} />
          <Info label="Vendor" value={bill.vendor} />
          <Info label="Vendor Bill No" value={bill.vendorBillNo} />
          <Info label="Bill Date" value={bill.billDate} />
          <Info label="Due Date" value={bill.dueDate} />
          <Info label="Status" value={bill.status} />
          <Info label="Subtotal" value={`₹${subtotal}`} />
          <Info label="GST Input" value={`₹${gst}`} />
          <Info label="Grand Total" value={`₹${total}`} />
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[var(--surface-soft)]">
              <tr>
                <Th>Product / Service</Th>
                <Th>Qty</Th>
                <Th>Rate</Th>
                <Th>Discount</Th>
                <Th>GST %</Th>
                <Th>Amount</Th>
              </tr>
            </thead>

            <tbody>
              {bill.items?.map((item, index) => {
                const amount = Number(item.qty || 0) * Number(item.rate || 0);

                return (
                  <tr key={index} className="border-t border-[var(--border)]">
                    <Td>{item.product}</Td>
                    <Td>{item.qty}</Td>
                    <Td>₹{item.rate}</Td>
                    <Td>{item.gst}%</Td>
                    <Td bold>₹{taxable.toFixed(2)}</Td>
<Td bold>₹{amount.toFixed(2)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {bill.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{bill.notes}</p>
          </div>
        )}

        {/* <Section title="Payment Details">
  <div>
    <label className="mb-1 block text-sm font-bold">Payment Status</label>
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
    <label className="mb-1 block text-sm font-bold">Payment Mode</label>
    <select
      name="paymentMode"
      value={form.paymentMode}
      onChange={handleChange}
      disabled={form.status === "Unpaid"}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      <option value="">
        {form.status === "Unpaid" ? "No Payment" : "Select Payment Mode"}
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
    max={total}
  />

  <Input
    label="Due Amount"
    value={Math.max(Number(total || 0) - Number(form.paidAmount || 0), 0)}
    readOnly
  />
</Section> */}
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        min={min}
        placeholder={label}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
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

function EffectCard({ title, text }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-green-100 text-green-700",
    Unpaid: "bg-red-100 text-red-700",
    Partial: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Unpaid
      }`}
    >
      {status}
    </span>
  );
}

function IconButton({ children, onClick, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <button onClick={onClick} className={`rounded-lg p-2 ${styles[color]}`}>
      {children}
    </button>
  );
}

function SummaryRow({ label, value, large }) {
  return (
    <div
      className={`flex items-center justify-between ${
        large ? "text-xl font-black" : "font-bold"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-left text-sm font-black uppercase">
      {children}
    </th>
  );
}

function Td({ children, bold }) {
  return <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>{children}</td>;
}
function MobileInfo({ label, value, strong }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>

      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function VendorSearchBox({
  vendors = [],
  selectedVendor,
  onSelect,
  onClear,
  onAddVendor,
  editMode,
}) {
  const [query, setQuery] = useState(selectedVendor || "");
  const [open, setOpen] = useState(false);

  const filteredVendors = vendors.filter((vendor) => {
    const text = `${vendor.name || ""} ${vendor.companyName || ""} ${
      vendor.phone || ""
    } ${vendor.gstin || ""}`.toLowerCase();

    return query.length >= 1 && text.includes(query.toLowerCase());
  });

  const handleSelect = (vendor) => {
    setQuery(`${vendor.name} - ${vendor.phone || ""}`);
    setOpen(false);
    onSelect(vendor);
  };

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-bold"></label>

      <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Vendor name / phone / GSTIN"
          required
          className="w-full bg-transparent py-3 outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              onClear();
            }}
            className="text-sm font-black text-red-500"
          >
            ×
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 top-[74px] z-[99999] max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
          {filteredVendors.length > 0
            ? filteredVendors.map((vendor) => (
                <button
                  key={vendor.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(vendor);
                  }}
                  className="w-full border-b border-slate-200 px-4 py-3 text-left hover:bg-slate-100"
                >
                  <p className="font-black text-slate-900">{vendor.name}</p>
                  <p className="text-sm text-slate-500">
                    {vendor.phone || "-"} | GSTIN: {vendor.gstin || "-"}
                  </p>
                </button>
              ))
            : !editMode && (
                <div className="space-y-3 px-4 py-4">
                  <p className="text-sm text-slate-500">No vendor found</p>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onAddVendor();
                    }}
                    className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white"
                  >
                    + Add New Vendor
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
    const productName =
      product.name ||
      product.productName ||
      product.itemName ||
      product.title ||
      "";

    const sku = product.sku || product.SKU || "";
    const hsn = product.hsn || product.hsnCode || "";
    const category = product.category || "";

    const text = `${productName} ${sku} ${hsn} ${category}`.toLowerCase();

    return query.length >= 1 && text.includes(query);
  });

  return (
    <div className="relative w-[240px] overflow-visible">
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
        <div className="absolute left-0 top-[54px] z-[99999] max-h-72 w-[380px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white shadow-2xl">         {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(product);
                  setOpen(false);
                }}
                className="w-full border-b border-slate-200 px-4 py-3 text-left hover:bg-slate-100"
              >
                <p className="font-black text-slate-900">
                  {product.name ||
                    product.productName ||
                    product.itemName ||
                    product.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  SKU: {product.sku || "-"} | Purchase: ₹
                  {product.purchasePrice ||
                    product.costPrice ||
                    product.sellingPrice ||
                    product.price ||
                    0}
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
                  setOpen(false);
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
