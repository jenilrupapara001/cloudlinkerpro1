import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

function generateSignature(params: string, apiSecret: string): Promise<string> {
  return crypto.subtle.digest("SHA-1", new TextEncoder().encode(params + apiSecret))
    .then(buffer => {
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // PUBLIC function — no auth required
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderName = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Cloudinary Credentials (fallbacks included to avoid crashes)
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "dukqpcb7p";
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY") || "313914632924971";
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET") || "ekrJqXSJVNRgncP8IuqvEpKxrT4";

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsString = `folder=${folderName}&timestamp=${timestamp}`;

    const signature = await generateSignature(paramsString, apiSecret);

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("folder", folderName);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const result = await uploadResponse.json();

    // Cloudinary returned an error
    if (!uploadResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error?.message || "Upload failed",
        }),
        {
          status: uploadResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Successful upload
    const response: UploadResponse = {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
