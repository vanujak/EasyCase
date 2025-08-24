// _CaseDetailOverlay.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function CaseDetailOverlay({ caseId, onClose }) {
  const token = localStorage.getItem("token");
  const [caseDoc, setCaseDoc] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openHearing, setOpenHearing] = useState(false);
  const [error, setError] = useState("");

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [cRes, hRes] = await Promise.all([
        fetch(`${API}/api/cases/${caseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/hearings?caseId=${caseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const c = await cRes.json();
      const h = await hRes.json();
      if (!cRes.ok) throw new Error(c?.error || "Failed to load case");
      if (!hRes.ok) throw new Error(h?.error || "Failed to load hearings");
      setCaseDoc(c);
      setHearings(
        (Array.isArray(h) ? h : []).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const nextHearingLabel = useMemo(() => {
    const now = Date.now();
    const fromNextField = hearings
      .map((h) => (h.nextDate ? new Date(h.nextDate).getTime() : null))
      .filter(Boolean)
      .sort((a, b) => a - b)[0];
    const fromFutureDates = hearings
      .map((h) => new Date(h.date).getTime())
      .filter((t) => t > now)
      .sort((a, b) => a - b)[0];
    const t = fromNextField ?? fromFutureDates;
    return t ? new Date(t).toLocaleString() : null;
  }, [hearings]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      {/* Panel becomes a flex column; content area is scrollable */}
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl">
        {/* Header (sticky) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenHearing(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold"
              disabled={!caseDoc}
            >
              + Add hearing
            </button>
          </div>
          <div className="min-w-0 text-center md:text-right">
            <h2 className="truncate text-xl font-semibold">
              {loading ? "Loading…" : caseDoc?.title}
            </h2>
            {!loading && caseDoc && (
              <p className="truncate text-sm text-gray-600">
                {caseDoc.clientName ? `${caseDoc.clientName} • ` : ""}
                {caseDoc.courtType}
                {caseDoc.courtPlace ? ` — ${caseDoc.courtPlace}` : ""}
                {caseDoc.number ? ` • #${caseDoc.number}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-2 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {!loading && nextHearingLabel && (
            <div className="mt-4 flex justify-center">
              <div className="rounded-full border bg-white px-4 py-1 text-sm shadow">
                Next hearing: <span className="font-medium">{nextHearingLabel}</span>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-red-600">{error}</p>}
          {loading ? (
            <div className="mt-10">Loading timeline…</div>
          ) : (
            <Timeline startedAt={caseDoc.createdAt} hearings={hearings} />
          )}
        </div>

        {/* Hearing modal */}
        {openHearing && (
          <HearingModal
            caseId={caseId}
            onClose={() => setOpenHearing(false)}
            onSaved={() => {
              setOpenHearing(false);
              fetchAll();
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Alternating timeline with measured rail between first/last dots ---------- */
function Timeline({ startedAt, hearings }) {
  // newest first in display, then "Case started" last
  const items = [
    ...(hearings || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((h, i) => ({
        key: h._id || `h-${i}`,
        side: i % 2 === 0 ? "left" : "right",
        title: new Date(h.date).toLocaleString(),
        subtitle: h.venue || null,
        body: h.notes || "",
        footer: h.outcome ? `Outcome: ${h.outcome}` : null,
      })),
    {
      key: "start",
      side: (hearings?.length ?? 0) % 2 === 0 ? "left" : "right",
      isStart: true,
      title: "Case started",
      subtitle: new Date(startedAt).toLocaleString(),
      body: "— Beginning of the case —",
      footer: null,
    },
  ];

  // measure dots to clip the rail exactly between first & last
  const containerRef = useRef(null);
  const dotRefs = useRef([]);
  dotRefs.current = [];

  const [line, setLine] = useState({ top: 0, height: 0 });

  const registerDot = (el) => {
    if (el) dotRefs.current.push(el);
  };

  const computeLine = () => {
    const c = containerRef.current;
    const dots = dotRefs.current;
    if (!c || dots.length === 0) return;

    const cRect = c.getBoundingClientRect();
    const mids = dots
      .map((d) => {
        const r = d.getBoundingClientRect();
        return r.top + r.height / 2 - cRect.top; // middle Y relative to container
      })
      .sort((a, b) => a - b);

    const firstMid = mids[0];
    const lastMid = mids[mids.length - 1];

    setLine({ top: firstMid, height: Math.max(0, lastMid - firstMid) });
  };

  useEffect(() => {
    computeLine();
    window.addEventListener("resize", computeLine);
    return () => window.removeEventListener("resize", computeLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // small re-measure after layout settles
  useEffect(() => {
    const id = setTimeout(computeLine, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <section className="relative mx-auto mt-8 max-w-5xl">
      {/* grid: [left 1fr] [rail 40px] [right 1fr] */}
      <ul ref={containerRef} className="relative grid grid-cols-[1fr_40px_1fr] gap-x-6">
        {/* vertical rail clipped to first/last dot */}
        <div
          className="pointer-events-none absolute left-1/2 w-0.5 -translate-x-1/2 bg-gray-300"
          style={{ top: `${line.top}px`, height: `${line.height}px` }}
        />

        {items.map((it, idx) => (
          <TimelineRow key={it.key} item={it} registerDot={registerDot} />
        ))}
      </ul>
    </section>
  );
}

function TimelineRow({ item, registerDot }) {
  const card = (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      {item.subtitle && <div className="text-sm text-gray-600">{item.subtitle}</div>}
      <h3 className="text-base font-semibold">{item.title}</h3>
      {item.body && <p className="mt-2 whitespace-pre-wrap">{item.body}</p>}
      {item.footer && <p className="mt-2 text-sm text-gray-600">{item.footer}</p>}
    </div>
  );

  return (
    <>
      {/* left card */}
      <div className="col-start-1 mb-12">
        {item.side === "left" ? card : <div className="hidden md:block" />}
      </div>

      {/* rail column: dot centered to the row height */}
      <div className="relative col-start-2 mb-12 flex items-center justify-center">
        <span
          ref={registerDot}
          className="block h-3 w-3 rounded-full bg-black"
          aria-hidden="true"
        />
      </div>

      {/* right card */}
      <div className="col-start-3 mb-12">
        {item.side === "right" ? card : <div className="hidden md:block" />}
      </div>
    </>
  );
}

/* ---------- Hearing modal ---------- */
function HearingModal({ caseId, onClose, onSaved }) {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    date: "",
    venue: "",
    notes: "",
    outcome: "",
    nextDate: "",
  });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      caseId,
      date: form.date ? new Date(form.date).toISOString() : undefined,
      venue: form.venue || undefined,
      notes: form.notes || undefined,
      outcome: form.outcome || undefined,
      nextDate: form.nextDate ? new Date(form.nextDate).toISOString() : undefined,
    };
    const res = await fetch(`${API}/api/hearings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to create hearing");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add hearing</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            ✕
          </button>
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
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold"
            >
              Save hearing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
