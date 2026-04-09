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
        <div className="p-4 md:p-8 xl:p-12 flex flex-col xl:flex-row gap-8 xl:gap-12 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
            
            {/* Main Content Area */}
            <div className="flex-1 space-y-12 relative z-10">
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none">
                        Área <span className="text-[#f97316]">TRANSFERÊNCIA</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Actions */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Transfer Options */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Transferir</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                <TransferAction icon={Landmark} label="Agência e Conta" />
                                <TransferAction icon={Star} label="Favoritos" />
                                <TransferAction icon={Globe} label="Exterior" />
                                <TransferAction icon={ArrowRightLeft} label="TED / DOC" />
                            </div>
                        </div>

                        {/* Deposit Options */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Receber & Depósitos</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
                                <TransferAction icon={LayoutGrid} label="Boleto Bancário" isBoleto />
                                <TransferAction icon={PlusCircle} label="Novo Depósito" />
                                <TransferAction icon={FileText} label="Histórico" />
                                <TransferAction icon={Settings} label="Limites" />
                            </div>
                        </div>

                        {/* Favorites / Frequent Contacts - Premium List */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Favoritos Recentes</h2>
                                <button className="text-[10px] font-black text-[#f97316] uppercase tracking-widest hover:underline">Ver todos</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-100 hover:shadow-2xl transition-all group cursor-pointer flex flex-col items-center">
                                         <div className="w-16 h-16 rounded-full bg-[#f97316]/10 mb-4 overflow-hidden border-2 border-transparent group-hover:border-[#f97316] transition-all">
                                            <Image 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                                                alt="User"
                                                width={64}
                                                height={64}
                                            />
                                         </div>
                                         <span className="text-xs font-black text-center truncate w-full">Contato {i}</span>
                                         <span className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-tighter">G8 BANK SE</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                         {/* Promo Card High-End */}
                        <Card className="rounded-3xl border-0 shadow-2xl shadow-black/5 bg-[#0c0a09] p-10 space-y-8 relative overflow-hidden group cursor-pointer border border-white/5 h-[400px]">
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f97316]/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                            <div className="relative z-10 space-y-6">
                                <Badge className="bg-[#f97316] text-white border-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest">G8 INVEST</Badge>
                                <h3 className="text-3xl font-black text-white leading-tight">
                                    Seja seu próprio <br />
                                    <span className="text-[#f97316]">Assessor.</span>
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed font-medium">
                                    Abra sua conta investimento e tenha acesso a produtos exclusivos do mercado financeiro global.
                                </p>
                            </div>
                            <div className="absolute bottom-0 right-0 w-[240px] h-[240px] z-0 opacity-40 group-hover:opacity-80 transition-opacity translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                                <Image 
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=investment&backgroundColor=0c0a09" 
                                    alt="Investment" 
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Card>

                        {/* Support Grid */}
                        <div className="space-y-6">
                             <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Canais de Ajuda</h2>
                             <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center p-8 bg-[#fffbeb] rounded-2xl hover:shadow-2xl transition-all border border-neutral-100 group">
                                    <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] bg-white rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                                        <HelpCircle className="h-6 w-6 stroke-[2.5]" />
                                    </div>
                                    <span className="font-black text-[#0c0a09] uppercase text-[10px] tracking-widest">Canal SAC</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-8 bg-[#0c0a09] rounded-2xl hover:shadow-2xl transition-all border border-transparent group">
                                    <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center mb-4 text-white group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20">
                                        <MessageCircle className="h-6 w-6 stroke-[2.5]" />
                                    </div>
                                    <span className="font-black text-white uppercase text-[10px] tracking-widest text-center">Chat G8</span>
                                </button>
                             </div>
                        </div>
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
    <div className="flex flex-col items-center justify-center w-full min-h-[160px] bg-[#fffbeb] rounded-2xl hover:shadow-2xl hover:scale-[1.05] transition-all border border-neutral-200/20 group cursor-pointer p-6">
       <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] bg-white rounded-xl group-hover:scale-110 transition-transform shadow-sm">
          {isBoleto ? (
             <div className="font-mono font-bold text-2xl tracking-tighter scale-y-150 rotate-90">|||</div>
          ) : (
             <Icon className="h-6 w-6 stroke-[2.5]" />
          )}
       </div>
       <span className="text-[11px] font-black text-[#0c0a09] text-center px-1 uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100 group-hover:text-[#f97316] transition-colors">{label}</span>
    </div>
  );
}
