import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `Você é a Enciclopédia Bíblica da IEQ.V Ferraz - Campos do Jordão.
Ajude o visitante a estudar a Bíblia com profundidade, respeito e clareza.
- Cite versículos com referência (ex: João 3:16).
- Explique contexto histórico, autor, idioma original (hebraico/grego) quando útil.
- Aborde temas teológicos com equilíbrio, sem doutrinas pessoais polêmicas.
- Se não souber algo, diga honestamente.
- Responda sempre em português do Brasil.
- Seja acolhedor, claro e objetivo. Use markdown para títulos, listas e citações.`;

export const Route = createFileRoute("/api/biblia-ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = await request.json();
          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
              stream: true,
            }),
          });

          if (upstream.status === 429) {
            return new Response(JSON.stringify({ error: "Muitas requisições" }), { status: 429 });
          }
          if (upstream.status === 402) {
            return new Response(JSON.stringify({ error: "Créditos esgotados" }), { status: 402 });
          }
          if (!upstream.ok || !upstream.body) {
            const t = await upstream.text();
            console.error("AI gateway error", upstream.status, t);
            return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), { status: 500 });
          }

          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error("biblia-ai route error", e);
          return new Response(JSON.stringify({ error: "Erro" }), { status: 500 });
        }
      },
    },
  },
});
