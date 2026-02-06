import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Heart, Mail, Lock, Chrome } from "lucide-react";

interface AuthScreenProps {
  onLogin: (email?: string) => void;
}

import { useUser } from "../context/UserContext";

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const res = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success) {
          // Sync with context immediately
          await login(email);
          // Save to local storage for persistence
          localStorage.setItem("nutrimedai_user_email", email);
          onLogin(email); // Parent handles navigation
        } else {
          setError(data.message || "Giriş başarısız.");
        }

      } else {
        // Register Logic
        const res = await fetch("http://localhost:5000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, surname, email, password }),
        });
        const data = await res.json();

        if (data.success) {
          alert(`Kayıt başarılı! Hoşgeldin ${name} ${surname}, şimdi giriş yapabilirsiniz.`);
          setIsLogin(true); // Switch to login
        } else {
          setError(data.message || "Kayıt başarısız.");
        }
      }
    } catch (err) {
      setError(`Bağlantı hatası: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-xl">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">NutriMedAI</h1>
            <p className="text-gray-600 mt-2">Sağlığınız için akıllı asistan</p>
          </div>
        </div>

        {/* Giriş Formu */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Sağlık verilerinize erişmek için giriş yapın"
                : "Yeni bir hesap oluşturun"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname">Soyad</Label>
                    <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                  </div>
                </div>
              )}

              {/* E-posta */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  E-posta
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Şifremi Unuttum */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
              )}

              {/* Giriş Butonu */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl shadow-lg"
              >
                {isLoading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Hesap Oluştur")}
              </Button>
            </form>

            {/* Ayırıcı */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">veya</span>
              </div>
            </div>

            {/* Google ile Giriş */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-2 hover:bg-gray-50"
              onClick={() => alert("Yakında")}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Google ile Devam Et
            </Button>

            {/* Hesap Değiştirme */}
            <div className="text-center text-sm">
              <span className="text-gray-600">
                {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
              >
                {isLogin ? "Hesap Oluştur" : "Giriş Yap"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Güvenlik Notu */}
        <p className="text-center text-xs text-gray-500 px-4">
          Giriş yaparak{" "}
          <a href="#" className="text-teal-600 hover:underline">
            Kullanım Koşulları
          </a>{" "}
          ve{" "}
          <a href="#" className="text-teal-600 hover:underline">
            Gizlilik Politikası
          </a>
          'nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
