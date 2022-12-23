import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionDatoTecnicoComponent } from '../nominacion-dato-tecnico/nominacion-dato-tecnico.component';
import { NominacionIntervencionesComponent } from '../nominacion-intervenciones/nominacion-intervenciones.component';
import { NominacionRecibosComponent } from '../nominacion-recibos/nominacion-recibos.component';

@Component({
  selector: 'app-nominacion-registro',
  templateUrl: './nominacion-registro.component.html',
  styleUrls: ['./nominacion-registro.component.css']
})
export class NominacionRegistroComponent implements OnInit, OnDestroy{

  @ViewChild(NominacionDatoTecnicoComponent) datoTecnico!:  NominacionDatoTecnicoComponent;
  @ViewChild(NominacionRecibosComponent) datoRecibos!:  NominacionRecibosComponent;
  @ViewChild(NominacionIntervencionesComponent) datoIntervencion!:  NominacionIntervencionesComponent;

  public titulo: string = "Nueva Nominación"
  public nominacionId: number = 0;
  private destroy$ = new Subject();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private nominacionService: NominacionService) { 
      this.cargarValoresNominacion();
  }

  ngOnInit(): void {

  }

  public onGuardarNominacion(){
  }

  public onCancelarNominacion(){
    this.router.navigate([`programa`]);
  }

  private cargarValoresNominacion() {   
    const nominacionId = this.route.snapshot.paramMap.get('idnominacion');
    this.nominacionId = nominacionId !=null? parseInt(nominacionId) : 0;
    this.titulo = this.nominacionId == 0 ? 'Nueva Nominación' : 'Editar Nominación';
    this.asignarNominacionParametros(this.nominacionId);
  }

  private asignarNominacionParametros(nominacionId: number){
    let nominacionParametos: NominacionParametros = {
      nominacion_Id : nominacionId,
      actualizarDatoTecnico : true,
      actualizarRecibos  : true,
      actualizarIntervenciones : true,
      nominacion: null
    };
    if (nominacionId>0){
      this.nominacionService.obtenerNominacion(nominacionId).pipe(takeUntil(this.destroy$)).subscribe(data =>{
        nominacionParametos.nominacion = data;
        this.nominacionService.NominacionParametros = nominacionParametos;
      });
    }else{
      this.nominacionService.NominacionParametros = nominacionParametos;
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();  
  }
}
