
export class EmbarqueNav {
  id: number;
  planoDeCargaId: number;
  moduloDeCargaId: number;
  nombreBuque: string;
  nombreUbicacion: string;
  cargado: boolean;
  esLiquido: boolean;
  muelle: string;
    constructor(){
      this.id = 0;
      this.planoDeCargaId = 0;
      this.moduloDeCargaId = 0;
      this.nombreBuque = '';
      this.nombreUbicacion = '';
      this.cargado = false;
      this.esLiquido = false;
      this.muelle = '';
    }
}
