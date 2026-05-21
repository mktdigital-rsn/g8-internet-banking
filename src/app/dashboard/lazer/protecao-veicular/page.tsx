"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Car, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  RotateCw, 
  Check, 
  X, 
  Sparkles, 
  Info, 
  DollarSign, 
  MapPin, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  HeartHandshake
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

// Step structure definition
const stepsConfig = [
  { label: "Placa", desc: "Consulta de Placa" },
  { label: "Tipo", desc: "Tipo do Veículo" },
  { label: "Marca", desc: "Marca do Veículo" },
  { label: "Ano", desc: "Ano-modelo" },
  { label: "Modelo", desc: "Modelo do Veículo" },
  { label: "Revisão", desc: "Dados da FIPE" },
  { label: "Planos", desc: "Escolha do Plano" },
  { label: "Finalizar", desc: "Confirmação" }
];

export default function ProtecaoVeicularPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Form State
  const [placa, setPlaca] = useState("");
  const [placaData, setPlacaData] = useState<{ year: string; fuel: string } | null>(null);
  
  // API Lists
  const [tiposVeiculo, setTiposVeiculo] = useState<{ code: string; name: string }[]>([]);
  const [marcas, setMarcas] = useState<{ code: string; name: string }[]>([]);
  const [anos, setAnos] = useState<{ code: string; name: string }[]>([]);
  const [modelos, setModelos] = useState<{ code: string; name: string }[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [benefitsCache, setBenefitsCache] = useState<{ [key: string]: any[] }>({});
  
  // Selected IDs and Labels
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedTipoTexto, setSelectedTipoTexto] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedMarcaTexto, setSelectedMarcaTexto] = useState("");
  const [selectedAno, setSelectedAno] = useState("");
  const [selectedAnoTexto, setSelectedAnoTexto] = useState("");
  const [selectedModelo, setSelectedModelo] = useState("");
  const [selectedModeloTexto, setSelectedModeloTexto] = useState("");
  
  // Auto-selection flags
  const [autoSelectedAno, setAutoSelectedAno] = useState(false);

  // Sigga and Fipe responses
  const [quotationCode, setQuotationCode] = useState("");
  const [fipeRealCode, setFipeRealCode] = useState("");
  const [fipeValue, setFipeValue] = useState("");
  const [fipeValueQuoted, setFipeValueQuoted] = useState("");
  const [chassi, setChassi] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  
  // Combined Fipe response details
  const [fipeDetails, setFipeDetails] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Search filter for brands and models
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  // Step 1: Query Plate
  const handlePlacaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleanPlaca.length !== 7) {
      toast.error("Por favor, digite uma placa válida com 7 caracteres.");
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get(`/api/protecao-veicular/placa?placa=${cleanPlaca}`);
      if (response.data) {
        setPlacaData({
          year: response.data.year || "",
          fuel: response.data.fuel || ""
        });
        toast.success(`Placa localizada! Ano ${response.data.year || "N/A"}, Combustível ${response.data.fuel || "N/A"}`);
      } else {
        setPlacaData(null);
        toast.info("Placa não encontrada nos registros de pré-dados. Mas você pode continuar preenchendo manualmente!");
      }
      setStep(2);
    } catch (err) {
      console.error("Erro ao buscar placa:", err);
      setPlacaData(null);
      toast.info("Não conseguimos buscar os dados automáticos da placa, mas você pode continuar preenchendo manualmente!");
      setStep(2);
    } finally {
      setSearchLoading(false);
    }
  };

  // Step 2: Fetch Vehicle Types on entry
  useEffect(() => {
    if (step === 2 && tiposVeiculo.length === 0) {
      const fetchTipos = async () => {
        setLoading(true);
        try {
          const response = await api.get("/api/protecao-veicular/tipos-de-veiculos");
          setTiposVeiculo(response.data || []);
        } catch (err) {
          console.error("Erro ao buscar tipos de veículo:", err);
          toast.error("Erro ao obter tipos de veículo do servidor.");
        } finally {
          setLoading(false);
        }
      };
      fetchTipos();
    }
  }, [step, tiposVeiculo]);

  // Handle vehicle type selection -> proceeds to Step 3
  const handleSelectTipo = (tipoCode: string, tipoName: string) => {
    setSelectedTipo(tipoCode);
    setSelectedTipoTexto(tipoName);
    // Reset following states
    setMarcas([]);
    setSelectedMarca("");
    setSelectedMarcaTexto("");
    setAnos([]);
    setSelectedAno("");
    setSelectedAnoTexto("");
    setModelos([]);
    setSelectedModelo("");
    setSelectedModeloTexto("");
    setAutoSelectedAno(false);
    setBrandFilter("");
    setModelFilter("");
    
    setStep(3);
  };

  // Step 3: Fetch Brands when vehicle type is set
  useEffect(() => {
    if (step === 3 && selectedTipo && marcas.length === 0) {
      const fetchBrands = async () => {
        setLoading(true);
        try {
          const response = await api.post("/api/protecao-veicular/buscar-marcas", {
            veiculo: selectedTipo
          });
          setMarcas(response.data || []);
        } catch (err) {
          console.error("Erro ao buscar marcas:", err);
          toast.error("Erro ao obter lista de marcas do servidor.");
        } finally {
          setLoading(false);
        }
      };
      fetchBrands();
    }
  }, [step, selectedTipo, marcas]);

  const handleSelectMarca = (marcaCode: string, marcaName: string) => {
    setSelectedMarca(marcaCode);
    setSelectedMarcaTexto(marcaName);
    // Reset following states
    setAnos([]);
    setSelectedAno("");
    setSelectedAnoTexto("");
    setModelos([]);
    setSelectedModelo("");
    setSelectedModeloTexto("");
    setAutoSelectedAno(false);
    setModelFilter("");

    setStep(4);
  };

  // Step 4: Fetch Years when brand is set
  useEffect(() => {
    if (step === 4 && selectedTipo && selectedMarca && anos.length === 0) {
      const fetchYears = async () => {
        setLoading(true);
        try {
          const response = await api.post("/api/protecao-veicular/buscar-anos", {
            veiculo: selectedTipo,
            marcaId: selectedMarca
          });
          const yearsList = response.data || [];
          setAnos(yearsList);

          // Smart auto-selection: Look for matching year & fuel type from Step 1
          if (placaData && placaData.year) {
            const matchedYear = yearsList.find((y: any) => {
              const nameLower = y.name.toLowerCase();
              const yearMatches = nameLower.includes(placaData.year);
              const fuelMatches = placaData.fuel ? nameLower.includes(placaData.fuel.toLowerCase()) : true;
              return yearMatches && fuelMatches;
            });

            if (matchedYear) {
              setSelectedAno(matchedYear.code);
              setSelectedAnoTexto(matchedYear.name);
              setAutoSelectedAno(true);
              toast.success(`Ano-modelo "${matchedYear.name}" auto-selecionado a partir dos dados da placa!`);
            }
          }
        } catch (err) {
          console.error("Erro ao buscar anos:", err);
          toast.error("Erro ao obter lista de anos do servidor.");
        } finally {
          setLoading(false);
        }
      };
      fetchYears();
    }
  }, [step, selectedTipo, selectedMarca, anos, placaData]);

  const handleSelectAno = (anoCode: string, anoName: string) => {
    setSelectedAno(anoCode);
    setSelectedAnoTexto(anoName);
    // Reset following states
    setModelos([]);
    setSelectedModelo("");
    setSelectedModeloTexto("");
    setModelFilter("");

    setStep(5);
  };

  // Step 5: Fetch Models when year is set
  useEffect(() => {
    if (step === 5 && selectedTipo && selectedMarca && selectedAno && modelos.length === 0) {
      const fetchModels = async () => {
        setLoading(true);
        try {
          const response = await api.post("/api/protecao-veicular/buscar-modelos", {
            veiculo: selectedTipo,
            marcaId: selectedMarca,
            anoId: selectedAno
          });
          setModelos(response.data || []);
        } catch (err) {
          console.error("Erro ao buscar modelos:", err);
          toast.error("Erro ao obter lista de modelos do servidor.");
        } finally {
          setLoading(false);
        }
      };
      fetchModels();
    }
  }, [step, selectedTipo, selectedMarca, selectedAno, modelos]);

  const handleSelectModelo = (modeloCode: string, modeloName: string) => {
    setSelectedModelo(modeloCode);
    setSelectedModeloTexto(modeloName);
    setStep(6);
  };

  // Step 6: Create SIGGA quote and query FIPE details
  useEffect(() => {
    if (step === 6 && !quotationCode && !fipeDetails) {
      const handleRegisterQuotationAndFipe = async () => {
        setLoading(true);
        try {
          const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "SEM-PLACA";
          
          // API Call Part A: Register Quotation Sigga
          const quotePayload = {
            placa: cleanPlaca,
            veiculoId: selectedTipo,
            marcaId: selectedMarca,
            marcaTexto: selectedMarcaTexto,
            anoId: selectedAno,
            anoTexto: selectedAnoTexto,
            modeloId: selectedModelo,
            modeloTexto: selectedModeloTexto
          };
          
          const siggaRes = await api.post("/api/protecao-veicular/cadastrar-cotacao-sigga", quotePayload);
          const siggaData = siggaRes.data;

          if (siggaData) {
            setQuotationCode(siggaData.quotationCode || "");
            setFipeRealCode(siggaData.fipeRealCode || "");
            setFipeValue(siggaData.fipeValue || "");
            setFipeValueQuoted(siggaData.fipeValueQuoted || "");
            setChassi(siggaData.chassi || "N/D");
            setVehicleColor(siggaData.color || "N/D");
          }

          // API Call Part B: Query FIPE detailed info
          const fipePayload = {
            veiculo: selectedTipo,
            marcaId: selectedMarca,
            modeloId: selectedModelo,
            anoId: selectedAno,
            placa: cleanPlaca
          };

          const fipeRes = await api.post("/api/protecao-veicular/buscar-dados-fipe", fipePayload);
          setFipeDetails(fipeRes.data || null);
          
        } catch (err) {
          console.error("Erro ao gerar cotação / FIPE:", err);
          toast.error("Houve uma falha ao comunicar com os parceiros de cotação. Verifique os dados e tente novamente.");
          // Rollback to previous step
          setStep(5);
        } finally {
          setLoading(false);
        }
      };

      handleRegisterQuotationAndFipe();
    }
  }, [
    step,
    quotationCode,
    fipeDetails,
    placa,
    selectedTipo,
    selectedMarca,
    selectedMarcaTexto,
    selectedAno,
    selectedAnoTexto,
    selectedModelo,
    selectedModeloTexto
  ]);

  // Step 7: Get Plans from Sigga and benefits on step change
  useEffect(() => {
    if (step === 7 && quotationCode && plans.length === 0) {
      const fetchPlansAndBenefits = async () => {
        setPlansLoading(true);
        try {
          const response = await api.get(`/api/protecao-veicular/planos-sigga?cotacaoCodigo=${quotationCode}`);
          const planData = response.data;
          
          if (planData && planData.data && planData.data.plans) {
            const plansList = planData.data.plans;
            setPlans(plansList);

            // Dynamically fetch benefits for each plan parallelly
            const benefitsPromises = plansList.map(async (plan: any) => {
              try {
                const benRes = await api.get(`/api/protecao-veicular/plano-sigga-beneficios?planoNome=${encodeURIComponent(plan.name)}`);
                return { planName: plan.name, benefits: benRes.data || [] };
              } catch (e) {
                console.error(`Erro ao buscar benefícios do ${plan.name}:`, e);
                return { planName: plan.name, benefits: [] };
              }
            });

            const resolvedBenefits = await Promise.all(benefitsPromises);
            const cache: { [key: string]: any[] } = {};
            resolvedBenefits.forEach((item) => {
              cache[item.planName] = item.benefits;
            });
            setBenefitsCache(cache);
          } else {
            toast.error("Nenhum plano disponível encontrado para este veículo.");
          }
        } catch (err) {
          console.error("Erro ao carregar planos:", err);
          toast.error("Falha ao recuperar planos Sigga.");
        } finally {
          setPlansLoading(false);
        }
      };

      fetchPlansAndBenefits();
    }
  }, [step, quotationCode, plans]);

  // Step 8: Finalize contract selection
  const handleConfirmPlan = async () => {
    if (!selectedPlanId) {
      toast.error("Por favor, selecione um plano para continuar.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/protecao-veicular/escolher-plano-sigga", {
        planoId: selectedPlanId,
        cotacaoCodigo: quotationCode
      });
      setStep(8);
      toast.success("Plano contratado com sucesso!");
    } catch (err) {
      console.error("Erro ao finalizar contratação:", err);
      toast.error("Não foi possível finalizar a contratação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for brand filter
  const filteredBrands = marcas.filter((b) =>
    b.name.toLowerCase().includes(brandFilter.toLowerCase())
  );

  // Helper for model filter
  const filteredModels = modelos.filter((m) =>
    m.name.toLowerCase().includes(modelFilter.toLowerCase())
  );

  // Clean brand name for logo fetching
  const getBrandLogoUrl = (brandName: string) => {
    const clean = brandName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]/g, ""); // Keep only lowercase alphanumeric
    return `/api/veiculos/car-logo/${clean}`;
  };

  // Dynamic status text for auto-selected values
  const handleResetWizard = () => {
    setStep(1);
    setPlaca("");
    setPlacaData(null);
    setTiposVeiculo([]);
    setMarcas([]);
    setAnos([]);
    setModelos([]);
    setPlans([]);
    setBenefitsCache({});
    setSelectedTipo("");
    setSelectedTipoTexto("");
    setSelectedMarca("");
    setSelectedMarcaTexto("");
    setSelectedAno("");
    setSelectedAnoTexto("");
    setSelectedModelo("");
    setSelectedModeloTexto("");
    setAutoSelectedAno(false);
    setQuotationCode("");
    setFipeRealCode("");
    setFipeValue("");
    setFipeValueQuoted("");
    setChassi("");
    setVehicleColor("");
    setFipeDetails(null);
    setSelectedPlanId(null);
    setBrandFilter("");
    setModelFilter("");
  };

  return (
    <div className="bg-[#f8f9fa] rounded-[4px] p-6 md:p-10 border border-neutral-200/60 space-y-10 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#ff7711]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-neutral-200/60 relative z-10">
        <div className="space-y-3">
          <Badge variant="secondary" className="bg-[#ff7711]/10 text-[#ff7711] border-0 px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">
            Lazer & Serviços Premium
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0c0a09] leading-none uppercase flex items-center gap-3">
            Proteção <span className="text-[#ff7711]">Veicular</span>
            <Shield className="h-10 w-10 text-[#ff7711] stroke-[2.5]" />
          </h1>
          <p className="text-sm md:text-base text-neutral-400 font-bold max-w-2xl">
            Assistência 24h, seguro completo e proteção FIPE integrada em minutos de forma 100% nativa.
          </p>
        </div>

        {step > 1 && step < 8 && (
          <Button 
            variant="outline" 
            onClick={handleResetWizard} 
            className="self-start md:self-auto border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-sm"
          >
            Reiniciar Fluxo
          </Button>
        )}
      </header>

      {/* Wizard Progress Steps Indicator */}
      <div className="relative z-10">
        {/* Mobile View */}
        <div className="md:hidden flex items-center justify-between bg-white border border-neutral-200 p-4 rounded-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#ff7711] uppercase tracking-widest">
              Passo {step} de 8
            </span>
            <h3 className="font-black text-[#0c0a09] text-base">
              {stepsConfig[step - 1].desc}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {stepsConfig.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === step 
                    ? "w-6 bg-[#ff7711]" 
                    : i + 1 < step 
                      ? "w-2 bg-[#ff7711]/60" 
                      : "w-2 bg-neutral-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex justify-between items-center relative w-full px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#ff7711] -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (stepsConfig.length - 1)) * 100}%` }}
          />

          {stepsConfig.map((s, idx) => {
            const isCompleted = idx + 1 < step;
            const isActive = idx + 1 === step;
            return (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 border-2 ${
                    isActive 
                      ? "bg-[#0c0a09] border-[#ff7711] text-white shadow-lg shadow-[#ff7711]/20 scale-110" 
                      : isCompleted 
                        ? "bg-[#ff7711] border-[#ff7711] text-white" 
                        : "bg-white border-neutral-300 text-neutral-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : idx + 1}
                </div>
                <div className="mt-3 text-center">
                  <span className={`block font-black text-[9px] uppercase tracking-wider ${isActive ? "text-[#ff7711]" : isCompleted ? "text-neutral-600" : "text-neutral-400"}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Screens Grid */}
      <div className="relative z-10 min-h-[400px] flex items-center justify-center w-full">
        {loading && (
          <div className="absolute inset-0 bg-white/70 rounded-sm z-30 flex flex-col items-center justify-center space-y-4">
            <RotateCw className="w-12 h-12 text-[#ff7711] animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-[#ff7711] animate-pulse">
              Processando sua solicitação...
            </span>
          </div>
        )}

        {/* STEP 1: License Plate Input */}
        {step === 1 && (
          <div className="w-full max-w-xl space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Placa do Veículo</h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Consulte as informações básicas do veículo usando a placa Mercosul ou convencional
              </p>
            </div>

            <form onSubmit={handlePlacaSubmit} className="space-y-6">
              {/* Brazilian Mercosul Style Plate Input Box */}
              <div className="border-[3px] border-[#0c0a09] rounded-xl bg-white shadow-2xl relative overflow-hidden max-w-sm mx-auto group focus-within:ring-4 focus-within:ring-[#ff7711]/20 focus-within:border-[#ff7711] transition-all">
                {/* Mercosul top blue bar */}
                <div className="bg-[#0f4c81] text-white flex justify-between items-center px-4 py-1.5 select-none border-b-[3px] border-[#0c0a09]">
                  <span className="text-[8px] font-black tracking-widest">MERCOSUL</span>
                  <span className="text-[10px] font-extrabold tracking-widest">BRASIL</span>
                  <div className="flex gap-0.5">
                    <span className="w-2.5 h-1.5 bg-yellow-500 rounded-sm" />
                    <span className="w-2.5 h-1.5 bg-green-500 rounded-sm" />
                  </div>
                </div>

                <div className="p-6 bg-white flex flex-col items-center justify-center space-y-2">
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="ABC1D23"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                    className="w-full text-center text-5xl font-extrabold tracking-widest text-neutral-900 border-0 focus:ring-0 focus:outline-none placeholder:text-neutral-200 placeholder:font-black font-mono uppercase bg-transparent"
                    disabled={searchLoading}
                    required
                  />
                  <div className="h-1 bg-neutral-100 w-1/3 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  disabled={placa.length !== 7 || searchLoading}
                  className="w-full h-14 bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl transition-all"
                >
                  {searchLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Consultando Banco de Dados...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-center text-xs font-black text-[#ff7711] hover:underline uppercase tracking-widest"
                >
                  Pular e preencher dados manualmente
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Vehicle Type */}
        {step === 2 && (
          <div className="w-full max-w-3xl space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Tipo do Veículo</h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Selecione a categoria correspondente ao seu automóvel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiposVeiculo.map((tipo) => {
                const isCar = tipo.name.toLowerCase().includes("carro");
                return (
                  <Card 
                    key={tipo.code}
                    onClick={() => handleSelectTipo(tipo.code, tipo.name)}
                    className="p-8 border border-neutral-200/80 rounded-sm hover:border-[#ff7711] hover:shadow-xl hover:shadow-[#ff7711]/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-4 group bg-white text-[#0c0a09]"
                  >
                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[#ff7711]/10 group-hover:text-[#ff7711] transition-all duration-300">
                      {isCar ? <Car className="h-8 w-8" /> : <Layers className="h-8 w-8" />}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-black group-hover:text-[#ff7711] transition-colors">{tipo.name}</h3>
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Selecionar categoria</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Vehicle Brand */}
        {step === 3 && (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Marca do Veículo</h2>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  Selecione o fabricante do {selectedTipoTexto}
                </p>
              </div>

              {/* Brand Search filter */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Pesquisar fabricante..."
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="pl-10 h-10 border-neutral-200 font-bold rounded-sm focus:ring-2 focus:ring-[#ff7711]/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <Card
                    key={brand.code}
                    onClick={() => handleSelectMarca(brand.code, brand.name)}
                    className="p-5 border border-neutral-100 hover:border-[#ff7711] rounded-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-3 bg-white hover:scale-[1.02] text-[#0c0a09] text-center"
                  >
                    {/* Dynamic logo wrapper */}
                    <div className="w-12 h-12 bg-neutral-50 rounded-sm flex items-center justify-center relative overflow-hidden p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getBrandLogoUrl(brand.name)}
                        alt={brand.name}
                        className="object-contain w-full h-full opacity-80"
                        onError={(e) => {
                          // Fallback to stylized letters if image fails
                          (e.target as HTMLElement).style.display = "none";
                          const fallbackNode = document.createElement("div");
                          fallbackNode.className = "text-sm font-black text-[#ff7711] bg-[#ff7711]/10 w-full h-full flex items-center justify-center rounded-sm uppercase";
                          fallbackNode.innerText = brand.name.substring(0, 2);
                          e.currentTarget.parentElement?.appendChild(fallbackNode);
                        }}
                      />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase">{brand.name}</span>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center space-y-2 bg-white rounded-sm border border-neutral-200">
                  <Info className="h-8 w-8 mx-auto text-neutral-300" />
                  <p className="text-sm font-bold text-neutral-400">Nenhum fabricante corresponde à busca.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Model Year */}
        {step === 4 && (
          <div className="w-full max-w-xl space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Ano do Veículo</h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Defina o ano-modelo e o combustível da versão para {selectedMarcaTexto}
              </p>
            </div>

            {autoSelectedAno && (
              <Card className="p-4 bg-orange-50 border border-orange-200 text-[#ff7711] rounded-sm flex items-center gap-3 animate-pulse">
                <Sparkles className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <span className="block font-black uppercase text-[10px] tracking-wider">Detecção Inteligente ativada</span>
                  <span className="text-[11px] font-bold text-neutral-500">Selecionamos automaticamente o ano <strong>{selectedAnoTexto}</strong> correspondente à placa consultada.</span>
                </div>
              </Card>
            )}

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {anos.map((ano) => {
                const isSelected = selectedAno === ano.code;
                return (
                  <button
                    key={ano.code}
                    onClick={() => handleSelectAno(ano.code, ano.name)}
                    className={`w-full p-4 border rounded-sm flex justify-between items-center transition-all ${
                      isSelected 
                        ? "bg-[#0c0a09] border-[#ff7711] text-white shadow-md shadow-[#ff7711]/10" 
                        : "bg-white border-neutral-200 hover:border-neutral-400 text-neutral-900"
                    }`}
                  >
                    <span className="font-extrabold text-sm uppercase tracking-wide">{ano.name}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-[#ff7711] bg-[#ff7711] text-white" : "border-neutral-300"}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setStep(3)}
                className="border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              {selectedAno && (
                <Button 
                  onClick={() => setStep(5)}
                  className="bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-[10px] shadow-md flex items-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Vehicle Model Version */}
        {step === 5 && (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Modelo do Veículo</h2>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                  Selecione a versão detalhada para {selectedMarcaTexto} ({selectedAnoTexto})
                </p>
              </div>

              {/* Model Search filter */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Pesquisar versão/modelo..."
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className="pl-10 h-10 border-neutral-200 font-bold rounded-sm focus:ring-2 focus:ring-[#ff7711]/20 bg-white"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredModels.length > 0 ? (
                filteredModels.map((modelo) => (
                  <button
                    key={modelo.code}
                    onClick={() => handleSelectModelo(modelo.code, modelo.name)}
                    className="w-full p-5 bg-white border border-neutral-200 hover:border-[#ff7711] hover:shadow-lg transition-all rounded-sm flex items-center justify-between text-left group"
                  >
                    <div className="space-y-1">
                      <span className="block font-black text-sm text-neutral-900 uppercase group-hover:text-[#ff7711] transition-colors">
                        {modelo.name}
                      </span>
                      <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest">Código Fipe: {modelo.code}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-[#ff7711] transition-colors shrink-0 ml-4" />
                  </button>
                ))
              ) : (
                <div className="py-12 text-center space-y-2 bg-white rounded-sm border border-neutral-200">
                  <Info className="h-8 w-8 mx-auto text-neutral-300" />
                  <p className="text-sm font-bold text-neutral-400">Nenhuma versão corresponde à pesquisa.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setStep(4)}
                className="border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: Data Confirmation & FIPE Card */}
        {step === 6 && fipeDetails && (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Revisão de Dados FIPE</h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Confirme as informações homologadas oficiais da tabela FIPE do seu veículo
              </p>
            </div>

            {/* High-End Premium Vehicle Badge card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Badge Left Column: FIPE Valuation Card */}
              <Card className="md:col-span-5 p-8 bg-[#0c0a09] border border-orange-500/20 text-white rounded-xl relative overflow-hidden flex flex-col justify-between shadow-2xl">
                {/* Radial gold gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-[#ff7711] text-white border-0 text-[8px] font-black tracking-[0.2em] px-2 py-0.5 rounded-sm">
                      VALOR DE MERCADO
                    </Badge>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">{fipeDetails.referenceMonth}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-black block">Tabela FIPE</span>
                    <span className="text-4xl font-extrabold text-[#ff7711] font-mono tracking-tight block">
                      {fipeDetails.price || fipeValueQuoted}
                    </span>
                  </div>
                </div>

                {/* Simulated luxury card branding */}
                <div className="border-t border-white/10 pt-6 mt-10 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center relative overflow-hidden p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getBrandLogoUrl(selectedMarcaTexto)}
                        alt={selectedMarcaTexto}
                        className="object-contain w-full h-full brightness-0 invert opacity-80"
                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-xs uppercase tracking-wide leading-none mb-1">{fipeDetails.brand}</span>
                      <span className="text-[9px] font-black text-[#ff7711] uppercase tracking-widest">G8 Protegido</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[8px] text-neutral-400 font-bold uppercase tracking-wider leading-none mb-1">Cotação Código</span>
                    <span className="text-[10px] font-mono font-bold text-white leading-none">{quotationCode || "SIGGA-GENERATING"}</span>
                  </div>
                </div>
              </Card>

              {/* Badge Right Column: Vehicle Specs Checklist */}
              <Card className="md:col-span-7 p-8 bg-white border border-neutral-200/80 rounded-xl space-y-6 flex flex-col justify-between shadow-md text-[#0c0a09]">
                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-wide pb-2 border-b border-neutral-100 flex items-center gap-2">
                    <Car className="text-[#ff7711] h-5 w-5" /> Ficha Técnica Homologada
                  </h3>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-left">
                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-widest leading-none block">Marca</span>
                      <span className="text-sm font-extrabold text-neutral-800 uppercase block">{fipeDetails.brand}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-widest leading-none block">Modelo</span>
                      <span className="text-sm font-extrabold text-neutral-800 uppercase block truncate max-w-[200px]" title={fipeDetails.model}>
                        {fipeDetails.model}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-widest leading-none block">Ano & Combustível</span>
                      <span className="text-sm font-extrabold text-neutral-800 uppercase block">{fipeDetails.fuel} • {selectedAnoTexto.split(" ")[0]}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-widest leading-none block">Código Fipe</span>
                      <span className="text-sm font-mono font-bold text-neutral-800 block">{fipeDetails.codeFipe || fipeRealCode}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-widest leading-none block">Cor</span>
                      <span className="text-sm font-extrabold text-neutral-800 uppercase block">{vehicleColor}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 uppercase font-black tracking-widest leading-none block">Número do Chassi</span>
                      <span className="text-sm font-mono font-bold text-neutral-800 block truncate" title={chassi}>{chassi}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-sm p-4 text-left flex items-start gap-3">
                  <Info className="h-5 w-5 text-[#ff7711] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-neutral-600 font-bold leading-relaxed">
                    Certifique-se de que os dados do veículo estão corretos. Ao prosseguir, buscaremos as ofertas de planos e valores mensais de seguros oficiais da Sigga para seu perfil.
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setStep(5)}
                className="border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button 
                onClick={() => setStep(7)}
                className="bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2"
              >
                Ver Planos Disponíveis <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 7: Select Plans */}
        {step === 7 && (
          <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0c0a09] tracking-tight uppercase">Escolha o seu Plano</h2>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Compare as opções de seguro e selecione a melhor cobertura mensal para suas necessidades
              </p>
            </div>

            {plansLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white rounded-sm border border-neutral-200">
                <RotateCw className="w-10 h-10 text-[#ff7711] animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-[#ff7711] animate-pulse">
                  Consultando tabelas de planos e benefícios...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center max-w-4xl mx-auto">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.tppId;
                  const benefits = benefitsCache[plan.name] || [];
                  const isBronze = plan.name.toLowerCase().includes("bronze");
                  
                  return (
                    <Card
                      key={plan.planId}
                      onClick={() => setSelectedPlanId(plan.tppId)}
                      className={`p-8 border rounded-xl flex flex-col justify-between transition-all duration-300 cursor-pointer text-left relative overflow-hidden group hover:scale-[1.02] ${
                        isSelected 
                          ? "bg-white border-[#ff7711] shadow-2xl shadow-[#ff7711]/10 ring-2 ring-[#ff7711]" 
                          : "bg-white border-neutral-200/80 hover:border-neutral-400 hover:shadow-xl"
                      }`}
                    >
                      {/* Top ribbon decor for the premium plan */}
                      {!isBronze && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-[#ffaa00] to-[#ff7711] text-white text-[7px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-bl-sm">
                          MAIS VENDIDO
                        </div>
                      )}

                      <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isBronze ? "text-neutral-400" : "text-[#ff7711]"}`}>
                            {plan.name}
                          </span>
                          <div className="flex items-baseline gap-1 text-[#0c0a09]">
                            <span className="text-4xl font-extrabold font-mono tracking-tighter">{plan.price}</span>
                            <span className="text-xs text-neutral-400 font-bold uppercase">/ mês</span>
                          </div>
                          
                          {/* Access fee details */}
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-neutral-100 text-[10px] font-bold text-neutral-500">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Adesão Única: <strong>R$ 150,00</strong></span>
                          </div>
                        </div>

                        {/* Benefits list details */}
                        <div className="space-y-4 py-4 border-t border-neutral-100">
                          <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Benefícios inclusos</h4>
                          <div className="space-y-3.5">
                            {benefits.length > 0 ? (
                              benefits.map((b, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                  {b.possui ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                                      <X className="h-3 w-3" />
                                    </div>
                                  )}
                                  <div className="text-left">
                                    <span className={`block text-xs font-extrabold ${b.possui ? "text-neutral-800" : "text-neutral-400 line-through"}`}>
                                      {b.nome}
                                    </span>
                                    <span className="block text-[10px] text-neutral-400 font-medium leading-none mt-0.5">
                                      {b.descricao}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-neutral-100 rounded-sm w-3/4" />
                                <div className="h-4 bg-neutral-100 rounded-sm w-5/6" />
                                <div className="h-4 bg-neutral-100 rounded-sm w-2/3" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-neutral-100 w-full">
                        <Button
                          type="button"
                          className={`w-full h-11 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${
                            isSelected 
                              ? "bg-[#ff7711] hover:bg-[#ff7711]/90 text-white shadow-lg shadow-orange-500/20" 
                              : "bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              Plano Selecionado <Check className="w-4 h-4 shrink-0" />
                            </>
                          ) : (
                            "Selecionar Plano"
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <Button 
                variant="outline" 
                onClick={() => setStep(6)}
                className="border-neutral-200 hover:bg-neutral-100 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button 
                onClick={handleConfirmPlan}
                disabled={!selectedPlanId || loading}
                className="bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" /> Finalizando...
                  </>
                ) : (
                  <>
                    Confirmar Contratação <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 8: Success Screen */}
        {step === 8 && (
          <div className="w-full max-w-xl space-y-8 animate-in zoom-in duration-300">
            <Card className="p-10 border border-emerald-100 shadow-2xl shadow-emerald-50 bg-white text-[#0c0a09] relative overflow-hidden text-center rounded-xl">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-green-500" />
              
              <div className="space-y-6">
                {/* Glowing checked green badge */}
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-100/50">
                  <CheckCircle2 className="h-12 w-12 stroke-[2]" />
                </div>

                <div className="space-y-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[8px] font-black tracking-[0.3em] px-3 py-1 rounded-sm uppercase">
                    Solicitação Concluída
                  </Badge>
                  <h2 className="text-3xl font-black tracking-tight uppercase text-neutral-900 leading-tight">
                    Parabéns, seu veículo está em processo de ativação!
                  </h2>
                  <p className="text-sm font-bold text-neutral-400 leading-relaxed max-w-md mx-auto">
                    A cotação foi homologada no servidor Sigga sob o código <strong className="font-mono text-neutral-600">{quotationCode}</strong>.
                  </p>
                </div>

                <div className="p-6 bg-neutral-50 rounded-sm border border-neutral-100 text-left flex items-start gap-4">
                  <HeartHandshake className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="block text-xs font-black uppercase tracking-wider text-neutral-800">Próximos passos</span>
                    <p className="text-[11px] text-neutral-500 font-bold leading-relaxed">
                      Em até <strong>2 dias úteis</strong>, um consultor especializado entrará em contato via telefone ou WhatsApp cadastrado para orientar a vistoria digital final e ativação imediata do seu seguro.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button
                    onClick={handleResetWizard}
                    className="flex-1 h-12 bg-[#0c0a09] hover:bg-[#ff7711] hover:text-white text-white rounded-sm font-black uppercase tracking-widest text-[9px] shadow-lg transition-all"
                  >
                    Fazer Nova Cotação
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
