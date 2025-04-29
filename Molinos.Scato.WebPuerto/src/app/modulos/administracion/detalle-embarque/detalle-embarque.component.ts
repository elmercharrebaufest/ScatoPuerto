import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministracionEmbarque, DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';
import { Exportador } from '@ScatoModels/exportador';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { CombosConsultaEmbarques } from '../consulta-embarques/consulta-embarques.component';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { Mail } from '@ScatoModels/mail';
import { VaporService } from '@ScatoServicios/vapor.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-detalle-embarque',
  templateUrl: './detalle-embarque.component.html',
  styleUrls: ['./detalle-embarque.component.css']
})
export class DetalleEmbarqueComponent implements OnInit {
  private idEmb: number = 0;
  public estados = [
    { id: 1, nombre: 'Lineup' },
    { id: 2, nombre: 'Operaciones' },
    { id: 3, nombre: 'Calidad' },
    { id: 4, nombre: 'A Facturar' },
    { id: 5, nombre: 'Facturado' }
  ];
  public mensajeValidaSeleccion: string = null;
  public admEmbarqueForm: FormGroup;
  public detalle: DetalleEmbarqueAFacturar;

  public buscarExportador: any;
  public formatoExportador: any;
  public buscarAgencia: any;
  public formatoAgencia: any;
  public listaExportadores: Exportador[] = [];
  public listaAgencias: AgenciaMaritimaPuerto[] = [];

  public estaCargando: boolean = false;
  public estaEnviando: boolean = false;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private administracionService: AdministracionService,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    public session: SessionService,
    private envioDialogService: EnvioMailDialogService,
    private vaporService: VaporService,
    private _modalService: NgbModal,
  ) {
    this.idEmb = Number(this.route.snapshot.paramMap.get('idEmb'));
    this.user = this.session.getUser();
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.listarCombos();
    this.configListas();
  }

  public onVolver() {
    this.router.navigate(['administracion/consulta-embarques']);
  }

  private listarCombos(): void {
    this.administracionService.listarCombos().subscribe((data: CombosConsultaEmbarques) => {
      this.listaExportadores = data.exportadores;
      this.listaAgencias = data.agencias;
      this.obtenerDetalleEmbarque();
    }, (error: any) => {
      console.error(error);
    });
  }

  public configListas() {
    this.formatoExportador = (exp: Exportador) => exp.nombre;
    this.buscarExportador = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaExportadores.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

    this.formatoAgencia = (agencia: AgenciaMaritimaPuerto) => agencia.nombre;
    this.buscarAgencia = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaAgencias.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  }

  private inicializarForm() {
    this.admEmbarqueForm = this.formBuilder.group({
      id: [0],
      estado: this.formBuilder.group({
        descripcion: ['']
      }),
      netoTonnage: [, [Validators.min(1), Validators.max(900000)]],
      amarroMuelleProp: [null],
      desamarroMuelleProp: [null],
      muelleProp: [''],
      agencias: this.formBuilder.array([]),
      exportadores: this.formBuilder.array([]),
    });
  }

  public trackByFn(index: any, item: any) {
    return index;
  }

  public validaSeleccionExportador($event, formulario: FormGroup, index: number) {
    this.mensajeValidaSeleccion = '';
    let formExportador: FormGroup[] = this.admEmbarqueForm.controls['exportadores']['controls'];
    const exportadorForm = formulario.controls['exportador'];
    if (typeof exportadorForm !== 'object') {
      $event.target.value = '';
      formulario['exportador'] = '';
      formExportador[index].controls.exportador.setValue('');
      this.mensajeValidaSeleccion = 'El cargador ingresado no existe.';
    }
  }

  public validaSeleccionAgencia($event, formulario: FormGroup, index: number) {
    this.mensajeValidaSeleccion = '';
    let formAgencia: FormGroup[] = this.admEmbarqueForm.controls['agencias']['controls'];
    const agenciaForm = formulario.controls['agenciaMaritimaPuerto'];
    if (typeof agenciaForm !== 'object') {
      $event.target.value = '';
      formulario['agenciaMaritimaPuerto'] = '';
      formAgencia[index].controls.agenciaMaritimaPuerto.setValue('');
      this.mensajeValidaSeleccion = 'La agencia ingresada no existe.';
    }
  }

  private inicializarAgencia(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      agenciaMaritimaPuerto: [null]
    });
  }

  private inicializarExportador(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      exportador: [null]
    });
  }

  private obtenerDetalleEmbarque(): void {
    this.estaCargando = true;
    this.administracionService.obtenerDetalleEmbarque(Number(this.idEmb)).subscribe((data: DetalleEmbarqueAFacturar) => {
      this.detalle = data;
      if (this.detalle.administracionEmbarque != null) {
        this.patchForm(this.detalle.administracionEmbarque);
      }else{
        this.admEmbarqueForm.patchValue({netoTonnage: this.detalle.trn});
      }
      this.estaCargando = false;
    }, (error: any) => {
      console.error(error);
      this.estaCargando = false;
    });
  }

  private patchForm(data: AdministracionEmbarque): void {
    this.admEmbarqueForm.patchValue({
      id: data.id,
      netoTonnage: data.netoTonnage,
      amarroMuelleProp: data.amarroMuelleProp,
      desamarroMuelleProp: data.desamarroMuelleProp,
      muelleProp: data.muelleProp
    });

    const agenciasFormArray = this.admEmbarqueForm.get('agencias') as FormArray;
    agenciasFormArray.clear();
    data.agencias?.forEach(agencia => {
      const agenciaForm = this.inicializarAgencia();
      agenciaForm.patchValue({
        id: agencia.id,
        agenciaMaritimaPuerto: agencia.agenciaMaritimaPuerto
      });
      agenciasFormArray.push(agenciaForm);
    });

    const exportadoresFormArray = this.admEmbarqueForm.get('exportadores') as FormArray;
    exportadoresFormArray.clear();
    data.exportadores?.forEach(exportador => {
      const exportadorForm = this.inicializarExportador();
      exportadorForm.patchValue({
        id: exportador.id,
        exportador: exportador.exportador
      });
      exportadoresFormArray.push(exportadorForm);
    });

  }

  getExportadores(): string {
    return this.detalle?.exportadores.map(e => e.nombre).join(', ');
  }

  getAgencias(): string {
    return this.detalle?.agencias.map(e => e.nombre).join(', ');
  }

  getDiasMuelle(): string {
    if (
      this.detalle?.amarre == null || this.detalle?.desamarre == null ||
      this.detalle?.horaAmarre == null || this.detalle?.horaDesamarre == null
    ) {
      return "0 días 0 horas";
    }

    const fechaAmarre = new Date(this.detalle.amarre);
    const [horaAmarre, minutoAmarre] = this.detalle.horaAmarre.split(':').map(Number);
    fechaAmarre.setHours(horaAmarre, minutoAmarre);

    const fechaDesamarre = new Date(this.detalle.desamarre);
    const [horaDesamarre, minutoDesamarre] = this.detalle.horaDesamarre.split(':').map(Number);
    fechaDesamarre.setHours(horaDesamarre, minutoDesamarre);

    // Calcular la diferencia en milisegundos
    const diferenciaEnMilisegundos = fechaDesamarre.getTime() - fechaAmarre.getTime();

    // Calcular días y horas totales
    const diasTotales = Math.floor(diferenciaEnMilisegundos / (1000 * 3600 * 24)); // Días completos
    const horasRestantes = Math.floor((diferenciaEnMilisegundos % (1000 * 3600 * 24)) / (1000 * 3600)); // Horas restantes

    // Obtener las horas proporcionales del muelle
    const hsMuelleProp = this.obtenerHsTotalesMuelleProp();

    // Ajustar las horas restantes restando las horas proporcionales
    let horasFinales = horasRestantes - hsMuelleProp;

    // Si las horas finales son negativas o iguales a -24, ajustar los días y horas
    let diasFinales = diasTotales;
    while (horasFinales < 0) {
      diasFinales -= 1;
      horasFinales += 24;
    }

    // Asegurarse de que los días no sean negativos
    if (diasFinales < 0) {
      diasFinales = 0;
      horasFinales = 0;
    }

    return `${diasFinales} días ${horasFinales} horas`;
  }

  getEstadoSrc(estadoId: number) {
    if (this.detalle == null) return;
    const estadoIdActual = this.estados.find(e => e.nombre.toLowerCase() === this.detalle.estado.toLowerCase()).id;
    if (estadoIdActual == estadoId) {
      return "assets/administracion/estado-actual.svg";
    }
    else if (estadoIdActual > estadoId) {
      return "assets/administracion/estado-transitado.svg";
    } else {
      return "assets/administracion/estado-a-transitar.svg";
    }
  }

  onAgregarExportador() {
    this.exportadoresFormArray.push(this.inicializarExportador());
  }

  onAgregarAgencia() {
    this.agenciasFormArray.push(this.inicializarAgencia());
  }

  get exportadoresFormArray(): FormArray {
    return this.admEmbarqueForm.get("exportadores") as FormArray
  }

  get agenciasFormArray(): FormArray {
    return this.admEmbarqueForm.get("agencias") as FormArray
  }

  onEliminarExportador(index: number) {
    const value = this.exportadoresFormArray.value;
    this.exportadoresFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );
    this.exportadoresFormArray.removeAt(value.length - 1);
  }

  onEliminarAgencia(index: number) {
    const value = this.agenciasFormArray.value;
    this.agenciasFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );
    this.agenciasFormArray.removeAt(value.length - 1);
  }

  onGuardarAdmEmbarque(facturar: boolean) {
    let hsMuelleProp = this.obtenerHsTotalesMuelleProp();
    if (hsMuelleProp < 0 || hsMuelleProp > 24) {
      this.confirmationDialogService.alertar("Atención, Las horas de uso de muelle proporcional deben estar comprendidas entre 1 y 24 horas.");
      return;
    }

    if (this.admEmbarqueForm.invalid) {
      this.confirmationDialogService.alertar("Atención, el formulario tiene errores.");
      return;
    }

    // Si es registro de admEmbarque por primera vez ->
    if (this.admEmbarqueForm.get('estado')?.value == null || this.admEmbarqueForm.get('estado')?.value.descripcion == '') {
      this.admEmbarqueForm.get('estado').patchValue({ descripcion: this.detalle.estado });
    }

    if (facturar) {
      const nombreBuque = this.detalle?.buque;
      this.confirmationDialogService.confirm(
        '¡Atención!',
        `¿Está seguro de marcar al embarque del buque ${nombreBuque} como FACTURADO?, ¿Confirma la operación?`,
        'Aceptar',
        'Cerrar',
        null,
        null,
        Tipoalerta.Warning
      ).then((confirmed) => {
        if (confirmed) {
          this.executeGuardarAdmEmbarque(facturar);
        }
      });
    } else {
      this.executeGuardarAdmEmbarque(facturar);
    }
  }

  private executeGuardarAdmEmbarque(facturar: boolean) {
    this.administracionService.guardarAdministracionEmbarque(Number(this.idEmb), facturar, this.admEmbarqueForm.value).subscribe(() => {
      this.obtenerDetalleEmbarque();
      this.confirmationDialogService.confirm('Atención', `Se ha guardado la información con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
    }, (err) => {
      console.log(err);
      let msjError = `Ha ocurrido un error al intentar guardar los cambios.`;
      this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
    });
  }

  tieneInfoMuelleProporcional(): boolean {
    return this.admEmbarqueForm.get('muelleProp')?.value != ''
      || this.admEmbarqueForm.get('desamarroMuelleProp')?.value != null ||
      this.admEmbarqueForm.get('amarroMuelleProp')?.value != null;
  }

  obtenerHsTotalesMuelleProp(): number {
    const amarre = this.admEmbarqueForm.get('amarroMuelleProp')?.value;
    const desamarre = this.admEmbarqueForm.get('desamarroMuelleProp')?.value;

    if (!amarre || !desamarre) {
      return 0;
    }

    const fechaAmarre = new Date(amarre);
    const fechaDesamarre = new Date(desamarre);

    const diferenciaEnMilisegundos = fechaDesamarre.getTime() - fechaAmarre.getTime();
    const horasTotales = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60)); // Convertir milisegundos a horas y redondear hacia abajo

    return horasTotales;
  }

  public tienePermisoFacturar() {
    return this.user.permisos.find(p => p === this.permisosScato.Administracion_Facturar);
  }

  public onVerTRN() {
    this.vaporService.obtenerShipParticular(this.detalle.vaporInfoId).subscribe(blob => {
      const fileName = "archivo.pdf";
      const archivoDescargado = new File([blob], fileName, { type: 'application/pdf' });
      if (archivoDescargado) {
        const url = window.URL.createObjectURL(archivoDescargado);
        const nuevaPestana = window.open(url);
        if (nuevaPestana) {
          nuevaPestana.document.title = archivoDescargado.name;
          nuevaPestana.onload = () => {
            window.URL.revokeObjectURL(url);
          };
        } else {
          console.error('No se pudo abrir la nueva pestaña. Asegúrate de que el bloqueador de ventanas emergentes no esté habilitado.');
        }
      }else{
        this.confirmationDialogService.alertar("No hay Shipping Particular asociado.");
        return;
      }
    }, error => {
      this.confirmationDialogService.alertar("Error al intentar obtener archivo.");
      console.error('Error al obtener el archivo:', error);
    });
  }

  public onOpenModalAlerta(modal) {
    console.log(this.idEmb);
    this._modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' });
  }

}
