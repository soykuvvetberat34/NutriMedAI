import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Lightbulb,
  AlertCircle,
  MessageSquare,
  Clock,
  TrendingUp,
  Heart,
  Menu,
  Bell,
  Info,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { Badge } from "./ui/badge";

interface DashboardProps {
  onNavigate: (screen: string) => void;
  userName: string;
}

export function Dashboard({ onNavigate, userName }: DashboardProps) {
  const { userProfile } = useUser();
  const score = userProfile.healthScore || 85;

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Günaydın"
      : currentHour < 18
        ? "İyi Günler"
        : "İyi Akşamlar";

  // Determine trend icon color based on score (Mock logic for now, real logic needs history comparison)
  const isHighScore = score > 80;

  const dailyTips = [
    {
      id: 1,
      tip: "Kalsiyum ve demir aynı anda alındığında demir emilimi azalabilir.",
      icon: Lightbulb,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: 2,
      tip: "Aspirin ile alkol birlikte tüketildiğinde mide kanaması riski artar.",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const interactions = [
    {
      id: 1,
      title: "Gıda & İlaç Etkileşimi",
      description: "Greyfurt suyu bazı ilaçların etkisini artırabilir",
      type: "Gıda-İlaç",
      risk: "Orta",
      riskColor: "bg-yellow-500",
    },
    {
      id: 2,
      title: "Beslenme Önerisi",
      description: "Diyabet için düşük glisemik indeksli gıdalar tercih edin",
      type: "Gıda-Hastalık",
      risk: "Bilgi",
      riskColor: "bg-blue-500",
    },
    {
      id: 3,
      title: "İlaç Hatırlatması",
      description: "Sabah ilacınızı almayı unutmayın",
      type: "İlaç",
      risk: "Düşük",
      riskColor: "bg-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 pb-24 rounded-b-[2.5rem] shadow-xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => onNavigate("settings")}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {greeting}
            </h1>
            <p className="text-teal-100">
              Sağlık durumunuz kontrol altında
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 -mt-16 pb-8 space-y-6">
        {/* AI Asistana Sor */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            <button
              onClick={() => onNavigate("ai-assistant")}
              className="w-full flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Asistana Sor
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gıda, ilaç ve hastalık etkileşimlerini sorgula
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Günlük Sağlık Bilgisi */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Bugünün İpucu
          </h2>
          {dailyTips.map((item) => (
            <Card
              key={item.id}
              className={`${item.bgColor} border-0 shadow-md`}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className={`${item.color} mt-1`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gıda & İlaç Bilgilendirmesi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Etkileşimler ve Öneriler
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700"
              onClick={() => onNavigate("history")}
            >
              Tümü
            </Button>
          </div>

          {interactions.map((interaction) => (
            <Card
              key={interaction.id}
              className="shadow-md border-0 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-1 h-full ${interaction.riskColor} rounded-full`}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {interaction.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`${interaction.riskColor} text-white border-0`}
                      >
                        {interaction.risk}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {interaction.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {interaction.type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around py-3 px-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex flex-col items-center gap-1 text-teal-600"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Ana Sayfa</span>
          </button>

          <button
            onClick={() => onNavigate("history")}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs">Geçmiş</span>
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
