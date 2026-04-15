"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  User,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Smartphone,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { temporaryDeviceIdAtom } from "@/store/auth";
import { useAtom } from "jotai";
import api from "@/lib/api";
import { toast } from "sonner";

type LoginStep = "identifier" | "virtual" | "qrcode";
type ChallengeStatus = "PENDING" | "APPROVED" | "EXPIRED";

type ChallengeResponse = {
  success: boolean;
  data: {
    token: string;
    qrcode: string;
    status: ChallengeStatus;
    expiresAt: string;
  };
  message: string | null;
};

type ChallengeStatusResponse = {
  success: boolean;
  data: {
    status: ChallengeStatus;
    expiresAt: string;
  };
  message: string | null;
};

type LoginResponse = {
  accessToken?: string;
  userToken?: string;
};

export default function LoginScreen() {
  const [, setTemporaryDeviceId] = useAtom(temporaryDeviceIdAtom);
  const [step, setStep] = useState<LoginStep>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordKeys, setPasswordKeys] = useState<string[][]>([]);
  const [challengeToken, setChallengeToken] = useState("");
  const [challengeQrCode, setChallengeQrCode] = useState("");
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus>("PENDING");
  const [challengeExpiresAt, setChallengeExpiresAt] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [hasFinalized, setHasFinalized] = useState(false);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const cleanIdentifier = useMemo(() => {
    const isEmail = identifier.includes("@");
    return isEmail ? identifier.trim().toLowerCase() : identifier.replace(/\D/g, "");
  }, [identifier]);

  const buildPassword = () => {
    return passwordKeys.map((pair) => pair.join("")).join("");
  };

  const resetChallenge = () => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setChallengeToken("");
    setChallengeQrCode("");
    setChallengeStatus("PENDING");
    setChallengeExpiresAt("");
    setIsPolling(false);
    setHasFinalized(false);
  };

  const addPasswordPair = (pair: string[]) => {
    if (passwordKeys.length >= 10) return;
    setPasswordKeys([...passwordKeys, pair]);
  };

  const removeLastPair = () => {
    setPasswordKeys(passwordKeys.slice(0, -1));
  };

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setStep("virtual");
  };

  const submitFinalLogin = async (token: string) => {
    if (hasFinalized) return;
    setHasFinalized(true);

    try {
      const payload = {
        email: cleanIdentifier,
        keys: passwordKeys,
        deviceId: token,
      };

      const response = await api.post<LoginResponse>("/api/auth/login/teclado-virtual", payload);

      if (response.status === 200) {
        const { accessToken, userToken } = response.data;
        if (accessToken) localStorage.setItem("token", accessToken);
        if (userToken) localStorage.setItem("userToken", userToken);

        toast.success("Login realizado!");
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.mensagem ||
        "Não foi possível concluir o acesso. Tente novamente.";
      toast.error(message);
      setHasFinalized(false);
      setIsPolling(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  };

  const schedulePoll = (token: string) => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
    }

    pollingTimerRef.current = setTimeout(async () => {
      const status = await pollChallengeStatus(token);
      if (status === "PENDING") {
        schedulePoll(token);
      }
    }, 2000);
  };

  const pollChallengeStatus = async (token: string) => {
    try {
      const response = await api.get<ChallengeStatusResponse>(
        `/api/auth/login/teclado-virtual/challenge/${token}/status`
      );

      const nextStatus = response.data.data.status;
      setChallengeStatus(nextStatus);
      setChallengeExpiresAt(response.data.data.expiresAt);

      if (nextStatus === "APPROVED") {
        stopPolling();
        await submitFinalLogin(token);
        return;
      }

      if (nextStatus === "EXPIRED") {
        stopPolling();
        setIsLoading(false);
        toast.error("O desafio expirou. Reinicie o acesso.");
      }

      return nextStatus;
    } catch (err: any) {
      const message = err.response?.data?.message || "Não foi possível verificar o desafio.";
      toast.error(message);
      stopPolling();
      setIsLoading(false);
      return null;
    }
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    resetChallenge();

    try {
      if (passwordKeys.length === 0) throw new Error("Selecione sua senha");

      const payload = {
        email: cleanIdentifier,
        password: buildPassword(),
        keys: passwordKeys,
      };

      const response = await api.post<ChallengeResponse>("/api/auth/login/teclado-virtual/challenge", payload);

      if (response.status === 200) {
        const { token, qrcode, status, expiresAt } = response.data.data;
        setTemporaryDeviceId(token);
        setChallengeToken(token);
        setChallengeQrCode(qrcode);
        setChallengeStatus(status);
        setChallengeExpiresAt(expiresAt);
        setStep("qrcode");
        setIsPolling(true);
        schedulePoll(token);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.mensagem ||
        "Não foi possível gerar o desafio QR Code.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleRestartFlow = () => {
    setPasswordKeys([]);
    resetChallenge();
    setTemporaryDeviceId("");
    setStep("identifier");
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }
    };
  }, []);

  const statusLabel =
    challengeStatus === "APPROVED"
      ? "Desafio aprovado"
      : challengeStatus === "EXPIRED"
        ? "Desafio expirado"
        : "Aguardando aprovação no app";

  const formattedExpiresAt = useMemo(() => {
    if (!challengeExpiresAt) return "";

    const parsedDate = new Date(challengeExpiresAt);
    if (Number.isNaN(parsedDate.getTime())) return challengeExpiresAt;

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsedDate);
  }, [challengeExpiresAt]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0c0a09]">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[500px] lg:max-w-[1000px] 2xl:max-w-[1400px] grid lg:grid-cols-2 bg-[#18181b] border border-white/5 rounded-[2px] overflow-hidden shadow-2xl relative z-10 min-h-[500px] lg:min-h-[600px] 2xl:min-h-[800px]"
      >
        <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-br from-primary/10 to-transparent">
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
                <span className="text-primary italic">Seguro.</span>
              </h1>
              <p className="text-neutral-300 text-sm 2xl:text-lg font-medium leading-relaxed max-w-[300px] 2xl:max-w-[450px]">
                Te ajudamos a gerenciar seu capital de forma inteligente e segura através da nossa tecnologia de ponta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 2xl:gap-5">
            <ShieldCheck className="text-green-500 h-5 w-5 2xl:h-7 2xl:w-7" />
            <span className="text-[10px] 2xl:text-xs font-bold uppercase tracking-[0.2em]">SSL SECURE PROTOCOL</span>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center relative bg-[#0c0a09]">
          <AnimatePresence mode="wait">
            {step === "identifier" && (
              <motion.div
                key="step-id"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-10 2xl:space-y-16 mt-12 lg:mt-0"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">Identificação</h2>
                  <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    Use seu CPF, CNPJ ou E-mail
                  </p>
                </div>

                <form onSubmit={handleIdentifierSubmit} className="space-y-6 2xl:space-y-10">
                  <div className="space-y-2 2xl:space-y-4">
                    <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-[#f97316] ml-1">Acessar com</label>
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
                  <button className="text-[10px] 2xl:text-xs font-black text-neutral-400 uppercase tracking-widest hover:text-white transition-colors">Dificuldade em acessar?</button>
                  <button className="text-[10px] 2xl:text-xs font-black text-[#f97316] uppercase tracking-widest hover:underline">Solicitar Acesso</button>
                </div>
              </motion.div>
            )}

            {step === "virtual" && (
              <motion.div
                key="step-virtual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-10 2xl:space-y-16 mt-12 lg:mt-0"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setStep("identifier")}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    type="button"
                  >
                    <ChevronLeft className="h-6 w-6 text-white/50" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-white">Teclado Virtual</h2>
                    <p className="text-white/40 text-sm font-medium">{cleanIdentifier || "Identificação pendente"}</p>
                  </div>
                </div>

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

                  <Button
                    onClick={handleLoginSubmit}
                    className="w-full h-16 text-lg font-black bg-[#f97316] hover:bg-[#ea580c] text-white rounded-2xl shadow-lg cursor-pointer"
                    disabled={isLoading || passwordKeys.length === 0}
                  >
                    {isLoading ? "Aguarde um instante" : "CONTINUAR"}
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
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Aprovação no App</h2>
                  <p className="text-white/40 font-medium">
                    Escaneie o QR Code no aplicativo para concluir o login.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-[40px]">
                  {challengeQrCode ? (
                    <img src={challengeQrCode} alt="QR Code do desafio" className="h-[220px] w-[220px]" />
                  ) : (
                    <QRCodeSVG value={challengeToken} size={220} level="H" />
                  )}
                </div>

                <div className="w-full max-w-md space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left">
                  <div className="flex items-center gap-3 text-white">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold">{statusLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-xs font-medium">
                      Expira em: {formattedExpiresAt || "aguardando resposta"}
                    </span>
                  </div>
                </div>

                {challengeStatus === "EXPIRED" ? (
                  <Button
                    onClick={handleRestartFlow}
                    className="w-full max-w-md h-14 text-base font-black bg-[#f97316] hover:bg-[#ea580c] text-white rounded-2xl"
                  >
                    <RefreshCcw className="h-5 w-5 mr-2" />
                    REINICIAR ACESSO
                  </Button>
                ) : (
                  <div className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30">
                    Aguardando aprovação automática
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
