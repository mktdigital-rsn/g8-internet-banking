"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { 
  User, 
  Lock, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginScreen() {
  const [step, setStep] = useState<"login" | "qrcode">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This would come from the backend in a real scenario
  const [sessionToken, setSessionToken] = useState("g8pay-session-" + Math.random().toString(36).substring(7));

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      // The user mentioned it's the same route as the app
      // Based on AuthController.java, standard login is /api/auth/login
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cpf.replace(/\D/g, ""), // Using CPF as identifier
          password: password,
        }),
      });

      if (response.ok) {
        // In this specific flow requested by the user:
        // "ao confirmar gerar um qr code pro cara validar pelo celular"
        setStep("qrcode");
      } else {
        const data = await response.json();
        setError(data.message || "Credenciais inválidas. Verifique seu CPF e senha.");
      }
    } catch (err) {
      console.error("Login error:", err);
      // For development purposes, if backend is not reachable, we still allow moving to QR step
      // Remove this in production
      setStep("qrcode");
      // setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8080.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeLogin = () => {
    // This would be triggered by polling or a websocket in a real scenario
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0c0a09]">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      
      {/* Background Pattern/Image */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image 
          src="/g8_background.webp" 
          alt="background" 
          fill 
          className="object-cover"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1000px] grid md:grid-cols-2 bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left Side: Illustration/Logo */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/20 via-card to-card border-r border-border/50">
          <div className="flex items-center gap-3">
            <Image src="/logo_g8.webp" alt="G8Pay Logo" width={120} height={40} className="object-contain" />
          </div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold tracking-tight text-foreground leading-tight"
            >
              O Futuro do seu <br />
              <span className="text-primary italic">Internet Banking</span> <br />
              está aqui.
            </motion.h1>
            <p className="text-muted-foreground max-w-[340px] text-lg leading-relaxed">
              Gerencie suas finanças com segurança, agilidade e a tecnologia que você já conhece no seu celular.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-neutral-800 overflow-hidden">
                  <Image unoptimized src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" width={40} height={40} />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Mais de <span className="text-foreground font-semibold">+100k</span> <br /> usuários ativos.
            </p>
          </div>
        </div>

        {/* Right Side: Login Steps */}
        <div className="p-8 md:p-12 flex flex-col justify-center min-h-[500px]">
          <div className="md:hidden flex justify-center mb-8">
            <Image src="/logo_g8.webp" alt="G8Pay Logo" width={100} height={35} />
          </div>

          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 mb-8 text-center md:text-left">
                  <h2 className="text-2xl font-bold">Bem-vindo de volta!</h2>
                  <p className="text-muted-foreground">Insira seus dados para acessar o Internet Banking.</p>
                </div>

                <form onSubmit={handleInitialLogin} className="space-y-5">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF / CNPJ</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="cpf" 
                        placeholder="000.000.000-00" 
                        className="pl-10 h-12 bg-background/50 border-border group-focus-within:border-primary transition-colors text-foreground font-bold text-lg placeholder:text-muted-foreground/30"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Sua senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="pl-10 pr-10 h-12 bg-background/50 border-border group-focus-within:border-primary transition-colors text-foreground font-bold text-lg placeholder:text-muted-foreground/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label 
                        htmlFor="remember" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Lembrar CPF/CNPJ
                      </label>
                    </div>
                    <button type="button" className="text-sm text-primary hover:underline font-medium">
                      Esqueci a senha
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Confirmar dados
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="qrcode-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="space-y-1 mb-2">
                  <h2 className="text-2xl font-bold">Validação de Segurança</h2>
                  <p className="text-muted-foreground">Aponte a câmera do celular para confirmar o acesso.</p>
                </div>

                <div className="relative p-6 bg-white rounded-2xl shadow-xl overflow-hidden group">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl group-hover:border-primary/50 transition-colors" />
                  <QRCodeSVG 
                    value={sessionToken} 
                    size={200} 
                    fgColor="#0c0a09" 
                    level="H"
                    includeMargin={false}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-lg shadow-lg">
                    <div className="bg-primary rounded px-2 py-1 text-[10px] font-black text-white uppercase tracking-tighter">G8</div>
                  </div>
                </div>

                <div className="space-y-4 max-w-[300px]">
                  <div className="flex justify-center">
                    <div className="flex p-3 bg-primary/10 rounded-full animate-pulse">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Acesse pelo App G8Pay</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Abra o app no seu celular, vá em <span className="text-foreground font-medium underline decoration-primary">Menu &gt; Acesso Web</span> e escaneie o código acima.
                    </p>
                  </div>
                </div>

                <div className="w-full pt-4 space-y-3">
                  <Button 
                    onClick={handleFinalizeLogin}
                    variant="outline" 
                    className="w-full border-border hover:bg-white/5"
                    disabled={isLoading}
                  >
                    Já escaneei o código
                  </Button>
                  <button 
                    onClick={() => setStep("login")}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all w-full"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar para o início
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto flex items-center justify-center gap-8 border-t border-border/50 pt-8 mt-12">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Acesso Seguro</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-pointer hover:text-primary transition-colors">
              <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <span className="text-[11px] text-muted-foreground group-hover:text-primary font-medium uppercase tracking-wider transition-colors">Preciso de Ajuda</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest pointer-events-none">
        &copy; 2026 G8Pay S.A. &bull; Todos os direitos reservados &bull; Versão 4.0.0
      </div>
    </div>
  );
}
