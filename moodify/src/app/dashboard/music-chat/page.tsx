// hackathon_may_stackup\moodify\src\app\dashboard\music-chat\page.tsx




"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Music, Sparkles, Pause, Play, X, AlertTriangle } from "lucide-react";
import { getMusicChatResponse, MusicChatMessage } from "@/lib/gemini-music-chat";

// typewriter component for animated text display
const TypeWriter = ({ 
  content, 
  speed = 10, 
  className = "",
  onComplete = () => {}
}: { 
  content: string; 
  speed?: number; 
  className?: string;
  onComplete?: () => void;
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < content.length && !isPaused) {
      const timeout = setTimeout(() => {
        // Add the next character
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Check if we've reached the end
        if (currentIndex === content.length - 1) {
          setIsComplete(true);
          onComplete();
        }
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [content, currentIndex, isPaused, speed, onComplete]);

  // Reset when content changes
  useEffect(() => {
    setDisplayedContent("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [content]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const completeTyping = () => {
    if (!isComplete) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      setIsComplete(true);
      onComplete();
    }
  };

  return (
    <div className="relative">
      <p className={`whitespace-pre-wrap leading-relaxed ${className}`}>
        {displayedContent}
        {!isComplete && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-purple-400 animate-pulse"></span>
        )}
      </p>
      
      {!isComplete && (
        <div className="absolute right-0 bottom-0 flex space-x-2">
          <button 
            onClick={togglePause} 
            className="text-purple-400 hover:text-purple-300 transition-colors"
            aria-label={isPaused ? "Resume typing" : "Pause typing"}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button 
            onClick={completeTyping} 
            className="text-purple-400 hover:text-purple-300 transition-colors text-xs"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
};

// confiramation dialog component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
      <div 
        className="bg-gray-900 border border-purple-900/50 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all"
        style={{ animation: "scaleIn 0.2s ease-out" }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MusicChat() {
  const [messages, setMessages] = useState<MusicChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingComplete, setTypingComplete] = useState<{[key: number]: boolean}>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // loading chat history from server on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch("/api/music-chat/history");
        if (response.ok) {
          const data = await response.json();
          setMessages(data.chatHistory);
          
          // marking all existing messages as complete
          const completionStatus: {[key: number]: boolean} = {};
          data.chatHistory.forEach((_: any, index: number) => {
            completionStatus[index] = true;
          });
          setTypingComplete(completionStatus);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    
    fetchChatHistory();
  }, []);

  // scrolling to bottom whenever messages change or typing completes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: MusicChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    const newIndex = messages.length;
    setMessages((prev) => [...prev, userMessage]);
    setTypingComplete((prev) => ({...prev, [newIndex]: true})); // User messages are immediately complete
    setInput("");
    setIsLoading(true);
    
    try {
      // getting response from Gemini
      const response = await getMusicChatResponse(userMessage.content);
      
      const assistantMessage: MusicChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      const assistantIndex = messages.length + 1;
      setMessages((prev) => [...prev, assistantMessage]);
      setTypingComplete((prev) => ({...prev, [assistantIndex]: false})); // Assistant message starts typing
      
      // saving the conversation to the server
      await fetch("/api/music-chat/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage,
          assistantMessage,
        }),
      });
      
    } catch (error) {
      console.error("Error in chat:", error);
      
      const errorMessage: MusicChatMessage = {
        role: "assistant",
        content: "I'm sorry, I couldn't process your question at the moment. Please try again later.",
        timestamp: new Date(),
      };
      
      const errorIndex = messages.length + 1;
      setMessages((prev) => [...prev, errorMessage]);
      setTypingComplete((prev) => ({...prev, [errorIndex]: false}));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = async () => {
    try {
      const response = await fetch("/api/music-chat/clear", {
        method: "POST",
      });
      
      if (response.ok) {
        setMessages([]);
        setTypingComplete({});
      }
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleTypingComplete = (index: number) => {
    setTypingComplete((prev) => ({...prev, [index]: true}));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto bg-gradient-to-b from-gray-900 to-black rounded-xl shadow-2xl overflow-hidden border border-purple-900/30">
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={clearChatHistory}
        title="Clear Chat History"
        message="Are you sure you want to delete all chat messages? This action cannot be undone."
      />

      {/* header is implemented here  */}
      <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-sm border-b border-purple-900/30">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
            <Music size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Moodify AI
            </h1>
            <p className="text-xs text-gray-400">Your personal music expert</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-red-900/20 px-3 py-1 rounded-full hover:bg-red-900/30"
          >
            <Trash2 size={16} />
            <span>Clear Chat</span>
          </button>
        )}
      </div>
      
      {/* chat messages area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-gray-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-center max-w-md p-6 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-purple-900/30 shadow-xl">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-12 w-12 text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ask anything about music!
              </h3>
              <p className="mb-6 text-gray-300">Get answers about genres, artists, music history, theory, and more.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div 
                  onClick={() => handleQuickPrompt("What's the difference between house and techno?")}
                  className="bg-gray-800/70 p-3 rounded-lg border border-purple-900/30 hover:bg-purple-900/20 cursor-pointer transition-all hover:scale-105"
                >
                  What's the difference between house and techno?
                </div>
                <div 
                  onClick={() => handleQuickPrompt("Who started lofi music?")}
                  className="bg-gray-800/70 p-3 rounded-lg border border-purple-900/30 hover:bg-purple-900/20 cursor-pointer transition-all hover:scale-105"
                >
                  Who started lofi music?
                </div>
                <div 
                  onClick={() => handleQuickPrompt("Suggest some music to help me sleep")}
                  className="bg-gray-800/70 p-3 rounded-lg border border-purple-900/30 hover:bg-purple-900/20 cursor-pointer transition-all hover:scale-105"
                >
                  Suggest some music to help me sleep
                </div>
                <div 
                  onClick={() => handleQuickPrompt("I'm feeling sad, what should I listen to?")}
                  className="bg-gray-800/70 p-3 rounded-lg border border-purple-900/30 hover:bg-purple-900/20 cursor-pointer transition-all hover:scale-105"
                >
                  I'm feeling sad, what should I listen to?
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                      : "bg-gray-800/80 border border-purple-900/30 text-gray-100"
                  }`}
                >
                  {message.role === "user" || typingComplete[index] ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <TypeWriter 
                      content={message.content} 
                      speed={15}
                      onComplete={() => handleTypingComplete(index)}
                    />
                  )}
                  <div className="text-xs opacity-70 mt-2 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-[85%] rounded-2xl p-4 shadow-lg bg-gray-800/80 border border-purple-900/30 text-gray-100">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area - Fixed at bottom */}
      <div className="p-4 bg-black/40 backdrop-blur-sm border-t border-purple-900/30">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about music..."
            className="w-full bg-gray-800/90 text-white rounded-full pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-900/50 shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-700 text-white p-2 rounded-full transition-all disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

