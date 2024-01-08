import { Component, OnInit, TemplateRef, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AgenciaControlPrivado } from '@ScatoModels/agencia-control-privado';
import { AgenteControlPrivado } from '@ScatoModels/agente-control-privado';
import { Alerta } from '@ScatoModels/alerta';
import { Destino } from '@ScatoModels/destino';
import { Embarque } from '@ScatoModels/embarque';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { EstadoPuerto } from '@ScatoModels/estado-puerto';
import { Estiba } from '@ScatoModels/estiba';
import { Exportador } from '@ScatoModels/exportador';
import { Mail } from '@ScatoModels/mail';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AlertService } from '@ScatoServicios/alert.service';
import { LineupService } from '@ScatoServicios/lineup.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ProcesoGuardarService } from '@ScatoServicios/procesoGuardar.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { CargaComercial } from '@ScatoModels/carga-comercial';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { PlanoDeCargaBodegaDestino } from '@ScatoModels/plano-de-carga-bodega-destino';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { PlanoDeCarga } from '@ScatoModels/plano-de-carga';

@Component({
  selector: 'app-plano-content',
  templateUrl: './plano-content.component.html',
  styleUrls: ['./plano-content.component.css']
})
export class PlanoContentComponent implements OnInit, OnDestroy {
  estadoAlturaValor: number;
  embarqueSelected: EmbarqueNav;
  @Output() showCargas = new EventEmitter<boolean>();
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild('modalEditarAgenteControlPrivado') modalEditarAgenteControlPrivado: TemplateRef<any>;
  @ViewChild('modalABM') modalABM: TemplateRef<any>;
  @ViewChild('modalExportadorABM') modalExportadorABM: TemplateRef<any>;
  mostrarContent: boolean = false;
  estadoPuerto: EstadoPuerto;
  embarque: Embarque;
  recomendacionDefensas: string = '';
  planoDeCargaForm: FormGroup;
  materialesPuerto: MaterialPuerto[];
  destinos: Destino[];
  exportadores: Exportador[];
  estibasList: Estiba[];
  agenciasControlPrivadoList: AgenciaControlPrivado[];
  agentesControlPrivadoList: AgenteControlPrivado[];
  agenteSeleccionado: number;
  pantallaSeleccionada: string;
  opcionABMSeleccionada: string;
  tituloABM: string;
  listadoExportadoresModificado: boolean = false;
  cargaComercialIncompleto: boolean = false;
  esLiquido: boolean = false;
  filePlano: string | ArrayBuffer;
  fileNamePlano: string = 'Ningun archivo elegido';
  fileSecuencia: string | ArrayBuffer;
  fileNameSecuencia: string = 'Ningun archivo elegido';
  mostrarFumigadora: boolean = false;
  datosGrafico: any;
  state: string;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  private suscripciones: Subscription[] = [];
  public checkMismosDestinos: boolean = false;
  private dropdownSettings;

  constructor(
    private lineupService: LineupService,
    private embarqueService: EmbarqueService,
    private planoDeCargaService: PlanoDeCargaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private _procesoService: DatosEmbarquesProcesoService,
    private _guardarService: ProcesoGuardarService,
    private _turnoService: TurnosService,
    private session: SessionService
  ) {
    this.user = this.session.getUser();
    this.setConfigListaMultiple();
    const subs1 = this._guardarService.sendGuardar.subscribe(
      (([finalizar, moduloCarga]) => {
        this.guardarPlanoDeCargaContinuacion(finalizar, moduloCarga);
      })
    )
    this.suscripciones.push(subs1);
    const subs2 = this._procesoService.sendEstadoAltura.subscribe(
      res => {
        this.estadoAlturaValor = res;
        this.calcularRecomendacionDefensas();
      }
    )
    this.suscripciones.push(subs2);
    this.state = this.router.url.replace('/', '');
  }

  ngOnInit(): void {



    this.getEmbarqueData();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(sub => sub.unsubscribe());
  }

  getEmbarqueData() {
    this._procesoService.sendEmbarque.subscribe(res => {
      this.embarqueSelected = res;
      this.inicializarFormulario();
    });
    if (!this.embarqueSelected) {
      this.embarqueSelected = this._procesoService.getEmbarqueSelected();
    }
    this.inicializarFormulario();

    setTimeout(() => {
      this.controlarPermisos();
    }, 3000);
  }

  inicializarFormulario() {
    this.planoDeCargaForm = this.formBuilder.group({
      id: [this.embarqueSelected.planoDeCargaId],
      defensasMoviles: [],
      observaciones: [],
      caladoSalida: [],
      estiba: [],
      estibasList: [],
      agenciaControlPrivado: [],
      agenciasControlPrivadoList: [],
      agentesControlPrivadoSeleccionado: [],
      agentesControlPrivadoList: [],
      planoDeCargaBodegas: this.formBuilder.array([]),
      cargasComerciales: this.formBuilder.array([]),
      enviado: [false],
      fumigacion: [],
      empresaFumigadora: [],
      FilePathPlano: [],
      planoDeCargaArchivoNombre: [],
      FilePathSecuencia: [],
      planoDeCargaArchivoSecuenciaNombre: [],
      usuarioFinalizacion: [],
    });
    this.cargarEmbarque();
  }

  obtenerPlanoDeCarga() {
    this.planoDeCargaService.obtenerPlanoDeCarga(this.embarqueSelected.planoDeCargaId).subscribe(res => {
      this.planoDeCargaForm.patchValue({ ...res, planoDeCargaBodegas: this.planoDeCargaForm.get('planoDeCargaBodegas').value });
      this._turnoService.setExportadores(res.cargasComerciales);
      this.checkMismosDestinos = false;
      const bodegas = res.planoDeCargaBodegas;
      if (bodegas?.length) {
        for (let index = 0; index < 9; index++) {
          var bodega = bodegas.find(x => x.bodegaParcel == index + 1);
          if (bodega != null) {

            if (!bodega.destinos) {
              bodega.destinos = []
            }

            // Se convierte el formato anterior de destino al nuevo que puede contener multiples destinos
            if (bodega.destino != null) {
              const destinoPais = this.destinos?.find(x => x.id == bodega.destino.id);
              const destinoBodega = new PlanoDeCargaBodegaDestino(0, destinoPais);
              bodega.destinos.push(destinoBodega);
              bodega.destino = null; // Ya que fue convertido, es necesario quitarlo de su lugar anterior
            }
            // Obtención de los destinos como Destino[] en vez de PlanoDeCargaBodegaDestino[] ya que así lo usa el form.
            const destinosIds = bodega.destinos.map(d => d.destino.id);
            const destinosPaises = this.destinos.filter(d => destinosIds.includes(d.id));
            bodega.destinosPaises = destinosPaises;

            const bodegaForm = this.planoDeCargaBodegasFormArray.at(index);
            bodegaForm.setValue(bodega);
            this.onChangeCondicion(bodega.condicion, index);

            if (bodega.materialPuerto != null) {
              const material = this.materialesPuerto.find(x => x.id == bodega.materialPuerto.id);
              bodegaForm.get('materialPuerto').setValue(material);
            }

            if (bodega.cantidad && bodega.cantidad % 1) { // necesario para mostrar los valores iniciales con "," en los decimales
              const cantidadStr = bodega.cantidad.toString().replace('.', ',');
              bodegaForm.get('cantidad').setValue(cantidadStr, { emitEvent: false });
              setTimeout(() => {
                bodegaForm.get('cantidad').setValue(Number(cantidadStr.replace(',', '.')), { emitModelToViewChange: false, emitEvent: false });
              }, 200);
            }

            const bodegasConValores = this.planoDeCargaForm.controls.planoDeCargaBodegas.value
              .filter((b: PlanoDeCargaBodega) => b.cantidad > 0 || b.condicion || b.materialPuerto || b.tanqueDeAbordo);
            this._turnoService.setBodega(bodegasConValores);
          }
        }
        // Reviso si todos tienen los mismos destinos. Con una sola bodega no sería necesario
        if (bodegas.length > 1) {
          const primerosDestinos = JSON.stringify(bodegas.find(b => b.destinos?.length)?.destinosPaises);
          this.checkMismosDestinos = !bodegas.some(b => JSON.stringify(b.destinosPaises) != primerosDestinos)
        }
      }

      this.planoDeCargaService.obtenerListadoEstibas().subscribe(res1 => {
        res.estiba = res1.map(x => new Estiba(x.id, x.nombre, x.apellido));
      });
      if (this.planoDeCargaForm.value['estiba'] != null) {
        this.planoDeCargaService.obtenerListadoEstibas().subscribe(res1 => {
          this.planoDeCargaForm.get('estibasList').setValue(
            res1.filter(x => x.id == this.planoDeCargaForm.value['estiba'].id).map(x => new Estiba(x.id, x.nombre, x.apellido)));
        });
      }

      this.planoDeCargaService.obtenerListadoAgenciasControlPrivado().subscribe(res1 => {
        res.agenciaControlPrivado = res1.map(x => new AgenciaControlPrivado(x.id, x.nombre));
      });
      if (this.planoDeCargaForm.value['agenciaControlPrivado'] != null) {
        this.planoDeCargaService.obtenerListadoAgenciasControlPrivado().subscribe(res1 => {
          this.planoDeCargaForm.get('agenciasControlPrivadoList').setValue(
            res1.filter(x => x.id == this.planoDeCargaForm.value['agenciaControlPrivado'].id).map(x => new AgenciaControlPrivado(x.id, x.nombre)));
        });
      }

      this.planoDeCargaForm.get('agentesControlPrivadoSeleccionado').setValue(res.agentesControlPrivado);

      this.fileNamePlano = res.planoDeCargaArchivoPlanoNombre != null ? res.planoDeCargaArchivoPlanoNombre : 'Ningun archivo elegido';
      this.fileNameSecuencia = res.planoDeCargaArchivoSecuenciaNombre != null ? res.planoDeCargaArchivoSecuenciaNombre : 'Ningun archivo elegido';
      this.filePlano = res.filePathPlano;
      this.fileSecuencia = res.filePathSecuencia;
      // for (let index = 0; index < res.cargasComerciales.length; index++) {
      //   this.cargasComercialesFormArray.at(index).get('materialPuerto').setValue(
      //     this.materialesPuerto.find(x => x.id == res.cargasComerciales[index].materialPuerto.id)
      //   );
      // }

      if (res.cargasComerciales && res.cargasComerciales.length > 0) {
        res.cargasComerciales.forEach((cargaComercial, index) => {
          this.cargasComercialesFormArray.push(this.initCargaComercial(cargaComercial))
          this.cargasComercialesFormArray.at(index).get('materialPuerto').setValue(
            this.materialesPuerto.find(x => x.id == cargaComercial.materialPuerto.id)
          );
        })
      } else {
        this.cargasComercialesFormArray.push(this.initCargaComercial());
      }


      this.mostrarFumigadora = res.fumigacion;

      this.lineupService.obtenerEstadoPuerto().subscribe(x => { this.estadoAlturaValor = Number(x.alturaDelRio); this.calcularRecomendacionDefensas(x); });
      this.mostrarContent = true;
      this.showCargas.emit(true);
    });

    setTimeout(() => {
      this.controlarPermisos();
    }, 3000);
  }

  initCargaComercial(cargaComercial: CargaComercial = null) {
    if (cargaComercial != null) {
      return this.formBuilder.group({
        id: cargaComercial.id,
        exportador: cargaComercial.exportador,
        nombre: cargaComercial.exportador.nombre,
        cantidad: cargaComercial.cantidad,
        materialPuerto: cargaComercial.materialPuerto
      })
    } else {
      return this.formBuilder.group({
        id: '',
        exportador: [],
        nombre: '',
        materialPuerto: [],
        cantidad: '',
      })
    }
  }

  agregarCargaComercial() {
    this.cargasComercialesFormArray.push(this.initCargaComercial());
  }

  eliminarCargaComercial(index: number) {
    const value = this.cargasComercialesFormArray.value;

    this.cargasComercialesFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );

    this.cargasComercialesFormArray.removeAt(value.length - 1);
  }

  cargarEmbarque() {
    this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe(
      res => {
        this.embarque = res;
        this.materialesPuerto = res.materialesPuertoCantidad.map(m => ({
          id: m.materialId,
          descripcionCorta: m.descripcionCorta,
          descripcion: '',
          almacenDesc: '',
          almacenId: 0,
          codigoSAP: '',
          esLiquido: m.esLiquido,
          color: m.color
        }));
        this.esLiquido = res.esLiquido;
        this.datosGrafico = {
          nombreBuque: res.nombreBuque,
          fecha: res.fechaRecalada,
          tnAprox: res.materialesPuertoCantidad.reduce((acc, el) => acc + el.cantidad, 0),
          productosACargar: res.materialesPuertoCantidad.reduce((acc, el, i) => i < res.materialesPuertoCantidad.length - 1 ? acc + el.descripcionCorta + ', ' : acc + el.descripcionCorta, ''),
          listaMateriales: res.materialesPuertoCantidad.map(x => ({ id: x.materialId, descripcionCorta: x.descripcionCorta, color: x.color })),
        }
        this._procesoService.setDatosGrafico(this.datosGrafico);
        this.cargarDestinos();
        this.getExportadores();
      }, () => {
        this.confirmationDialogService.confirm('¡Error!', `Error al obtener el embarque ${this.embarqueSelected.id}`, 'Cerrar', '', null, null, Tipoalerta.Error);
      });
  }

  cargarDestinos() {
    this.planoDeCargaService.obtenerDestinos().subscribe(res => this.destinos = res);
  }

  public getDestinos() {
    return this.destinos;
  }

  getExportadores() {
    this.planoDeCargaService.obtenerExportadores().subscribe(
      res => {
        this.exportadores = res;
        this.getListadoEstibas();
      });
  }

  getListadoEstibas() {
    this.planoDeCargaService.obtenerListadoEstibas().subscribe(
      res => {
        this.estibasList = res.map(x => new Estiba(x.id, x.nombre, x.apellido));
        this.getListadoAgenciasControlPrivado();
      });
  }

  getListadoAgenciasControlPrivado() {
    this.planoDeCargaService.obtenerListadoAgenciasControlPrivado().subscribe(res => {
      this.agenciasControlPrivadoList = res.map(x => new AgenciaControlPrivado(x.id, x.nombre));
      this.getListadoAgentesControlPrivado();
    });
  }

  getListadoAgentesControlPrivado() {
    this.planoDeCargaService.obtenerListadoAgentesControlPrivado().subscribe(res => {
      this.agentesControlPrivadoList = res.map(x => new AgenteControlPrivado(x.id, x.nombre, x.apellido));
      this.cargarCargasComerciales();
    });
  }

  cargarCargasComerciales() {
    this.cargasComercialesFormArray.clear();
    this.cargarPlanoDeCargaBodegas();
  }

  cargarPlanoDeCargaBodegas() {
    this.planoDeCargaBodegasFormArray.clear();

    for (let index = 0; index < 9; index++) {
      const cantidad = new FormControl(null, { updateOn: 'blur' });
      const suscCantidad = cantidad.valueChanges.subscribe((val: string) => {
        if (typeof val == 'string') {
          const valorNumerico = val ? Number(val.replace(',', '.')) : val;
          cantidad.setValue(valorNumerico, { emitModelToViewChange: false, emitEvent: false });
        }
      });
      this.suscripciones.push(suscCantidad);

      const bodegaGroup = this.formBuilder.group({
        id: [],
        bodegaParcel: [index + 1],
        cantidad,
        materialPuerto: [],
        condicion: [""],
        sfFull: [],
        destino: [],
        tanqueDeAbordo: [],
        destinos: [],
        destinosPaises: []
      });
      // Convierte los destinos seleccionados en la clase de relación
      const susConvertirDestino = bodegaGroup.get('destinosPaises').valueChanges.subscribe((val: Destino[]) => {
        if (!val) {
          return;
        }
        const destinos: PlanoDeCargaBodegaDestino[] = val.map(destino => ({ id: 0, destino }));
        bodegaGroup.get('destinos').setValue(destinos, { emitEvent: false });
      });
      this.suscripciones.push(susConvertirDestino);
      this.planoDeCargaBodegasFormArray.push(bodegaGroup);
    }

    const suscDestino = this.planoDeCargaBodegasFormArray.valueChanges.pipe().subscribe(() => {
      if (this.checkMismosDestinos) {
        this.setearMismoDestino();
      }
    });
    this.suscripciones.push(suscDestino);

    this.obtenerPlanoDeCarga();
  }

  private setearMismoDestino() {
    const bodegas = this.planoDeCargaBodegasFormArray.value as PlanoDeCargaBodega[];
    const primerBodegaConDestinos = bodegas.find(b => b.destinosPaises?.length);
    if (!primerBodegaConDestinos) {
      return;
    }

    const bodegasNoVaciasForm = this.planoDeCargaBodegasFormArray.controls.filter(bodegaForm => {
      const b = bodegaForm.value as PlanoDeCargaBodega;
      return (b.cantidad > 0 || b.condicion || b.destino || b.materialPuerto || b.tanqueDeAbordo); // solo las bodegas con datos
    });

    // Descarto las que ya poseen el mismo destino, para evitar un ciclo infinito
    const bodegasActualizarDestino = bodegasNoVaciasForm.filter(bodegaForm => {
      const destinosViejos = bodegaForm.get('destinosPaises').value as Destino[];
      const destinosNuevos = primerBodegaConDestinos.destinosPaises;
      return JSON.stringify(destinosViejos) != JSON.stringify(destinosNuevos);
    });

    for (const bodegaForm of bodegasActualizarDestino) {
      bodegaForm.get('destinosPaises').setValue(primerBodegaConDestinos.destinosPaises, { emitEvent: false });
      bodegaForm.get('destinos').setValue(primerBodegaConDestinos.destinos, { emitEvent: false });
    }
  }

  public onChangeCheckDestinos() {
    if (this.checkMismosDestinos) {
      this.setearMismoDestino();
    }
  }

  get planoDeCargaBodegasFormArray(): FormArray {
    return this.planoDeCargaForm.get("planoDeCargaBodegas") as FormArray
  }

  get cargasComercialesFormArray(): FormArray {
    return this.planoDeCargaForm.get("cargasComerciales") as FormArray
  }

  public trackByFn(index: any, item: any) {
    return index;
  }

  public numberOnly(event: KeyboardEvent, decimales?: boolean): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    let esNumero = charCode >= 48 && charCode <= 57;
    if (!esNumero && decimales) {
      const input = event.target as HTMLInputElement;
      const char = String.fromCharCode(charCode);
      return char == ',' && !input.value.includes(',');
    }
    return esNumero;
  }

  calcularRecomendacionDefensas(estadoPuerto?: any) {
    this.estadoPuerto = estadoPuerto;

    if (this.embarque?.freeboard == 0 && this.estadoAlturaValor == 0) {
      this.recomendacionDefensas = "Altura y Freeboard desconocidos, no se pueden calcular las defensas móviles";
    } else if (this.embarque?.freeboard == 0) {
      this.recomendacionDefensas = "Freeboard desconocido, no se pueden calcular las defensas móviles";
    } else if (this.estadoAlturaValor == 0) {
      this.recomendacionDefensas = "Altura desconocida, no se pueden calcular las defensas móviles";
    } else {
      var result = this.embarque?.freeboard +
        (this.estadoAlturaValor ? this.estadoAlturaValor : Number(this.estadoPuerto?.alturaDelRio)) - 1
      if (result > 5) {
        this.recomendacionDefensas = "No usar defensas móviles";
        this.planoDeCargaForm.get('defensasMoviles').setValue('No');
      }
      else {
        this.recomendacionDefensas = "Usar defensas móviles";
        this.planoDeCargaForm.get('defensasMoviles').setValue('Si');
      }
    }
  }

  // Tambien invocado desde plano-de-carga.component.ts
  public guardarPlanoDeCarga(finalizar: boolean) {
    if (this.planoDeCargaForm.invalid) {
      return;
    }

    //SI EL PLANO DE CARGA YA ESTABA FINALIZADO, Y LE DA GUARDAR, AVISA QUE SE REALIZARON
    //CAMBIOS, POR LO QUE DEBERÍA DARLE FINALIZAR PARA QUE ENVIE EL MAIL
    if (this.planoDeCargaForm.value.enviado && !finalizar) {
      var texto = "Se ha modificado con éxito el plano de carga. Si desea informar los cambios, haga click en FINALIZAR.";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Success)
        .then((confirmed) => {
          if (confirmed)
            this.guardarPlanoDeCargaContinuacion(finalizar);
          else
            return;
        }).catch(() => window.location.reload());
    }
    else
      this.guardarPlanoDeCargaContinuacion(finalizar);
  }

  public guardarPlanoDeCargaContinuacion(finalizar: boolean, moduloCarga: boolean = false) {
    var bodegasCargadas;

    //Bodegas cargadas sin destino
    bodegasCargadas = this.planoDeCargaForm.value.planoDeCargaBodegas.filter(x => x.cantidad > 0 && (x.destinos == null || x.destinos.length == 0));

    if (bodegasCargadas.length > 0) {
      let texto = "No se ha ingresado el DESTINO para una o mas bodegas cargadas.";
      this.confirmationDialogService.confirm("Alerta", texto, 'Cerrar', '', null, null, Tipoalerta.Warning);
      setTimeout(() => {
        this._guardarService.planoCargaOk.next(false);
      }, 100);

    } else {
      this.hideSpinner.emit(true);
      this.planoDeCargaForm.value.estiba =
        this.planoDeCargaForm.value.estibasList != null && this.planoDeCargaForm.value.estibasList.length > 0 ?
          this.estibasList.find(x => x.id == this.planoDeCargaForm.value.estibasList[0].id) : '';

      this.planoDeCargaForm.value.agenciaControlPrivado =
        this.planoDeCargaForm.value.agenciasControlPrivadoList != null && this.planoDeCargaForm.value.agenciasControlPrivadoList.length > 0 ?
          this.agenciasControlPrivadoList.find(x => x.id == this.planoDeCargaForm.value.agenciasControlPrivadoList[0].id) : '';

      this.planoDeCargaForm.value.agentesControlPrivado =
        this.planoDeCargaForm.get('agentesControlPrivadoSeleccionado').value.length > 0 ?
          this.planoDeCargaForm.get('agentesControlPrivadoSeleccionado').value.map(x => new AgenteControlPrivado(x.id, x.nombre, x.apellido)) : '';

      if (!this.planoDeCargaForm.value.enviado)
        this.planoDeCargaForm.value.enviado = finalizar;

      if (finalizar)
        this.planoDeCargaForm.value.usuarioFinalizacion = this.user.username;
      else
        this.planoDeCargaForm.value.usuarioFinalizacion = null;

      this.planoDeCargaForm.value.filePathPlano = this.filePlano;
      this.planoDeCargaForm.value.planoDeCargaArchivoPlanoNombre = this.fileNamePlano;
      this.planoDeCargaForm.value.filePathSecuencia = this.fileSecuencia;
      this.planoDeCargaForm.value.planoDeCargaArchivoSecuenciaNombre = this.fileNameSecuencia;
      this.planoDeCargaForm.value.usuario = this.user.username;
      this.planoDeCargaForm.value.defensasMoviles = this.planoDeCargaForm.value.defensasMoviles || this.planoDeCargaForm.value.defensasMoviles === 'Si' ? true : false;

      try {
        this.planoDeCargaService.guardarPlanoDeCarga(this.planoDeCargaForm.value).subscribe((res: any) => {
          if (!moduloCarga) {
            if (finalizar)
              this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha cargado con éxito el plano de carga', 'Cerrar', '', null, null, Tipoalerta.Success)
                .then(() => { this.enviarMail(); },
                  error => {
                    this.confirmationDialogService.confirm('¡Error!', 'Error al crear el plano de carga: ' + <any>error.error, 'Cerrar', '', null, null, Tipoalerta.Error);
                  }
                ).catch(() => window.location.reload())
            else {
              this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha cargado con éxito el plano de carga', 'Volver Line up', '', null, null, Tipoalerta.Success)
                .then((confirmed) => {
                  if (confirmed) {
                    this.router.navigate(['/lineup']);
                  }
                }).catch(() => window.location.reload())
            }
          }
          this._guardarService.planoCargaOk.next(true);

          this.hideSpinner.emit(false);
        }, async (err) => {
          console.error(err.error)
          await this.confirmationDialogService.confirm('¡Error!', 'Error al crear el plano de carga: ' + err.error, 'Cerrar', '', null, null, Tipoalerta.Error)
          this._guardarService.planoCargaOk.next(false);
          this.hideSpinner.emit(false);
        });
      } catch (err) {
        console.error(err);
        this._guardarService.planoCargaOk.next(false);
        this.hideSpinner.emit(false);
      }
    }
  }

  enviarMail() {
    var titulo = "Enviar plano de carga por mail";
    var text = "Cuerpo del mail:";
    var inputTitle = "Destinatarios";
    var mail = new Mail(`${this.embarque.nombreBuque}. ${this.embarque.materialesPuertoCantidad[0].descripcionCorta}. Muelle: San Benito. Plano de carga, nominación y adjunto comunicación previa.`);
    this.planoDeCargaService.obtenerBodyPlanoDeCarga(this.embarqueSelected.planoDeCargaId, this.embarque).subscribe(x => { mail.body = x });
    this.planoDeCargaService.obtenerDestinatariosPlanoDeCarga().subscribe(x => mail.destinatarios = x);
    var button1 = 'Enviar';
    var button2 = 'Cancelar';
    this.confirmationDialogService.confirm(titulo, text, button1, button2, 'xl', mail, null, inputTitle, true)
      .then((confirmed) => {
        if (confirmed) {
          this.hideSpinner.emit(true);
          this.planoDeCargaService.enviarPorMail(mail, this.embarqueSelected.planoDeCargaId).subscribe(
            data => {
              this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha enviado con éxito el mail con el plano de carga', 'Volver Line up', '', null, null, Tipoalerta.Success)
                .then((confirmed) => {
                  if (confirmed)
                    this.router.navigate(['/lineup']);
                }).catch(() => window.location.reload());
            }, error => {
              this.alertService.mostrar(new Alerta(<any>error.error, Tipoalerta.Error));
              this.hideSpinner.emit(false);
            })
        }
        else
          this.hideSpinner.emit(false);
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        this.hideSpinner.emit(false);
      });
  }

  public formatterExportador = (exp: Exportador) => exp.nombre;

  public searchExportador = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.exportadores.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public onBlurExportador() {
    this.listadoExportadoresModificado = !this.planoDeCargaForm.value.exportador;
  }

  onFileChangePlano(event) {
    if (event.target.files && event.target.files.length) {
      var file = event.target.files[0];
      var fileReader = new FileReader();

      fileReader.onloadend = (e) => {
        this.filePlano = fileReader.result;
        this.fileNamePlano = file.name;
      }
      fileReader.readAsDataURL(file);
    }
  }

  onFileChangeSecuencia(event) {
    if (event.target.files && event.target.files.length) {
      var file = event.target.files[0];
      var fileReader = new FileReader();

      fileReader.onloadend = (e) => {
        this.fileSecuencia = fileReader.result;
        this.fileNameSecuencia = file.name;
      }
      fileReader.readAsDataURL(file);
    }
  }

  public decimalOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 46)
      return true;
    return false;
  }

  public onChangeCondicion(valor, i) {
    if (valor == "Full") {
      this.planoDeCargaBodegasFormArray.controls[i].get('sfFull').disable();
      this.planoDeCargaBodegasFormArray.controls[i].get('sfFull').setValue('');
    }
    else
      this.planoDeCargaBodegasFormArray.controls[i].get('sfFull').enable();
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }, (reason) => {
    });
  }

  datosABMPuerto(campo): string {
    var list = this.pantallaSeleccionada == 'Estiba' ? 'estibasList' :
      this.pantallaSeleccionada == 'Agencia' ? 'agenciasControlPrivadoList'
        : 'agentesControlPrivadoList'
    var listDeSeleccionados = this.pantallaSeleccionada == 'Agente' ? 'agentesControlPrivadoSeleccionado' : '';

    if (this.planoDeCargaForm.get((this.pantallaSeleccionada == 'Agente' ?
      [listDeSeleccionados] : [list])).value.length > 0) {
      var numero;
      if (this.pantallaSeleccionada == 'Agente')
        numero = this.agenteSeleccionado;
      else
        numero = this.planoDeCargaForm.get([list]).value[0].id;

      if (campo == 1)
        return this[list] != null ? this[list].find(x => x.id == numero).nombre.toString() : '';
      else
        return this[list] != null ? this[list].find(x => x.id == numero).apellido.toString() : '';
    }
    else
      return '';
  }

  ABM(pantalla, opcion) {
    this.pantallaSeleccionada = pantalla;
    this.opcionABMSeleccionada = opcion;
    this.tituloABM =
      (this.opcionABMSeleccionada == 'Agregar' ? 'Agregar nuevo registro ' : 'Editar ') +
      (this.pantallaSeleccionada == 'Estiba' ? 'Estiba' :
        this.pantallaSeleccionada == 'Agencia' ? 'Agencia de Control Privado' : 'Encargado');
    return this.modalService.open(this.modalABM);
  }

  abrirModalExportador() {
    return this.modalService.open(this.modalExportadorABM);
  }

  public descargarArchivo(tipo: string) {
    if (tipo == 'secuencia') {
      if (this.fileNameSecuencia == 'Ningun archivo elegido')
        return;
      var base64 = this.fileSecuencia;
      var imageName = this.fileNameSecuencia;
    }
    else {
      if (this.fileNamePlano == 'Ningun archivo elegido')
        return;
      var base64 = this.filePlano;
      var imageName = this.fileNamePlano;
    }
    const imageBlob = this.dataURItoBlob(base64);

    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(imageBlob, imageName);
    }
    // if (window.navigator.msSaveOrOpenBlob) {
    //   window.navigator.msSaveBlob(imageBlob, imageName);
    // }
    else {
      var elem = window.document.createElement('a');
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
    if (tipo == 'secuencia') {
      this.fileSecuencia = null;
      this.fileNameSecuencia = 'Ningun archivo elegido';
    }
    else {
      this.filePlano = null;
      this.fileNamePlano = 'Ningun archivo elegido';
    }
  }

  mostrarFumigadoraEvent(e, mostrar: boolean) {
    this.mostrarFumigadora = mostrar;
    this.planoDeCargaForm.get('empresaFumigadora').setValue("");
  }

  onSelectAgente(event) {
    this.agenteSeleccionado = event.id;
    this.ABM('Agente', 'Modificar-Eliminar');
  }

  calcularTotal() {
    const bodegas = this.planoDeCargaBodegasFormArray.value as PlanoDeCargaBodega[];
    const total = bodegas.reduce((prev, next) => prev + +next.cantidad, 0);
    if (this.esLiquido) {
      this._turnoService.setTnTotales(total)
    }
    this._procesoService.sendTotalPlanoDeEmbarque.emit(total)
    return total.toString().replace('.', ',');
  }

  //**CONTROL DE BOTONES DE LOS ABM***//
  submitABM(accion) {
    var condicion: string = this.pantallaSeleccionada
    switch (condicion) {
      case 'Estiba':
        var abm: Estiba = new Estiba('', '', '');
        var list = 'estibasList';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarEstiba' : accion == 'Guardar' ?
            'modificarEstiba' : 'eliminarEstiba';
        var obtener = 'obtenerListadoEstibas';
        var modelo = Estiba;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito una nueva Estiba' : accion == 'Guardar' ?
            'Ha modificado con éxito la Estiba' : 'Ha eliminado con éxito la Estiba';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de esta Estiba ya existen' :
          'Los datos de esta Estiba NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para la Estiba';
        var mensaje4 = 'No se puede eliminar la Estiba, ya que está asociada a un Plano de Carga';
        break;

      case 'Agencia':
        var abm2: AgenciaControlPrivado = new AgenciaControlPrivado('', '');
        var list = 'agenciasControlPrivadoList';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarAgenciaControlPrivado' : accion == 'Guardar' ?
            'modificarAgenciaControlPrivado' : 'eliminarAgenciaControlPrivado';
        var obtener = 'obtenerListadoAgenciasControlPrivado';
        var modelo2 = AgenciaControlPrivado;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito una nueva Agencia de Control Privado' : accion == 'Guardar' ?
            'Ha modificado con éxito la Agencia de Control Privado' : 'Ha eliminado con éxito la Agencia de Control Privado';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de esta Agencia de Control Privado ya existen' :
          'Los datos de esta Agencia de Control Privado NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para la Agencia de Control Privado';
        var mensaje4 = 'No se puede eliminar la Agencia de Control Privado, ya que está asociada a un Plano de Carga';
        break;

      case 'Agente':
        var abm: AgenteControlPrivado = new AgenteControlPrivado('', '', '');
        var list = 'agentesControlPrivadoList';
        var listDeSeleccionados = 'agentesControlPrivadoSeleccionado';
        var opcionABM = this.opcionABMSeleccionada == 'Agregar' ?
          'agregarAgenteControlPrivado' : accion == 'Guardar' ?
            'modificarAgenteControlPrivado' : 'eliminarAgenteControlPrivado';
        var obtener = 'obtenerListadoAgentesControlPrivado';
        var modelo = AgenteControlPrivado;
        var mensaje1 = this.opcionABMSeleccionada == 'Agregar' ?
          'Ha cargado con éxito una nuevo Encargado' : accion == 'Guardar' ?
            'Ha modificado con éxito el Encargado' : 'Ha eliminado con éxito el Encargado';
        var mensaje2 = accion == 'Guardar' ? 'Los datos de este Encargado ya existen' :
          'Los datos de este Encargado NO existen';
        var mensaje3 = 'Debe Inidcar un Nombre para el Encargado';
        var mensaje4 = 'No se puede eliminar el Encargado, ya que está asociado a un Plano de Carga';
        break;
    }

    //**Guardar de Agregar y Modificar***//
    if (accion == 'Guardar') {
      if (condicion != 'Agencia') {
        if (this.opcionABMSeleccionada == 'Modificar-Eliminar') {
          if (condicion != 'Agente')
            abm.id = this.planoDeCargaForm.get([list]).value[0].id;
          else
            abm.id = this.agenteSeleccionado;
        }

        abm.nombre = (<HTMLInputElement>document.getElementById("nombre")).value;
        abm.apellido = (<HTMLInputElement>document.getElementById("apellido")).value;
        if (condicion == 'Agente')
          abm.name = abm.nombre + ' ' + abm.apellido;
      }
      else {
        if (this.opcionABMSeleccionada == 'Modificar-Eliminar')
          abm2.id = this.planoDeCargaForm.get([list]).value[0].id;

        abm2.nombre = (<HTMLInputElement>document.getElementById("nombre")).value;
      }

      if ((condicion != 'Agencia' ? abm.nombre.replace(/\s/g, "").length : abm2.nombre.replace(/\s/g, "").length) > 0) {
        if (this.opcionABMSeleccionada == 'Agregar')
          var datosUnicos = this[list].find(x => (condicion != 'Agencia' ?
            x.nombre == abm.nombre && x.apellido == abm.apellido :
            x.nombre == abm2.nombre));
        else
          var datosUnicos = this[list].find(x => (condicion != 'Agencia' ?
            x.id != abm.id && x.nombre == abm.nombre && x.apellido == abm.apellido
            : x.id != abm2.id && x.nombre == abm2.nombre));

        if (typeof datosUnicos == 'undefined') {
          this.planoDeCargaService[opcionABM](condicion != 'Agencia' ? abm : abm2).subscribe(res => {
            this.modalService.dismissAll();

            if (this.opcionABMSeleccionada == 'Agregar') {
              if (condicion != 'Agente') {
                this.planoDeCargaService[obtener]().subscribe(res => {
                  this[list] = res.map(x =>
                    (condicion != 'Agencia' ? new modelo(x.id, x.nombre, x.apellido) : new modelo2(x.id, x.nombre)));
                });

                this.planoDeCargaService[obtener]().subscribe(res => {
                  this.planoDeCargaForm.get([list]).setValue(
                    res.filter(x => x.nombre == (condicion != 'Agencia' ? abm.nombre : abm2.nombre))
                      .map(x => (condicion != 'Agencia' ? new modelo(x.id, x.nombre, x.apellido) : new modelo2(x.id, x.nombre))));
                });
              }
              else { //esto es solo para los agentes, ya que es un input-tag múltiple
                this.planoDeCargaService[obtener]().subscribe(res => {
                  this[list] = res.map(x => new modelo(x.id, x.nombre, x.apellido));

                  var listado = [];
                  for (let index = 0; index < this.planoDeCargaForm.get([listDeSeleccionados]).value.length; index++) {
                    var vid = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].id;
                    var vnombre: string;
                    var vapellido: string;
                    if (vid == abm.id) {
                      vnombre = abm.nombre;
                      vapellido = abm.apellido;
                    }
                    else {
                      vnombre = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].nombre;
                      vapellido = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].apellido;
                    }

                    var datosAnteriores = {
                      id: vid,
                      nombre: vnombre,
                      apellido: vapellido,
                      name: vnombre + ' ' + vapellido
                    }
                    listado.push(datosAnteriores);
                  }

                  var datosUnicos = this[list].find(x => x.nombre == abm.nombre && x.apellido == abm.apellido);
                  vid = datosUnicos.id;
                  if (typeof datosUnicos != 'undefined') {
                    var datosNuevos = {
                      id: vid,
                      nombre: abm.nombre,
                      apellido: abm.apellido,
                      name: abm.nombre + ' ' + abm.apellido
                    }
                    listado.push(datosNuevos);
                  }

                  this.planoDeCargaForm.get([listDeSeleccionados]).setValue(listado);
                });
              }
            }
            else {
              if (condicion != 'Agente') {
                this.planoDeCargaService[obtener]().subscribe(res => {
                  this[list] = res.map(x => (condicion != 'Agencia' ?
                    new modelo(x.id, x.nombre, x.apellido) : new modelo2(x.id, x.nombre)));
                });

                this.planoDeCargaService[obtener]().subscribe(res => {
                  this.planoDeCargaForm.get([list]).setValue(
                    res.filter(x => x.id == (condicion != 'Agencia' ? abm.id : abm2.id))
                      .map(x => (condicion != 'Agencia' ? new modelo(x.id, x.nombre, x.apellido) : new modelo2(x.id, x.nombre))));
                });
              }
              else {//esto es solo para los agentes, ya que es un input-tag múltiple
                this.planoDeCargaService[obtener]().subscribe(res => {
                  this.agentesControlPrivadoList = res.map(x => new modelo(x.id, x.nombre, x.apellido));

                  var listado = [];
                  for (let index = 0; index < this.planoDeCargaForm.get([listDeSeleccionados]).value.length; index++) {
                    var vid = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].id;
                    var vnombre: string;
                    var vapellido: string;
                    if (vid == abm.id) {
                      vnombre = abm.nombre;
                      vapellido = abm.apellido;
                    }
                    else {
                      vnombre = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].nombre;
                      vapellido = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].apellido;
                    }

                    var datosAnteriores = {
                      id: vid,
                      nombre: vnombre,
                      apellido: vapellido,
                      name: vnombre + ' ' + vapellido
                    }
                    listado.push(datosAnteriores);
                  }

                  this.planoDeCargaForm.get([listDeSeleccionados]).setValue(listado);
                });
              }
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
      if (condicion != 'Agencia') {
        if (condicion == 'Agente')
          abm.id = this.agenteSeleccionado;
        else
          abm.id = this.planoDeCargaForm.get([list]).value[0].id;
        var datosUnicos = this[list].find(x => x.id != abm.id);
      }
      else {
        abm2.id = this.planoDeCargaForm.get([list]).value[0].id;
        var datosUnicos = this[list].find(x => x.id != abm2.id);
      }

      if (typeof datosUnicos != 'undefined') {
        this.planoDeCargaService[opcionABM](condicion != 'Agencia' ? abm.id : abm2.id).subscribe(res => {
          this.modalService.dismissAll();

          if (res) {
            this.planoDeCargaService[obtener]().subscribe(res => {
              this[list] = res.map(x => (condicion != 'Agencia' ?
                new modelo(x.id, x.nombre, x.apellido) :
                new modelo2(x.id, x.nombre)));

              if (condicion == 'Agente') {
                var listado = [];
                for (let index = 0; index < this.planoDeCargaForm.get([listDeSeleccionados]).value.length; index++) {
                  var vid = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].id;
                  var vnombre: string;
                  var vapellido: string;
                  if (vid != abm.id) {
                    vnombre = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].nombre;
                    vapellido = this.planoDeCargaForm.get([listDeSeleccionados]).value[index].apellido;

                    var datosAnteriores = {
                      id: vid,
                      nombre: vnombre,
                      apellido: vapellido,
                      name: vnombre + ' ' + vapellido
                    }
                    listado.push(datosAnteriores);
                  }
                }

                this.planoDeCargaForm.get([listDeSeleccionados]).setValue(listado);
              }
              else
                this.planoDeCargaForm.get([list]).setValue('');
            });

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

  public submitExportadorABM(nombre: string) {
    if (!nombre || !nombre.trim()) {
      // El nombre es nulo o vacío
      this.confirmationDialogService.confirm('¡Error!', 'Por favor complete el nombre', 'Cerrar', '', null, null, Tipoalerta.Success);
      return;
    }
    if (this.exportadores.some(exp => exp.nombre.toLowerCase() == nombre.toLowerCase())) {
      // Ya existe el exportador
      this.confirmationDialogService.confirm('¡Error!', 'Ya existe el exportador', 'Cerrar', '', null, null, Tipoalerta.Success);
      return;
    }
    const exportador: Exportador = new Exportador();
    exportador.nombre = nombre.toUpperCase();
    this.planoDeCargaService.agregarExportador(exportador).subscribe((res) => {
      this.modalService.dismissAll();
      this.planoDeCargaService.obtenerExportadores().subscribe(res => {
        this.exportadores = res;
      });
      this.confirmationDialogService.confirm('Guardado', 'El exportador fue creado con éxito');
    }, (err) => {
      this.confirmationDialogService.confirm('¡Error!', 'Ha ocurrido un error al guardar el exportador', 'Cerrar', '', null, null, Tipoalerta.Success);
      throw err;
    });
  }

  sendExportador(value: any, j: number) {
    if (this.cargasComercialesFormArray.controls[j]['controls'].exportador.value === undefined) {
      this.planoDeCargaForm.get('cargasComerciales')['controls'][j]['controls'].exportador.value = null;
      this.planoDeCargaForm.get('cargasComerciales').value[j].exportador = null;
      (<HTMLInputElement>document.getElementsByClassName("prueba22")[j]).value = '';
    }
    this.sendExportadores();

    this.verificarCargaComercial();
  }

  sendExportadores() {
    let exportadores: Exportador[] = []
    var arrCargasComerciales = (this.cargasComercialesFormArray as FormArray).value;
    arrCargasComerciales.forEach(cargaComercial => {
      if (cargaComercial.exportador != null) exportadores.push(cargaComercial.exportador);
    });

    this._turnoService.setExportadores(exportadores);
  }

  sendMaterialPuerto(value: any) {
    this.sendExportadores();
    this.verificarCargaComercial();
  }

  verificarCargaComercial() {
    let cant = 0;
    for (let i = 0; i < this.cargasComercialesFormArray.controls.length; i++) {
      if ((((this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === null ||
        this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === '') &&
        (this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value !== null ||
          this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value !== '')) ||
        ((this.cargasComercialesFormArray.controls[i]['controls'].exportador.value !== null ||
          this.cargasComercialesFormArray.controls[i]['controls'].exportador.value !== '') &&
          (this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === null ||
            this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === ''))) &&
        !((this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === null ||
          this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === '') &&
          (this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === null ||
            this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === ''))) {
        cant += 1;
      }
    }

    if (cant > 0)
      this.cargaComercialIncompleto = true;
    else
      this.cargaComercialIncompleto = false;
  }

  sendDataParcel() {
    const bodegas = this.planoDeCargaBodegasFormArray.getRawValue() as PlanoDeCargaBodega[];
    let bodegasFull = bodegas.filter(b => b.cantidad > 0 || b.condicion || b.destino || b.materialPuerto || b.tanqueDeAbordo);
    console.log('bodegasFull-->>')
    console.log(bodegasFull);
    this._turnoService.sendBodega.emit(bodegasFull);
  }

  hasPermisoAdjuntar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Adjuntar);
  }
  hasPermisoPlanoDeCarga_AMB() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_AMB);
  }
  hasPermisoPlanoDeCarga_Bodegas_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Bodegas_Modificar);
  }
  hasPermisoPlanoDeCarga_CargasComerciales_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_CargasComerciales_Modificar);
  }
  hasPermisoPlanoDeCarga_DefensasMoviles_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_DefensasMoviles_Modificar);
  }
  hasPermisoPlanoDeCarga_Fumigacion_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Fumigacion_Modificar);
  }
  hasPermisoPlanoDeCarga_Estiba_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Estiba_Modificar);
  }
  hasPermisoPlanoDeCarga_AgenciaControlPrivado_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_AgenciaControlPrivado_Modificar);
  }
  hasPermisoPlanoDeCarga_AgentesControlPrivado_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_AgentesControlPrivado_Modificar);
  }
  hasPermisoPlanoDeCarga_Observaciones_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Observaciones_Modificar);
  }
  hasPermisoPlanoDeCarga_CaladoSalida_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_CaladoSalida_Modificar);
  }

  controlarPermisos() {
    if (!this.hasPermisoPlanoDeCarga_Bodegas_Modificar()) {
      if (this.esLiquido) {
        this.planoDeCargaBodegasFormArray.disable();
      } else {
        this.planoDeCargaForm.get('planoDeCargaBodegas').disable();
      }
    }

    if (!this.hasPermisoPlanoDeCarga_CargasComerciales_Modificar())
      this.planoDeCargaForm.get('cargasComerciales').disable();

    if (!this.hasPermisoPlanoDeCarga_DefensasMoviles_Modificar())
      this.planoDeCargaForm.get('defensasMoviles').disable();

    if (!this.hasPermisoPlanoDeCarga_Fumigacion_Modificar()) {
      this.planoDeCargaForm.get('fumigacion').disable();
      this.planoDeCargaForm.get('empresaFumigadora').disable();
    }
    // TODO: INI - no están impactando
    if (!this.hasPermisoPlanoDeCarga_Estiba_Modificar()) {
      this.planoDeCargaForm.get('estiba').disable();
      this.planoDeCargaForm.get('estibasList').disable();
    }
    if (!this.hasPermisoPlanoDeCarga_AgenciaControlPrivado_Modificar()) {
      this.planoDeCargaForm.get('agenciaControlPrivado').disable();
      this.planoDeCargaForm.get('agenciasControlPrivadoList').disable();
    }
    if (!this.hasPermisoPlanoDeCarga_AgentesControlPrivado_Modificar()) {
      this.planoDeCargaForm.get('agentesControlPrivadoSeleccionado').disable();
      this.planoDeCargaForm.get('agentesControlPrivadoList').disable();
    }
    // FIN - no están impactando
    if (!this.hasPermisoPlanoDeCarga_Observaciones_Modificar()) {
      this.planoDeCargaForm.get('observaciones').disable();
    }
    if (!this.hasPermisoPlanoDeCarga_CaladoSalida_Modificar()) {
      this.planoDeCargaForm.get('caladoSalida').disable();
    }
  }

  public setConfigListaMultiple() {
    this.dropdownSettings = {
      singleSelection: false,
      primaryKey: 'id',
      textField: 'nombre',
      enableSearchFilter: true,
      showSelectedItemsAtTop: false
    };
  }

  public getConfigListaMultiple() {
    return this.dropdownSettings;
  }

}
