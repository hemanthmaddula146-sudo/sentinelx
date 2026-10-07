import Link from "next/link";



const features = [
  {
    number: "01",
    title: "Real-time incident intelligence",
    description:
      "Capture community incidents and turn incoming reports into structured, actionable safety intelligence.",
  },
  {
    number: "02",
    title: "Live geospatial awareness",
    description:
      "Bring incidents, sensors and risk information together through a unified geographic view.",
  },
  {
    number: "03",
    title: "AI-powered risk intelligence",
    description:
      "Use AI analysis and risk assessment to help authorities understand situations and prioritize response.",
  },
  {
    number: "04",
    title: "Connected sensor monitoring",
    description:
      "Integrate environmental and infrastructure telemetry for continuous situational awareness.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(34,197,94,0.08),transparent_30%)]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
              <span className="text-lg font-bold text-cyan-300">S</span>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">SentinelX</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Safety Intelligence
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#platform" className="transition hover:text-white">
              Platform
            </a>
            <a href="#intelligence" className="transition hover:text-white">
              Intelligence
            </a>
            <a href="#response" className="transition hover:text-white">
              Response
            </a>
          </div>

          <Link
            href="/auth"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Access Platform
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-32 lg:pt-28">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Real-time community safety
            </div>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              See risk.
              <br />
              <span className="text-cyan-300">Understand faster.</span>
              <br />
              Respond smarter.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              SentinelX is an AI-powered safety intelligence platform that
              connects citizen reports, live geospatial data, IoT telemetry,
              risk assessment and emergency intelligence in one system.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="rounded-xl bg-cyan-400 px-6 py-3.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Enter SentinelX
              </Link>

              <a
                href="#platform"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore platform
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              <span>GIS intelligence</span>
              <span>•</span>
              <span>IoT telemetry</span>
              <span>•</span>
              <span>AI analysis</span>
              <span>•</span>
              <span>Real-time alerts</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Safety command layer
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    Live intelligence
                  </p>
                </div>
                <span className="flex items-center gap-2 text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>

              <div className="relative h-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1727]">
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />

                <div className="absolute left-[18%] top-[28%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.9)]" />
                <div className="absolute left-[57%] top-[45%] h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.9)]" />
                <div className="absolute left-[72%] top-[70%] h-3 w-3 rounded-full bg-red-400 shadow-[0_0_24px_rgba(248,113,113,0.9)]" />

                <div className="absolute left-[12%] top-[23%] h-12 w-12 rounded-full border border-cyan-400/20" />
                <div className="absolute left-[51%] top-[39%] h-14 w-14 rounded-full border border-amber-400/20" />
                <div className="absolute left-[66%] top-[64%] h-16 w-16 rounded-full border border-red-400/20" />

                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#07111f]/90 p-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Intelligence map
                    </span>
                    <span className="text-xs text-cyan-300">
                      GIS enabled
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Incidents
                  </p>
                  <p className="mt-1 text-xs text-slate-300">Live feed</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Sensors
                  </p>
                  <p className="mt-1 text-xs text-slate-300">Telemetry</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Risk
                  </p>
                  <p className="mt-1 text-xs text-slate-300">Assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-t border-white/10 bg-[#091522]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              One operational picture
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              From scattered signals to coordinated safety intelligence.
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              SentinelX is designed to bring multiple sources of safety data
              together so communities and authorities can understand what is
              happening and act with better context.
            </p>
          </div>

          <div
            id="intelligence"
            className="mt-14 grid gap-4 md:grid-cols-2"
          >
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
                    {feature.number}
                  </span>
                  <span className="text-slate-700 transition group-hover:text-cyan-300">
                    ↗
                  </span>
                </div>

                <h3 className="mt-10 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 max-w-lg leading-7 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="response" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.035] p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Built for response
            </p>

            <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  A foundation for safer, faster and more informed decisions.
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-slate-400">
                  The platform will connect citizen intelligence, connected
                  infrastructure and AI-assisted analysis into a unified
                  operational workflow.
                </p>
              </div>

              <Link
                href="/"
                className="rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Start with SentinelX
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 SentinelX. Safety intelligence platform.</p>
          <p>AI • GIS • IoT • Real-time intelligence</p>
        </div>
      </footer>
    </main>
  );
}
