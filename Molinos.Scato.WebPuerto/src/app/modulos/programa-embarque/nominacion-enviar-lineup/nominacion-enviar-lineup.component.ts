import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { NominacionLineUp } from '@ScatoModels/programa-embarque/nominacion-lineup';
import { ProgramaEmbarqueNominacion, ProgramaEmbarqueNominacionesEnvioLineUp } from '@ScatoModels/programa-embarque/programa-embarque-nominaciones-envio';
import { ProgramaEmbarqueResultadoResultado } from '@ScatoModels/programa-embarque/programa-embarque-nominaciones-resultado';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionEnviarLineupService } from './nominacion-enviar-lineup.service';

@Component({
  selector: 'app-nominacion-enviar-lineup',
  templateUrl: './nominacion-enviar-lineup.component.html',
  styleUrls: ['./nominacion-enviar-lineup.component.css']
})
export class NominacionEnviarLineupComponent implements OnInit, OnDestroy {

  @Output() modalCerrar = new EventEmitter<void>()

  public listasVapores: VaporInformacion[] = null;
  public listaEnviarLineUp: NominacionLineUp[] = null;
  public esSeleccionarTodos: boolean = false;
  public cargandoNominaciones: boolean = false;
  public procesandoEnvioLineUp: boolean = false;
  public mensajeEnvioLineUp: string = "";
  private destroy$ = new Subject();

  constructor(private nominacionEnviarLineupService: NominacionEnviarLineupService,
    private confirmationDialogService: ConfirmationDialogService) {
    this.listarBuquesNominacion();
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  onCargarNominaciones(event) {
    this.listaEnviarLineUp = null;
    let vaporSel = event.target.value;
    if (vaporSel != '')
      this.listarNominacionPorBuque(event.target.value);
  }

  onSeleccionarNominacion(id: number) {
    let nominacion = this.listaEnviarLineUp.filter(x => x.nominacion_Id == id);
    nominacion[0].seleccionado = !nominacion[0].seleccionado;
    this.esSeleccionarTodos = false;
  }

  onSeleccionarTodos(event) {
    const seleccionado: boolean = event.target.checked;
    this.listaEnviarLineUp.forEach(lineUp => {
      if (!lineUp.procesado)
        lineUp.seleccionado = seleccionado;
    });
    this.esSeleccionarTodos = seleccionado;
    this.procesandoEnvioLineUp = false;
  }

  onCerraModal() {
    this.modalCerrar.emit();
  }

  public onEnviarNominacionLineUp() {
    let nominacionesEnvioLineUp: ProgramaEmbarqueNominacionesEnvioLineUp = new ProgramaEmbarqueNominacionesEnvioLineUp();
    let listaNominaciones: ProgramaEmbarqueNominacion[] = [];
    this.listaEnviarLineUp.forEach(item => {
      if (item.seleccionado && !item.procesado)
        listaNominaciones.push({ nominacion_Id: item.nominacion_Id });
    });
    if (listaNominaciones.length == 0) {
      this.confirmationDialogService.confirm('Enviar a LineUp', 'Seleccione una nominación para enviar al lineup.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return false;
    }
    this.cargandoNominaciones = true;
    this.procesandoEnvioLineUp = true;
    this.mensajeEnvioLineUp = Mensajes.procesando;
    nominacionesEnvioLineUp.listaNominaciones = listaNominaciones;
    this.nominacionEnviarLineupService.enviarNominacionLineUp(nominacionesEnvioLineUp).pipe(takeUntil(this.destroy$)).subscribe(async (data: ProgramaEmbarqueResultadoResultado) => {
      await this.confirmationDialogService.confirm('Enviar a LineUp', 'Se enviarón las nominaciones al lineup satisfactoriamente.', 'Cerrar', '', null, null, Tipoalerta.Success)
      this.cargandoNominaciones = false;
      this.esSeleccionarTodos = false;
      this.procesandoEnvioLineUp = false;
      window.location.reload();
      // this.actualizarResultadoNominacion(data);
    }, error => {
      this.confirmationDialogService.confirm('Enviar a LineUp', 'Ha ocurrido un error al enviar las nominaciones al lineup', 'Cerrar', '', null, null, Tipoalerta.Error)
      this.cargandoNominaciones = false;
      this.procesandoEnvioLineUp = false;
    });
  }

  public listarBuquesNominacion() {
    this.cargandoNominaciones = true;
    this.mensajeEnvioLineUp = Mensajes.cargando;
    this.nominacionEnviarLineupService.listarBuquesNominacion().pipe(takeUntil(this.destroy$)).subscribe((data: VaporInformacion[]) => {
      this.listasVapores = data;
      this.cargandoNominaciones = false;
    });
  }

  private listarNominacionPorBuque(id: number) {
    this.cargandoNominaciones = true;
    this.mensajeEnvioLineUp = Mensajes.listados;
    this.nominacionEnviarLineupService.listarNominacionPorBuque(id).pipe(takeUntil(this.destroy$)).subscribe((data: NominacionLineUp[]) => {
      this.listaEnviarLineUp = data;
      this.listaEnviarLineUp.forEach(item => {
        item.seleccionado = false;
      });
      this.cargandoNominaciones = false;
    });
  }

  private actualizarResultadoNominacion(data: ProgramaEmbarqueResultadoResultado) {
    this.listaEnviarLineUp.forEach(lineUp => {
      let lineUpSel = data.resultadoEnvioLineUp.filter(x => x.nominacion_Id == lineUp.nominacion_Id);
      if (lineUpSel.length > 0) {
        const procesado: boolean = lineUpSel[0].estado > 0 ? true : false;
        const observaciones: string = lineUpSel[0].observacion;
        lineUp.seleccionado = false;
        lineUp.procesado = procesado;
        lineUp.observaciones = observaciones;
      }
    });
  }

}

enum Mensajes {
  cargando = "Cargando lista de buques. Por favor, espere...",
  procesando = "Procesando envio a lineup. Por favor, espere...",
  listados = "Cargando lista de nominaciones. Por favor, espere...",
}
