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
import axios from "axios";
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

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
        response = await axios.post(`${apiUrl}/api/auth/login/teclado-virtual`, payload);
      } else {
        if (!passwordText) throw new Error("Digite sua senha");

        const payload = {
          email: cleanIdentifier,
          password: passwordText
        };
        console.log("SENDING TRADITIONAL LOGIN:", payload.email);
        response = await axios.post(`${apiUrl}/api/auth/login`, payload);
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0c0a09]">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1100px] grid md:grid-cols-2 bg-[#0c0a09] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative z-10 min-h-[650px]"
      >
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-br from-primary/10 to-transparent">
          <div>
            <Image src="/logo_g8.webp" alt="G8Pay Logo" width={140} height={50} className="object-contain" />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full px-4 py-1 text-[10px] bg-primary/20 text-primary border-0 font-black uppercase tracking-widest w-fit">
                Internet Banking
              </div>
              <h1 className="text-5xl font-black tracking-tight text-white leading-[1.1]">
                Acesso <br />
                Seguro à <br />
                <span className="text-primary italic">Plataforma.</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/40">
            <ShieldCheck className="text-primary h-6 w-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocolo SSL Ativo</span>
          </div>
        </div>

        {/* Right Side: Flow */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative bg-[#0c0a09]">
          <AnimatePresence mode="wait">
            {step === "identifier" && (
              <motion.div
                key="step-id"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">Identificação</h2>
                  <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Use seu CPF ou E-mail</p>
                </div>

                <form onSubmit={handleIdentifierSubmit} className="space-y-6">
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="000.000.000-00"
                      className="pl-14 h-16 bg-white/[0.03] border-white/10 group-focus-within:border-primary/50 transition-all text-white font-black text-xl rounded-2xl placeholder:text-white/10"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 text-lg font-black transition-all hover:scale-[1.02] bg-[#f97316] hover:bg-[#ea580c] text-white cursor-pointer"
                    disabled={!identifier}
                  >
                    AVANÇAR
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </form>
              </motion.div>
            )}

            {step === "password" && (
              <motion.div
                key="step-pass"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => setStep("identifier")} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6 text-white/50" />
                  </button>
                  <h2 className="text-2xl font-black text-white">Senha</h2>
                </div>

                <div className="space-y-6">
                  {passwordMode === "virtual" ? (
                    <div className="space-y-6">
                      <div className="h-16 flex items-center justify-center gap-3 bg-white/[0.04] rounded-3xl border border-white/[0.08] font-mono text-2xl text-primary tracking-[0.5em]">
                        {shownPassword || <span className="text-white/10 text-[10px] uppercase font-black">Teclado Virtual</span>}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {numberPairs.map((pair, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addPasswordPair(pair)}
                            className="h-14 bg-white/[0.08] hover:bg-[#f97316] border border-white/10 rounded-2xl text-white font-black text-lg transition-all"
                          >
                            {pair[0]} ou {pair[1]}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={removeLastPair}
                          className="h-14 bg-red-600/20 hover:bg-red-600/40 text-red-500 font-black text-[10px] uppercase rounded-2xl"
                        >
                          APAGAR
                        </button>
                      </div>
                    </div>
                  ) : (
                    null
                  )}

                  <Button
                    onClick={handleLoginSubmit}
                    className="w-full h-16 text-lg font-black bg-[#f97316] hover:bg-[#ea580c] text-white rounded-2xl shadow-lg cursor-pointer"
                    disabled={isLoading || (passwordMode === 'virtual' ? passwordKeys.length === 0 : !passwordText)}
                  >
                    {isLoading ? "Validando..." : "CONFIRMAR"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "qrcode" && (
              <motion.div
                key="step-qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-8 text-center"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Segurança Ativa</h2>
                  <p className="text-white/40 font-medium">Aponte seu App G8Pay para o código abaixo.</p>
                </div>

                <div className="p-8 bg-white rounded-[40px]">
                  <QRCodeSVG value={sessionToken} size={220} level="H" />
                </div>

                <Button
                  onClick={handleFinalizeLogin}
                  variant="link"
                  className="text-primary font-black text-[10px] uppercase tracking-widest"
                >
                  CONCLUIR ACESSO
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}