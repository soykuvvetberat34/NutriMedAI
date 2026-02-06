import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Analysis {
  id: string;
  date: string;
  time: string;
  query: string;
  response: string;
  riskLevel: "low" | "medium" | "high" | "info";
  summary: string;
}

interface AnalysisContextType {
  analyses: Analysis[];
  addAnalysis: (analysis: Omit<Analysis, "id" | "date" | "time">) => void;
  clearAnalyses: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState<Analysis[]>(() => {
    // LocalStorage'dan analiz geçmişini yükle
    const savedAnalyses = localStorage.getItem("nutrimedai_analyses");
    if (savedAnalyses) {
      try {
        return JSON.parse(savedAnalyses);
      } catch (error) {
        console.error("Analiz geçmişi yüklenemedi:", error);
        return [];
      }
    }
    return [];
  });

  // Her değişiklikte localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("nutrimedai_analyses", JSON.stringify(analyses));
  }, [analyses]);

  const addAnalysis = (analysis: Omit<Analysis, "id" | "date" | "time">) => {
    const now = new Date();
    const newAnalysis: Analysis = {
      ...analysis,
      id: Date.now().toString() + Math.random().toString(36),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setAnalyses((prev) => [newAnalysis, ...prev]);
  };

  const clearAnalyses = () => {
    setAnalyses([]);
    localStorage.removeItem("nutrimedai_analyses");
  };

  return (
    <AnalysisContext.Provider
      value={{
        analyses,
        addAnalysis,
        clearAnalyses,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within a AnalysisProvider");
  }
  return context;
}
