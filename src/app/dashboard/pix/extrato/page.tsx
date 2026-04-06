"use client";

import React from "react";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Download, 
  MoreVertical,
  PlusCircle,
  MinusCircle,
  Diamond
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const pixTransactions = [
  { id: 1, type: "out", name: "João Abraantes Silva", detail: "Pix Enviado", date: "03 Fev 23 16:44", value: "R$ 56,00" },
  { id: 2, type: "out", name: "Vinicius Henrique Or...", detail: "Pix Enviado", date: "01 Fev 23 16:44", value: "R$ 1.000" },
  { id: 3, type: "in", name: "Pedro Araujo Santos", detail: "Pix Recebido", date: "28 Jan 23 16:44", value: "R$ 3.400" },
  { id: 4, type: "in", name: "Gisele Fonseca", detail: "Pix Recebido", date: "28 Jan 23 10:19", value: "R$ 1.000" },
];

export default function PixExtratoPage() {
  return (
    <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar">
      {/* Main Content */}
      <div className="flex-1 space-y-8 max-w-5xl">
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
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Histórico de Transações</span>
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
                 Extrato PIX
                 <Diamond className="h-7 w-7 text-[#f97316] stroke-[2]" />
               </h1>
            </div>
          </div>
          <Button className="h-12 bg-[#f97316] hover:bg-[#c2410c] text-white rounded-2xl px-6 font-bold flex items-center gap-2 shadow-lg">
             <Download className="h-5 w-5" />
             Exportar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6">
           <Card className="bg-[#0c0a09] border-0 rounded-[40px] p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
              <div className="w-16 h-16 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316]">
                 <ArrowDownLeft className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">&mdash; Entradas</p>
                 <p className="text-3xl font-black text-white font-mono tracking-tight">R$ 8.093,00</p>
              </div>
           </Card>
           <Card className="bg-[#0c0a09] border-0 rounded-[40px] p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
              <div className="w-16 h-16 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316]">
                 <ArrowUpRight className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">&mdash; Saídas</p>
                 <p className="text-3xl font-black text-white font-mono tracking-tight">R$ 8.093,00</p>
              </div>
           </Card>
        </div>

        {/* Filter & List */}
        <div className="bg-white rounded-[56px] p-10 border border-neutral-100 shadow-sm space-y-8">
           <div className="flex items-center justify-between gap-6">
              <Tabs defaultValue="all" className="w-fit">
                <TabsList className="bg-neutral-50 rounded-2xl p-1.5 h-12">
                   <TabsTrigger value="all" className="rounded-xl h-full px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Tudo</TabsTrigger>
                   <TabsTrigger value="in" className="rounded-xl h-full px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Entradas</TabsTrigger>
                   <TabsTrigger value="out" className="rounded-xl h-full px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Saídas</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative flex-1 max-w-sm group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-[#f97316] transition-colors" />
                 <Input 
                   placeholder="Pesquisar..." 
                   className="h-12 bg-neutral-50 border-0 rounded-2xl pl-12 focus:bg-white focus:ring-1 focus:ring-[#f97316]/20 transition-all font-bold"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <div className="grid grid-cols-4 px-8 pb-4 text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                 <span>Descrição</span>
                 <span className="text-center">Valor</span>
                 <span className="text-center">Data</span>
                 <span className="text-right">Mais</span>
              </div>
              
              <div className="space-y-3">
                 {pixTransactions.map((t) => (
                   <div 
                     key={t.id} 
                     className="grid grid-cols-4 items-center px-8 py-6 bg-neutral-50/50 hover:bg-white rounded-[32px] border border-transparent hover:border-neutral-100 hover:shadow-xl transition-all group cursor-pointer"
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === 'in' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} group-hover:scale-110 transition-transform`}>
                           {t.type === 'in' ? <PlusCircle className="h-6 w-6" /> : <MinusCircle className="h-6 w-6" />}
                        </div>
                        <div>
                           <p className="font-black text-sm text-[#0c0a09] leading-none mb-1">{t.name}</p>
                           <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{t.detail}</p>
                        </div>
                     </div>
                     <p className="text-center font-black text-lg text-[#0c0a09] font-mono">{t.value}</p>
                     <p className="text-center text-xs font-bold text-neutral-400">{t.date}</p>
                     <div className="flex justify-end">
                        <Button variant="ghost" size="icon" className="rounded-full text-neutral-300 group-hover:text-[#f97316]">
                           <MoreVertical className="h-5 w-5" />
                        </Button>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Side Ads Column */}
      <div className="w-[380px] shrink-0 space-y-8">
        <Card className="rounded-[48px] border-0 shadow-2xl bg-gradient-to-br from-orange-400 to-[#f97316] p-10 text-white relative overflow-hidden group h-[300px] cursor-pointer">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black leading-tight">Conta internacional em dólar e euro</h3>
              <p className="text-xs font-medium text-white/80 leading-relaxed">Faça compras no exterior com tarifas mais baixas, segurança e praticidade.</p>
              <button className="text-[10px] font-black border-b-2 border-white uppercase tracking-widest pb-0.5">Ver Produto</button>
           </div>
           <ArrowUpRight className="absolute bottom-8 right-8 h-12 w-12 text-white/20 group-hover:text-white transition-colors" />
        </Card>

        <Card className="rounded-[48px] border-0 shadow-2xl bg-white p-10 space-y-6 relative overflow-hidden group cursor-pointer">
           <div className="space-y-4">
              <h3 className="text-2xl font-black text-[#0c0a09]">Programa de pontos</h3>
              <p className="text-xs font-medium text-neutral-400 leading-relaxed">Melhor que dinheiro: com os pontos você faz compras, paga despesas e muito mais.</p>
              <button className="text-[10px] font-black border-b-2 border-[#f97316] text-[#f97316] uppercase tracking-widest pb-0.5">Ver Produto</button>
           </div>
           <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#f97316]/5 rounded-full" />
        </Card>
      </div>
    </div>
  );
}
