'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, User, RotateCcw, ChevronDown } from 'lucide-react';
import { FilterBar } from '@/components/FilterBar';
import { useFilters } from '@/lib/context/FilterContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  description: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI GPT-5 Base Series (400k context, 128k output)
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'openai', description: 'Flagship reasoning • $1.25 in / $10 out per 1M' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', description: 'Strong & affordable • $0.25 in / $2 out per 1M' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', description: 'Fastest & cheapest • $0.05 in / $0.40 out per 1M' },
  { id: 'openai/gpt-5-pro', name: 'GPT-5 Pro', provider: 'openai', description: 'Max reasoning • $15 in / $120 out per 1M' },
  { id: 'openai/gpt-5-codex', name: 'GPT-5 Codex', provider: 'openai', description: 'Agentic coding • $1.25 in / $10 out per 1M' },
  // OpenAI GPT-5.1 Series (400k context, adaptive thinking)
  { id: 'openai/gpt-5.1', name: 'GPT-5.1 Thinking', provider: 'openai', description: 'Adaptive reasoning • $1.25 in / $10 out per 1M' },
  { id: 'openai/gpt-5.1-chat-latest', name: 'GPT-5.1 Instant', provider: 'openai', description: 'Fast conversational • $1.25 in / $10 out per 1M' },
  { id: 'openai/gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'openai', description: 'Agentic coding • $1.25 in / $10 out per 1M' },
  { id: 'openai/gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', provider: 'openai', description: 'Smaller coding • $0.25 in / $2 out per 1M' },
  { id: 'openai/gpt-5.1-codex-max', name: 'GPT-5.1 Codex Max', provider: 'openai', description: 'Frontier long-horizon coding' },
  // Anthropic Claude 4.5 Family (200k context, 64k output)
  { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic', description: 'Smart default • $3 in / $15 out per 1M' },
  { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'anthropic', description: 'Max intelligence • $5 in / $25 out per 1M' },
  { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'anthropic', description: 'Fast & efficient • $1 in / $5 out per 1M' },
  // Google Gemini 3 Family
  { id: 'google/gemini-3', name: 'Gemini 3', provider: 'google', description: 'Google flagship • multimodal' },
  { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', provider: 'google', description: 'Advanced reasoning' },
  { id: 'google/gemini-3-flash', name: 'Gemini 3 Flash', provider: 'google', description: 'Fast & efficient' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('anthropic/claude-sonnet-4-5');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  
  // Filter context
  const { getEffectiveDateRange, selectedCustomers, setAvailableCustomers } = useFilters();

  // Fetch available customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/data?startDate=2000-01-01&endDate=2099-12-31');
        if (response.ok) {
          const data = await response.json();
          if (data.availableCustomers?.length > 0) {
            setAvailableCustomers(data.availableCustomers);
          }
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };
    fetchCustomers();
  }, [setAvailableCustomers]);

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[1];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Get current filter values
    const dateRange = getEffectiveDateRange();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }],
          model: selectedModel,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          customers: selectedCustomers.length > 0 ? selectedCustomers : undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to get response');
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Error: ${errorMessage}\n\nTry selecting a different model or check the console for details.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedPrompts = [
    "What ad platforms are connected?",
    "Show me campaign performance for the last 30 days",
    "Compare performance across platforms",
    "What's my best performing campaign?",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Assistant
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Connected to your real ads data
              </p>
            </div>
            <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative" ref={modelSelectorRef}>
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm border border-white/10"
              >
                <div className={`w-2 h-2 rounded-full ${currentModel.provider === 'openai' ? 'bg-green-400' : currentModel.provider === 'anthropic' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                {currentModel.name}
                <ChevronDown className={`w-4 h-4 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showModelSelector && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-white/10 bg-white/5">
                    <p className="text-xs text-gray-400 font-medium px-2">Select AI Model</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {/* OpenAI Models */}
                    <div className="p-2">
                      <div className="text-xs text-green-400 font-medium px-2 py-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        OpenAI
                      </div>
                      {AVAILABLE_MODELS.filter(m => m.provider === 'openai').map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedModel === model.id 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </button>
                      ))}
                    </div>
                    {/* Anthropic Models */}
                    <div className="p-2 border-t border-white/10">
                      <div className="text-xs text-orange-400 font-medium px-2 py-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        Anthropic
                      </div>
                      {AVAILABLE_MODELS.filter(m => m.provider === 'anthropic').map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedModel === model.id 
                              ? 'bg-orange-500/20 text-orange-300' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </button>
                      ))}
                    </div>
                    {/* Google Models */}
                    <div className="p-2 border-t border-white/10">
                      <div className="text-xs text-blue-400 font-medium px-2 py-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Google
                      </div>
                      {AVAILABLE_MODELS.filter(m => m.provider === 'google').map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedModel === model.id 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Chat
              </button>
            )}
            </div>
          </div>
          
          {/* Filters */}
          <FilterBar showCustomerFilter={true} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 animate-float">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              I can analyze your advertising campaigns, compare platform performance, 
              and provide actionable insights based on your real data.
            </p>
            
            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all text-left text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your campaign performance..."
              className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:bg-white/10 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            Using <span className={currentModel.provider === 'openai' ? 'text-green-400' : currentModel.provider === 'anthropic' ? 'text-orange-400' : 'text-blue-400'}>{currentModel.name}</span>
          </p>
        </form>
      </div>
    </div>
  );
}
