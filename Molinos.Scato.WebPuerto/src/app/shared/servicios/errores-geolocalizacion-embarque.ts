import { Injectable } from '@angular/core';
import { ErroresGeolocalizacion } from '@ScatoModels/geolocalizacion/errores-geolocalizacion';
import { ErroresGeolocalizacionEmbarque } from '@ScatoModels/geolocalizacion/errores-geolocalizacion-embarque';
import { Observable, Subject } from 'rxjs';
import { GeolocalizacionService } from './geolocalizacion.services';

@Injectable({
  providedIn: 'root'
})
export class ErroresGeolocalizacionEmbarqueService {
    
    constructor( private geolocalizacionService: GeolocalizacionService) {}

    obtenerEmbarquesErrores(listaErroresEmbarques: ErroresGeolocalizacion[], idEmbarque: number): ErroresGeolocalizacionEmbarque{
      let listaErroresResultados:ErroresGeolocalizacionEmbarque = null;

      let embarquePos: ErroresGeolocalizacionEmbarque = {
        idEmbarque : idEmbarque,
        mensaje : '',
      };
      console.log('listaErroresEmbarques-->>', listaErroresEmbarques, idEmbarque)
      const listaErrores = listaErroresEmbarques.filter(x=> x.embarque_id == idEmbarque);
      console.log('listaErrores-->>', listaErrores)
      if (listaErrores != null && listaErrores != undefined){
        if (listaErrores.length > 0){
          const errores =  listaErrores[0];
          console.log('errores-->>', errores)

          const mensaje1 = 'Después de hacer una búsqueda en la página de Marine Traffic, no logramos encontrar';
          const mensaje2 = 'Se encontró más de un barco con el mismo nombre, por lo tanto se necesitara el IMO';

            if (errores.mensaje.indexOf(mensaje1) > -1 )
              embarquePos.mensaje = 'Buque no encontrado, validar datos ingresados.';
            if (errores.mensaje.indexOf(mensaje2) > -1 )
              embarquePos.mensaje = 'Existe más de un buque con esos datos, ingresar IMO.';
              console.log('embarquePos-->>', embarquePos)

          listaErroresResultados = embarquePos;
        }
      }      
      return listaErroresResultados;
    }

}