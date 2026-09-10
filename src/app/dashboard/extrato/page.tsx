"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentBrand } from "@/config/brand";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowLeft,
    ArrowRightLeft,
    ArrowUpDown,
    ArrowUpRight,
    Building2,
    Calendar,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Diamond,
    Download,
    FileText,
    Fingerprint,
    Phone,
    Search
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { toast } from "sonner";

const PixIcon = (props: any) => (
    <svg {...props} viewBox="0 0 100 100" fill="currentColor">
        <rect x="35" y="5" width="30" height="30" rx="6" transform="rotate(45 50 20)" />
        <rect x="35" y="65" width="30" height="30" rx="6" transform="rotate(45 50 80)" />
        <rect x="5" y="35" width="30" height="30" rx="6" transform="rotate(45 20 50)" />
        <rect x="65" y="35" width="30" height="30" rx="6" transform="rotate(45 80 50)" />
    </svg>
);

type ExtratoItem = {
    dataDaTransacaoFormatada?: string;
    dataDaTransacao?: string;
    dataTransacao?: string;
    data_transacao?: string;
    data?: string;
    date?: string;
    transactionDate?: string;
    createdAt?: string;
    created_at?: string;
};

const parseTransactionDate = (item: ExtratoItem) => {
    const rawDate =
        item?.dataDaTransacaoFormatada ??
        item?.dataDaTransacao ??
        item?.dataTransacao ??
        item?.data_transacao ??
        item?.data ??
        item?.date ??
        item?.transactionDate ??
        item?.createdAt ??
        item?.created_at;

    if (!rawDate) return null;

    const value = String(rawDate).trim();

    const isoMatch = value.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (isoMatch) {
        return new Date(
            Number(isoMatch[1]),
            Number(isoMatch[2]) - 1,
            Number(isoMatch[3]),
            Number(isoMatch[4] || 0),
            Number(isoMatch[5] || 0),
            Number(isoMatch[6] || 0)
        );
    }

    const brMatch = value.match(/^(\d{2})[-/](\d{2})[-/](\d{4})(?:[,T\s]+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (brMatch) {
        return new Date(
            Number(brMatch[3]),
            Number(brMatch[2]) - 1,
            Number(brMatch[1]),
            Number(brMatch[4] || 0),
            Number(brMatch[5] || 0),
            Number(brMatch[6] || 0)
        );
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatTransactionDate = (item: ExtratoItem) => {
    const parsedDate = parseTransactionDate(item);

    if (!parsedDate) {
        return {
            date: "--/--/----",
            time: "--:--",
        };
    }

    return {
        date: parsedDate.toLocaleDateString("pt-BR"),
        time: parsedDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };
};

export default function ExtratoGeralPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exportingType, setExportingType] = useState<'pdf' | 'xls' | 'csv' | null>(null);
    const [filter, setFilter] = React.useState("all");
    const [methodFilter, setMethodFilter] = React.useState("all");
    const [chartPeriod, setChartPeriod] = React.useState<"day" | "week" | "month">("week");
    const [searchTerm, setSearchTerm] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        const updateDates = () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            if (chartPeriod === "day") {
                setStartDate(todayStr);
                setEndDate(todayStr);
            } else if (chartPeriod === "week") {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(todayStr);
            } else if (chartPeriod === "month") {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                setStartDate(firstDay.toISOString().split('T')[0]);
                setEndDate(todayStr);
            }
        };
        updateDates();
    }, [chartPeriod]);

    useEffect(() => {
        const fetchExtrato = async () => {
            const controller = new AbortController();
            setIsLoading(true);
            try {
                console.log("🚀 [EXTRATO] Iniciando busca...");

                // Passar datas se disponíveis para o backend tentar filtrar por lá
                const response = await api.get("/api/banco/extrato/buscar", {
                    params: {
                        data_inicio: startDate,
                        data_fim: endDate,
                        limit: 100 // Tentar limitar a 100 itens pra ser mais rápido
                    },
                    signal: controller.signal
                });

                if (response.data && (response.data.data || response.data.transacoes)) {
                    const rawItems = response.data.data || response.data.transacoes || [];
                    setItems(Array.isArray(rawItems) ? rawItems : []);
                }
            } catch (err: any) {
                if (err.name === 'CanceledError') return;
                console.error("Error fetching extrato:", err);
                toast.error("O banco demorou a responder o extrato. Tente recarregar.");
            } finally {
                setIsLoading(false);
            }

            return () => controller.abort();
        };

        fetchExtrato();
    }, [startDate, endDate]); // Recarregar se as datas mudarem no filtro principal

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
            case "SERVICOS_DIGITAIS":
                return "Serviços Digitais/Recarga";
            default:
                return "Outras Operações";
        }
    };

    const handleExport = async (format: 'pdf' | 'xls' | 'csv') => {
        setExportingType(format);
        try {
            if (format === 'pdf') {
                const doc = new jsPDF();

                // --- HEADER SECTION ---
                try {
                    doc.addImage("/logo_g8_boleto.png", "PNG", 14, 10, 32, 10);
                } catch (e) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(20);
                    doc.setTextColor(12, 10, 9);
                    doc.text(currentBrand.name.toUpperCase(), 14, 20);
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.setTextColor(12, 10, 9);
                const reportTitle = "Extrato Analítico";
                const titleWidth = doc.getTextWidth(reportTitle);
                const pageWidth = doc.internal.pageSize.getWidth();
                doc.text(reportTitle, (pageWidth - titleWidth) / 2, 20);

                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
                doc.text(`Período: ${startDate || 'Início'} até ${endDate || 'Hoje'}`, 14, 33);

                doc.setDrawColor(241, 245, 249);
                doc.line(14, 38, pageWidth - 14, 38);

                // --- TABLE SECTION ---
                const tableHeaders = [["Data/Hora", "Identificação", "Método", "Natureza", "Origem", "Destino", "Valor"]];
                const tableBody = filteredItems.map((item: any) => [
                    item.dataDaTransacaoFormatada,
                    item.idDoBancoLiquidante || item.id || "REF",
                    item.metodoFormatado,
                    getNatureza(item.metodo),
                    item.pagadorNome || `CLIENTE ${currentBrand.shortName}`,
                    item.RecebinteNome || `PAGAMENTO ${currentBrand.shortName}`,
                    `${item.tipo === 'CREDITO' ? '+' : '-'} ${item.valorFormatado}`
                ]);

                autoTable(doc, {
                    startY: 45,
                    head: tableHeaders,
                    body: tableBody,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [12, 10, 9],
                        fontSize: 8,
                        fontStyle: 'bold',
                        lineWidth: 0.1,
                        lineColor: [200, 200, 200]
                    },
                    bodyStyles: {
                        fontSize: 7,
                        textColor: [50, 50, 50],
                        lineWidth: 0.1,
                        lineColor: [230, 230, 230]
                    },
                    alternateRowStyles: {
                        fillColor: [252, 252, 252]
                    },
                    columnStyles: {
                        6: { halign: 'right', fontStyle: 'bold' }
                    },
                    margin: { left: 14, right: 14 }
                });

                const totalPages = (doc as any).internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(`Página ${i} de ${totalPages} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
                }

                doc.save(`extrato_${startDate || 'inicial'}.pdf`);
            } else if (format === 'xls') {
                const headers = ["Data/Hora", "Identificação", "Tipo", "Método", "Natureza", "Origem", "Destino", "Valor"];
                let html = `
                    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                    <head><meta charset="utf-8" /><style>table { border-collapse: collapse; } td { border: 1px solid #ccc; }</style></head>
                    <body><table>
                        <tr>${headers.map(h => `<th style="background: var(--brand-accent); color: white;">${h}</th>`).join('')}</tr>
                `;

                filteredItems.forEach((item: any) => {
                    const natureza = getNatureza(item.metodo);
                    const row = [
                        item.dataDaTransacaoFormatada,
                        item.idDoBancoLiquidante || item.itemId || "",
                        item.tipoFormatado,
                        item.metodoFormatado,
                        natureza,
                        item.pagadorNome || "",
                        item.RecebinteNome || "",
                        item.valorFormatado
                    ];
                    html += `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
                });

                html += `</table></body></html>`;

                const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `extrato_${startDate || 'inicial'}.xls`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const headers = ["Data/Hora", "Identificação", "Tipo", "Método", "Natureza", "Origem", "Destino", "Valor"];
                const header = "sep=;\n" + headers.join(";") + "\n";

                const rows = filteredItems.map((item: any) => {
                    const natureza = getNatureza(item.metodo);
                    return [
                        item.dataDaTransacaoFormatada,
                        item.idDoBancoLiquidante || item.itemId || "",
                        item.tipoFormatado,
                        item.metodoFormatado,
                        natureza,
                        item.pagadorNome || "",
                        item.RecebinteNome || "",
                        item.valorFormatado.replace("R$", "").trim().replace(".", ",")
                    ].join(";");
                }).join("\n");

                const blob = new Blob(["\uFEFF", header, rows], { type: 'text/csv;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `extrato_${startDate || 'inicial'}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error("Error exporting:", err);
            toast.error("Erro ao exportar arquivo.");
        } finally {
            setExportingType(null);
        }
    };

    const handlePrintReceipt = async (id: string, description: string) => {
        if (!id) return;
        try {
            const response = await api.get(`/api/banco/extrato/imprimir-item/${id}`, {
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

    const getIconForMetodo = (metodo: string): any => {
        switch (metodo) {
            case "TRANSFERENCIA_PIX": return PixIcon;
            case "TRANSFERENCIA":
            case "TRANSFERENCIA_INTERNA": return ArrowRightLeft;
            case "TARIFA":
            case "MENSALIDADE_CLUBE_BENEFICIOS": return AlertCircle;
            case "PAGAMENTO":
            case "PAGAMENTO_BOLETO": return CreditCard;
            default: return FileText;
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesFilter = filter === "all" ||
                (filter === "in" && item.tipo === "CREDITO") ||
                (filter === "out" && item.tipo === "DEBITO");

            const methodLabel = String(item.metodoFormatado || "").toUpperCase();
            const matchesMethod = methodFilter === "all" ||
                (methodFilter === "PIX" && (item.metodo === "TRANSFERENCIA_PIX" || methodLabel.includes("PIX"))) ||
                (methodFilter === "P2P" && (item.metodo === "TRANSFERENCIA_INTERNA" || item.metodo === "TRANSFERENCIA" || methodLabel.includes("P2P"))) ||
                (methodFilter === "BOLETO" && (item.metodo === "PAGAMENTO_BOLETO" || item.metodo === "PAGAMENTO" || methodLabel.includes("BOLETO"))) ||
                (methodFilter === "TARIFA" && (item.metodo === "TARIFA" || item.metodo === "MENSALIDADE_CLUBE_BENEFICIOS" || methodLabel.includes("TARIFA")));

            const searchString = `${item.pagadorNome || ""} ${item.RecebinteNome || ""} ${item.metodoFormatado || ""} ${item.idDoBancoLiquidante || ""}`.toLowerCase();
            const matchesSearch = searchString.includes(searchTerm.toLowerCase());

            // The API already applies the selected date range in the request.
            return matchesFilter && matchesMethod && matchesSearch;
        });
    }, [items, filter, methodFilter, searchTerm]);

    const chartData = useMemo(() => {
        let referenceDate = new Date();
        if (endDate) {
            const parts = endDate.split("-").map(Number);
            referenceDate = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
        }

        const now = new Date();
        const isToday = referenceDate.toDateString() === now.toDateString();
        const startOfRef = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

        const groups: { [key: string]: { name: string, full: string, entries: number, exits: number, timestamp: number } } = {};
        const daysArr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

        if (chartPeriod === 'day') {
            const hLimit = isToday ? now.getHours() : 23;
            for (let h = 0; h <= hLimit; h++) {
                const key = `H-${h}`;
                groups[key] = {
                    name: `${h}h`,
                    full: `${isToday ? 'Hoje' : referenceDate.toLocaleDateString('pt-BR')} às ${String(h).padStart(2, '0')}:00`,
                    entries: 0,
                    exits: 0,
                    timestamp: h
                };
            }
        } else if (chartPeriod === 'week') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(startOfRef);
                d.setDate(startOfRef.getDate() - i);
                const dayLabel = daysArr[d.getDay()];
                const key = `D-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                groups[key] = {
                    name: `${dayLabel} ${String(d.getDate()).padStart(2, '0')}`,
                    full: d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
                    entries: 0,
                    exits: 0,
                    timestamp: d.getTime()
                };
            }
        } else if (chartPeriod === 'month') {
            const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
            const diffDays = Math.floor((referenceDate.getTime() - firstDay.getTime()) / (24 * 3600000));
            // Ensure we don't crash if range is too large
            const loopLimit = Math.min(diffDays, 31);
            for (let i = 0; i <= loopLimit; i++) {
                const d = new Date(firstDay);
                d.setDate(firstDay.getDate() + i);
                const key = `D-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                groups[key] = {
                    name: String(d.getDate()).padStart(2, '0'),
                    full: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
                    entries: 0,
                    exits: 0,
                    timestamp: d.getTime()
                };
            }
        }

        filteredItems.forEach(item => {
            const itemDate = parseTransactionDate(item);
            if (!itemDate) return;

            let key = "";
            if (chartPeriod === 'day') {
                if (itemDate.toDateString() === referenceDate.toDateString()) {
                    key = `H-${itemDate.getHours()}`;
                }
            } else {
                key = `D-${itemDate.getFullYear()}-${itemDate.getMonth()}-${itemDate.getDate()}`;
            }

            if (key && groups[key]) {
                const val = Math.abs(Number(item.valor || 0));
                const tipo = String(item.tipo || "").toUpperCase();
                if (tipo === 'CREDITO') groups[key].entries += val;
                else groups[key].exits += val;
            }
        });

        return Object.values(groups).sort((a, b) => a.timestamp - b.timestamp);
    }, [filteredItems, chartPeriod, endDate]);

    const totals = filteredItems.reduce((acc, item) => {
        if (item.tipo === "CREDITO") acc.in += item.valor;
        else acc.out += item.valor;
        return acc;
    }, { in: 0, out: 0 });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    };

    return (
        <div className="p-4 md:p-6 flex flex-col gap-8 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] relative px-4 md:px-8 xl:px-12">
            {/* Receipt Modal Overlay */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-[#0c0a09]/90 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
                    <Card className="w-full max-w-[860px] max-h-[calc(100dvh-2rem)] bg-white rounded-md overflow-y-auto shadow-2xl relative border-white/20 animate-in zoom-in-95 duration-300 my-auto px-2 py-6">
                        <button
                            onClick={() => setSelectedTransaction(null)}
                            className="absolute flex items-center gap-2 top-4 left-4 p-2 rounded-md bg-white/90 hover:bg-orange-500 group transition-all z-20 border border-neutral-100 shadow-sm"
                            aria-label="Fechar comprovante"
                        >
                            <ArrowLeft className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                            <span className="text-sm font-bold text-white hidden group-hover:block">Voltar para a página anterior</span>
                        </button>

                        <div className="relative">
                            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-neutral-50 to-white" />

                            <div className="p-5 sm:p-7 md:p-9 space-y-5 md:space-y-6 relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-10">
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-4 bg-[var(--brand-accent)]/10 rounded-full blur-xl" />
                                        <div className="w-14 h-14 bg-[#0c0a09] rounded-md flex items-center justify-center text-[var(--brand-accent)] shadow-2xl relative border border-white/5">
                                            <Diamond className="h-7 w-7 fill-[var(--brand-accent)]/20" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-2xl md:text-3xl font-black text-[#0c0a09] tracking-tight uppercase leading-none">Comprovante</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <p className="text-[11px] md:text-xs text-neutral-500 font-black uppercase tracking-[0.18em] break-words">Autenticação {currentBrand.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-4">
                                    <div className="p-5 md:p-6 bg-neutral-50 rounded-md border border-neutral-100 flex flex-col justify-center">
                                        <p className="text-[10px] md:text-xs text-neutral-400 font-black uppercase tracking-[0.22em] mb-2">Valor total</p>
                                        <p className="text-3xl sm:text-4xl font-black text-[var(--brand-accent)] font-mono tracking-tight leading-none break-words">
                                            {selectedTransaction.tipo === 'CREDITO' ? '+' : '-'} {selectedTransaction.valorFormatado}
                                        </p>
                                    </div>

                                    <div className="p-5 md:p-6 rounded-md bg-neutral-50 border border-neutral-100 flex flex-col justify-center space-y-2 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Fingerprint className="h-4 w-4 text-[var(--brand-accent)] shrink-0" />
                                            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-accent)]">Autenticação digital</p>
                                        </div>
                                        <p className="text-xs md:text-sm font-mono font-bold break-all leading-relaxed text-[#0c0a09]/70 whitespace-pre-wrap">{selectedTransaction.codigoDeIdentificacao}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4 p-5 md:p-6 rounded-md bg-neutral-50/80 border border-neutral-100 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                                            <p className="text-[10px] md:text-xs text-neutral-400 font-black uppercase tracking-widest">Origem / Pagador</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[#0c0a09] text-base md:text-lg leading-tight break-words uppercase">{selectedTransaction.pagadorNome || `CLIENTE ${currentBrand.name}`}</p>
                                            <p className="text-sm text-neutral-500 font-mono font-bold opacity-80 break-words">
                                                {selectedTransaction.pagadorTaxNumber?.present ? selectedTransaction.pagadorTaxNumber.value : (selectedTransaction.pagadorTaxNumber || "---")}
                                            </p>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-200/60 space-y-2">
                                            <div className="grid grid-cols-[72px_1fr] gap-3 text-sm">
                                                <span className="text-neutral-400 font-bold">Banco</span>
                                                <span className="font-black text-[#0c0a09] uppercase text-right break-words">{selectedTransaction.pagadorInstituicao || `${currentBrand.bankName} (${currentBrand.bankCode})`}</span>
                                            </div>
                                            <div className="grid grid-cols-[72px_1fr] gap-3 text-xs md:text-sm">
                                                <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                                <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                                    {selectedTransaction.pagadorAgencia || "0001"} &bull; {selectedTransaction.pagadorConta || "0000000-0"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5 md:p-6 rounded-md bg-neutral-50/80 border border-neutral-100 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                                            <p className="text-[10px] md:text-xs text-neutral-400 font-black uppercase tracking-widest">Destino / Recebedor</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[#0c0a09] text-base md:text-lg leading-tight break-words uppercase">{selectedTransaction.RecebinteNome || `PAGAMENTO ${currentBrand.name}`}</p>
                                            <p className="text-sm text-neutral-500 font-mono font-bold opacity-80 break-words">
                                                {selectedTransaction.RecebinteTaxNumber?.present ? selectedTransaction.RecebinteTaxNumber.value : (selectedTransaction.RecebinteTaxNumber || "---")}
                                            </p>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-200/60 space-y-2">
                                            <div className="grid grid-cols-[72px_1fr] gap-3 text-sm">
                                                <span className="text-neutral-400 font-bold">Banco</span>
                                                <span className="font-black text-[#0c0a09] uppercase text-right break-words">{selectedTransaction.RecebinteInstituicao || "BANCO DESTINO"}</span>
                                            </div>
                                            <div className="grid grid-cols-[72px_1fr] gap-3 text-xs md:text-sm">
                                                <span className="text-neutral-400 font-bold">Ag/Conta</span>
                                                <span className="font-black text-[#0c0a09] font-mono tracking-tighter text-right">
                                                    {selectedTransaction.RecebinteAgencia || "---"} &bull; {selectedTransaction.RecebinteConta || "---"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-md border border-neutral-100 bg-white p-4 md:p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                        <div>
                                            <p className="text-[10px] md:text-xs text-neutral-400 font-black uppercase tracking-widest mb-1.5">Tipo</p>
                                            <Badge className="bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-0 px-3 py-1 font-black text-xs md:text-sm uppercase tracking-widest rounded-sm max-w-full whitespace-normal text-left">
                                                {selectedTransaction.metodoFormatado === "SERVIÇOS DIGITAIS" ? "SERVIÇOS DIGITAIS/RECARGA" : selectedTransaction.metodoFormatado}
                                            </Badge>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-[10px] md:text-xs text-neutral-400 font-black uppercase tracking-widest mb-1.5">Data efetiva</p>
                                            <p className="text-base md:text-lg font-black text-[#0c0a09]">
                                                {formatTransactionDate(selectedTransaction).date} <span className="ml-1 text-neutral-400">{formatTransactionDate(selectedTransaction).time}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 pt-1">
                                    <Button
                                        onClick={() => handlePrintReceipt(
                                            selectedTransaction.idDoBancoLiquidante || selectedTransaction.itemId || selectedTransaction.id,
                                            selectedTransaction.tipo === "CREDITO" ? (selectedTransaction.pagadorNome || "Transacao") : (selectedTransaction.RecebinteNome || "Transacao")
                                        )}
                                        className="flex-1 h-14 bg-[#0c0a09] text-white hover:bg-[var(--brand-accent)] rounded-md font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-black/10 group active:scale-95"
                                    >
                                        <Download className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" /> Gerar Comprovante
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedTransaction(null)}
                                        className="h-14 border-neutral-100 rounded-md font-black uppercase tracking-widest text-sm px-8 active:scale-95 text-neutral-500 hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-black/10 text-white"
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
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <Badge variant="secondary" className="bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-0 px-2 md:px-3 py-0.5 md:py-1 font-black text-[8px] md:text-[10px] uppercase tracking-[0.25em] rounded-sm">Fluxo de Caixa</Badge>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">MINHA <span className="text-[var(--brand-accent)]">MOVIMENTAÇÃO</span></h1>
                        <p className="text-xs md:text-sm text-neutral-400 font-bold">Consulte e exporte seu histórico bancário detalhado.</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => handleExport('pdf')}
                            disabled={!!exportingType}
                            variant="outline"
                            className="flex-1 sm:flex-none h-10 md:h-11 border-neutral-100 bg-white rounded-sm px-4 md:px-5 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 shadow-sm transition-all active:scale-95 text-neutral-400 hover:text-black"
                        >
                            {exportingType === 'pdf' ? <div className="h-4 w-4 border-2 border-[var(--brand-accent)] border-t-transparent rounded-full animate-spin" /> : <Download className="h-4 w-4 text-[var(--brand-accent)]" />}
                            PDF
                        </Button>
                        <Button
                            onClick={() => handleExport('csv')}
                            disabled={!!exportingType}
                            variant="outline"
                            className="flex-1 sm:flex-none h-10 md:h-11 border-neutral-100 bg-white rounded-sm px-4 md:px-5 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 shadow-sm transition-all active:scale-95 text-neutral-400 hover:text-black"
                        >
                            {exportingType === 'csv' ? <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Download className="h-4 w-4 text-green-600" />}
                            CSV
                        </Button>
                        <Button
                            onClick={() => handleExport('xls')}
                            disabled={!!exportingType}
                            className="flex-1 sm:flex-none h-10 md:h-11 bg-[var(--brand-accent)] hover:bg-[#c2410c] text-white rounded-sm px-4 md:px-5 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                        >
                            {exportingType === 'xls' ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="h-4 w-4" />}
                            XLS
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-emerald-600 border-0 rounded-[2px] p-6 flex flex-row items-center gap-5 shadow-xl shadow-emerald-900/10 relative overflow-hidden group cursor-pointer transition-all duration-500 min-h-[110px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="w-12 h-12 bg-white/20 rounded-[2px] flex items-center justify-center text-white border border-white/10 shadow-inner shrink-0 group-hover:rotate-12 transition-transform relative z-10">
                            <ArrowDownLeft className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col justify-center relative z-10 min-w-0">
                            <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-1">Total Entradas</p>
                            <p className="text-2xl md:text-3xl font-black text-white font-mono tracking-tighter truncate leading-none">
                                {isLoading ? <span className="opacity-20 animate-pulse">R$ 0,00</span> : formatCurrency(totals.in)}
                            </p>
                        </div>
                    </Card>
                    <Card className="bg-red-600 border-0 rounded-[2px] p-6 flex flex-row items-center gap-5 shadow-xl shadow-red-900/10 relative overflow-hidden group cursor-pointer transition-all duration-500 min-h-[110px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="w-12 h-12 bg-white/20 rounded-[2px] flex items-center justify-center text-white border border-white/10 shadow-inner shrink-0 group-hover:-rotate-12 transition-transform relative z-10">
                            <ArrowUpRight className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col justify-center relative z-10 min-w-0">
                            <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-1">Total Saídas</p>
                            <p className="text-2xl md:text-3xl font-black text-white font-mono tracking-tighter truncate leading-none">
                                {isLoading ? <span className="opacity-20 animate-pulse">R$ 0,00</span> : formatCurrency(totals.out)}
                            </p>
                        </div>
                    </Card>
                    <Card
                        onClick={() => window.open("https://wa.me/5551996297077", "_blank")}
                        className="rounded-[2px] border-0 shadow-xl bg-[var(--brand-accent)] p-6 text-white relative overflow-hidden group cursor-pointer border border-white/10 flex flex-row items-center gap-5 active:scale-95 transition-all min-h-[110px]"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="w-12 h-12 bg-white/10 rounded-[2px] flex items-center justify-center text-white border border-white/20 shadow-inner group-hover:scale-110 transition-transform shrink-0 relative z-10">
                            <Phone className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col justify-center relative z-10 min-w-0">
                            <h3 className="text-lg max-[1350px]:text-[15px] font-black leading-none tracking-tighter uppercase whitespace-nowrap mb-1">Suporte 09h as 17h</h3>
                            <p className="text-[10px] font-bold text-white/70 leading-none tracking-widest uppercase truncate">Central de Assistência {currentBrand.shortName}</p>
                        </div>
                    </Card>
                </div>

                {/* Analysis Chart Area */}
                <Card className="rounded-md border border-neutral-100 bg-white p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col h-[350px] transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.4em]">Visão Geral</p>
                            <h4 className="text-xl font-black text-[#0c0a09] tracking-tighter uppercase">ANÁLISE DE VOLUMES</h4>
                        </div>
                        <Tabs value={chartPeriod} onValueChange={(val: any) => setChartPeriod(val)} className="w-fit">
                            <TabsList className="bg-neutral-50 rounded-sm p-0.5 h-8 gap-0.5 border border-neutral-100">
                                <TabsTrigger value="day" className="rounded-xs h-full px-4 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all font-sans">Dia</TabsTrigger>
                                <TabsTrigger value="week" className="rounded-xs h-full px-4 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all font-sans">Semana</TabsTrigger>
                                <TabsTrigger value="month" className="rounded-xs h-full px-4 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all font-sans">Mês</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex-1 w-full min-h-0 relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                                <div className="h-4 w-4 bg-[var(--brand-accent)] rounded-full animate-ping" />
                            </div>
                        )}
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEntry" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '11px' }}
                                        labelFormatter={(label, payload) => payload[0]?.payload?.full || label}
                                        formatter={(value: any) => [formatCurrency(value), ""]}
                                    />
                                    <Area type="monotone" dataKey="entries" stroke="#10b981" fillOpacity={1} fill="url(#colorEntry)" strokeWidth={4} activeDot={{ r: 6 }} />
                                    <Area type="monotone" dataKey="exits" stroke="#dc2626" fillOpacity={1} fill="url(#colorExit)" strokeWidth={4} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Filter & List Area */}
                <div className="bg-white rounded-md p-4 md:p-8 border border-neutral-100 shadow-sm space-y-10">
                    <div className="flex flex-col gap-6 pb-6 border-b border-neutral-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap w-full">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Tabs value={filter} onValueChange={(val: any) => setFilter(val)} className="w-full sm:w-auto">
                                    <TabsList className="bg-neutral-100 rounded-md p-0.5 h-10 gap-0.5 border border-neutral-200/80">
                                        <TabsTrigger value="all" className="rounded-sm h-full px-4 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[active]:shadow-sm data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all font-sans">Todas</TabsTrigger>
                                        <TabsTrigger value="in" className="rounded-sm h-full px-4 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[active]:shadow-sm data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all font-sans">Entrada</TabsTrigger>
                                        <TabsTrigger value="out" className="rounded-sm h-full px-4 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[active]:shadow-sm data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all font-sans">Saída</TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="h-6 w-px bg-neutral-200 hidden sm:block mx-2" />

                                <Tabs value={methodFilter} onValueChange={(val: any) => setMethodFilter(val)} className="w-full sm:w-auto">
                                    <TabsList className="bg-neutral-100 rounded-md p-0.5 h-10 gap-1 border border-neutral-200/80">
                                        <TabsTrigger value="all" className="rounded-sm h-full px-3 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all">Métodos</TabsTrigger>
                                        <TabsTrigger value="PIX" className="rounded-sm h-full px-3 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all">PIX</TabsTrigger>
                                        <TabsTrigger value="P2P" className="rounded-sm h-full px-3 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all">P2P</TabsTrigger>
                                        <TabsTrigger value="BOLETO" className="rounded-sm h-full px-3 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all">BOLETO</TabsTrigger>
                                        <TabsTrigger value="TARIFA" className="rounded-sm h-full px-3 text-[8px] font-black uppercase tracking-widest text-neutral-600 hover:text-[var(--brand-accent)] data-[active]:bg-[var(--brand-accent)] data-[active]:text-white data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white transition-all">TARIFA</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="flex items-center gap-1 md:gap-2 bg-neutral-100/50 rounded-md p-0.5 border border-neutral-200/20 w-fit overflow-x-auto no-scrollbar ml-auto">
                                <div className="relative group shrink-0">
                                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 font-black" />
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-8 md:h-9 w-[145px] md:w-[155px] bg-transparent border-0 pl-7 md:pl-8 pr-7 text-[12px] font-black uppercase text-neutral-700 [color-scheme:light] [&::-webkit-datetime-edit]:text-neutral-700 [&::-webkit-datetime-edit-fields-wrapper]:text-neutral-700 focus-visible:ring-0 cursor-pointer"
                                    />
                                </div>
                                <span className="text-neutral-300 text-[10px]">/</span>
                                <div className="relative group shrink-0">
                                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-8 md:h-9 w-[145px] md:w-[155px] bg-transparent border-0 pl-7 md:pl-8 pr-7 text-[12px] font-black uppercase text-neutral-700 [color-scheme:light] [&::-webkit-datetime-edit]:text-neutral-700 [&::-webkit-datetime-edit-fields-wrapper]:text-neutral-700 focus-visible:ring-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="hidden sm:grid grid-cols-12 px-6 pb-2 text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em] gap-4">
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
                            <div className="py-24 text-center bg-white/50 rounded-sm border border-dashed border-neutral-200 flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-neutral-50 rounded-sm flex items-center justify-center text-neutral-200">
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
                                    const rawDescription = t.tipo === "CREDITO" ? (t.pagadorNome || `Recebimento ${currentBrand.name}`) : (t.RecebinteNome || "Pagamento Efetuado");
                                    const description = rawDescription.toUpperCase() === "PAGAMENTO EFETUADO" ? "PAGAMENTO EFETUADO" : rawDescription;
                                    const formattedDate = formatTransactionDate(t);

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedTransaction(t)}
                                            className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center px-6 py-6 sm:py-5 bg-white hover:bg-neutral-50/50 rounded-md border border-neutral-50 hover:border-neutral-200 hover:shadow-xl transition-all duration-300 group cursor-pointer gap-4 sm:gap-6"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 col-span-5 min-w-0 w-full">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-[5px] flex items-center justify-center p-2.5 transition-all ${t.metodo === "TRANSFERENCIA_PIX" ? 'bg-[#32BCAD]/10 text-[#32BCAD]' :
                                                    t.tipo === 'CREDITO' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                                                    } group-hover:scale-110`}>
                                                    <Icon className={`h-full w-full ${t.metodo === "TRANSFERENCIA_PIX" ? "" : "stroke-[2.5]"}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-xs md:text-sm text-[#0c0a09] leading-tight mb-1 truncate uppercase">{description}</p>
                                                    <p className="text-[8px] md:text-[9px] font-black text-neutral-400 opacity-60 uppercase tracking-widest truncate">ID: {t.codigoDeIdentificacao || t.idDoBancoLiquidante}</p>
                                                </div>
                                            </div>

                                            <div className="hidden sm:flex col-span-3 flex-col items-center font-sans">
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-[0.05em] border-0 px-4 py-1.5 h-7 flex items-center justify-center w-fit min-w-[140px] rounded-sm whitespace-nowrap ${t.tipo === 'CREDITO' ? 'text-green-600 bg-green-50/50' : 'text-neutral-400 bg-neutral-100/50'}`}>
                                                    {t.metodoFormatado?.toUpperCase() === "SERVIÇOS DIGITAIS" ? "SERVIÇOS DIGITAIS / RECARGA" : t.metodoFormatado}
                                                </Badge>
                                            </div>

                                            <div className="hidden sm:block col-span-2 text-right">
                                                <p className={`font-black text-lg font-mono tracking-tighter ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                                                </p>
                                            </div>

                                            <div className="flex sm:col-span-2 items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-neutral-300 group-hover:text-[var(--brand-accent)] transition-colors border-t sm:border-t-0 border-neutral-50 pt-3 sm:pt-0">
                                                <div className="sm:hidden">
                                                    <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-[0.05em] border-0 px-2 py-1 rounded-sm whitespace-nowrap ${t.tipo === 'CREDITO' ? 'text-green-600 bg-green-50/50' : 'text-neutral-400 bg-neutral-100/50'}`}>
                                                        {t.metodoFormatado?.toUpperCase() === "SERVIÇOS DIGITAIS" ? "SERVIÇOS DIGITAIS / RECARGA" : t.metodoFormatado}
                                                    </Badge>
                                                </div>
                                                <div className="text-right flex items-center gap-2 md:gap-3">
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[14px] font-black text-[#0c0a09] font-mono">{formattedDate.date}</p>
                                                        <p className="text-[12px] font-bold tracking-widest">{formattedDate.time}</p>
                                                    </div>
                                                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
