import { useState, useEffect } from "react";
import { UserProvider } from "./context/UserContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import { OnboardingScreens } from "./components/OnboardingScreens";
import { AuthScreen } from "./components/AuthScreen";
import { HealthProfileSetup } from "./components/HealthProfileSetup";
import { Dashboard } from "./components/Dashboard";
import { AIAssistant } from "./components/AIAssistant";
import { HealthHistory } from "./components/HealthHistory";
import { ProfileSettings } from "./components/ProfileSettings";
import { PersonalInfoEdit } from "./components/PersonalInfoEdit";
import { HealthProfileEdit } from "./components/HealthProfileEdit";

type Screen =
  | "onboarding"
  | "auth"
  | "profile-setup"
  | "dashboard"
  | "ai-assistant"
  | "history"
  | "settings"
  | "personal-info"
  | "health-profile";

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // LocalStorage'dan önceki durumu kontrol et
    const hasSeenOnboarding = localStorage.getItem("nutrimedai_seen_onboarding");
    const isLoggedIn = localStorage.getItem("nutrimedai_is_authenticated");
    const hasProfile = localStorage.getItem("nutrimedai_user_profile");
    
    if (hasSeenOnboarding && isLoggedIn) {
      if (hasProfile) {
        const profile = JSON.parse(hasProfile);
        return profile.hasCompletedProfile ? "dashboard" : "profile-setup";
      }
    }
    return "onboarding";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("nutrimedai_is_authenticated") === "true";
  });

  const [userName, setUserName] = useState(() => {
    const profile = localStorage.getItem("nutrimedai_user_profile");
    if (profile) {
      try {
        return JSON.parse(profile).name || "Kullanıcı";
      } catch {
        return "Kullanıcı";
      }
    }
    return "Kullanıcı";
  });

  const [userEmail, setUserEmail] = useState(() => {
    const profile = localStorage.getItem("nutrimedai_user_profile");
    if (profile) {
      try {
        return JSON.parse(profile).email || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem("nutrimedai_seen_onboarding", "true");
    setCurrentScreen("auth");
  };

  const handleLogin = (email?: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("nutrimedai_is_authenticated", "true");
    
    if (email) {
      setUserEmail(email);
    }

    const profile = localStorage.getItem("nutrimedai_user_profile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.hasCompletedProfile) {
          setCurrentScreen("dashboard");
        } else {
          setCurrentScreen("profile-setup");
        }
      } catch {
        setCurrentScreen("profile-setup");
      }
    } else {
      setCurrentScreen("profile-setup");
    }
  };

  const handleProfileSetupComplete = () => {
    // Profil tamamlandığını işaretle
    const profile = localStorage.getItem("nutrimedai_user_profile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        parsedProfile.hasCompletedProfile = true;
        localStorage.setItem("nutrimedai_user_profile", JSON.stringify(parsedProfile));
        setUserName(parsedProfile.name || "Kullanıcı");
      } catch (error) {
        console.error("Profil kaydedilemedi:", error);
      }
    }
    setCurrentScreen("dashboard");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nutrimedai_is_authenticated");
    localStorage.removeItem("nutrimedai_seen_onboarding");
    setCurrentScreen("onboarding");
  };

  const handleBackToDashboard = () => {
    setCurrentScreen("dashboard");
  };

  const handlePersonalInfoSave = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
  };

  // Kullanıcı adını güncelle
  useEffect(() => {
    const handleStorageChange = () => {
      const profile = localStorage.getItem("nutrimedai_user_profile");
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          setUserName(parsedProfile.name || "Kullanıcı");
          setUserEmail(parsedProfile.email || "");
        } catch {
          // Hata varsa varsayılan değerleri kullan
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen">
      {currentScreen === "onboarding" && (
        <OnboardingScreens onComplete={handleOnboardingComplete} />
      )}

      {currentScreen === "auth" && <AuthScreen onLogin={handleLogin} />}

      {currentScreen === "profile-setup" && (
        <HealthProfileSetup onComplete={handleProfileSetupComplete} />
      )}

      {currentScreen === "dashboard" && (
        <Dashboard onNavigate={handleNavigate} userName={userName} />
      )}

      {currentScreen === "ai-assistant" && (
        <AIAssistant onBack={handleBackToDashboard} />
      )}

      {currentScreen === "history" && (
        <HealthHistory onBack={handleBackToDashboard} />
      )}

      {currentScreen === "settings" && (
        <ProfileSettings
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          userName={userName}
          userEmail={userEmail}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === "personal-info" && (
        <PersonalInfoEdit
          onBack={handleBackToDashboard}
          userName={userName}
          userEmail={userEmail}
          onSave={handlePersonalInfoSave}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === "health-profile" && (
        <HealthProfileEdit
          onBack={handleBackToDashboard}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AnalysisProvider>
        <AppContent />
      </AnalysisProvider>
    </UserProvider>
  );
}
