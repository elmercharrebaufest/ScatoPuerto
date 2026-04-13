import { Concepto } from "./concepto";
import { TarifaPorEmbarque, TarifaPorEmbarqueConcepto } from "./tarifa-por-embarque";

export class ProvisionGasto {
    public id: number;
    public fechaCierre: Date;
    public usuarioCierre: string;
    public tarifaPorEmbarque: TarifaPorEmbarque;
    public provisionGastoDetalle: ProvisionGastoDetalle[];
}

export class ProvisionGastoDetalle {
    public id: number;
    public tarifaPorEmbarqueConcepto: TarifaPorEmbarqueConcepto;
    public valorCalculado: number;
    public valorAjustado: number;
}

export class AltaProvisionGasto {
    public provisionId: number;
    public tarifaPorEmbarque: TarifaPorEmbarque;
    public itemsProvision: ItemProvisionDto[];
    public idsTarifas: number[];
    public confirmado: boolean;
    public infoFiltrada: InfoFiltrada;
    
    public totalIngresosARS: number;
    public totalIngresosUSD: number;
    public totalEgresosARS: number;
    public totalEgresosUSD: number;
    
    public granTotalIngresosUSD: number;
    public granTotalEgresosUSD: number;
    public cotizacionDolar: number;

    public desglosesPorBuque: DesglosePorBuque[];
}

export class DesglosePorBuque {
    public buque: string;
    public tn: number;
    public acuerdos: string[];
    public ingresosARS: number;
    public ingresosUSD: number;
    public egresosARS: number;
    public egresosUSD: number;
    public itemsProvision: ItemProvisionDto[];
}

export class ItemProvisionDto {
    public concepto: Concepto;
    public valor: number;
}

export class InfoFiltrada {
    public materiales: string[];
    public buques: string[];
    public acuerdos: string[];
    public tn: number;
    public tnPorBuque: { [key: string]: number }; // NUEVO
}