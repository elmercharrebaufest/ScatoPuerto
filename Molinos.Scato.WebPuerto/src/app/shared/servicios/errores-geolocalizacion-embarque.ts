import { Injectable } from '@angular/core';
import { ErroresGeolocalizacion } from '@ScatoModels/geolocalizacion/errores-geolocalizacion';
import { ErroresGeolocalizacionEmbarque } from '@ScatoModels/geolocalizacion/errores-geolocalizacion-embarque';
import { GeolocalizacionService } from './geolocalizacion.services';

@Injectable({
  providedIn: 'root'
})
export class ErroresGeolocalizacionEmbarqueService {
    
    constructor( private geolocalizacionService: GeolocalizacionService) {}

    obtenerEmbarquesErrores(listaEmbarquesLineUp: any): Array<ErroresGeolocalizacionEmbarque>{
        let listaErroresResultados = Array<ErroresGeolocalizacionEmbarque>();
        listaEmbarquesLineUp.forEach(item =>{
            const embarqueSel: any = item.embarque;
            if (embarqueSel.embarquePosicion.length == 0){
              let embarquePos:ErroresGeolocalizacionEmbarque = {
                idEmbarque : item.embarque.id,
                mensaje : '',
              };
              let listaErrores = Array<ErroresGeolocalizacion>();
              this.geolocalizacionService.ListarErroresGeolocalizacionPorEmbarque(embarqueSel.id).subscribe(res =>{
                listaErrores = res;
              }, error =>{}
               , () =>{
                if (listaErrores.length > 0){
                    const errores =  listaErrores[0];
                    embarquePos.mensaje = errores.mensaje;
                    listaErroresResultados.push(embarquePos);
                }
              });
            }
        });
        return listaErroresResultados;
    }

}