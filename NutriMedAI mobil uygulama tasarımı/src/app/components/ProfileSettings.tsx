import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Globe,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Heart,
  Shield,
  Moon,
} from "lucide-react";

interface ProfileSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  onNavigate?: (screen: string) => void;
}

export function ProfileSettings({
  onBack,
  onLogout,
  userName,
  userEmail,
  onNavigate,
}: ProfileSettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  const menuSections = [
    {
      title: "Profil",
      items: [
        {
          icon: User,
          label: "Kişisel Bilgiler",
          description: "Adınız, yaşınız ve sağlık bilgileriniz",
          onClick: () => onNavigate?.("personal-info"),
        },
        {
          icon: Heart,
          label: "Sağlık Profili",
          description: "İlaçlar ve alerjiler",
          onClick: () => onNavigate?.("health-profile"),
        },
      ],
    },
    {
      title: "Tercihler",
      items: [
        {
          icon: Bell,
          label: "Bildirimler",
          description: "İlaç hatırlatmaları ve öneriler",
          hasSwitch: true,
          value: notifications,
          onChange: setNotifications,
        },
        {
          icon: Moon,
          label: "Karanlık Mod",
          description: "Gece modu (yakında)",
          hasSwitch: true,
          value: darkMode,
          onChange: setDarkMode,
          disabled: true,
        },
        {
          icon: Globe,
          label: "Dil Seçimi",
          description: "Türkçe",
          onClick: () => {},
        },
      ],
    },
    {
      title: "Gizlilik ve Güvenlik",
      items: [
        {
          icon: Lock,
          label: "Şifre Değiştir",
          description: "Hesap güvenliğinizi güncelleyin",
          onClick: () => {},
        },
        {
          icon: Shield,
          label: "Veri Paylaşımı",
          description: "Araştırma amaçlı veri paylaşımı",
          hasSwitch: true,
          value: dataSharing,
          onChange: setDataSharing,
        },
        {
          icon: FileText,
          label: "Gizlilik Politikası",
          description: "Verilerinizin nasıl korunduğu",
          onClick: () => {},
        },
      ],
    },
    {
      title: "Destek",
      items: [
        {
          icon: HelpCircle,
          label: "Yardım Merkezi",
          description: "SSS ve kullanım kılavuzu",
          onClick: () => {},
        },
        {
          icon: FileText,
          label: "Kullanım Koşulları",
          description: "Yasal bilgiler ve şartlar",
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 pb-20 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold">Profil ve Ayarlar</h1>
          </div>

          {/* Profil Kartı */}
          <Card className="bg-white/10 backdrop-blur-sm border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-pink-500">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{userName}</h2>
                  <p className="text-teal-100 text-sm">{userEmail}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 mt-2 h-8 px-3 rounded-lg"
                  >
                    Profili Düzenle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 -mt-8 pb-8 space-y-6">
        {/* Sağlık Özeti */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-teal-600">2</div>
                <div className="text-xs text-gray-600">İlaç</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-xs text-gray-600">Analiz</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menü Bölümleri */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">
              {section.title}
            </h3>
            <Card className="shadow-md border-0">
              <CardContent className="p-0">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <div
                      onClick={item.hasSwitch ? undefined : item.onClick}
                      className={`w-full flex items-center gap-4 p-4 transition-colors ${
                        item.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : item.hasSwitch
                          ? ""
                          : "hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      {item.hasSwitch ? (
                        <Switch
                          checked={item.value}
                          onCheckedChange={item.onChange}
                          disabled={item.disabled}
                        />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    {itemIndex < section.items.length - 1 && (
                      <div className="border-b border-gray-100 mx-4"></div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Uygulama Bilgisi */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-6 text-center space-y-2">
            <Heart className="w-12 h-12 text-teal-600 mx-auto fill-teal-600" />
            <h3 className="font-semibold text-gray-900">NutriMedAI</h3>
            <p className="text-sm text-gray-600">Versiyon 1.0.0</p>
            <p className="text-xs text-gray-500">
              Sağlık teknolojisi çözümü
            </p>
          </CardContent>
        </Card>

        {/* Çıkış Yap */}
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full h-14 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Çıkış Yap
        </Button>

        {/* Yasal Bilgi */}
        <div className="text-center space-y-2 py-4">
          <p className="text-xs text-gray-500">
            Bu uygulama tıbbi teşhis koymaz ve doktor tavsiyesi yerine geçmez.
          </p>
          <p className="text-xs text-gray-400">
            © 2026 NutriMedAI. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
