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
   Diamond,
   LucideIcon
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
import api from "@/lib/api";
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
   { id: 1, label: "Aluguel Imôb.", company: "Quinto Andar S.A", value: "R$ 11.500", icon: Landmark, color: "bg-orange-100 text-[#f97316]" },
   { id: 2, label: "Finan. Carro", company: "Banco do Brasil", value: "R$ 2.000", icon: Landmark, color: "bg-blue-100 text-blue-600" },
   { id: 3, label: "Seguro. Saúde", company: "SulAmérica", value: "R$ 800", icon: Landmark, color: "bg-purple-100 text-purple-600" },
];

const getIconForMetodo = (metodo: string): LucideIcon => {
   switch (metodo) {
      case "TRANSFERENCIA_PIX": return ScanLine;
      case "TRANSFERENCIA": return Landmark;
      case "TARIFA": return MoreHorizontal;
      case "PAGAMENTO": return CreditCard;
      default: return Landmark;
   }
};

export default function DashboardHome() {
    const [userName, setUserName] = useState("");
    const [balance, setBalance] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [realTransactions, setRealTransactions] = useState<any[]>([]);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
   const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month">("week");
   const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

   const [mounted, setMounted] = React.useState(false);

   React.useEffect(() => {
      setMounted(true);
      const fetchData = async () => {
         try {
            const [userRes, balanceRes, extratoRes] = await Promise.all([
               api.get("/api/users/data"),
               api.get("/api/banco/saldo/getSaldo").catch(() => ({ data: { valor: 0 } })),
               api.get("/api/banco/extrato/buscar").catch(() => ({ data: { data: [] } }))
            ]);

            if (userRes.data) {
               const u = userRes.data;
               setUserName(u.name || u.nome || "Cliente");
               
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
             setIsLoadingData(false);
          }
      };
      fetchData();
   }, []);

   // Auto-carousel effect for maturity cards
   React.useEffect(() => {
      const interval = setInterval(() => {
         setCurrentIndex(prev => (prev + 1) % maturityItems.length);
      }, 5000);
      return () => clearInterval(interval);
   }, []);

   const handlePrintReceipt = async (id: string, description: string) => {
      if (!id) return;
      try {
         const response = await api.get(`/api/banco/extrato/imprimir-item/${id}`, {
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
        const now = new Date();
        const data: any[] = [];
        
        // Helper to format currency/value
        const sorted = [...allTransactions].sort((a, b) => 
           new Date(a.dataDaTransacao).getTime() - new Date(b.dataDaTransacao).getTime()
        );

        const getCumulativeAt = (limitDate: Date) => {
           let cumulative = 0;
           sorted.forEach(t => {
              const tDate = new Date(t.dataDaTransacao);
              if (tDate <= limitDate) {
                 const valor = t.tipo === 'CREDITO' ? (t.valor || 0) : -(t.valor || 0);
                 cumulative += valor;
              }
           });
           return cumulative;
        };

        if (chartPeriod === 'day') {
           const pointsMap = new Map();
           const todayStr = now.toDateString();

           // 1. Standard intervals (every 4 hours for context)
           [0, 4, 8, 12, 16, 20].forEach(h => {
              const d = new Date(now);
              d.setHours(h, 0, 0, 0);
              if (d <= now) {
                 pointsMap.set(d.getTime(), {
                    name: `${String(h).padStart(2, '0')}h`,
                    value: getCumulativeAt(d),
                    full: `${String(h).padStart(2, '0')}:00`
                 });
              }
           });

           // 2. Specific transaction times for today
           sorted.forEach(t => {
              const d = new Date(t.dataDaTransacao);
              if (d.toDateString() === todayStr) {
                 pointsMap.set(d.getTime(), {
                    name: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
                    value: getCumulativeAt(d),
                    full: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                 });
              }
           });

           // 3. Current time
           pointsMap.set(now.getTime(), {
              name: 'Agora',
              value: getCumulativeAt(now),
              full: 'Momento Atual'
           });

           const sortedPoints = Array.from(pointsMap.entries())
              .sort((a, b) => a[0] - b[0])
              .map(e => e[1]);
           
           data.push(...sortedPoints);
        } else if (chartPeriod === 'week') {
           const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
           const fullDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
           
           for (let i = 6; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(now.getDate() - i);
              d.setHours(23, 59, 59, 999);
              data.push({
                 name: days[d.getDay()],
                 value: getCumulativeAt(d),
                 full: i === 0 ? "Hoje" : fullDays[d.getDay()]
              });
           }
        } else if (chartPeriod === 'month') {
           const daysInMonth = now.getDate();
           // To avoid too many points, show points every 2-3 days if month is long, 
           // but user asked "separar por dia", let's try every day.
           for (let i = 1; i <= daysInMonth; i++) {
              const d = new Date(now);
              d.setDate(i);
              d.setHours(23, 59, 59, 999);
              data.push({
                 name: String(i),
                 value: getCumulativeAt(d),
                 full: `${i} de ${now.toLocaleString('pt-BR', { month: 'long' })}`
              });
           }
        }

        return data.length > 0 ? data : chartData[chartPeriod];
    }, [allTransactions, chartPeriod]);

   const nextMaturity = () => {
      setCurrentIndex(prev => (prev + 1) % maturityItems.length);
   };

   const prevMaturity = () => {
      setCurrentIndex(prev => (prev === 0 ? maturityItems.length - 1 : prev - 1));
   };

   return (
      <div className="p-4 md:p-6 2xl:p-10 flex flex-col xl:flex-row gap-8 2xl:gap-12 h-full overflow-y-auto w-full no-scrollbar">
         {/* Left Column: Main Dashboard */}
         <div className="flex-1 space-y-12 2xl:space-y-16 min-w-0 w-full">
            {/* Upper Section: Welcome & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 px-2">
                <div className="space-y-4">
                   <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-0 px-6 py-2.5 font-black text-[12px] 2xl:text-xl uppercase tracking-[0.35em] mb-4">Conta Verificada</Badge>
                   {isLoadingData ? (
                      <div className="space-y-6">
                         <div className="h-16 2xl:h-32 w-2/3 bg-black/5 animate-pulse rounded-md" />
                         <div className="h-8 2xl:h-12 w-1/2 bg-black/5 animate-pulse rounded-md" />
                      </div>
                   ) : (
                      <>
                         <h1 className="text-4xl md:text-5xl 2xl:text-7xl font-black tracking-tighter text-[#0c0a09]">Olá, {userName.replace(/^\d+(\.\d+)*\s*/, '').split(' ')[0]}!</h1>
                         <p className="text-sm md:text-base 2xl:text-2xl text-neutral-400 font-bold opacity-70">Aqui está o resumo das suas finanças hoje.</p>
                      </>
                   )}
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                   <Link href="/dashboard/pix" className="flex-1 sm:flex-none">
                      <Button className="w-full rounded-md h-12 2xl:h-20 px-10 2xl:px-16 font-black text-xs 2xl:text-lg uppercase tracking-widest bg-[#f97316] text-white hover:bg-[#c2410c] shadow-2xl shadow-orange-500/30 transition-all active:scale-95">Nova Transação</Button>
                   </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-wrap gap-8 2xl:gap-12 items-start lg:items-stretch">
               {/* Card Summary */}
               <div className="space-y-8 flex flex-col flex-1 min-w-0 w-full lg:max-w-[480px] 2xl:max-w-[550px]">
                  <div className="flex items-center justify-between h-12">
                     <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#0c0a09]">Meu Resumo</h2>
                  </div>

                  <div className="relative group cursor-pointer w-full">
                     <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-md blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                     <div className="relative h-64 2xl:h-72 w-full bg-[#0c0a09] text-white p-8 2xl:p-10 rounded-md shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10 group-hover:scale-[1.02] transition-all duration-500">
                        {/* Design elements */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f97316]/10 rounded-full blur-3xl group-hover:bg-[#f97316]/20 transition-colors duration-700" />

                        <div className="flex justify-between items-start z-10">
                           <div className="flex flex-col">
                              <span className="font-black tracking-tighter text-3xl 2xl:text-4xl italic opacity-95 uppercase leading-none text-white drop-shadow-md">G8PAY</span>
                              <span className="text-[10px] 2xl:text-xs text-orange-400/80 font-black uppercase tracking-[0.3em] mt-3 mb-1">Elite Finance &bull; 2026</span>
                           </div>
                           <div className="flex flex-col items-end gap-3">
                              <Badge className="bg-white/10 text-white border-0 backdrop-blur-xl px-5 py-2 rounded-md font-black text-[11px] 2xl:text-xs uppercase tracking-[0.2em] shadow-lg">Platinum Elite</Badge>
                           </div>
                        </div>

                        <div className="space-y-6 2xl:space-y-8 z-10 mt-auto">
                           <div className="flex items-center gap-6">
                              <div className="w-16 2xl:w-20 h-11 2xl:h-14 bg-gradient-to-br from-orange-300 via-[#f97316] to-orange-400 rounded-md flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform border border-white/20">
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)] opacity-50" />
                                 <div className="absolute inset-x-0 h-px bg-white/30 top-1/2 -translate-y-1/2"></div>
                                 <div className="absolute inset-y-0 w-px bg-white/30 left-1/2 -translate-x-1/2"></div>
                              </div>
                              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                           </div>
                            <div className="flex justify-between items-end gap-4">
                               <div className="flex flex-col gap-4">
                                  <p className="text-[10px] 2xl:text-sm text-white/30 uppercase font-bold tracking-[0.2em]">Número do Cartão Platinum</p>
                                  {isLoadingData ? (
                                     <div className="h-8 2xl:h-12 w-48 bg-white/10 animate-pulse rounded-md" />
                                  ) : (
                                     <p className="text-lg 2xl:text-4xl font-mono tracking-[0.35em] text-white drop-shadow-sm font-medium">{cardNumber}</p>
                                  )}
                               </div>
                               <div className="text-right shrink-0">
                                  <p className="text-[10px] 2xl:text-sm text-white/30 uppercase font-bold tracking-[0.2em] mb-2">Rede</p>
                                  {isLoadingData ? (
                                     <div className="h-10 2xl:h-16 w-32 bg-white/10 animate-pulse rounded-md" />
                                  ) : (
                                     <span className="text-3xl 2xl:text-8xl font-black italic text-white leading-none tracking-tighter">VISA</span>
                                  )}
                               </div>
                            </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Maturity Section Carousel */}
               <div className="space-y-8 flex flex-col w-full lg:w-[350px] 2xl:w-[400px] shrink-0 min-w-0 justify-center">
                  <div className="flex items-center justify-between h-12">
                     <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#0c0a09] truncate pr-2">Vencimentos</h2>
                     <div className="flex gap-3 shrink-0">
                        <button 
                           onClick={prevMaturity}
                           className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-md bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-all shadow-sm active:scale-95 text-[#f97316]"
                        >
                           <ChevronRight className="h-6 w-6 rotate-180" />
                        </button>
                        <button 
                           onClick={nextMaturity}
                           className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-md bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-all shadow-sm active:scale-95 text-[#f97316]"
                        >
                           <ChevronRight className="h-6 w-6" />
                        </button>
                     </div>
                  </div>

                  <div className="relative overflow-hidden flex-1 group/carousel h-[300px] 2xl:h-[320px]">
                     <div 
                        className="flex gap-6 transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1) h-full items-center" 
                        style={{ transform: `translateX(-${currentIndex * ( (mounted ? (window.innerWidth >= 1536 ? 400 : window.innerWidth >= 1024 ? 350 : (window.innerWidth - 64)) : 350) + 24)}px)` }}
                     >
                        {maturityItems.map((item) => {
                           const MaturityIcon = item.icon;
                           return (
                              <div
                                 key={item.id}
                                 className="flex-shrink-0 w-full lg:w-[350px] 2xl:w-[400px] bg-white border border-neutral-100 rounded-md p-10 2xl:p-12 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col justify-between h-[90%] 2xl:h-[95%]"
                              >
                                 <div className="flex justify-between items-start">
                                    <div className={`w-16 h-16 2xl:w-20 2xl:h-20 rounded-md ${item.color.split(' ')[0]} ${item.color.split(' ')[1]} flex items-center justify-center group-hover:rotate-[10deg] transition-transform shadow-sm`}>
                                       <MaturityIcon className="h-8 w-8 2xl:h-10 2xl:w-10" />
                                    </div>
                                    <Badge className="bg-neutral-50 text-neutral-400 border-0 text-[10px] 2xl:text-xs font-black uppercase px-3 py-1">Próximo</Badge>
                                 </div>
                                 <div className="space-y-6 2xl:space-y-8">
                                    <div>
                                       <h4 className="font-black text-2xl 2xl:text-3xl text-[#0c0a09] leading-tight break-words group-hover:text-[#f97316] transition-colors">{item.label}</h4>
                                       <p className="text-xs 2xl:text-sm font-black text-neutral-400 uppercase tracking-widest mt-2">{item.company}</p>
                                    </div>
                                    <div className="flex items-baseline gap-2 pt-4 border-t border-neutral-50">
                                       <span className="text-[10px] 2xl:text-xs font-black text-neutral-400 uppercase">Total Valor</span>
                                       <p className="text-2xl 2xl:text-4xl font-black text-[#0c0a09] font-mono tracking-tighter">{item.value}</p>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-10 2xl:space-y-12 bg-white/30 backdrop-blur-md rounded-md border border-white/40">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <h2 className="text-3xl 2xl:text-4xl font-black tracking-tighter text-[#0c0a09]">Histórico Recente</h2>
                     <div className="h-12 w-[1px] bg-neutral-200 hidden sm:block" />
                     <p className="text-sm 2xl:text-base font-bold text-neutral-400 hidden sm:block uppercase tracking-widest">Últimas 5 operações</p>
                  </div>
                  <div className="flex gap-4">
                     <Select defaultValue="Todas">
                        <SelectTrigger className="w-[180px] 2xl:w-[200px] bg-white border-white/10 rounded-md h-12 2xl:h-14 shadow-sm font-bold px-8 text-[#0c0a09] transition-all hover:bg-neutral-50">
                           <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-0 shadow-2xl font-bold">
                           <SelectItem value="Todas">Todas Operações</SelectItem>
                           <SelectItem value="Pix">Apenas Pix</SelectItem>
                           <SelectItem value="Cartão">Cartão G8</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="space-y-6">
                  {isLoadingTransactions ? (
                     <div className="py-24 flex flex-col items-center justify-center space-y-8">
                        <div className="relative w-16 h-16">
                           <div className="absolute inset-0 border-4 border-[#f97316]/5 rounded-full" />
                           <div className="absolute inset-0 border-4 border-t-[#f97316] rounded-full animate-spin" />
                        </div>
                        <p className="text-xs font-black uppercase text-neutral-400 tracking-[0.3em] animate-pulse">Sincronizando registros...</p>
                     </div>
                  ) : realTransactions.length === 0 ? (
                     <div className="p-24 text-center bg-white/50 border border-dashed border-neutral-200 rounded-md space-y-6">
                        <TrendingUp className="h-12 w-12 text-neutral-200 mx-auto" />
                        <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">Aguardando sua primeira transação</p>
                     </div>
                  ) : (
                     <div className="grid gap-6">
                        {realTransactions.map((t, idx) => {
                           const TransactionIcon = getIconForMetodo(t.metodo);
                           const displayName = t.tipo === "CREDITO" ? (t.pagadorNome || "Depósito Recebido") : (t.RecebinteNome || "Pagamento Efetuado");
                           const dateOnly = t.dataDaTransacaoFormatada?.split(" ")[0] || "---";

                           return (
                              <div
                                 key={idx}
                                 onClick={() => setSelectedTransaction(t)}
                                 className="flex items-center justify-between p-6 2xl:p-10 bg-white rounded-md border border-neutral-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/30 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer group"
                              >
                                 <div className="flex items-center gap-8 2xl:gap-10">
                                    <div className={`w-16 h-16 2xl:w-20 2xl:h-20 rounded-md flex items-center justify-center p-4 transition-all shadow-sm ${t.tipo === 'CREDITO' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                       <TransactionIcon className="h-full w-full stroke-[2]" />
                                    </div>
                                    <div className="space-y-2 min-w-0">
                                       <p className="font-black text-xl 2xl:text-2xl text-[#0c0a09] leading-none group-hover:text-[#f97316] transition-colors truncate max-w-[300px] 2xl:max-w-[450px]">{displayName}</p>
                                       <div className="flex items-center gap-3">
                                          <Badge variant="secondary" className={`text-[10px] 2xl:text-xs font-black uppercase border-0 px-3 h-6 flex items-center ${t.tipo === 'CREDITO' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                             {t.metodoFormatado}
                                          </Badge>
                                          <span className="text-neutral-300 font-black">&bull;</span>
                                          <span className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-widest">{dateOnly}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-6 md:gap-12 shrink-0">
                                    <div className="text-right w-40 md:w-56 2xl:w-80">
                                       <p className={`font-mono text-xl md:text-2xl 2xl:text-5xl font-black tracking-tighter ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-red-500'}`}>
                                          {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                                       </p>
                                    </div>
                                    <div className="w-12 h-12 2xl:w-16 2xl:h-16 rounded-md border border-neutral-50 flex items-center justify-center text-neutral-200 group-hover:text-[#f97316] group-hover:border-orange-100 group-hover:bg-orange-50 transition-all">
                                       <ChevronRight className="h-6 w-6" />
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


          <div className="w-full xl:w-[32%] xl:min-w-[320px] xl:max-w-[450px] 2xl:max-w-[550px] shrink-0 space-y-12 2xl:space-y-16 pb-10 pr-0 xl:pr-2">
            <Card className="rounded-md border-0 shadow-2xl shadow-black/10 bg-white p-10 2xl:p-12 space-y-12 2xl:space-y-16 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
               <div className="space-y-10 2xl:space-y-12 relative z-10">
                  <div className="space-y-2">
                     <div className="flex items-center justify-between group cursor-pointer">
                        <h3 className="text-neutral-400 text-[11px] 2xl:text-xs font-black uppercase tracking-[0.3em]">Saldo Disponível</h3>
                        <RotateCw className="h-4 w-4 text-neutral-200 group-hover:text-[#f97316] group-hover:rotate-180 transition-all duration-700" />
                     </div>
                      <div className="flex items-baseline gap-6">
                         {isLoadingData ? (
                            <div className="h-12 2xl:h-20 w-64 bg-black/5 animate-pulse rounded-md" />
                         ) : (
                            <p className="text-3xl 2xl:text-8xl font-black text-[#0c0a09] font-mono tracking-tighter drop-shadow-xl">{balance}</p>
                         )}
                         {!isLoadingData && <div className="w-5 h-5 rounded-sm bg-green-500 animate-pulse" />}
                      </div>
                     <div className="flex items-center gap-3 pt-4">
                        <Badge className="bg-green-50 text-green-600 border-0 px-3 py-1 font-black text-[10px] 2xl:text-xs uppercase tracking-widest">+12.5%</Badge>
                        <span className="text-xs 2xl:text-sm text-neutral-400 font-bold italic">este mês</span>
                     </div>
                  </div>

                  <Tabs 
                     defaultValue="week" 
                     className="w-full"
                     onValueChange={(val) => setChartPeriod(val as any)}
                  >
                     <TabsList className="bg-slate-50 rounded-md p-2 h-14 2xl:h-16 w-full grid grid-cols-3">
                        <TabsTrigger value="day" className="rounded-md h-full text-[10px] 2xl:text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Dia</TabsTrigger>
                        <TabsTrigger value="week" className="rounded-md h-full text-[10px] 2xl:text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Semana</TabsTrigger>
                        <TabsTrigger value="month" className="rounded-md h-full text-[10px] 2xl:text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Mês</TabsTrigger>
                     </TabsList>
                  </Tabs>
               </div>

               <div className="h-[280px] 2xl:h-[350px] w-full -mx-4">
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
                              tick={{ fontSize: 13, fill: '#cbd5e1', fontWeight: 800 }}
                              dy={10}
                           />
                           <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 'bold' }}
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
                              strokeWidth={4}
                              fillOpacity={1}
                              fill="url(#colorValue)"
                              activeDot={{ r: 8, fill: "#f97316", stroke: "white", strokeWidth: 4 }}
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  )}
               </div>

            
            </Card>

            <Card className="rounded-md border-0 shadow-2xl shadow-black/10 bg-[#0c0a09] p-6 text-white relative overflow-hidden group border border-white/5 ml-10">
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f97316]/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-10 2xl:space-y-12">
                  <div className="relative">
                     <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                     <div className="w-24 h-24 2xl:w-32 2xl:h-32 bg-gradient-to-br from-orange-400 to-[#f97316] rounded-md flex items-center justify-center p-6 2xl:p-8 shadow-2xl relative">
                        <Users className="h-full w-full text-white" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-black text-3xl 2xl:text-4xl tracking-tighter">Impulsione o G8!</h3>
                     <p className="text-sm 2xl:text-base font-medium text-white/50 px-4 leading-relaxed">Ganhe <span className="text-[#f97316] font-black">R$ 50,00</span> por cada convite aceito.</p>
                  </div>
                  <Button className="w-full bg-white text-[#0c0a09] hover:bg-[#f97316] hover:text-white transition-all duration-500 rounded-md h-14 2xl:h-16 font-black uppercase tracking-widest text-xs 2xl:text-base shadow-xl shadow-black/20">
                     Compartilhar Agora
                  </Button>
               </div>
            </Card>
          </div>

         {/* Premium Receipt Modal Overlay */}
         {selectedTransaction && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
                 <Card className="w-full max-w-lg 2xl:max-w-3xl bg-white rounded-md overflow-hidden shadow-2xl relative border-white/20 animate-in zoom-in-95 duration-300 my-auto">
                     <button
                         onClick={() => setSelectedTransaction(null)}
                         className="absolute top-4 right-4 p-2 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-all z-20 hover:rotate-90"
                     >
                         <ArrowLeft className="h-5 w-5 rotate-180 text-neutral-400" />
                     </button>

                     <div className="relative">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-neutral-50 to-white" />
                        
                        <div className="p-6 md:p-8 2xl:p-12 space-y-6 2xl:space-y-10 relative z-10">
                            <div className="text-center space-y-3 2xl:space-y-5">
                                <div className="relative inline-block">
                                    <div className="absolute -inset-4 bg-[#f97316]/10 rounded-full blur-xl" />
                                    <div className="w-14 h-14 2xl:w-20 2xl:h-20 bg-[#0c0a09] rounded-md flex items-center justify-center text-[#f97316] mx-auto shadow-2xl relative border border-white/5">
                                        <Diamond className="h-7 w-7 2xl:h-10 2xl:w-10 fill-[#f97316]/20" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl 2xl:text-4xl font-black text-[#0c0a09] tracking-tighter uppercase font-sans">Comprovante</h2>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                       <CheckCircle2 className="h-4 w-4 2xl:h-5 2xl:w-5 text-green-500" />
                                       <p className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-[0.2em]">Autenticação G8 PAY</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                               <div className="md:col-span-2 text-center py-7 2xl:py-12 bg-neutral-50 rounded-md border border-neutral-100 flex flex-col justify-center">
                                   <p className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-[0.3em] mb-3">Valor Total</p>
                                   <p className="text-3xl 2xl:text-5xl font-black text-[#f97316] font-mono tracking-tighter leading-none">
                                       {selectedTransaction.tipo === 'CREDITO' ? '+' : '-'} {selectedTransaction.valorFormatado}
                                   </p>
                               </div>

                               <div className="md:col-span-3 p-5 2xl:p-8 rounded-md bg-neutral-50 border border-neutral-100 flex flex-col justify-center space-y-2">
                                  <div className="flex items-center gap-2 mb-1">
                                     <Fingerprint className="h-4 w-4 text-[#f97316]" />
                                     <p className="text-xs 2xl:text-sm font-black uppercase tracking-[0.2em] text-[#f97316]">Autenticação Digital</p>
                                  </div>
                                  <p className="text-xs 2xl:text-sm font-mono font-bold break-all leading-relaxed text-[#0c0a09]/70">{selectedTransaction.codigoDeIdentificacao}</p>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-8">
                                {/* Payer Card */}
                                <div className="space-y-4 2xl:space-y-6 p-5 2xl:p-8 rounded-md bg-neutral-50/80 border border-neutral-100">
                                   <div className="flex items-center gap-3 mb-2">
                                      <Building2 className="h-4 w-4 2xl:h-5 2xl:w-5 text-neutral-400" />
                                      <p className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-widest">Origem / Pagador</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-black text-[#0c0a09] truncate text-base 2xl:text-xl">{selectedTransaction.pagadorNome || "CLIENTE G8PAY"}</p>
                                      <p className="text-sm 2xl:text-base text-neutral-500 font-mono font-bold opacity-70">
                                         {selectedTransaction.pagadorTaxNumber?.present ? selectedTransaction.pagadorTaxNumber.value : (selectedTransaction.pagadorTaxNumber || "---")}
                                      </p>
                                   </div>
                                   <div className="pt-3 border-t border-neutral-200/50 space-y-2 2xl:space-y-4">
                                      <div className="flex justify-between items-center text-sm 2xl:text-base">
                                         <span className="text-neutral-400 font-bold">Banco</span>
                                         <span className="font-black text-[#0c0a09] uppercase truncate ml-2 text-right">{selectedTransaction.pagadorInstituicao || "G8 BANK (382)"}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs 2xl:text-sm">
                                         <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                         <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                            {selectedTransaction.pagadorAgencia || "0001"} &bull; {selectedTransaction.pagadorConta || "0000000-0"}
                                         </span>
                                      </div>
                                   </div>
                                </div>

                                {/* Receiver Card */}
                                <div className="space-y-4 2xl:space-y-6 p-5 2xl:p-8 rounded-md bg-neutral-50/80 border border-neutral-100">
                                   <div className="flex items-center gap-3 mb-2">
                                      <Building2 className="h-4 w-4 2xl:h-5 2xl:w-5 text-neutral-400" />
                                      <p className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-widest">Destino / Recebedor</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-black text-[#0c0a09] truncate text-base 2xl:text-xl">{selectedTransaction.RecebinteNome || "PAGAMENTO G8PAY"}</p>
                                      <p className="text-sm 2xl:text-base text-neutral-500 font-mono font-bold opacity-70">
                                         {selectedTransaction.RecebinteTaxNumber?.present ? selectedTransaction.RecebinteTaxNumber.value : (selectedTransaction.RecebinteTaxNumber || "---")}
                                      </p>
                                   </div>
                                   <div className="pt-3 border-t border-neutral-200/50 space-y-2 2xl:space-y-4">
                                      <div className="flex justify-between items-center text-sm 2xl:text-base">
                                         <span className="text-neutral-400 font-bold">Banco</span>
                                         <span className="font-black text-[#0c0a09] uppercase truncate ml-2 text-right">{selectedTransaction.RecebinteInstituicao || "BANCO DESTINO"}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs 2xl:text-sm">
                                         <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                         <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                            {selectedTransaction.RecebinteAgencia || "---"} &bull; {selectedTransaction.RecebinteConta || "---"}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                            </div>

                            <div className="space-y-5 pt-2">
                               <div className="grid grid-cols-2 gap-8">
                                   <div>
                                       <p className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-widest mb-1.5">Metodologia</p>
                                       <Badge className="bg-[#f97316]/5 text-[#f97316] border-0 px-3 py-1 font-black text-sm 2xl:text-base uppercase tracking-widest rounded-sm">
                                          {selectedTransaction.metodoFormatado}
                                       </Badge>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-xs 2xl:text-sm text-neutral-400 font-black uppercase tracking-widest mb-1.5">Data Efetiva</p>
                                       <p className="text-base 2xl:text-xl font-black text-[#0c0a09]">
                                           {selectedTransaction.dataDaTransacaoFormatada.split(" ")[0].split("-").reverse().join("/")} <span className="ml-2 text-neutral-400">{selectedTransaction.dataDaTransacaoFormatada.split(" ")[1]}</span>
                                       </p>
                                   </div>
                               </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button 
                                   onClick={() => handlePrintReceipt(
                                       selectedTransaction.idDoBancoLiquidante || selectedTransaction.itemId || selectedTransaction.id,
                                       selectedTransaction.tipo === "CREDITO" ? (selectedTransaction.pagadorNome || "Transacao") : (selectedTransaction.RecebinteNome || "Transacao")
                                   )}
                                   className="flex-1 h-14 2xl:h-20 bg-[#0c0a09] text-white hover:bg-[#f97316] rounded-md font-black uppercase tracking-widest text-sm 2xl:text-lg transition-all shadow-xl shadow-black/10 group active:scale-95"
                                >
                                    <Download className="h-5 w-5 mr-3 group-hover:-translate-y-1 transition-transform" /> Gerar Comprovante
                                </Button>
                                <Button 
                                   variant="outline" 
                                   onClick={() => setSelectedTransaction(null)} 
                                   className="h-12 2xl:h-20 border-neutral-100 rounded-md font-black uppercase tracking-widest text-sm 2xl:text-lg px-8 active:scale-95 text-neutral-400 hover:text-black"
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
