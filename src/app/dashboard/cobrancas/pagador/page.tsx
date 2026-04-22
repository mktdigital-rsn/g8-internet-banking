"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { cobrancaDataAtom, cobrancaHtmlAtom } from "@/store/pagamentos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, MapPin, Hash, Building2, ArrowLeft, Send, Loader2 } from "lucide-react";
import { cleanTaxNumber, cleanCep, removeAccents } from "@/lib/utils";
import api from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

export default function PagadorDataPage() {
  const router = useRouter();
  const [cobrancaData, setCobrancaData] = useAtom(cobrancaDataAtom);
  const [, setCobrancaHtml] = useAtom(cobrancaHtmlAtom);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCepLoading, setIsCepLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    pagadorNome: cobrancaData.pagadorNome,
    pagadorTaxNumber: cobrancaData.pagadorTaxNumber,
    pagadorEmail: cobrancaData.pagadorEmail,
    pagadorCep: cobrancaData.pagadorCep,
    pagadorBairro: cobrancaData.pagadorBairro,
    pagadorRua: cobrancaData.pagadorRua,
    pagadorCidade: cobrancaData.pagadorCidade,
    pagadorUf: cobrancaData.pagadorUf,
    pagadorNumero: cobrancaData.pagadorNumero,
    dataVencimento: cobrancaData.dataVencimento || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleCepBlur = async () => {
    const cep = cleanCep(formData.pagadorCep);
    if (cep.length === 8) {
      setIsCepLoading(true);
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`);
        const { street, neighborhood, city, state } = response.data;
        setFormData(prev => ({
          ...prev,
          pagadorRua: street || "",
          pagadorBairro: neighborhood || "",
          pagadorCidade: city || "",
          pagadorUf: state || "",
        }));
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pagadorNome || !formData.pagadorTaxNumber || !formData.pagadorEmail || !formData.pagadorCep || !formData.pagadorNumero) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    try {
      // Normalizing data as per API feedback (UTF-8/Removing Accents and correct payload)
      const payload = {
        valor: cobrancaData.valor,
        pagadorNome: removeAccents(formData.pagadorNome),
        pagadorTaxNumber: cleanTaxNumber(formData.pagadorTaxNumber),
        pagadorCep: cleanCep(formData.pagadorCep),
        pagadorPessoaTipo: cleanTaxNumber(formData.pagadorTaxNumber).length > 11 ? "legal" : "natural",
        pagadorBairro: removeAccents(formData.pagadorBairro),
        pagadorRua: removeAccents(`${formData.pagadorRua}, ${formData.pagadorNumero}`),
        pagadorEmail: formData.pagadorEmail.toLowerCase().trim(),
        dataVencimento: formData.dataVencimento,
      };

      console.log("📤 [COBRANCA PAYLOAD]:", payload);

      // Force response as text because API returns ModelAndView (HTML)
      const response = await api.post("/api/banco/pagamentos/gerar-boleto-cobranca", payload, {
        responseType: 'text',
        transformResponse: [(data) => data] // Prevent axios from trying to parse JSON
      });
      
      if (response.data) {
        console.log("✅ [COBRANCA SUCCESS]: Received HTML content");
        setCobrancaHtml(response.data);
        setCobrancaData({ ...cobrancaData, ...formData });
        router.push("/dashboard/cobrancas/sucesso");
      }
    } catch (error: any) {
      console.error("❌ [COBRANCA ERROR]:", error);
      const errorMsg = error.response?.data || error.message || "Erro ao gerar boleto.";
      toast.error("Erro ao gerar boleto. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex items-center gap-6">
        <button 
          onClick={() => router.back()}
          className="p-3 hover:bg-neutral-100 rounded-none transition-colors text-[#0c0a09] border border-transparent hover:border-[#ff7711]"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-[#0c0a09] tracking-tighter uppercase mb-2">Dados do Pagador</h1>
          <p className="text-neutral-500 font-medium">Preencha as informações de quem irá realizar o pagamento.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Dados Pessoais */}
          <Card className="border-none shadow-2xl bg-white rounded-none relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ff7711]" />
            <CardHeader className="border-b border-neutral-50 p-8">
              <CardTitle className="text-xl font-black uppercase flex items-center gap-3">
                <User className="h-5 w-5 text-[#ff7711]" />
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Nome Completo / Razão Social</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                  <Input 
                    value={formData.pagadorNome}
                    onChange={(e) => setFormData({...formData, pagadorNome: e.target.value})}
                    placeholder="Ex: João da Silva"
                    className="pl-12 h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">CPF ou CNPJ</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                  <Input 
                    value={formData.pagadorTaxNumber}
                    onChange={(e) => setFormData({...formData, pagadorTaxNumber: e.target.value})}
                    placeholder="Somente números"
                    className="pl-12 h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                  <Input 
                    type="email"
                    value={formData.pagadorEmail}
                    onChange={(e) => setFormData({...formData, pagadorEmail: e.target.value})}
                    placeholder="cliente@email.com"
                    className="pl-12 h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Data de Vencimento</label>
                <Input 
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                  className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="border-none shadow-2xl bg-white rounded-none relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ff7711]" />
            <CardHeader className="border-b border-neutral-50 p-8">
              <CardTitle className="text-xl font-black uppercase flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#ff7711]" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">CEP</label>
                  <div className="relative">
                    <Input 
                      value={formData.pagadorCep}
                      onChange={(e) => setFormData({...formData, pagadorCep: e.target.value})}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                    />
                    {isCepLoading && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#ff7711]" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Número</label>
                  <Input 
                    value={formData.pagadorNumero}
                    onChange={(e) => setFormData({...formData, pagadorNumero: e.target.value})}
                    placeholder="123"
                    className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Rua / Logradouro</label>
                <Input 
                  value={formData.pagadorRua}
                  onChange={(e) => setFormData({...formData, pagadorRua: e.target.value})}
                  placeholder="Nome da rua"
                  className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Bairro</label>
                <Input 
                  value={formData.pagadorBairro}
                  onChange={(e) => setFormData({...formData, pagadorBairro: e.target.value})}
                  placeholder="Seu bairro"
                  className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Cidade</label>
                  <Input 
                    value={formData.pagadorCidade}
                    onChange={(e) => setFormData({...formData, pagadorCidade: e.target.value})}
                    placeholder="Cidade"
                    className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">UF</label>
                  <Input 
                    value={formData.pagadorUf}
                    onChange={(e) => setFormData({...formData, pagadorUf: e.target.value})}
                    placeholder="UF"
                    className="h-14 bg-neutral-50 border-neutral-100 font-bold focus:border-[#ff7711] focus:ring-0 rounded-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-neutral-400 font-bold text-sm">
             <div className="p-2 bg-[#ff7711]/10 rounded-none border border-[#ff7711]/20">
                <Hash className="h-4 w-4 text-[#ff7711]" />
             </div>
             Valor selecionado: <span className="text-[#0c0a09] font-black text-lg">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cobrancaData.valor)}</span>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-20 bg-[#0c0a09] hover:bg-[#ff7711] text-white rounded-none text-xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl relative overflow-hidden group"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <span className="relative z-10">Gerar Cobrança Agora</span>
                <Send className="ml-3 h-5 w-5 relative z-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                <div className="absolute inset-0 bg-[#ff7711] opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-0" />
              </>
            )}
          </Button>
          
          <p className="text-[12px] text-neutral-400 font-bold uppercase tracking-widest text-center">
            Ao clicar em gerar, o boleto será registrado no Banco Central e o PDF estará disponível.
          </p>
        </div>
      </form>
    </div>
  );
}
