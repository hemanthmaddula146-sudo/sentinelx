"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

const incidentTypes = [
  "flood",
  "fire",
  "pothole",
  "garbage",
  "pollution",
  "landslide",
  "other",
];

export default function ReportPage() {
  const router = useRouter();
  const [incidentType, setIncidentType] = useState("flood");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);
const [locationStatus, setLocationStatus] = useState("");
const [imageFile, setImageFile] = useState<File | null>(null);
const [imageStatus, setImageStatus] = useState("");
const [imagePath, setImagePath] = useState<string | null>(null);
function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) {
    setImageFile(null);
    setImageStatus("");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    setImageFile(null);
    setImageStatus("Please select a JPG, PNG, or WEBP image.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setImageFile(null);
    setImageStatus("Image must be smaller than 10 MB.");
    return;
  }

  setImageFile(file);
  setImageStatus(`Selected: ${file.name}`);
}
async function uploadIncidentImage() {
  if (!imageFile) {
    setImageStatus("Please select an image first.");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setImageStatus("Please sign in before uploading an image.");
    return;
  }

  setImageStatus("Uploading image...");

  const fileExtension = imageFile.name.split(".").pop()?.toLowerCase();
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  const filePath = `${user.id}/${fileName}`;

  const { error } = await supabase.storage
    .from("incident-images")
    .upload(filePath, imageFile);

  if (error) {
  setImageStatus(`Upload failed: ${error.message}`);
  return;
}

setImagePath(filePath);
setImageStatus("Image uploaded successfully.");
}
async function submitIncident() {
      if (!title.trim()) {
    alert("Please enter an incident title.");
    return;
  }
    if (latitude === null || longitude === null) {
    alert("Please capture your current location.");
    return;
  }
    const {
    data: { user },
  } = await supabase.auth.getUser();
    if (!user) {
    alert("Please sign in before submitting an incident.");
    return;
  }
  const { error } = await supabase.from("incidents").insert({
  reporter_id: user.id,
  incident_type: incidentType,
  title: title.trim(),
  description: description.trim() || null,
  latitude,
  longitude,
  image_url: imagePath,
});
if (error) {
  alert(`Incident submission failed: ${error.message}`);
  return;
}
alert("Incident reported successfully.");
}
function getLocation() {
  if (!navigator.geolocation) {
    setLocationStatus("Location is not supported by this browser.");
    return;
  }

  setLocationStatus("Getting your location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setLocationStatus("Location captured successfully.");
    },
    () => {
      setLocationStatus(
        "Unable to get your location. Please allow location access."
      );
    }
  );
}

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
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
          Report an Incident
        </h1>

        <p className="mt-3 text-slate-400">
          Help your community by reporting a safety or environmental incident.
        </p>

        <div className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Incident type
            </label>

            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              {incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Incident title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Water level rising near road"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is happening..."
              rows={6}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div className="rounded-xl border border-dashed border-white/20 p-6">
  <p className="font-medium">Incident image</p>

  <p className="mt-1 text-sm text-slate-500">
    Upload a JPG, PNG, or WEBP image. Maximum size: 10 MB.
  </p>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageChange}
    className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-cyan-300"
  />

  {imageStatus && (
    <p className="mt-3 text-sm text-slate-300">
      {imageStatus}
    </p>
  )}

  {imageFile && (
    <p className="mt-2 text-sm text-cyan-400">
      ✓ Image ready for upload
    </p>
  )}
  {imageFile && (
  <button
    type="button"
    onClick={uploadIncidentImage}
    className="mt-4 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
  >
    Upload Image
  </button>
)}
</div>

          <div className="rounded-xl border border-dashed border-white/20 p-6">
  <p className="font-medium">Location</p>

  <p className="mt-1 text-sm text-slate-500">
    Capture your current GPS location for this incident.
  </p>

  <button
    type="button"
    onClick={getLocation}
    className="mt-4 rounded-xl border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/10"
  >
    📍 Use my current location
  </button>

  {locationStatus && (
    <p className="mt-3 text-sm text-slate-300">
      {locationStatus}
    </p>
  )}

  {latitude !== null && longitude !== null && (
    <div className="mt-3 text-sm text-slate-400">
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
    </div>
  )}
</div>

          <button
            type="button"
            onClick={submitIncident}
            className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Submit Incident
          </button>
        </div>
      </div>
    </main>
  );
}