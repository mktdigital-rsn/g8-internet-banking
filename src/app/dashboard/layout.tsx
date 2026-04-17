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
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import api from "@/lib/api";
import { useSetAtom } from "jotai";
import { temporaryDeviceIdAtom, balanceAtom, isBalanceLoadingAtom } from "@/store/auth";

const menuItems: MenuItem[] = [
  { icon: Home, label: "Resumo", href: "/dashboard" },
  { icon: Wallet, label: "Pagamentos", href: "/dashboard/pagamentos" },
  { icon: ArrowUpRight, label: "Transferência", href: "/dashboard/transferencia" },
  { icon: Smartphone, label: "PIX", href: "/dashboard/pix" },
  { icon: Clock, label: "Agendamentos", href: "/dashboard/agendamentos" },
  { icon: FileText, label: "Extrato", href: "/dashboard/extrato" },
  { icon: CreditCard, label: "Cartões", href: "/dashboard/cartoes" },
  { icon: CreditCard, label: "Maquininhas", href: "/dashboard/maquininhas" },
  { icon: Smartphone, label: "Recargas", href: "/dashboard/recargas", disabled: true, badge: "EM BREVE" },
  { icon: UserCircle, label: "Conta", href: "/dashboard/conta" },
  { icon: HelpCircle, label: "Ajuda", href: "/dashboard/ajuda" },
];

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  disabled?: boolean;
  badge?: string;
}

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

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = "https://g8api.bskpay.com.br";

        const userRes = await api.get("/api/users/data");

        if (userRes.data) {
          const u = userRes.data;
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
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const userToken = localStorage.getItem("userToken");
        const apiUrl = "https://g8api.bskpay.com.br";

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
      }
    };
    fetchBalance();
  }, [pathname]);

  const cleanName = (name: string) => {
    return name.replace(/^\d+(\.\d+)*\s*/, '').split(' ')[0] || "Cliente";
  };

  const SESSION_DURATION = 900; // 15 minutes in seconds
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const isFirstMount = React.useRef(true);

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
        handleLogout();
      } else {
        setTimeLeft(remaining);
      }
    } else {
      refreshSession();
    }
  }, [handleLogout, refreshSession]);

  // Reset timer on navigation (but not on initial mount/F5)
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    refreshSession();
  }, [pathname, refreshSession]);

  // Countdown logic
  React.useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
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

  return (
    <div className="flex h-screen bg-[#0c0a09] text-white overflow-hidden font-sans">
      {/* Sidebar - Made background match main theme bg */}
      <aside className="w-72 2xl:w-80 flex flex-col p-6 2xl:p-10 space-y-8 z-20 relative bg-[#0c0a09] shrink-0">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-[#0c0a09] pointer-events-none opacity-50" />
        
        <div className="px-2 relative z-10">
          <Image src="/logo_g8_official.png" alt="G8Pay" width={180} height={60} className="object-contain 2xl:scale-110" />
        </div>

        <div className="flex flex-col space-y-5 relative z-10 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff20 transparent' }}>
          <div className="flex items-center gap-4 p-5 bg-white/[0.04] rounded-md border border-white/5 shadow-2xl">
            <Avatar className="h-14 w-14 border-2 border-[#ff7711]/40 rounded-md">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
              <AvatarFallback className="bg-neutral-800 text-white font-black uppercase">{cleanName(userName)[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-[#f97316] font-black uppercase tracking-[0.2em] mb-1">Status Platinum</span>
              <span className="text-xl font-black text-white leading-tight truncate mb-2">{cleanName(userName)}</span>
              
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">Banco</span>
                  <span className="text-[11px] font-mono font-black text-white/80 leading-none">065 • G8 BANK</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">Ag</span>
                    <span className="text-[11px] font-mono font-black text-white/80 leading-none">{accountInfo.agency}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">C-C</span>
                    <span className="text-[11px] font-mono font-black text-white/80 leading-none">{accountInfo.account}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-1 font-bold">
            {menuItems.map((item) => {
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.disabled ? "#" : item.href}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  className={`flex items-center gap-5 px-6 py-3 rounded-md transition-all group relative overflow-hidden border border-transparent ${isActive
                    ? "text-white bg-[#ff7711] shadow-lg shadow-orange-600/20"
                    : item.disabled
                      ? "opacity-40 cursor-not-allowed grayscale"
                      : "text-white hover:bg-white hover:text-[#f97316]"
                    }`}
                >
                  <item.icon className={`h-5 w-5 relative z-10 ${isActive ? "text-white" : item.disabled ? "text-white/40" : "text-white group-hover:text-[#f97316]"}`} />
                  <div className="flex items-center justify-between flex-1 relative z-10">
                    <span className={`text-xs uppercase tracking-[0.15em] font-black ${isActive ? "text-white" : item.disabled ? "text-white/40" : "text-white group-hover:text-[#f97316] transition-colors duration-300"}`}>{item.label}</span>
                    {item.badge && (
                      <span className="bg-white/10 text-white font-black text-[7px] px-1.5 py-0.5 rounded-sm tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto relative z-10 pt-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-5 px-6 py-5 w-full text-white hover:bg-white hover:text-[#f97316] rounded-md transition-all border border-transparent group">
            <LogOut className="h-5 w-5 text-white group-hover:text-[#f97316]" />
            <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#f97316]">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header - Made background match side background */}
        <header className="h-24 flex items-center justify-between px-10 z-10 shrink-0 bg-[#0c0a09]">
          <div className="flex items-center max-w-[280px] xl:max-w-sm w-full">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 group-focus-within:text-[#f97316] transition-colors" />
              <Input 
                placeholder="Pesquisar transações..." 
                className="w-full bg-white/[0.12] border-white/20 pl-12 focus:bg-white/[0.2] focus:border-[#f97316]/60 rounded-md h-12 transition-all font-black placeholder:text-white/60 text-sm" 
              />
            </div>
          </div>

          <div className="flex items-center gap-8 xl:gap-12">
            {/* Balance Section */}
            <div className="flex flex-col items-end justify-center h-12 border-r border-white/10 pr-8 xl:pr-12">
              <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-2 leading-none">Saldo Líquido</span>
              <div className="flex items-center gap-4">
                {isLoadingData ? (
                  <div className="h-6 w-32 bg-white/5 animate-pulse rounded-md" />
                ) : (
                  <span className="text-2xl xl:text-3xl font-black text-white font-mono tracking-tighter">{balance}</span>
                )}
                <button onClick={() => window.location.reload()} className="group/sync">
                   <RotateCw className="h-4 w-4 text-[#f97316] group-hover/sync:rotate-180 transition-transform duration-700" />
                </button>
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-6 xl:gap-8 relative">
              <div className="hidden lg:flex flex-col items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-md">
                 <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-[#f97316] animate-pulse" />
                    <span className="text-[9px] font-black text-[#f97316] uppercase tracking-widest">Sessão Segura</span>
                 </div>
                 <span className="text-xs font-mono font-black text-white tabular-nums leading-none">
                   {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
                 </span>
              </div>

              <Link href="/dashboard/conta" className="flex items-center gap-4 cursor-pointer group">
                <div className="text-right flex flex-col justify-center hidden sm:flex">
                  <p className="text-base font-black text-white group-hover:text-[#f97316] transition-colors leading-none truncate max-w-[200px] xl:max-w-[300px]">
                    {cleanName(userName)}
                  </p>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1.5 leading-none">PLATINUM ELITE</p>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#f97316] to-orange-500 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity" />
                  <Avatar className="h-12 w-12 border border-white/10 rounded-md relative z-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                    <AvatarFallback className="bg-[#f97316] text-white font-black">{cleanName(userName)[0]}</AvatarFallback>
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
