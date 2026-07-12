import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Neet Breakers AI, your NEET preparation expert. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "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";
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://vnm-study.app',
          'X-Title': 'NEET Breakers Archive'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            {
              role: 'system',
              content: 'You are "Neet Breakers AI", an expert AI tutor specializing in NEET exam preparation. Your goal is to help students solve physics, chemistry, and biology doubts accurately and concisely.'
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMessage
          ]
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.choices[0].message.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to my brain. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0, transition: { duration: 0.2 } },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] bg-white dark:bg-gray-900 overflow-hidden border-t md:border border-gray-200 dark:border-gray-800 md:rounded-2xl md:mx-6 md:mt-4 shadow-sm relative"
    >
      {/* Header */}
      <div className="bg-gradient-brand p-4 md:p-6 flex items-center justify-between text-white shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg md:text-xl">Neet Breakers AI</h3>
            <p className="text-sm text-brand-purple-light">NEET Expert</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-brand-purple/20 text-brand-purple' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gradient-brand text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 max-w-[90%] md:max-w-[75%]">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a NEET doubt..."
            className="w-full pl-6 pr-16 py-4 md:py-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:bg-white dark:focus:bg-gray-700 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30 transition-all outline-none text-base md:text-lg shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-3 bg-gradient-brand text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-100 transition-opacity"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
