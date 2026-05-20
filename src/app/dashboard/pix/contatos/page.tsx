"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  Contact2,
  Star,
  Send,
  Trash2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PixContatosPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/banco/pix/contatos");
      if (res.data) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      toast.error("Erro ao carregar contatos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDeleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita redirecionar para transferência
    if (!confirm("Tem certeza que deseja remover este contato?")) return;

    try {
      await api.delete("/api/banco/pix/remover-contato", {
        data: { chaveId: id }
      });
      toast.success("Contato removido com sucesso!");
      fetchContacts();
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      const msg = err.response?.data?.message || err.message || "Erro ao remover contato.";
      toast.error(msg);
    }
  };

  const handleSendPix = (c: any) => {
    router.push(`/dashboard/pix/pagar?type=key&key=${encodeURIComponent(c.chave)}&name=${encodeURIComponent(c.nome)}&bank=${encodeURIComponent(c.instituicao || "")}`);
  };

  const filteredContacts = contacts.filter(c => 
    (c.nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.chave?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.instituicao?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const favorites = contacts.slice(0, 4);

  return (
    <div className="bg-[#f8f9fa] rounded-[32px] p-6 md:p-10 border border-neutral-200/60 space-y-10 relative">
      {/* Background Decorativo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 relative z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pix">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-neutral-200/50 h-12 w-12 shrink-0 border border-neutral-200/80 bg-white shadow-sm transition-all">
               <ArrowLeft className="h-6 w-6 text-[#f97316]" />
            </Button>
          </Link>
          <div>
             <div className="flex items-center gap-2 mb-1">
               <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-transparent font-black px-3 py-0.5 rounded-md text-[10px] uppercase tracking-widest">G8Pay &bull; Pix</Badge>
               <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Meus Contatos</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#f97316] flex items-center gap-3">
               Favoritos & Contatos
               <Contact2 className="h-8 w-8 text-[#f97316] stroke-[2.5]" />
             </h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Coluna Principal */}
        <main className="lg:col-span-8 space-y-10">
          {/* Campo de Busca Inteligente */}
          <div className="relative group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-[#f97316] transition-colors" />
             <Input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Pesquisar por nome, chave ou banco..." 
               className="h-16 bg-white border border-neutral-200/80 rounded-2xl pl-16 pr-8 focus:ring-4 focus:ring-[#f97316]/10 focus:border-[#f97316] transition-all shadow-sm font-bold text-lg text-[#0c0a09]"
             />
          </div>

          {/* Seção de Favoritos */}
          {favorites.length > 0 && (
            <div className="space-y-6">
               <h3 className="text-xs font-black text-[#0c0a09]/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                 <Star size={12} className="text-yellow-400 fill-yellow-400" />
                 Favoritos Frequentes
               </h3>
               <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                  {favorites.map(c => (
                     <div 
                       key={c.id} 
                       onClick={() => handleSendPix(c)}
                       className="flex flex-col items-center gap-3 group cursor-pointer shrink-0"
                     >
                        <div className="relative">
                           <div className="w-24 h-24 rounded-[28px] bg-white border border-neutral-200/50 group-hover:border-[#f97316] group-hover:scale-105 p-1.5 transition-all shadow-md group-hover:shadow-orange-500/10">
                              <div className="w-full h-full rounded-[20px] bg-orange-500/5 flex items-center justify-center font-black text-2xl text-[#f97316] overflow-hidden relative">
                                 {c.nome ? c.nome.charAt(0).toUpperCase() : "?"}
                              </div>
                           </div>
                           <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-md ring-white">
                              <Star className="h-2.5 w-2.5 fill-white" />
                           </div>
                        </div>
                        <div className="text-center w-24">
                           <p className="text-xs font-black text-[#0c0a09] truncate group-hover:text-[#f97316] transition-colors">{c.nome}</p>
                           <p className="text-[9px] text-neutral-400 font-bold uppercase truncate">{c.instituicao || "PIX"}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* Lista Geral de Contatos */}
          <div className="space-y-6">
             <h3 className="text-xs font-black text-[#0c0a09]/50 uppercase tracking-[0.2em] px-2">Todos os Contatos</h3>
             
             {isLoading ? (
               <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/50 shadow-sm">
                 <p className="text-neutral-400 font-black uppercase tracking-widest text-xs animate-pulse">Carregando contatos...</p>
               </div>
             ) : filteredContacts.length === 0 ? (
               <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200/50 shadow-sm space-y-3">
                 <p className="text-neutral-400 font-black uppercase tracking-widest text-sm">Nenhum contato encontrado</p>
                 <p className="text-xs text-neutral-400 font-medium leading-relaxed">Você pode salvar contatos ativando a caixinha "Salvar contato" ao realizar um Pix.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContacts.map(c => (
                     <div 
                       key={c.id} 
                       onClick={() => handleSendPix(c)}
                       className="p-5 bg-white rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-orange-200 hover:scale-[1.01] transition-all cursor-pointer group flex items-center justify-between gap-4"
                     >
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="w-12 h-12 rounded-xl bg-orange-500/5 flex items-center justify-center font-black text-xl text-[#f97316] shrink-0 border border-orange-100/50 group-hover:scale-105 transition-transform">
                              {c.nome ? c.nome.charAt(0).toUpperCase() : "?"}
                           </div>
                           <div className="text-left min-w-0">
                              <p className="font-black text-base text-[#0c0a09] leading-tight mb-1 truncate group-hover:text-[#f97316] transition-colors">{c.nome}</p>
                              <div className="flex items-center gap-2">
                                 <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight truncate max-w-[140px]">{c.instituicao || "Instituição não informada"}</p>
                                 <div className="w-1 h-1 bg-neutral-200 rounded-full shrink-0" />
                                 <Badge variant="secondary" className="bg-[#f97316]/5 text-[#f97316] text-[8px] font-black tracking-widest uppercase py-0 px-2 border-0 shrink-0">PIX</Badge>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={(e) => handleDeleteContact(c.id, e)}
                             className="text-neutral-300 hover:text-rose-500 rounded-xl h-10 w-10 hover:bg-rose-50 transition-all shrink-0"
                           >
                              <Trash2 className="h-5 w-5" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-neutral-400 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all rounded-xl h-10 w-10 shrink-0"
                           >
                              <Send className="h-5 w-5" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
             )}
          </div>
        </main>

        {/* Coluna Lateral */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="rounded-3xl border-0 bg-neutral-900 p-8 text-white relative overflow-hidden group shadow-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-4 group-hover:rotate-12 transition-transform duration-500">
                    <Star className="h-full w-full text-yellow-400 fill-yellow-400" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="font-black text-xl tracking-tight">Organize seus Pagamentos</h3>
                    <p className="text-xs font-bold text-white/50 px-2 leading-relaxed">Adicione seus contatos mais frequentes aos favoritos para fazer um Pix em menos de <span className="text-white font-black">5 segundos</span>.</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-sm space-y-6">
              <h4 className="font-black text-[#0c0a09]/50 uppercase tracking-widest text-[10px]">Busca Inteligente</h4>
              <div className="space-y-4">
                 <p className="text-xs text-neutral-400 font-bold leading-relaxed">Agora você pode buscar contatos também pelo Banco ou pelo final do CPF cadastrado.</p>
                 <button className="text-[10px] font-black text-[#f97316] border-b-2 border-[#f97316]/10 hover:border-[#f97316] transition-colors pb-0.5 uppercase tracking-widest">Saber Mais</button>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
