"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Incident = {
  id: string;
  incident_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export default function AuthorityPage() {
    const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] =
  useState<Incident | null>(null);

const [aiAnalysis, setAiAnalysis] = useState("");
const [visionAnalysis, setVisionAnalysis] = useState("");
const [aiLoading, setAiLoading] = useState(false);
const [riskLoading, setRiskLoading] = useState<string | null>(null);
const [riskResult, setRiskResult] = useState<{
  score: number;
  level: string;
} | null>(null);

  async function loadIncidents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("incidents")
      .select(
        "id, incident_type, title, description, image_url, severity, status, latitude, longitude, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load incidents:", error);
      setLoading(false);
      return;
    }

    setIncidents(data ?? []);
    setLoading(false);
  }

 
    async function analyzeIncident(incident: Incident) {
  setSelectedIncident(incident);
  setAiAnalysis("");
  setAiLoading(true);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAiAnalysis("Your login session has expired.");
      return;
    }

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Analyze this SentinelX community incident for an authority.

Incident type: ${incident.incident_type}
Title: ${incident.title}
Description: ${incident.description ?? "No description"}
Severity: ${incident.severity}
Status: ${incident.status}
Location: ${incident.latitude}, ${incident.longitude}

Give:
1. Risk assessment
2. Possible impact
3. Recommended authority action
4. Immediate safety advice`,

        accessToken: session.access_token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAiAnalysis(data.error ?? "AI analysis failed.");
      return;
    }

    setAiAnalysis(data.reply ?? "No analysis generated.");
  } catch (error) {
    console.error("Incident AI analysis error:", error);
    setAiAnalysis("Unable to connect to SentinelX AI.");
  } finally {
    setAiLoading(false);
  }
}
async function analyzeIncidentImage(incident: Incident) {
  setSelectedIncident(incident);
  setVisionAnalysis("");
  setAiLoading(true);

  try {
    if (!incident.image_url) {
      setVisionAnalysis("This incident does not have an uploaded image.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setVisionAnalysis("Your login session has expired.");
      return;
    }

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Analyze the uploaded image associated with this SentinelX incident.

Incident type: ${incident.incident_type}
Title: ${incident.title}
Description: ${incident.description ?? "No description"}
Severity: ${incident.severity}
Image URL: ${incident.image_url}

Provide:
1. Visible hazards or conditions
2. Possible safety impact
3. Estimated visual severity
4. Recommended authority action

Be careful not to invent visual details. If the image cannot be directly inspected, clearly say so.`,
        accessToken: session.access_token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setVisionAnalysis(data.error ?? "Image analysis failed.");
      return;
    }

    setVisionAnalysis(data.reply ?? "No image analysis generated.");
  } catch (error) {
    console.error("Vision analysis error:", error);
    setVisionAnalysis("Unable to connect to SentinelX AI.");
  } finally {
    setAiLoading(false);
  }
}
async function calculateRisk(incident: Incident) {
  setSelectedIncident(incident);
  setRiskLoading(incident.id);
  setRiskResult(null);

  try {
    // ---------------------------------------------------------
    // BASE RISK FROM INCIDENT SEVERITY
    // ---------------------------------------------------------

    let riskScore = 20;

    if (incident.severity === "medium") {
      riskScore = 45;
    }

    if (incident.severity === "high") {
      riskScore = 70;
    }

    if (incident.severity === "critical") {
      riskScore = 90;
    }

    // ---------------------------------------------------------
    // INCIDENT TYPE CONTRIBUTION
    // ---------------------------------------------------------

    let incidentTypeScore = 0;

    if (
      incident.incident_type === "flood" ||
      incident.incident_type === "fire" ||
      incident.incident_type === "landslide"
    ) {
      incidentTypeScore = 10;
    } else if (
      incident.incident_type === "pollution" ||
      incident.incident_type === "garbage"
    ) {
      incidentTypeScore = 5;
    }

    riskScore += incidentTypeScore;

    // ---------------------------------------------------------
    // LOAD SENSOR INFORMATION
    // ---------------------------------------------------------

    const { data: sensors, error: sensorError } =
      await supabase
        .from("sensors")
        .select("id, sensor_type, name");

    if (sensorError) {
      console.error(
        "Sensor loading error:",
        sensorError
      );
    }

    // ---------------------------------------------------------
    // LOAD RECENT SENSOR READINGS
    // ---------------------------------------------------------

    const { data: sensorReadings, error: readingError } =
      await supabase
        .from("sensor_readings")
        .select(
          "sensor_id, value, unit, recorded_at"
        )
        .order("recorded_at", {
          ascending: false,
        })
        .limit(100);

    if (readingError) {
      console.error(
        "Sensor reading error:",
        readingError
      );
    }

    // ---------------------------------------------------------
    // FIND LATEST READING FOR EACH SENSOR
    // ---------------------------------------------------------

    const latestReadings: Record<
      string,
      {
        value: number;
        unit: string;
        recorded_at: string;
      }
    > = {};

    for (const reading of sensorReadings ?? []) {
      if (!latestReadings[reading.sensor_id]) {
        latestReadings[reading.sensor_id] = {
          value: reading.value,
          unit: reading.unit,
          recorded_at: reading.recorded_at,
        };
      }
    }

    // ---------------------------------------------------------
    // ENVIRONMENTAL RISK CONTRIBUTION
    // ---------------------------------------------------------

    let environmentalScore = 0;

    const environmentalFactors: Record<
      string,
      unknown
    > = {};

    for (const sensor of sensors ?? []) {
      const reading =
        latestReadings[sensor.id];

      if (!reading) {
        continue;
      }

      // Water level
      if (
        sensor.sensor_type ===
        "water_level"
      ) {
        environmentalFactors.water_level = {
          sensor: sensor.name,
          value: reading.value,
          unit: reading.unit,
        };

        if (reading.value >= 4) {
          environmentalScore += 20;
        } else if (reading.value >= 3.5) {
          environmentalScore += 15;
        } else if (reading.value >= 3) {
          environmentalScore += 10;
        }
      }

      // Rainfall
      if (
        sensor.sensor_type ===
        "rainfall"
      ) {
        environmentalFactors.rainfall = {
          sensor: sensor.name,
          value: reading.value,
          unit: reading.unit,
        };

        if (reading.value >= 50) {
          environmentalScore += 20;
        } else if (reading.value >= 30) {
          environmentalScore += 15;
        } else if (reading.value >= 20) {
          environmentalScore += 10;
        }
      }

      // Air quality
      if (
        sensor.sensor_type ===
        "air_quality"
      ) {
        environmentalFactors.air_quality = {
          sensor: sensor.name,
          value: reading.value,
          unit: reading.unit,
        };

        if (reading.value >= 200) {
          environmentalScore += 20;
        } else if (reading.value >= 150) {
          environmentalScore += 15;
        } else if (reading.value >= 100) {
          environmentalScore += 5;
        }
      }
    }

    riskScore += environmentalScore;

    // Never allow a score above 100.
    riskScore = Math.min(
      100,
      Math.round(riskScore)
    );

    // ---------------------------------------------------------
    // DETERMINE RISK LEVEL
    // ---------------------------------------------------------

    const riskLevel =
      riskScore >= 80
        ? "critical"
        : riskScore >= 60
          ? "high"
          : riskScore >= 30
            ? "medium"
            : "low";

    // ---------------------------------------------------------
    // SAVE RISK ASSESSMENT
    // ---------------------------------------------------------

    const { error: insertError } =
      await supabase
        .from("risk_assessments")
        .insert({
          incident_id: incident.id,
          risk_score: riskScore,
          risk_level: riskLevel,
          model_name:
            "SentinelX Multi-Factor Risk Engine",
          model_version: "2.0",
          explanation:
            "Risk score combines incident severity, incident type, and available environmental sensor readings.",
          contributing_factors: {
            incident_severity:
              incident.severity,

            incident_type:
              incident.incident_type,

            incident_type_score:
              incidentTypeScore,

            environmental_score:
              environmentalScore,

            environmental_factors:
              environmentalFactors,
          },
        });

    if (insertError) {
      console.error(
        "Risk assessment insert error:",
        insertError
      );

      return;
    }

    // ---------------------------------------------------------
    // DISPLAY RESULT
    // ---------------------------------------------------------

    setRiskResult({
      score: riskScore,
      level: riskLevel,
    });
  } catch (error) {
    console.error(
      "Risk calculation error:",
      error
    );
  } finally {
    setRiskLoading(null);
  }
}
 useEffect(() => {
  loadIncidents();
}, []);



  const criticalCount = incidents.filter(
    (incident) => incident.severity === "critical"
  ).length;

  const highCount = incidents.filter(
    (incident) => incident.severity === "high"
  ).length;

  const activeCount = incidents.filter(
    (incident) =>
      incident.status !== "resolved" && incident.status !== "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
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
          <p className="text-sm font-medium text-cyan-400">
            SENTINELX COMMAND CENTER
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Authority Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Monitor community incidents, identify high-risk situations,
            and coordinate emergency response.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Total Incidents</p>
            <p className="mt-2 text-3xl font-bold">{incidents.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Active Incidents</p>
            <p className="mt-2 text-3xl font-bold">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-orange-400/20 bg-orange-400/5 p-6">
            <p className="text-sm text-orange-300">High Risk</p>
            <p className="mt-2 text-3xl font-bold">{highCount}</p>
          </div>

          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
            <p className="text-sm text-red-300">Critical</p>
            <p className="mt-2 text-3xl font-bold">{criticalCount}</p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-cyan-400">
              LIVE INCIDENT FEED
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Community Incidents
            </h2>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p className="text-slate-400">
              No incidents have been reported yet.
            </p>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {incident.title}
                        </h3>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
                          {incident.incident_type}
                        </span>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase">
                          {incident.severity}
                        </span>
                      </div>

                      {incident.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {incident.description}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        Location: {incident.latitude.toFixed(5)},{" "}
                        {incident.longitude.toFixed(5)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Reported:{" "}
                        {new Date(incident.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="shrink-0">
  <select
    value={incident.status}
    onChange={async (event) => {
      const newStatus = event.target.value;

      const { error } = await supabase
        .from("incidents")
        .update({ status: newStatus })
        .eq("id", incident.id);

      if (error) {
        console.error("Failed to update incident:", error);
        return;
      }

      setIncidents((current) =>
        current.map((item) =>
          item.id === incident.id
            ? { ...item, status: newStatus }
            : item
        )
      );
    }}
    className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300 outline-none"
  >
    <option value="reported">Reported</option>
    <option value="verified">Verified</option>
    <option value="in_progress">In Progress</option>
    <option value="resolved">Resolved</option>
    <option value="rejected">Rejected</option>
  </select>
  <button
  type="button"
  onClick={() => analyzeIncident(incident)}
  className="mt-3 block w-full rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
>
  Analyze with AI
  </button>
  <button
  type="button"
  onClick={() => analyzeIncidentImage(incident)}
  className="mt-3 block w-full rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
>
  Analyze Image with AI
</button>
  <button
  type="button"
  onClick={() => calculateRisk(incident)}
  disabled={riskLoading === incident.id}
  className="mt-2 block w-full rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
>
  {riskLoading ? "Calculating..." : "Calculate Risk"}
</button>
{selectedIncident?.id === incident.id && riskResult && (
  <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
    <p className="text-xs font-medium text-cyan-400">
      Risk Assessment
    </p>

    <p className="mt-2 text-lg font-semibold text-white">
      {riskResult.score}/100
    </p>

    <p className="mt-1 text-xs uppercase text-slate-400">
      {riskResult.level} risk
    </p>
  </div>
)}

</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {aiAnalysis && (
  <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5">
    <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
      SentinelX AI Incident Analysis
    </p>

    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
      {aiAnalysis}
    </p>
  </div>
)}
{visionAnalysis && (
  <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/70 shadow-xl">
    <div className="border-b border-white/10 bg-cyan-400/5 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
            SentinelX Intelligence
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Computer Vision Analysis
          </h3>
        </div>

        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Gemini Vision
        </div>
      </div>
    </div>

    <div className="p-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          AI Assessment
        </p>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {visionAnalysis}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-500">Analysis Type</p>
          <p className="mt-1 text-sm font-medium text-white">
            Visual Hazard Detection
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-500">AI Engine</p>
          <p className="mt-1 text-sm font-medium text-white">
            Gemini Vision
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-500">Decision Support</p>
          <p className="mt-1 text-sm font-medium text-white">
            Authority Response
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
          Safety Notice
        </p>

        <p className="mt-2 text-xs leading-6 text-slate-400">
          AI analysis is decision support only. Authorities should verify
          critical conditions through appropriate field inspection and
          emergency procedures.
        </p>
      </div>
    </div>
  </div>
)}
        </section>
      </div>
    </main>
  );
}