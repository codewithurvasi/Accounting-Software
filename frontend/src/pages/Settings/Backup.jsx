import { useEffect, useState } from "react";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Clock3,
  HardDrive,
  CheckCircle2,
} from "lucide-react";

export default function Backup() {
  const [message, setMessage] = useState("");
  const [backups, setBackups] = useState([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [restoreFile, setRestoreFile] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("backupHistory");

    if (stored) {
      setBackups(JSON.parse(stored));
    } else {
      const defaultBackups = [
        {
          id: 1,
          file: "backup-webix-acc-11-may-2026.zip",
          date: "11 May 2026",
          time: "10:30 AM",
          size: "24 MB",
          type: "Automatic",
          status: "Completed",
        },
        {
          id: 2,
          file: "backup-webix-acc-10-may-2026.zip",
          date: "10 May 2026",
          time: "08:15 PM",
          size: "22 MB",
          type: "Manual",
          status: "Completed",
        },
      ];

      setBackups(defaultBackups);
      localStorage.setItem(
        "backupHistory",
        JSON.stringify(defaultBackups)
      );
    }
  }, []);

  const saveBackups = (updatedBackups) => {
    setBackups(updatedBackups);

    localStorage.setItem(
      "backupHistory",
      JSON.stringify(updatedBackups)
    );
  };

  const createBackup = () => {
    const now = new Date();

    const backup = {
      id: Date.now(),
      file: `backup-webix-${Date.now()}.zip`,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      size: `${Math.floor(Math.random() * 15) + 20} MB`,
      type: "Manual",
      status: "Completed",
    };

    const updated = [backup, ...backups];

    saveBackups(updated);

    setMessage("Backup created successfully.");
  };

  const handleDownload = (fileName) => {
    const data = {
      companyProfile:
        JSON.parse(localStorage.getItem("companyProfile")) || {},
      invoiceSettings:
        JSON.parse(localStorage.getItem("invoiceSettings")) || {},
      taxSettings:
        JSON.parse(localStorage.getItem("taxSettings")) || {},
      usersRoles:
        JSON.parse(localStorage.getItem("usersRoles")) || [],
      customers:
        JSON.parse(localStorage.getItem("customers")) || [],
      invoices:
        JSON.parse(localStorage.getItem("invoices")) || [],
      vendors:
        JSON.parse(localStorage.getItem("vendors")) || [],
      products:
        JSON.parse(localStorage.getItem("products")) || [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(".zip", ".json");

    a.click();

    URL.revokeObjectURL(url);

    setMessage("Backup downloaded successfully.");
  };

  const handleRestore = () => {
    if (!restoreFile) {
      setMessage("Please select backup file first.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        Object.keys(data).forEach((key) => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });

        setMessage("Backup restored successfully.");
      } catch (error) {
        setMessage("Invalid backup file.");
      }
    };

    reader.readAsText(restoreFile);
  };

  const deleteBackup = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this backup?"
    );

    if (!confirmDelete) return;

    const updated = backups.filter((backup) => backup.id !== id);

    saveBackups(updated);

    setMessage("Backup deleted successfully.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="flex items-center gap-3 text-3xl font-black">
          <Database size={30} />
          Backup & Restore
        </h1>

        <p className="mt-2 text-slate-300">
          Manage system backups, restore company data and configure automatic backups.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-bold text-green-700">
          <CheckCircle2 size={20} />
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          title="Total Backups"
          value={backups.length}
          icon={<Database size={22} />}
        />

        <StatCard
          title="Auto Backup"
          value={autoBackup ? "Enabled" : "Disabled"}
          icon={<ShieldCheck size={22} />}
        />

        <StatCard
          title="Backup Frequency"
          value={backupFrequency}
          icon={<Clock3 size={22} />}
        />

        <StatCard
          title="Storage Used"
          value="46 MB"
          icon={<HardDrive size={22} />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">
                Create Backup
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Generate secure backup of all accounting data.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <Database size={24} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <div>
                <h3 className="font-bold">
                  Automatic Backup
                </h3>

                <p className="text-sm text-[var(--muted)]">
                  Enable scheduled backups.
                </p>
              </div>

              <button
                onClick={() => setAutoBackup(!autoBackup)}
                className={`h-8 w-14 rounded-full p-1 transition-all ${
                  autoBackup
                    ? "bg-[var(--primary)]"
                    : "bg-slate-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition-all ${
                    autoBackup ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">
                Backup Frequency
              </label>

              <select
                value={backupFrequency}
                onChange={(e) =>
                  setBackupFrequency(e.target.value)
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <button
              onClick={createBackup}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              <Database size={18} />
              Create Backup
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">
                Restore Backup
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Restore previous accounting backup file.
              </p>
            </div>

            <div className="rounded-2xl bg-green-100 p-3 text-green-700">
              <RotateCcw size={24} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) =>
                setRestoreFile(e.target.files[0])
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"
            />

            <button
              onClick={handleRestore}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-black text-white"
            >
              <Upload size={18} />
              Restore Backup
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-xl font-black">
            Backup History
          </h2>
        </div>

        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>File Name</Th>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Size</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {backups.map((backup) => (
              <tr
                key={backup.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <Td bold>{backup.file}</Td>
                <Td>{backup.date}</Td>
                <Td>{backup.time}</Td>
                <Td>{backup.size}</Td>

                <Td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      backup.type === "Automatic"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {backup.type}
                  </span>
                </Td>

                <Td>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    {backup.status}
                  </span>
                </Td>

                <Td>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDownload(backup.file)
                      }
                      className="rounded-lg bg-blue-100 p-2 text-blue-700"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() =>
                        deleteBackup(backup.id)
                      }
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
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--muted)]">
          {title}
        </p>

        <div className="text-[var(--primary)]">
          {icon}
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-black">
        {value}
      </h2>
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
  return (
    <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}