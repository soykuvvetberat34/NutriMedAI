import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string; // Added field
  time: string;
  startDate?: string;
  endDate?: string;
  status: "active" | "stopped";
  notes?: string;
}

export interface Disease {
  id: string;
  name: string;
  diagnosisDate?: string;
  severity?: string;
  notes?: string;
  lastCheckup?: string;
}

export interface Analysis {
  id: number;
  date: string;
  time: string;
  query: string;
  riskLevel: "high" | "medium" | "low" | "info";
  summary: string;
  fullResponse?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  diseases: string[];
  medications: Medication[];
  allergies: string[];
  nutrition?: string[];
  analysisHistory: Analysis[];
  hasCompletedProfile: boolean;
  healthScore?: number; // Added field
}

interface UserContextType {
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addMedication: (medication: Omit<Medication, "id">) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  addAnalysis: (analysis: Omit<Analysis, "id">) => void;
  login: (email: string) => Promise<void>;
  clearProfile: () => void;
}

const defaultProfile: UserProfile = {
  name: "Kullanıcı",
  email: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  diseases: [],
  medications: [],
  allergies: [],
  nutrition: [],
  analysisHistory: [],
  hasCompletedProfile: false,
  healthScore: 0, // Start at 0, builds with usage
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    // LocalStorage'dan veriyi yükle
    const savedProfile = localStorage.getItem("nutrimedai_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Backward compatibility
        if (parsed.diets && !parsed.nutrition) {
          parsed.nutrition = parsed.diets;
          delete parsed.diets;
        }
        if (!parsed.analysisHistory) {
          parsed.analysisHistory = [];
        }
        return parsed;
      } catch (error) {
        console.error("Profil yüklenemedi:", error);
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  // Her profil değişikliğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("nutrimedai_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  const login = async (email: string) => {
    try {
      localStorage.setItem("nutrimedai_user_email", email);

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Profile fetch failed");

      const data = await res.json();

      if (data) {
        const meds = data.medications || [];
        const history = data.analysis_history || [];
        const userInfo = data.user_info || {};

        setUserProfile(prev => ({
          ...prev,
          name: (userInfo.name && userInfo.surname) ? `${userInfo.name} ${userInfo.surname}` : (userInfo.name || prev.name),
          email: email,
          medications: meds.map((m: any) => ({
            ...m,
            id: m.id || Math.random().toString(),
            startDate: m.startDate || new Date().toISOString()
          })),
          analysisHistory: history.map((h: any) => ({
            ...h,
            id: h.id || Date.now()
          })),
          hasCompletedProfile: true, // Assume profile implies completion if it exists
          healthScore: data.health_score || 0 // Start at 0
        }));
      }
    } catch (err) {
      console.error("Login sync error:", err);
      // Even if fetch fails, set email in profile
      setUserProfile(prev => ({ ...prev, email }));
    }
  };

  // Sync with backend on load
  useEffect(() => {
    const email = localStorage.getItem("nutrimedai_user_email");
    if (email) {
      login(email);
    }
  }, []);

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  const addMedication = (medication: Omit<Medication, "id">) => {
    // Check for duplicates (Case Insensitive)
    const exists = userProfile.medications.some(
      (m) => m.name.toLowerCase().trim() === medication.name.toLowerCase().trim()
    );

    if (exists) {
      console.warn(`Duplicate medication ignored: ${medication.name}`);
      return; // Do not add
    }

    // Optimistic Update
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString() + Math.random().toString(36),
      status: "active",
    };
    setUserProfile((prev) => ({
      ...prev,
      medications: [...prev.medications, newMedication],
    }));
  };

  const updateMedication = (id: string, medication: Partial<Medication>) => {
    setUserProfile((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id ? { ...med, ...medication } : med
      ),
    }));
  };

  const removeMedication = (id: string) => {
    setUserProfile((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
    }));
  };

  const addAnalysis = (analysis: Omit<Analysis, "id">) => {
    const newAnalysis: Analysis = {
      ...analysis,
      id: Date.now(),
    };
    setUserProfile((prev) => ({
      ...prev,
      analysisHistory: [newAnalysis, ...prev.analysisHistory], // Add to beginning
    }));
  };

  const clearProfile = () => {
    setUserProfile(defaultProfile);
    localStorage.removeItem("nutrimedai_user_profile");
    localStorage.removeItem("nutrimedai_user_email");
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateProfile,
        addMedication,
        updateMedication,
        removeMedication,
        addAnalysis,
        login,
        clearProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

