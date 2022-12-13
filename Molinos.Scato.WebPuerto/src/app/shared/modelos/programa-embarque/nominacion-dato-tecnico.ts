import { MaterialPuerto } from "../material-puerto";
import { AgenciaMaritimaPuerto } from "../agencia-maritima-puerto";
import { Vapor } from "../vapor";
import { ATAPuerto } from "../ata-puerto";
import { TasaDeCarga } from "./tasa-de-carga";
import { MuelleDeCarga } from "./muelle-de-carga";
import { Surveyor } from "./surveyor";
import { TipoDeContrato } from "./tipo-de-contrato";


export class NominacionDatoTecnico {
    id: number;
    materialPuerto: MaterialPuerto;
    cantidadTotal: number;
    tolerancia: number;
    observaciones: string;
    vapor: Vapor;
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

    constructor(id, materialPuerto, cantidadTotal,
        tolerancia, observaciones, vapor,
        etaRecalada, obligacionDeCarga, muelleDeCarga,
        tasaDeCarga, tasaDeCargaValor, dem,
        des, tipoContrato, ataPuerto,
        agenciaMaritimaPuerto, surveyor, observacionesSurveyor) {
        this.id = id;
        this.materialPuerto = materialPuerto;
        this.cantidadTotal = cantidadTotal;
        this.tolerancia = tolerancia;
        this.observaciones = observaciones;
        this.vapor = vapor;
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
    }
}
