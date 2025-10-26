
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from './types';
import { generateReport } from './services/geminiService';
import Header from './components/Header';
import ChartCard from './components/ChartCard';
import LoadingSpinner from './components/LoadingSpinner';
import SourceLink from './components/SourceLink';

const initialMessages: Message[] = [
  {
    id: 'init1',
    role: 'model',
    text: "Hello! I am LTGD, your specialized AI agent for analyzing long-term US government debt. What would you like to know? You can ask about current yields, historical trends, or factors influencing demand."
  }
];

const examplePrompts = [
    "What's the current trend for the 10-year Treasury yield?",
    "Show me a chart of US inflation vs. 30-year bond rates over the last 5 years.",
    "How does the Federal Reserve's policy affect long-term debt demand?",
    "Compare US long-term debt to that of Germany and Japan.",
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (prompt?: string) => {
    const userMessageText = prompt || input;
    if (!userMessageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userMessageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const loadingMessage: Message = {
        id: `model-loading-${Date.now()}`,
        role: 'model',
        isLoading: true,
    }
    setMessages(prev => [...prev, loadingMessage]);

    const geminiResponse = await generateReport(userMessageText);

    const modelMessage: Message = {
      id: `model-${Date.now()}`,
      role: 'model',
      text: geminiResponse.text,
      chartData: geminiResponse.chartData || undefined,
      sources: geminiResponse.sources,
    };
    
    setMessages(prev => prev.filter(msg => !msg.isLoading));
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-cyan-900 flex-shrink-0 flex items-center justify-center font-bold text-cyan-400 border border-cyan-700">
                  L
                </div>
              )}
              <div className={`rounded-lg p-4 max-w-xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-300 rounded-bl-none border border-gray-700'}`}>
                {msg.isLoading ? <LoadingSpinner /> : (
                  <>
                    {msg.text && <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></div>}
                    {msg.chartData && <ChartCard chartData={msg.chartData} />}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <h4 className="text-xs font-semibold mb-2 text-gray-400">Sources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map(source => <SourceLink key={source.uri} source={source} />)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
               {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center font-bold text-gray-300">
                  U
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
        {!isLoading && messages.length <= 1 && (
             <div className="max-w-3xl mx-auto px-4 md:px-6 pb-4">
                <p className="text-sm text-gray-400 mb-2">Try an example:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {examplePrompts.map((prompt, i) => (
                        <button key={i} onClick={() => handleSendMessage(prompt)} className="text-left text-sm p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
                            {prompt}
                        </button>
                    ))}
                </div>
             </div>
        )}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-gray-800 rounded-lg p-2 border border-gray-700 focus-within:ring-2 focus-within:ring-cyan-500">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about US government debt..."
              className="flex-1 bg-transparent focus:outline-none px-2 text-gray-200"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
             {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
