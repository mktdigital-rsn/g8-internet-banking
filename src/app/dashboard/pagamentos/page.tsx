"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { 
  Barcode, 
  QrCode, 
  Calendar, 
  History, 
  FileText, 
  ShieldCheck, 
  Smartphone,
  CreditCard,
  Building2,
  HelpCircle,
  MessageCircle,
  Diamond,
  ArrowRight,
  Search,
  AlertCircle,
  ArrowLeft,
  Download,
  CheckCircle2,
  Fingerprint,
  AlertTriangle,
  Clock,
  X,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PagamentosPage() {
  const router = useRouter();
  
  // State Machine
  const [step, setStep] = useState<"landing" | "review" | "sms" | "success">("landing");
  
  // Data State
  const [barcode, setBarcode] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [boletoData, setBoletoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Security State
  const [smsCode, setSmsCode] = useState("");
  const [pinId, setPinId] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Handlers
  const handleConsultBoleto = async () => {
    if (!barcode || barcode.length < 10) {
      toast.error("Por favor, insira um código de barras válido.");
      return;
    }
    
    setIsConsulting(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";
      
      const res = await axios.post(`${apiUrl}/api/banco/pagamentos/consultar-boleto`, 
        { 
          linhaDigitavel: barcode.replace(/\D/g, ""),
          deviceId: "IB-WEB-PLATFORM" 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        setBoletoData(res.data.data || res.data);
        setStep("review");
        toast.success("Boleto consultado com sucesso!");
      }
    } catch (err: any) {
      console.error("Erro ao consultar boleto:", err);
      toast.error(err.response?.data?.message || "Erro ao localizar boleto. Verifique os dados.");
    } finally {
      setIsConsulting(false);
    }
  };

  const handleRequestSms = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";
      
      const res = await axios.post(`${apiUrl}/api/users/solicitar-pin`,
        { amount: String(boletoData?.valorTotal || boletoData?.valor || "0") },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setPinId(res.data.pinId || res.data.id || "");
        setStep("sms");
        toast.success("Código de segurança enviado por SMS.");
      }
    } catch (err) {
      toast.error("Erro ao solicitar código de segurança.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizePayment = async () => {
    if (smsCode.length < 5) {
      toast.error("Digite o código recebido.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userToken = localStorage.getItem("userToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

      // 1. Validar PIN
      await axios.post(`${apiUrl}/api/users/validar-pin`,
        { pin: smsCode, pinId: pinId },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'usertoken': userToken || ""
          } 
        }
      );

      // 2. Efetivar Pagamento
      const res = await axios.post(`${apiUrl}/api/banco/pagamentos/pagar-boleto`,
        {
          linhaDigitavel: boletoData?.linhaDigitavel || barcode.replace(/\D/g, ""),
          deviceId: "IB-WEB-PLATFORM",
          pin: smsCode
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'usertoken': userToken || ""
          } 
        }
      );

      if (res.data) {
        const apiData = res.data.data || res.data;
        setTransactionId(apiData.idLiquidante || apiData.id || "PAG" + Math.random().toString(36).substring(7).toUpperCase());
        setStep("success");
        toast.success("Pagamento realizado com sucesso!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao processar pagamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";
      const response = await axios.get(`${apiUrl}/api/banco/extrato/imprimir-item/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprovante_pagamento_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Erro ao gerar comprovante.");
    }
  };

  const manageOptions = [
    { icon: Calendar, label: "Agendamentos", href: "#" },
    { icon: History, label: "Histórico", href: "#" },
    { icon: ShieldCheck, label: "DDA", href: "#" },
    { icon: FileText, label: "Comprovantes", href: "#" },
  ];

  const formatCurrency = (val: any) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val || 0);
  };

  return (
    <div className="p-4 md:p-8 xl:p-12 flex flex-col xl:flex-row gap-8 xl:gap-12 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      
      <div className="flex-1 space-y-12 relative z-10">
        {/* Step-based Content */}
        {step === "landing" && (
          <>
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">Serviços Financeiros</Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">
                Área <span className="text-[#f97316]">PAGAMENTOS</span>
              </h1>
              <p className="text-sm md:text-base text-neutral-400 font-bold max-w-2xl">
                Pague boletos, tributos e contas de consumo com rapidez e segurança G8 Bank.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-12">
                <div className="bg-white p-8 md:p-12 rounded-[32px] border border-neutral-100 shadow-2xl shadow-black/[0.03] space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#f97316]/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  
                  <div className="space-y-2 relative z-10">
                    <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight">Pagar novo boleto</h2>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-loose">Cole a linha digitável ou escaneie o código</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    <div className="flex-1 relative group/input">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-[#f97316] transition-colors">
                        <Barcode className="h-6 w-6" />
                      </div>
                      <Input 
                        placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
                        className="h-16 pl-16 bg-neutral-50 border-neutral-100 rounded-2xl text-sm font-black tracking-widest focus:ring-2 focus:ring-[#f97316]/20 transition-all placeholder:text-neutral-300"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                      />
                    </div>
                    <Button 
                        onClick={handleConsultBoleto}
                        disabled={isConsulting}
                        className="h-16 px-10 bg-[#0c0a09] hover:bg-[#1a1715] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-black/10 shrink-0"
                    >
                      {isConsulting ? "PROCESSANDO..." : "CONFERIR BOLETO"}
                      {!isConsulting && <ArrowRight className="h-5 w-5 ml-2" />}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      <div className="p-6 bg-[#fffbeb] rounded-2xl border border-neutral-200/20 hover:shadow-xl transition-all group cursor-pointer flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#f97316] group-hover:scale-110 transition-transform shadow-sm">
                              <QrCode className="h-7 w-7 stroke-[2.5]" />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-black text-[#0c0a09] uppercase tracking-widest">Ler QR Code</span>
                              <span className="text-[10px] font-bold text-neutral-400 mt-1">Use a câmera do seu celular</span>
                          </div>
                      </div>
                      <div className="p-6 bg-[#fffbeb] rounded-2xl border border-neutral-200/20 hover:shadow-xl transition-all group cursor-pointer flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#f97316] group-hover:scale-110 transition-transform shadow-sm">
                              <History className="h-7 w-7 stroke-[2.5]" />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-black text-[#0c0a09] uppercase tracking-widest">Recentes</span>
                              <span className="text-[10px] font-bold text-neutral-400 mt-1">Re-pague uma conta</span>
                          </div>
                      </div>
                  </div>
                </div>

                <div className="space-y-6 text-center md:text-left">
                  <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Gestão de Contas</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {manageOptions.map((opt, i) => (
                       <div key={i} className="flex flex-col items-center justify-center w-full min-h-[160px] bg-[#fffbeb] rounded-2xl hover:shadow-2xl hover:scale-[1.05] transition-all border border-neutral-200/20 group cursor-pointer p-6">
                          <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] bg-white rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                              <opt.icon className="h-6 w-6 stroke-[2.5]" />
                          </div>
                          <span className="text-[11px] font-black text-[#0c0a09] text-center px-1 uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100 group-hover:text-[#f97316] transition-colors">{opt.label}</span>
                       </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <Card className="rounded-3xl border-0 shadow-2xl shadow-black/5 bg-[#0c0a09] p-10 space-y-8 relative overflow-hidden group cursor-pointer border border-white/5 h-[400px]">
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f97316]/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-6">
                    <Badge className="bg-[#f97316] text-white border-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest">Segurança G8</Badge>
                    <h3 className="text-3xl font-black text-white leading-tight">
                      Evite fraudes <br />
                      no seu <span className="text-[#f97316]">DDA.</span>
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed font-medium">
                      Ative o Débito Direto Autorizado e visualize todos os boletos emitidos no seu CPF automaticamente.
                    </p>
                  </div>
                  <div className="absolute bottom-0 right-0 w-[220px] h-[220px] z-0 opacity-40 group-hover:opacity-80 transition-opacity translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                    <Image 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=security&backgroundColor=0c0a09" 
                      alt="Security" 
                      fill
                      className="object-contain"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {step === "review" && boletoData && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep("landing")} className="rounded-full h-12 w-12 hover:bg-neutral-100">
                <ArrowLeft className="h-6 w-6 text-[#f97316]" />
              </Button>
              <h2 className="text-3xl font-black text-[#0c0a09] tracking-tighter uppercase">Confirme os dados</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-8">
                <div className="bg-white p-10 rounded-[32px] border border-neutral-100 shadow-2xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-2 opacity-60">Beneficiário</p>
                      <h3 className="text-2xl font-black text-[#0c0a09] uppercase">{boletoData.beneficiario || boletoData.nomeBeneficiario || "NÃO IDENTIFICADO"}</h3>
                    </div>
                    <div className="w-16 h-16 bg-[#fffbeb] rounded-2xl flex items-center justify-center text-[#f97316]">
                      <Building2 className="h-8 w-8" />
                    </div>
                  </div>

                  <Separator className="bg-neutral-100" />

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-2 opacity-60">Vencimento</p>
                      <p className="text-lg font-black text-[#0c0a09]">{boletoData.dataVencimento || boletoData.vencimento || "---"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-2 opacity-60">Data de Pagamento</p>
                      <p className="text-lg font-black text-[#f97316]">Hoje</p>
                    </div>
                  </div>

                  <div className="p-8 bg-[#fffbeb] rounded-2xl border border-orange-100">
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-3 opacity-60">Valor do Pagamento</p>
                    <p className="text-5xl font-black text-[#f97316] font-mono tracking-tighter">
                      {formatCurrency(boletoData.valorTotal || boletoData.valor)}
                    </p>
                  </div>

                  <Button 
                    onClick={handleRequestSms}
                    disabled={isLoading}
                    className="w-full h-20 bg-[#0c0a09] hover:bg-[#1a1715] text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-black/20"
                  >
                    {isLoading ? "PROCESSANDO..." : "AUTORIZAR PAGAMENTO"}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="p-6 bg-[#fff9e6] border border-[#ffecb3] rounded-2xl space-y-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-black text-orange-800 uppercase leading-loose">
                    Certifique-se de que os dados acima correspondem ao boleto que você deseja pagar. Pagamentos realizados após as 20h serão liquidados no próximo dia útil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "sms" && (
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-10 py-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-[#fffbeb] rounded-3xl flex items-center justify-center text-[#f97316] shadow-xl relative animate-bounce">
                <Smartphone className="h-12 w-12" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f97316] rounded-full border-4 border-[#f8f9fa] animate-ping" />
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-[#0c0a09] tracking-tighter uppercase">Validar Segurança</h2>
                <p className="text-base font-bold text-neutral-400 uppercase tracking-widest leading-relaxed px-10">
                  Insira o código de 5 dígitos enviado para o seu celular cadastrado.
                </p>
             </div>
             <div className="w-full space-y-8">
                <Input 
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").substring(0, 5))}
                  className="h-24 text-center font-black text-5xl tracking-[0.5em] border-2 border-neutral-100 rounded-[32px] focus:border-[#f97316] bg-white shadow-2xl"
                  placeholder="0 0 0 0 0"
                />
                <Button 
                  onClick={handleFinalizePayment}
                  disabled={isLoading || smsCode.length < 5}
                  className="w-full h-20 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30"
                >
                  {isLoading ? "PROCESSANDO..." : "CONFIRMAR PAGAMENTO"}
                </Button>
                <button className="text-[10px] font-black text-neutral-400 hover:text-[#f97316] uppercase tracking-widest transition-colors py-4">Não recebi o código (00:59)</button>
             </div>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-2xl mx-auto flex flex-col items-center space-y-10 py-8 animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-2xl relative border-4 border-white">
                <CheckCircle2 className="h-12 w-12" />
             </div>
             
             <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-[#0c0a09] tracking-tighter uppercase">Pagamento Realizado!</h2>
                <p className="text-base font-bold text-neutral-400 uppercase tracking-widest">Sua conta foi liquidada com sucesso.</p>
             </div>

             <div className="w-full bg-white rounded-[40px] border border-neutral-100 p-10 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="space-y-6 relative z-10">
                   <div className="flex justify-between items-center border-b border-neutral-50 pb-6">
                      <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Valor Pago</span>
                      <span className="text-4xl font-black text-[#f97316] tracking-tighter">{formatCurrency(boletoData?.valorTotal || boletoData?.valor)}</span>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Beneficiário</p>
                        <p className="text-lg font-black text-[#0c0a09] uppercase">{boletoData?.beneficiario || boletoData?.nomeBeneficiario}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 border-t border-neutral-50 pt-6">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Data</p>
                          <p className="text-sm font-black text-[#0c0a09]">{new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Autenticação</p>
                          <p className="text-[10px] font-black text-[#0c0a09] font-mono opacity-40 truncate">{transactionId}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="w-full flex gap-4">
                <Button onClick={handlePrintReceipt} className="flex-1 h-20 bg-[#0c0a09] hover:bg-[#f97316] text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                   <Download className="h-6 w-6" />
                   COMPROVANTE
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full h-20 border-2 border-neutral-100 rounded-3xl font-black text-lg uppercase tracking-widest hover:border-[#f97316] hover:text-[#f97316]">
                    VOLTAR
                  </Button>
                </Link>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
