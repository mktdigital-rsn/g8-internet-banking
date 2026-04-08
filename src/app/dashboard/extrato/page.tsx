"use client";

import React, { useMemo } from "react";
import axios from "axios";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Download,
    MoreVertical,
    PlusCircle,
    MinusCircle,
    FileText,
    Calendar,
    Filter,
    CreditCard,
    Smartphone,
    ArrowRightLeft,
    AlertCircle,
    Diamond,
    ArrowLeft,
    ChevronRight,
    TrendingUp,
    ShieldAlert,
    Building2,
    Fingerprint,
    CheckCircle2,
    CalendarDays,
    ArrowUpDown
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ExtratoGeralPage() {
    const [items, setItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filter, setFilter] = React.useState("all");
    const [chartPeriod, setChartPeriod] = React.useState<"day" | "week" | "month">("week");
    const [searchTerm, setSearchTerm] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);

    // Default dates: day 1 of month, and today
    React.useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];
        setStartDate(firstDay);
        setEndDate(today);
    }, []);

    React.useEffect(() => {
        const fetchExtrato = async () => {
            try {
                const token = localStorage.getItem("token");
                const userToken = localStorage.getItem("userToken");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

                const response = await axios.get(`${apiUrl}/api/banco/extrato/buscar`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'userToken': userToken || ""
                    }
                });

                if (response.data && Array.isArray(response.data.data)) {
                    setItems(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching extrato:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExtrato();
    }, []);

    const getNatureza = (metodo: string) => {
        switch (metodo) {
            case "TRANSFERENCIA_PIX":
            case "TRANSFERENCIA":
                return "Transferência Bancária";
            case "TRANSFERENCIA_INTERNA":
                return "Transferência entre Contas";
            case "PAGAMENTO_BOLETO":
                return "Pagamento Fornecedores/Consumo";
            case "COMPRA_CREDITO":
                return "Pagamento Fornecedores";
            case "TARIFA":
                return "Tarifa Bancária";
            case "DEVOLUCAO":
                return "Estorno de Valores";
            case "MENSALIDADE_CLUBE_BENEFICIOS":
                return "Mensalidade de Serviços";
            default:
                return "Outras Operações";
        }
    };

    const handleExport = async (format: 'pdf' | 'xls') => {
        try {
            const token = localStorage.getItem("token");
            const userToken = localStorage.getItem("userToken");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

            if (format === 'pdf') {
                const response = await axios.get(`${apiUrl}/api/banco/extrato/exportar-pdf`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'userToken': userToken || ""
                    },
                    responseType: 'blob'
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `extrato_${new Date().toISOString().split('T')[0]}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                const headers = ["Data/Hora", "Identificação", "Tipo", "Método", "Natureza", "Origem", "Destino", "Valor"];
                const header = headers.join("\t") + "\n";

                const rows = filteredItems.map(item => {
                    const natureza = getNatureza(item.metodo);
                    const origem = item.pagadorNome || "";
                    const destino = item.RecebinteNome || "";

                    return [
                        item.dataDaTransacaoFormatada,
                        item.idDoBancoLiquidante || item.itemId || "",
                        item.tipoFormatado,
                        item.metodoFormatado,
                        natureza,
                        origem,
                        destino,
                        item.valorFormatado.replace("R$", "").trim()
                    ].join("\t");
                }).join("\n");

                const blob = new Blob(["\uFEFF", header, rows], { type: 'application/vnd.ms-excel;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `extrato_${new Date().toISOString().split('T')[0]}.xls`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (err) {
            console.error("Error exporting:", err);
            alert("Erro ao exportar arquivo.");
        }
    };

    const handlePrintReceipt = async (id: string, description: string) => {
        if (!id) return;
        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://g8api.bskpay.com.br";

            const response = await axios.get(`${apiUrl}/api/banco/extrato/imprimir-item/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `comprovante_${description.replace(/\s+/g, '_').toLowerCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error printing receipt:", err);
            alert("Erro ao gerar comprovante.");
        }
    };

    const getIconForMetodo = (metodo: string) => {
        switch (metodo) {
            case "TRANSFERENCIA_PIX": return Smartphone;
            case "TRANSFERENCIA": return ArrowRightLeft;
            case "TARIFA": return AlertCircle;
            case "PAGAMENTO": return CreditCard;
            default: return FileText;
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesFilter = filter === "all" ||
                (filter === "in" && item.tipo === "CREDITO") ||
                (filter === "out" && item.tipo === "DEBITO");

            const searchString = `${item.pagadorNome} ${item.RecebinteNome} ${item.metodoFormatado}`.toLowerCase();
            const matchesSearch = searchString.includes(searchTerm.toLowerCase());

            let matchesDate = true;
            if (startDate || endDate) {
                if (!item.dataDaTransacaoFormatada) return false;
                // Detect format: YYYY-MM-DD vs DD-MM-YYYY
                const parts = item.dataDaTransacaoFormatada.split(" ")[0].replace(/\//g, "-").split("-");
                const isoDate = parts[0].length === 4 ? parts.join("-") : parts.reverse().join("-");

                if (startDate && isoDate < startDate) matchesDate = false;
                if (endDate && isoDate > endDate) matchesDate = false;
            }

            return matchesFilter && matchesSearch && matchesDate;
        });
    }, [items, filter, searchTerm, startDate, endDate]);

    const chartData = useMemo(() => {
        const groups: { [key: string]: { name: string, full: string, entries: number, exits: number } } = {};

        [...filteredItems].reverse().forEach(item => {
            if (!item.dataDaTransacaoFormatada) return;
            const parts = item.dataDaTransacaoFormatada.split(" ")[0].replace(/\//g, "-").split("-");
            const isoDate = parts[0].length === 4 ? parts.join("-") : parts.reverse().join("-");
            const date = new Date(isoDate);
            if (isNaN(date.getTime())) return;

            let key = "";
            let label = "";
            let fullLabel = "";

            if (chartPeriod === 'day') {
                const hour = item.dataDaTransacaoFormatada.split(" ")[1].split(":")[0];
                key = hour + "h";
                label = key;
                fullLabel = `Hoje às ${hour}:00`;
            } else if (chartPeriod === 'week') {
                const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                key = days[date.getDay()];
                label = key;
                fullLabel = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
            } else {
                const weekNum = Math.ceil(date.getDate() / 7);
                key = `Sem ${weekNum}`;
                label = key;
                fullLabel = `${weekNum}ª Semana de ${date.toLocaleDateString('pt-BR', { month: 'long' })}`;
            }

            if (!groups[key]) {
                groups[key] = { name: label, full: fullLabel, entries: 0, exits: 0 };
            }
            if (item.tipo === 'CREDITO') groups[key].entries += item.valor;
            else groups[key].exits += item.valor;
        });

        const result = Object.values(groups);
        return result.length > 0 ? result : [];
    }, [filteredItems, chartPeriod]);

    const totals = filteredItems.reduce((acc, item) => {
        if (item.tipo === "CREDITO") acc.in += item.valor;
        else acc.out += item.valor;
        return acc;
    }, { in: 0, out: 0 });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    };

    return (
        <div className="p-6 xl:p-10 flex flex-row gap-8 xl:gap-12 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] relative">
            {/* Receipt Modal Overlay */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
                    <Card className="w-full max-w-lg bg-white rounded-md overflow-hidden shadow-2xl relative border-white/20 animate-in zoom-in-95 duration-300 my-auto">
                        <button
                            onClick={() => setSelectedTransaction(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-50 hover:bg-neutral-100 transition-all z-20 hover:rotate-90"
                        >
                            <ArrowLeft className="h-5 w-5 rotate-180 text-neutral-400" />
                        </button>

                        <div className="relative">
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-neutral-50 to-white" />

                            <div className="p-6 md:p-10 space-y-8 relative z-10">
                                <div className="text-center space-y-3">
                                    <div className="relative inline-block">
                                        <div className="absolute -inset-4 bg-[#f97316]/10 rounded-full blur-xl" />
                                        <div className="w-16 h-16 bg-[#0c0a09] rounded-md flex items-center justify-center text-[#f97316] mx-auto shadow-2xl relative border border-white/5">
                                            <Diamond className="h-8 w-8 fill-[#f97316]/20" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0c0a09] tracking-tighter uppercase leading-none">Comprovante</h2>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.2em]">Autenticação G8 PAY</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center py-2">
                                    <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.3em] mb-2">Valor Total</p>
                                    <p className="text-5xl font-black text-[#f97316] font-mono tracking-tighter">
                                        {selectedTransaction.tipo === 'CREDITO' ? '+' : '-'} {selectedTransaction.valorFormatado}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4 p-5 rounded-md bg-neutral-50/80 border border-neutral-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                                            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Origem / Pagador</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[#0c0a09] truncate text-sm uppercase">{selectedTransaction.pagadorNome || "CLIENTE G8PAY"}</p>
                                            <p className="text-[10px] text-neutral-500 font-mono font-bold opacity-70">
                                                {selectedTransaction.pagadorTaxNumber?.present ? selectedTransaction.pagadorTaxNumber.value : (selectedTransaction.pagadorTaxNumber || "---")}
                                            </p>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-200/50 space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-neutral-400 font-bold">Banco</span>
                                                <span className="font-black text-[#0c0a09] uppercase truncate ml-2 text-right">{selectedTransaction.pagadorInstituicao || "G8 BANK (382)"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                                <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                                    {selectedTransaction.pagadorAgencia || "0001"} &bull; {selectedTransaction.pagadorConta || "0000000-0"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5 rounded-md bg-neutral-50/80 border border-neutral-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                                            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Destino / Recebedor</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[#0c0a09] truncate text-sm uppercase">{selectedTransaction.RecebinteNome || "PAGAMENTO G8PAY"}</p>
                                            <p className="text-[10px] text-neutral-500 font-mono font-bold opacity-70">
                                                {selectedTransaction.RecebinteTaxNumber?.present ? selectedTransaction.RecebinteTaxNumber.value : (selectedTransaction.RecebinteTaxNumber || "---")}
                                            </p>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-200/50 space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-neutral-400 font-bold">Banco</span>
                                                <span className="font-black text-[#0c0a09] uppercase truncate ml-2 text-right">{selectedTransaction.RecebinteInstituicao || "BANCO DESTINO"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                                <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                                    {selectedTransaction.RecebinteAgencia || "---"} &bull; {selectedTransaction.RecebinteConta || "---"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="grid grid-cols-2 gap-12">
                                        <div>
                                            <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest mb-1.5">Metodologia</p>
                                            <Badge className="bg-[#f97316]/5 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-sm">
                                                {selectedTransaction.metodoFormatado}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest mb-1.5">Data Efetiva</p>
                                            <p className="text-xs font-black text-[#0c0a09]">
                                                {selectedTransaction.dataDaTransacaoFormatada.split(" ")[0].split("-").reverse().join("/")} <span className="ml-1 text-neutral-400">{selectedTransaction.dataDaTransacaoFormatada.split(" ")[1]}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-md bg-[#0c0a09] text-white/50 space-y-2 border border-white/5 shadow-2xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Fingerprint className="h-3 w-3 text-[#f97316]" />
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#f97316]">Autenticação Digital G8</p>
                                        </div>
                                        <p className="text-[9px] font-mono font-bold break-all leading-relaxed whitespace-pre-wrap">{selectedTransaction.codigoDeIdentificacao}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        onClick={() => handlePrintReceipt(
                                            selectedTransaction.idDoBancoLiquidante || selectedTransaction.itemId || selectedTransaction.id,
                                            selectedTransaction.tipo === "CREDITO" ? (selectedTransaction.pagadorNome || "Transacao") : (selectedTransaction.RecebinteNome || "Transacao")
                                        )}
                                        className="flex-1 h-14 bg-[#0c0a09] text-white hover:bg-[#f97316] rounded-md font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-black/10 group active:scale-95"
                                    >
                                        <Download className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" /> Gerar Comprovante
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedTransaction(null)}
                                        className="h-14 border-neutral-100 rounded-md font-black uppercase tracking-widest text-[11px] px-8 active:scale-95 text-neutral-400 hover:text-black"
                                    >
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 space-y-12 min-w-0">
                {/* Header Section */}
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.25em] rounded-sm">Fluxo de Caixa</Badge>
                        <h1 className="text-4xl font-black tracking-tighter text-[#0c0a09] leading-none">Minha Movimentação</h1>
                        <p className="text-sm text-neutral-400 font-bold">Consulte e exporte seu histórico bancário detalhado.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => handleExport('pdf')}
                            variant="outline"
                            className="h-11 border-neutral-100 bg-white rounded-sm px-5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 shadow-sm transition-all active:scale-95 text-neutral-400 hover:text-black"
                        >
                            <Download className="h-4 w-4 text-[#f97316]" />
                            Exportar PDF
                        </Button>
                        <Button
                            onClick={() => handleExport('xls')}
                            className="h-11 bg-[#f97316] hover:bg-[#c2410c] text-white rounded-sm px-5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                        >
                            <Download className="h-4 w-4" />
                            Planilha XLS
                        </Button>
                    </div>
                </div>

                {/* Statistics & Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-[#0c0a09] border-0 rounded-md p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden group cursor-pointer transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="w-14 h-14 bg-[#f97316]/10 rounded-md flex items-center justify-center text-[#f97316] border border-white/5 shadow-inner shrink-0 group-hover:rotate-12 transition-transform">
                            <ArrowDownLeft className="h-7 w-7 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em]">Total Entradas</p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">{formatCurrency(totals.in)}</p>
                        </div>
                    </Card>
                    <Card className="bg-[#0c0a09] border-0 rounded-md p-8 flex items-center gap-6 shadow-2xl relative overflow-hidden group cursor-pointer transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="w-14 h-14 bg-[#f97316]/10 rounded-md flex items-center justify-center text-[#f97316] border border-white/5 shadow-inner shrink-0 group-hover:-rotate-12 transition-transform">
                            <ArrowUpRight className="h-7 w-7 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em]">Total Saídas</p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">{formatCurrency(totals.out)}</p>
                        </div>
                    </Card>
                    <Card className="col-span-1 lg:col-span-2 rounded-md border-0 shadow-lg bg-white p-8 space-y-4 relative overflow-hidden border border-neutral-100 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400">Dica de Segurança</h4>
                            <ShieldAlert className="h-4 w-4 text-[#f97316]" />
                        </div>
                        <p className="text-sm font-bold text-[#0c0a09] leading-relaxed italic">&ldquo;Nunca compartilhe sua senha ou código de segurança do G8Pay com terceiros, nem por telefone ou chat.&rdquo;</p>
                        <div className="pt-3 border-t border-neutral-50">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Conexão criptografada SSL/TLS 1.3</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filter & List Area */}
                <div className="bg-white/60 backdrop-blur-md rounded-md p-8 border border-white/40 shadow-xl space-y-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                        <div className="flex items-center gap-4 flex-1">
                            <Tabs defaultValue="all" onValueChange={setFilter} className="w-fit">
                                <TabsList className="bg-neutral-100/50 rounded-md p-1 h-12 gap-1 border border-neutral-200/20">
                                    <TabsTrigger value="all" className="rounded-sm h-full px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#f97316] transition-all">Todas</TabsTrigger>
                                    <TabsTrigger value="in" className="rounded-sm h-full px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-600 transition-all">Entrada</TabsTrigger>
                                    <TabsTrigger value="out" className="rounded-sm h-full px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-500 transition-all">Saída</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-2 bg-neutral-100/50 rounded-md p-1 border border-neutral-200/20">
                                <div className="relative group">
                                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-10 w-[140px] bg-transparent border-0 pl-9 text-[10px] font-black uppercase focus-visible:ring-0 cursor-pointer"
                                    />
                                </div>
                                <span className="text-neutral-300">/</span>
                                <div className="relative group">
                                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-10 w-[140px] bg-transparent border-0 pl-9 text-[10px] font-black uppercase focus-visible:ring-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

       
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-12 px-6 pb-2 text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em] gap-4">
                            <span className="col-span-5 flex items-center gap-2"><FileText className="h-3 w-3" /> Identificação</span>
                            <span className="col-span-3 flex items-center justify-center gap-2 text-center"><ArrowUpDown className="h-3 w-3" /> Natureza / Método</span>
                            <span className="col-span-2 flex items-center justify-end gap-2 text-right"><CreditCard className="h-3 w-3" /> Valor Final</span>
                            <span className="col-span-2 flex items-center justify-end gap-2 text-right"><Calendar className="h-3 w-3" /> Data</span>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="grid grid-cols-12 items-center px-6 py-5 bg-white rounded-md border border-neutral-50 animate-pulse gap-6">
                                        <div className="col-span-5 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-100 rounded-md" />
                                            <div className="space-y-2 flex-1">
                                                <div className="w-48 h-4 bg-neutral-100 rounded-md" />
                                                <div className="w-24 h-3 bg-neutral-50 rounded-md" />
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <div className="w-32 h-8 bg-neutral-100 rounded-md" />
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <div className="w-24 h-6 bg-neutral-100 rounded-md" />
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <div className="w-20 h-6 bg-neutral-100 rounded-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="py-24 text-center bg-white/50 rounded-md border border-dashed border-neutral-200 flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                                    <Search className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-neutral-400 font-black uppercase text-[10px] tracking-widest">Nenhuma movimentação para exibir</p>
                                    <p className="text-neutral-300 text-[9px] font-medium italic">Tente mudar seus filtros ou período de busca.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredItems.map((t, idx) => {
                                    const Icon = getIconForMetodo(t.metodo);
                                    const description = t.tipo === "CREDITO" ? (t.pagadorNome || "Recebimento G8Pay") : (t.RecebinteNome || "Pagamento Efetuado");
                                    const dateParts = t.dataDaTransacaoFormatada.split(" ");

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedTransaction(t)}
                                            className="grid grid-cols-12 items-center px-6 py-5 bg-white hover:bg-neutral-50/50 rounded-md border border-neutral-50 hover:border-neutral-200 hover:shadow-xl transition-all duration-300 group cursor-pointer gap-6"
                                        >
                                            <div className="flex items-center gap-4 col-span-5 min-w-0">
                                                <div className={`w-12 h-12 shrink-0 rounded-md flex items-center justify-center p-3 transition-all ${t.tipo === 'CREDITO' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} group-hover:scale-110`}>
                                                    <Icon className="h-full w-full stroke-[2.5]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-sm text-[#0c0a09] leading-tight mb-1 truncate uppercase font-sans">{description}</p>
                                                    <p className="text-[9px] font-black text-neutral-400 opacity-60 uppercase tracking-widest"># {t.idDoBancoLiquidante?.substring(0, 12) || "TRANSACTION"}</p>
                                                </div>
                                            </div>

                                            <div className="col-span-3 flex flex-col items-center">
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-[0.15em] border-0 px-3 py-1.5 h-7 flex items-center justify-center w-full max-w-[140px] rounded-sm ${t.tipo === 'CREDITO' ? 'text-green-600 bg-green-50/50' : 'text-neutral-400 bg-neutral-100/50'}`}>
                                                    {t.metodoFormatado}
                                                </Badge>
                                            </div>

                                            <div className="col-span-2 text-right">
                                                <p className={`font-black text-lg font-mono tracking-tighter ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                                                </p>
                                            </div>

                                            <div className="col-span-2 text-right flex items-center justify-end gap-3 text-neutral-300 group-hover:text-[#f97316] transition-colors">
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-[#0c0a09] font-mono">{dateParts[0].split("-").reverse().join("/")}</p>
                                                    <p className="text-[9px] font-bold tracking-widest">{dateParts[1]}</p>
                                                </div>
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Support Info Sidebar */}
            <div className="w-[320px] shrink-0 space-y-6 pb-10">
                <Card className="rounded-md border-0 shadow-2xl bg-[#0c0a09] p-8 text-white relative overflow-hidden group cursor-pointer min-h-[280px] border border-white/5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#f97316]/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="w-14 h-14 bg-white/5 rounded-md flex items-center justify-center text-[#f97316] border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-7 w-7" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black leading-tight tracking-tighter text-white">Central de Assistência</h3>
                                <p className="text-xs font-medium text-white/40 leading-relaxed">Precisa de suporte com alguma transação? Acione nosso time de elite agora.</p>
                            </div>
                        </div>
                        <button className="w-full bg-white text-[#0c0a09] hover:bg-[#f97316] hover:text-white transition-all duration-500 rounded-md h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/20">
                            Contatar Agora
                        </button>
                    </div>
                </Card>

                <Card className="rounded-md border border-neutral-100 bg-white p-6 shadow-sm relative overflow-hidden flex flex-col h-[450px] transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-0.5">
                            <p className="text-[8px] text-neutral-400 font-black uppercase tracking-[0.4em]">Fluxo de Caixa</p>
                            <h4 className="text-sm font-black text-[#0c0a09] tracking-tighter uppercase">ANÁLISE DE VOLUMES</h4>
                        </div>
                        <Tabs value={chartPeriod} onValueChange={(val: any) => setChartPeriod(val)} className="w-fit">
                            <TabsList className="bg-neutral-50 rounded-sm p-0.5 h-7 gap-0.5 border border-neutral-100">
                                <TabsTrigger value="day" className="rounded-xs h-full px-2 text-[7px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316] transition-all">Dia</TabsTrigger>
                                <TabsTrigger value="week" className="rounded-xs h-full px-2 text-[7px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316] transition-all">Sem</TabsTrigger>
                                <TabsTrigger value="month" className="rounded-xs h-full px-2 text-[7px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#f97316] transition-all">Mês</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex-1 w-full min-h-0 py-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEntry" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '10px' }}
                                    labelFormatter={(label, payload) => payload[0]?.payload?.full || label}
                                    formatter={(value: any) => [formatCurrency(value), ""]}
                                />
                                <Area type="monotone" dataKey="entries" stroke="#10b981" fillOpacity={1} fill="url(#colorEntry)" strokeWidth={3} activeDot={{ r: 4 }} />
                                <Area type="monotone" dataKey="exits" stroke="#ef4444" fillOpacity={1} fill="url(#colorExit)" strokeWidth={3} activeDot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
