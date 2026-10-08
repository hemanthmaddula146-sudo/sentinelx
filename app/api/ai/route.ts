import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";

async function callGemini(
  model: string,
  apiKey: string,
  parts: GeminiPart[]
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      }),
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`GEMINI_${response.status}:${responseText}`);
  }

  const data = JSON.parse(responseText);

  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim() || "No response generated."
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    const accessToken =
      typeof body.accessToken === "string" ? body.accessToken : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication token is required." },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // ENVIRONMENT VARIABLES
    // ---------------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !publishableKey) {
      return NextResponse.json(
        { error: "Supabase configuration is missing." },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Server Supabase configuration is incomplete. Please configure the service role key.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // AUTHENTICATED CLIENT
    // Used ONLY to verify the supplied user session.
    // ---------------------------------------------------------

    const authSupabase = createClient(
      supabaseUrl,
      publishableKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your session is invalid. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // SERVER-ONLY ADMIN CLIENT
    //
    // IMPORTANT:
    // This key must NEVER be exposed to browser/client code.
    // ---------------------------------------------------------

    const adminSupabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // ---------------------------------------------------------
    // VERIFY USER ROLE
    // ---------------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "Profile verification error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify your SentinelX account.",
        },
        { status: 403 }
      );
    }

    const isAuthority =
      profile.role === "authority";

    // ---------------------------------------------------------
    // LOAD INCIDENT DATA
    //
    // Authority: community incidents
    // Citizen: only their own incidents
    // ---------------------------------------------------------

    let incidentQuery = adminSupabase
      .from("incidents")
      .select(
        "id, reporter_id, incident_type, title, description, severity, status, latitude, longitude, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (!isAuthority) {
      incidentQuery =
        incidentQuery.eq(
          "reporter_id",
          user.id
        );
    }

    const {
      data: incidents,
      error: incidentsError,
    } = await incidentQuery;

    if (incidentsError) {
      console.error(
        "Incident query error:",
        incidentsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load SentinelX incident data.",
        },
        { status: 500 }
      );
    }

    const incidentContext =
      (incidents ?? []).map((incident) => ({
        id: incident.id,
        type: incident.incident_type,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        latitude: incident.latitude,
        longitude: incident.longitude,
        reported_at: incident.created_at,
      }));

    // ---------------------------------------------------------
    // COMPUTER VISION
    // ---------------------------------------------------------

    let imageBase64: string | null = null;
    let imageMimeType = "image/jpeg";
    let imageProcessed = false;

    const imageMatch =
      message.match(/Image URL:\s*(.+)/i);

    if (imageMatch) {
      const imageReference =
        imageMatch[1].trim();

      try {
        let imageUrl = imageReference;

        // If imageReference is a private Storage path,
        // create the signed URL server-side.
        if (
          !imageReference.startsWith("http://") &&
          !imageReference.startsWith("https://")
        ) {
          const cleanPath =
            imageReference.replace(/^\/+/, "");

          const {
            data: signedUrlData,
            error: signedUrlError,
          } = await adminSupabase.storage
            .from("incident-images")
            .createSignedUrl(cleanPath, 300);

          if (
            signedUrlError ||
            !signedUrlData?.signedUrl
          ) {
            console.error(
              "Signed URL error:",
              signedUrlError
            );

            return NextResponse.json(
              {
                error:
                  "Unable to securely access the incident image.",
              },
              { status: 400 }
            );
          }

          imageUrl =
            signedUrlData.signedUrl;
        }

        // -----------------------------------------------------
        // DOWNLOAD IMAGE
        // -----------------------------------------------------

        const imageResponse =
          await fetch(imageUrl);

        if (!imageResponse.ok) {
          console.error(
            "Image download failed:",
            imageResponse.status,
            imageResponse.statusText
          );

          return NextResponse.json(
            {
              error:
                "Unable to download the incident image.",
            },
            { status: 400 }
          );
        }

        const contentType =
          imageResponse.headers.get(
            "content-type"
          ) || "image/jpeg";

        if (
          !contentType.startsWith("image/")
        ) {
          return NextResponse.json(
            {
              error:
                "The uploaded file is not a valid image.",
            },
            { status: 400 }
          );
        }

        imageMimeType =
          contentType
            .split(";")[0]
            .trim();

        const imageBuffer =
          await imageResponse.arrayBuffer();

        if (imageBuffer.byteLength === 0) {
          return NextResponse.json(
            {
              error:
                "The uploaded image is empty.",
            },
            { status: 400 }
          );
        }

        imageBase64 =
          Buffer.from(
            imageBuffer
          ).toString("base64");

        imageProcessed = true;

        console.log(
          "SentinelX Computer Vision: image loaded."
        );
      } catch (imageError) {
        console.error(
          "Image processing error:",
          imageError
        );

        return NextResponse.json(
          {
            error:
              "Unable to process the incident image.",
          },
          { status: 500 }
        );
      }
    }

    // ---------------------------------------------------------
    // SENTINELX AI PROMPT
    // ---------------------------------------------------------

    const prompt = `
You are SentinelX AI, an emergency and community safety
intelligence assistant.

SentinelX is an AI-powered real-time community safety platform.

RULES:
- Be professional, concise, factual, and safety-focused.
- Never invent facts or visual details.
- Clearly separate observations from assumptions.
- Never claim to contact emergency services or authorities.
- Protect personal information.
- Never reveal API keys, passwords, access tokens, or secrets.
- For immediate danger, advise contacting appropriate local
  emergency services.

If an image is provided, analyze only what is genuinely visible.

For image analysis use:

VISUAL OBSERVATIONS
- Clearly visible conditions.

SAFETY HAZARDS
- Visible hazards.

POSSIBLE IMPACT
- Potential effect on people, infrastructure, traffic,
  or the environment.

VISUAL SEVERITY
- LOW / MEDIUM / HIGH / CRITICAL.
- Briefly explain why.

RECOMMENDED AUTHORITY ACTION
- Practical response and verification steps.

LIMITATIONS
- What cannot be confirmed from the image.

If no image is provided, answer the user's question normally.

CURRENT SENTINELX INCIDENT DATA:
${JSON.stringify(
  incidentContext,
  null,
  2
)}

USER REQUEST:
${message}
`;

    const parts: GeminiPart[] = [
      {
        text: prompt,
      },
    ];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      });
    }

    // ---------------------------------------------------------
    // PRIMARY GEMINI MODEL
    // ---------------------------------------------------------

    try {
      const reply =
        await callGemini(
          PRIMARY_MODEL,
          apiKey,
          parts
        );

      return NextResponse.json({
        reply,
        computerVision:
          imageProcessed,
        model: PRIMARY_MODEL,
      });
    } catch (primaryError) {
      const errorMessage =
        String(primaryError);

      console.error(
        "Primary Gemini model failed:",
        errorMessage
      );

      const temporaryFailure =
        errorMessage.includes("GEMINI_429") ||
        errorMessage.includes("GEMINI_500") ||
        errorMessage.includes("GEMINI_502") ||
        errorMessage.includes("GEMINI_503") ||
        errorMessage.includes("GEMINI_504");

      if (!temporaryFailure) {
        return NextResponse.json(
          {
            error:
              "Gemini rejected the request. Please check the Gemini API configuration.",
          },
          { status: 502 }
        );
      }
    }

    // ---------------------------------------------------------
    // FALLBACK GEMINI MODEL
    // ---------------------------------------------------------

    try {
      console.log(
        `SentinelX AI: using fallback ${FALLBACK_MODEL}`
      );

      const reply =
        await callGemini(
          FALLBACK_MODEL,
          apiKey,
          parts
        );

      return NextResponse.json({
        reply,
        computerVision:
          imageProcessed,
        model: FALLBACK_MODEL,
      });
    } catch (fallbackError) {
      console.error(
        "Fallback Gemini model failed:",
        fallbackError
      );

      return NextResponse.json(
        {
          error:
            "Gemini is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error(
      "SentinelX AI route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "SentinelX AI assistant failed.",
      },
      { status: 500 }
    );
  }
}