import { ElementoGrafico } from "./elemento-grafico";
import { ModuloDeCargaHabilitacionDeTanques } from "./habilitacion-tanques";
import { LineasDeEmbarque } from "./linea-embarque";
import { ManosDeEmbarque } from "./mano-embarque";
import { PlanillaDeTurnos } from "./planilla-turnos/planilla-de-turnos";
import { TabiquesDeEmbarque } from "./tabique-embarque";
import { PeriodoDeCarga } from "./periodo-carga";
import { Umap } from "./umap";
import { PlanillaDeEmbarque } from "./planilla-de-embarque";
import { Nir } from './nir';
import { HorariosExportador } from "./calidad/horarios-exportador";

export class ModuloDeCarga{
    id: number;
    moduloDeCargaElementoGrafico: ElementoGrafico[];
    moduloDeCargaManosDeEmbarque: ManosDeEmbarque[];
    moduloDeCargaTabiquesDeEmbarque: TabiquesDeEmbarque[];
    moduloDeCargaHabilitacionDeTanques: ModuloDeCargaHabilitacionDeTanques;
    moduloDeCargaLineasDeEmbarque: LineasDeEmbarque[];
    moduloDeCargaPlanillaDeTurnos: PlanillaDeTurnos[];
    moduloDeCargaPlanillaDeEmbarque: PlanillaDeEmbarque[];
    // moduloDeCargaBalanzas: ModuloDeCargaBalanzasBack[];
    moduloDeCargaPeriodoDeCarga: PeriodoDeCarga[];
    moduloDeCargaUmap: Umap[];
    enviado: boolean;
    usuarioFinalizacion: string;
    cargado?: boolean;
    ingresoManualSolido?: boolean;
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
        moduloDeCargaUmap?,
        ingresoManualSolido?
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
    this.ingresoManualSolido = ingresoManualSolido;
    this.moduloDeCargaPeriodoDeCarga = moduloDeCargaPeriodoDeCarga;
    this.usuarioFinalizacion = usuarioFinalizacion;
    this.moduloDeCargaUmap = moduloDeCargaUmap;
    }
}
