"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Share2, 
  Download, 
  Diamond,
  Plus,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function PixReceberPage() {
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"setup" | "qr">("setup");
  const [pixPayload, setPixPayload] = useState("00020126580014br.gov.bcb.pix01368ecf75a1-432a-4ad5-961d-9e6b34017f8a52040000530398654045.005802BR5913PEDRO MARQUES6009SAO PAULO62070503***6304E2D1");

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

  return (
    <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar">
      {/* Main Content */}
      <div className="flex-1 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/pix">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 h-12 w-12">
                 <ArrowLeft className="h-6 w-6 text-[#f97316]" />
              </Button>
            </Link>
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-transparent font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest">G8Pay &bull; Pix</Badge>
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Receber Pagamento</span>
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
                 {step === "setup" ? "Quanto quer receber?" : "QR Code Gerado"}
                 <QrCode className="h-7 w-7 text-[#f97316] stroke-[2]" />
               </h1>
            </div>
          </div>
        </div>

        {step === "setup" ? (
          <div className="bg-white rounded-[56px] p-12 border border-neutral-100 shadow-sm space-y-10 max-w-2xl">
             <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#f97316]">Valor a cobrar (opcional)</h2>
                <div className="relative">
                   <Input 
                      value={formatCurrency(value)}
                      onChange={handleValueChange}
                      placeholder="R$ 0,00" 
                      className="h-20 bg-[#f5f5f5] border-transparent focus:border-[#f97316] focus:ring-0 rounded-3xl px-8 font-black text-4xl text-[#0c0a09] placeholder:text-neutral-200 tracking-tighter"
                   />
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest px-2">Se deixar zerado, quem paga define o valor.</p>
             </div>

             <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#f97316]">Descrição (opcional)</h2>
                <Input 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Ex: Almoço de domingo" 
                   className="h-16 bg-[#f5f5f5] border-transparent focus:border-[#f97316] focus:ring-0 rounded-2xl px-6 text-[#0c0a09] font-black text-lg"
                />
             </div>

             <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 flex items-center justify-between">
                <div>
                   <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Chave Pix Selecionada</p>
                   <p className="font-black text-[#0c0a09]">123.456.789-10 (CPF)</p>
                </div>
                <button className="text-[#f97316] font-black text-[10px] uppercase tracking-widest underline">Alterar</button>
             </div>

             <Button 
               onClick={() => setStep("qr")}
               className="w-full h-16 bg-[#f97316] hover:bg-orange-600 text-white rounded-3xl font-black text-xl shadow-2xl shadow-[#f97316]/20 transition-all active:scale-95"
             >
                GERAR QR CODE
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
             <Card className="bg-white rounded-[56px] p-12 border border-neutral-100 shadow-sm flex flex-col items-center justify-center space-y-8">
                <div className="p-6 bg-white rounded-[40px] shadow-2xl border border-neutral-50 relative group">
                   <QRCodeSVG value={pixPayload} size={240} fgColor="#0c0a09" />
                   <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px]">
                      <button className="bg-[#f97316] text-white p-4 rounded-full shadow-lg">
                         <Download className="h-6 w-6" />
                      </button>
                   </div>
                </div>
                <div className="text-center">
                   <p className="text-3xl font-black text-[#0c0a09] font-mono tracking-tighter">{formatCurrency(value) || "Valor em Aberto"}</p>
                   <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">{description || "Pagamento Sem Descrição"}</p>
                </div>
             </Card>

             <div className="space-y-6 flex flex-col justify-center">
                <Button className="w-full h-16 bg-[#0c0a09] hover:bg-neutral-800 text-white rounded-3xl font-black text-lg flex items-center gap-4 transition-all active:scale-95">
                   <Copy className="h-6 w-6 text-[#f97316]" />
                   COPIAR CÓDIGO PIX
                </Button>
                <Button className="w-full h-16 bg-white border border-neutral-200 hover:bg-neutral-50 text-[#0c0a09] rounded-3xl font-black text-lg flex items-center gap-4 transition-all active:scale-95">
                   <Share2 className="h-6 w-6 text-[#f97316]" />
                   COMPARTILHAR
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setStep("setup")}
                  className="w-full h-16 text-neutral-400 hover:text-[#f97316] font-black uppercase tracking-widest text-xs flex items-center gap-3"
                >
                   <RefreshCw className="h-4 w-4" />
                   Gerar Novo QR Code
                </Button>
             </div>
          </div>
        )}
      </div>

      {/* Side Column */}
      <div className="w-[380px] shrink-0 space-y-8">
         <Card className="rounded-[44px] border-0 bg-neutral-900 p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
               <div className="w-16 h-16 bg-[#f97316] rounded-2xl flex items-center justify-center">
                  <Diamond className="h-8 w-8 text-white" />
               </div>
               <h3 className="text-2xl font-black leading-tight italic">G8Pay &bull; Business</h3>
               <p className="text-xs text-white/50 leading-relaxed font-medium">Aumente suas vendas aceitando Pix. Gestão completa de recebimentos em tempo real.</p>
               <Button className="w-full bg-white text-[#0c0a09] hover:bg-white/90 rounded-2xl font-black text-[10px] uppercase tracking-widest h-12">CONHECER AGORA</Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
