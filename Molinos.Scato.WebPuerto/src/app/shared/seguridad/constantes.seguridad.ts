import { Injectable } from '@angular/core';
import { OpcionesMenu } from './opciones.menu';

@Injectable({
  providedIn: 'root'
})
export class ConstantesSeguridad{

  private opciones: string[] = ['LineUp_Ver|lineup','Carga_Ver|carga', 'Recibidores_Ver|calidad','Geolocalizacion_Ver|geolocalizacion', 'Buque_Ver|buque'];
  private menuSeguridad: OpcionesMenu[] = new Array<OpcionesMenu>();
  
  constructor() { 
    this.crearOpcionesMenu();
  }

  private crearOpcionesMenu(){
    for(let opcion of this.opciones){
      const opcioneSel = opcion.split('|');
      const opcionMenu: OpcionesMenu = {
        opcionAD : opcioneSel[0],
        menu: opcioneSel[1], 
        prioridad: opcioneSel[1] == 'lineup'? 1 : 0
      };
      this.menuSeguridad.push(opcionMenu);
    }
    console.log('menuSeguridad--->>', this.menuSeguridad);

  }
  get opcionesMenu(){
    return this.menuSeguridad;
  }

}