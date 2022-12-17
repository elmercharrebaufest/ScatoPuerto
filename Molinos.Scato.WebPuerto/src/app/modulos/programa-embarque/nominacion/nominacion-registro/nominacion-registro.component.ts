import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { NominacionDatoTecnicoComponent } from '../nominacion-dato-tecnico/nominacion-dato-tecnico.component';
import { NominacionIntervencionesComponent } from '../nominacion-intervenciones/nominacion-intervenciones.component';
import { NominacionRecibosComponent } from '../nominacion-recibos/nominacion-recibos.component';

@Component({
  selector: 'app-nominacion-registro',
  templateUrl: './nominacion-registro.component.html',
  styleUrls: ['./nominacion-registro.component.css']
})
export class NominacionRegistroComponent implements OnInit, AfterViewInit{

  @ViewChild(NominacionDatoTecnicoComponent) datoTecnico!:  NominacionDatoTecnicoComponent;
  @ViewChild(NominacionRecibosComponent) datoRecibos!:  NominacionRecibosComponent;
  @ViewChild(NominacionIntervencionesComponent) datoIntervencion!:  NominacionIntervencionesComponent;

  public titulo: string = "Nueva Nominación"
  public nominacionId: number = 0;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private nominacionService: NominacionService) { 
      this.cargarValoresNominacion();
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    
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
    const nominacionParametos: NominacionParametros = {
      nominacion_Id : nominacionId,
      actualizarDatoTecnico : true,
      actualizarRecibos  : true,
      actualizarIntervenciones : true
    };
    this.nominacionService.NominacionParametros = nominacionParametos;
  }

}
