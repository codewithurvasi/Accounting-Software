import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../redux/customerSlice";
import { Plus, Search, X, Eye, Pencil, Trash2 } from "lucide-react";

const emptyForm = {
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
  openingBalance: "",
  balanceType: "Debit",
  creditLimit: "",
  paymentTerms: "Due on Receipt",
  notes: "",
};

export default function Customers() {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredCustomers = customers.filter((c) => {
    const text = `${c.name} ${c.companyName} ${c.email} ${c.phone} ${c.gstin}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditCustomer(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const existingCustomer = customers.find(
        (customer) =>
          customer.phone === value &&
          (!editCustomer || customer.id !== editCustomer.id)
      );

      if (existingCustomer) {
        setForm({
          ...emptyForm,
          ...existingCustomer,
          phone: value,
          openingBalance:
            existingCustomer.openingBalance || existingCustomer.balance || "",
          creditLimit: existingCustomer.creditLimit || "",
        });
        return;
      }
    }

    setForm({ ...form, [name]: value });
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setForm({
      ...emptyForm,
      ...customer,
      openingBalance: customer.openingBalance || customer.balance || "",
      creditLimit: customer.creditLimit || "",
    });
    setViewCustomer(null);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      dispatch(deleteCustomer(id));
      setViewCustomer(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const openingBalance = Number(form.openingBalance || 0);
const balance =
  form.balanceType === "Credit" ? -openingBalance : openingBalance;

const payload = {
  id: editCustomer ? editCustomer.id : Date.now(),
  ...form,
  name: form.name || `Customer ${form.phone}`,
  gstin: String(form.gstin || "").toUpperCase(),
  pan: String(form.pan || "").toUpperCase(),
  balance,
  openingBalance,
  creditLimit: Number(form.creditLimit || 0),
  status: form.status || "Active",
};

    if (editCustomer) {
      dispatch(updateCustomer(payload));
    } else {
      dispatch(addCustomer(payload));
    }

    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Customers</h1>
          <p className="mt-2 text-slate-300">
            Manage customer accounts, GST details and receivables.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <Search size={18} className="text-[var(--muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, phone, GSTIN..."
          className="w-full bg-transparent outline-none"
        />
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onDoubleClick={() => setViewCustomer(customer)}
            className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[var(--text)]">
                  {customer.name}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                  {customer.companyName || "-"}
                </p>
              </div>

             
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <MobileInfo label="Phone" value={customer.phone} />
              <MobileInfo label="Email" value={customer.email} />
              <MobileInfo label="GSTIN" value={customer.gstin || "-"} />
              <MobileInfo
                label="Balance"
                value={`₹${customer.balance || customer.openingBalance || 0}`}
                strong
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              
              <IconButton color="yellow" onClick={() => handleEdit(customer)}>
                <Pencil size={16} />
              </IconButton>

              <IconButton color="red" onClick={() => handleDelete(customer.id)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
            No customers found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Name</Th>
              <Th>Company</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>GSTIN</Th>
              <Th>Balance</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                onDoubleClick={() => setViewCustomer(customer)}
                className="cursor-pointer border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-soft)]"
              >
                <Td bold>{customer.name}</Td>
                <Td>{customer.companyName || "-"}</Td>
                <Td>{customer.email || "-"}</Td>
                <Td>{customer.phone}</Td>
                <Td>{customer.gstin || "-"}</Td>
                <Td bold>
  ₹{Math.abs(Number(customer.balance || 0)).toLocaleString("en-IN")}
  {Number(customer.balance || 0) >= 0 ? " Dr" : " Cr"}
</Td>
                
                <Td>
                  <div className="flex items-center gap-2">
                    {/* <IconButton
                      color="blue"
                      onClick={() => setViewCustomer(customer)}
                    >
                      <Eye size={16} />
                    </IconButton> */}

                    <IconButton
                      color="yellow"
                      onClick={() => handleEdit(customer)}
                    >
                      <Pencil size={16} />
                    </IconButton>

                    <IconButton
                      color="red"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[var(--text)]">
                  {editCustomer ? "Update Customer" : "Add New Customer"}
                </h2>
                
              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-xl border border-[var(--border)] p-2 hover:bg-[var(--surface-soft)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Section title="">
                <Input
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Customer Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
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
  label="Opening Balance"
  name="openingBalance"
  type="number"
  value={form.openingBalance}
  onChange={handleChange}
/>

<Select
  label="Balance Type"
  name="balanceType"
  value={form.balanceType}
  onChange={handleChange}
  options={["Debit", "Credit"]}
/>

<Input
  label="Credit Limit"
  name="creditLimit"
  type="number"
  value={form.creditLimit}
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

                {/* <Select
                  label="Balance Type"
                  name="balanceType"
                  value={form.balanceType}
                  onChange={handleChange}
                  options={["Debit", "Credit"]}
                />

                <Input
                  label="Credit Limit"
                  name="creditLimit"
                  type="number"
                  value={form.creditLimit}
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
                /> */}
              </Section>

              <Section title="">
                {/* <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={["Active", "Inactive"]}
                /> */}

                <div className="md:col-span-3">
                  <label className="mb-1 block text-sm font-bold text-[var(--text)]">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Internal notes about customer..."
                    rows="3"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </Section>

              <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold hover:bg-[var(--surface-soft)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white hover:bg-[var(--primary-dark)]"
                >
                  {editCustomer ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {/* {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[var(--text)]">
                  {viewCustomer.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {viewCustomer.companyName || "Customer Details"}
                </p>
              </div>

              <button
                onClick={() => setViewCustomer(null)}
                className="rounded-xl border border-[var(--border)] p-2 hover:bg-[var(--surface-soft)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <DetailCard label="Name" value={viewCustomer.name} />
              <DetailCard label="Company" value={viewCustomer.companyName} />
              <DetailCard label="Status" value={viewCustomer.status || "Active"} />

              <DetailCard label="Email" value={viewCustomer.email} />
              <DetailCard label="Phone" value={viewCustomer.phone} />
              <DetailCard label="GSTIN" value={viewCustomer.gstin} />

              <DetailCard label="PAN" value={viewCustomer.pan} />
              <DetailCard label="City" value={viewCustomer.city} />
              <DetailCard label="State" value={viewCustomer.state} />

              <DetailCard label="Pincode" value={viewCustomer.pincode} />
              <DetailCard
                label="Opening Balance"
                value={`₹${viewCustomer.openingBalance || viewCustomer.balance || 0}`}
              />
              <DetailCard label="Balance Type" value={viewCustomer.balanceType} />

              <DetailCard
                label="Credit Limit"
                value={`₹${viewCustomer.creditLimit || 0}`}
              />
              <DetailCard label="Payment Terms" value={viewCustomer.paymentTerms} />
              <DetailCard label="Notes" value={viewCustomer.notes} />
            </div>

            <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Billing Address
              </p>
              <p className="mt-1 font-bold text-[var(--text)]">
                {viewCustomer.billingAddress || "-"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-5">
              <button
                onClick={() => handleEdit(viewCustomer)}
                className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-black text-white"
              >
                <Pencil size={17} />
                Edit
              </button>

              <button
                onClick={() => handleDelete(viewCustomer.id)}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white"
              >
                <Trash2 size={17} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-black text-[var(--text)]">{title}</h3>
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
      <label className="mb-1 block text-sm font-bold text-[var(--text)]">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={label}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-[var(--text)]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none focus:border-[var(--primary)]"
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

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-sm font-black uppercase">{children}</th>
  );
}

function Td({ children, bold }) {
  return (
    <td className={`px-5 py-4 text-sm ${bold ? "font-black" : "font-medium"}`}>
      {children || "-"}
    </td>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

function IconButton({ children, color = "blue", onClick }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-xl p-2 ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function MobileInfo({ label, value, strong }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm text-[var(--text)] ${
          strong ? "font-black" : "font-bold"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 break-words font-black text-[var(--text)]">
        {value || "-"}
      </p>
    </div>
  );
}