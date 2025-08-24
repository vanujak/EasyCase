import { useEffect, useMemo, useState } from "react";
import NavbarDashboard from "../../components/NavbarDashboard.jsx";
import { SRI_LANKA_DISTRICTS, SRI_LANKA_PROVINCES } from "../../constants/geo.js";
import { COURT_TYPES, CASE_STATUSES } from "../../constants/courts.js";
import CaseDetailsOverlay from "../../components/CaseDetailsOverlay.jsx";

const API = import.meta.env.VITE_API_URL;

export default function Cases() {
  const token = localStorage.getItem("token");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [openCaseId, setOpenCaseId] = useState(null); // selected case (details drawer)
  // Prevent background scroll when overlay is open
    useEffect(() => {
        if (openCaseId) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
            document.body.style.overflow = prev;
            };
        }
        }, [openCaseId]);


  const fetchCases = async (query = "") => {
    setLoading(true); setError("");
    try {
      const url = `${API}/api/cases${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load cases");
      setCases(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); /* eslint-disable-next-line */ }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarDashboard />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Cases</h1>
          <div className="flex gap-2">
            <form
              onSubmit={(e) => { e.preventDefault(); fetchCases(q.trim()); }}
              className="flex gap-2"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title/number"
                className="rounded-lg border px-3 py-2"
              />
              <button className="rounded-lg bg-black px-4 py-2 text-white font-semibold">
                Search
              </button>
            </form>
            <button
              onClick={() => setOpenCaseModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700"
            >
              + New case
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Court</th>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6" colSpan={6}>Loading…</td></tr>
              ) : cases.length === 0 ? (
                <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={6}>No cases yet.</td></tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setOpenCaseId(c._id)}
                    >

                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3">{c.clientName || "—"}</td>
                    <td className="px-4 py-3">{c.courtType}</td>
                    <td className="px-4 py-3">{c.courtPlace || "—"}</td>
                    <td className="px-4 py-3 capitalize">{c.status}</td>
                    <td className="px-4 py-3">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openCaseId && (
        <CaseDetailsOverlay
          caseId={openCaseId}
          onClose={() => setOpenCaseId(null)}
        />
      )}
    </main>
  );
}

/* ----------------------------- CaseModal ----------------------------- */
function CaseModal({ onClose, onSaved }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    number: "",
    type: "",               // custom type (free text if you like)
    clientId: "",
    courtType: COURT_TYPES[0],
    courtPlace: "",
    status: "open",
  });

  // client search (async)
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // toggle "add new client here"
  const [addClient, setAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    type: "person", name: "", email: "", phone: "", address: "", district: "",
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
    // adjust courtPlace when courtType changes
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
      const res = await fetch(`${API}/api/clients?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      if (clientQuery.trim()) searchClients(clientQuery.trim());
      else setClientResults([]);
    }, 300);
    return () => clearTimeout(id);
  }, [clientQuery]);

  const createClientInline = async () => {
    const payload = Object.fromEntries(
      Object.entries(newClient).filter(([, v]) => v !== "")
    );
    const res = await fetch(`${API}/api/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to create client");
    // select newly created client
    setForm((f) => ({ ...f, clientId: data._id }));
    setAddClient(false);
    setClientQuery(data.name);
    setClientResults([data]);
  };

  const submitCase = async (e) => {
    e.preventDefault();

    // payload — keep it clean
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== "")
    );

    const res = await fetch(`${API}/api/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to create case");

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">New case</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={submitCase} className="mt-4 grid gap-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input name="title" value={form.title} onChange={onChange}
                     required className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Case number</label>
              <input name="number" value={form.number} onChange={onChange}
                     className="w-full rounded-lg border px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Type of case</label>
            <input
              name="type" value={form.type} onChange={onChange}
              placeholder="e.g., Property dispute"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {/* Client picker or create */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Client</label>
              <button
                type="button"
                onClick={() => setAddClient((v) => !v)}
                className="text-sm underline"
              >
                {addClient ? "Pick existing instead" : "Add new client here"}
              </button>
            </div>

            {!addClient ? (
              <div className="mt-2">
                <input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Search client by name…"
                  className="w-full rounded-lg border px-3 py-2"
                />
                {searching && <p className="text-xs mt-1">Searching…</p>}
                {clientResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-auto rounded-lg border">
                    {clientResults.map((c) => (
                      <button
                        type="button"
                        key={c._id}
                        onClick={() => {
                          setForm((f) => ({ ...f, clientId: c._id }));
                          setClientQuery(c.name);
                          setClientResults([]);
                        }}
                        className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${
                          form.clientId === c._id ? "bg-blue-50" : ""
                        }`}
                      >
                        {c.name} <span className="text-gray-500 text-xs">({c.email || "no email"})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 grid md:grid-cols-2 gap-3">
                <input
                  placeholder="Name"
                  value={newClient.name}
                  onChange={(e) => setNewClient((v) => ({ ...v, name: e.target.value }))}
                  className="rounded-lg border px-3 py-2" required
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((v) => ({ ...v, email: e.target.value }))}
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  placeholder="Phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient((v) => ({ ...v, phone: e.target.value }))}
                  className="rounded-lg border px-3 py-2"
                />
                <button type="button" onClick={createClientInline}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">
                  Save client
                </button>
              </div>
            )}
          </div>

          {/* Court */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Court</label>
              <select
                name="courtType"
                value={form.courtType}
                onChange={onChange}
                className="w-full rounded-lg border px-3 py-2 bg-white"
                required
              >
                {COURT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Place</label>
              {fixedColombo ? (
                <input value="Colombo" disabled className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
              ) : canPickDistrict ? (
                <select
                  name="courtPlace"
                  value={form.courtPlace}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                >
                  <option value="" disabled>Select district</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : canPickProvince ? (
                <select
                  name="courtPlace"
                  value={form.courtPlace}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                >
                  <option value="" disabled>Select province</option>
                  {SRI_LANKA_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <input disabled className="w-full rounded-lg border px-3 py-2 bg-gray-100" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              name="status" value={form.status} onChange={onChange}
              className="w-full rounded-lg border px-3 py-2 bg-white"
            >
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">
              Create case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- CaseDrawer ----------------------------- */
// {openCaseId && (
//   <CaseDetailOverlay caseId={openCaseId} onClose={() => setOpenCaseId(null)} />
// )}
/* ----------------------------- HearingModal ----------------------------- */
function HearingModal({ caseId, onClose, onSaved }) {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    date: "",           // ISO local date-time (converted below)
    venue: "",
    notes: "",
    outcome: "",
    nextDate: "",       // (optional) see note below
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    // Build payload compatible with your current backend schema:
    // Hearing: { userId, caseId, date, venue, notes, outcome }
    // If you want nextDate stored too, add it to the backend schema later.
    const payload = {
      caseId,
      date: form.date ? new Date(form.date).toISOString() : undefined,
      venue: form.venue || undefined,
      notes: form.notes || undefined,
      outcome: form.outcome || undefined,
    };

    const res = await fetch(`${API}/api/hearings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to create hearing");

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add hearing</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <div>
            <label className="block text-sm mb-1">Date & time</label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">What happened?</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={3}
              placeholder="Notes / summary"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Outcome</label>
              <input
                name="outcome"
                value={form.outcome}
                onChange={onChange}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Next hearing date (optional)</label>
              <input
                type="date"
                name="nextDate"
                value={form.nextDate}
                onChange={onChange}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">
              Save hearing
            </button>
          </div>
        </form>

        <p className="mt-3 text-xs text-gray-500">
          Note: if you want <code>nextDate</code> stored in the DB, add that field to your
          <code> Hearing </code> model and routes; otherwise it’s ignored by the API.
        </p>
      </div>
    </div>
  );
}
