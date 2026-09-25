import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ title: z.string(), transcript: z.string().min(20).max(20000) });

const Schema = z.object({
  summary: z.string(),
  painPoints: z.array(z.string()),
  quotes: z.array(z.object({ speaker: z.string(), quote: z.string() })),
  objections: z.array(z.string()),
  featureRequests: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

export type Synthesis = z.infer<typeof Schema>;

export const synthesizeCall = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; result: Synthesis } | { ok: false; error: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "AI is not configured." };
    const { streamText, Output } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        output: Output.object({ schema: Schema }),
        system:
          "You are Chipp's call intelligence analyst. Extract structured insights from customer call transcripts. Quotes must be verbatim from the transcript. Keep each list to at most 5 concise items; summary under 60 words.",
        prompt: `Call: ${data.title}\n\nTranscript:\n${data.transcript}`,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      return { ok: true, result: out };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("402")) return { ok: false, error: "AI credits exhausted. Add credits in Settings → Plans & credits." };
      if (msg.includes("429")) return { ok: false, error: "Rate limited — please try again in a moment." };
      return { ok: false, error: msg.slice(0, 300) };
    }
  });
