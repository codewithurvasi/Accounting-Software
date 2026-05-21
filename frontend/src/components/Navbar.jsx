import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { Bell, LogOut, Menu, Search, UserCircle } from "lucide-react";

export default function Navbar({ onMenuClick, setLanguage }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

 const changeLanguage = (lang) => {
  localStorage.setItem("lang", lang);
  setLanguage(lang);
};

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl bg-[var(--sidebar)] p-2 text-white lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-black text-[var(--text)] sm:text-xl">
            Dashboard
          </h2>
          <p className="hidden text-sm text-[var(--muted)] sm:block">
            Accounting Software.....
          </p>
        </div>

        {/* <div className="hidden max-w-md flex-1 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 md:flex">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            placeholder="Search invoices, customers, reports..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div> */}

        <div className="flex items-center gap-3">
          {/* <button className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-[var(--text)]">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)]" />
          </button> */}

          <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 sm:flex">
            <UserCircle size={22} className="text-[var(--primary)]" />
            <div>
              <p className="text-sm font-bold text-[var(--text)]">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {user?.role || "Admin"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1">
  <button
    onClick={() => changeLanguage("en")}
    className="rounded-lg px-3 py-2 text-xs font-bold text-[var(--text)] hover:bg-white"
  >
    EN
  </button>

  <button
    onClick={() => changeLanguage("hi")}
    className="rounded-lg bg-[var(--sidebar)] px-3 py-2 text-xs font-bold text-white"
  >
    हिन्दी
  </button>
</div>

          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}