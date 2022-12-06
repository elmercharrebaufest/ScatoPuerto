import { Component, ElementRef, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, Subject } from 'rxjs';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Alerta } from '@ScatoModels/alerta';
import { MaterialPuertoCantidad } from '@ScatoModels/material-puerto-cantidad';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { AlertService } from '@ScatoServicios/alert.service';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { TipoDeBuquePuerto } from '@ScatoModels/tipo-de-buque-puerto';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { ATAPuerto } from '@ScatoModels/ata-puerto';
import { Destino } from '@ScatoModels/destino';
import { MotivosLimpieza } from '@ScatoModels/motivo-limpieza';
import { WorkflowService } from '@ScatoServicios/workflow.service'
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Bandera } from '@ScatoModels/bandera';
import { EmbarqueInformacion } from '@ScatoModels/embarque-Informacion';
import { BuqueService } from '@ScatoServicios/buque.service';
import { Vapor } from '@ScatoModels/embarque';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { Pais } from '@ScatoModels/Buques/Pais';
@Component({
  selector: 'app-alta-embarque',
  templateUrl: './alta-embarque.component.html',
  styleUrls: ['./alta-embarque.component.css']
})

export class AltaEmbarqueComponent implements OnInit {

  // #region Variables
  mostrarSpinner: boolean = true;
  @ViewChild('modalABM') modalABM: TemplateRef<any>;
  tituloBoton: string;
  embarqueId: number;
  embarqueForm: FormGroup;
  submitted = false;
  listadoMateriales: MaterialPuerto[] = []
  tipoDeBuquePuerto: TipoDeBuquePuerto[];
  ubicacionDeBuquePuerto: UbicacionDeBuquePuerto[];
  agenciasList: AgenciaMaritimaPuerto[];
  coordinadoresList: CoordinadorPuerto[];
  ataList: ATAPuerto[];
  pantallaSeleccionada: string;
  opcionABMSeleccionada: string;
  tituloABM: string;
  nombreBuque: string;
  motivosLimpiezaList: MotivosLimpieza[];
  destinoPuerto: Destino[];
  PlanoDeCargaId: number;
  banderaBuque: Bandera[];
  private state: string;
  totalHorasLimpieza: number = 0;
  fileShipParticular: string | ArrayBuffer;
  fileNameShipParticular: string = 'Ningun archivo elegido';
  vaporesList:Vapor[]
  arrVapores:Vapor[]
  embarqueInformacion: EmbarqueInformacion[] = [];
  vaporInfo: VaporInformacion
  banderasBuque: Bandera[];
  listadoBanderaModificada: boolean = false;
  @ViewChild('horaRecalada') horaRecalada: ElementRef;
  @ViewChild('horaDesdeLimpieza') horaDesdeLimpieza: ElementRef;
  @ViewChild('horaHastaLimpieza') horaHastaLimpieza: ElementRef;
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  private id_buque: number = 0;
  private nombre_buque: string = '';
  private embarqueSeleccionado;
  private vaporSeleccionado;
  private parametrosSel;
  // #endregion

  // #region Constructor
  constructor
  (
    private formBuilder: FormBuilder,
    private embarqueService: EmbarqueService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router, private route: ActivatedRoute,
    private modalService: NgbModal,
    private alertService: AlertService,
    private planoDeCargaService: PlanoDeCargaService,
    private workflowService: WorkflowService,
    private moduloCargaService: ModuloDeCargaService,
    private buqueService: BuqueService,


  )
    {
    this.state = this.route.snapshot.params.state;
    this.embarqueId = this.route.snapshot.params.id ? this.route.snapshot.params.id : 0;
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {
    this.tituloBoton = this.embarqueId == 0 ? "FINALIZAR ALTA" : "ACTUALIZAR";
    this.cargarCombos();
    this.inicializarForm();
    this.deshabilitaMuelleCarga();
    this.cargarListados();
    // this.editarCrearBuque();

  }
  // #endregion

  // #region Metodos

  private inicializarForm() {
    this.embarqueForm = this.formBuilder.group({
      id: [0],
      nombreBuque: ['', Validators.required],
      agencia: [],
      coordinador: [],
      fechaRecalada: ['', [this.dateValidator.bind(this)]],
      obligacionCarga: ['', [this.dateValidator.bind(this)]],
      senasa: [false],
      observaciones: [],
      vicentin: [false],
      noryon: [false],
      sanBenito: [true],
      otrosMuelles: [false],
      patente: [],
      tipoBuque: [''],
      tipoDeBuque: ['', Validators.required],
      freeboard: [],
      ubicacion: [''],
      ubicacionDeBuque: [''],
      materialesPuertoCantidad: this.formBuilder.array([]),
      meridiemRecalada: [],
      horaREcalada: [],
      agencias: [],
      agenciasList: [],
      coordinadores: [],
      coordinadoresList: [],
      ata: [],
      ataList: [],
      ubicacionDeBuquePuerto: [],
      tipoDeBuquePuerto: [],
      esLiquido: [false],
      fechaDesdeLimpieza: ['', [this.dateValidator.bind(this)]],
      horaDesdeLimpieza: [],
      fechaHastaLimpieza: ['', [this.dateValidator.bind(this)]],
      horaHastaLimpieza: [],
      motivosLimpieza: [],
      motivosLimpiezaList: [],
      observacionesLimpieza: [],
      destinoBuque: [''],
      destino: [],
      destinoPuerto: [],
      porteNeto: [],
      porteBruto: [],
      eslora: [],
      manga: [],
      puntal: [],
      fechaLibrePlatica: ['', [this.dateValidator.bind(this)]],
      horaLibrePlatica: [],
      imo: [''],
      cantidadBodegasTanques: [],
      // TODO: Revisar plano-content, porque posiblemente sea como viene el valor del campo filePathShipParticular
      filePathShipParticular: [''],
      shipParticularArchivoNombre: [''],
      banderaBuque: [''],
      bandera: ['', Validators.required],
      embarqueInformacion: this.formBuilder.array([]),
    });
  }

  private deshabilitaMuelleCarga() {
    if (this.state === 'modulo-carga') {
      this.embarqueForm.get('sanBenito').disable();
      this.embarqueForm.get('noryon').disable();
      this.embarqueForm.get('vicentin').disable();
      this.embarqueForm.get('otrosMuelles').disable();
    }
  }

  private cargarListados() {
    forkJoin([
      this.embarqueService.obtenerListadoTipoDeBuquePuerto(),
      this.embarqueService.obtenerListadoUbicacionDeBuquePuerto(),
      this.planoDeCargaService.obtenerDestinos(),
      this.buqueService.obtenerVapores(),
      this.embarqueService.obtenerBanderas(),
    ]).subscribe(([res1, res2, res3, res4, res5]) => {
      this.tipoDeBuquePuerto = res1.filter(a => a.nombre == "Bulk Carrier" || a.nombre == "Oil Tanker");
      this.ubicacionDeBuquePuerto = res2.filter(u => u.orden!=1);
      this.destinoPuerto = res3;
      this.vaporesList = res4;
      this.banderasBuque = res5
      this.cargarListadoMateriales();
    }, err => { console.log(err); });
  }

  actualizarListaDeVapores(event){
    console.log('event-->>', event);
    this.buqueService.obtenerVapores().subscribe(res => {
      this.vaporesList = res;
    });
  }
  cargarEmbarqueEditar() {
    if (!this.tipoDeBuquePuerto)
      this.embarqueService.obtenerListadoTipoDeBuquePuerto().subscribe(res => { this.tipoDeBuquePuerto = res; });

    if (!this.destinoPuerto)
      this.planoDeCargaService.obtenerDestinos().subscribe(res => { this.destinoPuerto = res; });
    if (this.embarqueId != 0) {
      this.embarqueService.obtenerIdsUsuales(this.embarqueId).subscribe(res => this.parametrosSel = res);
      this.embarqueService.obtenerEmbarque(this.embarqueId).subscribe(
        res => {
          this.embarqueSeleccionado = JSON.parse(JSON.stringify(res));
          console.log('obtenerEmbarque: ', res);
          console.log('obtenerEmbarque xxxxxx: ', res);
          var filtered = this.listadoMateriales.filter(
            function (e) {
              return this.indexOf(e.id) < 0;
            },
            res.materialesPuertoCantidad.map(x => x.materialId)
          );

          if (this.embarqueSeleccionado.sanBenito &&  this.embarqueSeleccionado.fechaHoraInicioCarga != null)
            this.embarqueService.obtenerListadoUbicacionDeBuquePuerto().subscribe(res => { this.ubicacionDeBuquePuerto = res.filter(u=>u.orden!=1); });
          else
            this.embarqueService.obtenerListadoUbicacionDeBuquePuerto().subscribe(res => { this.ubicacionDeBuquePuerto = res; });



          filtered.map(x => new MaterialPuertoCantidad({
            materialId: x.id,
            descripcionCorta: x.descripcionCorta,
            cantidad: 0,
            color: x.color
          })).forEach(x => {
            res.materialesPuertoCantidad.push(x);
          });
          this.embarqueForm.patchValue(res);
          this.checkLiquidOrSolid(res.materialesPuertoCantidad.find(x => x.cantidad != 0));
          const buqueSel = this.vaporesList.find(x => x.id == res.vapor.id);
          this.embarqueForm.controls.nombreBuque.setValue(buqueSel);
          this.embarqueForm.get('nombreBuque').setValue(buqueSel);
          //this.embarqueForm.controls.nombreBuque.disable();
          this.id_buque  = buqueSel.id;
          this.nombre_buque = buqueSel.nombre;

          if (this.tipoDeBuquePuerto != undefined)
            this.embarqueForm.get('tipoDeBuque').setValue(
              this.tipoDeBuquePuerto.find(x => x.nombre == res.tipoBuque.toString()));
          else
            this.embarqueForm.get('tipoDeBuque').setValue('');

          if (res.obligacionCarga != null)
            this.embarqueForm.get('obligacionCarga').setValue(new Date(res.obligacionCarga).toISOString().slice(0, 10));
          else
            this.embarqueForm.get('obligacionCarga').setValue('');

          this.embarqueForm.get('fechaRecalada').setValue('');
          this.horaRecalada.nativeElement.value = '';
          this.embarqueForm.get('meridiemRecalada').setValue('');
          if (res.fechaRecalada != null) {
            this.embarqueForm.get('fechaRecalada').setValue(new Date(res.fechaRecalada).toISOString().slice(0, 10));
            this.horaRecalada.nativeElement.value = res.horaRecalada != null ? res.horaRecalada.length > 2 ? res.horaRecalada : '' : '';
            if (res.horaRecalada != null && res.horaRecalada.length == 2)
              this.embarqueForm.get('meridiemRecalada').setValue(res.horaRecalada);
          }

          // HORAS A LA ESPERA DE LIMPIEZA
          if (res.fechaDesdeLimpieza != null)
            this.embarqueForm.get('fechaDesdeLimpieza').setValue(new Date(res.fechaDesdeLimpieza).toISOString().slice(0, 10));
          else
            this.embarqueForm.get('fechaDesdeLimpieza').setValue('');

          this.horaDesdeLimpieza.nativeElement.value = res.horaDesdeLimpieza != null ? res.horaDesdeLimpieza : '';

          if (res.fechaHastaLimpieza != null)
            this.embarqueForm.get('fechaHastaLimpieza').setValue(new Date(res.fechaHastaLimpieza).toISOString().slice(0, 10));
          else
            this.embarqueForm.get('fechaHastaLimpieza').setValue('');

          this.horaHastaLimpieza.nativeElement.value = res.horaHastaLimpieza != null ? res.horaHastaLimpieza : '';

          // Calculo total horas limpieza
          let fechaDesdeLimpieza = this.embarqueForm.get('fechaDesdeLimpieza').value;
          let horaDesdeLimpieza = this.embarqueForm.get('horaDesdeLimpieza').value;
          let fechaHastaLimpieza = this.embarqueForm.get('fechaHastaLimpieza').value;
          let horaHastaLimpieza = this.embarqueForm.get('horaHastaLimpieza').value;
          this.totalHorasLimpieza = this.calcularHorasLimpieza(fechaDesdeLimpieza, horaDesdeLimpieza, fechaHastaLimpieza, horaHastaLimpieza);

          if (res.ubicacion != null && res.ubicacion != 0 && typeof this.ubicacionDeBuquePuerto != 'undefined')
            this.embarqueForm.get('ubicacionDeBuque').setValue(
              this.ubicacionDeBuquePuerto.find(x => x.id == res.ubicacion));
          else
            this.embarqueForm.get('ubicacionDeBuque').setValue('');

          if (res.destino && res.destino != null && res.destino?.id != null && res.destino?.id != 0 && typeof this.destinoPuerto != 'undefined')
            this.embarqueForm.get('destino').setValue(
              this.destinoPuerto.find(x => x.id == res.destino?.id));
          else
            this.embarqueForm.get('destino').setValue('');

          this.fileNameShipParticular = res.shipParticularArchivoNombre != null ? res.shipParticularArchivoNombre : 'Ningun archivo elegido';
          this.fileShipParticular = res.filePathShipParticular;
          this.embarqueService.obtenerListadoAgenciasMaritimas().subscribe(res1 => {
            res.agencias = res1.map(x => new AgenciaMaritimaPuerto(x.id, x.nombre));
          });
          if (this.embarqueForm.value['agencias'] != null) {
            this.embarqueService.obtenerListadoAgenciasMaritimas().subscribe(res1 => {
              this.embarqueForm.get('agenciasList').setValue(
                res1.filter(x => x.id == this.embarqueForm.value['agencias'].id).map(x => new AgenciaMaritimaPuerto(x.id, x.nombre)));
            });
          }

          this.embarqueService.obtenerListadoCoordinadores().subscribe(res1 => {
            res.coordinadores = res1.map(x => new CoordinadorPuerto(x.id, x.nombre));
          });
          if (this.embarqueForm.value['coordinadores'] != null) {
            this.embarqueService.obtenerListadoCoordinadores().subscribe(res1 => {
              this.embarqueForm.get('coordinadoresList').setValue(
                res1.filter(x => x.id == this.embarqueForm.value['coordinadores'].id).map(x => new CoordinadorPuerto(x.id, x.nombre)));
            });
          }

          this.embarqueService.obtenerListadoATAPuerto().subscribe(res1 => {
            res.ata = res1.map(x => new ATAPuerto(x.id, x.nombre));
          });
          if (this.embarqueForm.value['ata'] != null) {
            this.embarqueService.obtenerListadoATAPuerto().subscribe(res1 => {
              this.embarqueForm.get('ataList').setValue(
                res1.filter(x => x.id == this.embarqueForm.value['ata'].id).map(x => new ATAPuerto(x.id, x.nombre)));
            });
          }

          this.embarqueService.obtenerListadoMotivosLimpieza().subscribe(res1 => {
            res.motivosLimpiezas = res1.map(x => new MotivosLimpieza(x.id, x.nombre));
          });
          if (this.embarqueForm.value['motivosLimpieza'] != null) {
            this.embarqueService.obtenerListadoMotivosLimpieza().subscribe(res1 => {
              this.embarqueForm.get('motivosLimpiezaList').setValue(
                res1.filter(x => x.id == this.embarqueForm.value['motivosLimpieza'].id).map(x => new MotivosLimpieza(x.id, x.nombre)));
            });
          }

          // SHIP PARTICULARS
          if (res.embarqueInformacion.length > 0) {
            const imo = res.embarqueInformacion[0].imo;
            const bandera = res.embarqueInformacion[0].bandera;
            const informacion_id = res.embarqueInformacion[0].id;
            this.embarqueForm.get('imo').setValue(imo);
            this.embarqueForm.get('bandera').setValue(this.banderaBuque.find(x => x.id == bandera.id));
            this.embarqueInformacionFormArray.push(this.formBuilder.group({
              imo: this.embarqueForm.value.imo,
              bandera: this.embarqueForm.value.bandera,
              id: informacion_id,
              embarque_Id: this.embarqueForm.value.id,
              fechaRegistro: Date.now(),
            }));
          }
          this.mostrarSpinner = false;
          //this.embarqueForm.controls.tipoDeBuque.disable();

        },
        errmess => {
          this.confirmationDialogService.confirm('¡Error!', 'Error al cargar el embarque: ' + <any>errmess.error, 'Cerrar', '', null, null, Tipoalerta.Error);
          this.mostrarSpinner = false;
        }
      );

    } else {
      this.mostrarSpinner = false;
    }
  }

  get embarqueInformacionFormArray(): FormArray {
    return this.embarqueForm.get("embarqueInformacion") as FormArray
  }

  calcularHorasLimpieza(fechaDesde, horaDesde, fechaHasta, horaHasta): number {
    let horas = 0;
    if (fechaDesde != '' && horaDesde != '' && fechaHasta != '' && horaHasta != '') {
      let lfechahoraDesde = fechaDesde + ' ' + horaDesde;
      let lfechahoraHasta = fechaHasta + ' ' + horaHasta;
      let fechahoraDesde = new Date(lfechahoraDesde);
      let fechahoraHasta = new Date(lfechahoraHasta);
      horas = (fechahoraHasta.getTime() - fechahoraDesde.getTime()) / 3600000;
    }
    return horas;
  }

  get materialesPuertoCantidadFormArray(): FormArray {
    return this.embarqueForm.get("materialesPuertoCantidad") as FormArray
  }

  get f() { return this.embarqueForm.controls; }

  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    var dateToValidate = new Date(control.value);
    if (this.isInvalidDate(dateToValidate)) {
      return { 'dateError': true };
    }
    return null;

  }

  isInvalidDate(date: Date): boolean {
    return date.getFullYear() < 2000 || date.getFullYear() > 2100;
  }

  //#region Finalizar Alta

  private validaAltaEmbarque(): Subject<boolean>{
    let subjectModificarAlta = new Subject<boolean>();
    let moduloDeCargaPlanillaDeTurnos = null;
    let esValido = true;
    this.moduloCargaService.obtenerModuloDeCarga(this.parametrosSel.moduloDeCargaId).subscribe(res => {
      moduloDeCargaPlanillaDeTurnos = res.moduloDeCargaPlanillaDeTurnos;
    }, error => {}
     , () => {
        if (moduloDeCargaPlanillaDeTurnos != null && moduloDeCargaPlanillaDeTurnos != undefined){
          if (moduloDeCargaPlanillaDeTurnos.length == 0)
            esValido = true;
          else
            esValido = false;
        }
        subjectModificarAlta.next(esValido);
    });
    return subjectModificarAlta;
  }

  private modificarAltaEmbarque(){

    if (this.embarqueForm.controls['nombreBuque'].invalid || this.embarqueForm.controls['tipoDeBuque'].invalid || this.embarqueForm.controls['bandera'].invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      if (this.invalidRequiredMaterial()) {
        this.embarqueForm.controls['materialesPuertoCantidad'].setErrors({ 'error': true });
      }
      return
    }
    else {
      if (this.invalidRequiredMaterial()) {
        this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
        this.embarqueForm.controls['materialesPuertoCantidad'].setErrors({ 'error': true });
        return;
      }
    }

    this.mostrarSpinner = true;
    this.embarqueForm.get('fechaRecalada').setValue(
      this.embarqueForm.value.fechaRecalada + ' ' + this.horaRecalada.nativeElement.value);

    this.embarqueForm.get('horaREcalada').setValue(
      this.horaRecalada.nativeElement.value ?
        this.horaRecalada.nativeElement.value :
        this.embarqueForm.value.meridiemRecalada);

    this.embarqueForm.get('fechaDesdeLimpieza').setValue(
      this.embarqueForm.value.fechaDesdeLimpieza + ' ' + this.horaDesdeLimpieza.nativeElement.value);

    this.embarqueForm.get('horaDesdeLimpieza').setValue(
      this.horaDesdeLimpieza.nativeElement.value ? this.horaDesdeLimpieza.nativeElement.value : '');

    this.embarqueForm.get('fechaHastaLimpieza').setValue(
      this.embarqueForm.value.fechaHastaLimpieza + ' ' + this.horaHastaLimpieza.nativeElement.value);

    this.embarqueForm.get('horaHastaLimpieza').setValue(
      this.horaHastaLimpieza.nativeElement.value ? this.horaHastaLimpieza.nativeElement.value : '');

    this.embarqueForm.get('motivosLimpieza').setValue(
      this.embarqueForm.value.motivosLimpiezaList != null && this.embarqueForm.value.motivosLimpiezaList.length > 0 ?
        this.motivosLimpiezaList.find(x => x.id == this.embarqueForm.value.motivosLimpiezaList[0].id) : '');

    this.embarqueForm.get('agencias').setValue(
      this.embarqueForm.value.agenciasList != null && this.embarqueForm.value.agenciasList.length > 0 ?
        this.agenciasList.find(x => x.id == this.embarqueForm.value.agenciasList[0].id) : '');

    this.embarqueForm.get('coordinadores').setValue(
      this.embarqueForm.value.coordinadoresList != null && this.embarqueForm.value.coordinadoresList.length > 0 ?
        this.coordinadoresList.find(x => x.id == this.embarqueForm.value.coordinadoresList[0].id) : '');

    this.embarqueForm.get('ata').setValue(
      this.embarqueForm.value.ataList != null && this.embarqueForm.value.ataList.length > 0 ?
        this.ataList.find(x => x.id == this.embarqueForm.value.ataList[0].id) : '');

    this.embarqueForm.get('esLiquido').setValue(this.listadoMateriales.find(x => x.id == this.materialesPuertoCantidadFormArray.controls.find(x => x.value.cantidad > 0).value.materialId).esLiquido);

    this.embarqueForm.get('filePathShipParticular').setValue(this.fileShipParticular);
    this.embarqueForm.get('shipParticularArchivoNombre').setValue(this.fileNameShipParticular);

    if (this.embarqueInformacionFormArray.length == 0) {
      this.embarqueInformacionFormArray.push(this.formBuilder.group({
        imo: this.embarqueForm.value.imo,
        bandera: this.embarqueForm.value.bandera,
        embarque_id: this.embarqueForm.value.id,
        fechaRegistro: Date.now(),
      }));
    } else {
      this.embarqueInformacionFormArray.controls[0].get('imo').setValue(this.embarqueForm.value.imo);
      this.embarqueInformacionFormArray.controls[0].get('bandera').setValue(this.embarqueForm.value.bandera);
      this.embarqueInformacionFormArray.controls[0].get('fechaRegistro').setValue(Date.now());
    }
    let altaEmbarque = this.embarqueForm.value
    altaEmbarque.nombreBuque = this.nombre_buque;
    const tipoBuqueSel = this.tipoDeBuquePuerto.filter(x => x.nombre == altaEmbarque.tipoBuque);
    if (tipoBuqueSel.length > 0)
      altaEmbarque.tipoDeBuque= tipoBuqueSel[0];

    console.log('altaEmbarque', altaEmbarque)
    console.log('embarqueSeleccionado', this.embarqueSeleccionado)

    this.embarqueService.modificarEmbarque(altaEmbarque)
      .subscribe((res: any) => {
        this.mostrarSpinner = false;
        this.openConfirmationDialog('¡Felicitaciones!',
          'Ha modificado con éxito el buque',
          'Ver line up',
          'Seguir modificando');
      },
        errmess => {
          this.alertService.mostrar(new Alerta(<any>errmess.error, Tipoalerta.Error));
          this.mostrarSpinner = false;
        });
  }

  private guardarAltaEmbarque(){
      if (this.embarqueForm.invalid) {
        this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
        if (this.invalidRequiredMaterial()) {
          this.embarqueForm.controls['materialesPuertoCantidad'].setErrors({ 'error': true });
        }
        return;
      }
      else {
        if (this.invalidRequiredMaterial()) {
          this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
          this.embarqueForm.controls['materialesPuertoCantidad'].setErrors({ 'error': true });
          return;
        }
      }
      this.mostrarSpinner = true;
      this.embarqueForm.get('fechaRecalada').setValue(
        this.embarqueForm.value.fechaRecalada + ' ' + this.horaRecalada.nativeElement.value);

      this.embarqueForm.get('horaREcalada').setValue(
        this.horaRecalada.nativeElement.value ?
          this.horaRecalada.nativeElement.value :
          this.embarqueForm.value.meridiemRecalada);

      this.embarqueForm.get('fechaDesdeLimpieza').setValue(
        this.embarqueForm.value.fechaDesdeLimpieza + ' ' + this.horaDesdeLimpieza.nativeElement.value);

      this.embarqueForm.get('horaDesdeLimpieza').setValue(
        this.horaDesdeLimpieza.nativeElement.value ?
          this.horaDesdeLimpieza.nativeElement.value : '');

      this.embarqueForm.get('fechaHastaLimpieza').setValue(
        this.embarqueForm.value.fechaHastaLimpieza + ' ' + this.horaHastaLimpieza.nativeElement.value);

      this.embarqueForm.get('horaHastaLimpieza').setValue(
        this.horaHastaLimpieza.nativeElement.value ?
          this.horaHastaLimpieza.nativeElement.value : '');

      this.embarqueForm.get('filePathShipParticular').setValue(this.fileShipParticular);
      this.embarqueForm.get('shipParticularArchivoNombre').setValue(this.fileNameShipParticular);

      this.embarqueForm.get('agencias').setValue(
        this.embarqueForm.value.agenciasList != null && this.embarqueForm.value.agenciasList.length > 0 ?
          this.agenciasList.find(x => x.id == this.embarqueForm.value.agenciasList[0].id) : '');

      this.embarqueForm.get('motivosLimpieza').setValue(
        this.embarqueForm.value.motivosLimpiezaList != null && this.embarqueForm.value.motivosLimpiezaList.length > 0 ?
          this.motivosLimpiezaList.find(x => x.id == this.embarqueForm.value.motivosLimpiezaList[0].id) : '');

      this.embarqueForm.get('coordinadores').setValue(
        this.embarqueForm.value.coordinadoresList != null && this.embarqueForm.value.coordinadoresList.length > 0 ?
          this.coordinadoresList.find(x => x.id == this.embarqueForm.value.coordinadoresList[0].id) : '');

      this.embarqueForm.get('ata').setValue(
        this.embarqueForm.value.ataList != null && this.embarqueForm.value.ataList.length > 0 ?
          this.ataList.find(x => x.id == this.embarqueForm.value.ataList[0].id) : '');

      this.embarqueForm.get('horaDesdeLimpieza').setValue(this.horaDesdeLimpieza.nativeElement.value ? this.horaDesdeLimpieza.nativeElement.value : '');

      if (this.embarqueInformacionFormArray.length == 0) {
        this.embarqueInformacionFormArray.push(this.formBuilder.group({
          imo: this.embarqueForm.value.imo,
          bandera: this.embarqueForm.value.bandera,
          embarque_id: this.embarqueForm.value.id,
          fechaRegistro: Date.now(),
        }));
      } else {
        this.embarqueInformacionFormArray.controls[0].get('imo').setValue(this.embarqueForm.value.imo);
        this.embarqueInformacionFormArray.controls[0].get('bandera').setValue(this.embarqueForm.value.bandera);
        this.embarqueInformacionFormArray.controls[0].get('fechaRegistro').setValue(Date.now());
      }

      this.embarqueForm.value.esLiquido = this.listadoMateriales.find(x => x.id == this.materialesPuertoCantidadFormArray.controls.find(x => x.value.cantidad > 0).value.materialId).esLiquido;
      this.state === 'modulo-carga' ? this.embarqueForm.value['sanBenito'] = true : '';
      let altaEmbarque = this.embarqueForm.value;
      if (this.vaporInfo == null || this.vaporInfo == undefined) {
        altaEmbarque.Patente = this.nombre_buque;
        altaEmbarque.nombreBuque = this.nombre_buque;
        altaEmbarque.Vapor = {
          id : this.id_buque,
          nombre : this.nombre_buque
        }
      }else{
        altaEmbarque.patente = this.vaporInfo.nombreBuque;
        altaEmbarque.nombreBuque = this.vaporInfo.nombreBuque;
        altaEmbarque.Vapor = {
          id : this.vaporInfo.vapor_Id,
          nombre : this.vaporInfo.nombreBuque
        }
      }


      this.embarqueService.altaEmbarque(altaEmbarque)
        .subscribe((res: any) => {
          if (this.state && this.state.toLowerCase().trim() === 'modulo-carga') { //Si venimos del modulo de carga => /:state = modulo-carga, mostramos el confirm solo con el boton volver
            setTimeout(() => {
              this.workflowService.listarEmbarquesEnLineUp().subscribe(listado => {
                this.PlanoDeCargaId = listado.find(x => x.id == res).planoDeCargaId;
                this.mostrarSpinner = false;
                this.moduloCargaService.modificarCargadoPlanoDeCarga(this.PlanoDeCargaId).subscribe(y => {
                  this.openConfirmationDialog('¡Felicitaciones!',
                    'Ha cargado con éxito un nuevo Buque al Line UP',
                    'Volver a Modulo de Carga')
                });
              });
            }, 1000);
          } else {
            this.mostrarSpinner = false;
            this.openConfirmationDialog('¡Felicitaciones!',
              'Ha cargado con éxito un nuevo Buque al Line UP',
              'Ver line up',
              'Cargar otro buque');
          }
        },
          errmess => {
            this.confirmationDialogService.confirm('¡Error!', 'Error al crear el embarque: ' + <any>errmess.error, 'Cerrar', '', null, null, Tipoalerta.Error);
            this.mostrarSpinner = false;
          });

  }

  finalizarAlta() {
    this.submitted = true;
    if (this.embarqueId == 0) {

      if (this.id_buque == 0){
        let mensaje = "Debe seleccionar un buque para realizar el alta de embarque.";
        this.confirmationDialogService.confirm("¡Atención!", mensaje, "Cerrar", "", null, null, Tipoalerta.Warning);
        return false;
      }
      this.guardarAltaEmbarque();
    }
    else{
      // Sino se cambiado el embarque
      if (this.vaporSeleccionado === undefined || this.vaporSeleccionado == null){
        this.modificarAltaEmbarque();
      }else{
        // Si se cambiado el embarque y selecciono el mismo embarque
        if (this.embarqueSeleccionado.vapor.id == this.vaporSeleccionado.id){
          this.modificarAltaEmbarque();
        }
        if (this.embarqueSeleccionado.vapor.id != this.vaporSeleccionado.id){
          this.mostrarSpinner = true;
          this.validaAltaEmbarque().subscribe(esValido =>{
            this.mostrarSpinner = false;
            let mensaje = "No se pude modificar el embarque porque ya tiene cargas asociadas.";
            if (esValido)
              this.modificarAltaEmbarque();
            else
              this.confirmationDialogService.confirm("¡Atención!", mensaje, "Cerrar", "", null, null, Tipoalerta.Warning);
          });
        }
      }
    }
  }

  //#endregion

  invalidRequiredMaterial() {
    var material = this.materialesPuertoCantidadFormArray.controls.find(x => x.value.cantidad > 0);
    return material == null;
  }


  public openConfirmationDialog(titulo: string, texto: string, button1: string = 'OK', button2: string = 'Cancel') {
    if (this.state && this.state.toLowerCase().trim() === 'modulo-carga') { //Si venimos del modulo de carga => /:state = modulo-carga, nos devuelve al mismo modulo
      this.confirmationDialogService.confirm(titulo, texto, button1, '')
        .then((confirmed) => {
          if (confirmed)
            this.router.navigate(['/carga']);
        })
        .catch(() => window.location.reload());
    } else {
      this.confirmationDialogService.confirm(titulo, texto, button1, button2)
        .then((confirmed) => {
          if (confirmed)
            this.router.navigate(['/lineup']);
          else
            window.location.reload();
        })
        .catch(() => window.location.reload());
    }
  }

  cargarListadoMateriales() {
    this.embarqueService.obtenerListadoMateriales()
      .subscribe(res => {
        res.forEach(element => {
          this.listadoMateriales = res;
          this.materialesPuertoCantidadFormArray.push(this.formBuilder.group({
            materialId: [element.id],
            descripcionCorta: [element.descripcionCorta],
            cantidad: [],
            color: [element.color]
          }))
        });
        this.cargarEmbarqueEditar();
      },
        errmess => {
          this.confirmationDialogService.confirm('¡Error!', 'Error al cargar los materiales: ' + <any>errmess.error, 'Cerrar', '', null, null, Tipoalerta.Error);
          this.mostrarSpinner = false;
        });
  }

  cargarCombos() {
    this.embarqueService.obtenerListadoCoordinadores().subscribe(res => {
      this.coordinadoresList = res.map(x => new CoordinadorPuerto(x.id, x.nombre));
    });

    this.embarqueService.obtenerListadoATAPuerto().subscribe(res => {
      this.ataList = res.map(x => new ATAPuerto(x.id, x.nombre));
    });

    this.embarqueService.obtenerListadoAgenciasMaritimas().subscribe(res => {
      this.agenciasList = res.map(x => new AgenciaMaritimaPuerto(x.id, x.nombre));
    });

    this.embarqueService.obtenerListadoMotivosLimpieza().subscribe(res => {
      this.motivosLimpiezaList = res.map(x => new MotivosLimpieza(x.id, x.nombre));
    });

    this.embarqueService.obtenerBanderas().subscribe(res => {
      this.banderaBuque = res.map(x => new Bandera(x.id, x.abreviatura, x.nombre));
    });

  }

  public isEditing() {
    return this.route.snapshot.queryParamMap.get('id') != null;
  }

  //#region Modificar embarque
  public modificarEmbarque() {
    this.submitted = true;
    if (this.embarqueForm.invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      if (this.invalidRequiredMaterial()) {
        this.embarqueForm.controls['materialesPuertoCantidad'].setErrors({ 'error': true });
      }
      return;
    }
    else {
      if (this.invalidRequiredMaterial()) {
        this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
        this.embarqueForm.controls['materialesPuertoCantidad'].setErrors({ 'error': true });
        return;
      }
    }


    this.mostrarSpinner = true;
    this.embarqueForm.get('fechaRecalada').setValue(
      this.embarqueForm.value.fechaRecalada + ' ' + this.horaRecalada.nativeElement.value);

    this.embarqueForm.get('horaREcalada').setValue(
      this.horaRecalada.nativeElement.value ?
        this.horaRecalada.nativeElement.value :
        this.embarqueForm.value.meridiemRecalada);

    this.embarqueForm.get('fechaDesdeLimpieza').setValue(
      this.embarqueForm.value.fechaDesdeLimpieza + ' ' + this.horaDesdeLimpieza.nativeElement.value);

    this.embarqueForm.get('horaDesdeLimpieza').setValue(
      this.horaDesdeLimpieza.nativeElement.value ? this.horaDesdeLimpieza.nativeElement.value : '');

    this.embarqueForm.get('fechaHastaLimpieza').setValue(
      this.embarqueForm.value.fechaHastaLimpieza + ' ' + this.horaHastaLimpieza.nativeElement.value);

    this.embarqueForm.get('horaHastaLimpieza').setValue(
      this.horaHastaLimpieza.nativeElement.value ? this.horaHastaLimpieza.nativeElement.value : '');


    this.embarqueForm.value.motivosLimpieza =
      this.embarqueForm.value.motivosLimpiezaList != null && this.embarqueForm.value.motivosLimpiezaList.length > 0 ?
        this.motivosLimpiezaList.find(x => x.id == this.embarqueForm.value.motivosLimpiezaList[0].id) : '';

    this.embarqueForm.value.agencias =
      this.embarqueForm.value.agenciasList != null && this.embarqueForm.value.agenciasList.length > 0 ?
        this.agenciasList.find(x => x.id == this.embarqueForm.value.agenciasList[0].id) : '';

    this.embarqueForm.value.coordinadores =
      this.embarqueForm.value.coordinadoresList != null && this.embarqueForm.value.coordinadoresList.length > 0 ?
        this.coordinadoresList.find(x => x.id == this.embarqueForm.value.coordinadoresList[0].id) : '';

    this.embarqueForm.value.ata =
      this.embarqueForm.value.ataList != null && this.embarqueForm.value.ataList.length > 0 ?
        this.ataList.find(x => x.id == this.embarqueForm.value.ataList[0].id) : '';

    this.embarqueForm.value.esLiquido = this.listadoMateriales.find(x => x.id == this.materialesPuertoCantidadFormArray.controls.find(x => x.value.cantidad > 0).value.materialId).esLiquido;

    this.embarqueForm.value.filePathShipParticular = this.fileShipParticular;
    this.embarqueForm.value.shipParticularArchivoNombre = this.fileNameShipParticular;

    this.embarqueService.modificarEmbarque(this.embarqueForm.value)
      .subscribe((res: any) => {
        this.mostrarSpinner = false;
        this.openConfirmationDialog('¡Felicitaciones!',
          'Ha modificado con éxito el buque',
          'Ver line up',
          'Seguir modificando');
      },
        errmess => {
          this.alertService.mostrar(new Alerta(<any>errmess.error, Tipoalerta.Error));
          this.mostrarSpinner = false;
        });
  }

  //#endregion

  public trackByFn(index: any, item: any) {
    return index;

  }

  public checkLiquidOrSolid(materialCantidad) {

    if (materialCantidad == null)
      return;

    var material = this.listadoMateriales.find(x => x.id == materialCantidad.materialId);
    if (material.esLiquido) {
      if (materialCantidad.cantidad != null && materialCantidad.cantidad > 0)
        this.disabledInputMaterial(true, false);
      else if (this.emptyValuesQuantity(materialCantidad))
        this.disabledInputMaterial(false, false);
    }
    else if (!material.esLiquido) {
      if (materialCantidad.cantidad != null && materialCantidad.cantidad > 0)
        this.disabledInputMaterial(true, true);
      else if (this.emptyValuesQuantity(materialCantidad))
        this.disabledInputMaterial(false, true);
    }
  }

  emptyValuesQuantity(materialCantidad) {
    var material = this.materialesPuertoCantidadFormArray.controls.find(x => x.value.cantidad > 0 && x.value.materialId != materialCantidad.materialId);
    return material == null;
  }

  disabledInputMaterial(disabled, esLiquido) {
    var materiales = this.listadoMateriales.filter(x => x.esLiquido === esLiquido);
    materiales.forEach(element => {
      var control = this.materialesPuertoCantidadFormArray.controls.find(x => x.value.materialId == element.id);
      if (disabled) {
        control.get('cantidad').disable();
      }
      else {
        control.get('cantidad').enable();
      }

    });
  }

  onFileChangeShipParticular(event) {
    if (event.target.files && event.target.files.length) {
      let file = event.target.files[0];
      let fileReader = new FileReader();

      fileReader.onloadend = (e) => {
        this.fileShipParticular = fileReader.result;
        this.fileNameShipParticular = file.name;
      }
      fileReader.readAsDataURL(file);
    }
  }

  public descargarArchivo(tipo: string) {
    if (this.fileNameShipParticular == 'Ningun archivo elegido')
      return;
    let base64 = this.fileShipParticular;
    let imageName = this.fileNameShipParticular;

    // const imageBlob = this.dataURItoBlob('');
    const imageBlob = this.dataURItoBlob(base64);

    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(imageBlob, imageName);
    }
    // if (window.navigator.msSaveOrOpenBlob) {
    //   window.navigator.msSaveBlob(imageBlob, imageName);
    // }
    else {
      let elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(imageBlob);
      elem.download = imageName;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array]);
    return blob;
  }

  deleteArchivo(tipo: string) {
    // if (tipo == 'secuencia') {
    //   this.fileSecuencia = null;
    //   this.fileNameSecuencia = 'Ningun archivo elegido';
    // }
    // else {
    this.fileShipParticular = null;
    this.fileNameShipParticular = 'Ningun archivo elegido';
    // }
  }

  public numberOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  public decimalOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 46)
      return true;
    return false;
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }, (reason) => {
    });
  }

  datosABMPuerto(): string {
    var list = this.pantallaSeleccionada == 'Ata' ? 'ataList' :
      this.pantallaSeleccionada == 'Agencia' ? 'agenciasList' :
        this.pantallaSeleccionada == 'Coordinador' ? 'coordinadoresList' : 'motivosLimpiezaList';

    if (this.embarqueForm.get([list]).value.length > 0) {
      var numero = this.embarqueForm.get([list]).value[0].id;
      return this[list] != null ? this[list].find(x => x.id == numero).nombre.toString() : '';
    }
    else
      return '';
  }

  ABM(pantalla, opcion) {
    this.pantallaSeleccionada = pantalla;
    this.opcionABMSeleccionada = opcion;
    this.tituloABM =
      (this.opcionABMSeleccionada == 'Agregar' ? 'Agregar nuevo registro ' : 'Editar ') +
      (this.pantallaSeleccionada == 'Coordinador' ? 'Coordinador de Puerto' :
        this.pantallaSeleccionada == 'Ata' ? 'ATA de Puerto' :
          this.pantallaSeleccionada == 'Agencia' ? 'Agencia Maritima de Puerto' : 'Motivo Limpieza');

    return this.modalService.open(this.modalABM);
  }

  //**CONTROL DE BOTONES DE LOS ABM***//
  submitABM(accion) {
    var condicion: string = this.pantallaSeleccionada
    switch (condicion) {
      case 'Coordinador':
        var abm: CoordinadorPuerto = new CoordinadorPuerto('', '');
        var list = 'coordinadoresList';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarCoordinadorPuerto' : accion == 'Guardar' ?
            'modificarCoordinadorPuerto' : 'eliminarCoordinadorPuerto';
        var obtener = 'obtenerListadoCoordinadores';
        var modelo = CoordinadorPuerto;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito un nuevo Coordinador de Puerto' : accion == 'Guardar' ?
            'Ha modificado con éxito el Coordinador de Puerto' : 'Ha eliminado con éxito el Coordinador de Puerto';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de este Coordinador de Puerto ya existen' :
          'Los datos de este Coordinador de Puerto NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para el Coordinador de Puerto';
        var mensaje4 = 'No se puede eliminar el Coordinador de Puerto, ya que está asociado a un Embarque';
        break;

      case 'Ata':
        var abm: ATAPuerto = new ATAPuerto('', '');
        var list = 'ataList';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarATAPuerto' : accion == 'Guardar' ?
            'modificarATAPuerto' : 'eliminarATAPuerto';
        var obtener = 'obtenerListadoATAPuerto';
        var modelo = ATAPuerto;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito una nueva ATA de Puerto' : accion == 'Guardar' ?
            'Ha modificado con éxito la ATA de Puerto' : 'Ha eliminado con éxito la ATA de Puerto';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de esta ATA de Puerto ya existen' :
          'Los datos de esta ATA de Puerto NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para la ATA de Puerto';
        var mensaje4 = 'No se puede eliminar la ATA de Puerto, ya que está asociada a un Embarque';
        break;

      case 'Agencia':
        var abm: AgenciaMaritimaPuerto = new AgenciaMaritimaPuerto('', '');
        var list = 'agenciasList';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarAgenciaMaritimaPuerto' : accion == 'Guardar' ?
            'modificarAgenciaMaritimaPuerto' : 'eliminarAgenciaMaritimaPuerto';
        var obtener = 'obtenerListadoAgenciasMaritimas';
        var modelo = AgenciaMaritimaPuerto;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito una nueva Agencia Maritima de Puerto' : accion == 'Guardar' ?
            'Ha modificado con éxito la Agencia Maritima de Puerto' : 'Ha eliminado con éxito la Agencia Maritima de Puerto';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de esta Agencia Maritima de Puerto ya existen' :
          'Los datos de esta Agencia Maritima de Puerto NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para la Agencia Maritima de Puerto';
        var mensaje4 = 'No se puede eliminar la Agencia Maritima de Puerto, ya que está asociada a un Embarque';
        break;

      case 'Motivo':
        var abm: MotivosLimpieza = new MotivosLimpieza('', '');
        var list = 'motivosLimpiezaList';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarMotivoLimpieza' : accion == 'Guardar' ?
            'modificarMotivoLimpieza' : 'eliminarMotivoLimpieza';
        var obtener = 'obtenerListadoMotivosLimpieza';
        var modelo = MotivosLimpieza;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito un nuevo Motivo de Limpieza' : accion == 'Guardar' ?
            'Ha modificado con éxito un Motivo de Limpieza' : 'Ha eliminado con éxito un Motivo de Limpieza';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de este Motivo de Limpieza ya existen' :
          'Los datos de este Motivo de Limpieza NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para el Motivo de Limpieza';
        var mensaje4 = 'No se puede eliminar el Motivo de Limpieza, ya que está asociada a un Embarque';
        break;
    }

    //**Guardar de Agregar y Modificar***//
    if (accion == 'Guardar') {
      if (this.opcionABMSeleccionada == 'Modificar-Eliminar')
        abm.id = this.embarqueForm.get([list]).value[0].id;

      abm.nombre = (<HTMLInputElement>document.getElementById("nombre")).value;

      if (abm.nombre.replace(/\s/g, "").length > 0) {
        if (this.opcionABMSeleccionada == 'Agregar')
          var datosUnicos = this[list].find(x => x.nombre == abm.nombre);
        else
          var datosUnicos = this[list].find(x => x.id != abm.id && x.nombre == abm.nombre);

        if (typeof datosUnicos == 'undefined') {
          this.embarqueService[opcionABM](abm).subscribe(res => {
            this.modalService.dismissAll();

            this.embarqueService[obtener]().subscribe(res => {
              this[list] = res.map(x => new modelo(x.id, x.nombre));
            });

            if (this.opcionABMSeleccionada == 'Agregar') {
              this.embarqueService[obtener]().subscribe(res => {
                this.embarqueForm.get([list]).setValue(
                  res.filter(x => x.nombre == abm.nombre).map(x => new modelo(x.id, x.nombre)));
              });
            }
            else {
              this.embarqueService[obtener]().subscribe(res => {
                this.embarqueForm.get([list]).setValue(
                  res.filter(x => x.id == abm.id).map(x => new modelo(x.id, x.nombre)));
              });
            }

            this.confirmationDialogService.confirm('¡Felicitaciones!', mensaje1, 'Cerrar', '', null, null, Tipoalerta.Success);
          });
        }
        else {
          this.confirmationDialogService.confirm('¡Error!', mensaje2, 'Cerrar', '', null, null, Tipoalerta.Success);
        }
      }
      else {
        this.confirmationDialogService.confirm('¡Error!', mensaje3,
          'Cerrar', '', null, null, Tipoalerta.Success);
      }
    }
    //**Eliminar***//
    else {
      abm.id = this.embarqueForm.get([list]).value[0].id;

      var datosUnicos = this[list].find(x => x.id != abm.id);

      if (typeof datosUnicos != 'undefined') {
        this.embarqueService[opcionABM](abm.id).subscribe(res => {
          this.modalService.dismissAll();

          if (res) {
            this.embarqueService[obtener]().subscribe(res => {
              this[list] = res.map(x => new modelo(x.id, x.nombre));
            });

            this.embarqueForm.get([list]).setValue('');

            this.confirmationDialogService.confirm('¡Felicitaciones!', mensaje1, 'Cerrar', '', null, null, Tipoalerta.Success);
          }
          else
            this.confirmationDialogService.confirm('¡Error!', mensaje4, 'Cerrar', '', null, null, Tipoalerta.Success);
        });
      }
      else {
        this.confirmationDialogService.confirm('¡Error!', mensaje2, 'Cerrar', '', null, null, Tipoalerta.Success);
      }
    }
  }

  public validarAMPM(event) {
    if (event) {
      if (event.length > 0) {
        this.embarqueForm.get('meridiemRecalada').setValue('');
      }
    }
  }
  // #endregion

  // #region Eventos Controles
  public onChangeVicentin(e) {
    if (!this.embarqueForm.value.noryon && !this.embarqueForm.value.sanBenito
      && !this.embarqueForm.value.otrosMuelles) {
      this.embarqueForm.get('vicentin').setValue(true);
    }
  }

  public onChangeSanBenito(e) {
    if (!this.embarqueForm.value.noryon && !this.embarqueForm.value.vicentin
      && !this.embarqueForm.value.otrosMuelles) {
      this.embarqueForm.get('sanBenito').setValue(true);
    }
  }

  public onChangeNoryon(e) {
    if (!this.embarqueForm.value.sanBenito && !this.embarqueForm.value.vicentin
      && !this.embarqueForm.value.otrosMuelles) {
      this.embarqueForm.get('noryon').setValue(true);
    }
  }

  public onChangeotrosMuelles(e) {
    if (!this.embarqueForm.value.sanBenito && !this.embarqueForm.value.vicentin
      && !this.embarqueForm.value.noryon) {
      this.embarqueForm.get('otrosMuelles').setValue(true);
    }
  }

  public onChangeAMPM(event) {
    this.horaRecalada.nativeElement.value = '';
  }
  public onBorrarSeleccionAMPM(){
    this.embarqueForm.get('meridiemRecalada').setValue('');
  }
  // #endregion

  public searchVapores = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.vaporesList.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public selectedVapor($event) {
    console.log('$event--->>', $event);
    let { id, nombre } = $event.item
    this.id_buque  = id;
    this.nombre_buque = nombre;
    this.vaporSeleccionado = {id: id, nombre: nombre, tipoBuque: ''};
    this.buqueService.obtenerVaporInformacion(id).subscribe((res: VaporInformacion) => {
      if (res!=null){
        this.vaporInfo = res;
        this.vaporSeleccionado.tipoBuque = res.tipoBuque;
        //this.embarqueForm.controls.nombreBuque.disable();
        this.setinfoSelected();
      }
    });
  }
  public formatterVapores = (v: Vapor) => v.nombre;

  public onBlurBandera() {
    this.listadoBanderaModificada = !this.embarqueForm.value.bandera;
  }

  public formatterBanderas = (p: Bandera) => p.nombre;

  public searchBanderas = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.banderasBuque.filter(b => b.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  );

  public sendBandera(value: any) {
    if (this.embarqueForm['controls'].bandera.value === undefined) {
      this.embarqueForm.controls.bandera.setValue(null);
      (<HTMLInputElement>document.getElementById("band")).value = '';
    }
  }

  setinfoSelected(){
    let bandera;
      if(this.vaporInfo.bandera_Id !== undefined || this.vaporInfo.bandera_Id !== null){
        bandera = this.banderasBuque.filter(p => p.id == this.vaporInfo.bandera_Id)
      }

      let tipoBuqueBD = this.tipoDeBuquePuerto.filter(tipo => tipo.nombre == this.vaporInfo.tipoBuque)

      this.vaporInfo.freeboard !== null && this.embarqueForm.controls.freeboard.setValue(this.vaporInfo.freeboard);
      this.vaporInfo.porteNeto !== null && this.embarqueForm.controls.porteNeto.setValue(this.vaporInfo.porteNeto);
      this.vaporInfo.porteBruto !== null && this.embarqueForm.controls.porteBruto.setValue(this.vaporInfo.porteBruto);
      this.vaporInfo.eslora !== null && this.embarqueForm.controls.eslora.setValue(this.vaporInfo.eslora);
      this.vaporInfo.manga !== null && this.embarqueForm.controls.manga.setValue(this.vaporInfo.manga);
      this.vaporInfo.puntual !== null && this.embarqueForm.controls.puntal.setValue(this.vaporInfo.puntual);
      this.vaporInfo.cantidadBodegasTks !== null && this.embarqueForm.controls.cantidadBodegasTanques.setValue(this.vaporInfo.cantidadBodegasTks);
      bandera !== null && this.embarqueForm.controls.bandera.setValue(bandera[0] != null ? bandera[0] : null);
      tipoBuqueBD !== null && this.embarqueForm.controls.tipoDeBuque.setValue(tipoBuqueBD[0]);
      this.vaporInfo.imoVapor !== null && this.embarqueForm.controls.imo.setValue(this.vaporInfo.imoVapor);
  }
}
