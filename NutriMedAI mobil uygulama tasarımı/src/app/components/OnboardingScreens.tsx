import * as React from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ChevronRight, Sparkles, Network, UserCheck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface OnboardingScreensProps {
  onComplete: () => void;
}

export function OnboardingScreens({ onComplete }: OnboardingScreensProps) {
  const [currentScreen, setCurrentScreen] = React.useState(0);

  const screens = [
    {
      icon: Sparkles,
      title: "NutriMedAI'ye Hoş Geldiniz",
      subtitle: "Gıda, ilaç ve sağlık etkileşimlerini sizin için analiz eder.",
      image: "https://images.unsplash.com/photo-1722235623200-59966a71af50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwQUklMjB0ZWNobm9sb2d5JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MDMyMDc3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      color: "from-teal-50 to-cyan-50",
    },
    {
      icon: Network,
      title: "Gizli Etkileşimleri Keşfedin",
      subtitle: "Gıdalar, ilaçlar ve hastalıklar birbiriyle nasıl etkileşir öğrenin.",
      image: "https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwbmV0d29yayUyMGNvbm5lY3Rpb258ZW58MXx8fHwxNzcwMzIwNzc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      color: "from-blue-50 to-indigo-50",
    },
    {
      icon: UserCheck,
      title: "Kişisel ve Açıklanabilir",
      subtitle: "Sağlık profilinize özel, anlaşılır öneriler alın.",
      image: "https://images.unsplash.com/photo-1636249253913-40e83d5423e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbGl6ZWQlMjBoZWFsdGhjYXJlJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MDMyMDc3OHww&ixlib=rb-4.1.0&q=80&w=1080",
      color: "from-emerald-50 to-teal-50",
    },
  ];

  const currentScreenData = screens[currentScreen];
  const Icon = currentScreenData.icon;

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentScreenData.color} flex items-center justify-center p-6`}>
      <div className="w-full max-w-md">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Görsel Bölgesi */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-xl">
              <ImageWithFallback
                src={currentScreenData.image}
                alt={currentScreenData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-8 right-8 bg-white rounded-full p-4 shadow-lg">
              <Icon className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          {/* Metin İçeriği */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentScreenData.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {currentScreenData.subtitle}
            </p>
          </div>

          {/* Göstergeler */}
          <div className="flex justify-center gap-2">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentScreen
                  ? "w-8 bg-teal-600"
                  : "w-2 bg-gray-300"
                  }`}
              />
            ))}
          </div>

          {/* Buton */}
          <Button
            onClick={handleNext}
            className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg"
          >
            {currentScreen === screens.length - 1 ? "Başlayalım" : "Devam Et"}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>

          {/* Atlama Linki */}
          {currentScreen < screens.length - 1 && (
            <button
              onClick={onComplete}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              Atla
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
