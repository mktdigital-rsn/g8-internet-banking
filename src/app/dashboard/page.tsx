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
   MoreHorizontal
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

const chartData = [
   { name: "D", value: 120 },
   { name: "S", value: 90 },
   { name: "T", value: 150 },
   { name: "Q", value: 300 },
   { name: "Q", value: 180 },
   { name: "S", value: 100 },
   { name: "S", value: 110 },
];

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
   const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
   const [currentIndex, setCurrentIndex] = useState(0);

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
               setRealTransactions(extratoRes.data.data.slice(0, 5));
            }
         } catch (err) {
            console.error("Error fetching home data:", err);
         } finally {
            setIsLoadingTransactions(false);
         }
      };
      fetchData();
   }, []);

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
      <div className="p-4 xl:p-8 flex flex-row gap-6 xl:gap-10 h-full overflow-y-auto w-full no-scrollbar">
         {/* Left Column: Main Dashboard */}
         <div className="flex-1 space-y-12 min-w-0 p-6">
            <div className="flex flex-row gap-12    items-start">
               {/* Card Summary */}
               <div className="space-y-6 flex flex-col flex-[1.2] min-w-0">
                  <div className="flex items-center justify-between">
                     <h2 className="text-3xl font-black tracking-tighter text-[#f97316]">Meu Resumo</h2>
                     <Link href="/dashboard/conta">
                        <button className="text-primary hover:underline text-[10px] uppercase tracking-widest font-black flex items-center gap-1 group">
                           Ver cartões
                           <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                     </Link>
                  </div>

                  <div className="relative group cursor-pointer w-full max-w-[600px]">
                     <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                     <div className="relative h-60 xl:h-64 w-full bg-[#0c0a09] text-white p-8 rounded-[32px] shadow-2xl flex flex-col justify-between overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/[0.08] transition-colors" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f97316]/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                        <div className="flex justify-between items-start z-10">
                           <div className="flex flex-col">
                              <span className="font-black tracking-widest text-3xl italic opacity-90 uppercase leading-none">G8PAY</span>
                              <span className="text-xs text-primary font-black uppercase tracking-widest my-2">Digital Banking</span>
                           </div>
                           <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">Platinum Account</Badge>
                        </div>

                        <div className="space-y-4 xl:space-y-6 z-10 mt-auto">
                           <div className="w-16 h-12 bg-gradient-to-br from-orange-300 to-[#f97316] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform">
                              <div className="absolute inset-x-0 h-px bg-white/20 top-1/2 -translate-y-1/2"></div>
                              <div className="absolute inset-y-0 w-px bg-white/20 left-1/2 -translate-x-1/2"></div>
                           </div>
                           <div className="flex justify-between items-end gap-2">
                              <div>
                                 <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1.5">Número do Cartão</p>
                                 <p className="text-2xl xl:text-3xl font-mono tracking-[0.3em] text-white/90 truncate">{cardNumber}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1.5">Bandeira</p>
                                 <p className="text-xl xl:text-3xl font-black italic text-white/90">VISA</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Maturity Section Carousel - Fixed width for single card */}
               <div className="space-y-6 flex flex-col w-[300px] shrink-0 min-w-0 -ml-12">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl xl:text-3xl font-black tracking-tighter text-[#f97316] truncate pr-2">Vencimentos Próx.</h2>
                     <div className="flex gap-2 shrink-0">
                        <button 
                           onClick={prevMaturity}
                           disabled={currentIndex === 0}
                           className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#f97316]"
                        >
                           <ChevronRight className="h-5 w-5 rotate-180" />
                        </button>
                        <button 
                           onClick={nextMaturity}
                           disabled={currentIndex === maturityItems.length - 1}
                           className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#f97316]"
                        >
                           <ChevronRight className="h-5 w-5" />
                        </button>
                     </div>
                  </div>

                  <div className="relative overflow-hidden flex-1 group/carousel h-[260px] xl:h-[280px]">
                     <div 
                        className="flex gap-4 transition-transform duration-500 ease-out h-full" 
                        style={{ transform: `translateX(-${currentIndex * (280 + 16)}px)` }}
                     >
                        {maturityItems.map((item) => (
                           <div
                              key={item.id}
                              className="flex-shrink-0 w-[320px] bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
                           >
                              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                 <item.icon className="h-6 w-6" />
                              </div>
                              <div className="space-y-4">
                                 <div>
                                    <h4 className="font-black text-xl text-[#f97316] leading-tight break-words">{item.label}</h4>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">{item.company}</p>
                                 </div>
                                 <p className="text-2xl font-black text-[#0c0a09] font-mono tracking-tighter">{item.value}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tighter text-[#f97316]">Movimentações Recentes</h2>
                  <div className="flex gap-4">
                     <Select defaultValue="Todas">
                        <SelectTrigger className="w-[140px] bg-white border-0 rounded-2xl h-12 shadow-sm font-bold px-6 text-[#f97316]">
                           <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-0 shadow-xl font-bold">
                           <SelectItem value="Todas">Todas</SelectItem>
                           <SelectItem value="Pix">Pix</SelectItem>
                           <SelectItem value="Cartão">Cartão</SelectItem>
                        </SelectContent>
                     </Select>
                     <Button variant="ghost" size="icon" className="bg-white rounded-2xl h-12 w-12 shadow-sm text-[#f97316]">
                        <MoreHorizontal className="h-6 w-6" />
                     </Button>
                  </div>
               </div>

               <div className="space-y-4">
                  {isLoadingTransactions ? (
                     <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Carregando movimentações...</p>
                     </div>
                  ) : realTransactions.length === 0 ? (
                     <div className="p-12 text-center bg-neutral-50 rounded-[40px] border border-dashed border-neutral-200">
                        <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma movimentação recente</p>
                     </div>
                  ) : (
                     realTransactions.map((t, idx) => {
                        const Icon = getIconForMetodo(t.metodo);
                        const displayTitle = t.tipo === "CREDITO" ? "Entrada" : "Saída";
                        const displayName = t.tipo === "CREDITO" ? t.pagadorNome : t.RecebinteNome;
                        const dateOnly = t.dataDaTransacaoFormatada?.split(" ")[0] || "---";

                        return (
                           <div
                              key={idx}
                              className="flex items-center justify-between p-6 bg-white rounded-[40px] border border-neutral-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
                           >
                              <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 rounded-3xl flex items-center justify-center p-3 transition-all ${t.tipo === 'CREDITO' ? 'bg-green-50 text-green-500' : 'bg-neutral-50 text-[#f97316]'}`}>
                                    <Icon className="h-full w-full stroke-[1.5]" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="font-black text-lg text-[#0c0a09] leading-tight">{displayTitle}</p>
                                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest leading-none truncate max-w-[180px]">{displayName || "Transação Geral"}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-10">
                                 <div className="text-right">
                                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest leading-none mb-1">{t.metodoFormatado}</p>
                                    <p className="text-xs font-bold text-[#0c0a09] font-mono">{dateOnly}</p>
                                 </div>
                                 <div className="text-right w-36">
                                    <p className={`font-black text-2xl font-mono tracking-tighter ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-[#0c0a09]'}`}>
                                       {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                                    </p>
                                 </div>
                                 <Button variant="ghost" size="icon" className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-all rounded-full h-10 w-10">
                                    <ChevronRight className="h-6 w-6" />
                                 </Button>
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Sidebar Charts/Stats */}
         <div className="w-[380px]  shrink-0 space-y-10 pb-10">
            <Card className="rounded-[56px] border-0 shadow-2xl shadow-black/5 bg-white p-10 space-y-10">
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-neutral-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Saldo Atual</h3>
                        <p className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-[#0c0a09] font-mono tracking-tighter">{balance}</p>
                     </div>
                     <Badge className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 border-0 px-3 py-1 font-black text-[10px] uppercase">Abr/2026</Badge>
                  </div>

                  <Tabs defaultValue="week" className="w-full">
                     <TabsList className="bg-slate-50 rounded-2xl p-1.5 h-12 w-full grid grid-cols-3">
                        <TabsTrigger value="day" className="rounded-xl h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Dia</TabsTrigger>
                        <TabsTrigger value="week" className="rounded-xl h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Semana</TabsTrigger>
                        <TabsTrigger value="month" className="rounded-xl h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Mês</TabsTrigger>
                     </TabsList>
                  </Tabs>
               </div>

               <div className="h-[240px] w-full -mx-4">
                  {mounted && (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
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
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 'bold' }}
                              cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' }}
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
                     <h3 className="font-black text-2xl text-[#f97316]">Faturas</h3>
                     <button className="text-neutral-400 font-black text-[10px] uppercase tracking-widest hover:text-[#f97316] transition-colors">Ver Todos</button>
                  </div>

                  <div className="space-y-6">
                     {/* Fatura Card 1 */}
                      <div className="bg-gradient-to-br from-orange-400 to-[#f97316] rounded-[32px] p-8 text-white shadow-xl shadow-orange-500/20 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer min-h-[120px]">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                         <div className="space-y-2 z-10">
                            <p className="text-3xl xl:text-4xl font-black font-mono tracking-tighter">R$ 2.174,20</p>
                            <p className="text-[10px] text-white/70 font-black tracking-[0.2em] uppercase">Vence em 15/04</p>
                         </div>
                         <div className="z-10 shrink-0">
                            <Switch className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10 h-7 w-12" checked={true} />
                         </div>
                      </div>

                     {/* Fatura Card 2 */}
                     <div className="bg-[#f97316] rounded-[32px] p-8 text-white shadow-xl shadow-black/10 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="space-y-2 z-10">
                           <p className="text-3xl font-bold font-mono">R$ 714,02</p>
                           <p className="text-xs text-white/50 font-bold tracking-[0.2em] uppercase">Vence em 25/02</p>
                        </div>
                        <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center italic font-black text-[10px]">VISA</div>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[56px] border-0 shadow-2xl shadow-black/5 bg-[#0c0a09] p-10 text-white relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#f97316]/20 rounded-full -mr-24 -mb-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center p-5 group-hover:scale-110 transition-transform duration-500">
                     <CreditCard className="h-full w-full text-[#f97316]" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="font-black text-2xl">Indique e Ganhe</h3>
                     <p className="text-sm font-medium text-white/60 px-6 leading-relaxed">Ganhe até <span className="text-[#f97316] font-black">R$ 50,00</span> por cada amigo que abrir conta com seu link.</p>
                  </div>
                  <Button className="w-full bg-[#f97316] text-white hover:bg-[#f97316]/90 transition-all rounded-3xl h-14 font-black uppercase tracking-widest text-xs">
                     Copiar Link
                  </Button>
               </div>
            </Card>
         </div>
      </div>
   );
}
