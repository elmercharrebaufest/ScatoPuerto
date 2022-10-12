import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actores } from '@ScatoModels/Buques/Actores';
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

    forkJoin([
      this.buqueService.obtenerActores(this.idEmbarque),
    ]).subscribe(([res1]) => {
      this.actores = res1;
      this.mostrarActores = true
      console.log("====ACTORES====", this.actores);

    }, err => { console.log(err); });

  }
  //#endregion
}
