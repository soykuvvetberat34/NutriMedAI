import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Send,
  Mic,
  Camera,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUser } from "../context/UserContext";

interface AIAssistantProps {
  onBack: () => void;
}

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  riskLevel?: "low" | "medium" | "high" | "info";
  timestamp: Date;
  image?: string;
  action?: "medication_added"; // New action type
}

export function AIAssistant({ onBack }: AIAssistantProps) {
  const { userProfile, addMedication, addAnalysis } = useUser(); // Access User Context

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Initialize Chat
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initialMessages: Message[] = [];

    // 1. Standard Greeting
    initialMessages.push({
      id: 1,
      role: "ai",
      content: "Merhaba! Ben NutriMedAI asistanınızım. Gıda, ilaç ve sağlık etkileşimleri hakkında size yardımcı olabilirim.",
      riskLevel: "info",
      timestamp: new Date(),
    });

    // 2. Conditional Prompt for Medications if profile is empty
    if (userProfile.medications.length === 0) {
      initialMessages.push({
        id: 2,
        role: "ai",
        content: "Profilinizde kayıtlı ilaç bulunmuyor. Size daha iyi yardımcı olabilmem için kullandığınız ilaçları yazar mısınız? (Örn: 'Ben Prozac ve Aspirin kullanıyorum')",
        riskLevel: "info", // Changed from "medium" to "info" per user request
        timestamp: new Date(),
      });
    }

    setMessages(initialMessages);
  }, []); // Run once

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    // Kullanıcı mesajını ekle
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue || "📷 Görsel gönderildi",
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue; // Keep refs for API
    const currentImage = selectedImage; // Save image ref before clearing

    setInputValue("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsTyping(true);

    try {
      // Connect to NutriMedAI Python API
      const userEmail = localStorage.getItem("nutrimedai_user_email");

      let response;

      // If image is selected, use image analysis endpoint
      if (currentImage) {
        response = await fetch("http://localhost:5000/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: currentImage, // Base64 encoded image
            email: userEmail
          }),
        });
      } else {
        // Text-only chat
        response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentInput,
            email: userEmail
          }),
        });
      }

      const data = await response.json();

      // Check for error response
      if (!data.success && data.message) {
        throw new Error(data.message);
      }

      // Determine Risk Level
      let risk: "low" | "medium" | "high" | "info" = "info";
      const replyText = data.reply || "Yanıt alınamadı.";
      const replyLower = replyText.toLowerCase();
      if (replyLower.includes("yüksek risk") || replyLower.includes("ciddi") || replyLower.includes("kullanmayınız")) {
        risk = "high";
      } else if (replyLower.includes("orta risk") || replyLower.includes("dikkat")) {
        risk = "medium";
      } else if (replyLower.includes("düşük risk") || replyLower.includes("güvenli")) {
        risk = "low";
      }

      // --- AUTO-ADD MEDICATIONS LOGIC ---
      const newMedsAdded: string[] = [];
      if (data.detected_drugs && Array.isArray(data.detected_drugs)) {
        data.detected_drugs.forEach((drug: string | { product_name: string }) => {
          // Handle both string and object formats
          const drugName = typeof drug === 'string' ? drug : drug.product_name;
          // Check if already in profile to avoid duplicates
          const exists = userProfile.medications.some(m => m.name.toLowerCase() === drugName.toLowerCase());
          if (!exists) {
            addMedication({
              name: drugName,
              status: "active",
              startDate: new Date().toISOString().split('T')[0],
              notes: "Sohbet sırasında eklendi",
              time: "Belirtilmedi"
            });
            newMedsAdded.push(drugName);
          }
        });
      }

      const aiResponse: Message = {
        id: messages.length + 2,
        role: "ai",
        content: replyText,
        riskLevel: risk,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // --- SAVE TO HISTORY ---
      addAnalysis({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        query: currentInput.length > 30 ? currentInput.substring(0, 30) + "..." : currentInput,
        riskLevel: risk,
        summary: replyText.length > 100 ? replyText.substring(0, 100) + "..." : replyText,
        fullResponse: replyText
      });

      // If meds were added, define a system notification
      if (newMedsAdded.length > 0) {
        setMessages((prev) => [...prev, {
          id: prev.length + 3,
          role: "ai",
          content: `✅ İlaç listenize şunlar eklendi: ${newMedsAdded.join(", ")}`,
          riskLevel: "low",
          timestamp: new Date(),
          action: "medication_added"
        }]);
      }

    } catch (error) {
      const errorMsg: Message = {
        id: messages.length + 2,
        role: "ai",
        content: "⚠️ Bağlantı Hatası: Python backend (api_server.py) çalışmıyor olabilir. Lütfen terminali kontrol edin.",
        riskLevel: "high",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getRiskBadge = (level?: "low" | "medium" | "high" | "info") => {
    switch (level) {
      case "low":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Düşük Risk
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Orta Risk
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Yüksek Risk
          </Badge>
        );
      case "info":
        return (
          <Badge className="bg-blue-500 text-white flex items-center gap-1">
            <Info className="w-3 h-3" />
            Bilgi
          </Badge>
        );
      default:
        return null;
    }
  };

  const quickQuestions = [
    "Yoğurdu antibiyotikten sonra yedim, sorun olur mu?",
    "Greyfurt suyu hangi ilaçlarla etkileşir?",
    "Akşam ilacımdan sonra ne yememeliyim?",
    "Kahve ilaç etkisini azaltır mı?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                  <Bot className="w-6 h-6 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">AI Asistan</h1>
                <p className="text-xs text-teal-100">
                  {isTyping ? "yazıyor..." : "Çevrimiçi"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 max-w-md mx-auto w-full space-y-4 pb-32">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
          >
            <Avatar className={`w-10 h-10 ${message.role === "user" ? "bg-teal-600" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
              <AvatarFallback>
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </AvatarFallback>
            </Avatar>

            <div
              className={`flex-1 max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"
                }`}
            >
              <Card
                className={`p-4 ${message.role === "user"
                  ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white border-0"
                  : message.action === "medication_added"
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 shadow-md"
                  }`}
              >
                {message.riskLevel && message.role === "ai" && !message.action && (
                  <div className="mb-3">{getRiskBadge(message.riskLevel)}</div>
                )}
                {message.image && (
                  <div className="mb-3">
                    <img
                      src={message.image}
                      alt="Gönderilen görsel"
                      className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                )}
                <p
                  className={`text-sm leading-relaxed whitespace-pre-line ${message.role === "user" ? "text-white" : "text-gray-800"
                    }`}
                >
                  {message.content}
                </p>
              </Card>
              <p className="text-xs text-gray-400 mt-1 px-2">
                {message.timestamp.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500">
              <AvatarFallback>
                <Bot className="w-5 h-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-4 bg-white">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 3 && (
        <div className="max-w-md mx-auto w-full px-6 pb-4">
          <p className="text-sm text-gray-600 mb-3">Hızlı Sorular:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(question)}
                className="text-xs rounded-full border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto p-4 space-y-3">
          {/* Seçilen Görsel Önizleme */}
          {selectedImage && (
            <div className="relative inline-block">
              <img
                src={selectedImage}
                alt="Seçilen görsel"
                className="h-20 rounded-lg border-2 border-teal-500 object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCameraClick}
              className="text-gray-400 hover:text-teal-600"
            >
              <Camera className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Mesajınızı yazın..."
                className="h-12 rounded-full pr-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 text-gray-400 hover:text-teal-600 rounded-full"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              size="icon"
              disabled={!inputValue.trim() && !selectedImage}
              className="h-12 w-12 bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-full shadow-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
