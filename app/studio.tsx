"use client";

import { useEffect, useMemo, useState } from "react";

type AssetType = "White Paper" | "Comparison Guide" | "Sponsored Blog Post";

type Template = {
  id: string;
  name: string;
  assetType: string;
  systemPrompt: string;
  isActive: boolean;
};

export default function Studio(props: { userEmail?: string | null }) {
  const [assetType, setAssetType] = useState<AssetType>("White Paper");

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [templatePrompt, setTemplatePrompt] = useState<string>("");

  // Brief fields
  const [title, setTitle] = useState("New Project");
  const [audience, setAudience] = useState("IT Director / Infrastructure Lead");
  const [industry, setIndustry] = useState("Healthcare");
  const [solution, setSolution] = useState("Enterprise Backup & Recovery / Ransomware Resilience");
  const [diffs, setDiffs] = useState(
    "Immutable backups, fast restores, air-gapped copies, strong support SLAs, simple management"
  );
  const [competitors, setCompetitors] = useState("");
  const [tone, setTone] = useState("Confident, consultative, minimal hype");
  const [cta, setCta] = useState("Book a 15-minute consult");
  const [notes, setNotes] = useState("");

  // Output
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Load templates
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) return;
      const data = await res.json();
      setTemplates(data.templates || []);
    })();
  }, []);

  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.isActive && t.assetType === assetType),
    [templates, assetType]
  );

  const canGenerate = useMemo(
    () => audience.trim() && industry.trim() && solution.trim() && diffs.trim() && tone.trim() && cta.trim(),
    [audience, industry, solution, diffs, tone, cta]
  );

  function buildPrompt(instruction?: string) {
    return `
Create a ${assetType}.

Brief:
- Audience: ${audience}
- Industry: ${industry}
- Product/Solution: ${solution}
- Differentiators/Proof points: ${diffs}
- Competitors (if any): ${competitors || "None"}
- Tone: ${tone}
- CTA: ${cta}
- Extra notes: ${notes || "None"}

Asset requirements:
- White Paper: executive summary, problem framing, trends, recommended approach, implementation considerations, objections/FAQ, CTA.
- Comparison Guide: evaluation criteria table, narrative comparison by criteria, tradeoffs/risks, “when to choose us”, CTA.
- Sponsored Blog Post: strong hook, practical guidance, subtle product tie-in, CTA.

Rules:
- Do NOT invent customer names, quotes, awards, certifications, or statistics.
- If you mention market stats, label them “needs verification” unless provided above.
- Output Markdown with headings, bullets, short paragraphs.
- End with “Compliance & Verification Checklist”.

${draft ? `Prior draft to revise:\n---\n${draft}\n---\n` : ""}
${instruction ? `Revision instruction: ${instruction}` : ""}
`.trim();
  }

  async function generate(instruction?: string) {
    setLoading(true);
    setStatus(instruction ? "Refining…" : "Generating…");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildPrompt(instruction),
          instruction: instruction || null,
          templateSystemPrompt: templatePrompt || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { text: string };
      setDraft(data.text || "");
      setStatus("Done ✅");
      setTimeout(() => setStatus(""), 1200);
    } catch (e: any) {
      console.error(e);
      setStatus("");
      alert(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setStatus("Copied ✅");
    setTimeout(() => setStatus(""), 900);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">B2B Content Studio</h1>
            <p className="mt-1 text-sm text-slate-300">
              Logged in as <span className="text-slate-100">{props.userEmail ?? "user"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {status ? (
              <span className="text-xs text-slate-300">{status}</span>
            ) : (
              <span className="text-xs text-slate-500">Template-aware generation</span>
            )}

            <a
              href="/templates"
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Templates
            </a>

            <a
              href="/api/auth/signout"
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm hover:bg-slate-900"
            >
              Sign out
            </a>

            <select
              value={assetType}
              onChange={(e) => {
                const nextType = e.target.value as AssetType;
                setAssetType(nextType);
                // reset template selection when asset type changes
                setTemplateId("");
                setTemplatePrompt("");
              }}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option>White Paper</option>
              <option>Comparison Guide</option>
              <option>Sponsored Blog Post</option>
            </select>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* Left: Brief */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Brief Builder</h2>

            <div className="mt-4 grid gap-3">
              <Field label="Project title" value={title} onChange={setTitle} />

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-slate-300">Template (optional)</span>
                <select
                  value={templateId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTemplateId(id);
                    const t = filteredTemplates.find((x) => x.id === id);
                    setTemplatePrompt(t?.systemPrompt || "");
                  }}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
                >
                  <option value="">Default (no template)</option>
                  {filteredTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500">
                  Showing active templates for: <span className="text-slate-300">{assetType}</span>
                </span>
              </label>

              <Field label="Audience *" value={audience} onChange={setAudience} />
              <Field label="Industry *" value={industry} onChange={setIndustry} />
              <Field label="Product / Solution *" value={solution} onChange={setSolution} />
              <Area label="Differentiators / Proof points *" value={diffs} onChange={setDiffs} />
              <Field label="Competitors (optional)" value={competitors} onChange={setCompetitors} />
              <Field label="Tone *" value={tone} onChange={setTone} />
              <Field label="CTA *" value={cta} onChange={setCta} />
              <Area label="Extra notes (optional)" value={notes} onChange={setNotes} />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                disabled={!canGenerate || loading}
                onClick={() => generate()}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                {loading ? "Working…" : "Generate Draft"}
              </button>

              <button
                disabled={!draft}
                onClick={copyDraft}
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm hover:bg-slate-900 disabled:opacity-50"
              >
                Copy
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <QuickButton disabled={!draft || loading} onClick={() => generate("Make it more technical and add implementation steps.")}>
                More technical
              </QuickButton>
              <QuickButton disabled={!draft || loading} onClick={() => generate("Shorten by about 35% while keeping structure and CTA.")}>
                Shorter
              </QuickButton>
              <QuickButton disabled={!draft || loading} onClick={() => generate("Make it more consultative and less salesy; reduce hype.")}>
                Less salesy
              </QuickButton>
              <QuickButton disabled={!draft || loading} onClick={() => generate("Add an objections/FAQ section with 6 Q&As.")}>
                Add FAQ
              </QuickButton>
            </div>
          </section>

          {/* Right: Draft */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Draft Output (Markdown)</h2>
              <span className="text-xs text-slate-500">{draft ? "Editable" : "Generate to begin"}</span>
            </div>

            <textarea
              className="mt-3 h-[72vh] w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none focus:border-slate-600"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your draft will appear here…"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-slate-300">{props.label}</span>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
      />
    </label>
  );
}

function Area(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-slate-300">{props.label}</span>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="min-h-[88px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
      />
    </label>
  );
}

function QuickButton(props: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900 disabled:opacity-50"
    >
      {props.children}
    </button>
  );
}
