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
    { icon: Bell, label: "Notificações", href: "#" },
    { icon: AlertCircle, label: "Contestações", href: "#" },
  ];

  return (
    <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar">
      {/* Main Content */}
      <div className="flex-1 space-y-4   max-w-4xl">
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight">Como você quer transferir?</h2>
          
          <Card className="p-6 rounded-lg border-0 shadow-xl shadow-black/5 bg-[#fffbeb] border-2 border-yellow-100/50">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-[#ff7711]">
                <Key className="h-5 w-5" />
                <span className="font-black uppercase tracking-widest text-[10px]">Com uma chave Pix</span>
              </div>

              <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1 group">
                        <Input 
                          placeholder="CPF/CNPJ, E-mail, Celular ou Chave..."
                          value={pixKey}
                          onChange={(e) => handleKeyChange(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
                          className="h-14 bg-white border-neutral-100 rounded-[5px] pl-6 pr-12 font-bold text-base focus:ring-4 focus:ring-[#ff7711]/10 transition-all shadow-sm text-[#ff7711]"
                        />
                        {pixKey && (
                          <button 
                            onClick={() => { setPixKey(""); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff7711] transition-colors"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      <Button 
                        disabled={!keyType}
                        onClick={handleContinue}
                        className="h-14 px-10 bg-[#0c0a09] hover:bg-[#ff7711] text-white rounded-[5px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-30 disabled:bg-neutral-400"
                      >
                        Prosseguir
                      </Button>
                    </div>

              </div>
            </div>
          </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-4 p-5 bg-[#fffbeb] rounded-2xl border border-neutral-100 hover:shadow-xl hover:border-[#ff7711]/20 transition-all group">
               <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#ff7711] group-hover:scale-110 transition-transform">
                  <Contact2 className="h-5 w-5" />
               </div>
               <div className="text-left">
                  <span className="block font-black text-[#0c0a09] text-xs uppercase tracking-tight leading-none">Escolher um contato</span>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Contatos frequentes</span>
               </div>
            </button>
            <button disabled className="flex items-center gap-4 p-5 bg-neutral-50/50 rounded-2xl border border-neutral-100 transition-all opacity-60 cursor-not-allowed group relative group">
               <div className="w-10 h-10 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
                  <Building2 className="h-5 w-5" />
               </div>
               <div className="text-left">
                  <span className="block font-black text-neutral-400 text-xs uppercase tracking-tight leading-none">Agência e conta</span>
                  <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-widest">Qualquer banco</span>
               </div>
               <Badge className="absolute right-4 top-1/2 -translate-y-1/2 bg-neutral-200 text-neutral-500 border-0 text-[8px] font-black rounded-2xl px-2 py-1 uppercase tracking-widest">EM BREVE</Badge>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Pagar Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight">Mais opções</h2>
            <div className="flex flex-wrap gap-6">
              {pagarActions.map((action) => (
                <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
              ))}
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden lg:block w-[1px] h-40 bg-neutral-200/50 self-end mb-4" />

          {/* Receber Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight">Receber</h2>
            <div className="flex flex-wrap gap-6">
              {receberActions.map((action) => (
                <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
              ))}
            </div>
          </div>
        </div>

        {/* Others Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight">Outros serviços</h2>
          <div className="flex flex-wrap gap-6 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
            {outrosActions.map((action) => (
              <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Advertisement & Help */}
      <div className="w-[380px] shrink-0 space-y-8">
        {/* Banner Card Premium */}
        <Card className="rounded-[40px] border-0 shadow-2xl shadow-black/5 bg-[#ff7711] overflow-hidden relative group cursor-pointer h-[400px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="p-8 space-y-4 relative z-10 text-white">
            <h3 className="text-2xl font-black leading-tight max-w-[220px] drop-shadow-sm">
              Completa para todos os perfis
            </h3>
            <p className="text-sm font-medium text-white/80 leading-relaxed max-w-[200px]">
              Milhares de produtos, <span className="font-bold text-white underline">descontos</span> de até 50% e cupons exclusivos.
            </p>
            <button className="text-xs font-black text-white border-b-2 border-white pb-0.5 mt-4 hover:text-[#ff7711] hover:border-[#ff7711] transition-colors">
              VER PRODUTO
            </button>
          </div>
          
          <div className="absolute bottom-0 right-0 w-[240px] h-full flex items-end justify-end translate-y-10 group-hover:translate-y-4 transition-transform duration-500">
             <Image 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=shopping" 
                alt="Profile Premium" 
                width={200} 
                height={200} 
                className="object-contain relative z-10 scale-125"
             />
          </div>
        </Card>

        {/* Help Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight">Ajuda</h2>
          <div className="flex gap-4">
             <button className="flex-1 flex flex-col items-center justify-center p-6 bg-[#fffbeb] rounded-2xl hover:shadow-xl transition-all border border-neutral-100 group">
                 <div className="w-10 h-10 flex items-center justify-center mb-4 text-[#ff7711] group-hover:scale-110 transition-transform">
                    <HelpCircle className="h-6 w-6 stroke-[2.5]" />
                 </div>
                 <span className="font-bold text-[#0c0a09] uppercase text-[10px] tracking-widest">Suporte</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center p-6 bg-[#fffbeb] rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-neutral-200 group">
                <div className="w-10 h-10 bg-[#ff7711] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                   <MessageCircle className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="font-bold text-[#0c0a09] uppercase text-[10px] tracking-widest text-center">Chat 24H</span>
             </button>
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
    <div className="flex flex-col items-center justify-center w-[120px] h-[140px] bg-[#fffbeb] rounded-md hover:bg-white hover:shadow-xl hover:scale-[1.05] transition-all border border-neutral-200/20 group cursor-pointer">
       <div className="w-10 h-10 flex items-center justify-center mb-4 text-[#ff7711] group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 stroke-[2.5]" />
       </div>
       <span className="text-[10px] font-black text-[#0c0a09] text-center px-1 uppercase tracking-widest leading-tight">{label}</span>
    </div>
  );

  if (href === "#") return content;
  
  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

