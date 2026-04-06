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
  Diamond
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PixPage() {
  const pagarActions = [
    { icon: QrCode, label: "QRCODE", href: "/dashboard/pix/pagar?type=qrcode" },
    { icon: Smartphone, label: "Celular", href: "/dashboard/pix/pagar?type=phone" },
    { icon: Mail, label: "Email", href: "/dashboard/pix/pagar?type=email" },
    { icon: UserSquare2, label: "CPF/CNPJ", href: "/dashboard/pix/pagar?type=cpf_cnpj" },
    { icon: Copy, label: "Copia Cola", href: "/dashboard/pix/pagar?type=copia_cola" },
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
        {/* Page Title Header */}
        <div className="flex items-center gap-3">
          <div className="bg-[#f97316] text-white px-8 py-3 rounded-full flex items-center gap-3 shadow-lg shadow-[#f97316]/20 hover:scale-105 transition-transform cursor-pointer">
            <span className="text-xl font-black italic tracking-tighter uppercase">PIX</span>
            <div className="bg-white/20 p-1.5 rounded-full">
              <Diamond className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Pagar Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#f97316]">Pagar</h2>
          <div className="flex flex-wrap gap-6">
            {pagarActions.map((action) => (
              <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
            ))}
          </div>
        </div>

        {/* Receber Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#f97316]">Receber</h2>
          <div className="flex flex-wrap gap-6">
            {receberActions.map((action) => (
              <PixAction key={action.label} icon={action.icon} label={action.label} href={action.href} />
            ))}
          </div>
        </div>

        {/* Others Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#f97316]">Outros</h2>
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
        <Card className="rounded-[40px] border-0 shadow-2xl shadow-black/5 bg-[#f97316] overflow-hidden relative group cursor-pointer h-[400px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="p-8 space-y-4 relative z-10 text-white">
            <h3 className="text-2xl font-black leading-tight max-w-[220px] drop-shadow-sm">
              Completa para todos os perfis
            </h3>
            <p className="text-sm font-medium text-white/80 leading-relaxed max-w-[200px]">
              Milhares de produtos, <span className="font-bold text-white underline">descontos</span> de até 50% e cupons exclusivos.
            </p>
            <button className="text-xs font-black text-white border-b-2 border-white pb-0.5 mt-4 hover:text-[#f97316] hover:border-[#f97316] transition-colors">
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
          <h2 className="text-2xl font-bold text-[#f97316]">Ajuda</h2>
          <div className="flex gap-4">
             <button className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f5f5f5] rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-neutral-200 group">
                <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                   <HelpCircle className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#f97316]">Suporte</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f5f5f5] rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-neutral-200 group">
                <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                   <MessageCircle className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#f97316]">Chat 24H</span>
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
    <div className="flex flex-col items-center justify-center w-[120px] h-[140px] bg-[#f5f5f5] rounded-[32px] hover:bg-white hover:shadow-xl hover:scale-[1.05] transition-all border border-transparent hover:border-neutral-200 group cursor-pointer">
       <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#f97316] group-hover:scale-110 transition-transform">
          <Icon className="h-8 w-8 stroke-[1.5]" />
       </div>
       <span className="text-xs font-bold text-[#f97316] text-center px-1 uppercase tracking-tight leading-tight">{label}</span>
    </div>
  );

  if (href === "#") return content;
  
  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
