import { MaterialPuerto } from "../material-puerto";
import { AgenciaMaritimaPuerto } from "../agencia-maritima-puerto";
import { Vapor } from "../vapor";
import { ATAPuerto } from "../ata-puerto";
import { TasaDeCarga } from "./tasa-de-carga";
import { MuelleDeCarga } from "./muelle-de-carga";
import { Surveyor } from "./surveyor";
import { TipoDeContrato } from "./tipo-de-contrato";
import { NominacionDatoTecnicoCalidad } from "./nominacion-dato-tecnico-calidad";
import { VaporInformacion } from "@ScatoModels/Buques/VaporInformacion";
import { NominacionDatoTecnicoDestino } from "./nominacion-dato-tecnico-destino";
import { NominacionDatoTecnicoExportador } from "./nominacion-dato-tecnico-exportador";
import { NominacionDatoTecnicoCoordinador } from "./nominacion-dato-tecnico-coordinador";


export class NominacionDatoTecnico {
    id: number;
    materialPuerto: MaterialPuerto;
    cantidadTotal: number;
    cantidadExacta: number;
    cantidadConTolerancia: number;
    tolerancia: number;
    cantidadTotalMaxima: number;
    observaciones: string;
    vaporInformacion: VaporInformacion;
    etaRecalada: Date;
    obligacionDeCarga: Date;
    muelleDeCarga: MuelleDeCarga;
    tasaDeCarga: TasaDeCarga;
    tasaDeCargaValor: number;
    dem: number;
    des: number;
    tipoDeContrato: TipoDeContrato;
    ataPuerto: ATAPuerto;
    agenciaMaritimaPuerto: AgenciaMaritimaPuerto;
    surveyor: Surveyor;
    observacionesSurveyor: string;
    nominacionDatoTecnicoCalidad: NominacionDatoTecnicoCalidad[];
    nominacionDatoTecnicoDestino: NominacionDatoTecnicoDestino[];
    nominacionDatoTecnicoExportador: NominacionDatoTecnicoExportador[];
    nominacionDatoTecnicoCoordinadorPuerto: NominacionDatoTecnicoCoordinador[];
    otroMuelleNombre: string;

    constructor(id, materialPuerto, cantidadTotal,
        tolerancia, observaciones, vaporInformacion,
        etaRecalada, obligacionDeCarga, muelleDeCarga,
        tasaDeCarga, tasaDeCargaValor, dem,
        des, tipoDeContrato, ataPuerto,
        agenciaMaritimaPuerto, surveyor, observacionesSurveyor, nominacionDatoTecnicoCalidad,
        otroMuelleNombre: string = '', cantidadExacta, cantidadConTolerancia, cantidadTotalMaxima
    ) {
        this.id = id;
        this.materialPuerto = materialPuerto;
        this.cantidadTotal = cantidadTotal;
        this.tolerancia = tolerancia;
        this.observaciones = observaciones;
        this.vaporInformacion = vaporInformacion;
        this.etaRecalada = etaRecalada;
        this.obligacionDeCarga = obligacionDeCarga;
        this.muelleDeCarga = muelleDeCarga;
        this.tasaDeCarga = tasaDeCarga;
        this.tasaDeCargaValor = tasaDeCargaValor;
        this.dem = dem;
        this.des = des;
        this.tipoDeContrato = tipoDeContrato;
        this.ataPuerto = ataPuerto;
        this.agenciaMaritimaPuerto = agenciaMaritimaPuerto;
        this.surveyor = surveyor;
        this.observacionesSurveyor = observacionesSurveyor;
        this.nominacionDatoTecnicoCalidad = nominacionDatoTecnicoCalidad;
        this.otroMuelleNombre = otroMuelleNombre;
        this.cantidadConTolerancia = cantidadConTolerancia;
        this.cantidadExacta = cantidadExacta;
        this.cantidadTotalMaxima = cantidadTotalMaxima;
    }
}
