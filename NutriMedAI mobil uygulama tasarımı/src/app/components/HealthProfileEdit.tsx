import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Pill,
  Apple,
  X,
} from "lucide-react";

interface HealthProfileEditProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export function HealthProfileEdit({ onBack, onNavigate }: HealthProfileEditProps) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [diseases, setDiseases] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [nutrition, setNutrition] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customDisease, setCustomDisease] = useState("");
  const [showCustomDiseaseInput, setShowCustomDiseaseInput] = useState(false);
  const [customAllergy, setCustomAllergy] = useState("");
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);
  const [customNutrition, setCustomNutrition] = useState("");
  const [showCustomNutritionInput, setShowCustomNutritionInput] = useState(false);

  const diseaseOptions = [
    "Diyabet (Tip 1)",
    "Diyabet (Tip 2)",
    "Hipertansiyon",
    "IBS (İrritabl Bağırsak Sendromu)",
    "Hipotiroidi",
    "Hipertiroidi",
    "Astım",
    "KOAH",
    "Kalp Hastalığı",
    "Böbrek Hastalığı",
  ];

  const allergyOptions = [
    "Süt ve Süt Ürünleri",
    "Yumurta",
    "Fındık/Fıstık",
    "Balık",
    "Kabuklu Deniz Ürünleri",
    "Soya",
    "Buğday/Gluten",
    "Polen",
  ];

  const nutritionOptions = [
    "Vejetaryen",
    "Vegan",
    "Glutensiz",
    "Laktozsuz",
    "Ketojenik",
    "Akdeniz Diyeti",
    "Düşük Tuzlu",
    "Düşük Yağlı",
  ];

  useEffect(() => {
    // Load profile data from localStorage
    const profile = localStorage.getItem("nutrimedai_user_profile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.height) setHeight(parsedProfile.height.toString());
        if (parsedProfile.weight) setWeight(parsedProfile.weight.toString());
        if (parsedProfile.diseases) setDiseases(parsedProfile.diseases);
        if (parsedProfile.allergies) setAllergies(parsedProfile.allergies);
        if (parsedProfile.nutrition) setNutrition(parsedProfile.nutrition);
        // Backward compatibility with old 'diets' field
        if (parsedProfile.diets && !parsedProfile.nutrition) setNutrition(parsedProfile.diets);
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }

    // Load medications separately (they might be stored differently)
    const meds = localStorage.getItem("nutrimedai_medications");
    if (meds) {
      try {
        const parsedMeds = JSON.parse(meds);
        const medNames = parsedMeds.map((m: any) => m.name);
        setMedications(medNames);
      } catch (e) {
        console.error("Error loading medications:", e);
      }
    }
  }, []);

  const toggleDisease = (disease: string) => {
    if (disease === "Diğer") {
      setShowCustomDiseaseInput(!showCustomDiseaseInput);
      if (showCustomDiseaseInput) {
        setCustomDisease("");
      }
      return;
    }
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const addCustomDisease = () => {
    if (customDisease.trim() && !diseases.includes(customDisease.trim())) {
      setDiseases([...diseases, customDisease.trim()]);
      setCustomDisease("");
      setShowCustomDiseaseInput(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === "Diğer") {
      setShowCustomAllergyInput(!showCustomAllergyInput);
      if (showCustomAllergyInput) {
        setCustomAllergy("");
      }
      return;
    }
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy("");
      setShowCustomAllergyInput(false);
    }
  };

  const toggleNutrition = (item: string) => {
    if (item === "Diğer") {
      setShowCustomNutritionInput(!showCustomNutritionInput);
      if (showCustomNutritionInput) {
        setCustomNutrition("");
      }
      return;
    }
    setNutrition((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const addCustomNutrition = () => {
    if (customNutrition.trim() && !nutrition.includes(customNutrition.trim())) {
      setNutrition([...nutrition, customNutrition.trim()]);
      setCustomNutrition("");
      setShowCustomNutritionInput(false);
    }
  };

  const handleSave = () => {
    // Save to localStorage
    const profile = localStorage.getItem("nutrimedai_user_profile");
    let updatedProfile = {
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined,
      diseases,
      allergies,
      nutrition,
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

    localStorage.setItem(
      "nutrimedai_user_profile",
      JSON.stringify(updatedProfile)
    );

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
            <h1 className="text-2xl font-bold">Sağlık Profili</h1>
          </div>
          <p className="text-teal-100 text-sm">
            İlaçlar ve alerjilerinizi düzenleyin
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 -mt-12 pb-8 space-y-4">
        {/* Success Message */}
        {showSuccess && (
          <Card className="shadow-xl border-0 bg-green-50 border-2 border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Bilgileriniz Güncellendi
                </p>
                <p className="text-sm text-green-700">
                  Değişiklikler başarıyla kaydedildi
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Box - Neden Önemli? */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Neden Önemli?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Sağlık bilgileriniz, size daha kişiselleştirilmiş ve güvenli
                  öneriler sunmamızı sağlar. Özellikle ilaç-besin etkileşimlerini
                  tespit etmek için kritik öneme sahiptir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boy & Kilo */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">
              Fiziksel Bilgiler
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-gray-700 font-medium">
                  Boy (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  min="1"
                  max="250"
                  className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-gray-700 font-medium">
                  Kilo (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  min="1"
                  max="300"
                  className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hastalıklar */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900 text-lg">
                Kronik Hastalıklar
              </h3>
            </div>

            {diseases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {diseases.map((disease) => (
                  <Badge
                    key={disease}
                    variant="secondary"
                    className="px-3 py-1.5 bg-teal-100 text-teal-800"
                  >
                    {disease}
                    <X
                      className="w-3 h-3 ml-2 cursor-pointer hover:text-teal-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiseases(diseases.filter((d) => d !== disease));
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-xl p-3">
              {diseaseOptions.map((disease) => (
                <div
                  key={disease}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleDisease(disease)}
                >
                  <Checkbox
                    id={disease}
                    checked={diseases.includes(disease)}
                    onCheckedChange={() => toggleDisease(disease)}
                  />
                  <Label htmlFor={disease} className="flex-1 cursor-pointer">
                    {disease}
                  </Label>
                </div>
              ))}
              
              {/* Diğer Seçeneği */}
              <div
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleDisease("Diğer")}
              >
                <Checkbox
                  id="disease-other"
                  checked={showCustomDiseaseInput}
                  onCheckedChange={() => toggleDisease("Diğer")}
                />
                <Label htmlFor="disease-other" className="flex-1 cursor-pointer">
                  Diğer
                </Label>
              </div>
            </div>

            {/* Custom Disease Input */}
            {showCustomDiseaseInput && (
              <div className="space-y-2 pt-2">
                <Label className="text-gray-700 font-medium">
                  Hastalık Adı Yazın
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customDisease}
                    onChange={(e) => setCustomDisease(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addCustomDisease();
                      }
                    }}
                    placeholder="Örn: Migren"
                    className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <Button
                    onClick={addCustomDisease}
                    disabled={!customDisease.trim()}
                    className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700"
                  >
                    Ekle
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kullanılan İlaçlar - Read Only */}
        {medications.length > 0 && (
          <Card className="shadow-xl border-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Kullanılan İlaçlar
                  </h3>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {medications.length}
                </Badge>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <span className="font-semibold">💊 Bilgi:</span> İlaçlarınızı
                  "Sağlık Geçmişim" sayfasından yönetebilirsiniz.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {medications.map((med, index) => (
                  <Badge
                    key={index}
                    className="px-3 py-1.5 bg-blue-500 text-white"
                  >
                    {med}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerjiler */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900 text-lg">
                Alerjilerim
              </h3>
            </div>

            {allergies.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700 font-medium mb-2">Seçili Alerjiler:</p>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      className="px-3 py-1.5 bg-red-500 text-white"
                    >
                      {allergy}
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer hover:text-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAllergies(allergies.filter((a) => a !== allergy));
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {allergyOptions.map((allergy) => (
                <Badge
                  key={allergy}
                  variant={allergies.includes(allergy) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${
                    allergies.includes(allergy)
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleAllergy(allergy)}
                >
                  {allergy}
                </Badge>
              ))}
              <Badge
                variant={showCustomAllergyInput ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 ${
                  showCustomAllergyInput
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleAllergy("Diğer")}
              >
                Diğer
              </Badge>
            </div>

            {/* Custom Allergy Input */}
            {showCustomAllergyInput && (
              <div className="space-y-2 pt-2">
                <Label className="text-gray-700 font-medium">
                  Alerji Adı Yazın
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addCustomAllergy();
                      }
                    }}
                    placeholder="Örn: Kaju"
                    className="h-12 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                  />
                  <Button
                    onClick={addCustomAllergy}
                    disabled={!customAllergy.trim()}
                    className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700"
                  >
                    Ekle
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Beslenme Tercihleri */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900 text-lg">
                Beslenme Tercihleri
              </h3>
            </div>

            {nutrition.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                <p className="text-xs text-teal-700 font-medium mb-2">Seçili Diyetler:</p>
                <div className="flex flex-wrap gap-2">
                  {nutrition.map((item) => (
                    <Badge
                      key={item}
                      className="px-3 py-1.5 bg-teal-500 text-white"
                    >
                      {item}
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer hover:text-teal-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNutrition(nutrition.filter((d) => d !== item));
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {nutritionOptions.map((item) => (
                <Badge
                  key={item}
                  variant={nutrition.includes(item) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${
                    nutrition.includes(item)
                      ? "bg-teal-500 hover:bg-teal-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleNutrition(item)}
                >
                  {item}
                </Badge>
              ))}
              <Badge
                variant={showCustomNutritionInput ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 ${
                  showCustomNutritionInput
                    ? "bg-teal-500 hover:bg-teal-600 text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleNutrition("Diğer")}
              >
                Diğer
              </Badge>
            </div>

            {/* Custom Nutrition Input */}
            {showCustomNutritionInput && (
              <div className="space-y-2 pt-2">
                <Label className="text-gray-700 font-medium">
                  Beslenme Tercihi Yazın
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customNutrition}
                    onChange={(e) => setCustomNutrition(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addCustomNutrition();
                      }
                    }}
                    placeholder="Örn: Paleo"
                    className="h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <Button
                    onClick={addCustomNutrition}
                    disabled={!customNutrition.trim()}
                    className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700"
                  >
                    Ekle
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
}
