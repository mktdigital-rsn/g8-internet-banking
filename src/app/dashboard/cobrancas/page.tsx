"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { cobrancaDataAtom } from "@/store/pagamentos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CobrancasPage() {
  const router = useRouter();
  const [cobrancaData, setCobrancaData] = useAtom(cobrancaDataAtom);
  const [inputValue, setInputValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const VALOR_MINIMO = 30;

  const handleNext = () => {
    const valor = parseFloat(inputValue.replace(",", "."));
    if (isNaN(valor) || valor < VALOR_MINIMO) {
      setError(`O valor mínimo para cobrança é ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(VALOR_MINIMO)}`);
      return;
    }
    setError(null);
    setCobrancaData({ ...cobrancaData, valor });
    router.push("/dashboard/cobrancas/pagador");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    const cleaned = text.replace(/[^\d,.]/g, "").replace(",", ".");
    if (!isNaN(parseFloat(cleaned))) {
      setInputValue(cleaned);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#0c0a09] tracking-tighter uppercase mb-2">Cobranças</h1>
        <p className="text-neutral-500 font-medium">Gere boletos para cobrar terceiros e receba em sua conta.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <Card className="border-none shadow-2xl bg-white overflow-hidden group rounded-none">
          <CardHeader className="bg-[#0c0a09] text-white p-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ff7711]" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#ff7711] rounded-none">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight uppercase">Gerar Boleto</CardTitle>
                <CardDescription className="text-white/60 font-bold uppercase text-[12px] tracking-widest">Passo 1 de 2: Defina o valor</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#ff7711]">Qual o valor da cobrança?</label>
              <div className="relative group/input">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-[#ff7711]">R$</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^\d,.]/g, ""))}
                  onPaste={handlePaste}
                  placeholder="0,00"
                  className={cn(
                    "w-full bg-neutral-50 border-2 border-neutral-100 rounded-none py-8 pl-20 pr-8 text-5xl font-black text-[#0c0a09] placeholder:text-neutral-200 focus:outline-none focus:border-[#ff7711] transition-all",
                    error && "border-red-500 bg-red-50"
                  )}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="bg-orange-50 rounded-none p-6 border-l-4 border-[#ff7711]">
               <ul className="space-y-3">
                 <li className="flex items-center gap-3 text-orange-900/70 text-sm font-bold">
                   <div className="h-2 w-2 bg-[#ff7711] rounded-none" />
                   Valor mínimo: R$ 30,00
                 </li>
                 <li className="flex items-center gap-3 text-orange-900/70 text-sm font-bold">
                   <div className="h-2 w-2 bg-[#ff7711] rounded-none" />
                   Compensação em até 3 dias úteis
                 </li>
                 <li className="flex items-center gap-3 text-orange-900/70 text-sm font-bold">
                   <div className="h-2 w-2 bg-[#ff7711] rounded-none" />
                   O valor cairá diretamente no seu saldo
                 </li>
               </ul>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-[#0c0a09] hover:bg-[#ff7711] text-white h-16 rounded-none text-lg font-black uppercase tracking-widest transition-all group/btn shadow-xl shadow-orange-500/10 hover:shadow-orange-500/30"
            >
              Próximo Passo
              <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="p-8 bg-[#0c0a09] rounded-none text-white relative overflow-hidden group border border-white/5 shadow-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff7711]" />
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <Banknote className="h-32 w-32 rotate-12" />
            </div>
            <h3 className="text-xl font-black mb-4 relative z-10 text-[#ff7711] uppercase tracking-tighter">Dicas para suas cobranças</h3>
            <p className="text-white/60 font-medium leading-relaxed relative z-10">
              Mantenha os dados do pagador sempre atualizados para evitar problemas na emissão. O e-mail é fundamental para que o pagador receba o boleto automaticamente.
            </p>
          </div>
          
          <div className="p-8 border-2 border-dashed border-neutral-200 rounded-none relative">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-200" />
             <h4 className="text-neutral-400 font-black text-[12px] uppercase tracking-widest mb-6">Histórico de emissão</h4>
             <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <div className="h-12 w-12 rounded-none bg-neutral-100 flex items-center justify-center mb-4">
                   <Banknote className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="text-neutral-400 font-bold text-sm">Nenhuma cobrança emitida recentemente</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
