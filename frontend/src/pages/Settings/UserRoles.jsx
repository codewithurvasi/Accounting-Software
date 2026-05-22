import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  X,
  Save,
  Eye,
} from "lucide-react";

const STORAGE_KEY = "usersRoles";

const roles = {
  Admin: [
    "Dashboard",
    "Customers",
    "Vendors",
    "Invoices",
    "Bills",
    "Payments",
    "Purchase",
    "Inventory",
    "Reports",
    "Settings",
  ],
  Accountant: [
    "Dashboard",
    "Customers",
    "Vendors",
    "Invoices",
    "Bills",
    "Payments",
    "Reports",
  ],
  Sales: ["Dashboard", "Customers", "Invoices", "Payments"],
  Inventory: ["Dashboard", "Inventory", "Purchase", "Reports"],
  Viewer: ["Dashboard", "Reports"],
};

const permissionOptions = [
  "Dashboard",
  "Expenses",

  "Customers",
  "Invoices",
  "Sales Return",
  "Payments Received",
  "Customer Statement",

  "Vendors",
  "Bills",
  "Purchase Return",
  "Vendor Statement",
  "Payments Made",

  "Journal Entries",
  "Ledger",

  "Inventory",
  "Stock Management",
  "Warehouses",
  "Stock Transfer",

  "Profit & Loss",
  "GST Reports",
  "Sales Report",
  "Purchase Report",

  "Company Profile",
  "Invoice Settings",
  "Users & Roles",
  "Backup",
];

const defaultUsers = [
  {
    id: 1,
    fullName: "Admin User",
    email: "admin@webix.com",
    phone: "9876543210",
    password: "",
    role: "Admin",
    department: "Management",
    status: "Active",
    permissions: roles.Admin,
  },
  {
    id: 2,
    fullName: "Account Manager",
    email: "accounts@webix.com",
    phone: "9876500000",
    password: "",
    role: "Accountant",
    department: "Accounts",
    status: "Active",
    permissions: roles.Accountant,
  },
];

const emptyForm = {
  id: null,
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "Viewer",
  department: "",
  status: "Active",
  permissions: roles.Viewer,
};

export default function UsersRoles() {
  const [users, setUsers] = useState(defaultUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUsers(JSON.parse(stored));
      } catch {
        setUsers(defaultUsers);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(false);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      setForm((prev) => ({
        ...prev,
        role: value,
        permissions: roles[value] || [],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermission = (permission) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permission);

      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name required hai.";
    if (!form.email.trim()) return "Email required hai.";
    if (!form.phone.trim()) return "Phone required hai.";

    const duplicateEmail = users.some(
      (user) =>
        user.email.toLowerCase() === form.email.toLowerCase() &&
        user.id !== form.id
    );

    if (duplicateEmail) return "Ye email already kisi user me use ho rahi hai.";

    if (!editMode && !form.password.trim()) {
      return "New user ke liye password required hai.";
    }

    if (form.permissions.length === 0) {
      return "Kam se kam ek permission select karo.";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

   const oldUser = users.find((u) => u.id === form.id);

const payload = {
  ...form,
  fullName: form.fullName.trim(),
  email: form.email.trim().toLowerCase(),
  phone: form.phone.trim(),
  department: form.department.trim(),
  password: form.password?.trim()
    ? form.password.trim()
    : editMode
    ? oldUser?.password || ""
    : "",
  id: editMode ? form.id : Date.now(),
};

    const updatedUsers = editMode
      ? users.map((user) => (user.id === payload.id ? payload : user))
      : [payload, ...users];

    saveUsers(updatedUsers);
    resetForm();
  };

  const handleEdit = (user) => {
   setForm({
  ...emptyForm,
  ...user,
  password: "",
  permissions: user.permissions?.length ? user.permissions : roles[user.role] || [],
});
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const targetUser = users.find((u) => u.id === id);

    if (targetUser?.role === "Admin") {
      const adminCount = users.filter((u) => u.role === "Admin").length;
      if (adminCount <= 1) {
        alert("Last Admin user delete nahi kar sakte.");
        return;
      }
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    saveUsers(users.filter((user) => user.id !== id));
  };

  const toggleStatus = (id) => {
    const targetUser = users.find((u) => u.id === id);

    if (targetUser?.role === "Admin" && targetUser.status === "Active") {
      const activeAdmins = users.filter(
        (u) => u.role === "Admin" && u.status === "Active"
      ).length;

      if (activeAdmins <= 1) {
        alert("Last active Admin ko inactive nahi kar sakte.");
        return;
      }
    }

    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status: user.status === "Active" ? "Inactive" : "Active",
          }
        : user
    );

    saveUsers(updatedUsers);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase();

      const matchSearch =
        user.fullName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q) ||
        user.department?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" || user.status === statusFilter;

      const matchRole = roleFilter === "All" || user.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <ShieldCheck size={30} />
            Users & Roles
          </h1>
          <p className="mt-2 text-slate-300">
            Manage users, roles, departments and module permissions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Users" value={users.length} icon={<Users size={22} />} />
        <StatCard title="Active Users" value={activeUsers} icon={<UserCheck size={22} />} />
        <StatCard title="Inactive Users" value={inactiveUsers} icon={<UserX size={22} />} />
        <StatCard title="Roles" value={Object.keys(roles).length} icon={<ShieldCheck size={22} />} />
      </div>

      <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:grid-cols-[1fr_180px_180px]">
        <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-soft)] px-4 py-3">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, role..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
        >
          <option value="All">All Roles</option>
          {Object.keys(roles).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>User</Th>
              <Th>Contact</Th>
              <Th>Role</Th>
              <Th>Department</Th>
              <Th>Permissions</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center font-bold text-[var(--muted)]">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[var(--border)] last:border-b-0">
                  <Td bold>{user.fullName}</Td>

                  <Td>
                    <div>
                      <p className="font-bold">{user.email}</p>
                      <p className="text-sm text-[var(--muted)]">{user.phone}</p>
                    </div>
                  </Td>

                  <Td>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {user.role}
                    </span>
                  </Td>

                  <Td>{user.department || "-"}</Td>

                  <Td>
                    <div className="flex max-w-[360px] flex-wrap gap-2">
                      {(user.permissions || []).map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </Td>

                  <Td>
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </button>
                  </Td>

                  <Td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg bg-yellow-100 p-2 text-yellow-700"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded-lg bg-red-100 p-2 text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{user.fullName}</p>
                <p className="text-sm text-[var(--muted)]">{user.email}</p>
                <p className="text-sm text-[var(--muted)]">{user.phone}</p>
              </div>

              <button
                onClick={() => toggleStatus(user.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {user.role}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {user.department || "-"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(user.permissions || []).map((permission) => (
                <span key={permission} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {permission}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => handleEdit(user)} className="rounded-lg bg-yellow-100 p-2 text-yellow-700">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(user.id)} className="rounded-lg bg-red-100 p-2 text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  {editMode ? "Update User" : "Add New User"}
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Role select karte hi permissions auto set ho jayengi.
                </p>
              </div>

              <button onClick={resetForm} className="rounded-xl border border-[var(--border)] p-2">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />

                <Input
                  label={editMode ? "Password Optional" : "Password"}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editMode}
                />

                <Select label="Role" name="role" value={form.role} onChange={handleChange} options={Object.keys(roles)} />
                <Input label="Department" name="department" value={form.department} onChange={handleChange} />
                <Select label="Status" name="status" value={form.status} onChange={handleChange} options={["Active", "Inactive"]} />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <Eye size={16} />
                  Module Permissions
                </label>

                <div className="grid gap-3 md:grid-cols-4">
                  {permissionOptions.map((permission) => (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => handlePermission(permission)}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                        form.permissions.includes(permission)
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-[var(--surface-soft)]"
                      }`}
                    >
                      {permission}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
                <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold">
                  Cancel
                </button>

                <button type="submit" className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white">
                  <Save size={18} />
                  {editMode ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
        <div className="text-[var(--primary)]">{icon}</div>
      </div>
      <h2 className="mt-3 text-3xl font-black">{value}</h2>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false }) {
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
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 py-4 text-left text-sm font-black uppercase">{children}</th>;
}

function Td({ children, bold }) {
  return <td className={`px-5 py-4 align-top ${bold ? "font-bold" : ""}`}>{children}</td>;
}