import { Injectable } from '@angular/core';
import { ErroresGeolocalizacionEmbarque } from '@ScatoModels/geolocalizacion/errores-geolocalizacion-embarque';
import { GeolocalizacionService } from './geolocalizacion.services';

@Injectable({
  providedIn: 'root'
})
export class ErroresGeolocalizacionEmbarqueService {
    
    constructor( private geolocalizacionService: GeolocalizacionService) {}

    obtenerEmbarquesErrores(listaEmbarquesLineUp: any): Array<ErroresGeolocalizacionEmbarque>{
        let listaErrores = Array<ErroresGeolocalizacionEmbarque>();

        listaEmbarquesLineUp.forEach(item =>{
            const embarqueSel: any = item.embarque;
            if (embarqueSel.embarquePosicion.length == 0){
              const embarquePos:ErroresGeolocalizacionEmbarque = {
                idEmbarque : item.embarque.id,
                mensaje : '',
              };
              listaErrores.push(embarquePos);
            }
          });
        return listaErrores;

    }

}