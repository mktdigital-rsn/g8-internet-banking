"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Plane, 
  Compass, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  QrCode, 
  AlertTriangle, 
  Sparkles, 
  User, 
  Info,
  Clock,
  Luggage,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
  SlidersHorizontal,
  Search,
  ChevronRight,
  TrendingUp,
  Globe,
  ChevronLeft,
  X,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AereoPage() {
  const [activeTab, setActiveTab] = useState<"search" | "lounge" | "miles" | "concierge">("search");
  const [g8Points, setG8Points] = useState(142500);
  const [showQrCode, setShowQrCode] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  
  // Search Widget states
  const [somenteIda, setSomenteIda] = useState(false);
  const [origem, setOrigem] = useState("Salvador, BA");
  const [destino, setDestino] = useState("Rio de Janeiro, RJ");
  const [dataViagem, setDataViagem] = useState("30/05/2026");
  const [isSearchingVoos, setIsSearchingVoos] = useState(false);
  const [voosEncontrados, setVoosEncontrados] = useState<any[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClass, setSelectedClass] = useState("economic");

  // Interactive Calendar Popover
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(30);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Interactive Passengers Modal/Popover
  const [showPassengersModal, setShowPassengersModal] = useState(false);
  const [adultsCount, setAdultsCount] = useState(1);
  const [kidsCount, setKidsCount] = useState(0);
  const [babiesCount, setBabiesCount] = useState(0);
  const passengersRef = useRef<HTMLDivElement>(null);

  // Concierge Form
  const [conciergeDest, setConciergeDest] = useState("");
  const [conciergeDate, setConciergeDate] = useState("");
  const [conciergeClass, setConciergeClass] = useState("business");
  const [isSubmittingConcierge, setIsSubmittingConcierge] = useState(false);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (passengersRef.current && !passengersRef.current.contains(event.target as Node)) {
        setShowPassengersModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleBuscarVoos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origem) {
      toast.error("Por favor, informe o aeroporto de origem.");
      return;
    }
    if (!destino) {
      toast.error("Por favor, informe o aeroporto de destino.");
      return;
    }
    if (!dataViagem) {
      toast.error("Por favor, informe a data da viagem.");
      return;
    }

    setIsSearchingVoos(true);
    setVoosEncontrados(null);

    setTimeout(() => {
      setIsSearchingVoos(false);
      setVoosEncontrados([
        {
          id: 1,
          cia: "LATAM Airlines",
          logo: "✈️",
          voo: "LA 3402",
          horarios: "08:15 ➔ 11:30",
          duracao: "3h 15m (Direto)",
          precoPontos: 22000,
          precoReais: 890,
        },
        {
          id: 2,
          cia: "Azul Linhas Aéreas",
          logo: "💙",
          voo: "AD 4122",
          horarios: "13:40 ➔ 16:55",
          duracao: "3h 15m (Direto)",
          precoPontos: 25000,
          precoReais: 980,
        },
        {
          id: 3,
          cia: "GOL Intelligent Tech",
          logo: "🧡",
          voo: "G3 1890",
          horarios: "19:10 ➔ 23:25",
          duracao: "4h 15m (1 Parada)",
          precoPontos: 18500,
          precoReais: 720,
        },
        {
          id: 4,
          cia: "Emirates (G8 Elite Partner)",
          logo: "✈️",
          voo: "EK 262",
          horarios: "01:25 ➔ 05:40",
          duracao: "4h 15m (Direto)",
          precoPontos: 68000,
          precoReais: 2850,
          isElite: true
        }
      ]);
      toast.success("Voos encontrados com sucesso!");
    }, 1800);
  };

  const handleBookFlight = (flight: any, payWithPoints: boolean) => {
    if (payWithPoints) {
      if (g8Points < flight.precoPontos) {
        toast.error("Saldo de pontos G8 insuficiente.");
        return;
      }
      setG8Points(prev => prev - flight.precoPontos);
      toast.success(`Reserva confirmada! Código da reserva: G8-${Math.floor(100000 + Math.random() * 900000)}. Debitados ${flight.precoPontos.toLocaleString("pt-BR")} pts.`);
    } else {
      toast.success(`Reserva do voo ${flight.voo} iniciada! O pagamento de R$ ${flight.precoReais} foi autorizado no seu G8 Platinum Card.`);
    }
  };

  const handleSelectDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDay(day);
    setDataViagem(`${day < 10 ? "0" + day : day}/05/2026`);
    setShowCalendar(false);
  };

  const getPassengersLabel = () => {
    const total = adultsCount + kidsCount + babiesCount;
    if (total === 1) return "1 Passageiro";
    return `${total} Passageiros`;
  };

  // Calendar dates matching screenshot (May 2026, starting Monday)
  const calendarDays = [
    { day: 27, currentMonth: false },
    { day: 28, currentMonth: false },
    { day: 29, currentMonth: false },
    { day: 30, currentMonth: false },
    { day: 1, currentMonth: true },
    { day: 2, currentMonth: true },
    { day: 3, currentMonth: true },
    { day: 4, currentMonth: true },
    { day: 5, currentMonth: true },
    { day: 6, currentMonth: true },
    { day: 7, currentMonth: true },
    { day: 8, currentMonth: true },
    { day: 9, currentMonth: true },
    { day: 10, currentMonth: true },
    { day: 11, currentMonth: true },
    { day: 12, currentMonth: true },
    { day: 13, currentMonth: true },
    { day: 14, currentMonth: true },
    { day: 15, currentMonth: true },
    { day: 16, currentMonth: true },
    { day: 17, currentMonth: true },
    { day: 18, currentMonth: true },
    { day: 19, currentMonth: true },
    { day: 20, currentMonth: true },
    { day: 21, currentMonth: true },
    { day: 22, currentMonth: true }, 
    { day: 23, currentMonth: true, isWeekend: true },
    { day: 24, currentMonth: true, isWeekend: true },
    { day: 25, currentMonth: true },
    { day: 26, currentMonth: true },
    { day: 27, currentMonth: true },
    { day: 28, currentMonth: true },
    { day: 29, currentMonth: true },
    { day: 30, currentMonth: true, isWeekend: true },
    { day: 31, currentMonth: true, isWeekend: true }
  ];

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
        
        {/* TAB 0: PASSAGENS AÉREAS (WIDGET FULL WIDTH WITH EXTRA PADDING) */}
        {activeTab === "search" && (
          <div className="space-y-8 w-full">
            
            {/* Flight Search Widget Container */}
            <div className="bg-white border border-neutral-200/80 rounded-[4px] p-6 md:p-8 shadow-sm space-y-8 relative w-full">
              
              {/* Somente Ida Checkbox */}
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="somenteIda" 
                  checked={somenteIda}
                  onChange={(e) => setSomenteIda(e.target.checked)}
                  className="w-5 h-5 rounded-[2px] border-neutral-300 text-[#ff7711] focus:ring-[#ff7711] cursor-pointer"
                />
                <label htmlFor="somenteIda" className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-widest cursor-pointer select-none">
                  Somente Ida
                </label>
              </div>

              {/* Form Wrapper with extra generous column allocation to avoid truncation */}
              <form onSubmit={handleBuscarVoos} className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
                  
                  {/* Aeroporto de Origem - md:col-span-3 */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-600 block">
                      Aeroporto de origem
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Input 
                        value={origem}
                        onChange={(e) => setOrigem(e.target.value)}
                        placeholder="Digite o nome o aeroporto"
                        className="pl-10 h-12 rounded-[2px] border-neutral-300 focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 font-bold text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Aeroporto de Destino - md:col-span-3 */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-600 block">
                      Aeroporto de destino
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Input 
                        value={destino}
                        onChange={(e) => setDestino(e.target.value)}
                        placeholder="Digite o nome o aeroporto"
                        className="pl-10 h-12 rounded-[2px] border-neutral-300 focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 font-bold text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Data Ida e Volta (Trigger for Calendar Popover) - md:col-span-2 */}
                  <div className="md:col-span-2 space-y-2 relative">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-600 block">
                      {somenteIda ? "Data de Ida" : "Data Ida e Volta"}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                      <Input 
                        value={dataViagem}
                        readOnly
                        onClick={() => {
                          setShowCalendar(!showCalendar);
                          setShowPassengersModal(false);
                        }}
                        placeholder="DD/MM/YYYY"
                        className="pl-10 h-12 rounded-[2px] border-neutral-300 focus:border-[#ff7711] focus:ring-4 focus:ring-[#ff7711]/10 font-bold text-sm cursor-pointer bg-white"
                      />
                    </div>

                    {/* CALENDAR DATEPICKER MODAL (EXACTLY AS SCREENSHOT WITH LARGER FONTS) */}
                    {showCalendar && (
                      <div 
                        ref={calendarRef} 
                        className="absolute bottom-14 md:bottom-auto md:top-14 left-0 mt-2 bg-white border border-neutral-250 rounded-[4px] p-6 shadow-2xl z-50 w-80 md:w-96 animate-in fade-in duration-200"
                      >
                        {/* Calendar Month Header */}
                        <div className="flex items-center justify-between mb-6">
                          <button 
                            type="button" 
                            onClick={() => toast.info("Funcionalidade de navegação de meses em desenvolvimento")}
                            className="text-neutral-500 hover:text-neutral-700"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <span className="text-base font-black text-neutral-800 tracking-tight">May 2026</span>
                          <button 
                            type="button" 
                            onClick={() => toast.info("Funcionalidade de navegação de meses em desenvolvimento")}
                            className="text-neutral-500 hover:text-neutral-700"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-2 text-center mb-4">
                          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((wd) => (
                            <span key={wd} className="text-xs font-black text-neutral-400 uppercase tracking-widest">{wd}</span>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {calendarDays.map((dayObj, idx) => {
                            const isSelected = dayObj.day === selectedDay && dayObj.currentMonth;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectDay(dayObj.day, dayObj.currentMonth)}
                                className={`h-9 w-9 text-sm font-black flex items-center justify-center rounded-[2px] transition-all ${
                                  !dayObj.currentMonth
                                    ? "text-neutral-200 pointer-events-none"
                                    : isSelected
                                      ? "bg-neutral-100 text-[#ff7711] font-black border-2 border-[#ff7711]/40"
                                      : dayObj.isWeekend
                                        ? "text-red-500 hover:bg-neutral-50"
                                        : "text-neutral-800 hover:bg-neutral-50"
                                }`}
                              >
                                {dayObj.day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Passageiros (Trigger for Passengers Selector Popover/Modal) - md:col-span-2 */}
                  <div className="md:col-span-2 space-y-2 relative">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-600 block">
                      Passageiros
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassengersModal(!showPassengersModal);
                        setShowCalendar(false);
                      }}
                      className="flex items-center gap-2 bg-white border border-neutral-300 rounded-[2px] h-12 px-3 w-full text-left focus:ring-4 focus:ring-[#ff7711]/10 focus:border-[#ff7711] outline-none"
                    >
                      <User className="h-5 w-5 text-neutral-400 shrink-0" />
                      <span className="text-sm font-bold text-neutral-700 truncate">{getPassengersLabel()}</span>
                    </button>

                    {/* PASSENGER SELECTOR MODAL (EXACTLY AS SCREENSHOT WITH INCREASED FONTS) */}
                    {showPassengersModal && (
                      <div 
                        ref={passengersRef} 
                        className="absolute bottom-14 md:bottom-auto md:top-14 right-0 mt-2 bg-white border border-neutral-200 rounded-[4px] p-6 shadow-2xl z-50 w-80 md:w-[380px] animate-in fade-in duration-200 space-y-6"
                      >
                        {/* Title & Close Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                          <span className="text-sm font-black uppercase tracking-widest text-neutral-800">Passageiros</span>
                          <button 
                            type="button"
                            onClick={() => setShowPassengersModal(false)}
                            className="text-neutral-500 hover:text-neutral-700 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* Categories stack */}
                        <div className="grid grid-cols-3 gap-4">
                          
                          {/* Adultos */}
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-10 h-10 rounded-[2px] bg-neutral-50 border border-neutral-200 flex items-center justify-center text-[#ff7711] scale-110">
                              <User size={18} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Adultos</span>
                            <div className="flex items-center gap-1.5 border border-neutral-350 rounded-[2px] p-1 bg-white">
                              <button 
                                type="button"
                                onClick={() => setAdultsCount(prev => Math.max(1, prev - 1))}
                                className="w-7 h-7 bg-neutral-50 hover:bg-neutral-100 font-black text-sm text-neutral-600 flex items-center justify-center rounded-[2px]"
                              >
                                -
                              </button>
                              <span className="w-6 text-sm font-black text-neutral-800">{adultsCount}</span>
                              <button 
                                type="button"
                                onClick={() => setAdultsCount(prev => prev + 1)}
                                className="w-7 h-7 bg-neutral-50 hover:bg-neutral-100 font-black text-sm text-neutral-600 flex items-center justify-center rounded-[2px]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Crianças */}
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-10 h-10 rounded-[2px] bg-neutral-50 border border-neutral-200 flex items-center justify-center text-[#ffaa00] scale-110">
                              <span className="text-lg">👶</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Crianças</span>
                            <div className="flex items-center gap-1.5 border border-neutral-350 rounded-[2px] p-1 bg-white">
                              <button 
                                type="button"
                                onClick={() => setKidsCount(prev => Math.max(0, prev - 1))}
                                className="w-7 h-7 bg-neutral-50 hover:bg-neutral-100 font-black text-sm text-neutral-600 flex items-center justify-center rounded-[2px]"
                              >
                                -
                              </button>
                              <span className="w-6 text-sm font-black text-neutral-800">{kidsCount}</span>
                              <button 
                                type="button"
                                onClick={() => setKidsCount(prev => prev + 1)}
                                className="w-7 h-7 bg-neutral-50 hover:bg-neutral-100 font-black text-sm text-neutral-600 flex items-center justify-center rounded-[2px]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Bebês */}
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-10 h-10 rounded-[2px] bg-neutral-50 border border-neutral-200 flex items-center justify-center text-[#1e90ff] scale-110">
                              <span className="text-lg">🛒</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Bebês</span>
                            <div className="flex items-center gap-1.5 border border-neutral-350 rounded-[2px] p-1 bg-white">
                              <button 
                                type="button"
                                onClick={() => setBabiesCount(prev => Math.max(0, prev - 1))}
                                className="w-7 h-7 bg-neutral-50 hover:bg-neutral-100 font-black text-sm text-neutral-600 flex items-center justify-center rounded-[2px]"
                              >
                                -
                              </button>
                              <span className="w-6 text-sm font-black text-neutral-800">{babiesCount}</span>
                              <button 
                                type="button"
                                onClick={() => setBabiesCount(prev => prev + 1)}
                                className="w-7 h-7 bg-neutral-50 hover:bg-neutral-100 font-black text-sm text-neutral-600 flex items-center justify-center rounded-[2px]"
                              >
                                +
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Atenção Alert Box */}
                        <div className="bg-[#f0f9ff] border border-[#bee3f8] p-5 rounded-[4px] space-y-3">
                          <div className="flex items-center gap-2 text-[#2b6cb0] font-black text-sm uppercase tracking-widest">
                            <Info size={16} className="shrink-0" />
                            <span>Atenção</span>
                          </div>
                          <div className="text-xs text-[#2d3748] font-black space-y-1.5 leading-relaxed">
                            <p>• INF - Bebês: Até 2 anos de idade</p>
                            <p>• CHD - Crianças: De 2 até 11 anos de idade</p>
                            <p>• 2 anos e 1 dia : CHD</p>
                            <p>• 11 anos e 1 dia : ADT</p>
                          </div>
                        </div>

                        {/* Confirmar Button */}
                        <Button 
                          type="button"
                          onClick={() => setShowPassengersModal(false)}
                          className="w-full h-14 bg-[#ff7711] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-widest rounded-[2px] flex items-center justify-center gap-2 transition-all"
                        >
                          <Check size={16} /> Confirmar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Filtro & Botão Buscar (Desktop Horizontal Row) - md:col-span-2 */}
                  <div className="md:col-span-2 flex gap-2 w-full h-12">
                    {/* Filter Button */}
                    <button 
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`w-12 h-12 border border-neutral-300 hover:border-neutral-400 flex items-center justify-center rounded-[2px] shrink-0 transition-all ${showFilters ? "bg-neutral-100 border-neutral-350 text-[#ff7711]" : "bg-white text-neutral-600"}`}
                      title="Filtros avançados"
                    >
                      <SlidersHorizontal className="h-5 w-5" />
                    </button>

                    {/* Desktop Magnifying Search Button */}
                    <button 
                      type="submit"
                      disabled={isSearchingVoos}
                      className="hidden md:flex flex-1 bg-[#ff7711] hover:bg-orange-600 text-white items-center justify-center rounded-[2px] shadow-sm transition-all"
                    >
                      {isSearchingVoos ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="h-6 w-6 stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                </div>

                {/* Advanced Filters Expandable section */}
                {showFilters && (
                  <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-[2px] grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block">Classe</label>
                      <select 
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full h-10 px-3 rounded-[2px] border border-neutral-350 font-bold text-xs bg-white text-neutral-600 outline-none"
                      >
                        <option value="economic">Econômica</option>
                        <option value="premium_econ">Premium Econômica</option>
                        <option value="business">Classe Executiva</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block">Companhia Preferida</label>
                      <select className="w-full h-10 px-3 rounded-[2px] border border-neutral-350 font-bold text-xs bg-white text-neutral-600 outline-none">
                        <option value="any">Sem preferência</option>
                        <option value="latam">LATAM Pass</option>
                        <option value="smiles">Smiles (GOL)</option>
                        <option value="azul">Azul</option>
                        <option value="emirates">Emirates</option>
                      </select>
                    </div>
                    <div className="space-y-2 flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer py-2 select-none">
                        <input type="checkbox" className="w-4 h-4 rounded-[2px] border-neutral-300 text-[#ff7711]" />
                        <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">Apenas voos diretos</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Mobile Full-width Button */}
                <div className="block md:hidden">
                  <Button 
                    type="submit" 
                    disabled={isSearchingVoos}
                    className="w-full h-14 bg-[#ff7711] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-widest rounded-[2px]"
                  >
                    {isSearchingVoos ? "Pesquisando Companhias..." : "Buscar Passagens"}
                    <Search className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>

            </div>

            {/* Loader during search */}
            {isSearchingVoos && (
              <div className="bg-white border border-neutral-200 rounded-[4px] p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#ff7711] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-black uppercase tracking-widest text-[#ff7711] animate-pulse">Consultando companhias aéreas...</span>
              </div>
            )}

            {/* Search Results Display */}
            {voosEncontrados && !isSearchingVoos && (
              <div className="space-y-4 w-full">
                <h3 className="text-xs md:text-sm font-black text-neutral-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <TrendingUp className="text-[#ff7711]" size={16} />
                  Voos Disponíveis Encontrados
                </h3>
                
                <div className="space-y-4 w-full">
                  {voosEncontrados.map((voo) => (
                    <div 
                      key={voo.id}
                      className={`bg-white border p-6 rounded-[4px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md ${voo.isElite ? "border-amber-400/50 bg-amber-500/[0.03]" : "border-neutral-200"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[4px] bg-neutral-100 flex items-center justify-center text-2xl shrink-0">
                          {voo.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base text-neutral-800">{voo.cia}</h4>
                            {voo.isElite && <Badge className="bg-amber-400 text-black font-black text-[8px] py-0.5 px-1.5 border-transparent rounded-[2px]">PARCEIRO VIP</Badge>}
                          </div>
                          <p className="text-xs text-neutral-500 font-bold uppercase">{voo.voo} • {voo.duracao}</p>
                        </div>
                      </div>

                      {/* Route/Time display */}
                      <div className="text-left md:text-center">
                        <p className="font-mono font-black text-neutral-800 text-base">{voo.horarios}</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{origem} ➔ {destino}</p>
                      </div>

                      {/* Booking Options with Points or Cash */}
                      <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                        {/* Points */}
                        <div className="text-left sm:text-right flex-1 sm:flex-none">
                          <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Resgatar Pontos G8</span>
                          <p className="text-lg font-black text-[#ff7711] tracking-tight">{voo.precoPontos.toLocaleString("pt-BR")} pts</p>
                          <Button 
                            onClick={() => handleBookFlight(voo, true)}
                            className="h-9 mt-1.5 px-5 bg-[#ff7711] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-[2px]"
                          >
                            Com Milhas
                          </Button>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-[1px] h-12 bg-neutral-200 self-center" />

                        {/* Cash */}
                        <div className="text-left sm:text-right flex-1 sm:flex-none">
                          <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">Comprar no Cartão</span>
                          <p className="text-lg font-black text-neutral-800 tracking-tight">R$ {voo.precoReais}</p>
                          <Button 
                            onClick={() => handleBookFlight(voo, false)}
                            className="h-9 mt-1.5 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest rounded-[2px]"
                          >
                            Comprar
                          </Button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

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
