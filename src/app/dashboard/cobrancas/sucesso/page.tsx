"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { cobrancaDataAtom, cobrancaHtmlAtom } from "@/store/pagamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Printer, ArrowRight, Home, Banknote, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CobrancaSucessoPage() {
  const router = useRouter();
  const [cobrancaData] = useAtom(cobrancaDataAtom);
  const [cobrancaHtml] = useAtom(cobrancaHtmlAtom);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
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
        // Não fechar automaticamente para o usuário poder salvar como PDF
      }, 500);
    }
  };

  const handleDownloadPdf = async () => {
    if (!cobrancaHtml) return;
    setIsGeneratingPdf(true);
    const toastId = toast.loading("Trabalhando no seu PDF oficial...");

    try {
      // Em vez de iframe, vamos usar um div oculto no documento principal
      // Isso evita muitos problemas de segurança/CORS do iframe
      const div = document.createElement("div");
      div.id = "pdf-temp-container";
      div.style.position = "fixed";
      div.style.left = "-9999px";
      div.style.top = "0";
      div.style.width = "850px"; // Largura A4 padrão
      div.style.background = "white";
      div.style.color = "black";
      div.innerHTML = cobrancaHtml;
      document.body.appendChild(div);

      // Esperar o renderizador e imagens carregarem
      await new Promise(resolve => setTimeout(resolve, 3000));

      const canvas = await html2canvas(div, {
        scale: 2,
        useCORS: true,
        logging: true, // Habilitar logging para ajudar a debugar se falhar de novo
        backgroundColor: "#ffffff",
        windowWidth: 850
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pageWidth / (imgWidth / 2), pageHeight / (imgHeight / 2));
      
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth * ratio / 2, imgHeight * ratio / 2);
      
      const fileName = `boleto_g8pay_${cobrancaData.pagadorNome.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(div);
      toast.dismiss(toastId);
      toast.success("PDF baixado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.dismiss(toastId);
      // Fallback amigável se o canvas falhar (CORS de imagens do banco é o suspeito)
      toast.error("O download direto falhou. Por favor, use 'Imprimir' e escolha 'Salvar como PDF'.", {
        duration: 8000,
        icon: <AlertTriangle className="text-red-500" />
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!cobrancaHtml) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center justify-center py-10 max-w-7xl mx-auto px-4">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-emerald-500 rounded-sm flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 animate-bounce relative overflow-hidden">
            <div className="absolute inset-0 border-4 border-white/20" />
            <CheckCircle2 className="h-12 w-12 text-white relative z-10" />
          </div>
          <Badge className="bg-emerald-500 text-white border-0 px-4 py-1 font-black text-[10px] uppercase tracking-widest rounded-sm mb-4">Registro Efetuado</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-[#0c0a09] tracking-tighter uppercase mb-2">Cobrança Gerada!</h1>
          <p className="text-neutral-500 font-medium max-w-md italic">
            O boleto para <span className="text-[#0c0a09] font-black">{cobrancaData.pagadorNome}</span> está pronto para ser pago.
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-white rounded-sm mb-10 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#f97316]" />
          <div className="bg-[#0c0a09] p-8 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-[#f97316] rounded-sm flex items-center justify-center shadow-xl shadow-orange-500/20">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#f97316] mb-1">Valor do Título</p>
                <p className="text-3xl md:text-5xl font-black tracking-tighter whitespace-nowrap">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cobrancaData.valor)}</p>
              </div>
            </div>
            <div className="md:text-right relative z-10">
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Vencimento</p>
              <p className="text-2xl font-black text-[#f97316] tracking-tighter">{new Date(cobrancaData.dataVencimento).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <CardContent className="p-10 space-y-10">
            <div className="grid sm:grid-cols-2 gap-6">
              <Button 
                onClick={handlePrint}
                className="h-28 bg-[#0c0a09] hover:bg-black text-white rounded-sm font-black uppercase text-sm tracking-widest transition-all gap-4 shadow-xl active:scale-95 flex flex-col items-center justify-center py-4 group"
              >
                <Printer className="h-8 w-8 text-[#f97316] group-hover:scale-110 transition-transform" />
                Visualizar e Imprimir
              </Button>
              <Button 
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="h-28 bg-[#f97316] hover:bg-orange-600 text-white rounded-sm font-black uppercase text-sm tracking-widest transition-all gap-4 shadow-xl active:scale-95 flex flex-col items-center justify-center py-4 group"
              >
                {isGeneratingPdf ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                    <Download className="h-8 w-8 group-hover:translate-y-1 transition-transform" />
                )}
                Baixar PDF Agora
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4">
           <Button
             onClick={() => router.push("/dashboard")}
             variant="outline"
             className="flex-1 h-20 rounded-sm border-2 border-neutral-200 hover:border-[#0c0a09] text-[#0c0a09] font-black uppercase tracking-widest text-[11px] gap-3 transition-all"
           >
             <Home className="h-5 w-5" />
             Painel Inicial
           </Button>
           <Button
             onClick={() => router.push("/dashboard/cobrancas")}
             className="flex-[2] h-20 bg-[#0c0a09] hover:bg-[#f97316] text-white rounded-sm font-black uppercase tracking-[0.2em] text-[11px] group relative overflow-hidden shadow-2xl transition-all"
           >
             <span className="relative z-10">Gerar Outra Cobrança</span>
             <ArrowRight className="ml-3 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
             <div className="absolute inset-0 bg-[#f97316] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-full group-hover:translate-y-0" />
           </Button>
        </div>
      </div>
    </div>
  );
}
