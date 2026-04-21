import { Concepto } from "@ScatoModels/administracion/concepto";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { Muelle } from "@ScatoModels/otros-muelles";
import { Vapor } from "@ScatoModels/vapor";

export interface Acuerdo {
    id: number;
    acuerdoTipo: AcuerdoTipo;
    descripcion: string;
    muelle: Muelle;
    exportador: Exportador;
    fechaInicio: Date;
    fechaFin: Date;
    fechaEliminacion?: Date;
    usuarioEliminacion?: string;
    nombreArchivo?: string;
    ubicacionArchivo?: string;
    acuerdoDetalles: AcuerdoDetalle[];
    estado?: string;
    tieneTarifasCerradas?: boolean;
    tieneEmbarques?: boolean;
}
export interface AcuerdoTipo {
    id: number;
    descripcion: string;
}

export interface AcuerdoDetalle {
    id: number;
    materialPuerto: MaterialPuerto;
    cantidadTotal: number;
    acuerdoDetalleConceptos: AcuerdoDetalleConcepto[];
    acuerdoEmbarques?: AcuerdoEmbarque[];
    relacionEmbarque?: boolean;
    buques?: string;
}

export interface AcuerdoDetalleConcepto {
    id: number;
    concepto: Concepto;
    acuerdoDetalleConceptoPeriodoTarifas?: AcuerdoDetalleConceptoPeriodoTarifa[];
}

export interface AcuerdoEmbarque {
    id: number;
    embarque?: any;
    cantidad: number;
}

export interface AcuerdoTipoConfiguracion {
    id: number;
    acuerdoTipo: AcuerdoTipo;
    esSanBenito: boolean;
    esMOA: boolean;
    acuerdoTipoConfiguracionConceptos: AcuerdoTipoConfiguracionConcepto[];
}

export interface AcuerdoTipoConfiguracionConcepto {
    id: number;
    concepto: Concepto;
    obligatorio: boolean;
}

export interface AcuerdoCombo {
    tipos: AcuerdoTipo[];
    muelles: Muelle[];
    exportadores: Exportador[];
    materialesPuerto: MaterialPuerto[];
    configuraciones: AcuerdoTipoConfiguracion[];
    buques: Vapor[];
    idSanBenito: number;
    idMOA: number;
}

export interface AcuerdoDetalleConceptoPeriodoTarifa {
    id: number;
    acuerdoDetalleConceptoId: number;
    valorTarifa: number;

}
export interface AcuerdoPeriodo {
    id: number;
    periodo: Date;
    fechaActualizacion: Date;
    usuarioActualizacion: string;
    cerrado: boolean;
    acuerdoDetalleConceptoPeriodoTarifas: AcuerdoDetalleConceptoPeriodoTarifa[];
}

export interface TarifaConcepto {
    id: number;
    acuerdoDetalleConceptoId: number;
    valorTarifa: number;
}

export interface AcuerdoPeriodoDetalle extends AcuerdoPeriodo {
    acuerdoDetalleId: number;
}

export interface GuardarTarifasDetallePeriodoRequest {
    acuerdoDetalleId: number;
    periodo: Date;
    tarifas: TarifaConcepto[];
    cerrar: boolean;
}