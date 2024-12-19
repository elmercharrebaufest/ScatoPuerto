import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { Auditoria } from '@ScatoModels/programa-embarque/auditoria';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';

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
  public mostrarNombreOtroMuelle = false;
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
        if (data.nominacionDatoTecnico.muelleDeCarga.descripcion == 'Otros Muelles' && data.nominacionDatoTecnico.otroMuelleNombre) {
          this.mostrarNombreOtroMuelle = true;
        }
        //Obtengo las auditorias asociadas a esa nominación.
        setTimeout(() => this.obtenerAuditorias(), 200);
      }
    );
  }

  obtenerAuditorias() {
    //this.nominacion.id
    this.programaEmbarqueService.obtenerAuditoria(this.nominacion.id).subscribe((res: Auditoria[]) => {
      this.auditoria = res;
    }, error => { }, () => {
      // #region Tabs

      // Dato técnico
      if (this.auditoria.some(a => a.entidadNombre.startsWith('NominacionDatoTecnico'))) {
        document.getElementsByClassName("tabDatoTecnicoAuditoria")[0]?.classList.add('texto-rojo');
        const puntoRojo = document.getElementsByClassName("auditoriaTecnicoCheck")[0] as HTMLElement;
        if (puntoRojo) puntoRojo.style.visibility = 'visible';
      }

      // Detalles Intervención
      if (this.auditoria.some(a => ['NominacionDetalleIntervencion', 'Senasa'].includes(a.entidadNombre))) {
        // color rojo en nombre de tab y aparición de punto rojo
        document.getElementsByClassName("tabDetalleIntervencionAuditoria")[0]?.classList.add('texto-rojo');
        const puntoRojo = document.getElementsByClassName("auditoriaIntervencionCheck")[0] as HTMLElement;
        if (puntoRojo) puntoRojo.style.visibility = 'visible';
      }

      // Recibos
      if (this.auditoria.some(a => a.entidadNombre == 'NominacionRecibo')) {
        document.getElementsByClassName("tabDatosDeReciboAuditoria")[0]?.classList.add('texto-rojo');
        const puntoRojo = document.getElementsByClassName("auditoriaReciboCheck")[0] as HTMLElement;
        if (puntoRojo) puntoRojo.style.visibility = 'visible';
      }

      // #endregion Tabs

      const fnCase = (str: string) => str.charAt(0).toLocaleLowerCase() + str.slice(1); // funcion para pasar de PascalCase a camelCase

      // Se recorren los valores de de auditoria y se ponen en rojo las propiedades que aparecen. Se excluyen arrays
      this.auditoria.filter(a => !/Senasa|NominacionRecibo|NominacionDatoTecnico(?=\w)/i.test(a.entidadNombre)).forEach(a => {
        const [entidad, propiedad] = [fnCase(a.entidadNombre), fnCase(a.propiedad)];
        const elemento = document.getElementsByClassName(entidad + propiedad + 'Auditoria')[0] || document.getElementsByClassName(entidad + propiedad.toLocaleLowerCase() + 'Auditoria')[0];
        elemento?.classList.add('texto-rojo');
      });

      // Coordinador, Exportador y Destino
      this.auditoria.filter(a => /NominacionDatoTecnico.{1,}/g.test(a.entidadNombre)).forEach(a => {
        const campo = document.getElementsByClassName(a.entidadNombre + a.entidad_Id)[0];
        campo.classList.add('texto-rojo');
      });

      // Recibos
      this.auditoria.filter(a => a.entidadNombre == 'NominacionRecibo').forEach(a => {
        const tr = document.querySelector(`tr[data-reciboid="${a.entidad_Id}"]`);
        if (tr) { // Puede no existir al tratarse de una eliminación
          if (a.propiedad == 'Exportador') { // Nuevo recibo
            tr.classList.add('nuevo-elemento')
          } else {
            const selector = fnCase(a.entidadNombre) + fnCase(a.propiedad) + 'Auditoria';
            const elemento = tr.getElementsByClassName(selector)[0];
            elemento?.classList.add('texto-rojo');
          }
        }
      });

      // Senasa
      this.auditoria.filter(a => a.entidadNombre == 'Senasa').forEach(a => {
        const tr = document.querySelector(`tr[data-senasaid="${a.entidad_Id}"]`);
        if (tr) { // Puede no existir al tratarse de una eliminación
          if (a.propiedad == 'Exportador') { // Nuevo SENASA
            tr.classList.add('nuevo-elemento')
          } else {
            const selector = fnCase(a.entidadNombre) + fnCase(a.propiedad) + 'Auditoria';
            console.log(selector);
            const elemento = tr.getElementsByClassName(selector)[0];
            elemento?.classList.add('texto-rojo');
          }
        }
      });

      this.verificarEstado();
    })
  }

  verificarEstado() {

  }

  public retornarColor(color) {
    return color;
  }

}
