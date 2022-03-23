import { ElementoGrafico } from "./elemento-grafico";
import { ModuloDeCargaHabilitacionDeTanques } from "./habilitacion-tanques";
import { LineasDeEmbarque } from "./linea-embarque";
import { ManosDeEmbarque } from "./mano-embarque";
import { PlanillaDeTurnos } from "./planilla-turnos/planilla-de-turnos";
import { TabiquesDeEmbarque } from "./tabique-embarque";
// import { ModuloDeCargaBalanzasBack } from '@ScatoModels/balanzadas/balanza';
import { PeriodoDeCarga } from "./periodo-carga";
import { Umap } from "./umap";
import { PlanillaDeEmbarque } from "./planilla-de-embarque";

export class ModuloDeCarga{
    id: number;
    moduloDeCargaElementoGrafico: ElementoGrafico[];
    moduloDeCargaManosDeEmbarque: ManosDeEmbarque[];
    moduloDeCargaTabiquesDeEmbarque: TabiquesDeEmbarque[];
    moduloDeCargaHabilitacionDeTanques: ModuloDeCargaHabilitacionDeTanques;
    moduloDeCargaLineasDeEmbarque: LineasDeEmbarque[];
    moduloDeCargaPlanillaDeTurnosTurnos: PlanillaDeTurnos[];
    moduloDeCargaPlanillaDeEmbarque: PlanillaDeEmbarque[];
    // moduloDeCargaBalanzas: ModuloDeCargaBalanzasBack[];
    moduloDeCargaPeriodoDeCarga: PeriodoDeCarga[];
    moduloDeCargaUmap: Umap[];
    enviado: boolean;
    usuarioFinalizacion: string;
    cargado?: boolean;

    constructor(
        id,
        enviado,
        usuarioFinalizacion,
        moduloDeCargaElementoGrafico?,
        moduloDeCargaManosDeEmbarque?,
        moduloDeCargaTabiquesDeEmbarque?,
        moduloDeCargaHabilitacionDeTanques?,
        moduloDeCargaLineasDeEmbarque?,
        moduloDeCargaPeriodoDeCarga?,
        moduloDeCargaPlanillaDeEmbarque?,
        moduloDeCargaUmap?
        // moduloDeCargaBalanzas?,
        ){
    this.id = id;
    this.moduloDeCargaElementoGrafico = moduloDeCargaElementoGrafico;
    this.moduloDeCargaManosDeEmbarque = moduloDeCargaManosDeEmbarque;
    this.moduloDeCargaTabiquesDeEmbarque = moduloDeCargaTabiquesDeEmbarque;
    this.moduloDeCargaHabilitacionDeTanques = moduloDeCargaHabilitacionDeTanques;
    this.moduloDeCargaLineasDeEmbarque = moduloDeCargaLineasDeEmbarque;
    this.moduloDeCargaPlanillaDeEmbarque = moduloDeCargaPlanillaDeEmbarque;
    // this.moduloDeCargaBalanzas = moduloDeCargaBalanzas;
    this.enviado = enviado;
    this.moduloDeCargaPeriodoDeCarga = moduloDeCargaPeriodoDeCarga;
    this.usuarioFinalizacion = usuarioFinalizacion;
    this.moduloDeCargaUmap = moduloDeCargaUmap;
    }
}
