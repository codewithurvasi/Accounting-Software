import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo } from "react";
import { addVendor, updateVendor, deleteVendor } from "../../redux/vendorSlice";
import {
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  Download,
} from "lucide-react";

const emptyForm = {
  id: null,
  name: "",
  companyName: "",
  email: "",
  phone: "",
  gstin: "",
  pan: "",
  billingAddress: "",
  city: "",
  state: "",
  pincode: "",
  openingPayable: "",
  paymentTerms: "Due on Receipt",
  status: "Active",
  notes: "",
};

export default function Vendors() {
const dispatch = useDispatch();
const vendors = useSelector((state) => state.vendors?.vendors || []);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewVendor, setViewVendor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const text = `${vendor.name} ${vendor.companyName} ${vendor.email} ${vendor.phone} ${vendor.gstin}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [vendors, search]);

  const totalPayable = filteredVendors.reduce(
    (sum, vendor) => sum + Number(vendor.openingPayable || 0),
    0
  );

  const activeVendors = filteredVendors.filter(
    (vendor) => vendor.status === "Active"
  ).length;

  const resetForm = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
    ...form,
    id: editMode ? form.id : Date.now(),
    openingPayable: Number(form.openingPayable || 0),
  };

  if (editMode) {
    dispatch(updateVendor(payload));
  } else {
    dispatch(addVendor(payload));
  }

  resetForm();
};

  const handleEdit = (vendor) => {
    setForm(vendor);
    setEditMode(true);
    setShowModal(true);
  };

 const handleDelete = (id) => {
  const ok = window.confirm("Are you sure you want to delete this vendor?");
  if (!ok) return;

  dispatch(deleteVendor(id));
};

  const exportCSV = () => {
    const headers = [
      "Vendor Name",
      "Company",
      "Email",
      "Phone",
      "GSTIN",
      "PAN",
      "City",
      "State",
      "Opening Payable",
      "Payment Terms",
      "Status",
    ];

    const rows = filteredVendors.map((vendor) => [
      vendor.name,
      vendor.companyName,
      vendor.email,
      vendor.phone,
      vendor.gstin,
      vendor.pan,
      vendor.city,
      vendor.state,
      vendor.openingPayable,
      vendor.paymentTerms,
      vendor.status,
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
    link.download = "vendors.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Vendors</h1>
          <p className="mt-2 text-slate-300">
            Manage suppliers, GST details, payable balances and purchase accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total Vendors" value={filteredVendors.length} />
        <StatCard title="Active Vendors" value={activeVendors} />
        <StatCard title="Total Payable" value={`₹${totalPayable}`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor by name, company, GSTIN..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-3 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>
{/* MOBILE CARD VIEW */}
<div className="grid gap-4 md:hidden">
  {filteredVendors.map((vendor) => (
    <div
      key={vendor.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-lg font-black">
            {vendor.name}
          </h3>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {vendor.companyName || "-"}
          </p>
        </div>

        <StatusBadge status={vendor.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileInfo label="Email" value={vendor.email || "-"} />

        <MobileInfo label="Phone" value={vendor.phone || "-"} />

        <MobileInfo label="GSTIN" value={vendor.gstin || "-"} />

        <MobileInfo
          label="Payable"
          value={`₹${vendor.openingPayable || 0}`}
          strong
        />
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
        <IconButton
          color="blue"
          onClick={() => setViewVendor(vendor)}
        >
          <Eye size={16} />
        </IconButton>

        <IconButton
          color="yellow"
          onClick={() => handleEdit(vendor)}
        >
          <Pencil size={16} />
        </IconButton>

        <IconButton
          color="red"
          onClick={() => handleDelete(vendor.id)}
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  ))}

  {filteredVendors.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
      No vendors found
    </div>
  )}
</div>

{/* DESKTOP TABLE VIEW */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1100px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Name</Th>
        <Th>Company</Th>
        <Th>Email</Th>
        <Th>Phone</Th>
        <Th>GSTIN</Th>
        <Th>Payable</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredVendors.map((vendor) => (
        <tr
          key={vendor.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{vendor.name}</Td>
          <Td>{vendor.companyName || "-"}</Td>
          <Td>{vendor.email || "-"}</Td>
          <Td>{vendor.phone || "-"}</Td>
          <Td>{vendor.gstin || "-"}</Td>
          <Td bold>₹{vendor.openingPayable || 0}</Td>

          <Td>
            <StatusBadge status={vendor.status} />
          </Td>

          <Td>
            <div className="flex items-center gap-2">
              <IconButton
                color="blue"
                onClick={() => setViewVendor(vendor)}
              >
                <Eye size={16} />
              </IconButton>

              <IconButton
                color="yellow"
                onClick={() => handleEdit(vendor)}
              >
                <Pencil size={16} />
              </IconButton>

              <IconButton
                color="red"
                onClick={() => handleDelete(vendor.id)}
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          </Td>
        </tr>
      ))}

      {filteredVendors.length === 0 && (
        <tr>
          <td
            colSpan="8"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No vendors found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      

      {showModal && (
        <VendorModal
          title={editMode ? "Edit Vendor" : "Add New Vendor"}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}

      {viewVendor && (
        <ViewVendorModal vendor={viewVendor} onClose={() => setViewVendor(null)} />
      )}
    </div>
  );
}

function VendorModal({
  title,
  form,
  handleChange,
  handleSubmit,
  resetForm,
  editMode,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Enter supplier details for purchase, GST and accounting.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="">
            <Input
              label="Vendor Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </Section>

          <Section title="">
            <Input
              label="GSTIN"
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
            />

            <Input
              label="PAN"
              name="pan"
              value={form.pan}
              onChange={handleChange}
            />
          </Section>

          <Section title="">
            <Input
              label="Billing Address"
              name="billingAddress"
              value={form.billingAddress}
              onChange={handleChange}
            />

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
            />

            <Input
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
            />
          </Section>

          <Section title="">
            <Input
              label="Opening Payable"
              name="openingPayable"
              type="number"
              value={form.openingPayable}
              onChange={handleChange}
            />

            <Select
              label="Payment Terms"
              name="paymentTerms"
              value={form.paymentTerms}
              onChange={handleChange}
              options={[
                "Due on Receipt",
                "Net 7 Days",
                "Net 15 Days",
                "Net 30 Days",
                "Net 45 Days",
              ]}
            />

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={["Active", "Inactive"]}
            />
          </Section>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>
            <textarea
              rows="4"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Internal notes about vendor..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
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
              {editMode ? "Update Vendor" : "Save Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewVendorModal({ vendor, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Vendor Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete supplier profile and payable information.
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
          <Info label="Vendor Name" value={vendor.name} />
          <Info label="Company" value={vendor.companyName} />
          <Info label="Email" value={vendor.email} />
          <Info label="Phone" value={vendor.phone} />
          <Info label="GSTIN" value={vendor.gstin} />
          <Info label="PAN" value={vendor.pan} />
          <Info label="Address" value={vendor.billingAddress} />
          <Info label="City" value={vendor.city} />
          <Info label="State" value={vendor.state} />
          <Info label="Pincode" value={vendor.pincode} />
          <Info label="Opening Payable" value={`₹${vendor.openingPayable || 0}`} />
          <Info label="Payment Terms" value={vendor.paymentTerms} />
          <Info label="Status" value={vendor.status} />
        </div>

        {vendor.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{vendor.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-black">{title}</h3>
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
  required = false,
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
        placeholder={label}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Active
      }`}
    >
      {status || "Active"}
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
      <p className="text-xs font-bold uppercase text-[var(--muted)]">
        {label}
      </p>

      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}