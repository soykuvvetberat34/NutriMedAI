import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
} from "lucide-react";

interface PersonalInfoEditProps {
  onBack: () => void;
  userName: string;
  userEmail: string;
  onSave: (name: string, email: string, age: string, gender: string) => void;
  onNavigate?: (screen: string) => void;
}

export function PersonalInfoEdit({
  onBack,
  userName,
  userEmail,
  onSave,
  onNavigate,
}: PersonalInfoEditProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load profile data from localStorage
    const profile = localStorage.getItem("nutrimedai_user_profile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.age) setAge(parsedProfile.age.toString());
        if (parsedProfile.gender) setGender(parsedProfile.gender);
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    const profile = localStorage.getItem("nutrimedai_user_profile");
    let updatedProfile = {
      name,
      email,
      age: age ? parseInt(age) : undefined,
      gender,
      hasCompletedProfile: true,
    };

    if (profile) {
      try {
        const existingProfile = JSON.parse(profile);
        updatedProfile = { ...existingProfile, ...updatedProfile };
      } catch (e) {
        console.error("Error parsing profile:", e);
      }
    }

    localStorage.setItem("nutrimedai_user_profile", JSON.stringify(updatedProfile));
    
    // Call parent callback
    onSave(name, email, age, gender);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onNavigate) {
        onNavigate("settings");
      } else {
        onBack();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 pb-20 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold">Kişisel Bilgiler</h1>
          </div>
          <p className="text-teal-100 text-sm">
            Adınız, yaşınız ve sağlık bilgileriniz
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 -mt-12 pb-8">
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-6">
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Bilgileriniz Güncellendi
                  </p>
                  <p className="text-sm text-green-700">
                    Değişiklikler başarıyla kaydedildi
                  </p>
                </div>
              </div>
            )}

            {/* Privacy Info - Verileriniz Güvende */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Verileriniz Güvende
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Tüm kişisel bilgileriniz şifrelenmiş olarak saklanır ve
                    üçüncü taraflarla paylaşılmaz. Sağlık verileriniz yalnızca
                    size özel öneriler sunmak için kullanılır.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-teal-600" />
                    Ad Soyad
                  </div>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                  className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-teal-600" />
                    E-posta
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Yaş
                  </div>
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Örn: 35"
                  min="1"
                  max="120"
                  className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-teal-600" />
                    Cinsiyet
                  </div>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("Kadın")}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      gender === "Kadın"
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Kadın
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("Erkek")}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      gender === "Erkek"
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Erkek
                  </button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-semibold">💡 Bilgi:</span> Yaş ve cinsiyet
                bilgileriniz, size daha kişiselleştirilmiş sağlık önerileri
                sunmamızı sağlar.
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !email.trim()}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              Değişiklikleri Kaydet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
