"use client";

import React, { useState, useMemo, useEffect } from "react";
import { currentBrand } from "@/config/brand";
import {
    FileText,
    ArrowRightLeft,
    CreditCard,
    Smartphone,
    ChevronRight,
    PieChart as PieIcon,
    Banknote,
    BadgeCheck,
    Download,
    ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from "recharts";

const COLORS = ["var(--brand-accent)", "#3b82f6", "#10b981", "#ef4444", "#a855f7"];

export default function ComprovantesPage() {
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchExtrato = async () => {
            try {
                const response = await api.get("/api/banco/extrato/buscar");
                if (response.data) {
                    const rawItems = response.data.data || response.data.transacoes || [];
                    setItems(Array.isArray(rawItems) ? rawItems : []);
                }
            } catch (err) {
                console.error("Error fetching extrato for chart:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExtrato();
    }, []);

    const chartData = useMemo(() => {
        const distribution: { [key: string]: number } = {
            "PIX": 0,
            "BOLETO": 0,
            "TED/DOC": 0,
            "INTERNA": 0,
            "TARIFA": 0
        };

        items.forEach(item => {
            const m = item.metodoFormatado?.toUpperCase() || "";
            const val = Math.abs(item.valor || 0);

            if (m.includes("PIX")) distribution["PIX"] += val;
            else if (m.includes("BOLETO") || m.includes("PAGAMENTO")) distribution["BOLETO"] += val;
            else if (m.includes("TED") || m.includes("TRANSFERENCIA")) {
                if (item.metodo === "TRANSFERENCIA_INTERNA") distribution["INTERNA"] += val;
                else distribution["TED/DOC"] += val;
            }
            else if (m.includes("TARIFA")) distribution["TARIFA"] += val;
        });

        return Object.entries(distribution)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [items]);

    const categories: {
        id: string;
        title: string;
        description: string;
        icon: any;
        tone: string;
        badge?: string;
        submenus: { id: string; label: string; href?: string; badge?: string; disabled?: boolean }[];
    }[] = [
            {
                id: "transferencias",
                title: "Transferências",
                description: "Comprovantes de envios entre contas e bancos.",
                icon: ArrowRightLeft,
                tone: "text-orange-600 bg-orange-50 border-orange-100",
                submenus: [
                    { id: "interna", label: `Contas ${currentBrand.shortName}`, href: "/dashboard/comprovantes/interna" },
                    { id: "ted", label: "Outros bancos", badge: "Em breve", disabled: true }
                ]
            },
            {
                id: "pagamentos",
                title: "Pagamentos",
                description: "Boletos, títulos, convênios e contas pagas.",
                icon: CreditCard,
                tone: "text-blue-600 bg-blue-50 border-blue-100",
                submenus: [
                    { id: "boleto", label: "Boleto de cobrança", href: "/dashboard/comprovantes/boleto" },
                    { id: "consumo", label: "Água, Luz, Telefone e Gás", badge: "Em breve", disabled: true },
                    { id: "veiculos", label: "Débito de Veículos", badge: "Em breve", disabled: true }
                ]
            },
            {
                id: "recargas",
                title: "Recargas",
                description: "Histórico de recargas realizadas na conta.",
                icon: Smartphone,
                tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
                badge: "Em breve",
                submenus: [
                    { id: "celular", label: "Recarga de Celular", badge: "Em breve", disabled: true }
                ]
            },
            {
                id: "pix",
                title: "Pix",
                description: "Envios e recebimentos Pix em um extrato filtrado.",
                icon: Smartphone,
                tone: "text-[#32BCAD] bg-[#32BCAD]/10 border-[#32BCAD]/20",
                submenus: [
                    { id: "pix_all", label: "Extrato Pix completo", href: "/dashboard/pix/extrato?title=Comprovantes PIX" }
                ]
            }
        ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    };

    const totalMovimentado = items.reduce((acc, i) => acc + Math.abs(i.valor || 0), 0);
    const canaisDisponiveis = categories.reduce((acc, cat) => acc + cat.submenus.filter(sub => !sub.disabled).length, 0);

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 xl:p-10 overflow-y-auto no-scrollbar">
            <div className="max-w-[1440px] mx-auto space-y-8 pb-16">

                {/* Header */}
                <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <Badge className="bg-orange-600/10 text-orange-600 border-0 text-[10px] font-black tracking-[0.22em] uppercase px-3 py-1 mb-2">Central de Documentos</Badge>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-[#0c0a09]">
                            ÁREA DE <span className="text-orange-600">COMPROVANTES</span>
                        </h1>
                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-3 max-w-3xl">Escolha o tipo de comprovante e acesse os documentos para consultar, baixar ou compartilhar.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[420px]">
                        <div className="rounded-[5px] border border-neutral-100 bg-white p-4 shadow-sm">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Total Movimentado</span>
                            <p className="mt-1 text-xl font-black text-[#0c0a09] font-mono leading-none">{formatCurrency(totalMovimentado)}</p>
                        </div>
                        <div className="rounded-[5px] border border-neutral-100 bg-white p-4 shadow-sm">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Canais Ativos</span>
                            <p className="mt-1 text-xl font-black text-[#0c0a09] leading-none">{canaisDisponiveis}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 xl:gap-8">

                    {/* Left: Category Cards */}
                    <div className="2xl:col-span-8 space-y-4 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.35em]">Tipos de comprovante</p>
                                <h2 className="text-xl font-black text-[#0c0a09] tracking-tighter uppercase">Acesso rápido</h2>
                            </div>
                            <Badge className="hidden sm:inline-flex bg-white text-neutral-500 border border-neutral-100 text-[9px] font-black uppercase tracking-widest rounded-[5px] px-3 py-1">
                                {categories.length} categorias
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 min-[876px]:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                                <Card
                                    key={cat.id}
                                    className={`group relative min-w-0 rounded-[5px] bg-white border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg max-[875px]:flex max-[875px]:flex-col max-[875px]:items-center max-[875px]:text-center ${expandedCategory === cat.id ? 'border-orange-200 ring-2 ring-orange-500/10' : 'border-neutral-100'}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                        className="flex w-full items-start gap-4 text-left max-[875px]:flex-col max-[875px]:items-center max-[875px]:text-center"
                                    >
                                        <div className={`h-12 w-12 shrink-0 rounded-[5px] border flex items-center justify-center ${cat.tone}`}>
                                            <cat.icon size={23} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 max-[875px]:justify-center">
                                                <h3 className="text-base font-black tracking-tight text-[#0c0a09] uppercase">{cat.title}</h3>
                                                {cat.badge && <Badge className="bg-amber-100 text-amber-600 border-amber-200 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">{cat.badge}</Badge>}
                                            </div>
                                            <p className="mt-1 text-xs font-semibold text-neutral-500 leading-relaxed">{cat.description}</p>
                                            <p className="mt-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                                                {cat.submenus.filter(sub => !sub.disabled).length} de {cat.submenus.length} canais ativos
                                            </p>
                                        </div>
                                        <ChevronRight size={18} className={`mt-1 shrink-0 text-neutral-300 transition-transform group-hover:text-orange-500 max-[875px]:absolute max-[875px]:right-5 max-[875px]:top-5 ${expandedCategory === cat.id ? 'rotate-90 text-orange-500' : ''}`} />
                                    </button>

                                    <div className="mt-5 grid w-full gap-2">
                                        {cat.submenus.map(sub => (
                                            <button
                                                key={sub.id}
                                                disabled={sub.disabled}
                                                onClick={() => sub.href && router.push(sub.href)}
                                                className={`flex min-h-12 items-center justify-between rounded-[5px] border px-4 py-3 text-left transition-all ${sub.disabled ? 'cursor-not-allowed border-neutral-100 bg-neutral-50/60 text-neutral-300' : 'border-neutral-100 bg-neutral-50/50 text-[#0c0a09] hover:border-orange-200 hover:bg-orange-50/40 active:scale-[0.99]'}`}
                                            >
                                                <span className="flex items-center gap-3 min-w-0 overflow-hidden">
                                                    <FileText size={16} className={sub.disabled ? "text-neutral-300" : "text-orange-500"} />
                                                    <span className="truncate text-[11px] font-black uppercase tracking-widest">{sub.label}</span>
                                                </span>
                                                {sub.badge ? (
                                                    <Badge className="ml-3 shrink-0 bg-amber-100 text-amber-600 border-amber-200 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm whitespace-nowrap">{sub.badge}</Badge>
                                                ) : (
                                                    <ChevronRight size={15} className="ml-3 shrink-0 text-neutral-300" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                        ))}
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="2xl:col-span-4 flex min-w-0">
                        <Card className="bg-white border border-neutral-100 rounded-[5px] p-6 space-y-6 shadow-sm flex-1 flex flex-col">
                            <div className="flex items-center justify-between shrink-0">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.3em]">Visão Geral</p>
                                    <h4 className="text-lg font-black text-[#0c0a09] tracking-tight uppercase">Movimentação por método</h4>
                                </div>
                                <div className="w-10 h-10 bg-orange-50 rounded-[5px] flex items-center justify-center text-orange-600">
                                    <PieIcon size={20} />
                                </div>
                            </div>

                            <div className="flex-1 min-h-[260px] 2xl:min-h-[270px] w-full flex flex-col justify-center">
                                {isLoading ? (
                                    <div className="h-full w-full flex items-center justify-center bg-neutral-50 rounded-md animate-pulse">
                                        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={58}
                                                outerRadius={84}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }}
                                                formatter={(value: any) => formatCurrency(value)}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '40px', fontSize: '10px', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-neutral-300 space-y-4">
                                        <PieIcon size={48} className="opacity-10" />
                                        <p className="text-xs font-black uppercase tracking-widest">Sem dados para o período</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="2xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-[#0c0a09] border-0 rounded-[5px] p-6 text-white relative overflow-hidden md:col-span-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <BadgeCheck className="text-orange-500" size={20} />
                                    <h5 className="font-black uppercase tracking-widest text-[11px]">Autenticação {currentBrand.shortName}</h5>
                                </div>
                                <p className="text-xl font-black tracking-tight leading-tight">Documentos com <span className="text-orange-500">valor jurídico</span> e integridade garantida.</p>
                            </div>
                        </Card>
                        <Card className="bg-white border border-neutral-100 rounded-[5px] p-6 flex items-center gap-4">
                            <div className="h-11 w-11 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck size={21} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Tempo de Guarda</p>
                                <p className="text-lg font-black text-[#0c0a09] uppercase leading-none">Ilimitado</p>
                            </div>
                        </Card>
                        <Card className="bg-white border border-neutral-100 rounded-[5px] p-6 flex items-center gap-4">
                            <div className="h-11 w-11 rounded-[5px] bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Download size={21} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Exportação</p>
                                <p className="text-lg font-black text-[#0c0a09] uppercase leading-none">PDF, CSV e XLS</p>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
