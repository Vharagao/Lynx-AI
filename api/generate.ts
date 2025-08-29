import { GoogleGenAI } from '@google/genai';

// Esta função pode ser implantada como uma Função de Borda (Edge Function) da Vercel
export const config = {
  runtime: 'edge',
};

// Manipula as requisições para o endpoint /api/generate
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { contents, systemInstruction } = await req.json();

    if (!process.env.API_KEY) {
      return new Response(JSON.stringify({ error: 'A chave de API não está configurada no servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    // Cria um novo fluxo de dados para enviar a resposta de volta ao cliente
    const responseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream as any) {
          const text = chunk.text || '';
          const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const sources = groundingChunks
            ?.map((c: any) => c.web)
            .filter((web: any) => web?.uri && web?.title);

          const payload = { text, sources };
          // Formata a mensagem para Server-Sent Events (SSE)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        }
        controller.close();
      },
    });

    // Retorna a resposta de streaming
    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message || 'Ocorreu um erro inesperado no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}