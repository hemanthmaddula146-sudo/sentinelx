"use client";
import dynamic from "next/dynamic";

const SafetyMap = dynamic(() => import("../components/SafetyMap"), {
  ssr: false,
});

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Profile = {
  full_name: string | null;
  role: "citizen" | "authority";
};
type Incident = {
  id: string;
  incident_type: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [selectedIncident, setSelectedIncident] =
  useState<Incident | null>(null);
  const [aiMessage, setAiMessage] = useState("");
const [aiReply, setAiReply] = useState("");
const [aiLoading, setAiLoading] = useState(false);
async function askAI() {
  if (!aiMessage.trim()) return;

  setAiLoading(true);
  setAiReply("");

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setAiReply("Your login session has expired. Please sign in again.");
      return;
    }

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: aiMessage,
        accessToken: session.access_token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAiReply(data.error ?? "AI request failed.");
      return;
    }

    setAiReply(data.reply ?? "No response generated.");
  } catch (error) {
    console.error("AI assistant error:", error);
    setAiReply("Unable to connect to SentinelX AI.");
  } finally {
    setAiLoading(false);
  }
}

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      const { count: incidents } = await supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("reporter_id", user.id);

      const { data: alertData, error: alertError } = await supabase
  .from("alerts")
  .select(
    "id, title, message, alert_type, severity, is_read, created_at"
  )
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
  if (alertError) {
  console.error("Failed to load alerts:", alertError);
}

const unreadAlerts = (alertData ?? []).filter(
  (alert) => !alert.is_read
).length;

setAlerts(alertData ?? []);
setAlertCount(unreadAlerts);
        const { data: incidentData } = await supabase
  .from("incidents")
  .select(
    "id, incident_type, title, description, severity, status, latitude, longitude, image_url, created_at"
  )
  .eq("reporter_id", user.id)
  .order("created_at", { ascending: false });
  const signedUrls: Record<string, string> = {};

for (const incident of incidentData ?? []) {
  if (incident.image_url) {
    const { data: signedUrlData } = await supabase.storage
      .from("incident-images")
      .createSignedUrl(incident.image_url, 3600);

    if (signedUrlData?.signedUrl) {
      signedUrls[incident.id] = signedUrlData.signedUrl;
    }
  }
}

setImageUrls(signedUrls);

      setProfile(profileData);
      setIncidents(incidentData ?? []);
      setReportCount(incidents ?? 0);
    setAlertCount(unreadAlerts);
     
      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading SentinelX...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
  <button
    type="button"
   onClick={() => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}}
    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
  >
    <span aria-hidden="true">←</span>
    Back
  </button>
</div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
          SentinelX
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Community Safety Dashboard
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
  <a
    href="/dashboard"
    className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
  >
    Community Dashboard
  </a>

  <a
    href="/report"
    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
  >
    Report Incident
  </a>

  <a
    href="/sensors"
    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
  >
    Sensors / IoT
  </a>

  <a
    href="/authority"
    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
  >
    Authority Dashboard
  </a>
</div>

        <p className="mt-3 text-slate-400">
          Welcome, {profile?.full_name || "Citizen"}.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">My Reports</p>
            <p className="mt-3 text-3xl font-bold">{reportCount}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Unread Alerts</p>
            <p className="mt-3 text-3xl font-bold">{alertCount}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Risk Assessment</p>
            <p className="mt-3 text-3xl font-bold text-slate-300">
              No assessment
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Account Role</p>
            <p className="mt-3 text-3xl font-bold text-cyan-400">
              {profile?.role || "citizen"}
            </p>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
  <h2 className="text-2xl font-semibold">My Recent Reports</h2>

  <p className="mt-2 text-slate-400">
    Your latest community safety incidents.
  </p>
  {incidents.length === 0 && (
  <p className="mt-6 text-sm text-slate-500">
    No incidents reported yet.
  </p>
)}
{incidents.length > 0 && (
  <div className="mt-6 space-y-4">
    {incidents.map((incident) => (
      <div
        key={incident.id}
        className="rounded-xl border border-white/10 bg-black/20 p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{incident.title}</h3>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">
            {incident.status}
          </span>
        </div>
        {imageUrls[incident.id] && (
  <img
    src={imageUrls[incident.id]}
    alt={incident.title}
    className="mt-4 h-48 w-full rounded-xl object-cover"
  />
)}

        <p className="mt-2 text-sm capitalize text-cyan-400">
          {incident.incident_type}
        </p>
       <span
  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
    incident.severity === "critical"
      ? "bg-red-500/20 text-red-400"
      : incident.severity === "high"
        ? "bg-orange-500/20 text-orange-400"
        : incident.severity === "medium"
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-green-500/20 text-green-400"
  }`}
>
  {incident.severity}
</span>

        {incident.description && (
          <p className="mt-2 text-sm text-slate-400">
            {incident.description}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-500">
          {new Date(incident.created_at).toLocaleString()}
        </p>
        <a
  href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-2 block text-xs text-cyan-400 hover:text-cyan-300"
>
  📍 View incident location
</a>
<button
  type="button"
  onClick={() => setSelectedIncident(incident)}
  className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
>
  View Details
</button>
      </div>
    ))}
  </div>
)}
</div>
<section className="mt-8">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
        SentinelX Response Center
      </p>

      <h2 className="mt-1 text-2xl font-semibold text-white">
        Recent Alerts
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Real-time safety notifications generated by incidents and
        environmental monitoring.
      </p>
    </div>

    {alertCount > 0 && (
      <div className="w-fit rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-300">
        {alertCount} unread alert{alertCount === 1 ? "" : "s"}
      </div>
    )}
  </div>

  <div className="mt-6 space-y-4">
    {alerts.length === 0 ? (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-medium text-white">
          No active alerts
        </p>

        <p className="mt-1 text-sm text-slate-500">
          SentinelX will display important safety notifications here.
        </p>
      </div>
    ) : (
      alerts.map((alert) => (
        <div
          key={alert.id}
          className={`overflow-hidden rounded-2xl border p-5 transition ${
            !alert.is_read
              ? "border-cyan-400/20 bg-cyan-400/[0.04]"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                  alert.severity === "critical"
                    ? "border-red-400/30 bg-red-400/10 text-red-300"
                    : alert.severity === "high"
                      ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
                      : alert.severity === "medium"
                        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                        : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                }`}
              >
                !
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">
                    {alert.title}
                  </h3>

                  {!alert.is_read && (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                      New
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 capitalize text-slate-300">
                    {alert.alert_type}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 capitalize ${
                      alert.severity === "critical"
                        ? "border-red-400/20 bg-red-400/10 text-red-300"
                        : alert.severity === "high"
                          ? "border-orange-400/20 bg-orange-400/10 text-orange-300"
                          : alert.severity === "medium"
                            ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
                            : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                    }`}
                  >
                    {alert.severity} severity
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-sm leading-6 text-slate-300">
              {alert.message}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-xs text-slate-500">
              SentinelX automated safety notification
            </p>

            <span
              className={`text-xs font-medium ${
                alert.is_read
                  ? "text-slate-500"
                  : "text-cyan-300"
              }`}
            >
              {alert.is_read ? "Read" : "Requires attention"}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
</section>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-semibold">Safety Overview</h2>
          <div className="mt-6">
  <SafetyMap />
</div>

          <p className="mt-2 text-slate-400">
            Your real-time SentinelX safety intelligence will appear here as
            incidents, alerts, sensors, and risk assessments become available.
          </p>
        </div>
      </div>
      {selectedIncident && (
  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Incident Details</h2>

      <button
        type="button"
        onClick={() => setSelectedIncident(null)}
        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 hover:bg-white/5"
      >
        Close
      </button>
    </div>

    <h3 className="mt-6 text-xl font-semibold">
      {selectedIncident.title}
    </h3>
    {imageUrls[selectedIncident.id] && (
  <img
    src={imageUrls[selectedIncident.id]}
    alt={selectedIncident.title}
    className="mt-4 h-64 w-full rounded-xl object-cover"
  />
)}

    <p className="mt-2 capitalize text-cyan-400">
      {selectedIncident.incident_type}
    </p>

    <p className="mt-4 text-slate-400">
      {selectedIncident.description || "No description provided."}
    </p>

    <p className="mt-4 text-sm text-slate-500">
      Status: {selectedIncident.status}
    </p>

    <p className="mt-2 text-sm text-slate-500">
      Severity: {selectedIncident.severity}
    </p>
  </div>
  )}
  <section className="mt-8">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <div>
      <p className="text-sm font-medium text-cyan-400">
        SentinelX Intelligence
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        AI Emergency Assistant
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Ask SentinelX AI about emergency situations, safety risks,
        incidents, or what actions you should take.
      </p>
    </div>

    <div className="mt-6">
      <textarea
        value={aiMessage}
        onChange={(event) => setAiMessage(event.target.value)}
        placeholder="Example: What should I do if flood water is entering my street?"
        className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />
    </div>

    <button
      type="button"
      onClick={askAI}
      disabled={aiLoading || !aiMessage.trim()}
      className="mt-4 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {aiLoading ? "Thinking..." : "Ask SentinelX AI"}
    </button>

    {aiReply && (
      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
          SentinelX AI
        </p>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {aiReply}
        </p>
      </div>
    )}
  </div>
</section>
    </main>
  );
}