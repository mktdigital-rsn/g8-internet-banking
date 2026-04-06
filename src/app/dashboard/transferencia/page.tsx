"use client";

import React from "react";
import Image from "next/image";
import { 
  ArrowRight, 
  ChevronRight,
  Landmark,
  Star,
  Globe,
  ArrowRightLeft,
  FileText,
  PlusCircle,
  Settings,
  HelpCircle,
  MessageCircle,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TransferenciaPage() {
  return (
    <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar">
      {/* Main Content */}
      <div className="flex-1 space-y-4 max-w-4xl">
        {/* Page Title Header */}
        <div className="flex items-center gap-3">
          <div className="bg-[#f97316] text-white px-8 py-3 rounded-full flex items-center gap-3 shadow-lg shadow-[#f97316]/20">
            <span className="text-xl font-black italic tracking-tighter uppercase">TRANSFERÊNCIA</span>
            <div className="bg-white/20 p-1.5 rounded-full">
              <ArrowRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#f97316]">Transferir</h2>
          <div className="flex flex-wrap gap-6">
            <TransferAction icon={Landmark} label="Agência e Conta" />
            <TransferAction icon={Star} label="Favoritos" />
            <TransferAction icon={Globe} label="Exterior" />
          </div>
        </div>

        {/* Deposit Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#f97316]">Depositar</h2>
          <div className="flex flex-wrap gap-6">
            <TransferAction icon={ArrowRightLeft} label="TED" />
            <TransferAction icon={LayoutGrid} label="Boleto" isBoleto />
          </div>
        </div>

        {/* Others Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#f97316]">Outros</h2>
          <div className="flex flex-wrap gap-6">
            <TransferAction icon={PlusCircle} label="Cadastrar Favorito" />
            <TransferAction icon={FileText} label="Extrato" />
            <TransferAction icon={Settings} label="Outros" />
          </div>
        </div>
      </div>

      {/* Right Column: Advertisement & Help */}
      <div className="w-[380px] shrink-0 space-y-8">
        {/* Banner Card */}
        <Card className="rounded-[40px] border-0 shadow-2xl shadow-black/5 bg-[#f5f5f5] overflow-hidden relative group cursor-pointer h-[400px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="p-8 space-y-4 relative z-10">
            <h3 className="text-2xl font-bold text-[#f97316] leading-tight max-w-[200px]">
              Seja você mesmo seu assessor de investimento
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[180px]">
              Montamos uma carteira diversificada em busca do melhor dos seus objetivos.
            </p>
            <button className="text-xs font-black text-[#f97316] border-b-2 border-[#f97316] pb-0.5 mt-4 hover:text-primary hover:border-primary transition-colors">
              VER PRODUTO
            </button>
          </div>
          
          <div className="absolute bottom-0 right-0 w-full h-[65%] flex items-end justify-end">
             <div className="absolute bottom-0 right-0 w-[80%] h-[80%] bg-[#f97316]/20 rounded-full blur-[100px] -mb-20 -mr-20" />
             <Image 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=investment" 
                alt="Investment Assessor" 
                width={300} 
                height={300} 
                className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-500 origin-bottom"
             />
          </div>
        </Card>

        {/* Help Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#f97316]">Ajuda</h2>
          <div className="flex gap-4">
             <button className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f5f5f5] rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-neutral-200 group">
                <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                   <HelpCircle className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#f97316]">Suporte</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f5f5f5] rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-neutral-200 group">
                <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                   <MessageCircle className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#f97316]">Chat 24H</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransferAction({ 
    icon: Icon, 
    label, 
    isBoleto = false 
}: { 
    icon: any, 
    label: string, 
    isBoleto?: boolean 
}) {
  return (
    <button className="flex flex-col items-center justify-center w-[120px] h-[140px] bg-[#f5f5f5] rounded-[32px] hover:bg-white hover:shadow-xl hover:scale-[1.05] transition-all border border-transparent hover:border-neutral-200 group">
       <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] group-hover:scale-110 transition-transform">
          {isBoleto ? (
             <div className="font-mono font-bold text-2xl tracking-tighter scale-y-150">|||||||</div>
          ) : (
             <Icon className="h-8 w-8 stroke-[1.5]" />
          )}
       </div>
       <span className="text-xs font-bold text-[#f97316] text-center px-2">{label}</span>
    </button>
  );
}
