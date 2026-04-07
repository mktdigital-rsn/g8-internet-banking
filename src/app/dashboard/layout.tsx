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

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const menuItems = [
  { icon: Home, label: "Resumo", href: "/dashboard" },
  { icon: Wallet, label: "Pagamentos", href: "#", badge: "2" },
  { icon: ArrowUpRight, label: "Transferência", href: "/dashboard/transferencia" },
  { icon: Smartphone, label: "PIX", href: "/dashboard/pix" },
  { icon: FileText, label: "Extrato", href: "/dashboard/extrato" },
  { icon: Users, label: "Referrals", href: "#" },
  { icon: UserCircle, label: "Conta", href: "#" },
  { icon: HelpCircle, label: "Ajuda", href: "#" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = React.useState("Carregando...");
  const [balance, setBalance] = React.useState("R$ 0,00");
  const [accountInfo, setAccountInfo] = React.useState({ agency: "---", account: "---" });

  React.useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem("userName");
    if (savedName) setUserName(savedName);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userToken = localStorage.getItem("userToken");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

        // Buscamos em paralelo os dados cadastrais e o saldo real
        const [userRes, balanceRes] = await Promise.all([
          axios.get(`${apiUrl}/api/users/data`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/api/banco/saldo/getSaldo`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'userToken': userToken || ""
            }
          }).catch(err => {
            console.error("Erro ao buscar saldo:", err);
            return { data: { valor: 0 } };
          })
        ]);

        if (userRes.data) {
          const u = userRes.data;
          setUserName(u.name || u.nome || "Cliente");
          localStorage.setItem("userName", u.name || u.nome || "Cliente");
          
          // Robust extraction for Optional fields (present/value)
          const extract = (val: any) => (val && typeof val === 'object' && 'present' in val) 
            ? (val.present ? val.value : "---") 
            : (val || "---");

          const agency = extract(u.accountBranch || u.branch || u.agencia);
          const account = extract(u.accountNumber || u.account || u.conta);
          
          setAccountInfo({ agency, account });
        }

        if (balanceRes.data) {
          setBalance(new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(balanceRes.data.valor || 0));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

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
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Boa tarde,</span>
              <span className="text-sm font-black text-white leading-tight truncate">
                {userName}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-black text-primary font-mono">{balance}</span>
                <Eye className="h-3 w-3 text-muted-foreground/50" />
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
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${isActive
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-muted-foreground hover:text-[#ff4444] transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center max-w-xs xl:max-w-md w-full">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Procurar transações, serviços..."
                className="w-[90%] bg-white/5 border-white/10 pl-10 focus:bg-white/10 focus:ring-1 focus:ring-primary/50 rounded-full h-11 transition-all placeholder:text-muted-foreground/50 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 xl:gap-8">
            <div className="hidden lg:flex items-center gap-6 xl:gap-10 mr-2">
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-70">Conta Corrente</span>
                <span className="text-[11px] font-mono font-black text-white/90 tracking-tighter">AG: {accountInfo.agency}  &bull;  C: {accountInfo.account}</span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-70">Disponível</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-primary font-mono tracking-tight">{balance}</span>
                  <RotateCw className="h-3 w-3 text-muted-foreground/30 hover:text-primary cursor-pointer transition-colors" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 p-1.5 rounded-full pr-4 cursor-pointer hover:bg-neutral-800 transition-colors shrink-0">
              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-black">
                PT
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">PT-BR</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>

            <div className="relative cursor-pointer group">
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#0c0a09]" />
            </div>

            <Separator orientation="vertical" className="h-8 bg-white/10" />

            <div className="flex items-center gap-3 cursor-pointer group shrink-0">
              <div className="text-right flex flex-col justify-center hidden sm:flex">
                <p className="text-xs font-black group-hover:text-primary transition-colors leading-none whitespace-nowrap">{userName}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Cliente Platinum</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white/5 group-hover:border-primary/50 transition-all shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                <AvatarFallback className="bg-primary text-white font-black">{userName?.[0]}</AvatarFallback>
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
