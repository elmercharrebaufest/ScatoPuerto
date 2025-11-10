import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Mail } from '@ScatoModels/mail';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { SessionService } from '@ScatoServicios/session.service';
import { SignalRService } from '@ScatoServicios/signal-r.service';
import { BalanzasManualService } from 'app/modulos/carga/carga-solidos/tableristas/balanzas-manual/balanzas-manual.service';
import { InicioFinalizacionCargaService } from 'app/modulos/carga/carga-solidos/tableristas/inicio-finalizacion-carga.services';
import { retry, take } from 'rxjs/operators';

@Component({
  selector: 'app-amarre-nuevo',
  templateUrl: './amarre-nuevo.component.html',
  styleUrls: ['./amarre-nuevo.component.css']
})
export class AmarreNuevoComponent implements OnInit {

  @Input() esLiquido: boolean = false;
  @Input() ModuloDeCargaId: number;
  @Input() esSoloLectura: boolean = false;
  @Output() inicioCarga = new EventEmitter<boolean>();
  public formAmarre: FormGroup;
  public guardando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private session: SessionService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService,
    private moduloDeCargaService: ModuloDeCargaService,
    private balanzasManualService: BalanzasManualService,
    private inicioFinalizacionCargaService: InicioFinalizacionCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private signalr: SignalRService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.ModuloDeCargaId) {
      this.cargarDatos();
    }
    if (!this.tienePermisoModificar() || this.esSoloLectura) {
      this.formAmarre.disable();
    }
  }

  private initForm() {
    this.formAmarre = this.fb.group({
      id: '',
      fechaHoraRada: '',
      fechaHoraPracticoABordo: '',
      fechaHoraSalioDeRada: '',
      fechaHoraAmarro: '',
      vientoAmarro: '',
      direccionAmarro: '',
      fechaHoraHabilitacion: '',
      fechaHoraConexionMangueras: '',
      fechaHoraComienzoCarga: '',
      fechaHoraDesconexionMangueras: '',
      fechaHoraFinalizacionCarga: '',
      fechaHoraPracticoSalida: '',
      fechaHoraDesamarro: '',
      vientoDesamarro: '',
      direccionDesamarro: '',
    });
  }

  private tienePermisoModificar() {
    const user = this.session.getUser() as Usuario;
    const permiso = this.esLiquido ? PermisosScato.Liquido_EditarPeriodoDeCarga : PermisosScato.TableroSolido_Amarre_Modificar;
    return user.permisos.some(p => p === permiso);
  }

  public async cargarDatos() {
    try {
      const periodoDeCarga = await this.moduloDeCargaService.obtenerPeriodoDeCargaNuevo(this.ModuloDeCargaId).pipe(take(1)).toPromise();
      if (periodoDeCarga) {
        this.formAmarre.patchValue(periodoDeCarga);
      }
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ocurrió un error al cargar el periodo de carga');
    }
  }

  public async esValido() {

  }

  public async guardar(texto: string = "¿Seguro que desea guardar el periodo de carga?") {
    const fechasValidas = await this.validarFechas();
    if (!fechasValidas) {
      return;
    }
    const confirm = await this.confirmationDialogService.confirmar("Atención!", texto);
    if (!confirm || !this.ModuloDeCargaId) {
      return false;
    }
    const datosForm = this.formAmarre.getRawValue();
    this.guardando = true;
    try {
      await this.moduloDeCargaService.guardarPeriodoDeCargaNuevo(datosForm, this.ModuloDeCargaId).pipe(take(1)).toPromise();
      await this.signalr.enviarNotificacion('periodoCarga', this.ModuloDeCargaId);
      this.guardando = false;
      await this.confirmationDialogService.exito('Se ha guardado el periodo de carga correctamente');

      this.inicioCarga.emit(true);

      // Una vez guardados los cambios se ponen en pristine los controles del form para detectar cambios posteriores al guardado y evitar detectar los ya realizados
      this.formAmarre.get('fechaHoraComienzoCarga').markAsPristine();
      this.formAmarre.get('fechaHoraFinalizacionCarga').markAsPristine();
      this.procesoService.setFechaComienzoCarga(this.formAmarre.get('fechaHoraComienzoCarga').value != '' ? this.formAmarre.get('fechaHoraComienzoCarga').value : null);
      this.procesoService.setFechaHoraFinCarga(this.formAmarre.get('fechaHoraFinalizacionCarga').value != '' ? this.formAmarre.get('fechaHoraFinalizacionCarga').value : null);
      return true;
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ocurrió un error al guardar el periodo de carga');
      this.guardando = false;
      return false;
    }
  }

  public guardarExterno() {
    const datosForm = this.formAmarre.getRawValue();
    return this.moduloDeCargaService.guardarPeriodoDeCargaNuevo(datosForm, this.ModuloDeCargaId).pipe(take(1)).toPromise();
  }

  public async enviarMailInicio() {
    if (!this.validarDatosEmail()) {
      return;
    }

    const guardoOk = await this.guardar('¿Desea guardar el periodo de carga y enviar el email de inicio?');
    if (!guardoOk) {
      return;
    }

    let mail: Mail;
    try {
      mail = await this.moduloDeCargaService.obtenerDatosMailInicioCarga(this.ModuloDeCargaId).pipe(take(1)).toPromise();
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ha ocurrido un error al obtener los datos del email');
      return;
    }

    const confirm = await this.envioDialogService.confirm("Enviar Email Inicio", 'Cuerpo del Mail:', mail.titulo, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
    if (!confirm) {
      return;
    }
    try {
      await this.moduloDeCargaService.enviarMail(mail).pipe(take(1)).toPromise();
      this.confirmationDialogService.exito('El email fue enviado con éxito', 'Email enviado')
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ocurrió un error al enviar el email');
    }
  }

  private validarDatosEmail() {
    const getPropVal = (prop: string) => this.formAmarre.get(prop).value;
    const fechaVal = (prop: string) => this.formatearFecha(getPropVal(prop));

    const valores: { titulo: string, valor: string }[] = [
      { titulo: 'Llegó a rada SL', valor: fechaVal('fechaHoraRada') },
      { titulo: 'Práctico a bordo', valor: fechaVal('fechaHoraPracticoABordo') },
      { titulo: 'Salió de rada', valor: fechaVal('fechaHoraSalioDeRada') },
      { titulo: 'Amarró', valor: fechaVal('fechaHoraAmarro') },
      { titulo: 'Viento amarre', valor: getPropVal('vientoAmarro') },
      { titulo: 'Dirección viento amarre', valor: getPropVal('direccionAmarro') },
      { titulo: 'Habilitó', valor: fechaVal('fechaHoraHabilitacion') },
    ];

    if (this.esLiquido) {
      valores.push({ titulo: 'Conectó', valor: fechaVal('fechaHoraConexionMangueras') });
    }

    valores.push({ titulo: 'Comenzó carga', valor: fechaVal('fechaHoraComienzoCarga') });

    const valErr = valores.find(v => !v.valor);
    if (valErr) {
      this.confirmationDialogService.error(`Falta completar el campo "${valErr.titulo}" para enviar el email`);
      return false;
    }

    return true;
  }

  private formatearFecha(dateStr: string) {
    const date = new Date(dateStr);
    if (!dateStr || isNaN(date.getTime())) {
      return '';
    }
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') + 'hs';
  }

  public async validarFechas() {
    const valores = this.formAmarre.getRawValue();
    if (valores.fechaHoraDesamarro) {
      const amarro = new Date(valores.fechaHoraAmarro);
      const desamarro = new Date(valores.fechaHoraDesamarro);
      if (!valores.fechaHoraAmarro || amarro.getTime() > desamarro.getTime()) {
        this.confirmationDialogService.alertar('La fecha-hora de Amarre es mayor a la fecha-hora del Desamarre.')
        return false;
      }
    }
    if (valores.fechaHoraFinalizacionCarga) {
      const inicioCarga = new Date(valores.fechaHoraComienzoCarga);
      const finCarga = new Date(valores.fechaHoraFinalizacionCarga);
      if (!valores.fechaHoraComienzoCarga || inicioCarga.getTime() > finCarga.getTime()) {
        this.confirmationDialogService.alertar('La fecha-hora de Comienzo de Carga es mayor a la fecha-hora de Finalización de Carga.');
        return false;
      }
    }
    if (valores.fechaHoraDesconexionMangueras) {
      const conexionMangueras = new Date(valores.fechaHoraConexionMangueras);
      const desconexionMangueras = new Date(valores.fechaHoraDesconexionMangueras);
      if (!valores.fechaHoraConexionMangueras || conexionMangueras.getTime() > desconexionMangueras.getTime()) {
        this.confirmationDialogService.alertar('La fecha-hora de Conexión de Mangueras es mayor a la fecha-hora de Desconexión de Mangueras.');
        return false;
      }
    }

    // Validaciones de inicio y fin para sólidos que se encontraban en los componentes anteriores: inicio-carga.component.ts y finalizacion-carga.component.ts
    if (!this.esLiquido) {
      const validacionSolidos = await this.validacionesPeriodoSolidos();
      if (!validacionSolidos) {
        return false;
      }
    }

    return true;
  }

  private async validacionesPeriodoSolidos() {

    var fechaInicioCargaStr = this.formAmarre.get('fechaHoraComienzoCarga').value;
    var fechaFinCargaStr = this.formAmarre.get('fechaHoraFinalizacionCarga').value;

    if (!fechaInicioCargaStr && fechaFinCargaStr) {
      this.confirmationDialogService.alertar('No se puede establecer la fecha de fin de carga sin antes establecer el inicio');
    }

    const fechaInicioCarga = new Date(fechaInicioCargaStr);

    if (!fechaInicioCarga) {
      return true;
    }

    // Si no hay cambios no hay nada que verificar
    if (this.formAmarre.get('fechaHoraComienzoCarga').pristine && this.formAmarre.get('fechaHoraFinalizacionCarga').pristine) {
      return true;
    }

    try {
      const [balanzaManual, planillaTurnos] = await Promise.all([
        this.balanzasManualService.listarBalanzaManual(this.ModuloDeCargaId).pipe(take(1)).toPromise(),
        this.moduloDeCargaService.obtenerPlanillaTurnos(this.ModuloDeCargaId).pipe(take(1)).toPromise()
      ]);

      let fechaInicioCorteBajaCarga: Date = null;
      let fechaFinCorteBajaCarga: Date = null;
      let fechaInicioCargaNormal: Date = null;
      let fechaFinCargaNormal: Date = null;
      let fechaPrimeraCarga: Date = null;
      let fechaUltimaCarga: Date = null;

      if (balanzaManual != null) {
        const fechaInicioCorteBajaCargaStr = this.inicioFinalizacionCargaService.obtenerFechaCorteBajaCarga(balanzaManual, false);
        const fechaFinCorteBajaCargaStr = this.inicioFinalizacionCargaService.obtenerFechaCorteBajaCarga(balanzaManual, true);
        fechaInicioCorteBajaCarga = fechaInicioCorteBajaCargaStr ? new Date(fechaInicioCorteBajaCargaStr) : null;
        fechaFinCorteBajaCarga = fechaFinCorteBajaCargaStr ? new Date(fechaFinCorteBajaCargaStr) : null;
      }

      if (planillaTurnos != null) {
        const fechaPrimeraCargaStr = this.inicioFinalizacionCargaService.obtenerFechaPrimeraCarga(planillaTurnos);
        const fechaUltimaCargaStr = this.inicioFinalizacionCargaService.obtenerFechaUltimaCarga(planillaTurnos);
        fechaPrimeraCarga = fechaPrimeraCargaStr ? new Date(fechaPrimeraCargaStr) : null;
        fechaUltimaCarga = fechaUltimaCargaStr ? new Date(fechaUltimaCargaStr) : null;
        const fechaInicioCargaNormalStr = this.inicioFinalizacionCargaService.obtenerFechaCargaNormal(planillaTurnos, false);
        const fechaFinCargaNormalStr = this.inicioFinalizacionCargaService.obtenerFechaCargaNormal(planillaTurnos, true);
        fechaInicioCargaNormal = fechaInicioCargaNormalStr ? new Date(fechaInicioCargaNormalStr) : null;
        fechaFinCargaNormal = fechaFinCargaNormalStr ? new Date(fechaFinCargaNormalStr) : null;
      }

      if (
        this.verificarFechas(fechaInicioCarga, fechaInicioCargaNormal, 'La fecha de inicio de carga es mayor a las fechas de los turnos registrados.') ||
        this.verificarFechas(fechaInicioCarga, fechaInicioCorteBajaCarga, 'La fecha de inicio de carga es mayor a las fechas de corte y baja carga registrados.') ||
        this.verificarFechas(fechaInicioCarga, fechaPrimeraCarga, 'La fecha de inicio de carga es mayor a las fechas de carga registradas en la planilla de turnos.')
      ) {
        return false;
      }

      const fechaFinalizacionCarga = fechaFinCargaStr ? new Date(fechaFinCargaStr) : null;
      // Si no hay cambios en el fin, o no hay fin, entonces no hace falta verificar
      if (this.formAmarre.get('fechaHoraFinalizacionCarga').pristine || !fechaFinalizacionCarga) {
        return true;
      }

      if (
        this.verificarFechas(fechaFinCargaNormal, fechaFinalizacionCarga, 'La fecha de finalización de carga es menor a las fechas de los turnos registrados.') ||
        this.verificarFechas(fechaFinCorteBajaCarga, fechaFinalizacionCarga, 'La fecha de finalización de carga es menor a las fechas de corte y baja carga registrados.') ||
        this.verificarFechas(fechaUltimaCarga, fechaFinalizacionCarga, 'La fecha de finalización de carga es menor a las fechas de cargas registradas en la planilla de turnos.')
      ) {
        return false;
      }

      return true;

    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ocurrió un error al verificar el periodo de carga');
      return false;
    }
  }

  private verificarFechas(fecha1: Date | null, fecha2: Date, mensaje: string): boolean {
    if (fecha2 && fecha1 > fecha2) {
      this.confirmationDialogService.alertar(mensaje);
      return true;
    } else {
      return false;
    }
  };

  public obtenerFechaInicioCarga(): Date {
    const val = this.formAmarre.get('fechaHoraComienzoCarga').value;
    return val ? new Date(val) : null;
  }
  public obtenerHoraInicioCarga(): string {
    const val = this.formAmarre.get('fechaHoraComienzoCarga').value as string;
    if (!val) {
      return null;
    }
    return val.split('T')[1].slice(0, 5);
  }
  public obtenerFechaFinCarga(): Date {
    const val = this.formAmarre.get('fechaHoraFinalizacionCarga').value;
    return val ? new Date(val) : null;
  }
  public obtenerHoraFinCarga(): string {
    const val = this.formAmarre.get('fechaHoraFinalizacionCarga').value;
    if (!val) {
      return null;
    }
    return val.split('T')[1].slice(0, 5);
  }
}
