export class ErroresGeolocalizacionEmbarque {
    idEmbarque: number;
    mensaje: string;
    constructor(id, mensaje){
        this.idEmbarque = id;
        this.mensaje = mensaje;
  }
}

export class EmbarqueGeolocalizacion {
  embarque_Id: number;
  constructor(id){
      this.embarque_Id = id;
  }
}