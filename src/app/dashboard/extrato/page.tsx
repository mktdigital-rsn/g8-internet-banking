"use client";

import React from "react";
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
    ArrowLeft
} from "lucide-react";
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
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null);

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

    const getIconForMetodo = (metodo: string) => {
        switch (metodo) {
            case "TRANSFERENCIA_PIX": return Smartphone;
            case "TRANSFERENCIA": return ArrowRightLeft;
            case "TARIFA": return AlertCircle;
            case "PAGAMENTO": return CreditCard;
            default: return FileText;
        }
    };

    const filteredItems = items.filter(item => {
        const matchesFilter = filter === "all" ||
            (filter === "in" && item.tipo === "CREDITO") ||
            (filter === "out" && item.tipo === "DEBITO");

        const searchString = `${item.pagadorNome} ${item.RecebinteNome} ${item.metodoFormatado}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const totals = filteredItems.reduce((acc, item) => {
        if (item.tipo === "CREDITO") acc.in += item.valor;
        else acc.out += item.valor;
        return acc;
    }, { in: 0, out: 0 });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    };

    return (
        <div className="p-10 flex gap-10 h-full overflow-y-auto w-full no-scrollbar bg-[#f5f5f5]/30 relative">
            {/* Receipt Modal Overlay */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedTransaction(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors z-10"
                        >
                            <ArrowLeft className="h-5 w-5 rotate-180" />
                        </button>

                        <div className="p-10 space-y-8">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-[#f97316]/10 rounded-3xl flex items-center justify-center text-[#f97316] mx-auto">
                                    <Diamond className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#0c0a09]">Comprovante de Transação</h2>
                                    <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mt-1">G8Pay &bull; Banco Digital</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-dashed border-neutral-100">
                                <div className="text-center">
                                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-1">Valor</p>
                                    <p className={`text-4xl font-black ${selectedTransaction.tipo === 'CREDITO' ? 'text-green-600' : 'text-[#0c0a09]'} font-mono tracking-tighter`}>
                                        {selectedTransaction.tipo === 'CREDITO' ? '+' : '-'} {selectedTransaction.valorFormatado}
                                    </p>
                                </div>

                                <div className="space-y-4 bg-neutral-50 rounded-3xl p-6">
                                    <div>
                                        <p className="text-[8px] text-neutral-400 font-black uppercase">Pessoa Envolvida</p>
                                        <p className="text-sm font-black text-[#0c0a09]">
                                            {selectedTransaction.tipo === 'CREDITO' ? (selectedTransaction.pagadorNome || "N/A") : (selectedTransaction.RecebinteNome || "N/A")}
                                        </p>
                                        <p className="text-[10px] text-neutral-400 font-mono font-bold">
                                            {selectedTransaction.tipo === 'CREDITO' ? (selectedTransaction.pagadorTaxNumber?.present ? selectedTransaction.pagadorTaxNumber.value : selectedTransaction.pagadorTaxNumber) : (selectedTransaction.RecebinteTaxNumber?.present ? selectedTransaction.RecebinteTaxNumber.value : selectedTransaction.RecebinteTaxNumber) || "---"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] text-neutral-400 font-black uppercase">Data e Hora</p>
                                            <p className="text-xs font-bold text-[#0c0a09]">{selectedTransaction.dataDaTransacaoFormatada}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-neutral-400 font-black uppercase">Método</p>
                                            <p className="text-xs font-bold text-[#f97316]">{selectedTransaction.metodoFormatado}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 opacity-50 px-2">
                                    <p className="text-[8px] text-neutral-400 font-black uppercase">Chave de Autenticação</p>
                                    <p className="text-[10px] font-mono font-black break-all leading-tight">{selectedTransaction.codigoDeIdentificacao}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button className="flex-1 h-12 bg-[#f97316] text-white rounded-2xl font-bold gap-2">
                                    <Download className="h-4 w-4" /> Exportar
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="flex-1 h-12 border-neutral-100 rounded-2xl font-bold">
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-transparent font-black px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest">G8Pay &bull; Finanças</Badge>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Histórico Completo</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-[#0c0a09] flex items-center gap-3">
                            Extrato da Conta
                            <FileText className="h-7 w-7 text-[#f97316] stroke-[2]" />
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="h-12 bg-[#f97316] hover:bg-[#c2410c] text-white rounded-2xl px-6 font-bold flex items-center gap-2 shadow-lg">
                            <Download className="h-5 w-5" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-white border border-neutral-100 rounded-[40px] p-8 flex items-center gap-6 shadow-sm relative overflow-hidden group">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                            <ArrowDownLeft className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Entradas</p>
                            <p className="text-3xl font-black text-[#0c0a09] font-mono tracking-tight">{formatCurrency(totals.in)}</p>
                        </div>
                    </Card>
                    <Card className="bg-white border border-neutral-100 rounded-[40px] p-8 flex items-center gap-6 shadow-sm relative overflow-hidden group">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                            <ArrowUpRight className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Saídas</p>
                            <p className="text-3xl font-black text-[#0c0a09] font-mono tracking-tight">{formatCurrency(totals.out)}</p>
                        </div>
                    </Card>
                </div>

                {/* Filter & List */}
                <div className="bg-white rounded-[56px] p-10 border border-neutral-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between gap-6">
                        <Tabs defaultValue="all" onValueChange={setFilter} className="w-fit">
                            <TabsList className="bg-neutral-50 rounded-2xl p-1.5 h-12">
                                <TabsTrigger value="all" className="rounded-xl h-full px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Tudo</TabsTrigger>
                                <TabsTrigger value="in" className="rounded-xl h-full px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Entradas</TabsTrigger>
                                <TabsTrigger value="out" className="rounded-xl h-full px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#f97316]">Saídas</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative flex-1 max-w-sm group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-[#f97316] transition-colors" />
                            <Input
                                placeholder="Pesquisar transação..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-12 bg-neutral-50 border-0 rounded-2xl pl-12 focus:bg-white focus:ring-1 focus:ring-[#f97316]/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                                <p className="text-neutral-400 font-bold animate-pulse text-xs uppercase tracking-widest">Carregando histórico...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredItems.map((t, idx) => {
                                    const Icon = getIconForMetodo(t.metodo);
                                    const description = t.tipo === "CREDITO" ? t.pagadorNome : t.RecebinteNome;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedTransaction(t)}
                                            className="grid grid-cols-4 items-center px-8 py-6 bg-neutral-50/50 hover:bg-white rounded-[32px] border border-transparent hover:border-neutral-100 hover:shadow-xl transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 col-span-2">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.tipo === 'CREDITO' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} group-hover:scale-110 transition-transform`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-[#0c0a09] leading-none mb-1 truncate max-w-[250px]">{description || "Transação Diversa"}</p>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{t.metodoFormatado} &bull; {t.tipoFormatado}</p>
                                                </div>
                                            </div>
                                            <p className={`text-center font-black text-lg font-mono ${t.tipo === 'CREDITO' ? 'text-green-600' : 'text-[#0c0a09]'}`}>
                                                {t.tipo === 'CREDITO' ? '+' : '-'} {t.valorFormatado}
                                            </p>
                                            <div className="flex flex-col items-end justify-center">
                                                <p className="text-xs font-bold text-[#0c0a09]">{t.dataDaTransacaoFormatada.split(" ")[0]}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium">{t.dataDaTransacaoFormatada.split(" ")[1]}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Column */}
            <div className="w-[320px] shrink-0 space-y-8">
                <Card className="rounded-[48px] border-0 shadow-2xl bg-[#0c0a09] p-10 text-white relative overflow-hidden group cursor-pointer h-[280px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#f97316]">
                            <AlertCircle className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-black leading-tight">Precisa de ajuda com uma transação?</h3>
                        <button className="text-[10px] font-black border-b-2 border-[#f97316] text-[#f97316] uppercase tracking-widest pb-0.5">CONTATAR SUPORTE</button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
