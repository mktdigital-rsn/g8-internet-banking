"use client";

import React, { useState } from "react";
import styles from "./agendamentos.module.css";
import PasswordConfirmationDialog from "@/components/PasswordConfirmationDialog";
import { 
  CalendarClock, 
  Search, 
  Trash2, 
  ArrowRight,
  Clock,
  Calendar,
  Wallet,
  ArrowUpRight,
  Smartphone,
  AlertCircle,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";


type PaymentType = "pix" | "transfer" | "boleto" | "ted";

interface Agendamento {
  id: string;
  type: PaymentType;
  beneficiario: string;
  valor: number;
  data: string;
  status: "pending" | "failed";
  category?: string;
  pixKey?: string;
  agency?: string;
  account?: string;
  bank?: string;
  barcode?: string;
}

const MOCK_AGENDAMENTOS: Agendamento[] = []

const CATEGORIES = [
  "Alimentação",
  "Aluguel",
  "Compras",
  "Contabilidade",
  "Contas de consumo",
  "Despesas pessoais",
  "Empréstimo",
  "Estornos",
  "Faturas",
  "Impostos e encargos",
  "Marketing",
  "Outros",
  "Pagamento de fornecedor",
  "Pagamento de funcionários",
  "Retirada para própria conta PF",
  "Saque",
  "Transporte e mobilidade"
];

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(MOCK_AGENDAMENTOS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"todos" | "pix" | "transfer" | "boleto" | "ted">("todos");
  const [isAdding, setIsAdding] = useState(false);
  const [newAgendamento, setNewAgendamento] = useState<{
    type: PaymentType;
    beneficiario: string;
    valor: string;
    data: string;
    pixKey?: string;
    agency?: string;
    account?: string;
    bank?: string;
    barcode?: string;
    category?: string;
  }>({
    type: "pix",
    beneficiario: "",
    valor: "",
    data: "",
    pixKey: "",
    agency: "",
    account: "",
    bank: "",
    barcode: "",
    category: "Outros",
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [deleting, setDeleting] = useState<Agendamento | null>(null);
  const invalidPeriod = !!(dateRange.start && dateRange.end && dateRange.start > dateRange.end);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = agendamentos.filter(ag => {
    const matchesSearch = ag.beneficiario.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"));
    const matchesTab = activeTab === "todos" || ag.type === activeTab;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(ag.data) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(ag.data) <= new Date(dateRange.end);
    }

    return !invalidPeriod && matchesSearch && matchesTab && matchesDate;
  });

  const handleEdit = (ag: Agendamento) => {
    setNewAgendamento({
      type: ag.type,
      beneficiario: ag.beneficiario,
      valor: formatBRL((ag.valor * 100).toFixed(0)),
      data: ag.data,
      category: ag.category || "Outros",
      pixKey: ag.pixKey || "",
      agency: ag.agency || "",
      account: ag.account || "",
      bank: ag.bank || "",
      barcode: ag.barcode || "",
    });
    setEditingId(ag.id);
    setIsAdding(true);
  };

  const handleAdd = () => {
    if (!newAgendamento.beneficiario || !newAgendamento.valor || !newAgendamento.data) {
      return toast.error("Preencha todos os campos.");
    }

    const amount = parseFloat(newAgendamento.valor.replace(/[^0-9,]/g, '').replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Informe um valor maior que zero.");
    const destination = newAgendamento.type === "pix"
      ? { pixKey: newAgendamento.pixKey }
      : newAgendamento.type === "boleto"
        ? { barcode: newAgendamento.barcode }
        : { agency: newAgendamento.agency, account: newAgendamento.account, bank: newAgendamento.bank };
    const details = { pixKey: "", agency: "", account: "", bank: "", barcode: "", ...destination };
    if (editingId) {
      setAgendamentos(prev => prev.map(a => a.id === editingId ? {
        ...a,
        ...details,
        type: newAgendamento.type,
        beneficiario: newAgendamento.beneficiario,
        valor: parseFloat(newAgendamento.valor.replace(/[^0-9,]/g, '').replace(',', '.')),
        data: newAgendamento.data,
        category: newAgendamento.category || "Outros"
      } : a));
      toast.success("Agendamento atualizado com sucesso!");
    } else {
      const ag: Agendamento = {
        id: crypto.randomUUID(),
        ...details,
        type: newAgendamento.type,
        beneficiario: newAgendamento.beneficiario,
        valor: parseFloat(newAgendamento.valor.replace(/[^0-9,]/g, '').replace(',', '.')),
        data: newAgendamento.data,
        status: "pending",
        category: newAgendamento.category || "Outros"
      };
      setAgendamentos([ag, ...agendamentos]);
      toast.success("Pagamento agendado com sucesso!");
    }
    
    setIsAdding(false);
    setEditingId(null);
    setNewAgendamento({ 
      type: "pix", 
      beneficiario: "", 
      valor: "", 
      data: "",
      pixKey: "",
      agency: "",
      account: "",
      bank: "",
      barcode: "",
    });
  };

  const formatBRL = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const numberValue = parseFloat(cleanValue) / 100;
    if (isNaN(numberValue)) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRL(e.target.value);
    setNewAgendamento({ ...newAgendamento, valor: formatted });
  };

  return (
    <div className={styles.page}>


      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-4">
          <Badge variant="secondary" className="bg-orange-600/10 text-orange-600 border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">Gestão Transacional</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">
            Seus <span className="text-orange-600">AGENDAMENTOS</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-bold max-w-2xl">
            Visualize, edite ou crie novas programações de pagamento com facilidade.
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingId(null);
            setNewAgendamento({ 
              type: "pix", 
              beneficiario: "", 
              valor: "", 
              data: "",
              pixKey: "",
              agency: "",
              account: "",
              bank: "",
              barcode: "",
              category: "Outros",
            });
            setIsAdding(true);
          }}
          className="h-14 px-8 bg-black hover:bg-orange-600 text-white rounded-sm font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-orange-600/20 group"
        >
          <CalendarClock className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
          Novo Agendamento
        </Button>
      </div>

      <div className={styles.layout}>
        {/* Filters and List */}
        <div className={styles.main}>
          <div className={styles.filters}>
            <div className={styles.searchRow}>
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <Input 
                  aria-label="Buscar por beneficiário"
                  placeholder="Buscar por beneficiário..." 
                  className="pl-12 h-12 bg-neutral-50 border-neutral-100 rounded-sm font-bold text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className={styles.types} aria-label="Filtrar por tipo">
                {(["todos", "pix", "transfer", "boleto", "ted"] as const).map((tab) => (
                  <button
                    key={tab}
                    aria-pressed={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all whitespace-nowrap ${
                      activeTab === tab ? "bg-white text-orange-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.period}>
              <div className="flex items-center gap-2 shrink-0">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-[13px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">Filtrar por Período</span>
              </div>
              <div className={styles.dates}>
                <div className="relative">
                  <span className="absolute -top-2.5 left-3 px-1 bg-white text-[10px] font-black text-[var(--brand-accent)] uppercase tracking-widest z-10">De</span>
                  <Input 
                    aria-label="Data inicial"
                    max={dateRange.end || undefined}
                    type="date"
                    className="h-12 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all w-full"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <span className="absolute -top-2.5 left-3 px-1 bg-white text-[10px] font-black text-[var(--brand-accent)] uppercase tracking-widest z-10">Até</span>
                  <Input 
                    aria-label="Data final"
                    min={dateRange.start || undefined}
                    type="date"
                    className="h-12 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all w-full"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
                {(dateRange.start || dateRange.end) && (
                  <button 
                    onClick={() => setDateRange({ start: "", end: "" })}
                    className="flex items-center gap-2 px-4 h-12 text-red-500 hover:bg-red-50 rounded-sm transition-colors font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                  >
                    <X className="h-4 w-4" />
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </div>

          <section className={styles.list} aria-labelledby="schedule-list-title">
            <div className={styles.listHeader}>
              <h2 id="schedule-list-title">Lista de agendamentos</h2>
              <span aria-live="polite">{filtered.length} {filtered.length === 1 ? "agendamento" : "agendamentos"}</span>
            </div>
            {invalidPeriod && <p role="alert" className="p-4 text-sm text-red-600">A data final deve ser igual ou posterior à data inicial.</p>}
            <table className={styles.table}>
              <thead><tr><th scope="col">Data</th><th scope="col">Beneficiário</th><th scope="col">Tipo</th><th scope="col">Valor</th><th scope="col">Ações</th></tr></thead>
              <tbody>
                {filtered.map(ag => (
                  <tr key={ag.id}>
                    <td data-label="Data">{ag.data.split("-").reverse().join("/")}</td>
                    <td data-label="Beneficiário"><span className={styles.beneficiary}>{ag.beneficiario}</span></td>
                    <td data-label="Tipo"><span className={styles.typeBadge}>{ag.type.toUpperCase()}</span></td>
                    <td data-label="Valor" className={styles.value}>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ag.valor)}</td>
                    <td data-label="Ações"><div className={styles.actions}>
                      <button type="button" onClick={() => handleEdit(ag)} aria-label={`Visualizar ou editar agendamento de ${ag.beneficiario}`}>Visualizar / editar</button>
                      <button type="button" onClick={() => setDeleting(ag)} aria-label={`Excluir agendamento de ${ag.beneficiario}`} className={styles.deleteButton}><Trash2 className="h-4 w-4" /> Excluir</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className={styles.empty}><Search className="h-7 w-7" /><p>Nenhum agendamento encontrado.</p><span>{search || activeTab !== "todos" || dateRange.start || dateRange.end ? "Ajuste os filtros para consultar outros agendamentos." : "Os agendamentos cadastrados aparecerão aqui."}</span></div>}
          </section>
        </div>

        {/* Sidebar Info */}
        <div className={styles.info}>
          <Card className="p-8 bg-orange-600 text-white rounded-sm border-0 shadow-2xl shadow-orange-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">Total Programado</h3>
                <p className="text-4xl font-black font-mono tracking-tighter">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(filtered.reduce((acc, ag) => acc + ag.valor, 0))}
                </p>
              </div>
              <p className="text-xs font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                Transações agendadas são processadas automaticamente no dia escolhido, desde que haja saldo disponível.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-neutral-100 rounded-sm shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <AlertCircle className="h-5 w-5 text-orange-600" />
               <span className="text-xs font-black text-orange-700 uppercase tracking-widest">Regras de Agendamento</span>
             </div>
             <div className="space-y-4">
               {[
                 { title: "Limite Diário", text: "Agendamentos consomem o limite do dia da execução." },
                 { title: "Horário", text: "Processamento ocorre às 10:00h do dia agendado." },
                 { title: "Saldo", text: "Caso não haja saldo, a transação será cancelada." }
               ].map((item, i) => (
                 <div key={i} className="space-y-1">
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{item.title}</p>
                   <p className="text-xs font-bold text-neutral-700">{item.text}</p>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      </div>

      {deleting && <PasswordConfirmationDialog
        key={deleting.id}
        open
        onClose={() => setDeleting(null)}
        title="Excluir agendamento"
        description={`Confirme a exclusão do agendamento de ${deleting.beneficiario}, para ${deleting.data.split("-").reverse().join("/")}, no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deleting.valor)}.`}
      />}

      {/* Modal Novo Agendamento */}
      <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) setEditingId(null); }}>
          <DialogContent className={`${styles.editor} w-[calc(100%-2rem)] max-w-lg p-0 gap-0 bg-white rounded-xl text-neutral-900 flex flex-col max-h-[90dvh]`}>
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-sm flex items-center justify-center text-orange-600">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg md:text-xl font-black text-[#0c0a09] uppercase tracking-tight">
                    {editingId ? "Visualizar / editar" : "Novo Agendamento"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-neutral-500">Dados completos do agendamento</DialogDescription>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                aria-label="Fechar agendamento"
                className="p-2 rounded-sm hover:bg-neutral-50 transition-colors text-neutral-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6  space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Radio Select Tipo */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Tipo de Pagamento</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["pix", "transfer", "boleto", "ted"] as PaymentType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAgendamento({ ...newAgendamento, type })}
                      className={`flex flex-col items-center justify-center p-4 rounded-sm border transition-all ${
                        newAgendamento.type === type 
                        ? "border-orange-600 bg-orange-50 text-orange-700 shadow-sm" 
                        : "border-neutral-100 bg-neutral-50 text-neutral-400 hover:border-orange-200"
                      }`}
                    >
                      {type === "pix" && <Smartphone className="h-5 w-5 mb-2" />}
                      {type === "transfer" && <ArrowUpRight className="h-5 w-5 mb-2" />}
                      {type === "boleto" && <Wallet className="h-5 w-5 mb-2" />}
                      {type === "ted" && <ArrowUpRight className="h-5 w-5 mb-2 group-hover:rotate-45" />}
                      <span className="text-[9px] font-black uppercase tracking-widest">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Categoria da Transação</label>
                    <select
                      value={newAgendamento.category}
                      onChange={(e) => setNewAgendamento({ ...newAgendamento, category: e.target.value })}
                      className="w-full h-14 bg-neutral-50 border border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all outline-none appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Beneficiário / Empresa</label>
                  <Input 
                    placeholder="Nome completo ou Razão Social"
                    className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                    value={newAgendamento.beneficiario}
                    onChange={(e) => setNewAgendamento({ ...newAgendamento, beneficiario: e.target.value })}
                  />
                </div>

                {/* DYNAMIC FIELDS START */}
                {newAgendamento.type === "pix" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Chave PIX</label>
                    <Input 
                      placeholder="CPF, CNPJ, E-mail, Celular ou Chave Aleatória"
                      className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                      value={newAgendamento.pixKey}
                      onChange={(e) => setNewAgendamento({ ...newAgendamento, pixKey: e.target.value })}
                    />
                  </div>
                )}

                {(newAgendamento.type === "transfer" || newAgendamento.type === "ted") && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {newAgendamento.type === "ted" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Banco Destino</label>
                        <Input 
                          placeholder="Ex: 001 - Banco do Brasil"
                          className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                          value={newAgendamento.bank}
                          onChange={(e) => setNewAgendamento({ ...newAgendamento, bank: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Agência</label>
                        <Input 
                          placeholder="0001"
                          className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                          value={newAgendamento.agency}
                          onChange={(e) => setNewAgendamento({ ...newAgendamento, agency: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Conta Corrente</label>
                        <Input 
                          placeholder="00000000-0"
                          className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                          value={newAgendamento.account}
                          onChange={(e) => setNewAgendamento({ ...newAgendamento, account: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {newAgendamento.type === "boleto" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Linha Digitável / Código de Barras</label>
                    <Input 
                      placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
                      className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                      value={newAgendamento.barcode}
                      onChange={(e) => setNewAgendamento({ ...newAgendamento, barcode: e.target.value })}
                    />
                  </div>
                )}
                {/* DYNAMIC FIELDS END */}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Valor do Pagamento</label>
                    <Input 
                      placeholder="R$ 0,00"
                      className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-black text-sm px-4 focus:bg-white focus:border-[var(--brand-accent)] transition-all font-mono"
                      value={newAgendamento.valor}
                      onChange={handleValorChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Data do Pagamento</label>
                    <Input 
                      type="date"
                      className="h-14 bg-neutral-50 border-neutral-100 rounded-sm font-bold"
                      value={newAgendamento.data}
                      onChange={(e) => setNewAgendamento({ ...newAgendamento, data: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  onClick={handleAdd}
                  className="flex-1 h-14 bg-black hover:bg-orange-500 text-white rounded-sm font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-600/20"
                >
                  {editingId ? "Salvar Alterações" : "Confirmar Agendamento"} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  variant="outline"
                  className="px-8 h-14 border-neutral-100 text-neutral-400 text-white hover:bg-orange-500 font-black uppercase tracking-[0.2em] text-[10px]"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}
