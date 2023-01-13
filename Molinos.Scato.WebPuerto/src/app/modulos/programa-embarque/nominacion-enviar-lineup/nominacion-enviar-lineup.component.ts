import { Component, OnDestroy, OnInit } from '@angular/core';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { NominacionLineUp } from '@ScatoModels/programa-embarque/nominacion-lineup';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionEnviarLineupService } from './nominacion-enviar-lineup.service';

@Component({
  selector: 'app-nominacion-enviar-lineup',
  templateUrl: './nominacion-enviar-lineup.component.html',
  styleUrls: ['./nominacion-enviar-lineup.component.css']
})
export class NominacionEnviarLineupComponent implements OnInit, OnDestroy {

  public listasVapores: VaporInformacion[] = null;
  public listaEnviarLineUp: NominacionLineUp[] = null;
  public esSeleccionarTodos:boolean = false;
  public cargandoNominaciones: boolean = false;
  private destroy$ = new Subject();
  constructor(private nominacionEnviarLineupService: NominacionEnviarLineupService) { 
    this.listarBuquesNominacion();
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();  
  }
  onCargarNominaciones(event){
    this.listarNominacionPorBuque(event.target.value);
  }
  onSeleccionarNominacion(id: number){
    let nominacion = this.listaEnviarLineUp.filter(x=> x.nominacion_Id == id);
    nominacion[0].seleccionado=!nominacion[0].seleccionado; 
    this.esSeleccionarTodos = false;

  }
  onSeleccionarTodos(event){
    const seleccionado: boolean = event.target.checked;
    this.listaEnviarLineUp.forEach(lineUp =>{
      lineUp.seleccionado = seleccionado;
    });
    this.esSeleccionarTodos = seleccionado;
  }
  public listarBuquesNominacion(){
    this.cargandoNominaciones = true;
    this.nominacionEnviarLineupService.listarBuquesNominacion().pipe(takeUntil(this.destroy$)).subscribe((data: VaporInformacion[]) =>{
      this.listasVapores = data;
      this.cargandoNominaciones = false;
    });
  }
  private listarNominacionPorBuque(id: number){
    this.cargandoNominaciones = true;
    this.nominacionEnviarLineupService.listarNominacionPorBuque(id).pipe(takeUntil(this.destroy$)).subscribe((data: NominacionLineUp[]) =>{
      this.listaEnviarLineUp = data;
      this.listaEnviarLineUp.forEach(item=>{
        item.seleccionado = false;
      });
      this.cargandoNominaciones = false;
    });
  }

}
