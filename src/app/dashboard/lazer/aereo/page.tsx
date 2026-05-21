"use client";

import React, { useState } from "react";
import { 
  Plane, 
  QrCode, 
  Sparkles, 
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AereoPage() {
  const [activeTab, setActiveTab] = useState<"search" | "lounge" | "miles" | "concierge">("search");
  const [g8Points, setG8Points] = useState(142500);
  const [showQrCode, setShowQrCode] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Concierge Form
  const [conciergeDest, setConciergeDest] = useState("");
  const [conciergeDate, setConciergeDate] = useState("");
  const [conciergeClass, setConciergeClass] = useState("business");
  const [isSubmittingConcierge, setIsSubmittingConcierge] = useState(false);

  const handleTransferPoints = () => {
    const pointsNum = parseInt(transferAmount);
    if (!selectedPartner) {
      toast.error("Por favor, selecione um programa de milhas parceiro.");
      return;
    }
    if (isNaN(pointsNum) || pointsNum <= 0) {
      toast.error("Insira uma quantidade de pontos válida.");
      return;
    }
    if (pointsNum > g8Points) {
      toast.error("Saldo de pontos G8 insuficiente.");
      return;
    }

    setG8Points(prev => prev - pointsNum);
    toast.success(`Transferência de ${pointsNum.toLocaleString("pt-BR")} pontos realizada com sucesso para o programa ${selectedPartner}!`);
    setTransferAmount("");
    setSelectedPartner(null);
  };

  const handleSubmitConcierge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeDest || !conciergeDate) {
      toast.error("Por favor, preencha o destino e a data pretendida.");
      return;
    }
    setIsSubmittingConcierge(true);
    setTimeout(() => {
      setIsSubmittingConcierge(false);
      toast.success("Solicitação enviada ao Concierge Elite G8! Entraremos em contato via WhatsApp/E-mail em até 1 hora.");
      setConciergeDest("");
      setConciergeDate("");
    }, 1500);
  };

  const airlinePartners = [
    { id: "latam", name: "LATAM Pass", bonus: "100%", logo: "✈️", ratio: "1:1" },
    { id: "smiles", name: "Smiles (GOL)", bonus: "80%", logo: "🧡", ratio: "1:1" },
    { id: "azul", name: "Azul Fidelidade", bonus: "110%", logo: "💙", ratio: "1:1" },
    { id: "tap", name: "TAP Miles&Go", bonus: "0%", logo: "💚", ratio: "1:1" }
  ];

  return (
    <div className="bg-[#f8f9fa] rounded-[4px] p-6 md:p-10 border border-neutral-200/60 space-y-10 relative">
      {/* Background Decorativo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#ff7711]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-[#ff7711]/10 text-[#ff7711] border-transparent font-black px-3 py-1 rounded-[2px] text-xs uppercase tracking-widest">G8 Elite Benefits</Badge>
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-none">Lazer</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#ff7711] flex items-center gap-3">
            Benefícios Aéreos & VIP Travel
            <Plane className="h-10 w-10 text-[#ff7711] stroke-[2.5]" />
          </h1>
        </div>

        {/* Points Display */}
        <div className="flex items-center gap-4 bg-[#ff7711]/10 border border-[#ff7711]/20 p-5 rounded-[4px] shrink-0">
          <div className="w-12 h-12 rounded-[2px] bg-[#ff7711] flex items-center justify-center font-black text-white shrink-0">
             <Sparkles className="h-6 w-6" />
          </div>
          <div>
             <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Pontos G8 Acumulados</span>
             <p className="text-2xl font-black text-[#ff7711] tracking-tight">{g8Points.toLocaleString("pt-BR")} pts</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-8">
        <button 
          onClick={() => setActiveTab("search")}
          className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === "search" ? "border-[#ff7711] text-[#ff7711]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
        >
          Passagens Aéreas
        </button>
        <button 
          onClick={() => setActiveTab("lounge")}
          className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === "lounge" ? "border-[#ff7711] text-[#ff7711]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
        >
          Salas VIP & Lounges
        </button>
        <button 
          onClick={() => setActiveTab("miles")}
          className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === "miles" ? "border-[#ff7711] text-[#ff7711]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
        >
          Transferir Milhas
        </button>
        <button 
          onClick={() => setActiveTab("concierge")}
          className={`pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === "concierge" ? "border-[#ff7711] text-[#ff7711]" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
        >
          Concierge Elite
        </button>
      </div>

      {/* Main Container - REMOVED SIDEBAR AS REQUESTED, SPANNING 100% WIDTH FOR MAXIMUM BEAUTY */}
      <div className="space-y-10 relative z-10 w-full">
        {/* TAB 0: PASSAGENS AÉREAS (IFRAME PORTAL DA AGÊNCIA / AIRSEARCH) */}
        {activeTab === "search" && (
          <div className="w-full space-y-8">
            <div className="relative w-full h-[85vh] min-h-[600px] bg-white border border-neutral-200/80 rounded-[8px] overflow-hidden shadow-sm">
              {isIframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-4">
                  <div className="w-12 h-12 border-4 border-[#ff7711] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#ff7711] animate-pulse">
                    Conectando ao Portal de Passagens...
                  </span>
                </div>
              )}
              <iframe
                src="https://airsearch-iframe.portaldaagencia.com.br/external/rsnbrasil"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                onLoad={() => setIsIframeLoading(false)}
                title="Busca de Passagens Aéreas"
                allow="geolocation; microphone; camera"
              />
            </div>

            {/* Notícias sobre Turismo Section */}
            <div className="space-y-6 pt-8 border-t border-neutral-200 w-full">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                  Notícias sobre Turismo
                </h2>
                <p className="text-xs text-neutral-400 font-black uppercase tracking-widest">
                  PoweredBy G1 - Turismo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                
                {/* News Card 1 */}
                <div className="bg-white border border-neutral-200 rounded-[4px] overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer w-full">
                  <div className="h-44 bg-neutral-100 relative overflow-hidden flex items-center justify-center text-5xl">
                    🏝️
                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-all duration-300" />
                  </div>
                  <div className="p-6 space-y-3">
                    <Badge className="bg-[#ff7711]/10 text-[#ff7711] border-transparent font-black px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest">Especial</Badge>
                    <h3 className="font-black text-[#0c0a09] text-base leading-snug group-hover:text-[#ff7711] transition-colors">
                      As 10 praias mais bonitas e isoladas das Maldivas para visitar em 2026
                    </h3>
                    <p className="text-sm text-neutral-500 font-medium line-clamp-2 leading-relaxed">
                      Confira o roteiro de luxo exclusivo preparado pela equipe G8 Elite Travel com suporte do Concierge Premium.
                    </p>
                    <div className="flex items-center gap-1 text-xs font-black text-[#ff7711] uppercase tracking-widest pt-2">
                      Ler Artigo <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* News Card 2 */}
                <div className="bg-white border border-neutral-200 rounded-[4px] overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer w-full">
                  <div className="h-44 bg-neutral-100 relative overflow-hidden flex items-center justify-center text-5xl">
                    🛫
                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-all duration-300" />
                  </div>
                  <div className="p-6 space-y-3">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-transparent font-black px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest">G8 Lounge</Badge>
                    <h3 className="font-black text-[#0c0a09] text-base leading-snug group-hover:text-[#ff7711] transition-colors">
                      Novos Lounges VIP do G8 Bank inauguram em Paris (CDG) e Frankfurt
                    </h3>
                    <p className="text-sm text-neutral-500 font-medium line-clamp-2 leading-relaxed">
                      Clientes com o cartão digital G8 Lounge Premium terão entrada prioritária e gratuita nas novas salas parceiras.
                    </p>
                    <div className="flex items-center gap-1 text-xs font-black text-[#ff7711] uppercase tracking-widest pt-2">
                      Ler Artigo <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* News Card 3 */}
                <div className="bg-white border border-neutral-200 rounded-[4px] overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer w-full">
                  <div className="h-44 bg-neutral-100 relative overflow-hidden flex items-center justify-center text-5xl">
                    🇪🇺
                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-all duration-300" />
                  </div>
                  <div className="p-6 space-y-3">
                    <Badge className="bg-neutral-100 text-neutral-500 border-transparent font-black px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest">Turismo</Badge>
                    <h3 className="font-black text-[#0c0a09] text-base leading-snug group-hover:text-[#ff7711] transition-colors">
                      Eurotrip 2026: Dicas de planejamento financeiro para sua viagem de férias
                    </h3>
                    <p className="text-sm text-neutral-500 font-medium line-clamp-2 leading-relaxed">
                      Como utilizar o cashback de cartões e o câmbio global do G8 Bank para economizar em hospedagens e passagens.
                    </p>
                    <div className="flex items-center gap-1 text-xs font-black text-[#ff7711] uppercase tracking-widest pt-2">
                      Ler Artigo <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 1: SALAS VIP */}
        {activeTab === "lounge" && (
          <div className="space-y-8 w-full">
            {/* Lounge Card */}
            <div className="relative rounded-[4px] overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-8 text-white border border-neutral-800 shadow-2xl group w-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7711]/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 w-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#ffaa00]/20 text-[#ffaa00] border-transparent font-black px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest">G8 Priority Pass</Badge>
                    <Badge className="bg-white/10 text-white border-transparent font-black px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest">Acesso Ilimitado</Badge>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">G8 Lounge Premium Card</h2>
                    <p className="text-sm text-neutral-300 font-medium">Apresente este cartão digital no balcão da Sala VIP para liberar sua entrada.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Categoria</span>
                      <p className="text-base font-black text-[#ffaa00]">Platinum Elite</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Convidados</span>
                      <p className="text-base font-black text-white">4 Gratuitos / Ano</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Status</span>
                      <p className="text-base font-black text-emerald-400">Ativo</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 shrink-0 self-center md:self-auto bg-white/5 border border-white/10 p-6 rounded-[4px] text-center w-full md:w-auto">
                  {showQrCode ? (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="bg-white p-3 rounded-[2px] shadow-lg border border-neutral-100">
                        <QrCode className="h-32 w-32 text-neutral-900" />
                      </div>
                      <span className="text-[10px] text-[#ff7711] font-black uppercase tracking-widest">Expira em 04:59</span>
                      <Button 
                        onClick={() => setShowQrCode(false)}
                        variant="ghost" 
                        className="text-xs text-white/50 hover:text-white"
                      >
                        Fechar Código
                      </Button>
                    </div>
                  ) : (
                    <>
                      <QrCode className="h-16 w-16 text-[#ffaa00]" />
                      <Button 
                        onClick={() => setShowQrCode(true)}
                        className="bg-[#ff7711] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-[2px]"
                      >
                        Gerar Passe Digital
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* VIP Lounges Information */}
            <div className="space-y-4 w-full">
              <h3 className="text-xs font-black text-[#0c0a09]/50 uppercase tracking-[0.2em] px-2">Salas VIP Parceiras em Destaque</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="bg-white p-6 rounded-[4px] border border-neutral-200/60 shadow-sm space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-neutral-100 text-neutral-600 border-0 font-bold py-0.5 px-2.5 text-[10px] uppercase tracking-wider">GRU Airport (T3)</Badge>
                    <span className="text-xs text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} /> Aberto 24h
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-[#0c0a09] text-lg">G8 Lounge Elite Internacional</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">Lounge exclusivo para clientes G8 Elite. Buffet premium assinado, chuveiros privativos e carta de vinhos especial.</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[4px] border border-neutral-200/60 shadow-sm space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-neutral-100 text-neutral-600 border-0 font-bold py-0.5 px-2.5 text-[10px] uppercase tracking-wider">GIG Airport (T2)</Badge>
                    <span className="text-xs text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} /> Aberto 24h
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-[#0c0a09] text-lg">Plaza Premium Lounge</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">Acesso gratuito e ilimitado com o G8 Premium Card. Área de descanso completa e Business Center privativo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSFERIR MILHAS */}
        {activeTab === "miles" && (
          <div className="space-y-8 w-full">
            <div className="bg-white p-8 rounded-[4px] border border-neutral-200/60 shadow-sm space-y-6 w-full">
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0 font-black text-[10px] uppercase tracking-widest px-3 py-1">Campanha Ativa</Badge>
                <span className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Bônus Exclusivo de até 110%</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-2xl text-[#0c0a09] tracking-tight">Transfira seus pontos G8 para Companhias Aéreas</h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-medium">Aproveite as taxas de conversão de 1:1 e receba milhas em dobro hoje mesmo na companhia parceira escolhida.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {airlinePartners.map((partner) => (
                  <div 
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner.name)}
                    className={`p-5 rounded-[2px] border cursor-pointer text-center space-y-3 transition-all ${selectedPartner === partner.name ? "border-[#ff7711] bg-[#ff7711]/5 shadow-md" : "border-neutral-200 bg-white hover:border-[#ff7711]/30"}`}
                  >
                    <div className="text-3xl">{partner.logo}</div>
                    <div>
                      <p className="font-black text-sm text-[#0c0a09]">{partner.name}</p>
                      <p className="text-[11px] text-neutral-400 font-bold uppercase">{partner.ratio}</p>
                    </div>
                    {partner.bonus !== "0%" && (
                      <Badge className="bg-[#ffaa00] text-black font-black text-[9px] py-0.5 px-1.5 border-transparent rounded-[2px]">
                        +{partner.bonus} Bônus
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Pontos G8 a transferir</label>
                  <Input 
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Mínimo 5.000 pts"
                    className="h-12 rounded-[2px] focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 font-bold text-sm bg-white"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Button 
                    onClick={handleTransferPoints}
                    className="h-12 bg-[#ff7711] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-[2px] transition-all shadow-md shadow-orange-500/10"
                  >
                    Transferir Pontos Agora
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONCIERGE ELITE */}
        {activeTab === "concierge" && (
          <div className="space-y-8 w-full">
            <div className="bg-white p-8 rounded-[4px] border border-neutral-200/60 shadow-sm space-y-6 w-full">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#ff7711]/10 text-[#ff7711] border-0 font-black text-[10px] uppercase tracking-widest px-3 py-1">Elite Concierge</Badge>
                <span className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Suporte 24h & Upgrade de Passagem</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-2xl text-[#0c0a09] tracking-tight">Reserve passagens e solicite upgrades de assento</h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-medium">Deixe as burocracias de upgrades de cabines (Classe Executiva/Primeira Classe) com o nosso time especializado de Concierges G8.</p>
              </div>

              <form onSubmit={handleSubmitConcierge} className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Destino do Voo</label>
                    <Input 
                      value={conciergeDest}
                      onChange={(e) => setConciergeDest(e.target.value)}
                      placeholder="Ex: Paris (CDG), Miami (MIA)"
                      className="h-12 rounded-[2px] focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 font-bold text-sm bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Data Pretendida</label>
                    <Input 
                      type="date"
                      value={conciergeDate}
                      onChange={(e) => setConciergeDate(e.target.value)}
                      className="h-12 rounded-[2px] focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 font-bold text-sm text-neutral-600 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Cabine Solicitada</label>
                    <select 
                      value={conciergeClass}
                      onChange={(e) => setConciergeClass(e.target.value)}
                      className="w-full h-12 px-4 rounded-[2px] border border-neutral-200 font-bold text-sm bg-white text-neutral-600 focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 outline-none"
                    >
                      <option value="premium_econ">Premium Economy</option>
                      <option value="business">Classe Executiva</option>
                      <option value="first">Primeira Classe</option>
                    </select>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmittingConcierge}
                  className="w-full h-14 bg-neutral-900 hover:bg-[#ff7711] text-white font-black text-xs uppercase tracking-widest rounded-[2px] transition-all shadow-md active:scale-95"
                >
                  {isSubmittingConcierge ? "Enviando Solicitação..." : "Enviar Solicitação ao Concierge"}
                </Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
