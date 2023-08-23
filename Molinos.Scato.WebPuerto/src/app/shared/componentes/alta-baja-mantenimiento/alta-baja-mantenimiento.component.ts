import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AltaBajaTipo } from '@ScatoEnums/alta-baja-tipo';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { ATAPuerto } from '@ScatoModels/ata-puerto';
import { CompaniaDeFumigacion } from '@ScatoModels/programa-embarque/compania-de-fumigacion';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TipoDeFumigacion } from '@ScatoModels/programa-embarque/tipo-de-fumigacion';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AltaBajaMantenimientoService } from './alta-baja-mantenimiento.service';

@Component({
  selector: 'app-alta-baja-mantenimiento',
  templateUrl: './alta-baja-mantenimiento.component.html',
  styleUrls: ['./alta-baja-mantenimiento.component.css']
})
export class AltaBajaMantenimientoComponent implements OnInit, OnDestroy {

  @Input() modal;
  @Input() tipoAltaBaja: number;
  @Output() actualizarTipoLista = new EventEmitter<number>();

  public tipo: number;
  public titulo: string = 'Registrar';
  public altaBajaForm: FormGroup;
  private destroy$ = new Subject();

  constructor(private altaBajaMantenimientoService: AltaBajaMantenimientoService,
              private confirmationDialogService: ConfirmationDialogService) {
    this.inicializarForm();
  }
  ngOnInit(): void {
    this.cargarTipo();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  private inicializarForm() {
    this.altaBajaForm = this.altaBajaMantenimientoService.inicializarFormNuevo();
  }

  cargarTipo() {
    if (this.tipoAltaBaja == AltaBajaTipo.ATA) this.titulo += ' ATA';
    if (this.tipoAltaBaja == AltaBajaTipo.AgenciaMaritimaPuerto) this.titulo += ' Agencia Maritima Puerto';
    if (this.tipoAltaBaja == AltaBajaTipo.Surveyor) this.titulo += ' Surveyor';
    if (this.tipoAltaBaja == AltaBajaTipo.TipoDeFumigacion) this.titulo += ' Tipo de fumigacion';
    if (this.tipoAltaBaja == AltaBajaTipo.CompaniaDeFumigacion) this.titulo += ' Compañia de fumigacion';
  }

  validarSurveyor(): boolean {
    let bValidar: boolean = true;
    const descripcion = this.altaBajaForm.controls['descripcion'].value;
    const mail = this.altaBajaForm.controls['mail'].value;
    if (descripcion == '' || mail == '') {
      bValidar = false;
      this.confirmationDialogService.confirm('Registro', 'Debe completar toda la información para el registro.', 'Aceptar', '', null, null, Tipoalerta.Warning);
    } 
    return bValidar;
  }
  validarTipoDeFumigacion(): boolean {
    let bValidar: boolean = true;
    const descripcion = this.altaBajaForm.controls['descripcion'].value;
    if (descripcion == '') {
      bValidar = false;
      this.confirmationDialogService.confirm('Registro', 'Debe completar toda la información para el registro.', 'Aceptar', '', null, null, Tipoalerta.Warning);
    } 
    return bValidar;
  }
  validarCompaniaDeFumigacion(): boolean {
    let bValidar: boolean = true;
    const descripcion = this.altaBajaForm.controls['descripcion'].value;
    const mail = this.altaBajaForm.controls['mail'].value;
    if (descripcion == '' || mail == ''){
      bValidar = false;
      this.confirmationDialogService.confirm('Registro', 'Debe completar toda la información para el registro.', 'Aceptar', '', null, null, Tipoalerta.Warning);
    } 
    return bValidar;
  }
  validarAltaBaja(): boolean {
    let bValidar: boolean = true;
    const nombre = this.altaBajaForm.controls['nombre'].value;
    if (nombre == ''){
      bValidar = false;
      this.confirmationDialogService.confirm('Registro', 'Debe completar toda la información para el registro.', 'Aceptar', '', null, null, Tipoalerta.Warning);
    } 
    return bValidar;
  }

  guardarSurveyor() {
    let surveyor: Surveyor = new Surveyor();
    const descripcion = this.altaBajaForm.controls['descripcion'].value;
    const mail = this.altaBajaForm.controls['mail'].value;
    surveyor.id = 0;
    surveyor.descripcion = descripcion;
    surveyor.mail = mail;
    this.altaBajaMantenimientoService.registrarSurveyor(surveyor).pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.actualizarTipoLista.emit(AltaBajaTipo.Surveyor);
      this.modal.dismiss();
    });
  }

  guardarAgenciaMaritimaPuerto() {
    const nombre = this.altaBajaForm.controls['nombre'].value;
    let agencia: AgenciaMaritimaPuerto = new AgenciaMaritimaPuerto(0, nombre);
    this.altaBajaMantenimientoService.registrarAgenciaMaritimaPuerto(agencia);
    this.actualizarTipoLista.emit(AltaBajaTipo.AgenciaMaritimaPuerto);
    this.modal.dismiss();
  }

  guardarATAPuerto() {
    const nombre = this.altaBajaForm.controls['nombre'].value;
    let ataPuerto: ATAPuerto = new ATAPuerto(0, nombre);
    this.altaBajaMantenimientoService.registrarAgregarATAPuerto(ataPuerto);
    this.actualizarTipoLista.emit(AltaBajaTipo.ATA);
    this.modal.dismiss();
  }
  guardarTipoDeFumigacion() {
    const descripcion = this.altaBajaForm.controls['descripcion'].value;
    let tipoDeFumigacion: TipoDeFumigacion = new TipoDeFumigacion();
    tipoDeFumigacion.id = 0;
    tipoDeFumigacion.descripcion = descripcion;
    this.altaBajaMantenimientoService.registrarTipoDeFumigacion(tipoDeFumigacion);
    this.actualizarTipoLista.emit(AltaBajaTipo.TipoDeFumigacion);
    this.modal.dismiss();
  }
  guardarCompaniaDeFumigacion() {
    let companiaDeFumigacion: CompaniaDeFumigacion = new CompaniaDeFumigacion();
    const descripcion = this.altaBajaForm.controls['descripcion'].value;
    const mail = this.altaBajaForm.controls['mail'].value;
    companiaDeFumigacion.id = 0;
    companiaDeFumigacion.descripcion = descripcion;
    companiaDeFumigacion.mail = mail;
    this.altaBajaMantenimientoService.registrarCompaniaDeFumigacion(companiaDeFumigacion);
      this.actualizarTipoLista.emit(AltaBajaTipo.CompaniaDeFumigacion);
      this.modal.dismiss();
  }

  onGuardar() {
    let validacion = false;
    switch (this.tipoAltaBaja) {
      case AltaBajaTipo.Surveyor:
        validacion = this.validarSurveyor();
        if (validacion) {
          this.guardarSurveyor();
        }
        break;
      case AltaBajaTipo.AgenciaMaritimaPuerto:
        validacion = this.validarAltaBaja();
        if (validacion) {
          this.guardarAgenciaMaritimaPuerto();
        }
        break;
      case AltaBajaTipo.ATA:
        validacion = this.validarAltaBaja();
        if (validacion) {
          this.guardarATAPuerto();
        }
        break;
      case AltaBajaTipo.TipoDeFumigacion:
        validacion = this.validarTipoDeFumigacion();
        if (validacion) {
          this.guardarTipoDeFumigacion();
        }
        break;
      case AltaBajaTipo.CompaniaDeFumigacion:
        validacion = this.validarCompaniaDeFumigacion();
        if (validacion) {
          this.guardarCompaniaDeFumigacion();
        }
        break;
    }
  }

}
