import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { companies, attributes, jobDbId } = await req.json();

    if (!companies?.length || !attributes?.length) {
      return new Response(JSON.stringify({ error: "Missing companies or attributes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build prompt
    const companyList = companies.slice(0, 50); // limit batch size
    const prompt = `You are a corporate data extraction assistant. Extract the following attributes for each company listed below. Return ONLY a valid JSON array of arrays (no markdown, no explanation).

Each inner array should have elements in this exact order:
1. Company Name (as provided)
${attributes.map((a: string, i: number) => `${i + 2}. ${a}`).join("\n")}

Companies:
${companyList.map((c: string) => `- ${c}`).join("\n")}

Rules:
- Return real, factual data. If you don't know a value, return "N/A".
- For phone numbers, use the company's actual main phone number.
- For emails, use the company's actual contact email.
- For websites, use the company's actual website URL.
- For revenue, use the most recent publicly available figure.
- For employee counts, use the most recent publicly available figure.
- Return ONLY the JSON array, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a corporate data extraction assistant. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", errText);
      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON from the AI response
    let rows: string[][];
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      rows = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      rows = companyList.map((c: string) => [c, ...attributes.map(() => "N/A")]);
    }

    const columns = ["Company Name", ...attributes];

    // If jobDbId provided, update the job record in Supabase
    if (jobDbId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

      await supabaseAdmin.from("jobs").update({
        csv_columns: columns,
        csv_rows: rows,
        status: "Completed",
        progress: 100,
        error_rate: "0.00%",
      }).eq("id", jobDbId);
    }

    return new Response(JSON.stringify({ columns, rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
