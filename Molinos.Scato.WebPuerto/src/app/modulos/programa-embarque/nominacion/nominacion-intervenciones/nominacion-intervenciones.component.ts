import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Destino } from '@ScatoModels/destino';
import { Exportador } from '@ScatoModels/exportador';
import { CompaniaDeFumigacion } from '@ScatoModels/programa-embarque/compania-de-fumigacion';
import { NominacionDetalleIntervencion, Senasa } from '@ScatoModels/programa-embarque/nominacion-detalle-intervencion';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionValida } from '@ScatoModels/programa-embarque/nominacion-valida';
import { TipoDeFumigacion } from '@ScatoModels/programa-embarque/tipo-de-fumigacion';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { AltaBajaMantenimientoComponent } from 'app/shared/componentes/alta-baja-mantenimiento/alta-baja-mantenimiento.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltaBajaTipo } from '@ScatoEnums/alta-baja-tipo';
import { NominacionDatoTecnicoRegistroService } from '../nominacion-dato-tecnico/nominacion-dato-tecnico.services';
import { element } from 'protractor';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-nominacion-intervenciones',
  templateUrl: './nominacion-intervenciones.component.html',
  styleUrls: ['./nominacion-intervenciones.component.css']
})
export class NominacionIntervencionesComponent implements OnInit, OnDestroy   {

  private _nominacionParametros: NominacionParametros = null;
  private destroy$ = new Subject();
  
  formIntervenciones: FormGroup;
  listaAcuentaDe: ListaACuentaDe[] = [];
  consumos: string[] = ["", "Animal", "Humano"];
  //Vars Senasa

  destinos: Destino[] = [];
  exportadores: Exportador[] = [];
  companiasDeFumigacion: CompaniaDeFumigacion[] = [];
  tiposDeFumigacion: TipoDeFumigacion[] = [];
  cargandoDatoIntervencion: boolean = false;
  public mensajeIntervencion = '';
  public nominacionId: number = 0;

  guardando: boolean = false;
  public tipoAltaBaja: number = 0;
  @ViewChild('modalABM') modalABM: TemplateRef<any>;
  @ViewChild('AltaBaja') altaBaja: AltaBajaMantenimientoComponent;

  constructor(private nominacionService: NominacionService,
    private planoDeCargaServices: PlanoDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private programaEmbarqueService: ProgramaEmbarqueService,
    private fb: FormBuilder) {

    this.formIntervenciones = this.cargarFormulario();
    this.inicializarCargadores();
    this.inicializarCompaniasDeFumigacion();
    this.inicializarTipoDeFumigacion();
    this.inicializarDestinos();
    this.cargarListas();
    this.asignarNominacionParametros();
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();  
  }
  cargarListas() {
    this.listaAcuentaDe.push(new ListaACuentaDe(''));
    this.listaAcuentaDe.push(new ListaACuentaDe('MOA'));
    this.listaAcuentaDe.push(new ListaACuentaDe('Tercero'));
  }
  cargarFormulario(nominacionDetalleIntervencion: NominacionDetalleIntervencion = null): FormGroup {
    console.log('nominacionDetalleIntervencion-->>', nominacionDetalleIntervencion);
    if (nominacionDetalleIntervencion == null) {
      return this.fb.group({
        id: 0,
        precintado: [],
        precintadoACuentaDe: [],
        draftSurvey: [],
        surveyACuentaDe: [''],
        permisoDeEmbarque: [],
        estibadorYTrimado: [],
        fumigacion: [''],
        companiaDeFumigacion: [''],
        companiaACuentaDe: [''],
        tipoDeFumigacion: [''],
        observaciones: [''],
        senasa: this.fb.array([])
      })
    } else {
      return this.fb.group({
        id: nominacionDetalleIntervencion.id,
        precintado: nominacionDetalleIntervencion.precintado,
        precintadoACuentaDe: nominacionDetalleIntervencion.precintadoACuentaDe,
        draftSurvey: nominacionDetalleIntervencion.draftSurvey,
        surveyACuentaDe: nominacionDetalleIntervencion.surveyACuentaDe,
        permisoDeEmbarque: nominacionDetalleIntervencion.permisoDeEmbarque,
        estibadorYTrimado: nominacionDetalleIntervencion.estibadorYTrimado,
        fumigacion: nominacionDetalleIntervencion.fumigacion,
        companiaDeFumigacion: nominacionDetalleIntervencion.companiaDeFumigacion == null ? '' : nominacionDetalleIntervencion.companiaDeFumigacion,
        companiaACuentaDe: nominacionDetalleIntervencion.companiaACuentaDe,
        tipoDeFumigacion: nominacionDetalleIntervencion.tipoDeFumigacion == null ? '' : nominacionDetalleIntervencion.tipoDeFumigacion,
        observaciones: nominacionDetalleIntervencion.observaciones,
        senasa: this.fb.array([])
      })
    }
  }

  cargarSenasa(senasa: Senasa[]) {
    senasa.forEach((element: Senasa) => {
      (this.formIntervenciones["controls"]["senasa"] as FormArray).push(this.initSenasa(element));
    })
  }

  agregarExportador() {
    let senasa = this.formIntervenciones.get("senasa") as FormArray;
    senasa.push(this.initSenasa());
  }

  inicializarCargadores() {
    this.planoDeCargaServices.obtenerExportadores().subscribe((res: Exportador[]) => {
      this.exportadores = res;
    });
  }

  inicializarCompaniasDeFumigacion() {
    this.programaEmbarqueService.ListarCompaniaDeFumigacion().subscribe((res: CompaniaDeFumigacion[]) => {
      this.companiasDeFumigacion = res;
    });
  }
  
  inicializarTipoDeFumigacion() {
    this.programaEmbarqueService.ListarTipoDeFumigacion().subscribe((res: TipoDeFumigacion[]) => {
      this.tiposDeFumigacion = res;
    });
  }

  inicializarDestinos(){
    this.planoDeCargaServices.obtenerDestinos().subscribe((res: Destino[]) => {
      this.destinos = res;
    })
  }
  public trackByFn(index: any, item: any) {
    return index;
  }
  onAltaBajaMantenimiento(opcion) {
    this.tipoAltaBaja = opcion;
    return this.modalService.open(this.modalABM);
  }

  initSenasa(senasa: Senasa = null) {
    if (senasa != null) {
      return this.fb.group({
        id: senasa.id,
        exportador: senasa.exportador,
        tieneSenasa: senasa.tieneSenasa,
        consumo: senasa.consumo,
        aCuentaDe: senasa.aCuentaDe,
        destino: senasa.destino,
        IP: senasa.ip,
        GMO: senasa.gmo,
        FITO: senasa.fito,
        muestraOficial: senasa.muestraOficial,
        certificadoInocuidad: senasa.certificadoInocuidad,
        certificadoVeterinario: senasa.certificadoVeterinario,
        observaciones: senasa.observaciones
      })
    } else {
      return this.fb.group({
        id: 0,
        exportador: ['', Validators.required],
        tieneSenasa: [false],
        consumo: [''],
        aCuentaDe: [''],
        destino: [''],
        IP: [false],
        GMO: [false],
        FITO: [false],
        muestraOficial: [false],
        certificadoInocuidad: [false],
        certificadoVeterinario: [false],
        observaciones: ['',Validators.required]
      })
    }
  }

  eliminarSenasa(i: number) {
    (this.formIntervenciones.controls["senasa"] as FormArray).removeAt(i);
  }

  compareExportador(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareTipoFumigacion(c1: TipoDeFumigacion, c2: TipoDeFumigacion) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareFumigacion(c1: CompaniaDeFumigacion, c2: CompaniaDeFumigacion) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareDestino(c1: Destino, c2: Destino) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  set nominacionParametros(value: NominacionParametros) {
    this._nominacionParametros = value;
  }

  get formIntervencion(): NominacionDetalleIntervencion {
    return this.formIntervenciones.value;
  }

  get formSenasa(): Senasa[] {
    return this.formIntervenciones["controls"]["senasa"].value;
  }

  private asignarNominacionParametros() {
    this.nominacionService.NominacionParametros.subscribe(parametro => {
      if (parametro != null) {
        const nominacionParametos: NominacionParametros = {
          nominacion_Id: parametro.nominacion_Id,
          actualizarDatoTecnico: parametro.actualizarDatoTecnico,
          actualizarRecibos: parametro.actualizarRecibos,
          actualizarIntervenciones: parametro.actualizarIntervenciones,
          nominacion: parametro.nominacion
        };
        this.nominacionParametros = nominacionParametos;
        this.nominacionId = this.nominacionParametros.nominacion_Id;
        //Si tiene nominación ID cargo los datos de la base
        if (this.nominacionParametros.nominacion_Id > 0) {
          this.formIntervenciones = this.cargarFormulario(this._nominacionParametros.nominacion.nominacionDetalleIntervencion);
          if (this.nominacionParametros.nominacion.nominacionDetalleIntervencion != null)
            this.cargarSenasa(this.nominacionParametros.nominacion.nominacionDetalleIntervencion.senasa);
        }
      }
    });
  }

  public crearObjectoIntervencion(): NominacionDetalleIntervencion{
    let nominacionIntervencion: NominacionDetalleIntervencion = null;
    const intervencion = this.formIntervenciones.value;
    if (intervencion!=null)
    nominacionIntervencion = intervencion;
    return nominacionIntervencion;
  }

  onCancelarIntervencion(){
    this.cargarIntervencion();
  }

  private cargarIntervencion(){
    this.cargandoDatoIntervencion = true;
    this.mensajeIntervencion = Mensajes.cargando;
    this.nominacionService.obtenerNominacion(this.nominacionParametros.nominacion_Id).subscribe(data =>{
      this.formIntervenciones = this.cargarFormulario(data.nominacionDetalleIntervencion);
      this.cargarSenasa(data.nominacionDetalleIntervencion.senasa);
      this.cargandoDatoIntervencion = false;
    });
  }
  public validacionIntervencion(): boolean{
    let bValidacion: boolean = true;
    this.formSenasa.forEach(element => {
      if(element.exportador == null || element.exportador.id == undefined){
        bValidacion = false;
        this.confirmationDialogService.confirm('Registro Nominación - Intervención', 'Deberás completar el campo exportador en senasa para guardar los cambios.', 'Aceptar', '', null, null, Tipoalerta.Warning);
        return;
      }
    });
    return bValidacion;
  }

  onGuardarIntervencion() {
    if (this.validacionIntervencion()){
      this.cargandoDatoIntervencion = true;
      this.mensajeIntervencion = Mensajes.grabando;
      this.guardando = true;
      this.programaEmbarqueService.registrarNominacionDetalleIntervencion(this.formIntervenciones.value, this._nominacionParametros.nominacion_Id).subscribe((res: any) => {
        this.guardando = false;
        this.confirmationDialogService.confirm('Registro Nominación - Intervención', 'Intervención guardadas correctamente.', 'Aceptar', '', null, null, Tipoalerta.Success);
        this.cargandoDatoIntervencion = false;
      }, ((e: any) => {
        this.guardando = false;
        this.cargandoDatoIntervencion = false;
      }));
    }
  }

  onActualizarTipoLista(tipoLista: number) {
    this.cargandoDatoIntervencion = true;
    this.mensajeIntervencion = Mensajes.listados;
    switch (tipoLista) {
      case AltaBajaTipo.TipoDeFumigacion :
        this.programaEmbarqueService.ListarTipoDeFumigacion().subscribe((res: TipoDeFumigacion[]) => {
          this.tiposDeFumigacion = res;
          this.cargandoDatoIntervencion = false;
        });
        break;
      case AltaBajaTipo.CompaniaDeFumigacion :
        this.programaEmbarqueService.ListarCompaniaDeFumigacion().subscribe((res: CompaniaDeFumigacion[]) => {
          this.companiasDeFumigacion = res;
          this.cargandoDatoIntervencion = false;
        });
        break;
    }

  }

}
export class ListaACuentaDe {
  nombre: string;
  constructor(nombre: string) {
    this.nombre = nombre;
  }
}

enum Mensajes{
  cargando = "Cargando información de intervenciones. Por favor, espere...",
  grabando = "Guardando información de intervenciones. Por favor, espere...",
  listados = "Cargando listados de intervenciones. Por favor, espere...",
}
