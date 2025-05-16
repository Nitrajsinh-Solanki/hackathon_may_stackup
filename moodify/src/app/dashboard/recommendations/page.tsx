// hackathon_may_stackup\moodify\src\app\dashboard\recommendation\page.tsx



"use client";
import { useState } from "react";
import EnvironmentalRecommendations from "@/app/components/EnvironmentalRecommendations";
import HistoryRecommendations from "@/app/components/HistoryRecommendations";

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState("environmental");

  return (
    <div className="max-w-6xl mx-auto pb-32">
      {/* tab Navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("environmental")}
          className={`px-4 py-3 font-medium text-sm focus:outline-none ${
            activeTab === "environmental"
              ? "text-purple-500 border-b-2 border-purple-500"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          From Environmental Data
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 font-medium text-sm focus:outline-none ${
            activeTab === "history"
              ? "text-purple-500 border-b-2 border-purple-500"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          From Search History
        </button>
      </div>
      
      {/* content area is here  */}
      {activeTab === "environmental" ? (
        <EnvironmentalRecommendations />
      ) : (
        <HistoryRecommendations />
      )}
    </div>
  );
}
