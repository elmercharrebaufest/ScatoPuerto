import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { VaporService } from '@ScatoServicios/vapor.service';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';


@Component({
  selector: 'app-modal-vapor-historico',
  templateUrl: './modal-vapor-historico.component.html',
  styleUrls: ['./modal-vapor-historico.component.css']
})
export class ModalVaporInformacionComponent implements OnInit, OnDestroy {

  //#region Variables
  public nominacion: any;
  subscripcionVaporModal: Subscription
  estaCargando: boolean;
  @Output() cerrar = new EventEmitter<void>()
  vapores: VaporInformacion[] = [];
   tieneDatos: boolean = false;

  //#endregion

  // #region Observables
  constructor(private vaporService: VaporService) {

  }
  ngOnDestroy(): void {
    this.subscripcionVaporModal.unsubscribe()
  }


  cerraModal() {
    this.cerrar.emit();
   }

  ngOnInit(): void {
     this.estaCargando = true;
     this.subscripcionVaporModal = this.vaporService.observableVaporModal.subscribe(
       (data: VaporInformacion[]) => {
         this.vapores = data;
         if(this.vapores != null && this.vapores.length > 0){
          this.tieneDatos = true;
         }
        this.estaCargando = false;
       }
     );
  }

}
