
export class Nominacion {
    id : number;
    nominacionDatoTecnico_Id : number;
    nominacionDetalleIntervencion_Id : number;
    enviadoFumigador : boolean;
    enviadoSurveyor : boolean;
    enviadoOtros : boolean;
    fechaCreacion : Date;
    fechaEnvioLineUp : Date;
    fechaEliminacion : Date;
    embarque_Id : number;

    constructor(id                              , nominacionDatoTecnico_Id        ,
                nominacionDetalleIntervencion_Id, enviadoFumigador                ,
                enviadoSurveyor                 , enviadoOtros                    ,
                fechaCreacion                   , fechaEnvioLineUp                ,
                fechaEliminacion                , embarque_Id ){
        this.id                               = id                              ;
        this.nominacionDatoTecnico_Id         = nominacionDatoTecnico_Id        ;
        this.nominacionDetalleIntervencion_Id = nominacionDetalleIntervencion_Id;
        this.enviadoFumigador                 = enviadoFumigador                ;
        this.enviadoSurveyor                  = enviadoSurveyor                 ;
        this.enviadoOtros                     = enviadoOtros                    ;
        this.fechaCreacion                    = fechaCreacion                   ;
        this.fechaEnvioLineUp                 = fechaEnvioLineUp                ;
        this.fechaEliminacion                 = fechaEliminacion                ;
        this.embarque_Id                      = embarque_Id                     ;
    }
}
