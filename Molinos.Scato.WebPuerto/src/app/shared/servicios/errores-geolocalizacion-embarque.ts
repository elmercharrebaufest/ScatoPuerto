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

    obtenerEmbarquesErrores(idEmbarque: number): Observable<ErroresGeolocalizacionEmbarque>{
      let listaErroresResultados = new Subject<ErroresGeolocalizacionEmbarque>();

      let embarquePos: ErroresGeolocalizacionEmbarque = {
        idEmbarque : idEmbarque,
        mensaje : '',
      };
      let listaErrores = Array<ErroresGeolocalizacion>();
      this.geolocalizacionService.ListarErroresGeolocalizacionPorEmbarque(idEmbarque).subscribe(res =>{
        listaErrores = res;
      }, error =>{}, 
      () =>{
        if (listaErrores.length > 0){
          const errores =  listaErrores[0];
          let mensaje = '';
          const mensaje1 = 'Después de hacer una búsqueda en la página de Marine Traffic, no logramos encontrar';
          const mensaje2 = 'Se encontró más de un barco con el mismo nombre, por lo tanto se necesitara el IMO';

            if (errores.mensaje.indexOf(mensaje1) > -1 )
              embarquePos.mensaje = 'Buque no encontrado, validar datos ingresados.';
            if (errores.mensaje.indexOf(mensaje2) > -1 )
              embarquePos.mensaje = 'Existe más de un buque con esos datos, ingresar IMO.';
          listaErroresResultados.next(embarquePos);
        }
      });
      return listaErroresResultados;
    }

}