"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Smartphone, 
  Plus, 
  ChevronRight,
  Settings2,
  AlertCircle,
  Copy,
  Info,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function CartoesPage() {
  const [showNumbers, setShowNumbers] = useState(false);
  const [cards, setCards] = useState([
    { id: "1", type: "virtual", label: "Cartão Virtual", number: "4532 12** **** 8890", expiry: "08/29", cvv: "441", active: true, limit: 1500.00, spend: 450.00 },
    { id: "2", type: "physical", label: "G8 Platinum Physical", number: "5502 91** **** 1122", expiry: "12/30", cvv: "---", active: true, limit: 12000.00, spend: 2840.15 },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1400px] mx-auto min-h-screen bg-[#f8f9fa] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-4">
          <Badge variant="secondary" className="bg-orange-600/10 text-orange-600 border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">Gestão de Cartões</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">
            Meus <span className="text-orange-600">CARTÕES</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-bold max-w-2xl">
            Gerencie seus cartões físicos e virtuais com segurança absoluta.
          </p>
        </div>
        <Button 
          className="h-14 px-8 bg-[#0c0a09] hover:bg-neutral-800 text-white rounded-sm font-black uppercase tracking-widest text-xs transition-all shadow-xl group"
        >
          <Plus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform text-orange-600" />
          Gerar Cartão Virtual
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Card Display Area */}
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card) => (
              <div key={card.id} className="space-y-6">
                 {/* Card Visual */}
                 <div className={`aspect-[1.586/1] w-full rounded-2xl p-8 relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer shadow-2xl ${
                   card.type === "virtual" 
                   ? "bg-gradient-to-br from-neutral-900 to-black text-white" 
                   : "bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-orange-600/30"
                 }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md">
                             <CreditCard className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{card.label}</span>
                       </div>

                       <div className="space-y-4">
                          <button 
                            onClick={() => setShowNumbers(!showNumbers)}
                            className="flex items-center gap-3 group"
                          >
                             <span className="text-xl md:text-2xl font-black font-mono tracking-[0.15em] lg:tracking-[0.2em]">
                               {showNumbers ? card.number : card.number.replace(/\d/g, "*").replace(/\s/g, " ")}
                             </span>
                             {showNumbers ? <EyeOff className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" /> : <Eye className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />}
                          </button>
                          
                          <div className="flex gap-8">
                             <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Valid Thru</p>
                                <p className="text-sm font-black font-mono">{card.expiry}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">CVV</p>
                                <p className="text-sm font-black font-mono">{showNumbers ? card.cvv : "***"}</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex justify-between items-end">
                          <span className="text-lg font-black tracking-tighter">G8 Bank</span>
                          <div className="flex gap-1.5">
                             <div className="w-8 h-8 rounded-full bg-red-500/80 -mr-4" />
                             <div className="w-8 h-8 rounded-full bg-yellow-500/80" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Card Quick Actions */}
                 <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 border-neutral-200 text-neutral-400 hover:text-orange-600 hover:border-orange-200 bg-white font-black text-[10px] uppercase tracking-widest rounded-sm"
                      onClick={() => copyToClipboard(card.number)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar Dados
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 bg-white font-black text-[10px] uppercase tracking-widest rounded-sm"
                    >
                      <Lock className="h-4 w-4 mr-2" /> Bloquear
                    </Button>
                 </div>
              </div>
            ))}
          </div>

          <Separator className="bg-neutral-100" />

          {/* Card Management List */}
          <div className="space-y-6">
             <h2 className="text-xl font-black text-[#0c0a09] uppercase tracking-tight">Ajustes Rápidos</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Smartphone, title: "Apple Pay / Google Pay", desc: "Adicione seu cartão à carteira digital", action: "Adicionar" },
                  { icon: ShieldCheck, title: "Limite para Compras Online", desc: "Defina um teto para evitar surpresas", action: "Configurar" },
                  { icon: Lock, title: "Cadeado Digital", desc: "Bloqueio temporário para sua segurança", action: true },
                  { icon: Settings2, title: "Melhor dia de compra", desc: "Visualize o ciclo da sua fatura", action: "Ver data" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white border border-neutral-100 rounded-sm flex items-center justify-between group hover:border-orange-100 transition-all">
                     <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-orange-50 rounded-sm flex items-center justify-center text-orange-600">
                           <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-[#0c0a09] uppercase tracking-tight">{item.title}</p>
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                        </div>
                     </div>
                     {typeof item.action === "boolean" ? (
                       <Switch className="data-[state=checked]:bg-orange-600" />
                     ) : (
                       <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">{item.action}</button>
                     )}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Help/Info */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-10 bg-white border border-neutral-100 rounded-sm shadow-xl shadow-black/[0.02] space-y-8">
              <div className="space-y-4">
                 <div className="w-12 h-12 bg-green-50 rounded-sm flex items-center justify-center text-green-500">
                    <ShieldCheck className="h-6 w-6" />
                 </div>
                 <h3 className="text-2xl font-black text-[#0c0a09] uppercase tracking-tight leading-tight">Segurança Ativada</h3>
                 <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                   Seus cartões G8 contam com proteção contra clonagem e seguros integrados para sua tranquilidade total.
                 </p>
              </div>

              <div className="space-y-4 pt-8 border-t border-neutral-50">
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-400">
                    <span>Limite Total</span>
                    <span className="text-[#0c0a09]">R$ 13.500,00</span>
                 </div>
                 <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 w-[24%]" />
                 </div>
                 <p className="text-[10px] font-bold text-neutral-400 text-center uppercase tracking-[0.2em]">Você utilizou 24% do seu limite</p>
              </div>

              <Button className="w-full h-14 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-sm font-black text-[10px] uppercase tracking-widest border border-orange-100 transition-all shadow-sm">
                 Ver minha fatura <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
           </Card>

           <div className="p-8 bg-neutral-900 rounded-sm text-white relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 space-y-4">
                 <Badge className="bg-[#f97316] text-white border-0 px-3 py-1 font-black text-[9px] uppercase tracking-widest leading-none">Indicação</Badge>
                 <h2 className="text-xl font-black uppercase leading-tight">Ganhe mais limite indicando amigos.</h2>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Saiba como em nosso regulamento.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
