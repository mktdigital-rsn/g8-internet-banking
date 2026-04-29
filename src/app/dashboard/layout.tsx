"use client";

import React from "react";
import Image from "next/image";
import {
  Home,
  Wallet,
  ArrowUpRight,
  Smartphone,
  FileText,
  UserCircle,
  HelpCircle,
  Search,
  LogOut,
  RotateCw,
  CreditCard,
  Clock,
  Banknote,
  Cpu,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { useSetAtom, useAtom } from "jotai";
import { temporaryDeviceIdAtom, balanceAtom, isBalanceLoadingAtom, userAtom, isUserLoadingAtom } from "@/store/auth";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  disabled?: boolean;
  badge?: string;
  type?: 'link' | 'separator';
}

const menuGroups: { label?: string; items: MenuItem[] }[] = [
  {
    items: [{ icon: Home, label: "Resumo", href: "/dashboard" }]
  },
  {
    items: [
      { icon: Clock, label: "Agendamentos", href: "/dashboard/agendamentos" },
      { icon: Banknote, label: "Cobranças", href: "/dashboard/cobrancas" },
      { icon: CreditCard, label: "Cartões", href: "/dashboard/cartoes" },
      { icon: FileText, label: "Extrato", href: "/dashboard/extrato" },
      { icon: Wallet, label: "Pagamentos", href: "/dashboard/pagamentos" },
      { icon: Smartphone, label: "PIX", href: "/dashboard/pix" },
      { icon: Cpu, label: "POS/MAQUI.", href: "/dashboard/maquininhas" },
      { icon: Smartphone, label: "Recargas", href: "/dashboard/recargas" },
      { icon: ArrowUpRight, label: "Transferência", href: "/dashboard/transferencia" },
    ]
  },
  {
    items: [
      { icon: UserCircle, label: "Perfil", href: "/dashboard/conta" },
      { icon: HelpCircle, label: "Ajuda", href: "/dashboard/ajuda" },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const setTemporaryDeviceId = useSetAtom(temporaryDeviceIdAtom);
   const [userName, setUserName] = React.useState("");
   const [balance, setBalance] = React.useState("");
   const [accountInfo, setAccountInfo] = React.useState({ agency: "", account: "" });
   const [isLoadingData, setIsLoadingData] = React.useState(true);
   const setGlobalBalance = useSetAtom(balanceAtom);
   const setGlobalBalanceLoading = useSetAtom(isBalanceLoadingAtom);
   const [user, setUser] = useAtom(userAtom);
   const setIsUserLoading = useSetAtom(isUserLoadingAtom);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/api/users/data");

        if (userRes.data) {
          const u = userRes.data;
          setUser(u);
          setUserName(u.name || u.nome || "Cliente");
          
          const extract = (val: any) => (val && typeof val === 'object' && 'present' in val) 
            ? (val.present ? val.value : "---") 
            : (val || "---");

          setAccountInfo({ 
            agency: extract(u.accountBranch || u.branch || u.agencia), 
            account: extract(u.accountNumber || u.account || u.conta) 
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsUserLoading(false);
      }
    };
    fetchData();
  }, [setUser, setIsUserLoading]);

  React.useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceRes = await api.get("/api/banco/saldo/getSaldo");

        if (balanceRes.data) {
          const valor = balanceRes.data.valor || 0;
          setBalance(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor));
          setGlobalBalance(valor);
        }
        setIsLoadingData(false);
        setGlobalBalanceLoading(false);
      } catch (err) {
        console.error("Error updating balance:", err);
        setIsLoadingData(false);
        setGlobalBalanceLoading(false);
      }
    };
    fetchBalance();
  }, [pathname, setGlobalBalance, setGlobalBalanceLoading]);

  const cleanName = (name: string) => {
    return name.replace(/^\d+(\.\d+)*\s*/, '').split(' ')[0] || "Cliente";
  };

  const SESSION_DURATION = 900; // 15 minutes in seconds
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);

  const handleLogout = React.useCallback(() => {
    setTemporaryDeviceId("");
    localStorage.clear();
    router.push("/");
  }, [router, setTemporaryDeviceId]);

  const refreshSession = React.useCallback(() => {
    const expiresAt = Date.now() + SESSION_DURATION * 1000;
    localStorage.setItem("sessionExpiresAt", expiresAt.toString());
    setTimeLeft(SESSION_DURATION);
  }, []);

  // Initial load and sync
  React.useEffect(() => {
    const expiresAt = localStorage.getItem("sessionExpiresAt");
    if (expiresAt) {
      const remaining = Math.floor((parseInt(expiresAt) - Date.now()) / 1000);
      if (remaining <= 0) {
        toast.error("Sua sessão expirou por inatividade. Por favor, faça login novamente.");
        handleLogout();
      } else {
        setTimeLeft(remaining);
      }
    } else {
      refreshSession();
    }
  }, [handleLogout, refreshSession]);

  // Countdown logic
  React.useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      toast.error("Sua sessão expirou. Para sua segurança, você foi desconectado.");
      handleLogout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft, handleLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const THEME_BG = "bg-[#141210]"; // Slightly lighter than #0c0a09

  return (
    <div className={`flex h-screen ${THEME_BG} text-white overflow-hidden font-sans`}>
      {/* Sidebar */}
      <aside className={`w-72 2xl:w-80 flex flex-col p-6 2xl:p-10 space-y-8 z-20 relative ${THEME_BG} shrink-0`}>
        <div className="px-2 relative z-10">
          <Image src="/logo_g8_official.png" alt="G8Pay" width={180} height={60} className="object-contain 2xl:scale-110" />
        </div>

        <div className="flex flex-col space-y-5 relative z-10 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          {/* User Card with Yellowish Background */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 bg-[#ffaa00]/10 rounded-md border border-[#ffaa00]/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
               <User className="h-10 w-10 text-[#ffaa00]" />
            </div>
            <Avatar className="h-12 w-12 border-2 border-[#ff7711] rounded-md shadow-lg shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
              <AvatarFallback className="bg-neutral-800 text-white font-black uppercase">{cleanName(userName)[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] text-[#ff7711] font-black uppercase tracking-[0.2em] mb-0.5">Status Platinum</span>
              <span className="text-lg font-black text-white leading-tight truncate mb-1.5">{cleanName(userName)}</span>
              
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[8px] text-[#ffaa00]/60 font-black uppercase tracking-widest leading-none mb-1">Banco</span>
                  <span className="text-[10px] font-mono font-black text-white leading-none">065 • G8 BANK</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[#ffaa00]/60 font-black uppercase tracking-widest leading-none mb-1">Ag</span>
                    <span className="text-[10px] font-mono font-black text-white leading-none">{accountInfo.agency}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-[#ffaa00]/60 font-black uppercase tracking-widest leading-none mb-1">C/C</span>
                    <span className="text-[10px] font-mono font-black text-white leading-none">{accountInfo.account}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-4">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.disabled ? "#" : item.href}
                      onClick={(e) => item.disabled && e.preventDefault()}
                      className={`flex items-center gap-5 px-6 py-3 rounded-md transition-all group relative overflow-hidden border border-transparent ${isActive
                        ? "text-white bg-[#ff7711] shadow-lg shadow-orange-600/20"
                        : item.disabled
                          ? "opacity-60 cursor-not-allowed"
                          : "text-white/80 hover:bg-white hover:text-[#ff7711]"
                        }`}
                    >
                      <item.icon className={`h-5 w-5 relative z-10 ${isActive ? "text-white" : item.disabled ? "text-white/40" : "text-white/60 group-hover:text-[#ff7711]"}`} />
                      <div className="flex items-center justify-between flex-1 relative z-10">
                        <span className={`text-[11px] uppercase tracking-[0.15em] font-black ${isActive ? "text-white" : item.disabled ? "text-white/40" : "text-white/80 group-hover:text-[#ff7711] transition-colors duration-300"}`}>{item.label}</span>
                        {item.badge && (
                          <span className={`font-black text-[9px] px-1.5 py-0.5 rounded-sm tracking-tighter ${item.badge === "EM BREVE" ? "bg-[#ffdd00] text-black" : "bg-white/10 text-white"}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {gIdx < menuGroups.length - 1 && <Separator className="bg-white/5 my-4" />}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto relative z-10 pt-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-5 px-5 py-4 w-full text-white/60 hover:bg-white hover:text-[#ff7711] rounded-md transition-all border border-transparent group">
            <LogOut className="h-5 w-5 text-white/60 group-hover:text-[#ff7711]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover:text-[#ff7711]">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className={`h-24 flex items-center justify-between px-10 z-10 shrink-0 ${THEME_BG}`}>
          <div className="flex items-center max-w-[280px] xl:max-w-sm w-full">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#ff7711] transition-colors" />
              <Input 
                placeholder="Pesquisar transações..." 
                className="w-full bg-white/[0.08] border-white/5 pl-12 focus:bg-white/[0.12] focus:border-[#ff7711]/60 rounded-md h-12 transition-all font-black placeholder:text-white/30 text-white text-sm" 
              />
            </div>
          </div>

          <div className="flex items-center gap-8 xl:gap-12">
            {/* Balance Section */}
            <div className="flex flex-col items-end justify-center h-12 border-r border-white/10 pr-8 xl:pr-12">
              <span className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-2 leading-none">Saldo Líquido</span>
              <div className="flex items-center gap-4">
                {isLoadingData ? (
                  <div className="h-6 w-32 bg-white/5 animate-pulse rounded-md" />
                ) : (
                  <span className="text-2xl xl:text-3xl font-black text-white font-mono tracking-tighter">{balance}</span>
                )}
                <button onClick={() => window.location.reload()} className="group/sync">
                   <RotateCw className="h-4 w-4 text-[#ff7711] group-hover/sync:rotate-180 transition-transform duration-700" />
                </button>
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-6 xl:gap-8 relative">
              <div className="hidden lg:flex flex-col items-center gap-1.5 px-4 py-2 bg-[#ffaa00]/10 border border-[#ffaa00]/20 rounded-md shadow-lg">
                 <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-[#ffaa00] animate-pulse" />
                    <span className="text-[9px] font-black text-[#ffaa00] uppercase tracking-widest">Sessão Segura</span>
                 </div>
                 <span className="text-sm font-mono font-black text-white tabular-nums leading-none">
                   {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
                 </span>
              </div>

              <Link href="/dashboard/conta" className="flex items-center gap-4 cursor-pointer group">
                <div className="text-right flex flex-col justify-center hidden sm:flex">
                  <p className="text-base font-black text-white group-hover:text-[#ff7711] transition-colors leading-none truncate max-w-[200px] xl:max-w-[300px]">
                    {cleanName(userName)}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5 leading-none">PLATINUM ELITE</p>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7711] to-[#ffaa00] rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity" />
                  <Avatar className="h-12 w-12 border border-white/5 rounded-md relative z-10 shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                    <AvatarFallback className="bg-[#ff7711] text-white font-black">{cleanName(userName)[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-white relative shadow-inner no-scrollbar">
          <div className="max-w-[1920px] mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
