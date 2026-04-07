"use client";

import React from "react";
import axios from "axios";
import {
   ArrowLeft,
   Key,
   Copy,
   QrCode,
   Trash2,
   Plus,
   Smartphone,
   Mail,
   UserSquare2,
   Hash,
   ChevronRight,
   Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const myKeys = [
   { id: 1, type: "CPF", value: "123.456.789-10", icon: UserSquare2, active: true },
   { id: 2, type: "Celular", value: "(11) 98765-4321", icon: Smartphone, active: true },
   { id: 3, type: "Email", value: "contato@pedro.dev", icon: Mail, active: true },
   { id: 4, type: "Aleatória", value: "8ecf75a1-432a-4ad5-961d-9e6b34017f8a", icon: Hash, active: true },
];

export default function MyPixKeysPage() {
   const [keys, setKeys] = React.useState<any[]>([]);
   const [isLoading, setIsLoading] = React.useState(true);

   React.useEffect(() => {
      const fetchKeys = async () => {
         try {
            const token = localStorage.getItem("token");
            const userToken = localStorage.getItem("userToken");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

            const response = await axios.get(`${apiUrl}/api/banco/pix/listar-chaves`, {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'userToken': userToken || ""
               }
            });

            if (Array.isArray(response.data)) {
               setKeys(response.data);
            }
         } catch (err) {
            console.error("Error fetching pix keys:", err);
         } finally {
            setIsLoading(false);
         }
      };

      fetchKeys();
   }, []);

   const getIconForType = (type: string) => {
      switch (type) {
         case "CPF":
         case "CNPJ":
            return UserSquare2;
         case "CELULAR":
         case "TELEFONE":
            return Smartphone;
         case "EMAIL":
            return Mail;
         case "CHAVE_ALEATORIA":
            return Hash;
         default:
            return Key;
      }
   };

   const getLabelForType = (type: string) => {
      switch (type) {
         case "CPF": return "CPF";
         case "CNPJ": return "CNPJ";
         case "CELULAR":
         case "TELEFONE": return "Celular";
         case "EMAIL": return "E-mail";
         case "CHAVE_ALEATORIA": return "Aleatória";
         default: return type;
      }
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
                        <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-transparent font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest">G8Pay &bull; Pix</Badge>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Minhas Chaves</span>
                     </div>
                     <h1 className="text-3xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
                        Minhas Chaves Pix
                        <Key className="h-7 w-7 text-[#f97316] stroke-[2]" />
                     </h1>
                  </div>
               </div>
               <Button className="h-14 bg-[#f97316] hover:bg-orange-600 text-white rounded-3xl px-8 font-black flex items-center gap-3 shadow-xl shadow-[#f97316]/20 transition-all active:scale-95 group">
                  <Plus className="h-6 w-6" />
                  ADICIONAR NOVA CHAVE
               </Button>
            </div>

            {/* Keys List */}
            <div className="space-y-4">
               {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-white rounded-[40px] border border-dashed border-neutral-200">
                     <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                     <p className="text-neutral-400 font-bold animate-pulse">Buscando suas chaves...</p>
                  </div>
               ) : keys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-white rounded-[40px] border border-dashed border-neutral-200">
                     <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                        <Key className="h-10 w-10" />
                     </div>
                     <div className="text-center">
                        <p className="text-[#0c0a09] font-black text-xl">Nenhuma chave cadastrada</p>
                        <p className="text-neutral-400 font-medium">Cadastre uma chave para começar a receber via Pix.</p>
                     </div>
                     <Button className="bg-[#f97316] text-white rounded-2xl px-6 font-bold mt-4">CADASTRAR MINHA PRIMEIRA CHAVE</Button>
                  </div>
               ) : (
                  keys.map((key, index) => {
                     const Icon = getIconForType(key.tipo);
                     return (
                        <Card key={index} className="bg-white border border-neutral-100 rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all group flex items-center justify-between relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="flex items-center gap-8 z-10">
                              <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-[#f97316] group-hover:scale-110 transition-transform shadow-sm group-hover:bg-white group-hover:shadow-lg">
                                 <Icon className="h-7 w-7 stroke-[1.5]" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">{getLabelForType(key.tipo)}</p>
                                 <p className="text-2xl font-black text-[#0c0a09] font-mono tracking-tighter">{key.chave}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-4 z-10">
                              <button className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all shadow-sm active:scale-90 group-hover:scale-105">
                                 <QrCode className="h-5 w-5" />
                              </button>
                              <button className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all shadow-sm active:scale-90 group-hover:scale-105">
                                 <Copy className="h-5 w-5" />
                              </button>
                              <button className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 opacity-0 group-hover:opacity-100">
                                 <Trash2 className="h-5 w-5" />
                              </button>
                              <ChevronRight className="h-6 w-6 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                           </div>
                        </Card>
                     )
                  })
               )}
            </div>
         </div>

         {/* Side Column */}
         <div className="w-[380px] shrink-0 space-y-8">
            <Card className="rounded-[48px] border-0 shadow-2xl bg-[#0c0a09] p-10 text-white relative overflow-hidden group h-[300px] cursor-pointer">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#f97316]/20 rounded-full -mr-16 -mb-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
               <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[#f97316]">
                     <Share2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black leading-tight">Compartilhe sua chave e receba mais rápido</h3>
                  <button className="text-[10px] font-black border-b-2 border-[#f97316] text-[#f97316] uppercase tracking-widest pb-0.5">COMPARTILHAR AGORA</button>
               </div>
            </Card>

            <div className="bg-[#f5f5f5] rounded-[40px] p-8 space-y-6">
               <h4 className="font-black text-[#0c0a09] uppercase tracking-widest text-xs">Portabilidade em Aberto</h4>
               <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm space-y-3">
                  <p className="text-sm font-bold text-[#0c0a09]">Seu CPF no Banco Nu Pagamentos</p>
                  <div className="flex items-center justify-between">
                     <Badge className="bg-orange-50 text-[#f97316] border-0 font-black text-[9px] uppercase">Pendente</Badge>
                     <button className="text-[10px] font-black text-[#f97316] underline">REVISAR</button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
