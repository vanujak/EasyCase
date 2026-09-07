import { useEffect, useMemo, useState } from "react";
import NavbarDashboard from "../../components/NavbarDashboard.jsx";
import { SRI_LANKA_DISTRICTS } from "../../constants/districts.js";
import { apiFetch } from "../../lib/api.js";

export default function Clients() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const emptyForm = useMemo(() => ({
    type: "individual",
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "",
  }), []);

  const [form, setForm] = useState(emptyForm);

  // ---------- LOAD CLIENTS ----------
  const fetchClients = async () => {
    setLoading(true);
    setError("");

    try {
      const search = new URLSearchParams();
      if (q.trim()) search.set("q", q.trim());

      const res = await apiFetch(
        `/api/clients${search.toString() ? `?${search}` : ""}`
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load clients");

      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  // ---------- FILTER CLIENTS ----------
  const filtered = items.filter((c) =>
    (!typeFilter || c.type === typeFilter) &&
    (!districtFilter || c.district === districtFilter)
  );

  // ---------- MODAL ----------
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      type: client.type ?? "individual",
      name: client.name ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      district: client.district ?? "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editing
        ? `/api/clients/${editing._id}`
        : `/api/clients`;
      const method = editing ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");

      closeModal();
      fetchClients();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeClient = async (client) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Client",
      message: `Delete client "${client.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await apiFetch(`/api/clients/${client._id}`, {
            method: "DELETE",
          });

          const data = await res.json();
          if (!res.ok) {
            setError(data?.error || "Delete failed");
            return;
          }

          fetchClients();
        } catch (e) {
          setError(e.message);
        }
      }
    });
  };

  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-150">
      <NavbarDashboard />

      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* === STICKY HEADER === */}
        <div className="sticky top-0 z-40 bg-gray-50 dark:bg-slate-950 pb-4 border-b border-gray-200 dark:border-slate-800 transition-colors">
          
          {/* Title + Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
            <button
              onClick={openCreate}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-semibold shadow transition"
            >
              + New client
            </button>
          </div>

          {/* Filter Box */}
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="md:hidden rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm text-gray-700 dark:text-slate-300"
              >
                {filtersOpen ? "Hide" : "Show"}
              </button>
            </div>

            <div className={`${filtersOpen ? "block" : "hidden"} md:block`}>
              
              {/* All filters in one row for desktop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Search - takes more space */}
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Search by name</label>
                  <div className="flex gap-2">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="e.g., John"
                      className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={fetchClients}
                      className="rounded-lg bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-white font-semibold whitespace-nowrap transition shadow-sm"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Client Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">All</option>
                    <option value="individual">Individual</option>
                    <option value="organization">Organization</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                  </select>
                </div>

                {/* District */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">District</label>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">All</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Reset Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setQ("");
                      setTypeFilter("");
                      setDistrictFilter("");
                      fetchClients();
                    }}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-nowrap transition"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}

        {/* ------------------ LIST SECTION ------------------ */}
        <div className="mt-2 relative z-0">

          {/* MOBILE CARD VIEW */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-6">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-6">No clients match your filters.</p>
            ) : (
              filtered.map((c) => (
                <div key={c._id} className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{c.name}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 capitalize">{c.type}</p>

                  <div className="mt-2 text-sm text-gray-600 dark:text-slate-400 space-y-1">
                    <p><span className="font-medium text-gray-900 dark:text-slate-200">Email:</span> {c.email || "—"}</p>
                    <p><span className="font-medium text-gray-900 dark:text-slate-200">Phone:</span> {c.phone || "—"}</p>
                    <p><span className="font-medium text-gray-900 dark:text-slate-200">District:</span> {c.district || "—"}</p>
                  </div>

                  <div className="mt-4 flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-800">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeClient(c)}
                      className="flex-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-2 font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 text-left">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-gray-500 dark:text-slate-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-slate-400">No clients match your filters.</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id} className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 capitalize text-gray-900 dark:text-slate-200">{c.type}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{c.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.email || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.district || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition">Edit</button>
                          <button onClick={() => removeClient(c)} className="rounded-md border border-red-300 dark:border-red-900/50 bg-white dark:bg-slate-800 px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editing ? "Edit client" : "New client"}</h2>
              <button onClick={closeModal} className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition">✕</button>
            </div>
            <form onSubmit={submitForm} className="mt-4 grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
                  <select name="type" value={form.type} onChange={onChange} className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100">
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                  <input name="name" value={form.name} onChange={onChange} className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500" placeholder="Full name" required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500" placeholder="name@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500" placeholder="+94 7XXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Address</label>
                <input name="address" value={form.address} onChange={onChange} className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500" placeholder="Street, City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">District</label>
                <select name="district" value={form.district} onChange={onChange} className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100">
                  <option value="" disabled>Select district</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-semibold shadow-sm transition">{editing ? "Save changes" : "Create client"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </main>
  );
}

/* ----------------------------- ConfirmDialog ----------------------------- */
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 p-6 shadow-2xl transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
