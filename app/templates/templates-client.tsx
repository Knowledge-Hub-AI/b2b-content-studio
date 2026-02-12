"use client";

import { useEffect, useMemo, useState } from "react";

type Template = {
  id: string;
  name: string;
  assetType: string;
  systemPrompt: string;
  isActive: boolean;
  updatedAt: string;
};

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("White Paper");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an expert B2B technology content writer. Output Markdown. Do not invent stats, quotes, customers, awards, certifications."
  );

  const canCreate = useMemo(() => name.trim() && assetType.trim() && systemPrompt.trim(), [name, assetType, systemPrompt]);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/templates");
    const data = (await res.json()) as { templates: Template[]; isAdmin: boolean };
    setTemplates(data.templates);
    setIsAdmin(data.isAdmin);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createTemplate() {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, assetType, systemPrompt, isActive: true }),
    });
    if (!res.ok) alert(await res.text());
    else {
      setName("");
      await refresh();
    }
  }

  async function toggleActive(t: Template) {
    const res = await fetch(`/api/templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    if (!res.ok) alert(await res.text());
    else await refresh();
  }

  async function quickEdit(t: Template) {
    const newPrompt = prompt("Edit system prompt:", t.systemPrompt);
    if (newPrompt === null) return;

    const res = await fetch(`/api/templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt: newPrompt }),
    });
    if (!res.ok) alert(await res.text());
    else await refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Template Library</h1>
          <div className="flex gap-3">
            <a href="/" className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm hover:bg-slate-900">
              Back to Studio
            </a>
            <a href="/api/auth/signout" className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm hover:bg-slate-900">
              Sign out
            </a>
          </div>
        </div>

        {!isAdmin && (
          <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-200">
            You’re not an admin. You can view active templates, but you can’t edit them.
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200">Templates</h2>

          {loading ? (
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          ) : (
            <div className="mt-3 grid gap-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {t.name}{" "}
                        <span className="ml-2 text-xs text-slate-400">
                          · {t.assetType} · {t.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-xs text-slate-300">{t.systemPrompt}</div>
                    </div>

                    {isAdmin && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleActive(t)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs hover:bg-slate-900"
                        >
                          {t.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => quickEdit(t)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs hover:bg-slate-900"
                        >
                          Edit Prompt
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {templates.length === 0 && <p className="text-sm text-slate-400">No templates yet.</p>}
            </div>
          )}
        </section>

        {isAdmin && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Create Template</h2>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-slate-300">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-slate-300">Asset type</span>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none"
                >
                  <option>White Paper</option>
                  <option>Comparison Guide</option>
                  <option>Sponsored Blog Post</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-slate-300">System prompt</span>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[140px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none"
                />
              </label>

              <button
                disabled={!canCreate}
                onClick={createTemplate}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
