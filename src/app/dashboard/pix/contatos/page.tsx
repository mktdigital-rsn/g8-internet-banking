"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  MoreVertical,
  Contact2,
  Star,
  ArrowRight,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";

const initialContacts = [
  { id: 1, name: "João Abraantes Silva", icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=João", favorite: true, institution: "Itaú Unibanco" },
  { id: 2, name: "Maria Clara Lima", icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", favorite: true, institution: "Bradesco" },
  { id: 3, name: "Pedro Araujo Santos", icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro", favorite: false, institution: "Nubank" },
  { id: 4, name: "Gisele Fonseca", icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gisele", favorite: false, institution: "Santander" },
  { id: 5, name: "Bruno Martins", icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno", favorite: false, institution: "C6 Bank" },
];

export default function PixContatosPage() {
  const [searchTerm, setSearchTerm] = useState("");

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
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Meus Contatos</span>
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
                 Favorites & Contatos
                 <Contact2 className="h-7 w-7 text-[#f97316] stroke-[2]" />
               </h1>
            </div>
          </div>
          <Button className="h-14 bg-[#f97316] hover:bg-orange-600 text-white rounded-3xl px-8 font-black flex items-center gap-3 shadow-xl shadow-[#f97316]/20 transition-all active:scale-95 group">
             <Plus className="h-6 w-6" />
             NOVO CONTATO
          </Button>
        </div>

        {/* Search & Favorites Scroll */}
        <div className="space-y-10">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300 group-focus-within:text-[#f97316] transition-colors" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome ou CPF..." 
                className="h-16 bg-white border-0 rounded-3xl pl-16 pr-8 focus:ring-1 focus:ring-[#f97316]/20 shadow-sm font-bold text-lg"
              />
           </div>

           {/* Favorites Section */}
           <div className="space-y-6">
              <h3 className="text-xl font-black text-[#0c0a09] uppercase tracking-widest px-2">Favoritos</h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                 {initialContacts.filter(c => c.favorite).map(c => (
                    <div key={c.id} className="flex flex-col items-center gap-3 group cursor-pointer group">
                       <div className="relative">
                          <div className="w-24 h-24 rounded-[32px] bg-white border-2 border-transparent group-hover:border-[#f97316] p-1 transition-all shadow-sm">
                             <div className="w-full h-full rounded-[24px] bg-neutral-100 overflow-hidden relative">
                                <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                             </div>
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm ring-white">
                             <Star className="h-3 w-3 fill-white" />
                          </div>
                       </div>
                       <div className="text-center">
                          <p className="text-sm font-black text-[#0c0a09] truncate w-24">{c.name.split(" ")[0]}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase truncate w-24">{c.institution}</p>
                       </div>
                    </div>
                 ))}
                 {/* Add Fav Placeholder */}
                 <div className="flex flex-col items-center gap-3 group cursor-pointer">
                    <div className="w-24 h-24 rounded-[32px] border-2 border-dashed border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:border-[#f97316] group-hover:text-[#f97316] transition-all">
                       <Plus className="h-8 w-8" />
                    </div>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Novo Favorito</span>
                 </div>
              </div>
           </div>

           {/* All Contacts List */}
           <div className="space-y-4">
              <h3 className="text-xl font-black text-[#0c0a09] uppercase tracking-widest px-2">Todos os Contatos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {initialContacts.map(c => (
                    <Card key={c.id} className="p-6 rounded-[40px] border-neutral-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex items-center justify-between group">
                       <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-neutral-50 overflow-hidden group-hover:scale-105 transition-transform">
                             <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="font-black text-lg text-[#0c0a09] leading-tight mb-1">{c.name}</p>
                             <div className="flex items-center gap-2">
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-tight">{c.institution}</p>
                                <div className="w-1 h-1 bg-neutral-200 rounded-full" />
                                <Badge variant="secondary" className="bg-[#f97316]/5 text-[#f97316] text-[8px] font-black tracking-widest uppercase py-0 px-2 border-0">PIX</Badge>
                             </div>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all rounded-full h-12 w-12">
                          <Send className="h-6 w-6" />
                       </Button>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Side Help/Ads */}
      <div className="w-[380px] shrink-0 space-y-8 pt-12">
         <Card className="rounded-[48px] border-0 bg-neutral-900 p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center p-5 group-hover:rotate-12 transition-transform duration-500">
                  <Star className="h-full w-full text-yellow-400 fill-yellow-400" />
               </div>
               <div className="space-y-2">
                  <h3 className="font-black text-2xl">Organize seus Pagamentos</h3>
                  <p className="text-sm font-medium text-white/50 px-4 leading-relaxed">Adicione seus contatos mais frequentes aos favoritos para fazer um Pix em menos de <span className="text-white font-bold">5 segundos</span>.</p>
               </div>
            </div>
         </Card>

         <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm space-y-6">
            <h4 className="font-black text-[#0c0a09] uppercase tracking-widest text-xs">Busca Inteligente</h4>
            <div className="space-y-4">
               <p className="text-xs text-neutral-400 font-medium leading-relaxed">Agora você pode buscar contatos também pelo Banco ou pelo final do CPF cadastrado.</p>
               <button className="text-[10px] font-black text-[#f97316] border-b-2 border-[#f97316]/10 hover:border-[#f97316] transition-colors pb-0.5 uppercase tracking-widest">Saber Mais</button>
            </div>
         </div>
      </div>
    </div>
  );
}
