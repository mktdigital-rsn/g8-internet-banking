"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  QrCode, 
  Smartphone, 
  Mail, 
  UserSquare2, 
  Copy, 
  ArrowDownToLine, 
  Contact2, 
  Key, 
  FileText, 
  Gauge, 
  Bell, 
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Diamond,
  ArrowRight,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PixPage() {
  const router = useRouter();
  const [pixKey, setPixKey] = React.useState("");
  const [keyType, setKeyType] = React.useState<string | null>(null);

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;
    let sum = 0;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    let rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;
    return true;
  };

  const handleKeyChange = (val: string) => {
    setPixKey(val);
    if (!val) {
      setKeyType(null);
      return;
    }

    // Smart Detection logic (Matches backend/mobile logic)
    const clean = val.replace(/\D/g, "");
    if (val.includes("@")) {
      setKeyType("EMAIL");
    } else if (clean.length === 11 && validateCPF(clean)) {
      setKeyType("CPF"); 
    } else if (clean.length === 10 || clean.length === 11) {
      setKeyType("PHONE");
    } else if (clean.length === 14) {
      setKeyType("CNPJ");
    } else if (val.length > 20) {
      setKeyType("CHAVE_ALEATORIA");
    } else {
      setKeyType(null);
    }
  };


  const handleContinue = () => {
    const type = keyType || "generic";
    router.push(`/dashboard/pix/pagar?type=${type.toLowerCase()}&key=${encodeURIComponent(pixKey)}`);
  };

  const pagarActions = [
    { icon: QrCode, label: "QRCODE", href: "/dashboard/pix/pagar?type=qrcode" },
    { icon: Copy, label: "Pix Copia e Cola", href: "/dashboard/pix/pagar?type=copia_cola" },
  ];

  const receberActions = [
    { icon: QrCode, label: "Cobrar", href: "/dashboard/pix/receber" },
    { icon: ArrowDownToLine, label: "Depositar", href: "/dashboard/pix/receber" },
  ];

  const outrosActions = [
    { icon: Contact2, label: "Contatos", href: "/dashboard/pix/contatos" },
    { icon: Key, label: "Minhas Chaves", href: "/dashboard/pix/chaves" },
    { icon: FileText, label: "Extrato", href: "/dashboard/pix/extrato" },
    { icon: Gauge, label: "Limites", href: "/dashboard/pix/limites" },
  ];

    return (
        <div className="p-4 md:p-8 xl:p-12 flex flex-col xl:flex-row gap-8 xl:gap-12 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
            
            {/* Main Content Area */}
            <div className="flex-1 space-y-12 relative z-10">
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none">
                        Área <span className="text-[#f97316]">PIX</span>
                    </h1>
                </div>


                {/* Main Action Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Input & Main Options */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Como você quer transferir?</h2>
                            
                            <Card className="p-8 rounded-xl border-0 shadow-2xl shadow-black/5 bg-[#fffbeb] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-4 text-[#f97316]">
                                        <div className="w-10 h-10 bg-[#f97316]/10 rounded-lg flex items-center justify-center border border-[#f97316]/10">
                                            <Key className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black uppercase tracking-widest text-[10px]">Chave Imediata</span>
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Pague Agora via PIX</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="relative flex-1 group">
                                            <Input 
                                                placeholder="CPF/CNPJ, E-mail, Celular ou Chave..."
                                                value={pixKey}
                                                onChange={(e) => handleKeyChange(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
                                                className="h-14 bg-white border-neutral-100 rounded-lg pl-6 pr-12 font-bold text-sm focus:ring-4 focus:ring-[#f97316]/10 transition-all shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] text-[#f97316]"
                                            />
                                            {pixKey && (
                                                <button 
                                                    onClick={() => { setPixKey(""); }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f97316] transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                        </div>
                                        <Button 
                                            disabled={!keyType}
                                            onClick={handleContinue}
                                            className="h-14 px-8 bg-[#0c0a09] hover:bg-[#f97316] text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-30 flex items-center gap-3 shrink-0"
                                        >
                                            Buscar <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href="/dashboard/pix/contatos" className="flex items-center gap-4 p-6 bg-[#fffbeb] rounded-xl border border-neutral-100 hover:shadow-2xl hover:border-[#f97316]/20 transition-all group relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/5 rounded-full -mr-12 -mt-12 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                                   <div className="w-12 h-12 bg-[#f97316]/10 rounded-xl flex items-center justify-center text-[#f97316] group-hover:scale-110 transition-transform relative z-10 border border-[#f97316]/5">
                                      <Contact2 className="h-6 w-6" />
                                   </div>
                                   <div className="text-left relative z-10">
                                      <span className="block font-black text-[#0c0a09] text-sm uppercase tracking-tight leading-none mb-1">Escolher contato</span>
                                      <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest opacity-60">Seus favoritos</span>
                                   </div>
                                </Link>
                                <button disabled className="flex items-center gap-4 p-6 bg-neutral-50 rounded-xl border border-neutral-100 transition-all opacity-40 cursor-not-allowed group relative grayscale">
                                   <div className="w-12 h-12 bg-neutral-200 rounded-xl flex items-center justify-center text-neutral-400">
                                      <Building2 className="h-6 w-6" />
                                   </div>
                                   <div className="text-left">
                                      <span className="block font-black text-neutral-400 text-sm uppercase tracking-tight leading-none mb-1">Agência e conta</span>
                                      <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest opacity-60">Em desenvolvimento</span>
                                   </div>
                                   <Badge className="absolute right-6 top-1/2 -translate-y-1/2 bg-neutral-300 text-neutral-600 border-0 text-[8px] font-black rounded-full px-2 py-1 uppercase tracking-[0.2em]">Breve</Badge>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Pagar Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Mais opções</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {pagarActions.map((action) => (
                                        <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
                                    ))}
                                </div>
                            </div>

                            {/* Receber Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Receber</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {receberActions.map((action) => (
                                        <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Others Section */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Gestão & Segurança</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
                                {outrosActions.map((action) => (
                                    <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Promo & Help */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Banner Card Premium */}
                        <Card className="rounded-3xl border-0 shadow-2xl shadow-black/5 bg-gradient-to-br from-[#f97316] to-[#ea580c] overflow-hidden relative group cursor-pointer h-[450px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000 -mr-20 -mt-20" />
                            <div className="p-10 space-y-6 relative z-10 text-white">
                                <Badge className="bg-white/20 text-white border-0 text-[8px] font-black tracking-[0.3em] backdrop-blur-md mb-2">G8 PREMIUM</Badge>
                                <h3 className="text-3xl font-black leading-tight max-w-[240px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                    Experiência que te move.
                                </h3>
                                <p className="text-sm font-bold text-white/80 leading-relaxed max-w-[220px]">
                                    Benefícios exclusivos para facilitar seu fluxo financeiro diário.
                                </p>
                                <Button className="bg-white text-[#f97316] hover:bg-neutral-50 px-8 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 mt-4 active:scale-95 transition-all">
                                    Explorar Agora
                                </Button>
                            </div>
                            
                            <div className="absolute bottom-0 right-0 w-full h-[300px] flex items-end justify-end translate-y-12 group-hover:translate-y-4 transition-transform duration-700">
                                 <Image 
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=shopping&backgroundColor=ff7711&radius=50" 
                                    alt="Benefit" 
                                    width={280} 
                                    height={280} 
                                    className="object-contain relative z-10 scale-110 drop-shadow-2xl"
                                 />
                            </div>
                        </Card>

                        {/* Help Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Suporte G8</h2>
                            <div className="grid grid-cols-2 gap-4">
                                 <button className="flex flex-col items-center justify-center p-8 bg-[#fffbeb] rounded-2xl hover:shadow-2xl transition-all border border-neutral-100 group">
                                     <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] bg-[#f97316]/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <HelpCircle className="h-6 w-6 stroke-[2.5]" />
                                     </div>
                                     <span className="font-black text-[#0c0a09] uppercase text-[10px] tracking-widest">Suporte</span>
                                 </button>
                                 <button className="flex flex-col items-center justify-center p-8 bg-[#0c0a09] rounded-2xl hover:shadow-2xl transition-all border border-transparent group">
                                    <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center mb-4 text-white group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20">
                                       <MessageCircle className="h-6 w-6 stroke-[2.5]" />
                                    </div>
                                    <span className="font-black text-white uppercase text-[10px] tracking-widest text-center">Chat 24H</span>
                                 </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function PixAction({ 
    icon: Icon, 
    label,
    href
}: { 
    icon: any, 
    label: string,
    href: string
}) {
   const content = (
    <div className="flex flex-col items-center justify-center w-full min-h-[160px] bg-[#fffbeb] rounded-2xl hover:shadow-2xl hover:scale-[1.05] transition-all border border-neutral-200/20 group cursor-pointer p-6">
       <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] bg-[#f97316]/5 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 stroke-[2.5]" />
       </div>
       <span className="text-[11px] font-black text-[#0c0a09] text-center px-1 uppercase tracking-widest leading-tight opacity-70 group-hover:opacity-100 group-hover:text-[#f97316] transition-colors">{label}</span>
    </div>
  );

  if (href === "#") return content;
  
  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

