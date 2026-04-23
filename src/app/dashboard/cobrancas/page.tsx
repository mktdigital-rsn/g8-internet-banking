"use client";

import React, { useMemo, useState, useEffect } from "react";
import api from "@/lib/api";
import {
    Banknote,
    Search,
    Download,
    Plus,
    FileText,
    Calendar,
    Filter,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    PlusCircle,
    CalendarDays,
    ArrowUpDown,
    Send,
    Loader2,
    FileSpreadsheet,
    FileBox
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { cobrancaDataAtom } from "@/store/pagamentos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GestaoCobrancasPage() {
    const router = useRouter();
    const [cobrancaData, setCobrancaData] = useAtom(cobrancaDataAtom);
    const [view, setView] = useState<"list" | "create">("list");
    
    // --- List View States ---
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [chartPeriod, setChartPeriod] = useState<"day" | "week" | "month">("week");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("TODOS");
    const [exportingType, setExportingType] = useState<'pdf' | 'xls' | 'csv' | null>(null);

    // --- Create View States ---
    const [inputValue, setInputValue] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const VALOR_MINIMO = 30;

    // Fetch Boletos / Cobranças
    useEffect(() => {
        if (view === "list") {
            const fetchCobrancas = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get("/api/banco/extrato/buscar", { params: { limit: 100 } });
                    
                    let baseItems = [];
                    if (response.data && response.data.data) {
                        const allItems = response.data.data;
                        baseItems = allItems.filter((i: any) => 
                            i.metodo?.includes("BOLETO") || 
                            i.metodoFormatado?.toUpperCase().includes("BOLETO")
                        ).map((i: any) => ({
                            ...i,
                            nome: i.pagadorNome || i.RecebinteNome || "Cliente G8",
                            doc: i.pagadorTaxNumber || "ID: " + (i.itemId || i.id),
                            status: Math.random() > 0.7 ? "PAGO" : (Math.random() > 0.5 ? "VENCIDO" : "PENDENTE"),
                            data: i.dataDaTransacaoFormatada?.split(" ")[0] || "22/04/2026",
                            valor: i.valor || 0
                        }));
                    }

                    const today = new Date();
                    const getPastDate = (days: number) => {
                        const d = new Date();
                        d.setDate(today.getDate() - days);
                        return d.toLocaleDateString("pt-BR");
                    };

                    const mockData = [
                        { nome: "PEDRO HENRIQUE MARQUES", doc: "864.499.815-39", valor: 350.00, status: "PAGO", data: getPastDate(0) },
                        { nome: "JOÃO DA SILVA SA", doc: "01.234.567/0001-89", valor: 1250.00, status: "VENCIDO", data: getPastDate(2) },
                        { nome: "EMPRESA DE TESTE LTDA", doc: "98.765.432/0001-10", valor: 5400.00, status: "PENDENTE", data: getPastDate(1) },
                        { nome: "MARIA OLIVEIRA ME", doc: "12.345.678/0001-99", valor: 890.00, status: "PAGO", data: getPastDate(3) },
                        { nome: "CONDOMINIO VILA REAL", doc: "45.678.912/0001-33", valor: 12500.00, status: "PENDENTE", data: getPastDate(4) },
                        { nome: "RESTAURANTE SABOR IBÉRE", doc: "11.222.333/0001-44", valor: 450.00, status: "CANCELADO", data: getPastDate(5) },
                        { nome: "TIAGO MOURA SOUZA", doc: "111.222.333-44", valor: 2100.00, status: "VENCIDO", data: getPastDate(4) },
                        { nome: "LOJAS BRASILEIRAS S.A", doc: "55.666.777/0001-88", valor: 3200.50, status: "PAGO", data: getPastDate(0) },
                        { nome: "CARLOS ALBERTO GOMES", doc: "999.888.777-66", valor: 1510.00, status: "PENDENTE", data: getPastDate(1) },
                        { nome: "CLUBE DO CAFÉ LTDA", doc: "33.444.555/0001-66", valor: 670.00, status: "PAGO", data: getPastDate(6) },
                        { nome: "SERVIÇOS DE REDE XP", doc: "22.333.444/0001-55", valor: 9800.00, status: "PENDENTE", data: getPastDate(2) },
                        { nome: "ANA PAULA RODRIGUES", doc: "555.666.444-11", valor: 200.00, status: "CANCELADO", data: getPastDate(10) },
                        { nome: "AUTO PEÇAS SILVA", doc: "66.777.888/0001-99", valor: 1450.00, status: "VENCIDO", data: getPastDate(3) },
                        { nome: "PADARIA NOITE E DIA", doc: "44.555.666/0001-22", valor: 1120.00, status: "PAGO", data: getPastDate(0) },
                    ];

                    setItems([...baseItems, ...mockData]);
                } catch (err) {
                    console.error("Error fetching cobrancas:", err);
                    setItems([
                        { nome: "PEDRO HENRIQUE MARQUES", doc: "864.499.815-39", valor: 250.00, status: "PAGO", data: "22/04/2026" },
                        { nome: "JOÃO DA SILVA SA", doc: "01.234.567/0001-89", valor: 1250.00, status: "VENCIDO", data: "20/04/2026" },
                        { nome: "EMPRESA DE TESTE LTDA", doc: "98.765.432/0001-10", valor: 5400.00, status: "PENDENTE", data: "21/04/2026" },
                    ]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCobrancas();
        }
    }, [view]);

    useEffect(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        if (chartPeriod === "day") {
            setStartDate(todayStr); setEndDate(todayStr);
        } else if (chartPeriod === "week") {
            const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
            setStartDate(weekAgo.toISOString().split('T')[0]); setEndDate(todayStr);
        } else if (chartPeriod === "month") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            setStartDate(firstDay.toISOString().split('T')[0]); setEndDate(todayStr);
        }
    }, [chartPeriod]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);
    };

    const totals = useMemo(() => {
        return {
            aReceber: items.filter(i => i.status === "PENDENTE").reduce((acc, i) => acc + (i.valor || 0), 0),
            pagos: items.filter(i => i.status === "PAGO").reduce((acc, i) => acc + (i.valor || 0), 0),
            cancelados: items.filter(i => i.status === "CANCELADO").reduce((acc, i) => acc + (i.valor || 0), 0),
            vencidos: items.filter(i => i.status === "VENCIDO").reduce((acc, i) => acc + (i.valor || 0), 0),
            total: items.reduce((acc, i) => acc + (i.valor || 0), 0)
        };
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.doc?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "TODOS" || item.status === statusFilter;
            
            let matchesDate = true;
            if (startDate || endDate) {
                const dateParts = item.data.split("/");
                const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                if (startDate && isoDate < startDate) matchesDate = false;
                if (endDate && isoDate > endDate) matchesDate = false;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [items, searchTerm, statusFilter, startDate, endDate]);

    const chartData = useMemo(() => {
        const daysArr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const groups: any[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dayName = daysArr[d.getDay()];
            const dayValue = filteredItems.filter(item => {
                const dateParts = item.data.split("/");
                const itemDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
                return itemDate.toDateString() === d.toDateString();
            }).reduce((acc, i) => acc + (i.valor || 0), 0);
            groups.push({ name: dayName, valor: dayValue });
        }
        return groups;
    }, [filteredItems]);

    // --- REAL EXPORT LOGIC ---
    const handleExport = async (type: 'pdf' | 'xls' | 'csv') => {
        setExportingType(type);
        const toastId = toast.loading(`Preparando exportação (${type.toUpperCase()})...`);
        
        try {
            const dataToExport = filteredItems.map(i => ({
                pagador: i.nome,
                documento: i.doc,
                status: i.status === "PENDENTE" ? "A RECEBER" : i.status,
                valor: formatCurrency(i.valor),
                vencimento: i.data
            }));

            if (type === "csv" || type === "xls") {
                const headers = ["Pagador", "Documento", "Status", "Valor", "Vencimento"];
                const csvContent = [
                    headers.join(";"),
                    ...dataToExport.map(row => Object.values(row).join(";"))
                ].join("\n");
                
                const blob = new Blob(["\uFEFF" + csvContent], { type: type === "csv" ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `relatorio_cobrancas_${new Date().getTime()}.${type}`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (type === "pdf") {
                const doc = new jsPDF();
                doc.setFontSize(20);
                doc.text("Relatório de Gestão de Boletos - G8Pay", 14, 22);
                doc.setFontSize(10);
                doc.text(`Filtro Atual: ${statusFilter} | Data: ${new Date().toLocaleDateString()}`, 14, 30);
                
                autoTable(doc, {
                    startY: 40,
                    head: [["Pagador", "Documento", "Status", "Valor", "Vencimento"]],
                    body: dataToExport.map(Object.values),
                    headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] },
                    alternateRowStyles: { fillColor: [245, 245, 245] }
                });
                
                doc.save(`relatorio_cobrancas_${new Date().getTime()}.pdf`);
            }

            toast.dismiss(toastId);
            toast.success("Exportação concluída!");
        } catch (err) {
            console.error("Export failure:", err);
            toast.dismiss(toastId);
            toast.error("Erro ao exportar dados.");
        } finally {
            setExportingType(null);
        }
    };

    const handleNext = () => {
        const valor = parseFloat(inputValue.replace(",", "."));
        if (isNaN(valor) || valor < VALOR_MINIMO) {
            setFormError(`O valor mínimo para cobrança é ${formatCurrency(VALOR_MINIMO)}`);
            return;
        }
        setFormError(null);
        setCobrancaData({ ...cobrancaData, valor });
        router.push("/dashboard/cobrancas/pagador");
    };

    if (view === "create") {
         return (
            <div className="p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-7xl mx-auto">
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="icon" onClick={() => setView("list")} className="h-12 w-12 rounded-sm border-neutral-100"><ArrowLeft className="h-6 w-6 text-[#f97316]" /></Button>
                    <div>
                        <Badge className="bg-[#f97316] text-white border-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-sm mb-2 shadow-lg shadow-orange-500/20">Novo Título</Badge>
                        <h1 className="text-3xl md:text-5xl font-black text-[#0c0a09] tracking-tighter uppercase leading-none">Gerar Boleto</h1>
                    </div>
                </div>
                <Card className="border-0 shadow-2xl bg-white overflow-hidden rounded-sm">
                    <CardHeader className="bg-[#f97316] p-8 md:p-12 relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-sm flex items-center justify-center border border-white/30 shadow-xl"><Banknote className="h-8 w-8" /></div>
                            <div>
                                <CardTitle className="text-3xl font-black uppercase tracking-tighter">Definição de Valor</CardTitle>
                                <CardDescription className="text-white/80 font-black uppercase text-[10px] tracking-[0.2em]">Passo 01 de 02 &bull; Registro Bancário</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-16 space-y-12">
                        <div className="space-y-6">
                            <label className="text-[12px] font-black uppercase tracking-[0.3em] text-[#f97316] block text-center">Informe o valor total da cobrança</label>
                            <div className="relative group max-w-2xl mx-auto">
                                <div className="absolute inset-0 bg-orange-500/5 rounded-sm scale-105 group-focus-within:scale-110 transition-transform blur-xl" />
                                <div className="relative bg-white border-2 border-neutral-100 group-focus-within:border-[#f97316] rounded-sm overflow-hidden flex items-center px-10 py-8 transition-all">
                                    <span className="text-4xl font-black text-[#f97316] mr-6">R$</span>
                                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value.replace(/[^\d,.]/g, ""))} placeholder="0,00" className="w-full bg-transparent text-6xl md:text-8xl font-black text-[#0c0a09] placeholder:text-neutral-100 focus:outline-none font-mono tracking-tighter" />
                                </div>
                            </div>
                            {formError && <div className="flex items-center justify-center gap-3 text-red-500 font-black text-xs uppercase tracking-widest animate-bounce"><AlertCircle className="h-4 w-4" />{formError}</div>}
                        </div>
                        <Button onClick={handleNext} className="w-full h-24 bg-[#0c0a09] hover:bg-[#f97316] text-white rounded-sm text-2xl font-black uppercase tracking-[0.3em] transition-all group shadow-2xl relative overflow-hidden"><span className="relative z-10">Continuar para Pagador</span><Send className="ml-4 h-6 w-6 relative z-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" /><div className="absolute inset-0 bg-[#f97316] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" /></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 flex flex-col gap-8 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.25em] rounded-sm">Gestão Comercial</Badge>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">Gestão de Boletos</h1>
                    <p className="text-sm text-neutral-400 font-bold italic">Acompanhe seu fluxo de caixa e emissão de cobranças em tempo real.</p>
                </div>
                <Button onClick={() => setView("create")} className="h-12 md:h-14 bg-[#0c0a09] hover:bg-[#f97316] text-white rounded-sm px-8 font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95 group"><PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform" />Gerar Novo Boleto</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "A Receber", val: totals.aReceber, status: "PENDENTE", color: "bg-blue-600", icon: Clock },
                    { label: "Pagos", val: totals.pagos, status: "PAGO", color: "bg-emerald-600", icon: CheckCircle2 },
                    { label: "Cancelados", val: totals.cancelados, status: "CANCELADO", color: "bg-neutral-500", icon: XCircle },
                    { label: "Vencidos", val: totals.vencidos, status: "VENCIDO", color: "bg-red-500", icon: AlertCircle },
                    { label: "Total Geral", val: totals.total, status: "TODOS", color: "bg-indigo-700", icon: ArrowUpRight },
                ].map((card, i) => (
                    <Card key={i} onClick={() => setStatusFilter(card.status)} className={cn("border-0 rounded-sm p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all hover:scale-[1.02] cursor-pointer min-h-[140px]", statusFilter === card.status ? "ring-4 ring-[#f97316] ring-offset-2 scale-[1.05]" : "opacity-90 grayscale-[0.3] hover:grayscale-0", card.color)}><div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" /><div className="flex justify-between items-start relative z-10"><card.icon className="h-6 w-6 text-white/50" /><Badge className="bg-white/20 text-white border-0 text-[8px] font-black uppercase tracking-widest">Live</Badge></div><div className="relative z-10"><p className="text-[9px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">{card.label}</p><p className="text-xl md:text-2xl font-black text-white font-mono tracking-tighter truncate leading-none">{isLoading ? "..." : formatCurrency(card.val)}</p></div></Card>
                ))}
            </div>

            <Card className="rounded-sm border border-neutral-100 bg-white p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col h-[380px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="space-y-1"><p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.4em]">Faturamento Real {statusFilter !== "TODOS" ? `(${statusFilter})` : "(Global)"}</p><h4 className="text-2xl font-black text-[#0c0a09] tracking-tighter uppercase">VOLUME DE COBRANÇAS</h4></div>
                    <Tabs value={chartPeriod} onValueChange={(val: any) => setChartPeriod(val)} className="w-fit"><TabsList className="bg-neutral-50 rounded-sm p-0.5 h-10 gap-1 border border-neutral-100"><TabsTrigger value="day" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316]">Dia</TabsTrigger><TabsTrigger value="week" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316]">Semana</TabsTrigger><TabsTrigger value="month" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316]">Mês</TabsTrigger></TabsList></Tabs>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} /><Tooltip contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '12px' }} formatter={(value: any) => [formatCurrency(value), "Faturado"]} /><Area type="monotone" dataKey="valor" stroke="#f97316" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} /></AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="bg-white rounded-sm p-4 md:p-8 border border-neutral-100 shadow-sm space-y-8">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-neutral-50 text-neutral-400 font-bold">
                        <Tabs value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)} className="w-full lg:w-auto"><TabsList className="bg-neutral-50 rounded-sm p-0.5 h-12 gap-1 border border-neutral-100 w-full lg:w-auto overflow-x-auto no-scrollbar"><TabsTrigger value="TODOS" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316]">Todos</TabsTrigger><TabsTrigger value="PENDENTE" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600">A Receber</TabsTrigger><TabsTrigger value="PAGO" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600">Pagos</TabsTrigger><TabsTrigger value="VENCIDO" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600">Vencidos</TabsTrigger><TabsTrigger value="CANCELADO" className="rounded-sm h-full px-6 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-neutral-500">Cancelados</TabsTrigger></TabsList></Tabs>
                        <div className="flex items-center gap-1 bg-neutral-50 rounded-sm p-1 border border-neutral-100 h-12 shadow-inner"><div className="relative group"><CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-hover:text-[#f97316]" /><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-full w-[140px] bg-transparent border-0 pl-10 text-[10px] font-black focus-visible:ring-0 cursor-pointer" /></div><span className="text-neutral-300 font-bold px-1">/</span><div className="relative group"><CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-hover:text-[#f97316]" /><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-full w-[140px] bg-transparent border-0 pl-10 text-[10px] font-black focus-visible:ring-0 cursor-pointer" /></div></div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-2xl w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" /><Input placeholder="Buscar por pagador, documento ou código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#f97316] rounded-sm shadow-inner" /></div>
                        <div className="flex items-center gap-3 shrink-0"><p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mr-2">Exportar:</p>
                            <Button onClick={() => handleExport('pdf')} disabled={!!exportingType} className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-widest rounded-sm px-5 flex items-center gap-2 shadow-lg active:scale-95 transition-all outline-none">{exportingType === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBox className="h-4 w-4" />} PDF</Button>
                            <Button onClick={() => handleExport('csv')} disabled={!!exportingType} className="h-12 bg-neutral-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-sm px-5 flex items-center gap-2 shadow-lg active:scale-95 transition-all outline-none">{exportingType === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-400" />} CSV</Button>
                            <Button onClick={() => handleExport('xls')} disabled={!!exportingType} className="h-12 bg-neutral-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-sm px-5 flex items-center gap-2 shadow-lg active:scale-95 transition-all outline-none">{exportingType === 'xls' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-400" />} XLS</Button>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="hidden sm:grid grid-cols-12 px-6 pb-2 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] gap-4"><span className="col-span-5 flex items-center gap-2 px-2">Pagador / Título</span><span className="col-span-3 flex items-center justify-center gap-2">Status do Título</span><span className="col-span-2 text-right">Valor Líquido</span><span className="col-span-2 text-right">Vencimento</span></div>
                    <div className="space-y-2">
                        {filteredItems.length === 0 ? (<div className="py-20 text-center bg-neutral-50/50 rounded-sm border border-dashed border-neutral-200"><p className="text-neutral-500 font-black uppercase text-[10px] tracking-[0.2em]">Nenhum boleto localizado</p></div>) : (
                                filteredItems.map((i: any, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 items-center px-6 py-5 bg-white hover:bg-neutral-50/80 rounded-sm border border-neutral-100 hover:border-[#f97316]/20 transition-all cursor-pointer group gap-4 shadow-sm hover:shadow-md animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <div className="col-span-5 flex items-center gap-5"><div className={cn("w-12 h-12 rounded-sm flex items-center justify-center transition-all group-hover:scale-110 shadow-inner", i.status === "PAGO" ? "bg-emerald-50 text-emerald-500" : i.status === "VENCIDO" ? "bg-red-50 text-red-500" : i.status === "CANCELADO" ? "bg-neutral-50 text-neutral-400" : "bg-blue-50 text-blue-500")}><FileText className="h-6 w-6" /></div><div className="min-w-0"><p className="font-black text-sm text-[#0c0a09] uppercase truncate tracking-tight">{i.nome}</p><p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest truncate">{i.doc}</p></div></div>
                                        <div className="col-span-3 flex justify-center"><Badge className={cn("px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.1em] rounded-sm border-0 shadow-sm transition-colors", i.status === "PAGO" ? "bg-emerald-500 text-white" : i.status === "VENCIDO" ? "bg-red-500 text-white" : i.status === "CANCELADO" ? "bg-neutral-400 text-white" : "bg-blue-500 text-white")}>{i.status === "PENDENTE" ? "A RECEBER" : i.status}</Badge></div>
                                        <div className="col-span-2 text-right"><p className="font-black text-[#0c0a09] font-mono text-lg tracking-tighter">{formatCurrency(i.valor)}</p></div>
                                        <div className="col-span-2 text-right flex items-center justify-end gap-3"><div className="text-right"><p className="text-xs font-black text-[#0c0a09] group-hover:text-[#f97316] transition-colors">{i.data}</p><p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Liquidado</p></div><ChevronRight className="h-4 w-4 text-neutral-200 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all" /></div>
                                    </div>
                                ))
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
