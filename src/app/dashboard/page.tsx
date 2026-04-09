"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
   CreditCard,
   ChevronRight,
   TrendingUp,
   ScanLine,
   Landmark,
   Plane,
   Fuel,
   Dumbbell,
   MoreHorizontal,
   RotateCw,
   Users,
   Building2,
   Fingerprint,
   CheckCircle2,
   ArrowLeft,
   Download,
   Diamond
} from "lucide-react";
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import Link from "next/link";

const chartData = {
   day: [
      { name: "00h", value: 40, full: "Meia-noite" },
      { name: "04h", value: 20, full: "04:00" },
      { name: "08h", value: 180, full: "08:00" },
      { name: "12h", value: 350, full: "Meio-dia" },
      { name: "16h", value: 210, full: "16:00" },
      { name: "20h", value: 90, full: "20:00" },
      { name: "23h", value: 120, full: "23:00" },
   ],
   week: [
      { name: "D", value: 120, full: "Domingo" },
      { name: "S", value: 90, full: "Segunda-feira" },
      { name: "T", value: 150, full: "Terça-feira" },
      { name: "Q", value: 300, full: "Quarta-feira" },
      { name: "Q", value: 180, full: "Quinta-feira" },
      { name: "S", value: 100, full: "Sexta-feira" },
      { name: "S", value: 110, full: "Sábado" },
   ],
   month: [
      { name: "Sem 1", value: 800, full: "Primeira Semana" },
      { name: "Sem 2", value: 1200, full: "Segunda Semana" },
      { name: "Sem 3", value: 950, full: "Terceira Semana" },
      { name: "Sem 4", value: 1500, full: "Quarta Semana" },
   ]
};

const maturityItems = [
   { id: 1, label: "Aluguel Imôb.", company: "Quinto Andar S.A", value: "R$ 11.500", icon: Landmark, color: "bg-orange-100 text-orange-600" },
   { id: 2, label: "Finan. Carro", company: "Banco do Brasil", value: "R$ 2.000", icon: Landmark, color: "bg-orange-100 text-orange-600" },
   { id: 3, label: "Seguro. Saúde", company: "SulAmérica", value: "R$ 800", icon: Landmark, color: "bg-orange-100 text-orange-600" },
];

const transactions = [
   { id: 1, type: "Pgto. Boleto", name: "UNIDAS EIRELI", date: "03 Fev 2023, 15:43", value: "R$ 56,50", icon: Landmark },
   { id: 2, type: "Pagamento Pix", name: "JOÃO ABRANTES SILVA", date: "03 Fev 2023, 14:18", value: "R$ 56,50", icon: ScanLine },
   { id: 3, type: "Compra Débito", name: "AZUL LINHAS AÉREAS", date: "01 Fev 2023, 10:21", value: "R$ 56,50", icon: Plane },
   { id: 4, type: "Compra Crédito", name: "POSTO SHELL", date: "01 Fev 2023, 08:54", value: "R$ 56,50", icon: Fuel },
   { id: 5, type: "Compra Déb. Aut.", name: "SMARTFIT", date: "01 Fev 2023, 07:06", value: "R$ 56,50", icon: Dumbbell },
];

export default function DashboardHome() {
   const [userName, setUserName] = useState("Cliente");
   const [balance, setBalance] = useState("R$ 0,00");
   const [cardNumber, setCardNumber] = useState("**** **** **** 0000");
   const [realTransactions, setRealTransactions] = useState<any[]>([]);
   const [allTransactions, setAllTransactions] = useState<any[]>([]);
   const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month">("week");
   const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

   const [mounted, setMounted] = React.useState(false);

   React.useEffect(() => {
      setMounted(true);
      const fetchData = async () => {
         try {
            const token = localStorage.getItem("token");
            const userToken = localStorage.getItem("userToken");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

            const [userRes, balanceRes, extratoRes] = await Promise.all([
               axios.get(`${apiUrl}/api/users/data`, {
                  headers: { Authorization: `Bearer ${token}` }
               }),
               axios.get(`${apiUrl}/api/banco/saldo/getSaldo`, {
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'userToken': userToken || ""
                  }
               }).catch(() => ({ data: { valor: 0 } })),
               axios.get(`${apiUrl}/api/banco/extrato/buscar`, {
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'userToken': userToken || ""
                  }
               }).catch(() => ({ data: { data: [] } }))
            ]);

            if (userRes.data) {
               const u = userRes.data;
               setUserName(u.name || u.nome || "Cliente");
               
               // Robust extraction for Optional fields (present/value)
               const rawAcc = u.accountNumber || u.account || u.conta;
               const accNum = (rawAcc && typeof rawAcc === 'object' && 'present' in rawAcc)
                  ? (rawAcc.present ? String(rawAcc.value) : "0000")
                  : String(rawAcc || "0000");
                  
               setCardNumber(`**** **** **** ${accNum.slice(-4)}`);
            }

            if (balanceRes.data) {
               setBalance(new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL"
               }).format(balanceRes.data.valor || 0));
            }

            if (extratoRes.data && Array.isArray(extratoRes.data.data)) {
               setAllTransactions(extratoRes.data.data);
               setRealTransactions(extratoRes.data.data.slice(0, 5));
            }
         } finally {
            setIsLoadingTransactions(false);
         }
      };
      fetchData();
   }, []);

   const handlePrintReceipt = async (id: string, description: string) => {
      if (!id) return;
      try {
         const token = localStorage.getItem("token");
         const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";
         const response = await axios.get(`${apiUrl}/api/banco/extrato/imprimir-item/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
         });
         const blob = new Blob([response.data], { type: 'application/pdf' });
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `comprovante_${description.replace(/\s+/g, '_').toLowerCase()}.pdf`);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
      } catch (err) {
         console.error("Error printing receipt:", err);
         alert("Erro ao gerar comprovante.");
      }
   };

   const processedChartData = React.useMemo(() => {
      if (!allTransactions || allTransactions.length === 0) return chartData[chartPeriod];
      const template = JSON.parse(JSON.stringify(chartData[chartPeriod]));
      template.forEach((item: any) => item.value = 0);
      allTransactions.forEach(t => {
         const date = new Date(t.dataDaTransacao);
         if (isNaN(date.getTime())) return;
         const valor = Math.abs(t.valor || 0);
         if (chartPeriod === 'week') {
            const dayIdx = date.getDay();
            if (template[dayIdx]) template[dayIdx].value += valor;
         } else if (chartPeriod === 'day') {
            const hour = date.getHours();
            let b = 0;
            if (hour >= 23) b = 6; else if (hour >= 20) b = 5; else if (hour >= 16) b = 4;
            else if (hour >= 12) b = 3; else if (hour >= 8) b = 2; else if (hour >= 4) b = 1;
            if (template[b]) template[b].value += valor;
         } else if (chartPeriod === 'month') {
            const d = date.getDate();
            const w = Math.min(3, Math.floor((d - 1) / 7));
            if (template[w]) template[w].value += valor;
         }
      });
      return template.some((i: any) => i.value > 0) ? template : chartData[chartPeriod];
   }, [allTransactions, chartPeriod]);

   const nextMaturity = () => {
      if (currentIndex < maturityItems.length - 1) setCurrentIndex(prev => prev + 1);
   };

   const prevMaturity = () => {
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
   };

   const getIconForMetodo = (metodo: string) => {
      switch (metodo) {
         case "TRANSFERENCIA_PIX": return ScanLine;
         case "TRANSFERENCIA": return Landmark;
         case "TARIFA": return MoreHorizontal;
         case "PAGAMENTO": return CreditCard;
         default: return Landmark;
      }
   };

   return (
      <div className="p-3 md:p-4 flex flex-col xl:flex-row gap-8 xl:gap-8 2xl:gap-12 h-full overflow-y-auto w-full no-scrollbar">
         {/* Left Column: Main Dashboard */}
         <div className="flex-1 space-y-12 min-w-0 w-full">
            {/* Upper Section: Welcome & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 px-2">
               <div className="space-y-1">
                  <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Conta Verificada</Badge>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#0c0a09]">Olá, {userName.split(' ')[0]}!</h1>
                  <p className="text-xs md:text-sm text-neutral-400 font-bold">Aqui está o resumo das suas finanças hoje.</p>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                  <Link href="/dashboard/pix" className="flex-1 sm:flex-none">
                     <Button className="w-full rounded-md h-11 px-8 font-black text-xs uppercase tracking-widest bg-[#f97316] text-white hover:bg-[#c2410c] shadow-lg shadow-orange-500/20 transition-all active:scale-95">Nova Transação</Button>
                  </Link>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-wrap gap-8 items-start">
               {/* Card Summary */}
               <div className="space-y-6 flex flex-col flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between h-10">
                     <h2 className="text-xl md:text-2xl font-black tracking-tighter text-[#0c0a09]">Meu Resumo</h2>
            
                  </div>

                  <div className="relative group cursor-pointer w-full max-w-[420px] min-w-[380px]">
                     <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-md blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                     <div className="relative h-56 xl:h-72 w-full bg-[#0c0a09] text-white p-8 rounded-md shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10 group-hover:scale-[1.01] transition-all duration-500">
                        {/* Design elements */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f97316]/10 rounded-full blur-3xl group-hover:bg-[#f97316]/20 transition-colors duration-700" />

                        <div className="flex justify-between items-start z-10">
                           <div className="flex flex-col">
                              <span className="font-black tracking-tighter text-3xl italic opacity-95 uppercase leading-none text-white drop-shadow-md">G8PAY</span>
                              <span className="text-[10px] text-orange-400/80 font-black uppercase tracking-[0.3em] mt-2 mb-1">Elite Finance &bull; 2026</span>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <Badge className="bg-white/10 text-white border-0 backdrop-blur-xl px-4 py-1.5 rounded-md font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">Platinum Elite</Badge>
                              <div className="flex gap-1 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                 <div className="w-8 h-5 rounded-sm border border-white/20 bg-white/5 backdrop-blur-sm" />
                                 <div className="w-8 h-5 rounded-sm border border-white/20 bg-white/5 backdrop-blur-sm" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4 xl:space-y-6 z-10 mt-auto">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-11 bg-gradient-to-br from-orange-300 via-[#f97316] to-orange-400 rounded-md flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform border border-white/20">
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)] opacity-50" />
                                 <div className="absolute inset-x-0 h-px bg-white/30 top-1/2 -translate-y-1/2"></div>
                                 <div className="absolute inset-y-0 w-px bg-white/30 left-1/2 -translate-x-1/2"></div>
                              </div>
                              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                           </div>
                           <div className="flex justify-between items-end gap-2">
                              <div className="flex flex-col gap-1">
                                 <p className="text-[9px] text-white/30 uppercase font-bold tracking-[0.2em]">Número do Cartão Platinum</p>
                                 <p className="text-base font-mono tracking-[0.35em] text-white drop-shadow-sm font-medium">{cardNumber}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-[9px] text-white/30 uppercase font-bold tracking-[0.2em] mb-1">Rede</p>
                                 <div className="flex items-center gap-2">
                                    <span className="text-2xl xl:text-4xl font-black italic text-white leading-none tracking-tighter">VISA</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Maturity Section Carousel */}
               <div className="space-y-6 flex flex-col w-full lg:w-[320px] xl:w-[260px] 2xl:w-[320px] shrink-0 min-w-0">
                  <div className="flex items-center justify-between h-10">
                     <h2 className="text-xl md:text-2xl font-black tracking-tighter text-[#0c0a09] truncate pr-2">Vencimentos</h2>
                     <div className="flex gap-2 shrink-0">
                        <button 
                           onClick={prevMaturity}
                           disabled={currentIndex === 0}
                           className="w-10 h-10 rounded-md bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#f97316]"
                        >
                           <ChevronRight className="h-5 w-5 rotate-180" />
                        </button>
                        <button 
                           onClick={nextMaturity}
                           disabled={currentIndex === maturityItems.length - 1}
                           className="w-10 h-10 rounded-md bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#f97316]"
                        >
                           <ChevronRight className="h-5 w-5" />
                        </button>
                     </div>
                  </div>

                  <div className="relative overflow-hidden flex-1 group/carousel h-[260px] xl:h-[290px] -mx-4 px-4">
                     <div 
                        className="flex gap-5 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) h-full pt-1" 
                        style={{ transform: `translateX(-${currentIndex * (260 + 20)}px)` }}
                     >
                        {maturityItems.map((item) => (
                           <div
                              key={item.id}
                              className="flex-shrink-0 w-[260px] bg-white border border-neutral-100 rounded-md p-8 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group flex flex-col justify-between h-[95%]"
                           >
                              <div className="flex justify-between items-start">
                                 <div className={`w-14 h-14 rounded-md ${item.color} flex items-center justify-center group-hover:rotate-[10deg] transition-transform shadow-sm`}>
                                    <item.icon className="h-7 w-7" />
                                 </div>
                                 <Badge className="bg-neutral-50 text-neutral-400 border-0 text-[8px] font-black uppercase">Próximo</Badge>
                              </div>
                              <div className="space-y-4">
                                 <div>
                                    <h4 className="font-black text-xl text-[#0c0a09] leading-tight break-words group-hover:text-[#f97316] transition-colors">{item.label}</h4>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1.5">{item.company}</p>
                                 </div>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase">Total</span>
                                    <p className="text-xl font-black text-[#0c0a09] font-mono tracking-tighter">{item.value}</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-8 bg-white/30 backdrop-blur-md rounded-md p-8 -mx-4 border border-white/40">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                     <h2 className="text-2xl font-black tracking-tighter text-[#0c0a09]">Histórico Recente</h2>
                     <div className="h-10 w-[1px] bg-neutral-200 hidden sm:block" />
                     <p className="text-xs font-bold text-neutral-400 hidden sm:block uppercase tracking-widest">Últimas 5 operações</p>
                  </div>
                  <div className="flex gap-3">
                     <Select defaultValue="Todas">
                        <SelectTrigger className="w-[150px] bg-white border-white/10 rounded-md h-11 shadow-sm font-bold px-6 text-[#0c0a09] transition-all hover:bg-neutral-50 shadow-black/5">
                           <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-0 shadow-2xl font-bold">
                           <SelectItem value="Todas">Todas Operações</SelectItem>
                           <SelectItem value="Pix">Apenas Pix</SelectItem>
                           <SelectItem value="Cartão">Cartão G8</SelectItem>
                        </SelectContent>
                     </Select>
                     <Button variant="outline" size="icon" className="bg-white rounded-md h-11 w-11 shadow-sm text-neutral-400 border-white/10 hover:text-[#f97316] transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                     </Button>
                  </div>
               </div>

               <div className="space-y-4">
                  {isLoadingTransactions ? (
                     <div className="py-20 flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-12 h-12">
                           <div className="absolute inset-0 border-4 border-[#f97316]/5 rounded-full" />
                           <div className="absolute inset-0 border-4 border-t-[#f97316] rounded-full animate-spin" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] animate-pulse">Sincronizando registros...</p>
                     </div>
                  ) : realTransactions.length === 0 ? (
                     <div className="p-20 text-center bg-white/50 border border-dashed border-neutral-200 rounded-md space-y-4">
                        <TrendingUp className="h-10 w-10 text-neutral-200 mx-auto" />
                        <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Aguardando sua primeira transação</p>
                     </div>
                  ) : (
                     <div className="grid gap-4">
                        {realTransactions.map((t, idx) => {
                           const Icon = getIconForMetodo(t.metodo);
                           const displayName = t.tipo === "CREDITO" ? (t.pagadorNome || "Depósito Recebido") : (t.RecebinteNome || "Pagamento Efetuado");
                           const dateOnly = t.dataDaTransacaoFormatada?.split(" ")[0] || "---";

                           return (
                              <div
                                 key={idx}
                                 onClick={() => setSelectedTransaction(t)}
                                 className="flex items-center justify-between p-7 bg-white rounded-md border border-neutral-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/30 hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
                              >
                                 <div className="flex items-center gap-7">
                                    <div className={`w-14 h-14 rounded-md flex items-center justify-center p-3.5 transition-all shadow-sm ${t.tipo === 'CREDITO' ? 'bg-green-50 text-green-500' : 'bg-neutral-50 text-[#f97316]'}`}>
                                       <Icon className="h-full w-full stroke-[2]" />
                                    </div>
                                    <div className="space-y-1.5 min-w-0">
                                       <p className="font-black text-lg text-[#0c0a09] leading-none group-hover:text-[#f97316] transition-colors truncate max-w-[240px]">{displayName}</p>
                                       <div className="flex items-center gap-2">
                                          <Badge variant="secondary" className={`text-[8px] font-black uppercase border-0 px-2 h-5 flex items-center ${t.tipo === 'CREDITO' ? 'bg-green-50 text-green-600' : 'bg-neutral-50 text-neutral-500'}`}>
                                             {t.metodoFormatado}
                                          </Badge>
                                          <span className="text-neutral-300 font-black">&bull;</span>
                                          <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{dateOnly}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 md:gap-8 shrink-0">
                                    <div className="text-right w-32 md:w-44">
                                       <p className={`font-mono text-base md:text-lg font-black tracking-tighter ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-[#f97316]'}`}>
                                          {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                                       </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-md border border-neutral-50 flex items-center justify-center text-neutral-200 group-hover:text-[#f97316] group-hover:border-orange-100 group-hover:bg-orange-50 transition-all">
                                       <ChevronRight className="h-5 w-5" />
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Sidebar Charts/Stats */}
         <div className="w-full xl:w-[30%] xl:min-w-[280px] xl:max-w-[420px] shrink-0 space-y-10 pb-10 pr-0 xl:pr-2">
            <Card className="rounded-md border-0 shadow-2xl shadow-black/10 bg-white p-10 space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
               <div className="space-y-8 relative z-10">
                  <div className="space-y-1">
                     <div className="flex items-center justify-between group cursor-pointer">
                        <h3 className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.3em]">Saldo Disponível</h3>
                        <RotateCw className="h-3 w-3 text-neutral-200 group-hover:text-[#f97316] group-hover:rotate-180 transition-all duration-700" />
                     </div>
                     <div className="flex items-baseline gap-2">
                        <p className="text-2xl 2xl:text-3xl font-black text-[#0c0a09] font-mono tracking-tighter drop-shadow-sm">{balance}</p>
                        <div className="w-2 h-2 rounded-sm bg-green-500 animate-pulse" />
                     </div>
                     <div className="flex items-center gap-2 pt-2">
                        <Badge className="bg-green-50 text-green-600 border-0 px-2 py-0.5 font-black text-[9px] uppercase tracking-widest">+12.5%</Badge>
                        <span className="text-[10px] text-neutral-400 font-bold italic">este mês</span>
                     </div>
                  </div>

                  <Tabs 
                     defaultValue="week" 
                     className="w-full"
                     onValueChange={(val) => setChartPeriod(val as any)}
                  >
                     <TabsList className="bg-slate-50 rounded-md p-1.5 h-12 w-full grid grid-cols-3">
                        <TabsTrigger value="day" className="rounded-md h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Dia</TabsTrigger>
                        <TabsTrigger value="week" className="rounded-md h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Semana</TabsTrigger>
                        <TabsTrigger value="month" className="rounded-md h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Mês</TabsTrigger>
                     </TabsList>
                  </Tabs>
               </div>

               <div className="h-[240px] w-full -mx-4">
                  {mounted && (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedChartData}>
                           <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                 <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid vertical={false} stroke="#f1f1f1" strokeDasharray="3 3" />
                           <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 800 }}
                              dy={10}
                           />
                           <Tooltip
                              contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 'bold' }}
                              cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' }}
                              labelFormatter={(label, payload) => {
                                 const item = payload[0]?.payload;
                                 return item?.full || label;
                              }}
                              formatter={(value: any) => [
                                 new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                                 "Volume"
                              ]}
                           />
                           <Area
                              type="monotone"
                              dataKey="value"
                              name="Valor"
                              stroke="#f97316"
                              strokeWidth={5}
                              fillOpacity={1}
                              fill="url(#colorValue)"
                              activeDot={{ r: 8, fill: "#f97316", stroke: "white", strokeWidth: 4 }}
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  )}
               </div>

               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="font-black text-2xl text-[#0c0a09] tracking-tighter">Faturas Ativas</h3>
                     <button className="text-neutral-400 font-black text-[9px] uppercase tracking-widest hover:text-[#f97316] transition-colors border-b-2 border-transparent hover:border-orange-200 pb-1">Ver Gestão</button>
                  </div>

                  <div className="space-y-6">
                     {/* Fatura Card 1 - High Premium */}
                      <div className="bg-gradient-to-br from-orange-400 via-[#f97316] to-orange-600 rounded-md p-8 text-white shadow-2xl shadow-orange-500/30 flex items-center justify-between relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 cursor-pointer min-h-[140px]">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                         <div className="space-y-3 z-10">
                            <div className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                               <p className="text-[10px] text-white/80 font-black tracking-[0.25em] uppercase leading-none">Vence em 15 Abr</p>
                            </div>
                            <p className="text-xl font-black font-mono tracking-tighter drop-shadow-md">R$ 2.174,20</p>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[9px] font-black uppercase">Fatura Aberta</div>
                         </div>
                         <div className="z-10 shrink-0">
                            <div className="bg-white text-[#f97316] px-4 py-2 rounded-md font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 group-hover:bg-[#0c0a09] group-hover:text-white transition-all">Pagar</div>
                         </div>
                      </div>

                     {/* Fatura Card 2 - Subtle Premium */}
                     <div className="bg-[#0c0a09] rounded-md p-8 text-white shadow-xl shadow-black/20 flex items-center justify-between relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 cursor-pointer border border-white/5">
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                        <div className="space-y-2 z-10">
                           <p className="text-white/40 text-[9px] font-black tracking-[0.2em] uppercase leading-none">Fechada em Fev</p>
                           <p className="text-xl font-black font-mono tracking-tighter text-white/90">R$ 714,02</p>
                           <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Liquidada &bull; 25/02</p>
                        </div>
                        <div className="w-14 h-9 bg-white/10 rounded-md flex items-center justify-center italic font-black text-[10px] group-hover:bg-white/20 transition-all border border-white/10">VISA</div>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="rounded-md border-0 shadow-2xl shadow-black/10 bg-[#0c0a09] p-12 text-white relative overflow-hidden group border border-white/5">
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f97316]/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="relative">
                     <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                     <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-[#f97316] rounded-md flex items-center justify-center p-6 shadow-2xl relative">
                        <Users className="h-full w-full text-white" />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <h3 className="font-black text-3xl tracking-tighter">Impulsione o G8!</h3>
                     <p className="text-[13px] font-medium text-white/50 px-4 leading-relaxed">Ganhe <span className="text-[#f97316] font-black">R$ 50,00</span> por cada convite aceito. O limite é sua vontade.</p>
                  </div>
                  <Button className="w-full bg-white text-[#0c0a09] hover:bg-[#f97316] hover:text-white transition-all duration-500 rounded-md h-14 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/20">
                     Compartilhar Agora
                  </Button>
               </div>
            </Card>
         </div>

         {/* Premium Receipt Modal Overlay */}
         {selectedTransaction && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
                 <Card className="w-full max-w-lg bg-white rounded-md overflow-hidden shadow-2xl relative border-white/20 animate-in zoom-in-95 duration-300 my-auto">
                     <button
                         onClick={() => setSelectedTransaction(null)}
                         className="absolute top-6 right-6 p-2 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-all z-20 hover:rotate-90"
                     >
                         <ArrowLeft className="h-5 w-5 rotate-180 text-neutral-400" />
                     </button>

                     <div className="relative">
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-neutral-50 to-white" />
                        
                        <div className="p-6 md:p-10 space-y-8 relative z-10">
                            <div className="text-center space-y-3">
                                <div className="relative inline-block">
                                    <div className="absolute -inset-4 bg-[#f97316]/10 rounded-full blur-xl" />
                                    <div className="w-16 h-16 bg-[#0c0a09] rounded-md flex items-center justify-center text-[#f97316] mx-auto shadow-2xl relative border border-white/5">
                                        <Diamond className="h-8 w-8 fill-[#f97316]/20" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#0c0a09] tracking-tighter uppercase font-sans">Comprovante</h2>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                       <CheckCircle2 className="h-3 w-3 text-green-500" />
                                       <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.2em]">Autenticação G8 PAY</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-4 bg-neutral-50 rounded-md border border-neutral-100">
                                <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.3em] mb-2">Valor Total</p>
                                <p className="text-5xl font-black text-[#f97316] font-mono tracking-tighter leading-none">
                                    {selectedTransaction.tipo === 'CREDITO' ? '+' : '-'} {selectedTransaction.valorFormatado}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Payer Card */}
                                <div className="space-y-4 p-5 rounded-md bg-neutral-50/80 border border-neutral-100">
                                   <div className="flex items-center gap-2 mb-2">
                                      <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                                      <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Origem / Pagador</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-black text-[#0c0a09] truncate text-sm">{selectedTransaction.pagadorNome || "CLIENTE G8PAY"}</p>
                                      <p className="text-[10px] text-neutral-500 font-mono font-bold opacity-70">
                                         {selectedTransaction.pagadorTaxNumber?.present ? selectedTransaction.pagadorTaxNumber.value : (selectedTransaction.pagadorTaxNumber || "---")}
                                      </p>
                                   </div>
                                   <div className="pt-3 border-t border-neutral-200/50 space-y-2">
                                      <div className="flex justify-between items-center text-[10px]">
                                         <span className="text-neutral-400 font-bold">Banco</span>
                                         <span className="font-black text-[#0c0a09] uppercase truncate ml-2 text-right">{selectedTransaction.pagadorInstituicao || "G8 BANK (382)"}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[10px]">
                                         <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                         <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                            {selectedTransaction.pagadorAgencia || "0001"} &bull; {selectedTransaction.pagadorConta || "0000000-0"}
                                         </span>
                                      </div>
                                   </div>
                                </div>

                                {/* Receiver Card */}
                                <div className="space-y-4 p-5 rounded-md bg-neutral-50/80 border border-neutral-100">
                                   <div className="flex items-center gap-2 mb-2">
                                      <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                                      <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Destino / Recebedor</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-black text-[#0c0a09] truncate text-sm">{selectedTransaction.RecebinteNome || "PAGAMENTO G8PAY"}</p>
                                      <p className="text-[10px] text-neutral-500 font-mono font-bold opacity-70">
                                         {selectedTransaction.RecebinteTaxNumber?.present ? selectedTransaction.RecebinteTaxNumber.value : (selectedTransaction.RecebinteTaxNumber || "---")}
                                      </p>
                                   </div>
                                   <div className="pt-3 border-t border-neutral-200/50 space-y-2">
                                      <div className="flex justify-between items-center text-[10px]">
                                         <span className="text-neutral-400 font-bold">Banco</span>
                                         <span className="font-black text-[#0c0a09] uppercase truncate ml-2 text-right">{selectedTransaction.RecebinteInstituicao || "BANCO DESTINO"}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[10px]">
                                         <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                         <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                            {selectedTransaction.RecebinteAgencia || "---"} &bull; {selectedTransaction.RecebinteConta || "---"}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                            </div>

                            <div className="space-y-5 pt-2">
                               <div className="grid grid-cols-2 gap-12">
                                   <div>
                                       <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest mb-1.5">Metodologia</p>
                                       <Badge className="bg-[#f97316]/5 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-sm">
                                          {selectedTransaction.metodoFormatado}
                                       </Badge>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest mb-1.5">Data Efetiva</p>
                                       <p className="text-xs font-black text-[#0c0a09]">
                                           {selectedTransaction.dataDaTransacaoFormatada.split(" ")[0].split("-").reverse().join("/")} <span className="ml-2 text-neutral-400">{selectedTransaction.dataDaTransacaoFormatada.split(" ")[1]}</span>
                                       </p>
                                   </div>
                               </div>

                               <div className="p-4 rounded-md bg-[#0c0a09] text-white/50 space-y-2 border border-white/5 shadow-2xl">
                                  <div className="flex items-center gap-2 mb-1">
                                     <Fingerprint className="h-3 w-3 text-[#f97316]" />
                                     <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#f97316]">Autenticação Digital G8</p>
                                  </div>
                                  <p className="text-[9px] font-mono font-bold break-all leading-relaxed whitespace-pre-wrap">{selectedTransaction.codigoDeIdentificacao}</p>
                               </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button 
                                   onClick={() => handlePrintReceipt(
                                       selectedTransaction.idDoBancoLiquidante || selectedTransaction.itemId || selectedTransaction.id,
                                       selectedTransaction.tipo === "CREDITO" ? (selectedTransaction.pagadorNome || "Transacao") : (selectedTransaction.RecebinteNome || "Transacao")
                                   )}
                                   className="flex-1 h-14 bg-[#0c0a09] text-white hover:bg-[#f97316] rounded-md font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-black/10 group active:scale-95"
                                >
                                    <Download className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" /> Gerar Comprovante
                                </Button>
                                <Button 
                                   variant="outline" 
                                   onClick={() => setSelectedTransaction(null)} 
                                   className="h-14 border-neutral-100 rounded-md font-black uppercase tracking-widest text-[11px] px-8 active:scale-95 text-neutral-400 hover:text-black"
                                >
                                    Fechar
                                </Button>
                            </div>
                        </div>
                     </div>
                 </Card>
             </div>
         )}
      </div>
   );
}
