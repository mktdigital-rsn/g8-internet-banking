"use client";

import ComprovanteTemplate from "../_components/ComprovanteTemplate";
import { ArrowRightLeft } from "lucide-react";
import { currentBrand } from "@/config/brand";

export default function InternoPage() {
    return (
        <ComprovanteTemplate 
            title={`Contas ${currentBrand.shortName}`}
            description={`Transferências realizadas entre contas do ${currentBrand.bankName}.`}
            backHref="/dashboard/comprovantes"
            icon={ArrowRightLeft}
            protocolPrefix="P2P"
            exportMetodo="TRANSFERENCIA_INTERNA"
            filterMetodo={(item) => 
                item.metodo === "TRANSFERENCIA_INTERNA" || 
                (item.metodoFormatado?.toUpperCase().includes("P2P") || item.metodoFormatado?.toUpperCase().includes("ENTRE CONTAS"))
            }
        />
    );
}
