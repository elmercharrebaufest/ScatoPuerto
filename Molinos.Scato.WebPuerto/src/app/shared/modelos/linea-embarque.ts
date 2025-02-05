import { MaterialPuerto } from './material-puerto';

export class LineasDeEmbarque {
    id?: number;
    linea: string;
    tipoLineaEmbarque: any;
    materialPuerto: MaterialPuerto;
    tkInicial: string;
    temperaturaInicial: number;
    alturaInicialCM: number;
    alturaInicialMM: number;
    densidadInicial: number;
    temperaturaFinal: number;
    litros: number;
    densidadFinal: number;
    alturaFinalCM: number;
    alturaFinalMM: number;
    kilos: number;
    fechaInicio: Date;
    tkFinal: string;
    kilosFinales: number;
    fechaFin: Date;
    litrosFinales: number;
    alturaInicialCMyMM: number;
    alturaFinalCMyMM: number;
}
