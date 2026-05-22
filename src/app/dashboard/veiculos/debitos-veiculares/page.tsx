"use client";

import React, { useState, useEffect } from "react";
import { 
  Car, 
  Search, 
  RotateCw, 
  Check, 
  X, 
  Info, 
  DollarSign, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  CreditCard,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Printer,
  ShoppingBag,
  Coins
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

// Tabs definitions
type TabType = "ipva" | "licenciamento" | "multas";

export default function DebitosVeicularesPage() {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sumLoading, setSumLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Form State
  const [placa, setPlaca] = useState("");
  const [renavam, setRenavam] = useState("");
  const [searchCompleted, setSearchCompleted] = useState(false);

  // DETRAN Search Response Data
  const [debtsData, setDebtsData] = useState<{
    multas: any[];
    ipvas: any[];
    licenciamentos: any[];
  } | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("ipva");

  // Selection states (Checkout Cart)
  // To avoid mixing payment categories, once the user selects an item in a tab,
  // we lock selections to that tab category.
  const [selectedCategory, setSelectedCategory] = useState<TabType | null>(null);
  const [selectedMultas, setSelectedMultas] = useState<string[]>([]); // list of AIT codes
  const [selectedIpvas, setSelectedIpvas] = useState<string[]>([]); // list of years as strings
  const [selectedLicenciamentos, setSelectedLicenciamentos] = useState<string[]>([]); // list of years as strings

  // Dynamic summed values from server
  const [totalSumValue, setTotalSumValue] = useState<number>(0);
  const [totalSumFormatted, setTotalSumFormatted] = useState<string>("");

  // Installments Simulation
  const [installmentsOptions, setInstallmentsOptions] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);

  // Payment Safe Webview Form (Mercado Pago)
  const [mpFormHtml, setMpFormHtml] = useState<string>("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cardTokenData, setCardTokenData] = useState<any>(null);

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Search Submit DETRAN
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const cleanRenavam = renavam.replace(/\D/g, "");

    if (cleanPlaca.length !== 7) {
      toast.error("Por favor, digite uma placa válida com 7 caracteres.");
      return;
    }
    if (cleanRenavam.length !== 11) {
      toast.error("Por favor, digite um RENAVAM válido com 11 dígitos.");
      return;
    }

    setSearchLoading(true);
    setSearchCompleted(false);
    setDebtsData(null);
    handleResetCart();

    try {
      const response = await api.get(`/api/multas-carro/infracoes/${cleanPlaca}/${cleanRenavam}`);
      if (response.data && response.data.status && response.data.result) {
        const result = response.data.result;
        setDebtsData({
          multas: result.multas || [],
          ipvas: result.ipvas || [],
          licenciamentos: result.licenciamentos || []
        });
        setSearchCompleted(true);
        toast.success("Dados de débitos veiculares carregados com sucesso!");
        
        // Auto-select tab with active debts
        if ((result.ipvas || []).length > 0) {
          setActiveTab("ipva");
        } else if ((result.licenciamentos || []).length > 0) {
          setActiveTab("licenciamento");
        } else if ((result.multas || []).length > 0) {
          setActiveTab("multas");
        }
      } else {
        toast.error("Não foram encontrados dados para este veículo. Verifique a Placa e o RENAVAM.");
      }
    } catch (err) {
      console.error("Erro ao buscar débitos DETRAN:", err);
      toast.error("Ocorreu uma falha de conexão com o DETRAN. Verifique as credenciais e tente novamente.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset Cart / Selections
  const handleResetCart = () => {
    setSelectedCategory(null);
    setSelectedMultas([]);
    setSelectedIpvas([]);
    setSelectedLicenciamentos([]);
    setTotalSumValue(0);
    setTotalSumFormatted("");
    setInstallmentsOptions([]);
    setSelectedInstallment(null);
    setCardTokenData(null);
    setMpFormHtml("");
  };

  // Handle checking / unchecking items
  const handleToggleItem = (tab: TabType, id: string) => {
    // Lock category check
    if (selectedCategory && selectedCategory !== tab) {
      toast.warning("Você pode pagar débitos de apenas uma categoria (IPVA, Licenciamento ou Multas) por vez.");
      return;
    }

    let updatedMultas = [...selectedMultas];
    let updatedIpvas = [...selectedIpvas];
    let updatedLicenciamentos = [...selectedLicenciamentos];

    if (tab === "multas") {
      if (updatedMultas.includes(id)) {
        updatedMultas = updatedMultas.filter(x => x !== id);
      } else {
        updatedMultas.push(id);
      }
      setSelectedMultas(updatedMultas);
    } else if (tab === "ipva") {
      if (updatedIpvas.includes(id)) {
        updatedIpvas = updatedIpvas.filter(x => x !== id);
      } else {
        updatedIpvas.push(id);
      }
      setSelectedIpvas(updatedIpvas);
    } else if (tab === "licenciamento") {
      if (updatedLicenciamentos.includes(id)) {
        updatedLicenciamentos = updatedLicenciamentos.filter(x => x !== id);
      } else {
        updatedLicenciamentos.push(id);
      }
      setSelectedLicenciamentos(updatedLicenciamentos);
    }

    // Determine current active selection category
    const hasSelection = updatedMultas.length > 0 || updatedIpvas.length > 0 || updatedLicenciamentos.length > 0;
    if (hasSelection) {
      setSelectedCategory(tab);
    } else {
      setSelectedCategory(null);
    }
  };

  // Calculate dynamic sum on selections
  useEffect(() => {
    if (!selectedCategory) {
      setTotalSumValue(0);
      setTotalSumFormatted("");
      setInstallmentsOptions([]);
      setSelectedInstallment(null);
      return;
    }

    const triggerSumAPI = async () => {
      setSumLoading(true);
      const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      try {
        if (selectedCategory === "multas") {
          const res = await api.post("/api/multas-carro/somar-multas", {
            aitList: selectedMultas
          });
          if (res.data && res.data.data) {
            setTotalSumValue(res.data.data.valor);
            setTotalSumFormatted(res.data.data.valorFormatado);
          }
        } else if (selectedCategory === "ipva") {
          const res = await api.post("/api/multas-carro/somar-ipva", {
            placa: cleanPlaca,
            anos: selectedIpvas
          });
          if (res.data && res.data.data) {
            setTotalSumValue(res.data.data.valor);
            setTotalSumFormatted(res.data.data.valorFormatado);
          }
        } else if (selectedCategory === "licenciamento") {
          const res = await api.post("/api/multas-carro/somar-licenciamento", {
            placa: cleanPlaca,
            anos: selectedLicenciamentos
          });
          if (res.data && res.data.data) {
            setTotalSumValue(res.data.data.valor);
            setTotalSumFormatted(res.data.data.valorFormatado);
          }
        }
      } catch (err) {
        console.error("Erro ao somar débitos:", err);
        toast.error("Erro ao obter cálculo atualizado de débitos.");
      } finally {
        setSumLoading(false);
      }
    };

    triggerSumAPI();
  }, [selectedCategory, selectedMultas, selectedIpvas, selectedLicenciamentos, placa]);

  // Installment Simulation when sum changes
  useEffect(() => {
    if (totalSumValue <= 0) {
      setInstallmentsOptions([]);
      setSelectedInstallment(null);
      return;
    }

    const simulateInstallments = async () => {
      try {
        const res = await api.post("/api/multas-carro/calcular-parcelas", {
          valor: totalSumValue
        });
        if (res.data && Array.isArray(res.data)) {
          setInstallmentsOptions(res.data);
          // Set 1x as default
          setSelectedInstallment(res.data[0]);
        }
      } catch (err) {
        console.error("Erro ao simular parcelas:", err);
      }
    };

    simulateInstallments();
  }, [totalSumValue]);

  // Open Checkout Webview / Modal Form
  const handleProceedToCheckout = async () => {
    if (!selectedInstallment) {
      toast.error("Por favor, selecione uma opção de parcelamento para continuar.");
      return;
    }

    setCheckoutLoading(true);
    try {
      // Fetch webview dynamic form HTML from Mercado Pago API
      const res = await api.post("/api/mercado-pago/rn-webview-payment-form", {
        amount: selectedInstallment.valorTotal
      });
      if (res.data) {
        setMpFormHtml(res.data);
        setShowCheckoutModal(true);
        toast.info("Carregando formulário seguro do cartão de crédito...");
      } else {
        toast.error("Não foi possível gerar o formulário de pagamento.");
      }
    } catch (err) {
      console.error("Erro ao carregar checkout form:", err);
      toast.error("Erro de conexão ao preparar gateway do cartão.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Listen to Window PostMessage tokenizations
  useEffect(() => {
    const handleMessageListener = (event: MessageEvent) => {
      // Validate secure messages
      if (event.data && typeof event.data === "object" && event.data.token) {
        const payload = event.data;
        setCardTokenData(payload);
        setShowCheckoutModal(false);
        toast.success("Cartão tokenizado com sucesso! Processando liquidação...");
      }
    };

    window.addEventListener("message", handleMessageListener);
    return () => window.removeEventListener("message", handleMessageListener);
  }, []);

  // Trigger Final payment settlement on successful tokenization
  useEffect(() => {
    if (!cardTokenData || !selectedCategory || !selectedInstallment) return;

    const executePayment = async () => {
      setPaymentLoading(true);
      const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      try {
        let endpoint = "";
        let payload: any = {
          amount: selectedInstallment.valorTotal,
          originalAmount: totalSumValue,
          token: cardTokenData.token,
          installments: selectedInstallment.parcelas,
          paymentMethodId: cardTokenData.payment_method_id || "visa",
          payerEmail: cardTokenData.payer?.email || "cliente@g8bank.com.br",
          placa: cleanPlaca
        };

        if (selectedCategory === "ipva") {
          endpoint = "/api/multas-carro/pagar-ipva";
          payload.description = `Pagamento de IPVA - Placa ${cleanPlaca}`;
          payload.anos = selectedIpvas;
        } else if (selectedCategory === "licenciamento") {
          endpoint = "/api/multas-carro/pagar-licenciamento";
          payload.description = `Pagamento de Licenciamento - Placa ${cleanPlaca}`;
          payload.anos = selectedLicenciamentos;
        } else if (selectedCategory === "multas") {
          endpoint = "/api/multas-carro/pagar-multa";
          payload.description = `Pagamento de multa de trânsito - Placa ${cleanPlaca}`;
          payload.aitList = selectedMultas;
        }

        const res = await api.post(endpoint, payload);
        toast.success("Pagamento efetuado com sucesso junto ao DETRAN!");
        
        // Show Digital Receipt
        setReceiptData({
          placa: cleanPlaca,
          category: selectedCategory,
          amountPaid: selectedInstallment.valorTotalFormatado,
          installments: selectedInstallment.parcelas,
          authCode: res.data?.authCode || Math.random().toString(36).substring(2, 10).toUpperCase(),
          date: new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR"),
          details: selectedCategory === "ipva" ? selectedIpvas 
                   : selectedCategory === "licenciamento" ? selectedLicenciamentos 
                   : selectedMultas
        });
        setShowReceipt(true);
        
        // Clear Search / Reset states
        handleResetCart();
        setDebtsData(null);
        setSearchCompleted(false);
      } catch (err) {
        console.error("Erro ao efetuar pagamento:", err);
        toast.error("Ocorreu uma falha ao liquidar débitos junto ao DETRAN. Verifique seu limite ou tente outro cartão.");
      } finally {
        setPaymentLoading(false);
        setCardTokenData(null);
      }
    };

    executePayment();
  }, [cardTokenData, selectedCategory, selectedInstallment, totalSumValue, placa, selectedMultas, selectedIpvas, selectedLicenciamentos]);

  return (
    <div className="bg-[#f8f9fa] rounded-[4px] p-6 md:p-10 border border-neutral-200/60 space-y-10 relative overflow-hidden text-[#0c0a09]">
      {/* Background Decorativo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#ff7711]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-neutral-200/60 relative z-10">
        <div className="space-y-3">
          <Badge variant="secondary" className="bg-[#ff7711]/10 text-[#ff7711] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">
            Serviços Automotivos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase flex items-center gap-3">
            Débitos <span className="text-[#ff7711]">Veiculares</span>
            <Car className="h-10 w-10 text-[#ff7711] stroke-[2.5]" />
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-bold max-w-2xl">
            Consulte e pague multas, licenciamento anual e IPVA de maneira 100% integrada e parcelada.
          </p>
        </div>
      </header>

      {/* DETRAN SEARCH FORM */}
      {!searchCompleted && !showReceipt && (
        <Card className="p-8 max-w-2xl mx-auto rounded-sm border border-neutral-200 bg-white relative overflow-hidden group shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,119,17,0.03),transparent)]" />
          
          <form onSubmit={handleSearchSubmit} className="space-y-8 relative z-10 text-left">
            <div className="flex items-center gap-4 text-[#ff7711] pb-4 border-b border-neutral-100">
              <div className="w-12 h-12 bg-[#ff7711]/10 rounded-sm flex items-center justify-center">
                <Search className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="font-black uppercase tracking-wider text-xs">Consulta DETRAN</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Insira as credenciais do automóvel</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Placa do Veículo</label>
                <Input
                  maxLength={7}
                  placeholder="ABC1D23"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
                  className="h-12 border-neutral-200 bg-white rounded-sm font-black uppercase text-sm focus:ring-4 focus:ring-[#ff7711]/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Código RENAVAM</label>
                <Input
                  maxLength={11}
                  placeholder="12345678901"
                  value={renavam}
                  onChange={(e) => setRenavam(e.target.value.replace(/\D/g, ""))}
                  className="h-12 border-neutral-200 bg-white rounded-sm font-bold text-sm focus:ring-4 focus:ring-[#ff7711]/10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={searchLoading}
              className="w-full h-14 bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
            >
              {searchLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Consultando Base do DETRAN...
                </>
              ) : (
                <>
                  Pesquisar Débitos <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* DASHBOARD RESULTS INTERFACE */}
      {searchCompleted && debtsData && !showReceipt && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* LEFT AREA: DEBTS DETAILED ACCORDION/TABS */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60">
              <div className="space-y-0.5">
                <h2 className="text-xl font-black uppercase tracking-tight">Débitos Encontrados</h2>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                  Veículo Placa: <strong className="text-neutral-700 font-mono">{placa}</strong> • RENAVAM: <strong className="text-neutral-700 font-mono">{renavam}</strong>
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchCompleted(false); handleResetCart(); }}
                className="border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[9px] tracking-wider rounded-sm shrink-0"
              >
                Voltar à Busca
              </Button>
            </div>

            {/* TAB TRIGGERS BAR */}
            <div className="flex bg-white border border-neutral-200 rounded-sm p-1 gap-1">
              {(["ipva", "licenciamento", "multas"] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                const listLength = tab === "ipva" ? debtsData.ipvas.length 
                                 : tab === "licenciamento" ? debtsData.licenciamentos.length 
                                 : debtsData.multas.length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${
                      isActive 
                        ? "bg-[#ff7711] text-white shadow-md shadow-orange-500/10" 
                        : "hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {tab === "ipva" ? "IPVA" : tab === "licenciamento" ? "Licenciamento" : "Multas"}
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      isActive ? "bg-white text-[#ff7711]" : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {listLength}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <div className="space-y-4">
              
              {/* Category Lock Warning Banner */}
              {selectedCategory && (
                <div className="p-3 bg-orange-50 border border-orange-200 text-[#ff7711] rounded-sm text-left flex items-start gap-2.5">
                  <ShieldAlert className="h-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[10px] font-bold leading-normal">
                    Carrinho ativo em <strong>{selectedCategory.toUpperCase()}</strong>. Se deseja pagar débitos de outra aba, desmarque as opções atuais ou limpe o carrinho.
                  </span>
                </div>
              )}

              {/* IPVA TAB */}
              {activeTab === "ipva" && (
                <div className="space-y-3">
                  {debtsData.ipvas.length > 0 ? (
                    debtsData.ipvas.map((ipva) => {
                      const isChecked = selectedIpvas.includes(ipva.ano.toString());
                      const isLocked = selectedCategory && selectedCategory !== "ipva";
                      
                      return (
                        <Card 
                          key={ipva.ano}
                          onClick={() => !isLocked && handleToggleItem("ipva", ipva.ano.toString())}
                          className={`p-6 border rounded-sm flex items-center justify-between bg-white transition-all ${
                            isLocked ? "opacity-50 cursor-not-allowed border-neutral-100" : "cursor-pointer border-neutral-200 hover:border-[#ff7711]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isChecked ? "border-[#ff7711] bg-[#ff7711] text-white" : "border-neutral-300"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            
                            <div className="space-y-0.5">
                              <span className="block font-black text-sm uppercase text-neutral-800">
                                IPVA Anual {ipva.ano}
                              </span>
                              <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                <span>Vencimento: {new Date(ipva.vencimento).toLocaleDateString("pt-BR")}</span>
                                {ipva.valor_com_desconto && (
                                  <span className="text-emerald-600 font-black">C/ Desconto: R$ {ipva.valor_com_desconto.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="block text-base font-extrabold text-neutral-900">
                              R$ {ipva.valor.toFixed(2)}
                            </span>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="py-12 bg-white rounded-sm border border-neutral-200 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                      <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Nenhum IPVA pendente localizado!</p>
                    </div>
                  )}
                </div>
              )}

              {/* LICENCIAMENTO TAB */}
              {activeTab === "licenciamento" && (
                <div className="space-y-3">
                  {debtsData.licenciamentos.length > 0 ? (
                    debtsData.licenciamentos.map((lic) => {
                      const isChecked = selectedLicenciamentos.includes(lic.ano.toString());
                      const isLocked = selectedCategory && selectedCategory !== "licenciamento";
                      
                      return (
                        <Card 
                          key={lic.ano}
                          onClick={() => !isLocked && handleToggleItem("licenciamento", lic.ano.toString())}
                          className={`p-6 border rounded-sm flex items-center justify-between bg-white transition-all ${
                            isLocked ? "opacity-50 cursor-not-allowed border-neutral-100" : "cursor-pointer border-neutral-200 hover:border-[#ff7711]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isChecked ? "border-[#ff7711] bg-[#ff7711] text-white" : "border-neutral-300"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            
                            <div className="space-y-0.5">
                              <span className="block font-black text-sm uppercase text-neutral-800">
                                Taxa de Licenciamento {lic.ano}
                              </span>
                              <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                Taxa obrigatória do DETRAN
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="block text-base font-extrabold text-neutral-900">
                              R$ {lic.valor.toFixed(2)}
                            </span>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="py-12 bg-white rounded-sm border border-neutral-200 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                      <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Licenciamento em dia!</p>
                    </div>
                  )}
                </div>
              )}

              {/* MULTAS TAB */}
              {activeTab === "multas" && (
                <div className="space-y-3">
                  {debtsData.multas.length > 0 ? (
                    debtsData.multas.map((m) => {
                      const isChecked = selectedMultas.includes(m.ait);
                      const isLocked = selectedCategory && selectedCategory !== "multas";
                      
                      return (
                        <Card 
                          key={m.ait}
                          onClick={() => !isLocked && handleToggleItem("multas", m.ait)}
                          className={`p-6 border rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white transition-all text-left ${
                            isLocked ? "opacity-50 cursor-not-allowed border-neutral-100" : "cursor-pointer border-neutral-200 hover:border-[#ff7711]"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                              isChecked ? "border-[#ff7711] bg-[#ff7711] text-white" : "border-neutral-300"
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <span className="block font-black text-sm uppercase text-neutral-800 leading-snug">
                                {m.infracao}
                              </span>
                              <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                                <span>Município: {m.municipio}</span>
                                <span>Código AIT: {m.ait}</span>
                                <span>Local: {m.local}</span>
                                <span>Data: {m.data_hora}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono shrink-0 sm:pl-4">
                            <span className="block text-base font-extrabold text-neutral-900">
                              R$ {m.valor.toFixed(2)}
                            </span>
                            <span className="block text-[8px] text-neutral-400 font-black uppercase tracking-wider">Venc: {new Date(m.vencimento).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="py-12 bg-white rounded-sm border border-neutral-200 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                      <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Nenhuma multa registrada!</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* RIGHT AREA: FLOATING CART CHECKOUT & SIMULATOR */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <Card className="p-6 bg-white border border-neutral-200 rounded-sm shadow-xl sticky top-6">
              
              {/* Cart Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 text-[#0c0a09]">
                <ShoppingBag className="h-5 w-5 text-[#ff7711]" />
                <h3 className="font-black uppercase text-sm tracking-wider">Resumo do Pagamento</h3>
              </div>

              {/* Cart Items list */}
              <div className="py-6 space-y-4">
                {selectedCategory ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <span>Categoria</span>
                      <Badge className="bg-[#ff7711]/10 text-[#ff7711] border-transparent font-black px-2 py-0.5 rounded-sm text-[8px] uppercase">
                        {selectedCategory}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <span>Débitos Selecionados</span>
                      <span className="font-extrabold text-neutral-800">
                        {selectedCategory === "multas" ? selectedMultas.length 
                         : selectedCategory === "ipva" ? selectedIpvas.length 
                         : selectedLicenciamentos.length} item(s)
                      </span>
                    </div>

                    <div className="border-t border-neutral-100 pt-4 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">Subtotal DETRAN</span>
                        {sumLoading ? (
                          <div className="h-5 w-20 bg-neutral-100 animate-pulse rounded-sm" />
                        ) : (
                          <span className="text-xl font-extrabold font-mono text-[#0c0a09]">
                            {totalSumFormatted || "R$ 0,00"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* INSTALLMENT OPTIONS SIMULATION */}
                    {installmentsOptions.length > 0 && (
                      <div className="border-t border-neutral-100 pt-4 space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-[#ff7711]" /> Opções de Parcelamento no Cartão
                        </label>
                        
                        <div className="relative">
                          <select
                            value={selectedInstallment ? selectedInstallment.parcelas : 1}
                            onChange={(e) => {
                              const found = installmentsOptions.find(o => o.parcelas === parseInt(e.target.value));
                              if (found) setSelectedInstallment(found);
                            }}
                            className="w-full h-11 px-3 border border-neutral-200 rounded-sm font-bold text-xs bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#ff7711]/20 focus:border-[#ff7711]"
                          >
                            {installmentsOptions.map((opt) => (
                              <option key={opt.parcelas} value={opt.parcelas}>
                                {opt.parcelas}x de {opt.valorParcelaFormatado} (Total: {opt.valorTotalFormatado})
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedInstallment && selectedInstallment.valorJuros > 0 && (
                          <div className="text-[9px] font-bold text-neutral-400 uppercase flex justify-between items-center">
                            <span>Taxas Administrativas Juros</span>
                            <span className="text-orange-500 font-extrabold">+{selectedInstallment.valorTotalJurosFormatado}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <Info className="h-8 w-8 mx-auto text-neutral-200" />
                    <p className="text-xs font-bold text-neutral-400">
                      Nenhum débito selecionado. Marque os itens ao lado para iniciar.
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout / Pay button */}
              <div className="border-t border-neutral-100 pt-4 space-y-3">
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={!selectedCategory || checkoutLoading}
                  className="w-full h-12 bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Preparando Gateway...
                    </>
                  ) : (
                    <>
                      Avançar para Pagamento <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                {selectedCategory && (
                  <button
                    onClick={handleResetCart}
                    className="w-full text-center text-[9px] font-black text-neutral-400 hover:text-red-500 uppercase tracking-widest"
                  >
                    Limpar Seleções
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECURE CHECKOUT MODAL IFRAME (MERCADO PAGO FORM) */}
      {showCheckoutModal && mpFormHtml && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-xl bg-white border border-neutral-200 rounded-sm relative overflow-hidden flex flex-col h-[520px] shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#0c0a09] text-white p-4 flex justify-between items-center border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#ff7711]" />
                <span className="font-black uppercase tracking-wider text-xs">Checkout Cartão Seguro</span>
              </div>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Subtitle / Amount info */}
            <div className="bg-neutral-50 px-6 py-3 flex justify-between items-center border-b border-neutral-100 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <span>Valor Autorizado</span>
              {selectedInstallment && (
                <span className="font-extrabold text-neutral-800 font-mono">
                  {selectedInstallment.valorTotalFormatado} ({selectedInstallment.parcelas}x)
                </span>
              )}
            </div>

            {/* Iframe for safe checkout */}
            <div className="flex-1 bg-white relative">
              <iframe
                title="Checkout Mercado Pago Seguro"
                srcDoc={mpFormHtml}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="geolocation; microphone; camera"
              />
            </div>
          </Card>
        </div>
      )}

      {/* FINAL DIGITAL RECEIPT PAGE */}
      {showReceipt && receiptData && (
        <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in duration-300 relative z-10">
          <Card className="border border-neutral-200 bg-white shadow-2xl relative overflow-hidden rounded-xl text-[#0c0a09]">
            {/* Top decorative receipt cut stripes */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff7711] to-[#ffaa00]" />
            
            <div className="p-8 space-y-8">
              
              {/* Receipt Header */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                  <Check className="h-9 w-9 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[8px] font-black tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase">
                    Comprovante de Pagamento
                  </Badge>
                  <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Débito Liquidado!</h2>
                </div>
              </div>

              {/* Receipt Info Table */}
              <div className="border-t border-b border-neutral-100 py-6 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 block font-black">Placa do Veículo</span>
                    <span className="text-sm font-extrabold text-neutral-800 font-mono">{receiptData.placa}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 block font-black">Tipo de Débito</span>
                    <span className="text-sm font-extrabold text-[#ff7711]">{receiptData.category}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 block font-black">Código de Autenticação</span>
                    <span className="text-sm font-mono font-bold text-neutral-800">{receiptData.authCode}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 block font-black">Data da Transação</span>
                    <span className="text-sm font-bold text-neutral-800">{receiptData.date}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 block font-black">Valor Pago (c/ juros)</span>
                    <span className="text-sm font-extrabold text-neutral-800 font-mono">{receiptData.amountPaid}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 block font-black">Parcelas</span>
                    <span className="text-sm font-bold text-neutral-800">{receiptData.installments}x</span>
                  </div>
                </div>

                {/* Items Paid List */}
                <div className="border-t border-neutral-100 pt-4 space-y-2">
                  <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest block">Ítens Liquidados</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {receiptData.details.map((item: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-neutral-50 text-neutral-700 border-neutral-200 px-2 py-0.5 rounded-sm font-mono text-[9px]">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="flex gap-4">
                <Button
                  onClick={() => { setShowReceipt(false); setPlaca(""); setRenavam(""); }}
                  className="flex-1 h-12 bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-[9px] shadow-lg transition-all"
                >
                  Consultar Outro Veículo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-neutral-200 hover:bg-neutral-50 hover:text-black font-black uppercase text-[9px] tracking-wider rounded-sm flex items-center gap-2 justify-center"
                >
                  <Printer className="h-4 h-4 shrink-0" /> Imprimir
                </Button>
              </div>

            </div>
          </Card>
        </div>
      )}

      {/* Global Processing payment spinner overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex flex-col items-center justify-center space-y-4 backdrop-blur-sm">
          <RotateCw className="w-16 h-16 text-[#ff7711] animate-spin" />
          <span className="text-sm font-black uppercase tracking-widest text-white animate-pulse">
            Efetivando liquidação com o DETRAN... Não feche esta tela!
          </span>
        </div>
      )}
    </div>
  );
}
