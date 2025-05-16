// moodify\src\app\components\SearchBar.tsx

"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Trash2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch search history when component mounts
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  // Close history dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSearchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/search-history");
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.searchHistory || []);
      } else {
        console.error("Failed to fetch search history:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearchQuery = async (query: string) => {
    if (!query.trim()) return;

    try {
      const response = await fetch("/api/user/search-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.searchHistory || []);
      } else {
        console.error("Failed to save search query:", await response.text());
      }
    } catch (error) {
      console.error("Error saving search query:", error);
    }
  };

  const clearSearchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/search-history", {
        method: "DELETE",
      });

      if (response.ok) {
        setSearchHistory([]);
        setShowHistory(false);
      }
    } catch (error) {
      console.error("Error clearing search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      saveSearchQuery(query.trim());
    } else {
      // Force reload with trending tracks when submitting empty query
      onSearch("");
    }
    setShowHistory(false);
  };

  const handleHistoryItemClick = (historyQuery: string) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
    saveSearchQuery(historyQuery); // Re-save to move it to the top of history
    setShowHistory(false);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    setShowHistory(false);
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          placeholder="Search for songs, artists..."
          className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-10 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-16 flex items-center text-gray-400 hover:text-gray-300"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-400"
        >
          <span className="text-sm font-medium">Search</span>
        </button>
      </form>
      {/* search history dropdown */}
      {showHistory && (
        <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center p-2 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300">
              Recent Searches
            </h3>
            <button
              onClick={clearSearchHistory}
              disabled={isLoading}
              className="text-gray-400 hover:text-red-400 flex items-center text-xs"
            >
              {isLoading ? (
                "Clearing..."
              ) : (
                <>
                  <Trash2 size={14} className="mr-1" />
                  Clear History
                </>
              )}
            </button>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : searchHistory.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {searchHistory.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                  onClick={() => handleHistoryItemClick(item.query)}
                >
                  <div className="flex items-center">
                    <Clock size={14} className="text-gray-400 mr-2" />
                    <span className="text-white">{item.query}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No recent searches
            </div>
          )}
        </div>
      )}
    </div>
  );
}
