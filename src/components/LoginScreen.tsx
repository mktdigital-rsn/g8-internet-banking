"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  User,
  Lock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Delete,
  ChevronLeft,
  Keyboard,
  Eye,
  EyeOff
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

type LoginStep = "identifier" | "password" | "qrcode";

export default function LoginScreen() {
  const [step, setStep] = useState<LoginStep>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [passwordMode, setPasswordMode] = useState<"virtual" | "input">("virtual");
  const [passwordText, setPasswordText] = useState("");
  const [passwordKeys, setPasswordKeys] = useState<string[][]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState("");

  const numberPairs = [
    ["0", "1"],
    ["2", "3"],
    ["4", "5"],
    ["6", "7"],
    ["8", "9"],
  ];

  const shownPassword = useMemo(() => {
    return passwordKeys.map(() => "●").join(" ");
  }, [passwordKeys]);

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setStep("password");
  };

  const addPasswordPair = (pair: string[]) => {
    if (passwordKeys.length >= 10) return;
    setPasswordKeys([...passwordKeys, pair]);
  };

  const removeLastPair = () => {
    setPasswordKeys(passwordKeys.slice(0, -1));
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);

    try {
      // Force lowercase only if it's an email format
      const isEmail = identifier.includes("@");
      const cleanIdentifier = isEmail
        ? identifier.trim().toLowerCase()
        : identifier.replace(/\D/g, "");

      let response;

      if (passwordMode === "virtual") {
        if (passwordKeys.length === 0) throw new Error("Selecione sua senha");

        const deviceNameRaw = typeof window !== 'undefined' ? window.navigator.userAgent : "Web";
        const deviceNameEncoded = btoa(unescape(encodeURIComponent(deviceNameRaw)));

        const payload = {
          email: cleanIdentifier,
          keys: passwordKeys,
          deviceId: "IB-WEB-PLATFORM",
          deviceName: deviceNameEncoded, // Send Base64 as app does
        };

        console.log("SENDING TECLADO VIRTUAL LOGIN:", payload.email);
        response = await api.post("/api/auth/login/teclado-virtual", payload);
      } else {
        if (!passwordText) throw new Error("Digite sua senha");

        const payload = {
          email: cleanIdentifier,
          password: passwordText
        };
        console.log("SENDING TRADITIONAL LOGIN:", payload.email);
        response = await api.post("/api/auth/login", payload);
      }

      if (response.status === 200) {
        const { accessToken, userToken } = response.data;
        if (accessToken) localStorage.setItem("token", accessToken);
        if (userToken) localStorage.setItem("userToken", userToken);

        toast.success("Login realizado!");
        setSessionToken("session-" + Math.random().toString(36).substring(7));
        setStep("qrcode");
      }
    } catch (err: any) {
      console.error("Login Error details:", err);

      // Check if it's the BadCredentialsException being sent back
      const message = err.response?.data?.message || err.response?.data?.mensagem || "Senha ou usuário incorretos.";
      toast.error(message);

      setPasswordKeys([]);
      setPasswordText("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 2xl:p-10 relative bg-[#09090b]">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 2xl:w-[1000px] 2xl:h-[1000px] bg-[#ea580c]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[500px] lg:max-w-[1000px] 2xl:max-w-[1400px] grid lg:grid-cols-2 bg-[#18181b] border border-white/5 rounded-[2px] overflow-hidden shadow-2xl relative z-10 min-h-[500px] lg:min-h-[600px] 2xl:min-h-[800px]"
      >
        {/* Left Side: Branding (Hidden on Tablet/Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-16 2xl:p-24 bg-[#1f1f23] border-r border-white/5">
          <div>
            <Image src="/logo_g8_white.png" alt="G8Pay Logo" width={160} height={60} className="object-contain 2xl:scale-125 origin-left" />
          </div>

          <div className="space-y-8 2xl:space-y-12">
            <div className="space-y-5 2xl:space-y-8">
              <div className="inline-flex items-center rounded-[2px] px-3 py-1 text-[11px] 2xl:text-xs bg-white/5 text-white/70 border border-white/10 font-bold uppercase tracking-widest w-fit">
                Internet Banking
              </div>
              <h1 className="text-5xl 2xl:text-7xl font-black tracking-tighter text-white leading-[1.05]">
                Acesso <br />
                Seguro à <br />
                <span className="text-[#ea580c]">Plataforma.</span>
              </h1>
              <p className="text-white/40 text-sm 2xl:text-lg font-medium leading-relaxed max-w-[300px] 2xl:max-w-[450px]">
                Te ajudamos a gerenciar seu capital de forma inteligente e segura através da nossa tecnologia de ponta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white/20 2xl:gap-5">
            <ShieldCheck className="text-[#ea580c] h-5 w-5 2xl:h-7 2xl:w-7" />
            <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-[0.2em]">SSL SECURE PROTOCOL</span>
          </div>
        </div>

        {/* Right Side: Flow */}
        <div className="p-8 md:p-12 lg:p-20 2xl:p-32 flex flex-col justify-center relative bg-[#18181b]">
          {/* Mobile/Tablet Logo */}
          <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 w-full flex justify-center px-8">
            <Image src="/logo_g8_white.png" alt="G8Pay Logo" width={120} height={40} className="object-contain" />
          </div>

          <AnimatePresence mode="wait">
            {step === "identifier" && (
              <motion.div
                key="step-id"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-10 2xl:space-y-16 mt-12 lg:mt-0"
              >
                <div className="space-y-3 2xl:space-y-5">
                  <h2 className="text-4xl 2xl:text-6xl font-black text-white tracking-tighter">Identificação</h2>
                  <p className="text-white/30 font-bold uppercase text-[11px] 2xl:text-sm tracking-[0.2em]">Digite seu CPF ou E-mail da conta</p>
                </div>

                <form onSubmit={handleIdentifierSubmit} className="space-y-6 2xl:space-y-10">
                  <div className="space-y-2 2xl:space-y-4">
                    <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-[#ea580c]/80 ml-1">Acessar com</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 2xl:h-7 2xl:w-7 text-white/20 group-focus-within:text-[#ea580c] transition-colors" />
                      <Input
                        placeholder="000.000.000-00"
                        className="pl-14 2xl:pl-20 h-16 2xl:h-24 bg-white/[0.02] border-white/10 focus:border-[#ea580c]/50 focus:bg-white/[0.04] transition-all text-white font-bold text-xl 2xl:text-3xl rounded-[2px] placeholder:text-white/5 shadow-inner"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 2xl:h-24 text-sm 2xl:text-xl font-black transition-all bg-[#ea580c] hover:bg-[#c2410c] text-white cursor-pointer rounded-[2px] tracking-widest shadow-xl shadow-orange-950/20"
                    disabled={!identifier}
                  >
                    AVANÇAR PARA SENHA
                    <ArrowRight className="h-4 w-4 2xl:h-6 2xl:w-6 ml-3" />
                  </Button>
                </form>

                <div className="pt-6 2xl:pt-10 border-t border-white/5 flex items-center justify-between">
                  <button className="text-[10px] 2xl:text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Dificuldade em acessar?</button>
                  <button className="text-[10px] 2xl:text-xs font-black text-[#ea580c] uppercase tracking-widest hover:underline">Solicitar Acesso</button>
                </div>
              </motion.div>
            )}

            {step === "password" && (
              <motion.div
                key="step-pass"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-10 2xl:space-y-16 mt-12 lg:mt-0"
              >
                <div className="flex items-center gap-5 2xl:gap-8">
                  <button onClick={() => setStep("identifier")} className="p-2 2xl:p-4 hover:bg-white/5 rounded-full transition-colors border border-white/10">
                    <ChevronLeft className="h-5 w-5 2xl:h-8 2xl:w-8 text-white/50" />
                  </button>
                  <div className="space-y-1">
                    <h2 className="text-3xl 2xl:text-5xl font-black text-white tracking-tighter">Senha</h2>
                    <p className="text-white/30 font-bold uppercase text-[10px] 2xl:text-sm tracking-widest">Usuário: {identifier}</p>
                  </div>
                </div>

                <div className="space-y-8 2xl:space-y-12">
                  {passwordMode === "virtual" ? (
                    <div className="space-y-6 2xl:space-y-10">
                      <div className="h-16 2xl:h-24 flex items-center justify-center gap-3 2xl:gap-6 bg-black/20 rounded-[2px] border border-white/10 font-mono text-xl 2xl:text-4xl text-[#ea580c] tracking-[0.5em] shadow-inner">
                        {shownPassword || <span className="text-white/10 text-[10px] 2xl:text-sm uppercase font-black tracking-[0.3em]">Senha Eletrônica</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-3 2xl:gap-5">
                        {numberPairs.map((pair, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addPasswordPair(pair)}
                            className="h-14 2xl:h-20 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2px] text-white font-black text-lg 2xl:text-2xl transition-all active:scale-[0.98] hover:border-[#ea580c]/50"
                          >
                            {pair[0]} ou {pair[1]}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={removeLastPair}
                          className="h-14 2xl:h-20 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-[11px] 2xl:text-sm uppercase rounded-[2px] border border-red-500/20 tracking-widest"
                        >
                          CORRIGIR
                        </button>
                      </div>
                    </div>
                  ) : (
                    null
                  )}

                  <Button
                    onClick={handleLoginSubmit}
                    className="w-full h-16 2xl:h-24 text-sm 2xl:text-xl font-black bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-[2px] shadow-lg shadow-orange-950/30 cursor-pointer tracking-widest"
                    disabled={isLoading || (passwordMode === 'virtual' ? passwordKeys.length === 0 : !passwordText)}
                  >
                    {isLoading ? "PROCESSANDO..." : "ENTRAR NA CONTA"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "qrcode" && (
              <motion.div
                key="step-qr"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-10 2xl:space-y-16 text-center mt-12 lg:mt-0"
              >
                <div className="space-y-3 2xl:space-y-6">
                  <div className="w-12 h-12 2xl:w-20 2xl:h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <ShieldCheck className="h-6 w-6 2xl:h-10 2xl:w-10" />
                  </div>
                  <h2 className="text-3xl 2xl:text-5xl font-black text-white tracking-tighter">Validar Dispositivo</h2>
                  <p className="text-white/40 font-medium text-sm 2xl:text-lg">Aponte a câmera do App G8Pay para o código abaixo.</p>
                </div>

                <div className="p-8 2xl:p-14 bg-white rounded-[4px] shadow-[0_0_50px_rgba(234,88,12,0.1)]">
                  <QRCodeSVG value={sessionToken} size={typeof window !== 'undefined' && window.innerWidth > 1600 ? 300 : 200} level="H" />
                </div>

                <Button
                  onClick={handleFinalizeLogin}
                  className="w-full h-14 2xl:h-20 bg-white/5 hover:bg-white/10 text-white font-black text-[11px] 2xl:text-sm uppercase tracking-widest rounded-[2px] border border-white/10"
                >
                  Continuar para o Painel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}