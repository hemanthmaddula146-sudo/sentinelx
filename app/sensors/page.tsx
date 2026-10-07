"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Sensor = {
  id: string;
  name: string;
  sensor_type: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Reading = {
  sensor_id: string;
  value: number;
  unit: string;
  recorded_at: string;
};

export default function SensorsPage() {
    const router = useRouter();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<Record<string, Reading>>({});
  const [loading, setLoading] = useState(true);
const [floodRisk, setFloodRisk] = useState<{
  score: number;
  level: string;
} | null>(null);
const [anomaly, setAnomaly] = useState<{
  detected: boolean;
  message: string;
} | null>(null);
  useEffect(() => {
    async function loadSensors() {
      setLoading(true);

      const { data: sensorData, error: sensorError } = await supabase
        .from("sensors")
       .select("*")
        
        .order("name");

      if (sensorError) {
        console.error("Failed to load sensors:", sensorError);
        setLoading(false);
        return;
      }

      setSensors(sensorData ?? []);

      const { data: readingData, error: readingError } = await supabase
        .from("sensor_readings")
        .select("sensor_id, value, unit, recorded_at")
        .order("recorded_at", { ascending: false });

      if (readingError) {
        console.error("Failed to load sensor readings:", readingError);
        setLoading(false);
        return;
      }

      const latest: Record<string, Reading> = {};

      for (const reading of readingData ?? []) {
        if (!latest[reading.sensor_id]) {
          latest[reading.sensor_id] = reading;
        }
      }

      setReadings(latest);
      setLoading(false);
    }

    loadSensors();
    const channel = supabase
  .channel("sentinelx-sensor-readings")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "sensor_readings",
    },
    () => {
      loadSensors();
    }
  )
  .subscribe();
  return () => {
  supabase.removeChannel(channel);
};
  }, []);
  function calculateFloodRisk() {
      const waterLevel =
    Object.values(readings).find(
      (reading) => reading.unit === "meters"
    )?.value ?? 0;

  const rainfall =
    Object.values(readings).find(
      (reading) => reading.unit === "mm/hr"
    )?.value ?? 0;
      const score = Math.min(
    100,
    Math.round(waterLevel * 20 + rainfall * 2)
  );
    const level =
    score >= 80
      ? "critical"
      : score >= 60
        ? "high"
        : score >= 30
          ? "medium"
          : "low";
            setFloodRisk({
    score,
    level,
  });
    }
    function detectAnomaly() {
          const waterLevel =
    Object.values(readings).find(
      (reading) => reading.unit === "meters"
    )?.value ?? 0;

  const rainfall =
    Object.values(readings).find(
      (reading) => reading.unit === "mm/hr"
    )?.value ?? 0;
      const detected =
    waterLevel >= 3.5 || rainfall >= 30;

  setAnomaly({
    detected,
    message: detected
      ? "Unusual environmental conditions detected."
      : "No significant anomaly detected.",
  });
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
        <p className="text-sm font-medium text-cyan-400">
          SentinelX Intelligence
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Sensor & IoT Monitoring
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Real-time environmental telemetry and community safety sensor data.
        </p>

        {loading ? (
          <div className="mt-10 text-slate-400">
            Loading sensor data...
          </div>
        ) : sensors.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="text-lg font-medium">No sensors configured</p>
            <p className="mt-2 text-sm text-slate-400">
              SentinelX is ready to receive sensor telemetry.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sensors.map((sensor) => {
              const reading = readings[sensor.id];

              return (
                <div
                  key={sensor.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">
                        {sensor.name}
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wider text-cyan-400">
                        {sensor.sensor_type}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      Online
                    </span>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs text-slate-500">
                      Latest Reading
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                      {reading
                        ? `${reading.value} ${reading.unit}`
                        : "No data"}
                    </p>

                    {reading && (
                      <p className="mt-2 text-xs text-slate-500">
                        Updated{" "}
                        {new Date(
                          reading.recorded_at
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {sensor.location_name && (
                    <p className="mt-5 text-sm text-slate-400">
                      📍 {sensor.location_name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
  <p className="text-sm font-medium text-cyan-400">
    SentinelX Intelligence
  </p>

  <h2 className="mt-2 text-2xl font-semibold">
    Flood Risk Prediction
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    Estimate flood risk using current water-level and rainfall telemetry.
  </p>

  <button
    type="button"
    onClick={calculateFloodRisk}
    className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
  >
    Calculate Flood Risk
    
  </button>
  <button
  type="button"
  onClick={detectAnomaly}
  className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/20"
>
  Detect Anomaly
</button>
{anomaly && (
  <div className="mt-6 rounded-xl border border-cyan-400/20 bg-black/20 p-5">
    <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
      Anomaly Detection
    </p>

    <p className="mt-3 text-lg font-semibold">
      {anomaly.detected ? "⚠️ Anomaly Detected" : "✓ Normal Conditions"}
    </p>

    <p className="mt-2 text-sm text-slate-400">
      {anomaly.message}
    </p>
  </div>
)}
  {floodRisk && (
  <div className="mt-6 rounded-xl border border-cyan-400/20 bg-black/20 p-5">
    <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
      Current Flood Risk
    </p>

    <p className="mt-2 text-3xl font-semibold">
      {floodRisk.score}/100
    </p>

    <p className="mt-2 text-sm font-semibold uppercase text-cyan-300">
      {floodRisk.level} risk
    </p>
  </div>
)}
</div>
    </main>
  );
}