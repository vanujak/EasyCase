import { useEffect, useMemo, useState } from "react";
import NavbarDashboard from "../../components/NavbarDashboard.jsx";
import { SRI_LANKA_DISTRICTS, SRI_LANKA_PROVINCES } from "../../constants/geo.js";
import { COURT_TYPES } from "../../constants/courts.js";
import CaseDetailsOverlay from "../../components/CaseDetailsOverlay.jsx";
import { apiFetch } from "../../lib/api.js";
const CLIENT_TYPES = [
  "individual",
  "company",
  "government",
  "organization",
];

function normalizeSriLankaPhone(input = "") {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("94")) return `+${digits}`;
  if (digits.startsWith("0"))   return `+94${digits.slice(1)}`;
  if (digits.startsWith("+94")) return `+94${digits.slice(3)}`;
  return `+94${digits}`;
}

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [openCaseId, setOpenCaseId] = useState(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    variant: "danger"
  });

  // Prevent background scroll when overlay is open
  useEffect(() => {
    if (openCaseId || openCaseModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCaseId, openCaseModal]);

  const closeCase = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Close Case",
      message: "Close this case? You won't be able to add new hearings.",
      confirmText: "Close Case",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiFetch(`/api/cases/${id}/close`, {
            method: "PATCH",
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data?.error || "Failed to close case");
            return;
          }
          fetchCases(q); // refresh list
        } catch (e) {
          setError(e.message || "Failed to close case");
        }
      }
    });
  };

  const deleteCase = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Case",
      message: "Delete this case permanently? This cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiFetch(`/api/cases/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data?.error || "Failed to delete case");
            return;
          }
          fetchCases(q); // refresh list
        } catch (e) {
          setError(e.message || "Failed to delete case");
        }
      }
    });
  };

  const fetchCases = async (query = "") => {
    setLoading(true); setError("");
    try {
      const url = `/api/cases${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const res = await apiFetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load cases");
      setCases(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  // Reset filters function
  const resetFilters = () => {
    setQ("");
    fetchCases("");
  };

  // ---------- UI ----------
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-150">
      <NavbarDashboard />

      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* === STICKY HEADER SECTION === */}
        <div className="sticky top-0 z-40 bg-gray-50 dark:bg-slate-950 pb-4 border-b border-gray-200 dark:border-slate-800 transition-colors">
          
          {/* 1. Title + New Case Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cases</h1>
            <button
              onClick={() => setOpenCaseModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              + New case
            </button>
          </div>

          {/* 2. Search Bar with Reset Button */}
          <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <form
              onSubmit={(e) => { e.preventDefault(); fetchCases(q.trim()); }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or case number..."
                className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="rounded-lg bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-white font-semibold whitespace-nowrap transition shadow-sm"
              >
                Search
              </button>
              <button 
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-nowrap transition"
              >
                Reset filters
              </button>
            </form>
          </div>
        </div>

        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}

        {/* ------------------ LIST SECTION ------------------ */}
        <div className="mt-4 relative z-0">

          {/* === MOBILE CARD VIEW (Visible only on small screens) === */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-6">Loading…</p>
            ) : cases.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-6">No cases found.</p>
            ) : (
              cases.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => setOpenCaseId(c._id)}
                  className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm active:bg-gray-50 dark:active:bg-slate-800/60 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block rounded bg-gray-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                          #{c.number}
                        </span>
                        <h3 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white">{c.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      c.status === 'closed'
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
                        : 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 dark:text-slate-400 space-y-1">
                    <p><span className="font-medium text-gray-900 dark:text-slate-200">Client:</span> {c.clientName || "—"}</p>
                    <p><span className="font-medium text-gray-900 dark:text-slate-200">Court:</span> {c.courtType} {c.courtPlace ? `(${c.courtPlace})` : ""}</p>
                    <p><span className="font-medium text-gray-900 dark:text-slate-200">Date:</span> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-800">
                    <button
                      onClick={(e) => { e.stopPropagation(); closeCase(c._id); }}
                      disabled={c.status === "closed"}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {c.status === "closed" ? "Closed" : "Close"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCase(c._id); }}
                      className="flex-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* === DESKTOP TABLE VIEW (Hidden on mobile) === */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 text-left">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Court</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-6 text-gray-500 dark:text-slate-400" colSpan={8}>Loading…</td></tr>
                ) : cases.length === 0 ? (
                  <tr><td className="px-4 py-10 text-center text-gray-500 dark:text-slate-400" colSpan={8}>No cases yet.</td></tr>
                ) : (
                  cases.map((c) => (
                    <tr
                      key={c._id}
                      className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      onClick={() => setOpenCaseId(c._id)}
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">#{c.number}</td> 
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{c.title}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.clientName || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.courtType}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{c.courtPlace || "—"}</td>
                      <td className="px-4 py-3 capitalize">
                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            c.status === 'closed'
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
                              : 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50'
                         }`}>
                            {c.status}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); closeCase(c._id); }}
                            className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                            disabled={c.status === "closed"}
                            title={c.status === "closed" ? "Already closed" : "Close case"}
                          >
                            Close
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCase(c._id); }}
                            className="rounded-lg border border-red-300 dark:border-red-900/50 bg-white dark:bg-slate-800 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          >
                            Delete
                          </button>
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

      {/* Modals / Overlays */}
      {openCaseId && (
        <CaseDetailsOverlay
          caseId={openCaseId}
          onClose={() => setOpenCaseId(null)}
        />
      )}
      
      {openCaseModal && (
        <CaseModal
          onClose={() => setOpenCaseModal(false)}
          onSaved={() => {
            setOpenCaseModal(false);
            fetchCases();
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </main>
  );
}

/* ----------------------------- CaseModal ----------------------------- */
function CaseModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    type: "",
    clientId: "",
    courtType: COURT_TYPES?.[0] || "",
    courtPlace: "",
    status: "open",
  });
  const [nextNumber, setNextNumber] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await apiFetch("/api/cases/next-number");
        const data = await res.json();
        if (isMounted) setNextNumber(data?.next ?? null);
      } catch {
        if (isMounted) setNextNumber(null);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // client search (async)
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // toggle "add new client here"
  const [addClient, setAddClient] = useState(false);

  // new client form
  const [newClient, setNewClient] = useState({
    type: "individual",
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "", 
  });

  const canPickDistrict = useMemo(
    () => form.courtType === "District Court" || form.courtType === "High Court",
    [form.courtType]
  );
  const canPickProvince = useMemo(
    () => form.courtType === "Provincial High Court",
    [form.courtType]
  );
  const fixedColombo = useMemo(
    () => form.courtType === "Court of Appeal" || form.courtType === "Supreme Court",
    [form.courtType]
  );

  useEffect(() => {
    if (fixedColombo) {
      setForm((f) => ({ ...f, courtPlace: "Colombo" }));
    } else {
      setForm((f) => ({ ...f, courtPlace: "" }));
    }
  }, [fixedColombo]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // search clients by name
  const searchClients = async (q) => {
    setSearching(true);
    try {
      const res = await apiFetch(`/api/clients?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setClientResults(Array.isArray(data) ? data : []);
    } catch {
      setClientResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (clientQuery.trim() && !form.clientId) {
        searchClients(clientQuery.trim());
      } else if (!clientQuery.trim()) {
        setClientResults([]);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [clientQuery, form.clientId]);

  const createClientInline = async () => {
    const payload = {
      ...newClient,
      phone: newClient.phone ? normalizeSriLankaPhone(newClient.phone) : undefined,
    };

    // remove "" and undefined 
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== "" && v != null)
    );

    try {
      const res = await apiFetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(clean),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create client");
        return;
      }

      // Select the freshly created client
      setForm((f) => ({ ...f, clientId: data._id }));
      setClientQuery(data.name);
      setClientResults([data]);
      setAddClient(false);
      setError(""); // Clear any errors
    } catch (err) {
      setError(err.message);
    }
  };

  const submitCase = async (e) => {
    e.preventDefault();
    
    // Validate that a valid client is selected
    if (!form.clientId) {
      setError("Please select a valid client");
      return;
    }

    setError(""); // Clear error if validation passes
    
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== "")
    );

    try {
      const res = await apiFetch("/api/cases", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create case");

      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  // IMPORTANT: z-[1000] keeps it above the sticky header
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New case</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition">✕</button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={submitCase} className="space-y-4">
            
            {/* Title + Case number */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Case number</label>
                <input value={`#${nextNumber || "…"}`} readOnly
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-gray-100 dark:bg-slate-800/60 text-gray-600 dark:text-slate-400 cursor-not-allowed" />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Assigned automatically.
                </p>
              </div>
            </div>

            {/* Type of case */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type of case</label>
              <input
                name="type"
                value={form.type}
                onChange={onChange}
                placeholder="e.g., Property dispute"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Client section */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30 p-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Client</label>
                <button
                  type="button"
                  onClick={() => setAddClient(v => !v)}
                  className="text-sm underline text-blue-600 dark:text-blue-400 font-medium"
                >
                  {addClient ? "Pick existing instead" : "Add new client here"}
                </button>
              </div>

              {!addClient ? (
                // --- Pick existing client ---
                <div className="mt-2">
                  <input
                    value={clientQuery}
                    onChange={(e) => {
                      const newQuery = e.target.value;
                      setClientQuery(newQuery);
                      if (newQuery !== clientQuery) {
                        setForm((f) => ({ ...f, clientId: "" }));
                      }
                    }}
                    placeholder="Search client by name…"
                    className={`w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error && !form.clientId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {searching && <p className="text-xs mt-1 text-gray-500 dark:text-slate-400">Searching…</p>}
                  
                  {error && !form.clientId && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                  
                  {clientResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
                      {clientResults.map((c) => (
                        <button
                          type="button"
                          key={c._id}
                          onClick={() => {
                            setForm((f) => ({ ...f, clientId: c._id }));
                            setClientQuery(c.name);
                            setClientResults([]);
                            setSearching(false);
                            setError("");
                          }}
                          className={`block w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition ${
                            form.clientId === c._id ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-slate-100"
                          }`}
                        >
                          {c.name} <span className="text-gray-500 dark:text-slate-400 text-xs">
                            ({c.email || "no email"})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!searching && clientQuery.trim() && clientResults.length === 0 && !form.clientId && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      No clients found. Try a different name or{" "}
                      <button
                        type="button"
                        onClick={() => setAddClient(true)}
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        add a new client
                      </button>
                      .
                    </p>
                  )}
                </div>
              ) : (
                // --- Add new client inline ---
                <div className="mt-2 grid gap-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
                      <select
                        value={newClient.type}
                        onChange={(e) => setNewClient(v => ({ ...v, type: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                        required
                      >
                        {CLIENT_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                      <input
                        value={newClient.name}
                        onChange={(e) => setNewClient(v => ({ ...v, name: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="Client's full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email (optional)</label>
                      <input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient(v => ({ ...v, email: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                      <input
                        value={newClient.phone}
                        onChange={(e) => setNewClient(v => ({ ...v, phone: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="07XXXXXXXX or +947XXXXXXXX"
                        inputMode="tel"
                        pattern="^(?:\+94|0)7(?:0|1|2|5|6|7|8)\d{7}$"
                        title="Use 07XXXXXXXX or +947XXXXXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">District</label>
                      <select
                        value={newClient.district}
                        onChange={(e) => setNewClient(v => ({ ...v, district: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                        required
                      >
                        <option value="" disabled>Select district</option>
                        {SRI_LANKA_DISTRICTS?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Address</label>
                      <input
                        value={newClient.address}
                        onChange={(e) => setNewClient(v => ({ ...v, address: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="Street, City"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddClient(false)}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={createClientInline}
                      className="rounded-lg bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-3 py-1.5 text-sm text-white font-medium transition"
                    >
                      Save & Select
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Court type & place */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Court</label>
                <select
                  name="courtType"
                  value={form.courtType}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                >
                  {COURT_TYPES?.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Court Location {fixedColombo ? "(Fixed)" : ""}
                </label>

                {fixedColombo ? (
                  <input
                    value="Colombo"
                    readOnly
                    className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-gray-100 dark:bg-slate-800/60 text-gray-600 dark:text-slate-400 cursor-not-allowed"
                  />
                ) : canPickDistrict ? (
                  <select
                    name="courtPlace"
                    value={form.courtPlace}
                    onChange={onChange}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                  >
                    <option value="" disabled>Select district</option>
                    {SRI_LANKA_DISTRICTS?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : canPickProvince ? (
                  <select
                    name="courtPlace"
                    value={form.courtPlace}
                    onChange={onChange}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-slate-100"
                  >
                    <option value="" disabled>Select province</option>
                    {SRI_LANKA_PROVINCES?.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : (
                  <input readOnly className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-gray-100 dark:bg-slate-800/60 text-gray-600 dark:text-slate-400 cursor-not-allowed" />
                )}
              </div>
            </div>

            {/* Status (display only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
              <input
                value="open"
                readOnly
                className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 bg-gray-100 dark:bg-slate-800/60 text-gray-600 dark:text-slate-400 cursor-not-allowed lowercase"
                style={{ textTransform: "capitalize" }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Cases always start as open. You can close the case from the table.
              </p>
            </div>

            {/* Footer buttons - inside the form, scrolls with content */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-2">
              <button type="button" onClick={onClose}
                      className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                Cancel
              </button>
              <button type="submit"
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-semibold transition shadow-sm">
                Create case
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- ConfirmDialog ----------------------------- */
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-2xl transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition shadow-sm ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
