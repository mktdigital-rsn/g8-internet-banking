"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { cobrancaDataAtom, cobrancaHtmlAtom } from "@/store/pagamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Printer, Share2, ArrowRight, Home, Banknote } from "lucide-react";
import { toast } from "sonner";

export default function CobrancaSucessoPage() {
  const router = useRouter();
  const [cobrancaData] = useAtom(cobrancaDataAtom);
  const [cobrancaHtml] = useAtom(cobrancaHtmlAtom);

  React.useEffect(() => {
    if (!cobrancaHtml) {
      router.push("/dashboard/cobrancas");
    }
  }, [cobrancaHtml, router]);

  const handlePrint = () => {
    if (!cobrancaHtml) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(cobrancaHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownload = () => {
    if (!cobrancaHtml) return;
    const blob = new Blob([cobrancaHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boleto_cobranca_${cobrancaData.pagadorNome.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Arquivo baixado com sucesso!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Boleto de Cobrança G8Pay",
        text: `Boleto de cobrança no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cobrancaData.valor)} para ${cobrancaData.pagadorNome}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      toast.info("Compartilhamento não suportado neste navegador.");
    }
  };

  if (!cobrancaHtml) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-emerald-500 rounded-none flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 animate-bounce relative">
            <div className="absolute inset-0 border-2 border-white/20" />
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[#0c0a09] tracking-tighter uppercase mb-2">Cobrança Gerada!</h1>
          <p className="text-neutral-500 font-medium max-w-md">
            O boleto para <span className="text-[#0c0a09] font-black">{cobrancaData.pagadorNome}</span> foi gerado com sucesso e já está registrado.
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-white rounded-none mb-10 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ff7711]" />
          <div className="bg-[#0c0a09] p-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ff7711] rounded-none">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Resumo da Cobrança</p>
                <p className="text-xl font-black">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cobrancaData.valor)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-black uppercase tracking-widest text-white/50">Vencimento</p>
              <p className="text-sm font-black text-[#ff7711]">{new Date(cobrancaData.dataVencimento).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Pagador</p>
                <p className="text-sm font-black text-[#0c0a09] uppercase">{cobrancaData.pagadorNome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Documento</p>
                <p className="text-sm font-black text-[#0c0a09]">{cobrancaData.pagadorTaxNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">E-mail</p>
                <p className="text-sm font-black text-[#0c0a09]">{cobrancaData.pagadorEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-widest text-[#ff7711]">Status</p>
                <p className="text-sm font-black text-emerald-600 uppercase">Aguardando Pagamento</p>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-100 grid md:grid-cols-3 gap-4">
              <Button 
                onClick={handlePrint}
                className="h-14 bg-neutral-50 hover:bg-[#ff7711] hover:text-white text-[#0c0a09] rounded-none font-black uppercase text-[12px] tracking-widest transition-all gap-2 border border-neutral-200"
              >
                <Printer className="h-4 w-4" />
                Visualizar / Imprimir
              </Button>
              <Button 
                onClick={handleDownload}
                className="h-14 bg-neutral-50 hover:bg-[#ff7711] hover:text-white text-[#0c0a09] rounded-none font-black uppercase text-[12px] tracking-widest transition-all gap-2 border border-neutral-200"
              >
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
              <Button 
                onClick={handleShare}
                className="h-14 bg-neutral-50 hover:bg-[#ff7711] hover:text-white text-[#0c0a09] rounded-none font-black uppercase text-[12px] tracking-widest transition-all gap-2 border border-neutral-200"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4">
           <Button
             onClick={() => router.push("/dashboard")}
             variant="outline"
             className="flex-1 h-16 rounded-none border-2 border-neutral-200 hover:border-[#0c0a09] text-[#0c0a09] font-black uppercase tracking-widest text-xs gap-2"
           >
             <Home className="h-4 w-4" />
             Ir para o Início
           </Button>
           <Button
             onClick={() => router.push("/dashboard/cobrancas")}
             className="flex-[2] h-16 bg-[#0c0a09] hover:bg-[#ff7711] text-white rounded-none font-black uppercase tracking-widest text-xs group relative overflow-hidden"
           >
             <span className="relative z-10">Gerar Nova Cobrança</span>
             <ArrowRight className="ml-3 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
             <div className="absolute inset-0 bg-[#ff7711] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-full group-hover:translate-y-0" />
           </Button>
        </div>
      </div>
    </div>
  );
}
