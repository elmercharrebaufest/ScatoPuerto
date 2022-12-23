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


export class NominacionDatoTecnico {
    id: number;
    materialPuerto: MaterialPuerto;
    cantidadTotal: number;
    tolerancia: number;
    observaciones: string;
    vaporInformacion: VaporInformacion;
    etaRecalada: Date;
    obligacionDeCarga: Date;
    muelleDeCarga: MuelleDeCarga;
    tasaDeCarga: TasaDeCarga;
    tasaDeCargaValor: string;
    dem: number;
    des: number;
    tipoContrato: TipoDeContrato;
    ataPuerto: ATAPuerto;
    agenciaMaritimaPuerto: AgenciaMaritimaPuerto;
    surveyor: Surveyor;
    observacionesSurveyor: string;
    nominacionDatoTecnicoCalidad: NominacionDatoTecnicoCalidad[];

    constructor(id, materialPuerto, cantidadTotal,
        tolerancia, observaciones, vaporInformacion,
        etaRecalada, obligacionDeCarga, muelleDeCarga,
        tasaDeCarga, tasaDeCargaValor, dem,
        des, tipoContrato, ataPuerto,
        agenciaMaritimaPuerto, surveyor, observacionesSurveyor, nominacionDatoTecnicoCalidad) {
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
        this.tipoContrato = tipoContrato;
        this.ataPuerto = ataPuerto;
        this.agenciaMaritimaPuerto = agenciaMaritimaPuerto;
        this.surveyor = surveyor;
        this.observacionesSurveyor = observacionesSurveyor;
        this.nominacionDatoTecnicoCalidad = nominacionDatoTecnicoCalidad;
    }
}
