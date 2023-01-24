import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { NominacionDatoTecnico } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { NominacionIntervencionesComponent } from '../nominacion/nominacion-intervenciones/nominacion-intervenciones.component';
import { NominacionDetalleIntervencion, Senasa } from '@ScatoModels/programa-embarque/nominacion-detalle-intervencion';
import { NominacionDatoTecnicoCalidad } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-calidad';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Auditoria } from '@ScatoModels/programa-embarque/auditoria';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { finalize } from 'rxjs/operators';


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
  auditoria: Auditoria[] = [];
  @Output() cerrar = new EventEmitter<void>()

  //#endregion

  // #region Observables
  constructor(private programaEmbarqueService: ProgramaEmbarqueService) {

  }
  ngOnDestroy(): void {
    this.subscripcionProgramaModal.unsubscribe()
  }


  cerraModal() {
    this.cerrar.emit();
   }

  ngOnInit(): void {
    this.estaCargando = true;
    this.subscripcionProgramaModal = this.programaEmbarqueService.observableProgramaModal.subscribe(
      (data: Nominacion) => {
        this.nominacion = data;
        this.estaCargando = false;
        //Obtengo las auditorias asociadas a esa nominación.
        this.obtenerAuditorias();
      }
    );
  }

  obtenerAuditorias() {
    //this.nominacion.id
    this.programaEmbarqueService.obtenerAuditoria(this.nominacion.id).subscribe((res: Auditoria[]) => {
      this.auditoria = res;
    }, error => { }, () => {
      this.nominacion;
      //Recoorro todas las variables de la nominación
      for (const [key, value] of Object.entries(this.nominacion)) {
        //Me fijo si el values es de tipo object
        if (value != null && value != undefined && typeof value == 'object') {
          //Me fijo si el objeto es un dato técnico
          if (key == 'nominacionDatoTecnico') {
            //Recorro todas las variables del dato técnico.
            for (const [key2, value2] of Object.entries(value)) {              
              if (key2 != null && key2 != undefined && value != null && value2 != undefined && typeof value2 != 'object') {
                //Busco si esa variable existe en mi tabla de auditorías.
                let audit: any = this.auditoria.find(x => x.entidadNombre?.toLowerCase() == key.toLowerCase() && x.propiedad.toLowerCase() == key2.toLowerCase())
                if (audit != null && audit != undefined) {                  
                  //En caso de encontrarla me fijo si tiene la clase que valida auditoría y la pinto de rojo.
                  document.getElementsByClassName(key + key2 + "Auditoria")[0].classList.add('texto-rojo');
                  //También pinto el título del tab de la pantalla
                  document.getElementsByClassName("tabDatoTecnicoAuditoria")[0].classList.add('texto-rojo');
                  //Y le agrego el puntito rojo al tab.
                  (document.getElementsByClassName("auditoriaTecnicoCheck")[0] as HTMLElement) .style.visibility ='visible';
                }
              }
            }
          //Me fijo si el objeto es un detalle intervención
          } else if (key == 'nominacionDetalleIntervencion') {
            //Recorro todas las variables del objeto            
            for (const [key2, value2] of Object.entries(value)) {
              let id: number = 0;
              //Me fijo si es el array de senasa.
              if (key2 == 'senasa') {
                let i: number = 0;
                for (const [key3, value3] of Object.entries(value2)) {
                  for (const [key4, value4] of Object.entries(value3)) {
                    //Me guardo el ID para poder buscar en la auditoría.
                    if (key4.toLowerCase() == 'id') {
                      if (typeof value4 == 'number') id = value4;
                    }
                    let audit: any = this.auditoria.find(x => x.entidadNombre?.toLowerCase() == key2.toLowerCase() && x.propiedad.toLowerCase() == key4.toLowerCase() && x.entidad_Id == id)
                    if (audit != null && audit != undefined) {
                      //Busco observacionesDatoTecnicoAuditoria y lo pongo rojo
                      document.getElementsByClassName(key + key4 + "Auditoria")[i].classList.add('texto-rojo');
                      document.getElementsByClassName("tabDetalleIntervencionAuditoria")[0].classList.add('texto-rojo');
                      (document.getElementsByClassName("auditoriaIntervencionCheck")[0] as HTMLElement) .style.visibility ='visible';
                    }
                  }
                  i++;
                }
              } else{ 
                if (key2 != null && key2 != undefined && value != null && value2 != undefined && typeof value2 != 'object') {
                  //Busco si esa variable existe en mi tabla de auditorías.
                  let audit: any = this.auditoria.find(x => x.entidadNombre?.toLowerCase() == key.toLowerCase() && x.propiedad.toLowerCase() == key2.toLowerCase())
                  if (audit != null && audit != undefined) {
                    //En caso de encontrarla me fijo si tiene la clase que valida auditoría y la pinto de rojo.
                    document.getElementsByClassName(key + key2 + "Auditoria")[0].classList.add('texto-rojo');
                    document.getElementsByClassName("tabDetalleIntervencionAuditoria")[0].classList.add('texto-rojo');
                    (document.getElementsByClassName("auditoriaIntervencionCheck")[0] as HTMLElement) .style.visibility ='visible';
                  }
                }
              }
            }
          } else if (key == 'nominacionRecibo') {
            let i: number = 0;
            if (value != null) {
              for (const [key2, value2] of Object.entries(value)) {
                let id: number = 0;
                if (value2 != null) {
                  for (const [key3, value3] of Object.entries(value2)) {
                    if (key3 != null && key3 != undefined && value2 != null && value3 != undefined && typeof value3 != 'object') {
                      if (key3.toLowerCase() == 'id') {
                        if (typeof value3 == 'number') id = value3;
                      }
                      let audit: any = this.auditoria.find(x => x.entidadNombre?.toLowerCase() == key.toLowerCase() && x.propiedad.toLowerCase() == key3.toLowerCase() && x.entidad_Id == id)
                      if (audit != null && audit != undefined) {
                        //Busco observacionesDatoTecnicoAuditoria y lo pongo rojo
                        document.getElementsByClassName(key + key3 + "Auditoria")[i].classList.add('texto-rojo');
                        document.getElementsByClassName("tabDatosDeReciboAuditoria")[0].classList.add('texto-rojo');
                        (document.getElementsByClassName("auditoriaReciboCheck")[0] as HTMLElement) .style.visibility ='visible';
                      }
                    }
                  }
                }
                i++;
              }
            }
          }


        } else {
          //es una variable
          this.auditoria.find(x => x.entidadNombre == "nominacion" && x.propiedad == key)
        }
      }


      // Object.keys(this.nominacion).forEach(e => {
      //   if(e.ty)
      //   this.auditoria.find(x => x.entidadNombre == 'nominacionDatoTecnico' && x.propiedad == e)
      // })
      this.verificarEstado();
    })
  }

  verificarEstado() {

  }

  public retornarColor(color) {
    return color;
  }

}
