"use client";

import React from "react";
import axios from "axios";
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

export default function PixExtratoPage() {
   const [items, setItems] = React.useState<any[]>([]);
   const [isLoading, setIsLoading] = React.useState(true);
   const [filter, setFilter] = React.useState("all");
   const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);

   React.useEffect(() => {
      const fetchPixExtrato = async () => {
         try {
            const token = localStorage.getItem("token");
            const userToken = localStorage.getItem("userToken");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

            const response = await axios.get(`${apiUrl}/api/banco/extrato/buscar`, {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'userToken': userToken || ""
               }
            });

            if (response.data && Array.isArray(response.data.data)) {
               const allItems = response.data.data;
               const pixOnly = allItems.filter((item: any) =>
                  item.metodo === "TRANSFERENCIA_PIX" ||
                  item.metodoFormatado?.toUpperCase().includes("PIX")
               );
               setItems(pixOnly);
            }
         } catch (err) {
            console.error("Error fetching pix extrato:", err);
         } finally {
            setIsLoading(false);
         }
      };

      fetchPixExtrato();
   }, []);

   const filteredItems = items.filter(item => {
      if (filter === "in") return item.tipo === "CREDITO";
      if (filter === "out") return item.tipo === "DEBITO";
      return true;
   });

   const totals = filteredItems.reduce((acc, item) => {
      if (item.tipo === "CREDITO") acc.in += item.valor;
      else acc.out += item.valor;
      return acc;
   }, { in: 0, out: 0 });

   const formatCurrency = (val: number) => {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
   };

   return (
      <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar relative">
         {/* Receipt Modal Overlay */}
         {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <Card className="w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button
                     onClick={() => setSelectedTransaction(null)}
                     className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors z-10"
                  >
                     <ArrowLeft className="h-5 w-5 rotate-180" />
                  </button>

                  <div className="p-10 space-y-8">
                     <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-[#f97316]/10 rounded-3xl flex items-center justify-center text-[#f97316] mx-auto">
                           <Diamond className="h-8 w-8" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-[#0c0a09]">Comprovante PIX</h2>
                           <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mt-1">Transação Efetivada</p>
                        </div>
                     </div>

                     <div className="space-y-6 pt-4 border-t border-dashed border-neutral-100">
                        <div className="text-center">
                           <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">Valor</p>
                           <p className={`text-4xl font-black ${selectedTransaction.tipo === 'CREDITO' ? 'text-green-600' : 'text-[#0c0a09]'} font-mono tracking-tighter`}>
                              {selectedTransaction.tipo === 'CREDITO' ? '+' : '-'} {selectedTransaction.valorFormatado}
                           </p>
                        </div>

                        <div className="space-y-4 bg-neutral-50 rounded-3xl p-6">
                           <div>
                              <p className="text-[8px] text-neutral-400 font-black uppercase">Pagador</p>
                              <p className="text-sm font-black text-[#0c0a09]">{selectedTransaction.pagadorNome || "N/A"}</p>
                              <p className="text-[10px] text-neutral-400 font-mono font-bold">{selectedTransaction.pagadorTaxNumber?.present ? selectedTransaction.pagadorTaxNumber.value : (selectedTransaction.pagadorTaxNumber || "---")}</p>
                           </div>

                           <div>
                              <p className="text-[8px] text-neutral-400 font-black uppercase">Recebedor</p>
                              <p className="text-sm font-black text-[#0c0a09]">{selectedTransaction.RecebinteNome || "N/A"}</p>
                              <p className="text-[10px] text-neutral-400 font-mono font-bold">{selectedTransaction.RecebinteTaxNumber?.present ? selectedTransaction.RecebinteTaxNumber.value : (selectedTransaction.RecebinteTaxNumber || "---")}</p>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[8px] text-neutral-400 font-black uppercase">Data e Hora</p>
                                 <p className="text-xs font-bold text-[#0c0a09]">{selectedTransaction.dataDaTransacaoFormatada}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] text-neutral-400 font-black uppercase">Método</p>
                                 <p className="text-xs font-bold text-[#f97316]">{selectedTransaction.metodoFormatado}</p>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2 opacity-50 px-2">
                           <p className="text-[8px] text-neutral-400 font-black uppercase">Código de Autenticação</p>
                           <p className="text-[10px] font-mono font-black break-all leading-tight">{selectedTransaction.codigoDeIdentificacao}</p>
                        </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <Button className="flex-1 h-12 bg-[#f97316] text-white rounded-2xl font-bold gap-2">
                           <Download className="h-4 w-4" /> Exportar
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="flex-1 h-12 border-neutral-100 rounded-2xl font-bold">
                           Fechar
                        </Button>
                     </div>
                  </div>
               </Card>
            </div>
         )}

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
                     <p className="text-3xl font-black text-white font-mono tracking-tight">{formatCurrency(totals.in)}</p>
                  </div>
               </Card>
               <Card className="bg-[#0c0a09] border-0 rounded-[40px] p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <div className="w-16 h-16 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316]">
                     <ArrowUpRight className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">&mdash; Saídas</p>
                     <p className="text-3xl font-black text-white font-mono tracking-tight">{formatCurrency(totals.out)}</p>
                  </div>
               </Card>
            </div>

            {/* Filter & List */}
            <div className="bg-white rounded-[56px] p-10 border border-neutral-100 shadow-sm space-y-8">
               <div className="flex items-center justify-between gap-6">
                  <Tabs defaultValue="all" onValueChange={setFilter} className="w-fit">
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
                     {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                           <div className="w-10 h-10 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mb-4" />
                           <p className="text-xs font-black uppercase tracking-tighter">Carregando PIX...</p>
                        </div>
                     ) : filteredItems.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                           <Diamond className="h-12 w-12 mx-auto mb-4" />
                           <p className="font-black text-sm uppercase">Nenhuma transação PIX encontrada</p>
                        </div>
                     ) : (
                        filteredItems.map((t, idx) => (
                           <div
                              key={idx}
                              onClick={() => setSelectedTransaction(t)}
                              className="grid grid-cols-4 items-center px-8 py-6 bg-neutral-50/50 hover:bg-white rounded-[32px] border border-transparent hover:border-neutral-100 hover:shadow-xl transition-all group cursor-pointer"
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.tipo === 'CREDITO' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} group-hover:scale-110 transition-transform`}>
                                    {t.tipo === 'CREDITO' ? <PlusCircle className="h-6 w-6" /> : <MinusCircle className="h-6 w-6" />}
                                 </div>
                                 <div>
                                    <p className="font-black text-sm text-[#0c0a09] leading-none mb-1 truncate max-w-[150px]">
                                       {t.tipo === 'CREDITO' ? t.pagadorNome : t.RecebinteNome}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{t.metodoFormatado}</p>
                                 </div>
                              </div>
                              <p className={`text-center font-black text-lg font-mono ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-[#0c0a09]'}`}>
                                 {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                              </p>
                              <p className="text-center text-xs font-bold text-neutral-400">{t.dataDaTransacaoFormatada}</p>
                              <div className="flex justify-end">
                                 <Button variant="ghost" size="icon" className="rounded-full text-neutral-300 group-hover:text-[#f97316]">
                                    <MoreVertical className="h-5 w-5" />
                                 </Button>
                              </div>
                           </div>
                        ))
                     )}
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
