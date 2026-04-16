"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  ChevronRight,
  Landmark,
  Star,
  Globe,
  ArrowRightLeft,
  FileText,
  PlusCircle,
  Settings,
  HelpCircle,
  MessageCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Fingerprint,
  Wallet,
  Building2,
  User,
  History,
  Smartphone,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { temporaryDeviceIdAtom } from "@/store/auth";

type Step = 'menu' | 'select_target' | 'form' | 'pin' | 'confirming' | 'success' | 'error';
type SearchMode = 'cpf' | 'account';

interface ReceiverInfo {
    name: string;
    taxNumber: string;
    agencia: string;
    conta: string;
    digito: string;
    bankName?: string;
}

export default function TransferenciaPage() {
    const temporaryDeviceId = useAtomValue(temporaryDeviceIdAtom);
    const [step, setStep] = useState<Step>('menu');
    const [searchMode, setSearchMode] = useState<SearchMode>('cpf');
    const [isLoading, setIsLoading] = useState(false);
    const [balance, setBalance] = useState("R$ 0,00");
    
    // Form States
    const [targetCpf, setTargetCpf] = useState("");
    const [targetAgencia, setTargetAgencia] = useState("");
    const [targetConta, setTargetConta] = useState("");
    const [targetDigito, setTargetDigito] = useState("");
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [pinId, setPinId] = useState("");
    
    // Result States
    const [receiver, setReceiver] = useState<ReceiverInfo | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [transactionId, setTransactionId] = useState("");

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await api.get("/api/banco/saldo/getSaldo");
                if (res.data && typeof res.data.valor !== 'undefined') {
                    setBalance(new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    }).format(res.data.valor));
                }
            } catch (err) {
                console.error("Error fetching balance:", err);
            }
        };
        fetchBalance();
    }, []);

    const formatCurrency = (val: string | number) => {
        const cleanValue = String(val).replace(/\D/g, "");
        if (!cleanValue) return "R$ 0,00";
        const numberValue = parseInt(cleanValue) / 100;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(numberValue);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setAmount(rawValue);
    };



    const handleLookup = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            let res;
            if (searchMode === 'cpf') {
                const tax = targetCpf.replace(/\D/g, "");
                res = await api.post('/api/banco/pagamentos/consultar-conta-cpf', { taxNumber: tax });
                // Assuming res.data contains receiver info
                // Mocking for now if data is nested but mapping based on typical response
                const data = res.data?.data || res.data;
                if (!data || (!data.name && !data.nome)) {
                     throw new Error("Conta não encontrada.");
                }
                setReceiver({
                    name: data.name || data.nome,
                    taxNumber: data.taxNumber || data.documento || tax,
                    agencia: data.agencia || "0001",
                    conta: data.conta || "",
                    digito: data.digito || ""
                });
            } else {
                res = await api.post('/api/banco/pagamentos/cadastrar-chave', { 
                    agencia: targetAgencia, 
                    conta: targetConta, 
                    digito: targetDigito 
                });
                const data = res.data?.data || res.data;
                if (!data || (!data.name && !data.nome)) {
                    throw new Error("Dados da conta inválidos.");
                }
                setReceiver({
                    name: data.name || data.nome,
                    taxNumber: data.taxNumber || data.documento || "",
                    agencia: targetAgencia,
                    conta: targetConta,
                    digito: targetDigito
                });
            }
            setStep('form');
        } catch (err: any) {
            console.error("Lookup error:", err);
            setErrorMessage(err.response?.data?.message || err.message || "Erro ao consultar beneficiário.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestPin = async () => {
        if (!temporaryDeviceId) {
            setErrorMessage("Aguarde concluir o login com QR antes de realizar pagamentos.");
            return;
        }

        setIsLoading(true);
        try {
            const amountNum = parseInt(amount) / 100;
            const amountStr = amountNum.toFixed(2);

            const res = await api.post('/api/users/solicitar-pin', { 
                amount: amountStr,
                deviceId: temporaryDeviceId
            });
            if (res.data) {
                const data = res.data.data || res.data;
                setPinId(data.pinId || data.id || "");
                setStep('pin');
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Erro ao solicitar PIN.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalize = async () => {
        setIsLoading(true);
        setStep('confirming');
        try {
            // 1. Explicitly validate PIN before transfer
            await api.post("/api/users/validar-pin", {
                pin: pin,
                pinId: pinId,
                deviceId: temporaryDeviceId
            });
            
            const payload = {
                taxNumber: receiver?.taxNumber,
                recebedorAgencia: receiver?.agencia,
                recebedorConta: receiver?.conta,
                recebedorDigito: receiver?.digito,
                valor: parseInt(amount) / 100,
                pin: pin,
                deviceId: temporaryDeviceId
            };

            console.log("🚀 [TRANSFERÊNCIA INTERNA PAYLOAD]:", payload);

            const res = await api.post('/api/banco/pagamentos/transferencia-interna', payload);
            console.log("✅ [TRANSFERÊNCIA SUCCESS]:", res.data);
            setTransactionId(res.data?.id || res.data?.transactionId || "SUCCESS-" + Date.now());
            setStep('success');
        } catch (err: any) {
            console.error("❌ [TRANSFERÊNCIA ERROR]:", err.response?.status, err.response?.data || err.message);
            setErrorMessage(err.response?.data?.message || "Transação recusada. Verifique seu saldo ou PIN.");
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetFlow = () => {
        setStep('menu');
        setReceiver(null);
        setAmount("");
        setPin("");
        setErrorMessage("");
        setTargetCpf("");
        setTargetAgencia("");
        setTargetConta("");
        setTargetDigito("");
    };

    const handlePrintReceipt = async () => {
        if (!transactionId) {
            toast.error("ID da transação não localizado.");
            return;
        }

        try {
            const response = await api.get(`/api/banco/extrato/imprimir-item/${transactionId}`, {
                responseType: 'blob'
            });

            if (response.data.size === 0) {
                toast.info("O comprovante está sendo processado. Tente novamente em 5 segundos.");
                return;
            }

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `comprovante_transferencia_${transactionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("❌ [RECEIPT ERROR]:", err);
            toast.error("Erro ao gerar comprovante. Verifique o extrato.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#0c0a09] p-4 md:p-8 xl:p-12 overflow-y-auto relative">
            {/* Background Decor */}
            <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-[#f97316]/5 rounded-full blur-[150px] pointer-events-none" />
            
            <div className="max-w-[1440px] mx-auto space-y-12 relative z-10 px-4 md:px-0 pb-32">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div className="space-y-1">
                        <Badge className="bg-[#f97316]/10 text-[#f97316] border-0 text-[10px] font-black tracking-[0.3em] uppercase px-3 py-1 mb-2">G8 Transactional</Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-[#0c0a09]">
                            Transferir <span className="text-[#f97316]">RECURSOS</span>
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Area */}
                    <main className="lg:col-span-8 space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 'menu' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <TransferOption 
                                        icon={Landmark}
                                        title="Entre Contas G8"
                                        description="Transferência instantânea e grátis para clientes G8 Bank"
                                        onClick={() => setStep('select_target')}
                                        premium
                                    />
                                    <TransferOption 
                                        icon={ArrowRightLeft}
                                        title="TED / DOC"
                                        description="Para outros bancos. Disponível em dias úteis até as 17h."
                                        onClick={() => {}}
                                        disabled
                                    />
                                    <div className="md:col-span-2">
                                        <h2 className="text-[12px] font-black text-[#0c0a09] uppercase tracking-[0.2em] mb-6">Serviços Adicionais</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                            <SimpleAction icon={History} label="Extrato" />
                                            <SimpleAction icon={Star} label="Favoritos" />
                                            <SimpleAction icon={Globe} label="Exterior" />
                                            <SimpleAction icon={Search} label="Comprovantes" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'select_target' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <Card className="bg-white border-0 p-10 rounded-md shadow-2xl shadow-black/5">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-xl font-black uppercase tracking-widest text-[#f97316]">Destinatário</h2>
                                            <button onClick={resetFlow} className="text-[#0c0a09]/30 hover:text-[#0c0a09] transition-colors"><X size={20}/></button>
                                        </div>

                                        <div className="flex gap-4 mb-8">
                                            <button 
                                                onClick={() => setSearchMode('cpf')}
                                                className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-sm transition-all ${searchMode === 'cpf' ? 'bg-[#f97316] text-white shadow-xl shadow-orange-500/20 scale-105' : 'bg-[#f97316]/10 text-[#f97316] hover:bg-orange-50'}`}
                                            >
                                                CPF / CNPJ
                                            </button>
                                            <button 
                                                disabled
                                                className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-sm transition-all bg-[#f97316]/10 text-[#f97316]/40 cursor-not-allowed opacity-60"
                                            >
                                                Agência e Conta (Em breve)
                                            </button>
                                        </div>

                                        {searchMode === 'cpf' ? (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#0c0a09]/40">Insira o Documento</label>
                                                <Input 
                                                    placeholder="000.000.000-00"
                                                    value={targetCpf}
                                                    onChange={(e) => setTargetCpf(e.target.value)}
                                                    className="h-16 bg-[#f97316]/10 border-neutral-100 rounded-sm text-xl font-mono focus:border-[#f97316] transition-all text-[#f97316] font-bold"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-4 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0c0a09]/40">Agência</label>
                                                    <Input value={targetAgencia} onChange={(e) => setTargetAgencia(e.target.value)} placeholder="0001" className="h-14 bg-[#f97316]/10 border-neutral-100 rounded-sm font-mono font-bold text-[#f97316]"/>
                                                </div>
                                                <div className="col-span-6 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0c0a09]/40">Conta</label>
                                                    <Input value={targetConta} onChange={(e) => setTargetConta(e.target.value)} placeholder="12345" className="h-14 bg-[#f97316]/10 border-neutral-100 rounded-sm font-mono font-bold text-[#f97316]"/>
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0c0a09]/40">Díg.</label>
                                                    <Input value={targetDigito} onChange={(e) => setTargetDigito(e.target.value)} placeholder="0" className="h-14 bg-[#f97316]/10 border-neutral-100 rounded-sm font-mono text-center font-bold text-[#f97316]"/>
                                                </div>
                                            </div>
                                        )}


                                        {errorMessage && <p className="mt-4 text-xs font-bold text-rose-500 flex items-center gap-2"><AlertCircle size={14}/> {errorMessage}</p>}

                                        <Button 
                                            onClick={handleLookup}
                                            disabled={isLoading}
                                            className="w-full h-16 mt-8 bg-[#f97316] text-white hover:bg-orange-600 rounded-sm font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl shadow-orange-500/20"
                                        >
                                            {isLoading ? "Consultando..." : "Continuar"}
                                        </Button>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 'form' && receiver && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <Card className="bg-white border-neutral-100 p-8 rounded-md shadow-2xl shadow-black/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4">
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-0 font-black text-[8px] uppercase tracking-widest">Confirmação de Dados</Badge>
                                        </div>
                                        
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-6 p-6 bg-[#f97316]/10 rounded-md border border-orange-200 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                                                <div className="w-16 h-16 bg-[#f97316] rounded-md flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                                                    <User size={32}/>
                                                </div>
                                                <div className="relative z-10 flex-1">
                                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f97316] mb-1">DADOS DO RECEBEDOR</p>
                                                    <p className="text-2xl font-black tracking-tighter text-[#0c0a09] leading-tight">{receiver.name}</p>
                                                    <p className="text-[12px] font-mono text-[#0c0a09]/50 uppercase mt-1 font-bold">G8 BANK • AG {receiver.agencia} • CC {receiver.conta}-{receiver.digito}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[13px] font-black uppercase tracking-[0.15em] text-[#0c0a09] block ml-1">Quanto deseja transferir?</label>
                                                <div className="relative group">
                                                    <Input 
                                                        value={formatCurrency(amount)}
                                                        onChange={handleValueChange}
                                                        placeholder="R$ 0,00"
                                                        className="h-24 bg-white border-2 border-neutral-100 rounded-sm px-8 text-4xl font-black font-mono focus:ring-4 focus:ring-[#f97316]/10 focus:border-[#f97316] transition-all text-[#0c0a09] placeholder:text-neutral-100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-6 pt-4">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => setStep('select_target')} 
                                                    className="h-16 flex-1 border-2 border-neutral-100 bg-white text-[#0c0a09] font-black uppercase text-[12px] tracking-[0.2em] hover:bg-neutral-50 hover:border-neutral-200 transition-all rounded-sm shadow-sm"
                                                >
                                                    Voltar
                                                </Button>
                                                <Button 
                                                    onClick={handleRequestPin}
                                                    disabled={!amount || parseInt(amount) <= 0 || isLoading}
                                                    className="h-16 flex-[2] bg-[#f97316] text-white hover:bg-orange-600 rounded-sm font-black uppercase text-sm tracking-[0.2em] transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                                                >
                                                    Próximo
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 'pin' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-xl mx-auto w-full"
                                >
                                    <Card className="bg-white border-0 p-10 md:p-16 rounded-[5px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] text-center flex flex-col items-center">
                                        <div className="w-24 h-24 bg-[#f97316]/10 rounded-[5px] flex items-center justify-center text-[#f97316] mb-8 shadow-sm">
                                            <Smartphone className="h-12 w-12 animate-pulse" />
                                        </div>
                                        
                                        <div className="space-y-4 mb-12">
                                            <h2 className="text-4xl font-black text-[#0c0a09] uppercase tracking-tighter">Validação de Segurança</h2>
                                            <p className="text-base font-bold text-[#0c0a09]/30 uppercase tracking-[0.1em]">
                                                Confirme seu código PIN para validar a transferência de <span className="text-[#f97316] font-black">{formatCurrency(amount)}</span>
                                            </p>
                                        </div>

                                        <div className="w-full max-w-sm space-y-8">
                                            <Input 
                                                type="password"
                                                maxLength={6}
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                                                placeholder="0 0 0 0"
                                                className="h-24 text-center font-black text-5xl tracking-[0.5em] border-2 border-neutral-100 rounded-[5px] focus:border-[#f97316] bg-[#f8f9fa] shadow-inner"
                                                autoFocus
                                            />
                                            
                                            <div className="flex flex-col gap-6">
                                                <Button 
                                                    disabled={pin.length < 4 || isLoading}
                                                    onClick={handleFinalize}
                                                    className="w-full h-20 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f97316] text-white rounded-[5px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-black/20 transition-all active:scale-95"
                                                >
                                                    {isLoading ? "PROCESSANDO..." : "CONFIRMAR TRANSFERÊNCIA"}
                                                </Button>
                                                
                                                <button 
                                                    onClick={() => setStep('form')} 
                                                    className="text-[11px] font-black text-[#f97316] uppercase tracking-[0.2em] hover:underline"
                                                >
                                                    Alterar valor da transferência
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 'confirming' && (
                                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                    <div className="h-12 w-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-[#0c0a09]/50">Processando sua transferência...</p>
                                </div>
                            )}

                            {step === 'success' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-lg mx-auto"
                                >
                                    <Card className="bg-orange-400 border-0 p-1 rounded-md shadow-2xl">
                                        <div className="bg-white p-10 rounded-md space-y-8 text-center">
                                            <div className="w-20 h-20 bg-orange-400/10 rounded-full flex items-center justify-center mx-auto text-orange-400 mb-4">
                                                <CheckCircle2 size={48} strokeWidth={3}/>
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-3xl font-black tracking-tighter text-[#0c0a09]">SUCESSO!</h2>
                                                <p className="text-[#0c0a09]/40 text-xs font-bold uppercase tracking-widest">Dinheiro enviado para {receiver?.name}</p>
                                            </div>
                                            
                                            <div className="border-y border-neutral-100 py-6 space-y-4">
                                                <div className="flex justify-between items-center text-[10px] uppercase font-black">
                                                    <span className="text-[#0c0a09]/30">Valor</span>
                                                    <span className="text-xl text-orange-400">{formatCurrency(amount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] uppercase font-black">
                                                    <span className="text-[#0c0a09]/30">Protocolo</span>
                                                    <span className="text-[#0c0a09]/50">{transactionId.slice(0, 16).toUpperCase()}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={handlePrintReceipt}
                                                    className="h-12 border-neutral-100 bg-white rounded-sm font-black text-[10px] uppercase hover:bg-neutral-50 shadow-sm"
                                                >
                                                    Comprovante
                                                </Button>
                                                <Button onClick={resetFlow} className="h-12 bg-[#0c0a09] text-white hover:bg-[#f97316] rounded-sm font-black text-[10px] uppercase shadow-lg shadow-black/10">Nova Transf.</Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 'error' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md mx-auto"
                                >
                                    <Card className="bg-rose-500/5 border-rose-500/10 p-10 rounded-md text-center space-y-6 shadow-2xl shadow-rose-500/5">
                                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
                                            <AlertCircle size={32}/>
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-black text-rose-500 uppercase tracking-widest">Ops! Algo falhou</h2>
                                            <p className="text-sm text-[#0c0a09]/50 font-medium">{errorMessage}</p>
                                        </div>
                                        <Button onClick={() => setStep('form')} className="w-full h-14 bg-rose-500 text-white hover:bg-rose-600 font-black uppercase shadow-lg shadow-rose-500/20">Tentar Novamente</Button>
                                        <button onClick={resetFlow} className="text-[10px] font-black uppercase tracking-widest text-[#0c0a09]/30 hover:underline">Voltar ao início</button>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>

                    {/* Sidebar Area */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Balance Card */}
                        <div className="bg-[#f97316] border-0 p-8 rounded-md space-y-4 shadow-2xl shadow-orange-500/20 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                            <div className="flex items-center gap-3 text-white relative z-10 font-black">
                                <Wallet size={16}/>
                                <span className="text-[10px] font-black uppercase tracking-widest">Saldo Disponível</span>
                            </div>
                            <p className="text-4xl font-black font-mono tracking-tighter text-white relative z-10">{balance}</p>
                        </div>

                        {/* Recent Favorites */}
                        <div className="space-y-6">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0c0a09]">Favoritos Rápidos</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white rounded-md border border-neutral-100 hover:border-[#f97316]/30 hover:shadow-2xl transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-[#f97316]/10 overflow-hidden group-hover:ring-4 ring-orange-500/10 transition-all border border-orange-100 p-1">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Fav${i}`} alt="Fav" className="rounded-md"/>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[12px] font-black text-[#0c0a09]">Contato Favorito {i}</p>
                                                <p className="text-[10px] text-[#0c0a09]/30 font-bold uppercase tracking-wider">G8 BANK • AG 0001</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-[#0c0a09]/20 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all"/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="p-8 bg-[#f97316]/10 rounded-md border border-orange-100 space-y-4 shadow-xl shadow-black/5">
                            <div className="flex items-center gap-2 text-[#f97316]">
                                <ShieldCheck size={20}/>
                                <span className="text-[11px] font-black uppercase tracking-widest">Segurança G8</span>
                            </div>
                            <p className="text-[11px] text-[#0c0a09]/60 font-medium leading-relaxed">Suas transferências internas são protegidas por criptografia de ponta e validação via PIN.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function TransferOption({ 
    icon: Icon, 
    title, 
    description, 
    onClick, 
    premium = false,
    disabled = false
}: { 
    icon: any, 
    title: string, 
    description: string, 
    onClick: () => void,
    premium?: boolean,
    disabled?: boolean
}) {
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`w-full group p-8 rounded-md text-left transition-all relative overflow-hidden flex flex-col justify-between h-[240px] border ${
                premium 
                ? 'bg-[#f97316] border-0 text-white shadow-2xl shadow-orange-500/30 active:scale-[0.98]' 
                : disabled 
                    ? 'bg-neutral-50 border-neutral-100 opacity-40 cursor-not-allowed grayscale' 
                    : 'bg-[#f97316]/10 border-orange-100 hover:shadow-2xl hover:border-orange-200 active:scale-[0.98]'
            }`}
        >
            {premium && <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-3xl transition-transform duration-1000 group-hover:scale-150" />}
            
            <div className={`w-14 h-14 rounded-md flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 ${
                premium ? 'bg-white/20' : 'bg-white text-[#f97316] border border-orange-100 shadow-sm'
            }`}>
                <Icon size={28} strokeWidth={2.5}/>
            </div>

            <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                    <h3 className={`text-xl font-black tracking-tight ${premium ? 'text-white' : 'text-[#f97316]'}`}>{title}</h3>
                    {disabled && <Badge className="bg-[#0c0a09]/10 text-[#0c0a09] text-[8px] font-black uppercase border-0">Breve</Badge>}
                </div>
                <p className={`text-[11px] font-black leading-relaxed ${premium ? 'text-white/70' : 'text-[#f97316]'}`}>
                    {description}
                </p>
            </div>
            
            <div className={`flex items-center gap-2 mt-4 font-black uppercase text-[9px] tracking-[0.2em] transform translate-x-0 group-hover:translate-x-2 transition-transform ${
                premium ? 'text-white' : 'text-[#f97316]'
            }`}>
                {disabled ? 'Indisponível' : 'Começar'} <ArrowRight size={14}/>
            </div>
        </button>
    );
}

function SimpleAction({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-sm hover:shadow-2xl hover:shadow-orange-200/50 hover:scale-[1.03] transition-all active:scale-[0.98] group relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent)]" />
            <div className="w-10 h-10 bg-white/20 rounded-sm flex items-center justify-center text-white mb-3 group-hover:scale-110 group-hover:bg-white/30 transition-all relative z-10">
                <Icon size={18}/>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white relative z-10">{label}</span>
        </button>
    );
}
