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
  RotateCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Resumo", href: "/dashboard" },
  { icon: Wallet, label: "Pagamentos", href: "/dashboard/pagamentos" },
  { icon: ArrowUpRight, label: "Transferência", href: "/dashboard/transferencia" },
  { icon: Smartphone, label: "PIX", href: "/dashboard/pix" },
  { icon: FileText, label: "Extrato", href: "/dashboard/extrato" },
  { icon: UserCircle, label: "Conta", href: "/dashboard/conta" },
  { icon: HelpCircle, label: "Ajuda", href: "/dashboard/ajuda" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const [userName, setUserName] = React.useState("");
   const [balance, setBalance] = React.useState("");
   const [accountInfo, setAccountInfo] = React.useState({ agency: "", account: "" });
   const [isLoadingData, setIsLoadingData] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = "https://g8api.bskpay.com.br";

        const userRes = await axios.get(`${apiUrl}/api/users/data`, {
          headers: { Authorization: `Bearer ${token}` }
        });

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

        const balanceRes = await axios.get(`${apiUrl}/api/banco/saldo/getSaldo`, {
          headers: { Authorization: `Bearer ${token}`, 'userToken': userToken || "" }
        });

        if (balanceRes.data) {
          setBalance(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balanceRes.data.valor || 0));
        }
        setIsLoadingData(false);
      } catch (err) {
        console.error("Error updating balance:", err);
      }
    };
    fetchBalance();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const cleanName = (name: string) => {
    return name.replace(/^\d+(\.\d+)*\s*/, '').split(' ')[0] || "Cliente";
  };

  return (
    <div className="flex h-screen bg-[#0c0a09] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 2xl:w-80 flex flex-col p-6 2xl:p-10 space-y-8 z-20 relative bg-[#09090b] border-r border-white/5 shrink-0">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#f97316]/10 to-transparent pointer-events-none opacity-50" />
        
        <div className="px-2 relative z-10">
          <Image src="/logo_g8_official.png" alt="G8Pay" width={180} height={60} className="object-contain 2xl:scale-110" />
        </div>

        <div className="flex flex-col space-y-6 relative z-10 flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-4 p-5 bg-white/[0.04] rounded-md border border-white/5 shadow-2xl">
            <Avatar className="h-14 w-14 border-2 border-[#ff7711]/40 rounded-md">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
              <AvatarFallback className="bg-neutral-800 text-white font-black uppercase">{cleanName(userName)[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">Status Platinum</span>
              <span className="text-xl font-black text-white leading-tight truncate">{cleanName(userName)}</span>
            </div>
          </div>

          <nav className="space-y-2 font-bold">
            {menuItems.map((item) => {
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  className={`flex items-center gap-5 px-6 py-4 rounded-md transition-all group relative overflow-hidden border border-transparent ${isActive
                    ? "text-white bg-[#ff7711] shadow-lg shadow-orange-600/20"
                    : "text-white hover:bg-white hover:text-[#f97316]"
                    }`}
                >
                  <item.icon className={`h-5 w-5 relative z-10 ${isActive ? "text-white" : "text-white group-hover:text-[#f97316]"}`} />
                  <span className={`text-xs uppercase tracking-[0.15em] font-black relative z-10 ${isActive ? "text-white" : "text-white group-hover:text-[#f97316] transition-colors duration-300"}`}>{item.label}</span>
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
        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-10 z-10 shrink-0 border-b border-white/5 bg-[#09090b]">
          <div className="flex items-center max-w-sm w-full">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#f97316] transition-colors" />
              <Input 
                placeholder="Pesquisar transações..." 
                className="w-full bg-white/[0.03] border-white/5 pl-12 focus:bg-white/[0.06] focus:border-[#f97316]/30 rounded-md h-12 transition-all font-bold placeholder:text-white/20 text-sm" 
              />
            </div>
          </div>

          <div className="flex items-center gap-10 xl:gap-16">
            {/* Account Info Section */}
            <div className="hidden lg:flex flex-col items-center justify-center h-12 border-r border-white/5 pr-10 xl:pr-16">
               <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2 leading-none">Resumo da Conta</span>
               <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                     <span className="text-[7px] text-[#f97316] font-black uppercase tracking-tighter mb-0.5">AGÊNCIA</span>
                     <span className="text-sm font-mono font-black text-white leading-none tracking-wider">{accountInfo.agency}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                     <span className="text-[7px] text-[#f97316] font-black uppercase tracking-tighter mb-0.5">CONTA</span>
                     <span className="text-sm font-mono font-black text-white leading-none tracking-wider">{accountInfo.account}</span>
                  </div>
               </div>
            </div>

            {/* Balance Section */}
            <div className="flex flex-col items-end justify-center h-12 border-r border-white/5 pr-10 xl:pr-16">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2 leading-none">Saldo Líquido</span>
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
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-white relative shadow-inner border-l border-white/5 no-scrollbar">
          <div className="max-w-[1920px] mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
