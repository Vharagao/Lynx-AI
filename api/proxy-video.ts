// api/proxy-video.ts
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL é obrigatória' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const videoResponse = await fetch(url);

    if (!videoResponse.ok) {
      return new Response(JSON.stringify({ error: 'Falha ao buscar o vídeo da URL' }), {
        status: videoResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mimeType = videoResponse.headers.get('Content-Type');
    if (!mimeType || !mimeType.startsWith('video/')) {
        return new Response(JSON.stringify({ error: 'A URL não aponta para um tipo de vídeo válido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const arrayBuffer = await videoResponse.arrayBuffer();
    // No ambiente Edge, usamos uma abordagem diferente para converter para base64
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    return new Response(JSON.stringify({ base64Data, mimeType }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error('Erro no proxy de vídeo:', e);
    return new Response(JSON.stringify({ error: e.message || 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
