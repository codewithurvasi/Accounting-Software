import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle,
} from "lucide-react";

const defaultSettings = {
  gstEnabled: true,
  gstin: "23ABCDE1234F1Z5",
  state: "Madhya Pradesh",
  stateCode: "23",
  taxType: "Regular GST",
  invoiceTaxMode: "Exclusive",
  placeOfSupply: "Auto Detect",
  compositionEnabled: false,
  reverseChargeEnabled: false,
};

const defaultRates = [
  { id: 1, name: "GST 0%", rate: 0, type: "GST", status: "Active" },
  { id: 2, name: "GST 5%", rate: 5, type: "GST", status: "Active" },
  { id: 3, name: "GST 12%", rate: 12, type: "GST", status: "Active" },
  { id: 4, name: "GST 18%", rate: 18, type: "GST", status: "Active" },
  { id: 5, name: "GST 28%", rate: 28, type: "GST", status: "Active" },
];

const emptyRate = {
  id: null,
  name: "",
  rate: "",
  type: "GST",
  status: "Active",
};

export default function TaxesGst() {
  const [settings, setSettings] = useState(defaultSettings);
  const [taxRates, setTaxRates] = useState(defaultRates);
  const [form, setForm] = useState(emptyRate);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (e) => {
    setSaved(false);

    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const toggleSetting = (key) => {
    setSaved(false);

    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleRateChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem("taxSettings", JSON.stringify(settings));
    localStorage.setItem("taxRates", JSON.stringify(taxRates));
    setSaved(true);
  };

  const resetForm = () => {
    setForm(emptyRate);
    setEditMode(false);
    setShowModal(false);
  };

  const handleRateSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
      rate: Number(form.rate || 0),
    };

    if (editMode) {
      setTaxRates((prev) =>
        prev.map((tax) => (tax.id === payload.id ? payload : tax))
      );
    } else {
      setTaxRates((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (tax) => {
    setForm(tax);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this tax rate?");
    if (!ok) return;

    setTaxRates((prev) => prev.filter((tax) => tax.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Taxes / GST</h1>
        <p className="mt-2 text-slate-300">
          Configure GST settings, tax rates and invoice tax preferences.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-700">
          <CheckCircle size={20} />
          GST settings saved successfully.
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div>
            <h2 className="text-xl font-black">GST Configuration</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Enable GST calculation for sales invoices and purchase bills.
            </p>
          </div>

          <button
            onClick={() => toggleSetting("gstEnabled")}
            type="button"
            className={`h-8 w-14 rounded-full p-1 transition-all ${
              settings.gstEnabled ? "bg-[var(--primary)]" : "bg-slate-300"
            }`}
          >
            <div
              className={`h-6 w-6 rounded-full bg-white transition-all ${
                settings.gstEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <Input
            label="GSTIN"
            name="gstin"
            value={settings.gstin}
            onChange={handleSettingChange}
          />

          <Input
            label="State"
            name="state"
            value={settings.state}
            onChange={handleSettingChange}
          />

          <Input
            label="State Code"
            name="stateCode"
            value={settings.stateCode}
            onChange={handleSettingChange}
          />

          <Select
            label="Tax Type"
            name="taxType"
            value={settings.taxType}
            onChange={handleSettingChange}
            options={["Regular GST", "Composition Scheme", "Non-GST"]}
          />

          <Select
            label="Invoice Tax Mode"
            name="invoiceTaxMode"
            value={settings.invoiceTaxMode}
            onChange={handleSettingChange}
            options={["Exclusive", "Inclusive"]}
          />

          <Select
            label="Place of Supply"
            name="placeOfSupply"
            value={settings.placeOfSupply}
            onChange={handleSettingChange}
            options={["Auto Detect", "Same State", "Other State"]}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ToggleCard
            title="Composition Scheme"
            text="For businesses registered under composition GST scheme."
            active={settings.compositionEnabled}
            onClick={() => toggleSetting("compositionEnabled")}
          />

          <ToggleCard
            title="Reverse Charge"
            text="Used when buyer has to pay GST instead of supplier."
            active={settings.reverseChargeEnabled}
            onClick={() => toggleSetting("reverseChargeEnabled")}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
          >
            <Save size={18} />
            Save GST Settings
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Tax Rates</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              These rates will be used in invoices, bills and GST reports.
            </p>
          </div>

          <button
            onClick={() => {
              setForm(emptyRate);
              setEditMode(false);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
          >
            <Plus size={18} />
            Add Tax Rate
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
              <tr>
                <Th>Tax Name</Th>
                <Th>Rate</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {taxRates.map((tax) => (
                <tr
                  key={tax.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <Td bold>{tax.name}</Td>
                  <Td>{tax.rate}%</Td>
                  <Td>{tax.type}</Td>
                  <Td>
                    <StatusBadge status={tax.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tax)}
                        className="rounded-lg bg-yellow-100 p-2 text-yellow-700"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(tax.id)}
                        className="rounded-lg bg-red-100 p-2 text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      

      {showModal && (
        <TaxRateModal
          title={editMode ? "Edit Tax Rate" : "Add Tax Rate"}
          form={form}
          handleChange={handleRateChange}
          handleSubmit={handleRateSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}
    </div>
  );
}

function TaxRateModal({
  title,
  form,
  handleChange,
  handleSubmit,
  resetForm,
  editMode,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Configure tax rate for invoices and bills.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tax Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Rate %"
              name="rate"
              type="number"
              value={form.rate}
              onChange={handleChange}
              required
            />

            <Select
              label="Tax Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={["GST", "IGST", "CGST", "SGST"]}
            />

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={["Active", "Inactive"]}
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
              {editMode ? "Update Tax Rate" : "Save Tax Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleCard({ title, text, active, onClick }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
      </div>

      <button
        onClick={onClick}
        type="button"
        className={`h-8 w-14 rounded-full p-1 transition-all ${
          active ? "bg-[var(--primary)]" : "bg-slate-300"
        }`}
      >
        <div
          className={`h-6 w-6 rounded-full bg-white transition-all ${
            active ? "translate-x-6" : ""
          }`}
        />
      </button>
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
        type={type}
        value={value}
        required={required}
        onChange={onChange}
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
      {status}
    </span>
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
  return (
    <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}