"use client";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { supabase } from "../lib/supabase";
import "leaflet/dist/leaflet.css";
function MapController({
  incidents,
}: {
  incidents: any[];
}) {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      map.setView(
        [incidents[0].latitude, incidents[0].longitude],
        14
      );
    }
  }, [incidents, map]);

  return null;
}
export default function SafetyMap() {
    const [incidents, setIncidents] = useState<any[]>([]);
    useEffect(() => {
  async function loadIncidents() {
    const { data, error } = await supabase
      .from("incidents")
      .select("id, title, incident_type, severity, latitude, longitude");

    if (error) {
      console.error("Failed to load incidents:", error);
      return;
    }

    setIncidents(data ?? []);
  }

  loadIncidents();
  const channel = supabase
  .channel("sentinelx-incidents")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "incidents",
    },
    () => {
      loadIncidents();
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};
}, []);
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-white/10">
      <MapContainer
        center={[16.6857, 81.0268]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapController incidents={incidents} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) => (
  <Marker
    key={incident.id}
    position={[incident.latitude, incident.longitude]}
  >
    <Popup>
      <strong>{incident.title}</strong>
      <br />
      Type: {incident.incident_type}
      <br />
      Severity: {incident.severity}
    </Popup>
  </Marker>
))}
      </MapContainer>
    </div>
  );
}