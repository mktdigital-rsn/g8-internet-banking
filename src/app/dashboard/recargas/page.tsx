"use client";

import React from "react";
import { 
  Smartphone, 
  Clock, 
  ArrowLeft,
  Settings,
  Bell,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RecargasPage() {
  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#f8f9fa]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-orange-600/10 rounded-full flex items-center justify-center mx-auto relative">
           <Smartphone className="h-16 w-16 text-orange-600" />
           <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-widest shadow-lg">Em breve</div>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          <Badge variant="secondary" className="bg-orange-600/10 text-orange-600 border-0 px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em]">Lançamento Próximo</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">
            Recargas de <span className="text-orange-600">CELULAR</span>
          </h1>
          <p className="text-base text-neutral-400 font-bold leading-relaxed">
            Estamos finalizando as integrações com todas as operadoras do Brasil para trazer a melhor experiência de recarga diretamente na sua conta G8.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
           {[
             { icon: CheckCircle2, text: "Todas as operadoras" },
             { icon: Clock, text: "Recarga Agendada" },
             { icon: Bell, text: "Aviso de Saldo" }
           ].map((item, i) => (
             <div key={i} className="p-6 bg-white border border-neutral-100 rounded-sm shadow-sm flex flex-col items-center gap-3">
                <item.icon className="h-6 w-6 text-orange-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0c0a09]">{item.text}</span>
             </div>
           ))}
        </div>

        <div className="pt-8">
          <Link href="/dashboard">
            <Button className="h-14 px-10 bg-[#0c0a09] hover:bg-neutral-800 text-white rounded-sm font-black uppercase tracking-widest text-xs transition-all shadow-xl">
              <ArrowLeft className="h-5 w-5 mr-3" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
