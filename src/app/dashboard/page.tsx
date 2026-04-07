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

  React.useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        
        const response = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          setUserName(response.data.name);
          setBalance(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(response.data.balance || 0));
          if (response.data.cardNumber) setCardNumber(response.data.cardNumber);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="p-10 flex gap-10 h-full overflow-y-auto no-scrollbar">
      {/* Left Column: Main Dashboard */}
      <div className="flex-1 space-y-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Card Summary */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter text-[#f97316]">Meu Resumo</h2>
              <button className="text-primary hover:underline text-sm font-bold flex items-center gap-1 group">
                Ver todos os cartões
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="relative group cursor-pointer">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f97316]/20 to-orange-500/20 rounded-[40px] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative bg-black text-white p-10 rounded-[40px] h-[260px] shadow-2xl flex flex-col justify-between overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f97316]/20 rounded-full -ml-24 -mb-24 blur-3xl" />
                  
                  <div className="flex justify-between items-start z-10">
                    <span className="font-black tracking-widest text-2xl italic opacity-80 uppercase">G8PAY</span>
                    <Badge variant="secondary" className="bg-white/10 text-white border-transparent backdrop-blur-md px-4 py-1 rounded-full font-bold">G8Pay Platinum</Badge>
                  </div>

                  <div className="space-y-6 z-10 mt-auto">
                    <div className="w-16 h-12 bg-gradient-to-br from-orange-300 to-[#f97316] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                       <div className="absolute inset-x-0 h-px bg-white/20 top-1/2 -translate-y-1/2"></div>
                       <div className="absolute inset-y-0 w-px bg-white/20 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Número do Cartão</p>
                          <p className="text-2xl font-mono tracking-[0.2em] whitespace-nowrap">{cardNumber}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Bandeira</p>
                          <p className="text-lg font-black tracking-wider italic">VISA</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Maturity Section Carousel */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter text-[#f97316]">Vencimentos Próx.</h2>
              <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm active:scale-90 text-[#f97316]">
                    <ChevronRight className="h-5 w-5 rotate-180" />
                 </button>
                 <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm active:scale-90 text-[#f97316]">
                    <ChevronRight className="h-5 w-5" />
                 </button>
              </div>
             </div>

             <div className="flex gap-6 overflow-x-auto pb-6 pt-1 snap-x no-scrollbar">
                {maturityItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex-shrink-0 w-[300px] p-10 bg-white border border-neutral-100 rounded-[48px] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group snap-start"
                  >
                     <div className={`w-16 h-16 rounded-3xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                        <item.icon className="h-8 w-8" />
                     </div>
                     <div className="space-y-4">
                        <div>
                           <h4 className="font-black text-2xl text-[#f97316] leading-tight">{item.label}</h4>
                           <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{item.company}</p>
                        </div>
                        <p className="text-3xl font-black text-[#f97316] font-mono">{item.value}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter text-[#f97316]">Movimentações Recentes</h2>
              <div className="flex gap-4">
                 <Select defaultValue="all">
                    <SelectTrigger className="w-[140px] bg-white border-0 rounded-2xl h-12 shadow-sm font-bold px-6 text-[#f97316]">
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0 shadow-xl font-bold">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                    </SelectContent>
                 </Select>
                 <Button variant="ghost" size="icon" className="bg-white rounded-2xl h-12 w-12 shadow-sm text-[#f97316]">
                    <MoreHorizontal className="h-6 w-6" />
                 </Button>
              </div>
           </div>

           <div className="space-y-4">
              {transactions.map((t) => (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-6 bg-white rounded-[40px] border border-neutral-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 text-[#f97316] group-hover:scale-110 group-hover:bg-orange-50 group-hover:text-[#f97316] transition-all">
                         <t.icon className="h-full w-full stroke-[1.5]" />
                      </div>
                      <div className="space-y-1">
                         <p className="font-black text-xl text-[#f97316] leading-tight">{t.type}</p>
                         <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-none">{t.name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-12">
                      <div className="text-right">
                         <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{t.date}</p>
                      </div>
                      <div className="text-right w-32">
                         <p className="font-black text-2xl font-mono text-[#f97316]">{t.value}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-all rounded-full h-10 w-10">
                         <ChevronRight className="h-6 w-6" />
                      </Button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Column: Sidebar Charts/Stats */}
      <div className="w-[420px] shrink-0 space-y-10">
         <Card className="rounded-[56px] border-0 shadow-2xl shadow-black/5 bg-white p-10 space-y-10">
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-neutral-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Saldo Atual</h3>
                     <p className="text-5xl font-black text-[#0c0a09] font-mono tracking-tighter">{balance}</p>
                  </div>
                  <Badge className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 border-0 px-3 py-1 font-black text-[10px] uppercase">Agos/2026</Badge>
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
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid vertical={false} stroke="#f1f1f1" strokeDasharray="3 3" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#cbd5e1', fontWeight: 800}} 
                        dy={10}
                     />
                     <Tooltip 
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 'bold'}}
                        cursor={{stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5'}}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#f97316" 
                        strokeWidth={5} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        activeDot={{ r: 8, fill: "#f97316", stroke: "white", strokeWidth: 4 }}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="font-black text-2xl text-[#f97316]">Faturas</h3>
                  <button className="text-neutral-400 font-black text-[10px] uppercase tracking-widest hover:text-[#f97316] transition-colors">Ver Todos</button>
               </div>

               <div className="space-y-6">
                  {/* Fatura Card 1 */}
                  <div className="bg-gradient-to-br from-orange-400 to-[#f97316] rounded-[32px] p-8 text-white shadow-xl shadow-orange-500/20 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                     <div className="space-y-2 z-10">
                        <p className="text-4xl font-black font-mono">R$ 2.174,20</p>
                        <p className="text-xs text-white/70 font-bold tracking-[0.2em] uppercase">Vence em 15/02</p>
                     </div>
                     <div className="z-10">
                        <Switch className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10 h-8 w-14" checked={true} />
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
