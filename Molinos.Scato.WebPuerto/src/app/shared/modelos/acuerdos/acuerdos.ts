import { Concepto } from "@ScatoModels/administracion/concepto";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { MuelleDeCarga } from "@ScatoModels/programa-embarque/muelle-de-carga";
import { Vapor } from "@ScatoModels/vapor";

export interface Acuerdo {
    id: number;
    acuerdoTipo: AcuerdoTipo;
    descripcion: string;
    muelleDeCarga: MuelleDeCarga;
    exportador: Exportador;
    fechaInicio: Date;
    fechaFin: Date;
    fechaEliminacion?: Date;
    usuarioEliminacion?: string;
    nombreArchivo?: string;
    ubicacionArchivo?: string;
    acuerdoDetalles: AcuerdoDetalle[];
}

export interface AcuerdoTipo {
    id: number;
    descripcion: string;
}

export interface AcuerdoDetalle {
    id: number;
    materialPuerto: MaterialPuerto;
    cantidad: number;
    acuerdoDetalleConceptos: AcuerdoDetalleConcepto[];
}

export interface AcuerdoDetalleConcepto {
    id: number;
    concepto: Concepto;
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
    muellesDeCarga: MuelleDeCarga[];
    exportadores: Exportador[];
    materialesPuerto: MaterialPuerto[];
    configuraciones: AcuerdoTipoConfiguracion[];
    buques: Vapor[];
    idSanBenito: number;
    idMOA: number;
}