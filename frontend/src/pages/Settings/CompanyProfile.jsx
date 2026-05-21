import { useEffect, useState } from "react";
import {
  Building2,
  Save,
  Upload,
  RotateCcw,
  CheckCircle,
  Pencil,
  X,
} from "lucide-react";

const defaultProfile = {
  companyName: "Webix Infotech",
  legalName: "Webix Infotech Private Limited",
  gstin: "23ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  email: "info@webixinfotech.com",
  phone: "+91 98765 43210",
  website: "www.webixinfotech.com",
  state: "Madhya Pradesh",
  stateCode: "23",
  city: "Bhopal",
  pincode: "462011",
  address: "Webix Infotech, MP Nagar, Bhopal, Madhya Pradesh",
  financialYear: "2026-27",
  baseCurrency: "INR",
  invoicePrefix: "INV",
  billPrefix: "BILL",
  bankName: "HDFC Bank",
  accountName: "Webix Infotech Pvt Ltd",
  accountNumber: "123456789012",
  ifsc: "HDFC0001234",
  branch: "MP Nagar, Bhopal",
  terms:
    "Goods once sold will not be taken back. Payment due as per invoice terms.",
  logo: "",
};

export default function CompanyProfile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("companyProfile");

    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const handleChange = (e) => {
    setSaved(false);

    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile({
        ...profile,
        logo: reader.result,
      });

      setSaved(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();

    localStorage.setItem("companyProfile", JSON.stringify(profile));

    setSaved(true);
    setEditMode(false);
  };

  const handleReset = () => {
    setProfile(defaultProfile);
    localStorage.setItem("companyProfile", JSON.stringify(defaultProfile));
    setSaved(false);
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <Building2 size={30} />
            Company Profile
          </h1>

          <p className="mt-2 text-slate-300">
            Manage company details used on invoices, bills, reports and GST documents.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/20"
          >
            <Pencil size={18} />
            Update Details
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/20"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-700">
          <CheckCircle size={20} />
          Company profile saved successfully.
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
              {profile.logo ? (
                <img
                  src={profile.logo}
                  alt="Company Logo"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <Building2 className="text-[var(--muted)]" size={36} />
              )}
            </div>

            <div>
              <h2 className="text-xl font-black">{profile.companyName}</h2>
              <p className="text-sm text-[var(--muted)]">{profile.email}</p>
              <p className="text-sm text-[var(--muted)]">{profile.phone}</p>
            </div>
          </div>

          {editMode && (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--sidebar)] px-5 py-3 font-bold text-white">
              <Upload size={18} />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <Section title="Basic Company Details">
          <Input label="Company Name" name="companyName" value={profile.companyName} onChange={handleChange} disabled={!editMode} required />
          <Input label="Legal Name" name="legalName" value={profile.legalName} onChange={handleChange} disabled={!editMode} />
          <Input label="Email" name="email" value={profile.email} onChange={handleChange} disabled={!editMode} required />
          <Input label="Phone" name="phone" value={profile.phone} onChange={handleChange} disabled={!editMode} required />
          <Input label="Website" name="website" value={profile.website} onChange={handleChange} disabled={!editMode} />
        </Section>

        <Section title="GST & Registration Details">
          <Input label="GSTIN" name="gstin" value={profile.gstin} onChange={handleChange} disabled={!editMode} />
          <Input label="PAN" name="pan" value={profile.pan} onChange={handleChange} disabled={!editMode} />
          <Input label="State" name="state" value={profile.state} onChange={handleChange} disabled={!editMode} />
          <Input label="State Code" name="stateCode" value={profile.stateCode} onChange={handleChange} disabled={!editMode} />
        </Section>

        <Section title="Address Details">
          <Input label="City" name="city" value={profile.city} onChange={handleChange} disabled={!editMode} />
          <Input label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editMode} />
        </Section>

        <div>
          <label className="mb-2 block text-sm font-bold">Address</label>
          <textarea
            rows="4"
            name="address"
            value={profile.address}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:opacity-70"
          />
        </div>

        <Section title="Invoice & Accounting Settings">
          <Input label="Financial Year" name="financialYear" value={profile.financialYear} onChange={handleChange} disabled={!editMode} />
          <Input label="Base Currency" name="baseCurrency" value={profile.baseCurrency} onChange={handleChange} disabled={!editMode} />
          <Input label="Invoice Prefix" name="invoicePrefix" value={profile.invoicePrefix} onChange={handleChange} disabled={!editMode} />
          <Input label="Bill Prefix" name="billPrefix" value={profile.billPrefix} onChange={handleChange} disabled={!editMode} />
        </Section>

        <Section title="Bank Details">
          <Input label="Bank Name" name="bankName" value={profile.bankName} onChange={handleChange} disabled={!editMode} />
          <Input label="Account Name" name="accountName" value={profile.accountName} onChange={handleChange} disabled={!editMode} />
          <Input label="Account Number" name="accountNumber" value={profile.accountNumber} onChange={handleChange} disabled={!editMode} />
          <Input label="IFSC" name="ifsc" value={profile.ifsc} onChange={handleChange} disabled={!editMode} />
          <Input label="Branch" name="branch" value={profile.branch} onChange={handleChange} disabled={!editMode} />
        </Section>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Invoice Terms & Conditions
          </label>

          <textarea
            rows="4"
            name="terms"
            value={profile.terms}
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
              Save Company Details
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
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:opacity-70"
      />
    </div>
  );
}