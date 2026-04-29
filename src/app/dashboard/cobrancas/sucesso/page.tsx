"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { cobrancaDataAtom, cobrancaHtmlAtom } from "@/store/pagamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, Download, Printer, ArrowRight, Home, Banknote, 
  Loader2, AlertTriangle, Repeat, CalendarCheck, Layers, ChevronLeft, ChevronRight as ChevronRightIcon 
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CobrancaSucessoPage() {
  const router = useRouter();
  const [cobrancaData] = useAtom(cobrancaDataAtom);
  const [cobrancaHtml] = useAtom(cobrancaHtmlAtom);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback para gerar parcelas visuais caso o registro no banco ainda esteja em processamento
  const displayResults = (cobrancaData.results && cobrancaData.results.length > 0)
    ? cobrancaData.results
    : Array.from({ length: cobrancaData.quantidadeMeses || 1 }).map((_, i) => {
        const d = new Date(cobrancaData.dataVencimento || Date.now());
        d.setMonth(d.getMonth() + i);
        return {
          html: "<h1>REGISTRANDO</h1><p>Este boleto está sendo processado pelo banco e estará disponível em breve no seu extrato.</p>",
          dataVencimento: d.toISOString().split('T')[0],
          isPlaceholder: true
        };
      });

  const currentResult = displayResults[selectedIndex] || { html: cobrancaHtml || "", dataVencimento: cobrancaData.dataVencimento };
  const activeHtml = currentResult.html;
  const activeDate = currentResult.dataVencimento;

  const formatDateSync = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  useEffect(() => {
    if (!cobrancaHtml && (!cobrancaData.results || cobrancaData.results.length === 0)) {
      router.push("/dashboard/cobrancas");
    }
  }, [cobrancaHtml, cobrancaData.results, router]);

  const handleDownloadPdf = async () => {
    if (!activeHtml) return;
    if (currentResult.isPlaceholder) {
      toast.info("Aguarde o registro final do boleto para baixar o PDF oficial.");
      return;
    }

    setIsGeneratingPdf(true);
    const toastId = toast.loading("Gerando PDF oficial...");

    try {
      // Cria um iframe oculto para isolar o HTML do boleto e evitar erros de CSS global (ex: lab())
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Não foi possível acessar o iframe");

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { margin: 0; padding: 0; background: white; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${activeHtml}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Aguarda o carregamento do conteúdo e fontes no iframe
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 850 // Largura padrão de boleto
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      
      let imgWidth = pageWidth;
      let imgHeight = pageWidth / ratio;
      
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = pageHeight * ratio;
      }

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      
      const fileName = `boleto_${formatDateSync(activeDate).replace(/\//g, "-")}_${cobrancaData.pagadorNome.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(iframe);
      toast.dismiss(toastId);
      toast.success("Download concluído!");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.dismiss(toastId);
      toast.error("Erro no download direto. Use 'Visualizar e Imprimir'.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (!activeHtml) return;
    if (currentResult.isPlaceholder) {
      toast.info("Este título ainda está sendo registrado. Tente imprimir em alguns instantes no menu de Cobranças.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(activeHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (!cobrancaHtml && (!cobrancaData.results || cobrancaData.results.length === 0)) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center justify-center py-10 max-w-7xl mx-auto px-4">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-emerald-500 rounded-sm flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 animate-bounce relative overflow-hidden">
            <div className="absolute inset-0 border-4 border-white/20" />
            <CheckCircle2 className="h-12 w-12 text-white relative z-10" />
          </div>
          <Badge className="bg-emerald-500 text-white border-0 px-4 py-1 font-black text-[10px] uppercase tracking-widest rounded-sm mb-4">
            {cobrancaData.isRecorrente ? "RECORRÊNCIA ATIVA" : "REGISTRO EFETUADO"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-[#0c0a09] tracking-tighter uppercase mb-2">
            {cobrancaData.isRecorrente ? `${cobrancaData.quantidadeMeses} Cobranças!` : "Cobrança Gerada!"}
          </h1>
          <p className="text-neutral-500 font-medium max-w-md italic">
            {cobrancaData.isRecorrente 
              ? `As ${cobrancaData.quantidadeMeses} mensalidades para ${cobrancaData.pagadorNome} foram registradas com sucesso.`
              : `O boleto para ${cobrancaData.pagadorNome} está pronto para ser pago.`}
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-white rounded-sm mb-10 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#0c0a09]" />
          <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] p-8 md:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-sm flex items-center justify-center shadow-xl border border-white/30">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Valor do Título</p>
                <p className="text-3xl md:text-5xl font-black tracking-tighter whitespace-nowrap text-white">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cobrancaData.valor)}</p>
              </div>
            </div>
            <div className="md:text-right relative z-10">
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">
                {cobrancaData.isRecorrente ? `${selectedIndex + 1}ª Mensalidade` : "Data de Vencimento"}
              </p>
              <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                {formatDateSync(activeDate)}
              </p>
              {cobrancaData.isRecorrente && (
                <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <Repeat className="h-3 w-3" /> Ciclo de {cobrancaData.quantidadeMeses} meses
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-10 space-y-10">
            {cobrancaData.isRecorrente && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-xs font-black text-[#0c0a09] uppercase tracking-widest flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#f97316]" /> Seleção do Boleto
                      </h4>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Escolha qual parcela deseja visualizar ou imprimir</p>
                   </div>
                   <Badge className="bg-[#f97316]/10 text-[#f97316] border-0 text-[10px] uppercase font-black tracking-widest">{selectedIndex + 1} de {displayResults.length}</Badge>
                </div>
                
                <div className="flex items-center gap-4 overflow-x-auto py-10 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent -mx-6 px-6">
                  {displayResults.map((res: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "shrink-0 min-w-[170px] p-8 rounded-sm border-2 transition-all flex flex-col items-center gap-4 snap-center group relative overflow-hidden",
                        selectedIndex === idx 
                          ? "border-[#f97316] bg-orange-50/50 shadow-2xl scale-110 z-10" 
                          : "border-neutral-100 opacity-60 hover:opacity-100 bg-white hover:border-neutral-200"
                      )}
                    >
                      {selectedIndex === idx && <div className="absolute top-0 right-0 p-1.5 bg-[#f97316] text-white rounded-bl-sm"><CheckCircle2 className="h-3 w-3" /></div>}
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", selectedIndex === idx ? "bg-[#f97316] text-white" : "bg-neutral-100 text-neutral-400")}>
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", selectedIndex === idx ? "text-[#f97316]" : "text-neutral-400")}>{idx + 1}ª Parcela</p>
                        <p className="text-sm font-black text-[#0c0a09] font-mono">{formatDateSync(res.dataVencimento)}</p>
                      </div>
                      {res.isPlaceholder && <Badge className="mt-1 bg-blue-500/10 text-blue-500 border-0 text-[7px] uppercase font-black tracking-widest">Processando</Badge>}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
