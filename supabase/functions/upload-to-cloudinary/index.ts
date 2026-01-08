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
  return crypto.subtle.digest('SHA-1', new TextEncoder().encode(params + apiSecret))
    .then(buffer => {
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderName = formData.get("folder") as string || "uploads";

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

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
    
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error?.message || "Upload failed" 
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const uploadResponse: UploadResponse = {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };

    return new Response(JSON.stringify(uploadResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});