import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- Internationalization (i18n) ---
const translations = {
  en: {
    title: 'LYNX AI',
    description:
      'I am LYNX AI. Upload a video to ask questions about its content, or start a conversation with me. I can search the web for more information and provide answers with sources.',
    uploadButton: 'Upload Video',
    videoUploadedButton: 'Video Sent',
    loadedFile: (fileName: string) => `Loaded: ${fileName}`,
    videoNotSupported: 'Your browser does not support the video tag.',
    initialChatMessage:
      'I am LYNX AI. Upload a video to discuss it, or just start chatting.',
    promptPlaceholder: 'Ask about the video...',
    promptPlaceholderGeneral: 'Ask me anything...',
    sendButton: 'Send',
    ariaLabelAsk: 'Ask a question',
    ariaLabelSend: 'Send question',
    ariaLabelRemoveVideo: 'Remove video',
    errorDefault: 'An unexpected error occurred. Please try again.',
    errorServer: 'Failed to get response from server.',
    errorStream: 'Failed to read stream from server.',
    sourcesTitle: 'Sources',
    uploadTab: 'Upload Video',
    urlTab: 'Paste Video URL',
    urlInputPlaceholder: 'Enter video URL...',
    loadUrlButton: 'Load Video',
    loadingVideo: 'Loading video...',
    errorUrlLoad: 'Failed to load video from URL. Please check the link and try again.',
    systemInstruction:
      '**CRITICAL INSTRUCTIONS - FOLLOW THESE RULES:**\n\n1.  **Check for a video FIRST.**\n\n2.  **IF A VIDEO IS PROVIDED:**\n    a.  **Analyze the User\\\'s Prompt:**\n        i.  **Is the prompt CLEARLY asking about the video?** (e.g., "summarize this," "what is happening here?," "describe the video"). If YES, then analyze the video and provide a detailed answer.\n        ii. **Is the prompt CLEARLY a general question, unrelated to the video?** (e.g., "what is the capital of France?," "tell me a joke"). If YES, you MUST IGNORE the video completely. Just answer the question as a general AI assistant.\n        iii. **Is the prompt ambiguous, generic, or potentially unrelated?** (e.g., "hi," "undefined," a single word). If YES, DO NOT analyze the video. Instead, you MUST ask for clarification by responding ONLY with: "I see you\\\'ve uploaded a video. Did you want to ask something about it?"\n\n3.  **IF NO VIDEO IS PROVIDED:**\n    a.  Treat the conversation as a general chat.\n    b.  Respond helpfully and conversationally to any prompt. For a simple greeting like "hi", respond with a friendly greeting in return.\n\n4.  **General Rule:** If you use web search for any answer, you MUST cite your sources. Be helpful and friendly.',
  },
  pt: {
    title: 'LYNX AI',
    description:
      'Eu sou LYNX AI. Envie um vídeo para fazer perguntas sobre seu conteúdo, ou inicie uma conversa comigo. Eu posso pesquisar na web para obter mais informações e fornecer respostas com fontes.',
    uploadButton: 'Enviar Vídeo',
    videoUploadedButton: 'Vídeo enviado',
    loadedFile: (fileName: string) => `Carregado: ${fileName}`,
    videoNotSupported: 'Seu navegador não suporta a tag de vídeo.',
    initialChatMessage:
      'Eu sou LYNX AI. Envie um vídeo para discuti-lo, ou simplesmente comece a conversar.',
    promptPlaceholder: 'Pergunte sobre o vídeo...',
    promptPlaceholderGeneral: 'Pergunte-me qualquer coisa...',
    sendButton: 'Enviar',
    ariaLabelAsk: 'Faça uma pergunta',
    ariaLabelSend: 'Enviar pergunta',
    ariaLabelRemoveVideo: 'Remover vídeo',
    errorDefault: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    errorServer: 'Falha ao obter resposta do servidor.',
    errorStream: 'Falha ao ler o fluxo de dados do servidor.',
    sourcesTitle: 'Fontes',
    uploadTab: 'Enviar Vídeo',
    urlTab: 'Colar URL do Vídeo',
    urlInputPlaceholder: 'Digite a URL do vídeo...',
    loadUrlButton: 'Carregar Vídeo',
    loadingVideo: 'Carregando vídeo...',
    errorUrlLoad: 'Falha ao carregar vídeo da URL. Verifique o link e tente novamente.',
    systemInstruction:
      '**INSTRUÇÕES CRÍTICAS - SIGA ESTAS REGRAS:**\n\n1.  **PRIMEIRO, verifique se um vídeo foi fornecido.**\n\n2.  **SE UM VÍDEO FOI FORNECIDO:**\n    a.  **Analise a Pergunta do Usuário:**\n        i.  **A pergunta é CLARAMENTE sobre o vídeo?** (Ex: "resuma isso", "o que está acontecendo aqui?", "descreva o vídeo"). Se SIM, analise o vídeo e forneça uma resposta detalhada.\n        ii. **A pergunta é CLARAMENTE uma questão geral, não relacionada ao vídeo?** (Ex: "qual a capital da França?", "conte-me uma piada"). Se SIM, você DEVE IGNORAR o vídeo completamente. Apenas responda à pergunta como um assistente de IA geral.\n        iii. **A pergunta é ambígua, genérica ou potencialmente não relacionada?** (Ex: "oi", "undefined", uma única palavra). Se SIM, NÃO analise o vídeo. Em vez disso, você DEVE pedir um esclarecimento, respondendo APENAS com: "Vejo que você enviou um vídeo. Gostaria de perguntar algo sobre ele?"\n\n3.  **SE NENHUM VÍDEO FOI FORNECIDO:**\n    a.  Trate a conversa como um chat geral.\n    b.  Responda de forma prestativa e conversacional a qualquer pergunta. Para uma saudação simples como "oi", responda com uma saudação amigável.\n\n4.  **Regra Geral:** Se você usar a busca na web para qualquer resposta, você DEVE citar suas fontes. Seja sempre prestativo e amigável.',
  },
};

type TranslationKey = keyof (typeof translations)['en'];
type AvailableLang = keyof typeof translations;

const getLanguage = (): AvailableLang => {
  const lang = navigator.language.split('-')[0];
  return Object.keys(translations).includes(lang) ? (lang as AvailableLang) : 'en';
};

const currentLang = getLanguage();

const t = (key: TranslationKey, ...args: any[]): string => {
  const template = translations[currentLang]?.[key] || translations.en[key];
  if (typeof template === 'function') {
    return (template as (...args: any[]) => string)(...args);
  }
  return template;
};

const LogoIcon = () => (
    <div className="flex items-center justify-center w-32 h-32">
      <img
        src="https://i.postimg.cc/nz9k0tMP/Logo-AI-PNG.png"
        alt="LYNX AI Logo"
        className="h-24 w-24 sm:h-28 sm:w-28"
      />
    </div>
  );

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="mr-2 h-5 w-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-5 w-5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
  video?: {
    dataUrl: string;
    name: string;
  };
}

// --- App Component ---
const App: React.FC = () => {
  const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);
  const [stagedVideo, setStagedVideo] = useState<{ dataUrl: string; file: File } | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useLayoutEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setVh);
    setVh();
    return () => window.removeEventListener('resize', setVh);
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setVideoDataUrl(dataUrl);
        setStagedVideo({ dataUrl, file });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLoadFromUrl = async () => {
    if (!videoUrl.trim()) return;
    setIsLoadingVideo(true);
    setError(null);
    try {
      const response = await fetch('/api/proxy-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });
      if (!response.ok) {
        throw new Error(t('errorUrlLoad'));
      }
      const { base64Data, mimeType } = await response.json();
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      
      const byteString = atob(base64Data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });
      const fileName = videoUrl.substring(videoUrl.lastIndexOf('/') + 1) || 'video.mp4';
      const file = new File([blob], fileName, { type: mimeType });

      setVideoDataUrl(dataUrl);
      setStagedVideo({ dataUrl, file });
    } catch (e: any) {
      setError(e.message || t('errorUrlLoad'));
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleSend = async () => {
    if ((!prompt.trim() && !stagedVideo) || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      text: prompt,
      video: stagedVideo ? { dataUrl: stagedVideo.dataUrl, name: stagedVideo.file.name } : undefined,
    };

    const historyForApi = chatHistory
      .filter(msg => (msg.text && msg.text.trim() !== '') || msg.role === 'model')
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }] as ({ text: string } | { inlineData: { mimeType: string; data: string } })[],
      }));

    const userMessageForApi = {
      role: 'user' as const,
      parts: [{ text: prompt }] as ({ text: string } | { inlineData: { mimeType: string; data: string } })[],
    };
    
    if (stagedVideo) {
      userMessageForApi.parts.push({
        inlineData: {
          mimeType: stagedVideo.file.type,
          data: stagedVideo.dataUrl.split(',')[1],
        },
      });
    }

    const contents = [...historyForApi, userMessageForApi];

    setChatHistory((prev) => [...prev, userMessage, { role: 'model', text: '' }]);
    setPrompt('');
    setStagedVideo(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: t('systemInstruction'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errorServer'));
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error(t('errorStream'));
      }

      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        const lines = chunkText.split('\n\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const jsonString = line.replace('data: ', '');
          if (!jsonString) continue;

          try {
            const parsed = JSON.parse(jsonString);
            fullText += parsed.text || '';

            setChatHistory((prev) => {
              const newHistory = [...prev];
              const lastMessage = newHistory[newHistory.length - 1];
              if (lastMessage.role === 'model') {
                lastMessage.text = fullText;
                if (parsed.sources?.length) lastMessage.sources = parsed.sources;
              }
              return newHistory;
            });
          } catch (e) {
            console.error("Failed to parse stream chunk:", jsonString);
          }
        }
      }
    } catch (e: any) {
      const errorMessage = e.message || t('errorDefault');
      setError(errorMessage);
      setChatHistory((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading && (prompt.trim() || stagedVideo)) {
      event.preventDefault();
      handleSend();
    }
  };
  
  const handleUrlKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoadingVideo) {
      event.preventDefault();
      handleLoadFromUrl();
    }
  };


  return (
    <div className="h-dynamic-screen w-full bg-gray-900 text-slate-200 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
      {/* Video Section */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col p-4 sm:p-6 bg-gray-800">
        <header className="mb-8 flex-shrink-0 flex flex-col items-center text-center">
            <LogoIcon />
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-100 tracking-wide mt-4">
                LYNX <span className="text-purple-500">AI</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 mt-3 max-w-lg">{t('description')}</p>
        </header>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        <div className="flex-grow flex flex-col items-center justify-center bg-gray-900 rounded-2xl w-full min-h-[250px] md:min-h-0 p-4">
          {!videoDataUrl && (
            <div className="w-full max-w-md">
              <div className="flex border-b border-gray-700">
                <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'upload' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>{t('uploadTab')}</button>
                <button onClick={() => setActiveTab('url')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'url' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>{t('urlTab')}</button>
              </div>
              <div className="pt-6">
                {activeTab === 'upload' && (
                  <button
                    onClick={triggerFileSelect}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <UploadIcon />
                    {t('uploadButton')}
                  </button>
                )}
                {activeTab === 'url' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onKeyDown={handleUrlKeyDown}
                      placeholder={t('urlInputPlaceholder')}
                      className="w-full px-4 py-2 bg-gray-800 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-slate-500"
                      disabled={isLoadingVideo}
                    />
                    <button
                      onClick={handleLoadFromUrl}
                      disabled={isLoadingVideo}
                      className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:bg-indigo-800 disabled:cursor-wait"
                    >
                      {isLoadingVideo ? t('loadingVideo') : t('loadUrlButton')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {videoDataUrl && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-full flex-grow relative mb-4">
                  <video
                    src={videoDataUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain rounded-xl absolute top-0 left-0"
                  >
                    {t('videoNotSupported')}
                  </video>
              </div>
              <button
                onClick={() => { setVideoDataUrl(null); setStagedVideo(null); setVideoUrl(''); }}
                disabled={!!stagedVideo || isLoading}
                className="w-full max-w-sm flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 flex-shrink-0"
              >
                {t('uploadButton')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-gray-900 p-4 sm:p-6 border-t md:border-t-0 md:border-l border-slate-700">
        <div ref={chatHistoryRef} className="flex-grow overflow-y-auto mb-4 custom-scrollbar pr-2">
          {chatHistory.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-center">{t('initialChatMessage')}</p>
            </div>
          )}
          {chatHistory.map((message, index) => {
            const isLastMessage = index === chatHistory.length - 1;
            const isStreaming = isLoading && isLastMessage && message.role === 'model';
            return (
              <div
                key={index}
                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {message.video && (
                    <div className={message.text ? 'mb-2' : ''}>
                      <video src={message.video.dataUrl} className="w-48 max-w-full rounded-lg" muted playsInline />
                      <p className="text-xs text-slate-200 text-center truncate mt-1 px-1" title={message.video.name}>
                        {message.video.name}
                      </p>
                    </div>
                  )}
                  
                  {message.text && (
                    <p className={`whitespace-pre-wrap text-sm ${isStreaming ? 'streaming-cursor' : ''}`}>
                      {message.text}
                    </p>
                  )}

                  {message.role === 'model' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <h4 className="font-semibold text-xs mb-1 text-slate-300">{t('sourcesTitle')}</h4>
                      <ul className="space-y-1">
                        {message.sources.map((source, i) => (
                          <li key={i}>
                            <a
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline text-xs block truncate"
                              title={source.title}
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-shrink-0">
          {stagedVideo && (
            <div className="relative mb-2 w-20 h-20 p-1 bg-gray-800 border border-slate-600 rounded-lg">
              <video src={stagedVideo.dataUrl} className="w-full h-full object-cover rounded" muted playsInline />
              <button 
                onClick={() => setStagedVideo(null)} 
                className="absolute -top-2 -right-2 bg-gray-600 hover:bg-gray-500 text-white rounded-full p-0.5 focus:outline-none ring-2 ring-gray-900"
                aria-label={t('ariaLabelRemoveVideo')}
              >
                <CloseIcon />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-800 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition placeholder-slate-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={videoDataUrl ? t('promptPlaceholder') : t('promptPlaceholderGeneral')}
              disabled={isLoading}
              aria-label={t('ariaLabelAsk')}
            />
            <button
              onClick={handleSend}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
              disabled={(!prompt.trim() && !stagedVideo) || isLoading}
              aria-label={t('ariaLabelSend')}
            >
              {isLoading ? <div className="spinner"></div> : <SendIcon />}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container as HTMLElement);
root.render(<App />);