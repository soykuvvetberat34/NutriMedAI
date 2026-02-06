import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Camera, User, Heart, Pill, Apple, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { useUser } from "../context/UserContext";

interface HealthProfileSetupProps {
  onComplete: () => void;
}

export function HealthProfileSetup({ onComplete }: HealthProfileSetupProps) {
  const { updateProfile, addMedication } = useUser();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [diseases, setDiseases] = useState<string[]>([]);
  const [medications, setMedications] = useState<
    Array<{ name: string; time: string; dosage: string }>
  >([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [nutrition, setNutrition] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Profili kaydet
      updateProfile({
        name: userName || "Kullanıcı",
        age,
        gender,
        height,
        weight,
        diseases,
        allergies,
        nutrition,
        hasCompletedProfile: true,
      });

      // İlaçları kaydet
      medications.forEach((med) => {
        if (med.name && med.time) {
          addMedication({
            name: med.name,
            dosage: med.dosage,
            time: med.time,
            status: "active",
          });
        }
      });

      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleDisease = (disease: string) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const addMedicationLocal = () => {
    setMedications([
      ...medications,
      { name: "", time: "", dosage: "" },
    ]);
  };

  const updateMedicationLocal = (
    index: number,
    field: "name" | "time" | "dosage",
    value: string
  ) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const removeMedicationLocal = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleNutrition = (item: string) => {
    setNutrition((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Adım {step} / {totalSteps}</span>
            <span>%{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Adım İçeriği */}
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {step === 1 && <User className="w-6 h-6 text-teal-600" />}
              {step === 2 && <Heart className="w-6 h-6 text-teal-600" />}
              {step === 3 && <Pill className="w-6 h-6 text-teal-600" />}
              {step === 4 && <Apple className="w-6 h-6 text-teal-600" />}
              <CardTitle className="text-2xl">
                {step === 1 && "Kişisel Bilgiler"}
                {step === 2 && "Hastalık Bilgileri"}
                {step === 3 && "Kullanılan İlaçlar"}
                {step === 4 && "Beslenme Tercihleri"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 1 && "Temel bilgilerinizi girin"}
              {step === 2 && "Mevcut hastalıklarınızı seçin"}
              {step === 3 && "Düzenli kullandığınız ilaçları ekleyin"}
              {step === 4 && "Alerji ve diyet tercihlerinizi belirtin"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Adım 1: Kişisel Bilgiler */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Yaş *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Örn: 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Cinsiyet *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Kadın</SelectItem>
                      <SelectItem value="male">Erkek</SelectItem>
                      <SelectItem value="other">Belirtmek İstemiyorum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Boy (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Kilo (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Adım 2: Hastalık Bilgileri */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {diseases.length > 0 ? (
                    diseases.map((disease) => (
                      <Badge
                        key={disease}
                        variant="secondary"
                        className="px-3 py-1.5 bg-teal-100 text-teal-800 hover:bg-teal-200"
                      >
                        {disease}
                        <X
                          className="w-3 h-3 ml-2 cursor-pointer"
                          onClick={() => toggleDisease(disease)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Hastalık seçilmedi</p>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {diseaseOptions.map((disease) => (
                    <div
                      key={disease}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleDisease(disease)}
                    >
                      <Checkbox
                        id={disease}
                        checked={diseases.includes(disease)}
                        onCheckedChange={() => toggleDisease(disease)}
                      />
                      <Label
                        htmlFor={disease}
                        className="flex-1 cursor-pointer"
                      >
                        {disease}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adım 3: İlaçlar */}
            {step === 3 && (
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <Card key={index} className="border-2 border-gray-100">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="text-base">İlaç #{index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedicationLocal(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>İlaç Seçimi</Label>
                        <Select
                          value={med.name}
                          onValueChange={(value) =>
                            updateMedicationLocal(index, "name", value)
                          }
                        >
                          <SelectTrigger className="h-10 rounded-lg">
                            <SelectValue placeholder="İlaç seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Parol">Parol</SelectItem>
                            <SelectItem value="Nurofen">Nurofen</SelectItem>
                            <SelectItem value="Aspirin">Aspirin</SelectItem>
                            <SelectItem value="Klamoks">Klamoks</SelectItem>
                            <SelectItem value="Levotiron">Levotiron</SelectItem>
                            <SelectItem value="Nexium">Nexium</SelectItem>
                            <SelectItem value="Norvasc">Norvasc</SelectItem>
                            <SelectItem value="Diaformin">Diaformin</SelectItem>
                            <SelectItem value="Zyrtec">Zyrtec</SelectItem>
                            <SelectItem value="Voltaren">Voltaren</SelectItem>
                            <SelectItem value="other">Diğer</SelectItem>
                          </SelectContent>
                        </Select>

                        {med.name === "other" && (
                          <Input
                            placeholder="İlaç adını yazın"
                            onChange={(e) =>
                              updateMedicationLocal(index, "name", e.target.value)
                            }
                            className="h-10 rounded-lg"
                          />
                        )}
                      </div>

                      <Select
                        value={med.time}
                        onValueChange={(value) =>
                          updateMedicationLocal(index, "time", value)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue placeholder="Kullanım zamanı" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Sabah</SelectItem>
                          <SelectItem value="noon">Öğle</SelectItem>
                          <SelectItem value="evening">Akşam</SelectItem>
                          <SelectItem value="night">Gece</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        className="w-full rounded-lg"
                        type="button"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        İlaç Fotoğrafı Ekle
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={addMedicationLocal}
                  className="w-full h-12 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 hover:bg-teal-50"
                >
                  + İlaç Ekle
                </Button>
              </div>
            )}

            {/* Adım 4: Beslenme Tercihleri */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Info Box - Neden Önemli? */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                        Neden Önemli?
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Sağlık bilgileriniz, size daha kişiselleştirilmiş ve güvenli
                        öneriler sunmamızı sağlar. Özellikle ilaç-besin etkileşimlerini
                        tespit etmek için kritik öneme sahiptir.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Alerjilerim</Label>
                  <div className="flex flex-wrap gap-2">
                    {allergyOptions.map((allergy) => (
                      <Badge
                        key={allergy}
                        variant={allergies.includes(allergy) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1.5 ${
                          allergies.includes(allergy)
                            ? "bg-red-500 hover:bg-red-600"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleAllergy(allergy)}
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Beslenme Tercihlerim</Label>
                  <div className="flex flex-wrap gap-2">
                    {nutritionOptions.map((item) => (
                      <Badge
                        key={item}
                        variant={nutrition.includes(item) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1.5 ${
                          nutrition.includes(item)
                            ? "bg-teal-500 hover:bg-teal-600"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleNutrition(item)}
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl"
                >
                  Geri
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl"
              >
                {step === totalSteps ? "Profili Tamamla" : "Devam Et"}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
