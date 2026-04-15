"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Store,
  Truck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Wifi,
  Smartphone,
  AlertCircle,
  ChevronRight,
  MapPin,
  Package,
  Clock,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type MaquininhaModel = {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  taxRate: string;
  icon: React.ElementType;
  popular?: boolean;
  color: string;
};

const modelos: MaquininhaModel[] = [
  {
    id: "g8-smart",
    name: "G8 Smart",
    description: "Compacta e inteligente. Ideal para quem está começando.",
    features: ["Wi-Fi + Chip 4G", "NFC Contactless", "Bateria 12h", "Impressão rápida"],
    price: "R$ 0,00",
    taxRate: "1,99%",
    icon: Smartphone,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "g8-pro",
    name: "G8 Pro",
    description: "Para alto volume de vendas. Tela touch de 5.5 polegadas.",
    features: ["Android integrado", "Tela 5.5\" HD", "4G + Wi-Fi + Bluetooth", "Impressão térmica"],
    price: "R$ 12x de R$ 39,90",
    taxRate: "1,49%",
    icon: CreditCard,
    popular: true,
    color: "from-[#f97316] to-[#ea580c]",
  },
  {
    id: "g8-ultra",
    name: "G8 Ultra",
    description: "A mais completa. Gestão total no seu ponto de venda.",
    features: ["PDV completo", "Tela 7\" touch", "Câmera QR", "Relatórios avançados"],
    price: "R$ 12x de R$ 79,90",
    taxRate: "0,99%",
    icon: Store,
    color: "from-zinc-800 to-zinc-900",
  },
];

type FormStep = "select" | "form" | "confirm" | "success";

export default function MaquininhasPage() {
  const [step, setStep] = useState<FormStep>("select");
  const [selectedModel, setSelectedModel] = useState<MaquininhaModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    nomeEmpresa: "",
    cnpj: "",
    nomeResponsavel: "",
    cpfResponsavel: "",
    telefone: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    faturamentoMensal: "",
    quantidade: "1",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectModel = (model: MaquininhaModel) => {
    setSelectedModel(model);
    setStep("form");
  };

  const handleSubmitForm = () => {
    // Validate required fields
    const required = ["nomeEmpresa", "cnpj", "nomeResponsavel", "telefone", "email", "cep", "endereco", "numero", "bairro", "cidade", "estado"];
    const missing = required.filter((f) => !formData[f as keyof typeof formData]);

    if (missing.length > 0) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simula envio
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsSubmitting(false);
    setStep("success");
    toast.success("Solicitação enviada com sucesso!");
  };

  const handleReset = () => {
    setStep("select");
    setSelectedModel(null);
    setFormData({
      nomeEmpresa: "",
      cnpj: "",
      nomeResponsavel: "",
      cpfResponsavel: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      faturamentoMensal: "",
      quantidade: "1",
    });
  };

  return (
    <div className="p-4 md:p-8 xl:p-12 flex flex-col gap-8 h-full overflow-y-auto w-full no-scrollbar bg-[#f8f9fa] relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

      <div className="flex-1 space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-4">
          <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">
            Adquirência G8
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase">
            <span className="text-[#f97316]">Maquininhas</span> G8 Pay
          </h1>
          <p className="text-sm md:text-base text-neutral-700 font-bold max-w-2xl">
            Solicite sua maquininha e comece a receber pagamentos com as melhores taxas do mercado.
          </p>
        </div>

        {/* Step: Select Model */}
        {step === "select" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Zap, label: "Taxa a partir de", value: "0,99%", sub: "no débito" },
                { icon: Clock, label: "Receba em", value: "1 dia útil", sub: "D+1 automático" },
                { icon: Shield, label: "Segurança", value: "Certificado PCI", sub: "nível máximo" },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-sm border border-neutral-100 shadow-sm flex items-center gap-5 group hover:shadow-lg hover:border-[#f97316]/20 transition-all"
                >
                  <div className="w-12 h-12 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316] shrink-0 group-hover:scale-110 transition-transform">
                    <metric.icon className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">{metric.label}</p>
                    <p className="text-xl font-black text-[#0c0a09] tracking-tight leading-tight">{metric.value}</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{metric.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Models grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#0c0a09] tracking-tight uppercase tracking-[0.1em]">Escolha o modelo ideal</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {modelos.map((model) => {
                  const IconComp = model.icon;
                  return (
                    <div
                      key={model.id}
                      className={`bg-white rounded-sm border ${model.popular ? "border-[#f97316]/30 shadow-xl shadow-orange-100/50" : "border-neutral-100 shadow-sm"} overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative`}
                      onClick={() => handleSelectModel(model)}
                    >
                      {model.popular && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#f97316] to-[#ea580c]" />
                      )}
                      <div className={`h-40 bg-gradient-to-br ${model.color} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent)]" />
                        <IconComp className="h-16 w-16 text-white/90 drop-shadow-lg group-hover:scale-125 transition-transform duration-500" />
                        {model.popular && (
                          <Badge className="absolute top-4 right-4 bg-white text-[#f97316] border-0 font-black text-[8px] uppercase tracking-widest shadow-lg">
                            <Star className="h-3 w-3 mr-1 fill-[#f97316]" /> Mais vendido
                          </Badge>
                        )}
                      </div>
                      <div className="p-8 space-y-6">
                        <div>
                          <h3 className="text-xl font-black text-[#0c0a09] uppercase tracking-tight">{model.name}</h3>
                          <p className="text-xs font-bold text-neutral-400 mt-1 leading-relaxed">{model.description}</p>
                        </div>
                        <div className="space-y-2">
                          {model.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                              <span className="text-xs font-bold text-neutral-600">{feat}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-6 border-t border-neutral-50 space-y-3">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Valor</p>
                              <p className="text-lg font-black text-[#0c0a09]">{model.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Taxa débito</p>
                              <p className="text-lg font-black text-[#f97316]">{model.taxRate}</p>
                            </div>
                          </div>
                          <Button className="w-full h-12 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95">
                            Solicitar <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#0c0a09] rounded-sm p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f97316]/10 rounded-full blur-3xl" />
              <div className="w-20 h-20 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-sm flex items-center justify-center shrink-0 shadow-2xl">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Fature mais com G8 Pay</h3>
                <p className="text-sm text-white/50 font-medium max-w-lg leading-relaxed">
                  Nossas maquininhas aceitam todas as bandeiras: Visa, Mastercard, Elo, Amex, Hipercard e muito mais. Receba via débito, crédito e voucher.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                {["VISA", "MASTER", "ELO"].map((brand) => (
                  <div key={brand} className="w-16 h-10 bg-white/10 border border-white/10 rounded-sm flex items-center justify-center">
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step: Form */}
        {step === "form" && selectedModel && (
          <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Selected model summary */}
            <div className="flex items-center gap-6 p-6 bg-white border-2 border-[#f97316]/20 rounded-sm shadow-md">
              <div className={`w-14 h-14 bg-gradient-to-br ${selectedModel.color} rounded-sm flex items-center justify-center shrink-0`}>
                <selectedModel.icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-[#f97316] uppercase tracking-widest">Modelo selecionado</p>
                <p className="text-lg font-black text-[#0c0a09] uppercase tracking-tight">{selectedModel.name}</p>
              </div>
              <button
                onClick={() => setStep("select")}
                className="text-[10px] font-black text-[#f97316] uppercase tracking-widest shrink-0 px-4 py-2 border-2 border-[#f97316]/30 rounded-sm hover:bg-[#f97316]/10 transition-all"
              >
                Alterar
              </button>
            </div>

            {/* Form sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                {/* Business info */}
                <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-md space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
                  <div className="flex items-center gap-4 pb-5 border-b border-neutral-100">
                    <div className="w-10 h-10 bg-[#f97316] rounded-sm flex items-center justify-center">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-[#0c0a09] uppercase tracking-widest">Dados do Estabelecimento</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Razão Social / Nome Fantasia" required value={formData.nomeEmpresa} onChange={(v) => updateField("nomeEmpresa", v)} placeholder="Ex: Lanchonete do João" />
                    <FormField label="CNPJ / CPF" required value={formData.cnpj} onChange={(v) => updateField("cnpj", v)} placeholder="00.000.000/0000-00" />
                    <FormField label="Faturamento Mensal Estimado" value={formData.faturamentoMensal} onChange={(v) => updateField("faturamentoMensal", v)} placeholder="R$ 0,00" />
                    <FormField label="Quantidade de Maquininhas" value={formData.quantidade} onChange={(v) => updateField("quantidade", v)} placeholder="1" />
                  </div>
                </div>

                {/* Contact info */}
                <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-md space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
                  <div className="flex items-center gap-4 pb-5 border-b border-neutral-100">
                    <div className="w-10 h-10 bg-[#f97316] rounded-sm flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-[#0c0a09] uppercase tracking-widest">Dados de Contato</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nome do Responsável" required value={formData.nomeResponsavel} onChange={(v) => updateField("nomeResponsavel", v)} placeholder="Nome completo" />
                    <FormField label="CPF do Responsável" value={formData.cpfResponsavel} onChange={(v) => updateField("cpfResponsavel", v)} placeholder="000.000.000-00" />
                    <FormField label="Telefone / WhatsApp" required value={formData.telefone} onChange={(v) => updateField("telefone", v)} placeholder="(00) 00000-0000" />
                    <FormField label="E-mail" required value={formData.email} onChange={(v) => updateField("email", v)} placeholder="email@empresa.com" />
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white p-8 rounded-sm border border-neutral-200 shadow-md space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
                  <div className="flex items-center gap-4 pb-5 border-b border-neutral-100">
                    <div className="w-10 h-10 bg-[#f97316] rounded-sm flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-[#0c0a09] uppercase tracking-widest">Endereço de Entrega</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="CEP" required value={formData.cep} onChange={(v) => updateField("cep", v)} placeholder="00000-000" />
                    <div className="md:col-span-2">
                      <FormField label="Endereço" required value={formData.endereco} onChange={(v) => updateField("endereco", v)} placeholder="Rua, Avenida..." />
                    </div>
                    <FormField label="Número" required value={formData.numero} onChange={(v) => updateField("numero", v)} placeholder="000" />
                    <FormField label="Complemento" value={formData.complemento} onChange={(v) => updateField("complemento", v)} placeholder="Sala, loja..." />
                    <FormField label="Bairro" required value={formData.bairro} onChange={(v) => updateField("bairro", v)} placeholder="Bairro" />
                    <FormField label="Cidade" required value={formData.cidade} onChange={(v) => updateField("cidade", v)} placeholder="Cidade" />
                    <FormField label="Estado" required value={formData.estado} onChange={(v) => updateField("estado", v)} placeholder="UF" />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitForm}
                  className="w-full h-16 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
                >
                  Revisar Solicitação <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Sidebar info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-sm border-2 border-neutral-200 shadow-md p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f97316]" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f97316] rounded-sm flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-xs font-black text-[#0c0a09] uppercase tracking-widest">Entrega</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-[#0c0a09]/70 leading-relaxed">Prazo de entrega de <span className="text-[#0c0a09] font-black">5 a 10 dias úteis</span> após aprovação do cadastro.</p>
                    <div className="p-4 bg-[#f97316]/5 rounded-sm border border-[#f97316]/20 flex gap-3">
                      <Truck className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-[#0c0a09] leading-normal uppercase">
                        Frete <span className="text-[#f97316] font-black">grátis</span> para todo o Brasil.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-sm border-2 border-neutral-200 shadow-md p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-sm flex items-center justify-center text-white shrink-0">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-black text-[#0c0a09] uppercase tracking-widest">Suporte 24h</h4>
                  </div>
                  <p className="text-sm font-bold text-[#0c0a09]/70 leading-relaxed">
                    Suporte dedicado <span className="text-green-600 font-black">24h por dia</span>, 7 dias por semana. Assistência técnica remota incluída.
                  </p>
                </div>

                <div className="bg-[#f97316]/10 rounded-sm border-2 border-[#f97316]/20 p-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" />
                  <p className="text-[11px] font-black text-[#0c0a09] leading-normal">
                    Campos marcados com <span className="text-[#f97316] font-black text-sm">*</span> são obrigatórios. Seu cadastro será analisado em até <span className="text-[#f97316]">48h</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && selectedModel && (
          <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-[#0c0a09] tracking-tighter uppercase">Confirme sua solicitação</h2>
              <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">Revise os dados antes de enviar</p>
            </div>

            <div className="bg-white rounded-sm border border-neutral-100 shadow-2xl overflow-hidden">
              {/* Model header */}
              <div className={`p-8 bg-gradient-to-br ${selectedModel.color} flex items-center gap-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
                <div className="w-16 h-16 bg-white/20 rounded-sm flex items-center justify-center relative z-10">
                  <selectedModel.icon className="h-8 w-8 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-black text-white/60 uppercase tracking-widest">Modelo</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tight">{selectedModel.name}</p>
                </div>
                <div className="ml-auto text-right relative z-10">
                  <p className="text-xs font-black text-white/60 uppercase tracking-widest">Qtd</p>
                  <p className="text-2xl font-black text-white">{formData.quantidade}x</p>
                </div>
              </div>

              {/* Data summary */}
              <div className="p-8 space-y-8">
                <ConfirmSection title="Estabelecimento">
                  <ConfirmRow label="Razão Social" value={formData.nomeEmpresa} />
                  <ConfirmRow label="CNPJ / CPF" value={formData.cnpj} />
                  {formData.faturamentoMensal && <ConfirmRow label="Faturamento" value={formData.faturamentoMensal} />}
                </ConfirmSection>

                <ConfirmSection title="Responsável">
                  <ConfirmRow label="Nome" value={formData.nomeResponsavel} />
                  <ConfirmRow label="Telefone" value={formData.telefone} />
                  <ConfirmRow label="E-mail" value={formData.email} />
                </ConfirmSection>

                <ConfirmSection title="Endereço de Entrega">
                  <ConfirmRow label="Endereço" value={`${formData.endereco}, ${formData.numero}${formData.complemento ? ` - ${formData.complemento}` : ""}`} />
                  <ConfirmRow label="Bairro" value={formData.bairro} />
                  <ConfirmRow label="Cidade / UF" value={`${formData.cidade} - ${formData.estado}`} />
                  <ConfirmRow label="CEP" value={formData.cep} />
                </ConfirmSection>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep("form")}
                variant="outline"
                className="flex-1 h-16 border-2 border-neutral-200 text-neutral-400 rounded-sm font-black text-sm uppercase tracking-widest hover:border-[#f97316] hover:text-[#f97316] hover:bg-orange-50 transition-all"
              >
                Voltar e Editar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 h-16 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    Confirmar Solicitação <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-10 py-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-2xl relative border-4 border-white">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black text-[#0c0a09] tracking-tighter uppercase">Solicitação Enviada!</h2>
              <p className="text-base font-bold text-neutral-400 uppercase tracking-widest">
                Seu pedido de maquininha foi registrado com sucesso.
              </p>
            </div>

            <div className="w-full bg-white rounded-sm border border-neutral-100 shadow-2xl p-8 space-y-5 text-left">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-50">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-black text-[#0c0a09] uppercase tracking-widest">Próximos passos</span>
              </div>
              {[
                "Nossa equipe analisará seu cadastro em até 48h.",
                "Você receberá um e-mail com o status da aprovação.",
                "Após aprovação, a maquininha será enviada ao endereço informado.",
                "Prazo de entrega: 5 a 10 dias úteis.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#f97316]/10 rounded-sm flex items-center justify-center text-[#f97316] shrink-0 mt-0.5">
                    <span className="text-[10px] font-black">{i + 1}</span>
                  </div>
                  <p className="text-sm font-bold text-neutral-500">{text}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={handleReset}
              className="w-full h-16 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-sm font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-all"
            >
              Voltar ao início
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──── Reusable sub-components ──── */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-[11px] font-black text-[#0c0a09] uppercase tracking-widest block flex items-center gap-1">
        {label}
        {required && <span className="text-[#f97316] text-sm leading-none">*</span>}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 bg-white border-2 border-neutral-200 rounded-sm text-sm font-black focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all placeholder:text-neutral-400 text-[#0c0a09] shadow-sm"
      />
    </div>
  );
}

function ConfirmSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-50">
      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-[#0c0a09] text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
