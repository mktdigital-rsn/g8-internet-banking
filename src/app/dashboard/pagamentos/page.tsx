"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
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
  ChevronRight,
  ReceiptText,
  CalendarClock,
  ListChecks,
  Eye,
  Ban,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { temporaryDeviceIdAtom } from "@/store/auth";

/* ──── Mock data for sections ──── */
const mockAgendamentos = [
  { id: 1, beneficiario: "CDHU SP", valor: "R$ 485,00", data: "20/04/2026", status: "Agendado", barcode: "0001.0001 00001.000001..." },
  { id: 2, beneficiario: "ENEL DISTRIBUIÇÃO", valor: "R$ 312,45", data: "25/04/2026", status: "Agendado", barcode: "8366.0000 00312.450001..." },
  { id: 3, beneficiario: "SABESP", valor: "R$ 89,70", data: "28/04/2026", status: "Agendado", barcode: "8269.0000 00089.700001..." },
];

const mockHistorico = [
  { id: 1, beneficiario: "VIVO TELECOMUNICAÇÕES", valor: "R$ 149,90", data: "10/04/2026", status: "Pago" },
  { id: 2, beneficiario: "PREFEITURA DE SÃO PAULO - IPTU", valor: "R$ 1.250,00", data: "08/04/2026", status: "Pago" },
  { id: 3, beneficiario: "CLARO S.A.", valor: "R$ 99,90", data: "05/04/2026", status: "Pago" },
  { id: 4, beneficiario: "TIM CELULAR S.A.", valor: "R$ 65,00", data: "01/04/2026", status: "Pago" },
  { id: 5, beneficiario: "ELETROPAULO - ENEL", valor: "R$ 278,33", data: "28/03/2026", status: "Pago" },
];

const mockComprovantes = [
  { id: "REC-2026041501", beneficiario: "VIVO TELECOMUNICAÇÕES", valor: "R$ 149,90", data: "10/04/2026" },
  { id: "REC-2026040801", beneficiario: "PREFEITURA DE SÃO PAULO", valor: "R$ 1.250,00", data: "08/04/2026" },
  { id: "REC-2026040502", beneficiario: "CLARO S.A.", valor: "R$ 99,90", data: "05/04/2026" },
];

export default function PagamentosPage() {
  const router = useRouter();
  const temporaryDeviceId = useAtomValue(temporaryDeviceIdAtom);
  
  // State Machine
  const [step, setStep] = useState<"landing" | "review" | "sms" | "success">("landing");
  
  // Section modals
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Data State
  const [barcode, setBarcode] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [boletoData, setBoletoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  
  // Security State
  const [smsCode, setSmsCode] = useState("");
  const [pinId, setPinId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  
  const [paymentMode, setPaymentMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [agendamentos, setAgendamentos] = useState(mockAgendamentos);
  const [editingAgendamento, setEditingAgendamento] = useState<any>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get("/api/banco/saldo/getSaldo");
        if (res.data) {
          setUserBalance(res.data.valor || 0);
        }
      } catch (err) {
        console.error("Erro ao buscar saldo:", err);
      }
    };
    fetchBalance();
  }, []);

  // Handlers
  const handleConsultBoleto = async () => {
    if (!barcode || barcode.length < 10) {
      toast.error("Por favor, insira um código de barras válido.");
      return;
    }

    if (!temporaryDeviceId) {
      toast.error("Aguarde concluir o login com QR antes de realizar pagamentos.");
      return;
    }
    
    setIsConsulting(true);
    try {
      const res = await api.post("/api/banco/pagamentos/consultar-boleto", { 
        linhaDigitavel: barcode.replace(/\D/g, ""),
        deviceId: temporaryDeviceId
      });
      
      if (res.data) {
        const rawData = res.data.data || res.data;
        const details = rawData.data || rawData;
        
        // Helper para formatar data YYYY-MM-DD para DD/MM/YYYY
        const formatDate = (dateStr: string) => {
          if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes("-")) return dateStr;
          const parts = dateStr.split("-");
          if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
          return dateStr;
        };

        const normalized = {
          ...details,
          beneficiario: details.beneficiaryLegalName || details.beneficiario || details.nomeBeneficiario || "NÃO IDENTIFICADO",
          vencimento: formatDate(details.expirationDate || details.vencimento || details.dataVencimento || "---"),
          valor: details.totalAmount || details.nominalAmount || details.valor || details.valorTotal || 0,
          linhaDigitavel: details.digitableLine || details.linhaDigitavel || details.barcode || barcode.replace(/\D/g, ""),
          bancoBeneficiario: details.beneficiaryBankCode || details.bankName || details.bank || "",
          documentoBeneficiario: details.beneficiaryDocumentNumber || details.documentoBeneficiario || "",
          pagadorNome: details.payerLegalName || details.nomePagador || ""
        };

        setBoletoData(normalized);
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
      const res = await api.post("/api/users/solicitar-pin", { 
        amount: String(boletoData?.valorTotal || boletoData?.valor || "0"),
        deviceId: temporaryDeviceId
      });

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
      // 1. Validar PIN
      await api.post("/api/users/validar-pin", { 
        pin: smsCode, 
        pinId: pinId,
        deviceId: temporaryDeviceId
      });

      // 2. Efetivar Pagamento
      const res = await api.post("/api/banco/pagamentos/pagar-boleto", {
        linhaDigitavel: boletoData?.linhaDigitavel || barcode.replace(/\D/g, ""),
        deviceId: temporaryDeviceId
      });

      if (res.data) {
        setStep("success");
        toast.success("Pagamento realizado com sucesso!");

        // 1. Tentar pegar ID direto da resposta do pagamento (Varredura de campos comuns)
        const raw = res.data.data || res.data;
        const directId = raw.idDoBancoLiquidante || raw.transactionId || raw.id || raw.auth || raw.nsu || raw.protocolo || raw.receiptId || raw.receipt_id;
        
        if (directId) {
          setTransactionId(directId);
          console.log("✅ ID encontrado diretamente:", directId);
        }
        
        // 2. Fallback: Buscar no extrato com retentativas (banco pode demorar a processar)
        let attempts = 0;
        const maxAttempts = 3;

        const searchWithRetry = async () => {
          if (directId && !String(directId).startsWith("PAG")) return; 
          attempts++;

          try {
            console.log(`🔍 [BUSCA EXTRATO] Tentativa ${attempts}...`);
            const extratoRes = await api.get("/api/banco/extrato/buscar");
            const items = extratoRes.data.transacoes || extratoRes.data.data?.transacoes || [];
            
            const targetVal = Math.abs(parseFloat(String(boletoData.valorTotal || boletoData.valor).replace(/[R$\s]/g, "").replace(",", ".")));

            const match = items.find((item: any) => {
               const itemVal = Math.abs(parseFloat(String(item.valor).replace(/[R$\s]/g, "").replace(",", ".")));
               return Math.abs(itemVal - targetVal) < 0.01;
            });

            if (match && (match.idDoBancoLiquidante || match.id || match.nsu)) {
              const finalId = match.idDoBancoLiquidante || match.id || match.nsu;
              setTransactionId(finalId);
              console.log("✅ ID encontrado no extrato!", finalId);
            } else if (attempts < maxAttempts) {
              setTimeout(searchWithRetry, 3000); // Tenta de novo em 3s
            } else if (!directId) {
              setTransactionId("PAG-" + Math.random().toString(36).substring(7).toUpperCase());
            }
          } catch (e) {
            console.error("Erro na busca do extrato:", e);
            if (attempts < maxAttempts) {
              setTimeout(searchWithRetry, 3000);
            } else if (!directId) {
              setTransactionId("ERR-" + Date.now().toString().slice(-6));
            }
          }
        };

        setTimeout(searchWithRetry, 2500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao processar pagamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!transactionId || transactionId.startsWith("PAG")) {
      toast.error("Processando dados do banco. Tente novamente em 5 segundos.");
      return;
    }

    toast.info("Gerando comprovante...");
    
    try {
      const response = await api.get(`/api/banco/extrato/imprimir-item/${transactionId}`, {
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
      toast.success("Comprovante gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar comprovante.");
    }
  };

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
                {/* Boleto input card */}
                <div className="bg-white p-8 md:p-12 rounded-sm border border-neutral-100 shadow-2xl shadow-black/[0.03] space-y-8 relative overflow-hidden group">
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
                        id="barcode-input"
                        placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
                        className="h-16 pl-16 bg-neutral-50 border-neutral-200 rounded-sm text-sm font-black tracking-widest focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]/30 transition-all placeholder:text-neutral-300 text-[#0c0a09]"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                      />
                    </div>
                    <Button 
                        onClick={handleConsultBoleto}
                        disabled={isConsulting}
                        className="h-16 px-10 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-black/10 shrink-0"
                    >
                      {isConsulting ? "PROCESSANDO..." : "CONFERIR BOLETO"}
                      {!isConsulting && <ArrowRight className="h-5 w-5 ml-2" />}
                    </Button>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div className="p-6 bg-[#0c0a09] rounded-sm hover:shadow-xl transition-all group/qr cursor-pointer flex items-center gap-6 border border-white/5">
                      <div className="w-14 h-14 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316] group-hover/qr:scale-110 transition-transform">
                        <QrCode className="h-7 w-7 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-widest">Ler QR Code</span>
                        <span className="text-[10px] font-bold text-white/40 mt-1">Use a câmera do seu celular</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/20 ml-auto group-hover/qr:text-[#f97316] transition-colors" />
                    </div>
                    <div 
                      onClick={() => setActiveSection("historico")}
                      className="p-6 bg-[#0c0a09] rounded-sm hover:shadow-xl transition-all group/rec cursor-pointer flex items-center gap-6 border border-white/5"
                    >
                      <div className="w-14 h-14 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316] group-hover/rec:scale-110 transition-transform">
                        <History className="h-7 w-7 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-widest">Recentes</span>
                        <span className="text-[10px] font-bold text-white/40 mt-1">Re-pague uma conta</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/20 ml-auto group-hover/rec:text-[#f97316] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Gestão de Contas */}
                <div className="space-y-6 text-center md:text-left">
                  <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Gestão de Contas</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { icon: CalendarClock, label: "Agendamentos", key: "agendamentos", count: agendamentos.length },
                      { icon: ListChecks, label: "Histórico", key: "historico", count: mockHistorico.length },
                      { icon: ShieldCheck, label: "DDA", key: "dda", count: 0 },
                      { icon: ReceiptText, label: "Comprovantes", key: "comprovantes", count: mockComprovantes.length },
                    ].map((opt, i) => (
                       <div 
                         key={i} 
                         onClick={() => setActiveSection(opt.key)}
                         className="flex flex-col items-center justify-center w-full min-h-[160px] bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-sm hover:shadow-2xl hover:shadow-orange-200/50 hover:scale-[1.03] transition-all group cursor-pointer p-6 relative overflow-hidden"
                       >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent)]" />
                          {opt.count > 0 && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-sm flex items-center justify-center shadow-md">
                              <span className="text-[9px] font-black text-[#f97316]">{opt.count}</span>
                            </div>
                          )}
                          <div className="w-12 h-12 flex items-center justify-center mb-4 text-white bg-white/20 rounded-sm group-hover:scale-110 group-hover:bg-white/30 transition-all relative z-10">
                              <opt.icon className="h-6 w-6 stroke-[2.5]" />
                          </div>
                          <span className="text-[11px] font-black text-white text-center px-1 uppercase tracking-widest leading-tight relative z-10">{opt.label}</span>
                       </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar / DDA Card */}
              <div className="lg:col-span-4 space-y-10">
                <Card className="rounded-sm border-0 shadow-2xl shadow-black/5 bg-[#0c0a09] p-10 space-y-8 relative overflow-hidden group cursor-pointer border border-white/5">
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
                    <Button 
                      onClick={() => setActiveSection("dda")}
                      className="w-full h-14 bg-white/10 hover:bg-[#f97316] text-white rounded-sm font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 hover:border-[#f97316]"
                    >
                      Ativar DDA <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4 relative z-10">
                    {[
                      { icon: ShieldCheck, text: "Proteção contra boletos falsos" },
                      { icon: Eye, text: "Visualize antes de pagar" },
                      { icon: Ban, text: "Bloqueie cobranças indevidas" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-[#f97316] shrink-0" />
                        <span className="text-xs font-bold text-white/40">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Horário info */}
                <div className="p-6 bg-white border border-neutral-100 rounded-sm shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#f97316]" />
                    <span className="text-xs font-black text-[#0c0a09] uppercase tracking-widest">Horários de pagamento</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-neutral-400">Boletos</span>
                      <span className="text-xs font-black text-[#0c0a09]">Até 22h</span>
                    </div>
                    <Separator className="bg-neutral-50" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-neutral-400">Tributos</span>
                      <span className="text-xs font-black text-[#0c0a09]">Até 20h</span>
                    </div>
                    <Separator className="bg-neutral-50" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-neutral-400">Convênios</span>
                      <span className="text-xs font-black text-[#0c0a09]">Até 21h</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-300 leading-normal">
                    Pagamentos fora do horário serão processados no próximo dia útil.
                  </p>
                </div>
              </div>
            </div>

            {/* ──── Section Overlay: Agendamentos ──── */}
            {activeSection === "agendamentos" && (
              <div className="fixed inset-0 z-[100] bg-[#0c0a09]/98 backdrop-blur-xl mt-20 overflow-y-auto flex justify-center items-center p-4 py-8 ">
                <div className="w-full max-w-3xl bg-white rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.5)] h-fit flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
                  
                  {/* Header & Edit Context */}
                  <div className={`shrink-0 transition-all duration-500 overflow-hidden ${editingAgendamento ? 'bg-neutral-900' : 'bg-white border-b border-neutral-100'}`}>
                    {/* Top Bar */}
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-sm flex items-center justify-center shadow-lg transition-all duration-500 ${editingAgendamento ? 'bg-[#f97316] text-white scale-110 shadow-orange-500/20' : 'bg-[#f97316]/10 text-[#f97316]'}`}>
                          {editingAgendamento ? <Pencil className="h-7 w-7" /> : <CalendarClock className="h-7 w-7" />}
                        </div>
                        <div className="space-y-0.5">
                          <h2 className={`text-xl md:text-xl font-black uppercase tracking-tight leading-none ${editingAgendamento ? 'text-white' : 'text-[#0c0a09]'}`}>
                            {editingAgendamento ? 'Ajustar Data' : 'Agendamentos'}
                          </h2>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${editingAgendamento ? 'text-[#f97316]' : 'text-neutral-400'}`}>
                            {editingAgendamento ? editingAgendamento.beneficiario : `${agendamentos.length} transações programadas`}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setActiveSection(null); setEditingAgendamento(null); }}
                        className={`p-4 rounded-sm transition-all ${editingAgendamento ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-neutral-50 text-neutral-300 hover:text-[#0c0a09]'}`}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Edit Options (Only visible when editing) */}
                    {editingAgendamento && (
                      <div className="p-6 space-y-4 animate-in slide-in-from-top-4 duration-500 ">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                          <div className="md:col-span-6 space-y-4">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">Nova Data de Pagamento</label>
                            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-sm border border-white/10 focus-within:border-[#f97316] transition-all">
                              <Calendar className="h-5 w-5 text-[#f97316] shrink-0" />
                              <Input
                                type="date"
                                value={editingAgendamento.tempDate || ""}
                                onChange={(e) => setEditingAgendamento({...editingAgendamento, tempDate: e.target.value})}
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                className="h-2 bg-transparent border-0 px-0 text-white font-black text-xl focus:ring-0 w-full cursor-pointer placeholder:text-white/20"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-6 flex gap-3 h-[48px]">
                             <Button 
                               onClick={() => {
                                 if (!editingAgendamento.tempDate) return toast.error("Selecione uma data.");
                                 const [y, m, d] = editingAgendamento.tempDate.split("-");
                                 const formattedDate = `${d}/${m}/${y}`;
                                 setAgendamentos(prev => prev.map(ag => ag.id === editingAgendamento.id ? { ...ag, data: formattedDate } : ag));
                                 toast.success("Agendamento atualizado com sucesso!");
                                 setEditingAgendamento(null);
                               }}
                               className="flex-1 bg-[#f97316] hover:bg-orange-600 text-white font-black uppercase text-xs rounded-sm tracking-[0.2em] shadow-2xl shadow-orange-500/20"
                             >
                               Salvar Alteração
                             </Button>
                             <Button 
                               onClick={() => setEditingAgendamento(null)}
                               variant="ghost" 
                               className="px-6 text-white/40 hover:text-white hover:bg-white/10 font-black uppercase text-[10px] rounded-sm tracking-widest"
                             >
                               Cancelar
                             </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-orange-500/10 rounded-sm border border-orange-500/20 flex items-center gap-4">
                           <AlertCircle className="h-5 w-5 text-[#f97316] shrink-0" />
                           <p className="text-[10px] font-black text-orange-200/60 uppercase leading-none tracking-widest">A alteração de data está sujeita à disponibilidade de saldo no dia escolhido.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* List View */}
                  <div className="p-8 space-y-6">
                    {!editingAgendamento && (
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <button
                          onClick={() => { setActiveSection(null); setPaymentMode("schedule"); setTimeout(() => document.getElementById("barcode-input")?.focus(), 400); }}
                          className="flex-1 h-16 bg-[#0c0a09] hover:bg-neutral-800 text-white rounded-sm font-black text-xs uppercase tracking-[0.2em] shadow-xl group flex items-center justify-center transition-all"
                        >
                          <CalendarClock className="h-5 w-5 mr-3 text-[#f97316] group-hover:scale-110 transition-transform" />
                          Novo Agendamento
                        </button>
                        <div className="flex-1 p-5 bg-neutral-50 rounded-sm border border-neutral-100 flex items-center justify-between">
                           <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Total Pendente</span>
                           <span className="text-xl font-black text-[#0c0a09] font-mono leading-none">R$ 887,15</span>
                        </div>
                      </div>
                    )}

                    <div className="max-h-[250px] overflow-y-auto pr-2 space-y-4 no-scrollbar scroll-smooth">
                      {agendamentos.map((ag) => (
                        <div 
                          key={ag.id} 
                          className={`p-6 rounded-sm border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 relative group overflow-hidden ${editingAgendamento?.id === ag.id ? 'bg-orange-50 border-[#f97316] scale-[1.01] shadow-xl' : 'bg-white border-neutral-100 hover:border-[#f97316]/30 hover:shadow-2xl hover:shadow-black/5'}`}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="space-y-3 min-w-0 flex-1">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.3em] leading-none">Beneficiário</p>
                              <p className="text-base font-black text-[#0c0a09] uppercase tracking-tight truncate">{ag.beneficiario}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-sm">
                                <Calendar className="h-3 w-3 text-[#f97316]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{ag.data}</span>
                              </div>
                              <span className="text-[10px] font-mono text-neutral-300 truncate tracking-widest opacity-60">{ag.barcode}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 md:border-l border-neutral-100 pt-6 md:pt-0 md:pl-8">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.3em] mb-1">Valor Total</p>
                               <p className="text-2xl font-black text-[#f97316] font-mono leading-none">{ag.valor}</p>
                            </div>
                            
                            {!editingAgendamento && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                     const parts = ag.data.split("/");
                                     const mappedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
                                     setEditingAgendamento({ ...ag, tempDate: mappedDate });
                                  }}
                                  className="w-12 h-12 bg-neutral-50 hover:bg-[#f97316]/10 border border-neutral-200 hover:border-[#f97316]/30 flex items-center justify-center text-neutral-400 hover:text-[#f97316] transition-all rounded-sm shadow-sm"
                                  title="Editar data"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                     if (window.confirm(`Cancelar permanentemente o agendamento de ${ag.valor} para ${ag.beneficiario}?`)) {
                                        setAgendamentos(prev => prev.filter(item => item.id !== ag.id));
                                        toast.success("Agendamento cancelado.");
                                     }
                                  }}
                                  className="w-12 h-12 bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-200 flex items-center justify-center text-neutral-400 hover:text-red-600 transition-all rounded-sm shadow-sm"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {agendamentos.length === 0 && (
                      <div className="py-32 text-center space-y-6">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                          <CalendarClock className="h-10 w-10 text-neutral-200" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-black text-[#0c0a09] uppercase tracking-tight">Tudo em dia!</p>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Você não possui nenhum pagamento agendado no momento.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="p-8 border-t border-neutral-50 bg-neutral-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center md:text-left">
                       As transações são processadas às 07:00h do dia agendado.
                     </p>
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-[#0c0a09] uppercase tracking-widest">Ambiente Seguro G8</span>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──── Section Overlay: Histórico ──── */}
            {activeSection === "historico" && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-3xl bg-white rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between p-8 border-b border-neutral-100 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316]">
                        <ListChecks className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#0c0a09] uppercase tracking-tight">Histórico de Pagamentos</h2>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{mockHistorico.length} pagamentos encontrados</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveSection(null)} className="p-2 rounded-sm hover:bg-neutral-50 transition-colors">
                      <X className="h-5 w-5 text-neutral-400" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-3">
                    {mockHistorico.map((item) => (
                      <div key={item.id} className="p-5 bg-neutral-50 rounded-sm border border-neutral-100 flex items-center justify-between group hover:shadow-lg hover:border-[#f97316]/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-green-50 rounded-sm flex items-center justify-center text-green-500 shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[#0c0a09] uppercase tracking-tight truncate">{item.beneficiario}</p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{item.data}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4 flex items-center gap-4">
                          <p className="text-base font-black text-[#0c0a09] font-mono tracking-tight">{item.valor}</p>
                          <ChevronRight className="h-4 w-4 text-neutral-200 group-hover:text-[#f97316] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──── Section Overlay: DDA ──── */}
            {activeSection === "dda" && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-xl bg-white rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                  <div className="flex items-center justify-between p-8 border-b border-neutral-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-sm flex items-center justify-center text-green-500">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-black text-[#0c0a09] uppercase tracking-tight">Débito Direto Autorizado</h2>
                    </div>
                    <button onClick={() => setActiveSection(null)} className="p-2 rounded-sm hover:bg-neutral-50 transition-colors">
                      <X className="h-5 w-5 text-neutral-400" />
                    </button>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="p-6 bg-[#f97316]/10 rounded-sm border border-orange-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-[#f97316]" />
                        <span className="text-xs font-black text-[#0c0a09] uppercase tracking-widest">O que é DDA?</span>
                      </div>
                      <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                        O DDA permite que você visualize todos os boletos emitidos no seu CPF/CNPJ diretamente no internet banking, antes mesmo de recebê-los fisicamente. Isso evita fraudes e pagamentos duplicados.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: ShieldCheck, title: "Segurança total", desc: "Todos os boletos são verificados pelo sistema bancário nacional." },
                        { icon: Eye, title: "Visualização completa", desc: "Veja valor, beneficiário e data de vencimento antes de pagar." },
                        { icon: Ban, title: "Bloqueio de fraudes", desc: "Identifique e bloqueie cobranças indevidas automaticamente." },
                      ].map((feat, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-sm border border-neutral-100">
                          <div className="w-8 h-8 bg-green-50 rounded-sm flex items-center justify-center text-green-500 shrink-0 mt-0.5">
                            <feat.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#0c0a09] uppercase tracking-tight">{feat.title}</p>
                            <p className="text-xs font-medium text-neutral-400 leading-relaxed mt-1">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => { setActiveSection(null); toast.info("Ativação do DDA será disponibilizada em breve."); }}
                      className="w-full h-14 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 transition-all"
                    >
                      Ativar DDA na minha conta <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ──── Section Overlay: Comprovantes ──── */}
            {activeSection === "comprovantes" && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-3xl bg-white rounded-sm shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between p-8 border-b border-neutral-100 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316]">
                        <ReceiptText className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#0c0a09] uppercase tracking-tight">Comprovantes</h2>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{mockComprovantes.length} disponíveis para download</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveSection(null)} className="p-2 rounded-sm hover:bg-neutral-50 transition-colors">
                      <X className="h-5 w-5 text-neutral-400" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-3">
                    {mockComprovantes.map((comp) => (
                      <div key={comp.id} className="p-5 bg-neutral-50 rounded-sm border border-neutral-100 flex items-center justify-between group hover:shadow-lg hover:border-[#f97316]/20 transition-all">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316] shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[#0c0a09] uppercase tracking-tight truncate">{comp.beneficiario}</p>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{comp.data}</p>
                              <span className="text-neutral-200">&bull;</span>
                              <p className="text-[10px] font-mono font-bold text-neutral-300">{comp.id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          <p className="text-base font-black text-[#0c0a09] font-mono tracking-tight">{comp.valor}</p>
                          <button className="w-10 h-10 bg-white rounded-sm border border-neutral-100 flex items-center justify-center text-neutral-300 hover:text-[#f97316] hover:border-[#f97316]/20 transition-all group-hover:shadow-sm">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === "review" && boletoData && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep("landing")} className="rounded-sm h-12 w-12 hover:bg-neutral-100">
                <ArrowLeft className="h-6 w-6 text-[#f97316]" />
              </Button>
              <h2 className="text-3xl font-black text-[#0c0a09] tracking-tighter uppercase">Confirme os dados</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-8">
                <div className="bg-white p-10 rounded-sm border border-neutral-100 shadow-2xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-2 opacity-60">Beneficiário</p>
                      <h3 className="text-2xl font-black text-[#0c0a09] uppercase leading-tight">{boletoData.beneficiario}</h3>
                      {boletoData.documentoBeneficiario && (
                        <p className="text-[11px] font-bold text-neutral-500 mt-1">{boletoData.documentoBeneficiario}</p>
                      )}
                      {boletoData.bancoBeneficiario && (
                        <p className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.1em] mt-2 opacity-80 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {boletoData.bancoBeneficiario}
                        </p>
                      )}
                    </div>
                    <div className="w-16 h-16 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316] shrink-0">
                      <Building2 className="h-8 w-8" />
                    </div>
                  </div>

                  <Separator className="bg-neutral-100" />

                  {boletoData.pagadorNome && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[11px] text-[#0c0a09] font-bold uppercase tracking-widest">Pagador</p>
                        <p className="text-sm font-medium text-neutral-500 uppercase">{boletoData.pagadorNome}</p>
                      </div>
                      <Separator className="bg-neutral-100" />
                    </>
                  )}

                  {/* Payment Date Section */}
                  <div className="p-6 bg-neutral-50 rounded-sm border border-neutral-100 space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-[#0c0a09] uppercase tracking-widest">Quando pagar?</p>
                      <div className="flex items-center bg-white rounded-sm border border-neutral-200 p-1 gap-1">
                        <button
                          onClick={() => { setPaymentMode("now"); setScheduleDate(""); }}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-widest transition-all ${
                            paymentMode === "now"
                              ? "bg-[#0c0a09] text-white shadow-md"
                              : "text-neutral-400 hover:text-[#0c0a09]"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Agora
                        </button>
                        <button
                          onClick={() => setPaymentMode("schedule")}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-widest transition-all ${
                            paymentMode === "schedule"
                              ? "bg-[#0c0a09] text-white shadow-md"
                              : "text-neutral-400 hover:text-[#0c0a09]"
                          }`}
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          Agendar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-white rounded-sm border border-neutral-100">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Vencimento</p>
                        <p className="text-lg font-black text-[#0c0a09] tracking-tight">{boletoData.vencimento}</p>
                      </div>
                      <div className={`p-4 rounded-sm border-2 transition-colors ${
                        paymentMode === "schedule" && !scheduleDate 
                          ? "bg-[#f97316]/5 border-[#f97316]/30" 
                          : "bg-white border-neutral-100"
                      }`}>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Data de Pagamento</p>
                        <p className={`text-lg font-black tracking-tight ${
                          paymentMode === "now" ? "text-[#0c0a09]" : scheduleDate ? "text-[#f97316]" : "text-[#f97316]/40"
                        }`}>
                          {paymentMode === "now" ? "Hoje" : scheduleDate ? new Date(scheduleDate + "T12:00:00").toLocaleDateString("pt-BR") : "Selecione →"}
                        </p>
                      </div>
                    </div>

                    {paymentMode === "schedule" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-sm border-2 border-[#0c0a09] relative">
                          <div className="w-10 h-10 bg-[#0c0a09] rounded-sm flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            className="h-12 bg-transparent border-0 px-0 text-[#0c0a09] font-black text-lg focus:ring-0 focus-visible:ring-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-8 bg-[#f97316]/10 rounded-sm border border-orange-100">
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-3 opacity-60">Valor do Pagamento</p>
                    <p className="text-5xl font-black text-[#f97316] font-mono tracking-tighter">
                      {formatCurrency(boletoData.valor)}
                    </p>
                  </div>

                  {userBalance !== null && boletoData.valor > userBalance && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-sm">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Atenção: Seu saldo atual ({formatCurrency(userBalance)}) é insuficiente para esta conta.</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => {
                      if (paymentMode === "schedule") {
                        if (!scheduleDate) {
                          toast.error("Selecione uma data para o agendamento.");
                          return;
                        }
                        // Add to scheduled payments
                        const newAgendamento = {
                          id: agendamentos.length + 1,
                          beneficiario: boletoData.beneficiario,
                          valor: formatCurrency(boletoData.valor),
                          data: new Date(scheduleDate + "T12:00:00").toLocaleDateString("pt-BR"),
                          status: "Agendado",
                          barcode: boletoData.linhaDigitavel?.substring(0, 30) + "..."
                        };
                        setAgendamentos(prev => [...prev, newAgendamento]);
                        toast.success(`Pagamento agendado para ${newAgendamento.data}!`);
                        setStep("landing");
                        setBarcode("");
                        setBoletoData(null);
                        setPaymentMode("now");
                        setScheduleDate("");
                        return;
                      }
                      handleRequestSms();
                    }}
                    disabled={isLoading || (userBalance !== null && boletoData.valor > userBalance) || (paymentMode === "schedule" && !scheduleDate)}
                    className={`w-full h-20 rounded-sm font-black text-lg uppercase tracking-widest shadow-2xl transition-all ${
                      userBalance !== null && boletoData.valor > userBalance 
                      ? "bg-red-500/10 text-red-500 border border-red-200 cursor-not-allowed hover:bg-red-500/10 shadow-none" 
                      : paymentMode === "schedule"
                        ? "bg-[#0c0a09] hover:bg-[#f97316] text-white shadow-black/10"
                        : "bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white shadow-black/20"
                    }`}
                  >
                    {isLoading ? "PROCESSANDO..." : (
                      userBalance !== null && boletoData.valor > userBalance 
                        ? "Saldo insuficiente" 
                        : paymentMode === "schedule" 
                          ? <><CalendarClock className="h-5 w-5 mr-3" /> AGENDAR PAGAMENTO</>
                          : "AUTORIZAR PAGAMENTO"
                    )}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="p-8 bg-white border border-neutral-100 rounded-sm shadow-xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#fff9e6] rounded-sm flex items-center justify-center text-[#f97316] shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-black text-[#0c0a09] uppercase tracking-widest">Aviso Importante</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-neutral-500 leading-relaxed">
                      Certifique-se de que os dados acima correspondam ao boleto que você deseja pagar.
                    </p>
                    <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-100 flex gap-3">
                      <Clock className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-neutral-400 leading-normal uppercase">
                        Pagamentos após as <span className="text-[#f97316]">20h</span> serão liquidados no próximo dia útil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "sms" && (
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-10 py-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-[#f97316]/10 rounded-[4px] flex items-center justify-center text-[#f97316] shadow-xl relative group">
                <Smartphone className="h-10 w-10 animate-bounce text-[#f97316]" />
             </div>
             
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-[#0c0a09] uppercase tracking-tighter">Validação de Segurança</h2>
                <p className="text-base font-bold text-neutral-400 uppercase tracking-widest leading-relaxed px-10">
                  Enviamos um código para o seu celular cadastrado.
                </p>
             </div>

             <div className="w-full max-w-xs space-y-8">
                <Input 
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                  className="h-20 text-center font-black text-4xl tracking-[0.5em] border-2 border-neutral-100 rounded-sm focus:border-[#f97316] bg-white shadow-2xl"
                  placeholder="0 0 0 0 0"
                />
                <div className="flex flex-col gap-4 w-full">
                  <Button 
                    onClick={handleFinalizePayment}
                    disabled={isLoading || smsCode.length < 5}
                    className="w-full h-16 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-base uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? "PROCESSANDO..." : "CONFIRMAR PAGAMENTO"}
                  </Button>
                  <button className="text-[10px] font-black text-[#f97316] uppercase tracking-widest hover:underline transition-colors py-2">
                    Reenviar código em 00:59
                  </button>
                </div>
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

             <div className="w-full bg-white rounded-sm border border-neutral-100 p-10 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="space-y-8 relative z-10">
                   <div className="flex flex-col items-center border-b border-neutral-50 pb-8 text-center">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 opacity-60">Valor Total Pago</span>
                      <span className="text-5xl font-black text-[#f97316] tracking-tighter">{formatCurrency(boletoData?.valor)}</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-60">Beneficiário</p>
                          <p className="text-base font-black text-[#0c0a09] uppercase leading-tight">{boletoData?.beneficiario}</p>
                          {boletoData?.documentoBeneficiario && (
                            <p className="text-[11px] font-medium text-neutral-500">{boletoData.documentoBeneficiario}</p>
                          )}
                          {boletoData?.bancoBeneficiario && (
                            <p className="text-[11px] font-bold text-[#f97316] uppercase mt-1 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {boletoData.bancoBeneficiario}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 pt-6 border-t border-neutral-50">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-60">Pagador</p>
                          <p className="text-sm font-black text-[#0c0a09] uppercase">{boletoData?.pagadorNome || "NOME NÃO INFORMADO"}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-60">Vencimento</p>
                            <p className="text-sm font-black text-[#0c0a09]">{boletoData?.vencimento}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-60">Data Pagamento</p>
                            <p className="text-sm font-black text-[#0c0a09]">{new Date().toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        <div className="space-y-1 pt-6 border-t border-neutral-50">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest opacity-60">Autenticação</p>
                          <p className="text-[11px] font-black text-neutral-400 font-mono break-all leading-relaxed uppercase">{transactionId}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="w-full flex gap-4 pt-10">
                <Button onClick={handlePrintReceipt} className="flex-1 h-20 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group transition-all">
                   <Download className="h-6 w-6 group-hover:scale-110 transition-transform" />
                   COMPROVANTE
                </Button>
                <Button 
                  onClick={() => {
                    setStep("landing");
                    setBoletoData(null);
                    setBarcode("");
                    setSmsCode("");
                    setTransactionId("");
                  }}
                  variant="outline" 
                  className="flex-1 h-20 border-2 border-neutral-200 text-neutral-400 rounded-sm font-black text-lg uppercase tracking-widest hover:border-[#f97316] hover:text-[#f97316] hover:bg-orange-50 transition-all"
                >
                   NOVO PAGAMENTO
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
