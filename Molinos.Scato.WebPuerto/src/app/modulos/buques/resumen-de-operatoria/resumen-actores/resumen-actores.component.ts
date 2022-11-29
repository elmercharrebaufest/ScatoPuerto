import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actores } from '@ScatoModels/Buques/Actores';
import { Operador } from '@ScatoModels/Buques/Operador';
import { ResumenOperatoriaEmbarque } from '@ScatoModels/Buques/resumenOperatoria';
import { BuqueService } from '@ScatoServicios/buque.service';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-resumen-actores',
  templateUrl: './resumen-actores.component.html',
  styleUrls: ['./resumen-actores.component.css']
})
export class ResumenActoresComponent implements OnInit {
  //#region variables
  idEmbarque:number;
  actores:Actores;
  operadores: Operador[];
  mostrarActores: boolean = false;
  
  //#endregion
  //#region constructor
  constructor(private route: ActivatedRoute,
              private buqueService: BuqueService,
              private buqueSharingService: BuqueSharingService){
    this.cargarParametros();
  }

  //#endregion
  //#region metodos
  ngOnInit(): void {
    this.initActores();
  }
  private cargarParametros(){
    this.idEmbarque = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
    this.buqueSharingService.getActualizarResumenOperatoria().subscribe(res=>{
      const resumenOperatoriaEmbarque: ResumenOperatoriaEmbarque = res;
      if (resumenOperatoriaEmbarque !=null && resumenOperatoriaEmbarque.actualizarDatos) {
        this.idEmbarque = resumenOperatoriaEmbarque.embarqueId;
      }
    });
  }

  initActores(){
    this.buqueService.obtenerActores(this.idEmbarque).subscribe((res: Actores) => {
      this.actores = res;
      this.mostrarActores = true
    }, err => {
      console.log(err);
    })

    this.buqueService.obtenerOperadores(this.idEmbarque).subscribe((op: Operador[]) => {
      this.operadores = op;
    }, err => {
      console.log(err);
    })
   
  }
  //#endregion
}
