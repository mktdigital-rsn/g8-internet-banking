"use client";

import React from "react";
import Image from "next/image";
import { 
  Home, 
  Wallet, 
  ArrowUpRight, 
  Smartphone, 
  FileText, 
  Users, 
  UserCircle, 
  HelpCircle,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  RotateCw,
  Eye,
  CreditCard,
  Calendar,
  Grid
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { icon: Home, label: "Resumo", href: "/dashboard" },
  { icon: Wallet, label: "Pagamentos", href: "#", badge: "2" },
  { icon: ArrowUpRight, label: "Transferência", href: "/dashboard/transferencia" },
  { icon: Smartphone, label: "PIX", href: "/dashboard/pix" },
  { icon: FileText, label: "Extrato", href: "#" },
  { icon: Users, label: "Referrals", href: "#" },
  { icon: UserCircle, label: "Conta", href: "#" },
  { icon: HelpCircle, label: "Ajuda", href: "#" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen bg-[#0c0a09] text-[#f5f5f5] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col p-6 space-y-8 z-20">
        <div className="flex items-center gap-3 px-2">
          <Image src="/logo_g8_official.png" alt="G8Pay" width={130} height={45} className="object-contain" />
        </div>

        <div className="flex flex-col space-y-1">
           {/* User quick info in sidebar (as per image) */}
           <div className="flex items-center gap-3 p-3 mb-6 bg-neutral-900/50 rounded-2xl border border-white/5">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guilherme" />
                <AvatarFallback>GP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">Boa tarde,</span>
                <span className="text-sm font-semibold truncate">Guilherme P.</span>
                <div className="flex items-center gap-1 mt-1">
                   <span className="text-[10px] font-mono text-primary">R$ 5.002,36</span>
                   <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
           </div>

          {menuItems.map((item) => {
            const isActive = item.href === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname.startsWith(item.href) && item.href !== "#";
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "group-hover:text-primary transition-colors"}`} />
                  <span className="text-[15px]">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#ff4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-3 w-full text-muted-foreground hover:text-[#ff4444] transition-colors group">
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center max-w-md w-full">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Procurar transações, serviços..." 
                className="w-full bg-white/5 border-white/5 pl-10 focus:bg-white/10 focus:ring-1 focus:ring-primary/50 rounded-full h-10 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-8 mr-4">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Conta Corrente</span>
                   <span className="text-xs font-mono font-bold">AG: 2561  C: 2561</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saldo Disponível</span>
                   <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary font-mono">R$ 5.002,36</span>
                      <RotateCw className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-2 bg-neutral-900 border border-white/5 p-1 rounded-full pr-4 cursor-pointer hover:bg-neutral-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold">
                   PT
                </div>
                <span className="text-xs font-medium">PT-BR</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
             </div>

             <div className="relative cursor-pointer group">
                <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#0c0a09]" />
             </div>

             <Separator orientation="vertical" className="h-8 bg-white/10" />

             <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right flex flex-col justify-center">
                   <p className="text-xs font-bold group-hover:text-primary transition-colors leading-none">Guilherme P.</p>
                   <p className="text-[10px] text-muted-foreground">Admin</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/50 transition-all">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guilherme" />
                  <AvatarFallback>GP</AvatarFallback>
                </Avatar>
             </div>
          </div>
        </header>

        {/* Content Sheet (The large rounded area from Figma) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="h-full w-full bg-[#f8f9fa] rounded-[40px] text-[#0c0a09] relative shadow-2xl overflow-hidden flex flex-col">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
