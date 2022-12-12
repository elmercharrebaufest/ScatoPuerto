
export class NominacionDatoTecnico {
    id: number;
    materialPuerto_Id: number;
    cantidadTotal: number;
    tolerancia: number;
    observaciones: string;
    vapor_Id: number;
    eTARecalada: Date;
    obligacionDeCarga: Date;
    muelleDeCarga_Id: number;
    tasaDeCarga_Id: number;
    tasaDeCargaValor: string;
    dEM: number;
    dES: number;
    tipoContrato_Id: number;
    aTAPuerto_Id: number;
    agenciaMaritimaPuerto_Id: number;
    surveyor_Id: number;
    observacionesSurveyor: string;

    constructor(id                      ,materialPuerto_Id       ,cantidadTotal           ,
                tolerancia              ,observaciones           ,vapor_Id                ,
                eTARecalada             ,obligacionDeCarga       ,muelleDeCarga_Id        ,
                tasaDeCarga_Id          ,tasaDeCargaValor        ,dEM                     ,
                dES                     ,tipoContrato_Id         ,aTAPuerto_Id            ,
                agenciaMaritimaPuerto_Id,surveyor_Id             ,observacionesSurveyor   ){
        this.id                       = id                      ;
        this.materialPuerto_Id        = materialPuerto_Id       ;
        this.cantidadTotal            = cantidadTotal           ;
        this.tolerancia               = tolerancia              ;
        this.observaciones            = observaciones           ;
        this.vapor_Id                 = vapor_Id                ;
        this.eTARecalada              = eTARecalada             ;
        this.obligacionDeCarga        = obligacionDeCarga       ;
        this.muelleDeCarga_Id         = muelleDeCarga_Id        ;
        this.tasaDeCarga_Id           = tasaDeCarga_Id          ;
        this.tasaDeCargaValor         = tasaDeCargaValor        ;
        this.dEM                      = dEM                     ;
        this.dES                      = dES                     ;
        this.tipoContrato_Id          = tipoContrato_Id         ;
        this.aTAPuerto_Id             = aTAPuerto_Id            ;
        this.agenciaMaritimaPuerto_Id = agenciaMaritimaPuerto_Id;
        this.surveyor_Id              = surveyor_Id             ;
        this.observacionesSurveyor    = observacionesSurveyor   ;
    }
}
