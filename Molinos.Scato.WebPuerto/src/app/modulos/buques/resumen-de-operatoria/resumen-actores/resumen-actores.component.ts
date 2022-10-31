import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actores } from '@ScatoModels/Buques/Actores';
import { Operador } from '@ScatoModels/Buques/Operador';
import { BuqueService } from '@ScatoServicios/buque.service';
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
  constructor
  (
    private route: ActivatedRoute,
    private buqueService: BuqueService,
  )
  {
    this.idEmbarque = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
  }

  //#endregion
  //#region metodos
  ngOnInit(): void {
    this.initActores();
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
