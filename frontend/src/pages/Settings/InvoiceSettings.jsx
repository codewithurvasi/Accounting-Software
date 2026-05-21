import { useEffect, useState } from "react";
import { CheckCircle, FileText, Pencil, Save, X } from "lucide-react";

const defaultSettings = {
  prefix: "INV",
  nextNumber: "001",
  numberSeparator: "-",
  numberPadding: "3",
  financialYear: "2026-27",
  invoiceTitle: "TAX INVOICE",
  paymentTerms: "Due on Receipt",
  dueDays: "0",
  defaultGst: "18",
  taxMode: "Exclusive",
  showLogo: true,
  showGstin: true,
  showBankDetails: true,
  showSignature: true,
  autoRoundOff: true,
  footerNote: "Thank you for your business.",
  terms:
    "Goods once sold will not be taken back. Payment due as per invoice terms.",
};

export default function InvoiceSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("invoiceSettings");
    if (stored) setSettings(JSON.parse(stored));
  }, []);

  const handleChange = (e) => {
    setSaved(false);
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const toggleSetting = (key) => {
    setSaved(false);
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("invoiceSettings", JSON.stringify(settings));
    setSaved(true);
    setEditMode(false);
  };

  const previewNumber = `${settings.prefix}${settings.numberSeparator}${String(
    settings.nextNumber
  ).padStart(Number(settings.numberPadding || 3), "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <FileText size={30} />
            Invoice Settings
          </h1>

          <p className="mt-2 text-slate-300">
            Configure invoice numbering, tax defaults, payment terms and invoice layout.
          </p>
        </div>

        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/20"
          >
            <Pencil size={18} />
            Update Settings
          </button>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-700">
          <CheckCircle size={20} />
          Invoice settings saved successfully.
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
      >
        <Section title="Invoice Numbering">
          <Input
            label="Prefix"
            name="prefix"
            value={settings.prefix}
            onChange={handleChange}
            disabled={!editMode}
          />

          <Input
            label="Next Number"
            name="nextNumber"
            value={settings.nextNumber}
            onChange={handleChange}
            disabled={!editMode}
          />

          <Select
            label="Separator"
            name="numberSeparator"
            value={settings.numberSeparator}
            onChange={handleChange}
            disabled={!editMode}
            options={["-", "/", ""]}
          />

          <Select
            label="Number Padding"
            name="numberPadding"
            value={settings.numberPadding}
            onChange={handleChange}
            disabled={!editMode}
            options={["2", "3", "4", "5"]}
          />

          <Input
            label="Financial Year"
            name="financialYear"
            value={settings.financialYear}
            onChange={handleChange}
            disabled={!editMode}
          />

          <Input
            label="Invoice Title"
            name="invoiceTitle"
            value={settings.invoiceTitle}
            onChange={handleChange}
            disabled={!editMode}
          />
        </Section>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <p className="text-sm font-bold text-[var(--muted)]">
            Invoice Number Preview
          </p>
          <h3 className="mt-2 text-3xl font-black">{previewNumber}</h3>
        </div>

        <Section title="Payment & Tax Defaults">
          <Select
            label="Payment Terms"
            name="paymentTerms"
            value={settings.paymentTerms}
            onChange={handleChange}
            disabled={!editMode}
            options={[
              "Due on Receipt",
              "Net 7 Days",
              "Net 15 Days",
              "Net 30 Days",
              "Net 45 Days",
            ]}
          />

          <Input
            label="Due Days"
            name="dueDays"
            type="number"
            value={settings.dueDays}
            onChange={handleChange}
            disabled={!editMode}
          />

          <Select
            label="Default GST %"
            name="defaultGst"
            value={settings.defaultGst}
            onChange={handleChange}
            disabled={!editMode}
            options={["0", "5", "12", "18", "28"]}
          />

          <Select
            label="Tax Mode"
            name="taxMode"
            value={settings.taxMode}
            onChange={handleChange}
            disabled={!editMode}
            options={["Exclusive", "Inclusive"]}
          />
        </Section>

        <div>
          <h3 className="mb-3 text-lg font-black">Invoice Display Options</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleCard
              title="Show Company Logo"
              text="Display company logo on invoice."
              active={settings.showLogo}
              disabled={!editMode}
              onClick={() => toggleSetting("showLogo")}
            />

            <ToggleCard
              title="Show GSTIN"
              text="Display company GSTIN on invoice."
              active={settings.showGstin}
              disabled={!editMode}
              onClick={() => toggleSetting("showGstin")}
            />

            <ToggleCard
              title="Show Bank Details"
              text="Display bank details on invoice."
              active={settings.showBankDetails}
              disabled={!editMode}
              onClick={() => toggleSetting("showBankDetails")}
            />

            <ToggleCard
              title="Show Authorized Signature"
              text="Display signature section on invoice."
              active={settings.showSignature}
              disabled={!editMode}
              onClick={() => toggleSetting("showSignature")}
            />

            <ToggleCard
              title="Auto Round Off"
              text="Round off invoice totals automatically."
              active={settings.autoRoundOff}
              disabled={!editMode}
              onClick={() => toggleSetting("autoRoundOff")}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Invoice Footer Note
          </label>

          <textarea
            rows="3"
            name="footerNote"
            value={settings.footerNote}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:opacity-70"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Terms & Conditions
          </label>

          <textarea
            rows="4"
            name="terms"
            value={settings.terms}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:opacity-70"
          />
        </div>

       

        {editMode && (
          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white hover:bg-[var(--primary-dark)]"
            >
              <Save size={18} />
              Save Settings
            </button>
          </div>
        )}
      </form>
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
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:opacity-70"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <select
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:opacity-70"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "No Separator"}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleCard({ title, text, active, onClick, disabled }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`h-8 w-14 rounded-full p-1 transition-all disabled:opacity-60 ${
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