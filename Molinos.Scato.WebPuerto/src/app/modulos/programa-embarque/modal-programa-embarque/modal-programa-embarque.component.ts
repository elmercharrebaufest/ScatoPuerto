import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { NominacionDatoTecnico } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { NominacionIntervencionesComponent } from '../nominacion/nominacion-intervenciones/nominacion-intervenciones.component';
import { NominacionDetalleIntervecion } from '@ScatoModels/programa-embarque/nominacion-detalle-intervencion';
import { NominacionDatoTecnicoCalidad } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-calidad';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-modal-programa-embarque',
  templateUrl: './modal-programa-embarque.component.html',
  styleUrls: ['./modal-programa-embarque.component.css']
})
export class ModalProgramaEmbarqueComponent implements OnInit, OnDestroy {
 
  //#region Variables
  public nominacion: any;
  subscripcionProgramaModal: Subscription
  estaCargando: boolean;
  
  //#endregion

  // #region Observables
  constructor(private programaEmbarqueService: ProgramaEmbarqueService) {
   
  }
  ngOnDestroy(): void {
    
    this.subscripcionProgramaModal.unsubscribe()
  }

  ngOnInit(): void {
    this.estaCargando = true;
    this.subscripcionProgramaModal = this.programaEmbarqueService.observableProgramaModal.subscribe(
      (data: any) => {
        this.nominacion = data;  
        this.estaCargando = false;
      }
    );
    
  }  

  public retornarColor(color){
    return color;
  }
}
