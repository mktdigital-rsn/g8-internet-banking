"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ArrowRight,
  HelpCircle,
  MessageCircle,
  Diamond,
  Calendar as CalendarIcon,
  AlertTriangle,
  ArrowLeft,
  Clock,
  QrCode,
  Smartphone,
  Mail,
  UserSquare2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

function PixPagarContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "key";

  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState<"input" | "confirm">("input");

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const formatCurrency = (val: string) => {
    const cleanValue = val.replace(/\D/g, "");
    if (!cleanValue) return "";
    const numberValue = parseInt(cleanValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setValue(rawValue);
  };

  const formatIdentifier = (val: string, type: string) => {
    const cleanValue = val.replace(/\D/g, "");

    if (type === "phone") {
      let v = cleanValue;
      if (v.length > 11) v = v.substring(0, 11);

      if (v.length > 10) {
        return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      } else if (v.length > 6) {
        return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
      } else if (v.length > 2) {
        return `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else if (v.length > 0) {
        return `(${v}`;
      }
      return v;
    }

    if (type === "cpf_cnpj") {
      const v = cleanValue;
      if (v.length <= 11) {
        // CPF: 000.000.000-00
        if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
        if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        if (v.length > 3) return v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        return v;
      } else {
        // CNPJ: 00.000.000/0000-00
        const c = v.substring(0, 14);
        if (c.length > 12) return c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
        if (c.length > 8) return c.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4");
        if (c.length > 5) return c.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
        if (c.length > 2) return c.replace(/(\d{2})(\d{1,3})/, "$1.$2");
        return c;
      }
    }

    return val;
  };

  const getPageInfo = () => {
    switch (type) {
      case "qrcode":
        return { title: "Escanear QR Code", icon: QrCode, placeholder: "Aponte a câmera..." };
      case "phone":
        return { title: "Pagar via Celular", icon: Smartphone, placeholder: "(00) 00000-0000" };
      case "email":
        return { title: "Pagar via E-mail", icon: Mail, placeholder: "exemplo@email.com" };
      case "cpf_cnpj":
        return { title: "Pagar via CPF/CNPJ", icon: UserSquare2, placeholder: "000.000.000-00" };
      case "copia_cola":
        return { title: "Pix Copia e Cola", icon: Copy, placeholder: "Cole o código Pix completo aqui" };
      default:
        return { title: "Pagar via Chave Pix", icon: Diamond, placeholder: "Insira a chave Pix" };
    }
  };

  const info = getPageInfo();

  return (
    <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar">
      {/* Main Content */}
      <div className="flex-1 space-y-8 max-w-4xl">
        {/* Page Title Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={step === "confirm" ? "#" : "/dashboard/pix"} onClick={(e) => {
              if (step === "confirm") {
                e.preventDefault();
                setStep("input");
              }
            }}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 h-12 w-12">
                <ArrowLeft className="h-6 w-6 text-[#f97316]" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-transparent font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest">G8Pay &bull; Pix</Badge>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">{step === "confirm" ? "Confirmação de Pagamento" : "Indicação de Pagamento"}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
                {step === "confirm" ? "Confirme o Pagamento" : info.title}
                <info.icon className="h-7 w-7 text-[#f97316] stroke-[2]" />
              </h1>
            </div>
          </div>
        </div>

        {/* PIX Form Section */}
        {step === "input" ? (
          <div className="space-y-10 max-w-2xl bg-white p-12 rounded-[56px] shadow-sm border border-neutral-50 shadow-black/5">
            {/* Form Context Info */}
            <div className="flex items-center gap-4 p-5 bg-neutral-50 rounded-3xl border border-neutral-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f97316] shadow-sm">
                <info.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Você está pagando via</p>
                <p className="font-black text-[#f97316] uppercase">{info.title.split("via ")[1] || info.title}</p>
              </div>
            </div>

            {/* Input field based on type */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#f97316]">Dados da Transação</h2>
              </div>

              {type === "qrcode" ? (
                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed border-neutral-200 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#f97316] transition-colors cursor-pointer group bg-neutral-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-neutral-400 group-hover:text-[#f97316] shadow-sm">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-[#f97316]">Anexe o arquivo QRCODE</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-sm font-bold text-neutral-400 border-b-2 border-transparent group-hover:border-neutral-300">Clique para Procurar</span>
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                      </div>
                    </div>
                  </div>
                  <div className="relative py-2 flex items-center">
                    <div className="flex-1 h-px bg-neutral-100" />
                    <span className="px-4 text-[10px] font-black text-neutral-300 uppercase tracking-widest">ou cole o código</span>
                    <div className="flex-1 h-px bg-neutral-100" />
                  </div>
                  <Input
                    value={pixCode}
                    onChange={(e) => setPixCode(e.target.value)}
                    placeholder="Digite ou cole o código"
                    className="h-16 bg-[#f5f5f5] border-transparent focus:border-[#f97316] focus:ring-0 rounded-2xl px-6 text-[#0c0a09] font-black text-xl placeholder:text-neutral-300"
                  />
                </div>
              ) : type === "copia_cola" ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder={info.placeholder}
                    value={pixCode}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPixCode(e.target.value)}
                    className="min-h-[160px] font-black text-xl"
                  />
                  <p className="text-[10px] text-neutral-400 font-bold text-right italic px-2 uppercase tracking-widest">Cole o código Pix completo para processar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={type === "email" ? identifier : formatIdentifier(identifier, type)}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={info.placeholder}
                    className="h-16 bg-[#f5f5f5] border-transparent focus:border-[#f97316] focus:ring-0 rounded-2xl px-6 text-[#0c0a09] font-black text-xl placeholder:text-neutral-300"
                  />
                  {type !== "qrcode" && (
                    <button className="flex items-center gap-2 group text-[#f97316] hover:text-[#f97316] transition-colors px-2">
                      <span className="text-sm font-bold border-b-2 border-transparent group-hover:border-[#f97316]">Buscar nos Meus Contatos</span>
                      <ChevronRight className="h-4 w-4 mt-0.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="h-px bg-neutral-100 w-full" />

            {/* Qual o Valor? */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#f97316]">Qual o Valor?</h2>
              <div className="relative">
                <Input
                  value={formatCurrency(value)}
                  onChange={handleValueChange}
                  placeholder="R$ 0,00"
                  className="h-20 bg-[#f5f5f5] border-transparent focus:border-[#f97316] focus:ring-0 rounded-3xl px-8 font-black text-4xl text-[#0c0a09] placeholder:text-neutral-200 tracking-tighter"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Badge className="bg-[#f97316] text-white hover:bg-[#f97316] rounded-lg px-2 py-1 font-mono text-[10px]">BRL</Badge>
                </div>
              </div>
            </div>

            <div className="h-px bg-neutral-100 w-full" />

            {/* Para Quando? */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#f97316]">Para Quando?</h2>
                <Badge variant="outline" className="rounded-full border-neutral-200 text-neutral-400 font-bold px-3 py-1 flex items-center gap-1.5 bg-neutral-50 shadow-sm">
                  <Clock className="h-3 w-3" />
                  D+0 (Liquidação Imediata)
                </Badge>
              </div>
              <div className="relative group">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-14 bg-[#f5f5f5] border-transparent focus:border-[#f97316] focus:ring-0 rounded-2xl px-6 text-[#0c0a09] font-black text-lg appearance-none cursor-pointer group-hover:bg-neutral-100 transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#f97316]">
                  <CalendarIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-[#fff9e6] border border-[#ffecb3] p-6 rounded-[32px] flex gap-5">
              <div className="bg-[#ff9800] p-2 h-fit rounded-[14px] mt-0.5 shadow-lg shadow-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-[#855e00] uppercase tracking-tight">Cuidado!</p>
                <p className="text-sm font-semibold text-[#855e00]/80 leading-relaxed">
                  Golpes de PIX estão em alta. Verifique a autenticidade das solicitações recebidas e não compartilhe informações pessoais ou financeiras. Proteja-se!
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => setStep("confirm")}
              className="w-full h-16 bg-[#f97316] hover:bg-[#c2410c] text-white rounded-3xl font-black text-xl shadow-2xl shadow-[#f97316]/20 transition-all active:scale-95 group"
            >
              Próximo
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ) : (
          <div className="space-y-10 max-w-2xl bg-white p-12 rounded-[56px] shadow-sm border border-neutral-50 shadow-black/5">
            <div className="space-y-8">
              <div className="p-8 bg-neutral-50 rounded-[40px] space-y-6">
                <div>
                  <p className="text-xl font-black text-[#f97316]">João Pereira da Silva</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">Nome do Beneficiário</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0c0a09]">123-458-789-10</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">CPF/CNPJ</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0c0a09]">Banco Bradesco</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">Instituição</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#f97316]">{formatCurrency(value) || "R$ 0,00"}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">Valor da Transferência</p>
                </div>
              </div>

              <div className="bg-[#fff9e6] border border-[#ffecb3] p-6 rounded-[32px] flex gap-5 items-center">
                <div className="w-8 h-8 rounded-full bg-[#ff9800] flex items-center justify-center text-white shrink-0">
                  <span className="font-bold text-xl">!</span>
                </div>
                <p className="text-sm font-semibold text-[#855e00]/90">
                  Confirme os dados do quem vai receber antes de pagar
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#f97316]">Confirmar Pagamento?</h3>
                <Button className="w-full h-16 bg-[#f97316] hover:bg-[#c2410c] text-white rounded-3xl font-black text-xl shadow-2xl shadow-[#f97316]/20 transition-all active:scale-95">
                  CONFIRMAR PAGAMENTO
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="w-[380px] shrink-0 space-y-8">
        <Card className="rounded-[48px] border-0 shadow-2xl shadow-black/5 bg-[#f97316] overflow-hidden relative group cursor-pointer h-[420px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="p-10 space-y-4 relative z-10 text-white">
            <h3 className="text-3xl font-black leading-tight max-w-[220px]">
              Completa para todos os perfis
            </h3>
            <p className="text-sm font-medium text-white/80 leading-relaxed max-w-[200px]">
              Milhares de produtos, descontos de até 50% e cupons exclusivos.
            </p>
            <button className="text-xs font-black text-white border-b-2 border-white pb-0.5 mt-8 hover:text-[#f97316] hover:border-[#f97316] transition-colors">
              VER PRODUTO
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-[240px] h-full flex items-end justify-end translate-y-10 group-hover:translate-y-4 transition-transform duration-700">
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=shopping"
              alt="Profile Premium"
              width={200}
              height={200}
              className="object-contain relative z-10 scale-150"
            />
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#f97316]">Ajuda</h2>
          <div className="flex gap-4">
            <button className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f5f5f5] rounded-[40px] hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-neutral-200 group">
              <div className="w-14 h-14 bg-[#f97316] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-12 group-hover:scale-110 transition-all">
                <HelpCircle className="h-7 w-7" />
              </div>
              <span className="font-black text-sm text-[#f97316] uppercase tracking-widest">Suporte</span>
            </button>
            <button className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f5f5f5] rounded-[40px] hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-neutral-200 group">
              <div className="w-14 h-14 bg-[#f97316] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:-rotate-12 group-hover:scale-110 transition-all">
                <MessageCircle className="h-7 w-7" />
              </div>
              <span className="font-black text-sm text-[#f97316] uppercase tracking-widest">Chat 24H</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PixPagarPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Carregando...</div>}>
      <PixPagarContent />
    </Suspense>
  );
}
