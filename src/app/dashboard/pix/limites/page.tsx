"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Gamepad2, 
  ShieldCheck, 
  Clock, 
  Smartphone,
  Gauge,
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";

export default function PixLimitesPage() {
  const [dayLimit, setDayLimit] = useState([5000]);
  const [nightLimit, setNightLimit] = useState([1000]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
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
                 <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-transparent font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest">Segurança &bull; Pix</Badge>
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Gestão de Valores</span>
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
                 Meus Limites PIX
                 <Gauge className="h-7 w-7 text-[#f97316] stroke-[2]" />
               </h1>
            </div>
          </div>
        </div>

        {/* Limits Controls Card */}
        <div className="bg-white rounded-[56px] p-12 border border-neutral-100 shadow-sm space-y-12">
           {/* Info Box */}
           <div className="bg-blue-50 border border-blue-100 p-6 rounded-[32px] flex gap-5 items-start">
              <div className="bg-blue-500 p-2 rounded-[14px] text-white">
                 <Info className="h-5 w-5" />
              </div>
              <div>
                 <p className="text-sm font-black text-blue-900 uppercase tracking-tight mb-1">Sobre seus limites</p>
                 <p className="text-sm font-medium text-blue-800/70 leading-relaxed">
                    Aumentos de limite levam de 24h a 48h para serem aprovados por questões de segurança. Reduções de limite são imediatas.
                 </p>
              </div>
           </div>

           {/* Limite Diário */}
           <div className="space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black text-[#0c0a09]">Limite Diário</h3>
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Período: 06:00 às 20:00</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-[#f97316] font-mono">{formatCurrency(dayLimit[0])}</p>
                    <p className="text-[10px] text-neutral-300 font-black uppercase tracking-widest">Disponível: {formatCurrency(dayLimit[0] - 1250)}</p>
                 </div>
              </div>
              <div className="px-2">
                 <Slider 
                   defaultValue={[5000]} 
                   max={20000} 
                   step={100} 
                   onValueChange={setDayLimit}
                   className="[&_[role=slider]]:bg-[#f97316] [&_[role=slider]]:border-[#f97316]"
                 />
              </div>
           </div>

           <div className="h-px bg-neutral-100 w-full" />

           {/* Limite Noturno */}
           <div className="space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <div className="flex items-center gap-3">
                       <h3 className="text-2xl font-black text-[#0c0a09]">Limite Noturno</h3>
                       <Badge className="bg-neutral-900 text-white rounded-full px-2 py-0.5 text-[9px]">ATIVO</Badge>
                    </div>
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Período: 20:00 às 06:00</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-[#f97316] font-mono">{formatCurrency(nightLimit[0])}</p>
                    <p className="text-[10px] text-neutral-300 font-black uppercase tracking-widest">Limite Máximo Sugerido</p>
                 </div>
              </div>
              <div className="px-2">
                 <Slider 
                   defaultValue={[1000]} 
                   max={5000} 
                   step={50} 
                   onValueChange={setNightLimit}
                   className="[&_[role=slider]]:bg-[#f97316] [&_[role=slider]]:border-[#f97316]"
                 />
              </div>
           </div>

           <div className="h-px bg-neutral-100 w-full" />

           {/* Aditional Safety Controls */}
           <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#f97316]">Opções de Segurança</h3>
              <div className="grid grid-cols-1 gap-4">
                 {[
                   { icon: ShieldCheck, title: "Lista de Confiança", desc: "Contatos que não precisam de limites rígidos", active: true },
                   { icon: Clock, title: "Ajuste de Horário Noturno", desc: "Defina quando seu limite noturno começa", active: false },
                   { icon: Smartphone, title: "Bloqueio Transacional", desc: "Pedir biometria para todos os Pix acima de R$ 500", active: true },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f97316] shadow-sm group-hover:scale-110 transition-transform">
                            <item.icon className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="font-black text-[#0c0a09] leading-tight">{item.title}</p>
                            <p className="text-xs text-neutral-400 font-bold">{item.desc}</p>
                         </div>
                      </div>
                      <Switch checked={item.active} className="data-[state=checked]:bg-[#f97316]" />
                   </div>
                 ))}
              </div>
           </div>

           <Button className="w-full h-16 bg-[#0c0a09] hover:bg-neutral-800 text-white rounded-3xl font-black text-xl shadow-2xl transition-all active:scale-95">
              Salvar Alterações
           </Button>
        </div>
      </div>

      {/* Side Column */}
      <div className="w-[380px] shrink-0 space-y-8">
        <Card className="rounded-[48px] border-0 shadow-2xl bg-[#f97316] p-10 text-white relative overflow-hidden group h-[340px]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                 <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black leading-tight">Seguro Pix Bradesco</h3>
              <p className="text-sm font-medium text-white/80 leading-relaxed">Proteção contra coação, sequestro e golpes digitais. Mensalidades a partir de R$ 9,90.</p>
              <button className="text-[10px] font-black border-b-2 border-white uppercase tracking-widest pb-0.5">Saber Mais</button>
           </div>
        </Card>

        <div className="p-8 bg-white rounded-[40px] border border-neutral-100 shadow-sm space-y-6">
           <h4 className="font-black text-[#0c0a09] uppercase tracking-widest text-xs">Histórico de Alterações</h4>
           <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="w-1 bg-[#f97316] rounded-full" />
                 <div>
                    <p className="text-sm font-bold text-[#0c0a09]">Aumento de Limite Diário</p>
                    <p className="text-[10px] text-neutral-400 font-bold">Solicitado em 02 Fev, 14:12</p>
                    <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase text-blue-500 border-blue-200">Em Análise</Badge>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
