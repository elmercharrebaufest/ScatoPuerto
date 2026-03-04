import { AgenciaMaritimaPuerto } from "@ScatoModels/agencia-maritima-puerto";
import { Exportador } from "@ScatoModels/exportador";

export class DetalleEmbarqueAFacturar {
 idEmbarque: number;
 esLiq: boolean;
 estado: string;
 vaporInfoId: number;
 buque:string;
 muelle: string;
 amarre:Date;
 horaAmarre: string;
 desamarre:Date;
 horaDesamarre: string;
 nroOp: number;
 senasa: boolean;
 defMoviles: boolean;
 fumigacionPrev: boolean;
 fumigacionCur: boolean;
 usoPala: boolean;
 exportadores: Exportador[];
 agencias: AgenciaMaritimaPuerto[];
 administracionEmbarque: AdministracionEmbarque;
 cargas: InformacionBuque[];
 trn: number;
 puedeAsociarAcuerdos: boolean;
 fechaLineUp: Date;
 fechaOperaciones: Date;
 fechaCalidad: Date;
 fechaZarpado: Date;
 fechaAplicado: Date;
 fechaFacturado: Date;
}

export class AdministracionEmbarque{
  id: number;
  netoTonnage: number;
  muelleProp: string;
  amarroMuelleProp: Date;
  desamarroMuelleProp: Date;
  amarroMuelleCarga: Date;
  agencias: AdministracionEmbarqueAgencia[];
  exportadores: AdministracionExportador[];
}

export class AdministracionEmbarqueAgencia {
    id: number;
    agenciaMaritimaPuerto: AgenciaMaritimaPuerto;
}

export class AdministracionExportador {
    id: number;
    exportador: Exportador;
}

export class AdministracionEmbarqueMuelleProporcional {
    id: number;
    muelle: string;
}

export class InformacionBuque {
    exportador: string;
    materialPuerto: string;
    tn: number;
    tanqueOrigen: string;
    nroTanque: string;
    siloCelda: string;
    bodega: number;
    aCuentaSenasa: string;
    aCuentaFumigacion: string;
}

export class EstadoEmbarque {
    id: number;
    descripcion: string;
}