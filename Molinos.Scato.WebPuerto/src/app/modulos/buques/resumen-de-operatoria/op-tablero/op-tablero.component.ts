import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
import { AgenciaControlPrivado } from '@ScatoModels/agencia-control-privado';
import { AgenteControlPrivado } from '@ScatoModels/agente-control-privado';
import { Alerta } from '@ScatoModels/alerta';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { Destino } from '@ScatoModels/destino';
import { ElementoGrafico } from '@ScatoModels/elemento-grafico';
import { Embarque } from '@ScatoModels/embarque';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { EstadoPuerto } from '@ScatoModels/estado-puerto';
import { Estiba } from '@ScatoModels/estiba';
import { Exportador } from '@ScatoModels/exportador';
import { Mail } from '@ScatoModels/mail';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { SentidoManoDeEmbarque } from '@ScatoModels/sentido-mano-embarque';
import { AlertService } from '@ScatoServicios/alert.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { LineupService } from '@ScatoServicios/lineup.service';
import { ManosEmbarqueService } from '@ScatoServicios/manosEmbarque.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProcesoGuardarService } from '@ScatoServicios/procesoGuardar.service';
import { SessionService } from '@ScatoServicios/session.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, pairwise, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-op-tablero',
  templateUrl: './op-tablero.component.html',
  styleUrls: ['./op-tablero.component.css']
})
export class OpTableroComponent implements AfterViewInit,OnInit {
  
  estadoAlturaValor: number;
  embarqueSelected: EmbarqueNav;
  @Output() showCargas = new EventEmitter<boolean>();
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild('modalEditarAgenteControlPrivado') modalEditarAgenteControlPrivado: TemplateRef<any>;
  @ViewChild('modalABM') modalABM: TemplateRef<any>;
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

  private user: Usuario
  @Input() sentidosManoDeEmbarque: SentidoManoDeEmbarque[];
  @Input() celdasManoDeEmbarque: CeldaManoDeEmbarque[];
  manosYTabiquesForm: FormGroup;
  formInitialValues: any;

  datosEmbarque: any;
  productos: MaterialPuerto[] = [];
  toggleColor: boolean = true;
  toggleForma: string = 'rect';
  materialSeleccionado: any = null;
  hoy = new Date();
  tempDictionary: object = {};
  materialDictionary: object = {};
  lastSelectedElement: any = null;
  rotacionCheckbox: boolean = false;
  nombreTablerista:string='';
  calculoTotal:Number=0;
  constructor(private formBuilder: FormBuilder,private _procesoService: DatosEmbarquesProcesoService,
              private _manosEmbarqueService: ManosEmbarqueService, private moduloCargaService: ModuloDeCargaService,private manosEmbarqueService: ManosEmbarqueService , private lineupService: LineupService,
              private embarqueService: EmbarqueService,
              private planoDeCargaService: PlanoDeCargaService,
              private router: Router,
              private confirmationDialogService: ConfirmationDialogService,
              private modalService: NgbModal,
              private alertService: AlertService,
              private _guardarService: ProcesoGuardarService,
              private _turnoService: TurnosService,
              private session: SessionService) { 
    this.makeDraggable.bind(this);
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.initEventosManos();
    this.confirmationDialogService = confirmationDialogService;
    this.productos = this.datosEmbarque?.listaMateriales;
    this.user = this.session.getUser();
    this._guardarService.sendGuardar.subscribe(
      res => this.guardarPlanoDeCargaContinuacion(res[0], res[1])
    )
    this._procesoService.sendEstadoAltura.subscribe(
      res => {
        this.estadoAlturaValor = res;
        this.calcularRecomendacionDefensas();
      }
    )
    this.state = this.router.url.replace('/', '');
    this.inicializarFormulario();
  }
  ngOnInit(): void {
    this.getEmbarqueData();
    this.drawGraphic();
    this.initFormulario();
    
    //Aqui se pondra el nombre de actor o tablerista obteniendo desde el api
    this.nombreTablerista="";
    this.manosYTabiquesForm.get('manosDeEmbarque')['controls'].forEach((mano, currentIndexMano) => {
      mano.controls.moduloDeCargaManosDeEmbarqueDetalle.controls.forEach((datoCelda, currentIndexDatoCelda) => {
        datoCelda.controls['celdaManoDeEmbarque'].valueChanges.pipe(startWith(null as object), pairwise())
          .subscribe(([previous, current]) => {
            // console.log(`mano ${mano} - currentIndexMano ${currentIndexMano}`);
            // console.log(`datoCelda ${datoCelda} - currentIndexDatoCelda ${currentIndexDatoCelda}`);
            if (previous && datoCelda.controls['sentidoManoDeEmbarque'].value) {
              this.manosEmbarqueService.removerManoDeEmbarque.emit({celda: previous.nombre, sentido: datoCelda.controls['sentidoManoDeEmbarque'].value.posicion});
            }
            if(previous) {
              if(previous.posicion==5 || previous.posicion==6){
                let cantidadSiloPrevious = this.buscarSilosRestantes(previous.posicion);
                if(cantidadSiloPrevious==0){
                  this.manosEmbarqueService.removerResaltadoSilos.emit({posicion: previous.posicion});
                }
              }
            }
            if (current) {
              // VERIFICAR SI EXISTE SILO 31 O 32. SI EXISTE NO PERMITIR MODIFICACION
              if(current.posicion==5 || current.posicion==6){
                let cantidadSiloCurrent = this.buscarSilosRestantes(current.posicion);
                if(cantidadSiloCurrent>1){

                  let texto = "Ya existe el Silo seleccionado";
                  this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success)
                    .then((confirmed) => {
                      if (confirmed) { } else return;
                    }).catch(() => window.location.reload());

                  // console.log(`Ya existe el Silo${current.posicion} - Ocurrencias: ${cantidadSiloCurrent}`);
                  datoCelda.controls['celdaManoDeEmbarque'].setValue(null, { emitEvent: false });
                  datoCelda.controls['sentidoManoDeEmbarque'].disable({ emitEvent: false });
                  datoCelda.controls['sentidoManoDeEmbarque'].setValue(null, { emitEvent: false });
                }else{
                  datoCelda.controls['sentidoManoDeEmbarque'].enable({ emitEvent: false });
                  datoCelda.controls['sentidoManoDeEmbarque'].setValue(null, { emitEvent: false });
                }
              } else {
                datoCelda.controls['sentidoManoDeEmbarque'].enable({ emitEvent: false });
                datoCelda.controls['sentidoManoDeEmbarque'].setValue(null, { emitEvent: false });
              }
              // this.manosEmbarqueService.resaltarSilo.emit(datoCelda.controls['celdaManoDeEmbarque'].value.posicion);
            } else {
              datoCelda.controls['sentidoManoDeEmbarque'].disable({ emitEvent: false });
              datoCelda.controls['sentidoManoDeEmbarque'].setValue(null, { emitEvent: false });
            }
            if (current?.posicion) {
              this.validarSentidos(currentIndexMano, currentIndexDatoCelda, current?.posicion);
              if ([11, 12, 13].includes(current?.posicion)) {
                datoCelda.controls['materialPuerto'].disable({ emitEvent: false });
                datoCelda.controls['porcentajePorMano'].disable({ emitEvent: false });
                datoCelda.controls['aperturaPorton'].disable({ emitEvent: false });
                datoCelda.controls['masProduccion'].disable({ emitEvent: false });
              } else {
                datoCelda.controls['materialPuerto'].enable({ emitEvent: false });
                datoCelda.controls['porcentajePorMano'].enable({ emitEvent: false });
                datoCelda.controls['aperturaPorton'].enable({ emitEvent: false });
                datoCelda.controls['masProduccion'].enable({ emitEvent: false });
              }
            }
          });
        datoCelda.controls['sentidoManoDeEmbarque'].valueChanges.pipe(startWith(null as object), pairwise())
          .subscribe(([previous, current]) => {
            if (datoCelda.controls['celdaManoDeEmbarque'].value) {
              if (previous) {
                this.manosEmbarqueService.removerManoDeEmbarque.emit({celda: datoCelda.controls['celdaManoDeEmbarque'].value.nombre, sentido: previous.posicion});
                this.manosEmbarqueService.removerResaltadoSilos.emit({posicion: datoCelda.controls['celdaManoDeEmbarque'].value.posicion});
              }
              // this.manosEmbarqueService.removerResaltadoSilos.emit();
              // // this.manosEmbarqueService.removerManoDeEmbarque.emit(datoCelda.controls['celdaManoDeEmbarque'].value.nombre);
              if (current){
                if(datoCelda.controls['celdaManoDeEmbarque'].value.nombre.includes('Silo')){
                  this.manosEmbarqueService.resaltarSilo.emit(datoCelda.controls['celdaManoDeEmbarque'].value.posicion);
                }
                this.manosEmbarqueService.agregarManoDeEmbarque.emit({celda: datoCelda.controls['celdaManoDeEmbarque'].value.nombre, sentido: current.posicion });
              } else {
                this.manosEmbarqueService.removerResaltadoSilos.emit({posicion: datoCelda.controls['celdaManoDeEmbarque'].value.posicion});
              }
            }
          });
      });
    });

    this.manosYTabiquesForm.get('tabiques')['controls'].forEach((tabique, index) => {
      tabique.controls['entreColumna'].valueChanges
        .subscribe((current) => {
          let tabiqueVal = tabique.controls['tabique'].value;
          let columnaTemp
          
          if (current < 0 || current > 0) {
            if(Number(current)  > 28 && index == 0){
              tabique.patchValue({ entreColumna: 28, yColumna: 29 });
              columnaTemp = 28;
            } else if(Number(current)  > 11 && index == 1){
              tabique.patchValue({ entreColumna: 11, yColumna: 12 });
              columnaTemp = 11;
            }else if(Number(current)  < 1 && current !== null && current !== undefined){
              tabique.patchValue({ entreColumna: 1, yColumna: 2 });
              columnaTemp = 1;
            } else {
              tabique.patchValue({ yColumna: Number(current) + 1 });
            }
          } else {
            this.manosEmbarqueService.removerTabique.emit(tabiqueVal);
            tabique.patchValue({ yColumna: '' });
          }

          let yColumna = tabique.controls['yColumna'].value;
          if (current && tabique && yColumna) {
            this.manosEmbarqueService.agregarTabique.emit({celda: tabiqueVal, tabiqueDesde: columnaTemp ?? current, tabiqueHasta: yColumna });
          }
        });
    });
  }
 

  buscarSilosRestantes(posicion: number): number{
    let cantSilosRestantes = 0;
    for(let mano in this.manosYTabiquesForm.get('manosDeEmbarque')['controls']){
      let manoForm = this.manosYTabiquesForm.get('manosDeEmbarque')['controls'][mano];
      for(let detalleMano in manoForm['controls']['moduloDeCargaManosDeEmbarqueDetalle']['controls']){
        let detalleManoForm = manoForm['controls']['moduloDeCargaManosDeEmbarqueDetalle']['controls'][detalleMano];
        if(detalleManoForm['controls']['celdaManoDeEmbarque']['value']){
          if(detalleManoForm['controls']['celdaManoDeEmbarque']['value'].posicion == posicion){
            cantSilosRestantes += 1;
          }
        }
      }
    }
    return cantSilosRestantes;
  }

  initFormulario() {
    this.manosYTabiquesForm = this.formBuilder.group({
      manosDeEmbarque: this.formBuilder.array([this.initManoDeEmbarque(1), this.initManoDeEmbarque(2)]),
      tabiques: this.formBuilder.array([this.initTabique(20), this.initTabique(7)])
    });
    this.formInitialValues = this.manosYTabiquesForm.getRawValue();
  }

  initManoDeEmbarque(numeroMano) {
    return this.formBuilder.group({
      id: '',
      mano: [{ value: numeroMano, disabled: true }],
      moduloDeCargaManosDeEmbarqueDetalle: this.formBuilder.array([this.initDatosCeldas(), this.initDatosCeldas(), this.initDatosCeldas(), this.initDatosCeldas(), this.initDatosCeldas(), this.initDatosCeldas()]),
      observaciones: [{ value: numeroMano, disabled: true }]
    });
  }

  initDatosCeldas() {
    return this.formBuilder.group({
      id:  [{ value: '', disabled: true }],
      celdaManoDeEmbarque:  [{ value: '', disabled: true }],
      sentidoManoDeEmbarque: [{ value: null, disabled: true }],//this.formBuilder.group({id:'',nombre:''})
      porcentajePorMano:  [{ value: '', disabled: true }],
      aperturaPorton:  [{ value: '', disabled: true }],
      masProduccion:  [{ value: '', disabled: true }],
      materialPuerto:  [{ value: '', disabled: true }]
    });
  }

  initTabique(numeroTabique) {
    return this.formBuilder.group({
      id: '',
      tabique: [{ value: numeroTabique, disabled: true }],
      entreColumna: [{ value: '', disabled: true }],
      yColumna: [{ value: '', disabled: true }]
    });
  }

  validarSentidos(indexMano, indexDatoCelda, celdaId) {
    let sentidoAMostrar = document.querySelectorAll('[class*="sentido' + indexMano + '-' + indexDatoCelda + '"]');
    for (let sentido of sentidoAMostrar) sentido.classList.remove("hideSentido");
    let validacionSentidos = {
      '1': [1, 2, 3, 4, 9, 11],
      '2': [5, 6, 7, 8, 9, 11],
      '3': [5, 6, 7, 8, 9],
      '4': [5, 6, 7, 8, 9],
      '5': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '6': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '7': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '8': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '9': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '10': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '11': [1, 2, 3, 4, 5, 6, 7, 8, 9],
      '12': [1, 2, 3, 4, 5, 6, 7, 8, 9],
      '13': [1, 2, 3, 4, 5, 6, 7, 8, 9],
      '14': [1, 2, 3, 4, 5, 6, 7, 8, 10],
      '15': [1, 2, 3, 4, 5, 6, 7, 8, 10]
    }
    for (let elemento of validacionSentidos[celdaId]) {
      let sentidoAOcultar = document.querySelector(`.sentido${indexMano}-${indexDatoCelda}-${elemento}`);
      sentidoAOcultar.classList.add('hideSentido');
    }
  }

  compareMateriales(c1: MaterialPuerto, c2: MaterialPuerto) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareCeldas(c1: CeldaManoDeEmbarque, c2: CeldaManoDeEmbarque) {
    return c1 && c2 ? c1.posicion === c2.posicion : c1 === c2;
  }

  compareSentidos(c1: SentidoManoDeEmbarque, c2: SentidoManoDeEmbarque) {
    return c1 && c2 ? c1.posicion === c2.posicion : c1 === c2;
  }
  
  resetForm(){
    this.manosYTabiquesForm.reset(this.formInitialValues);
  }

  obtenerManosDeEmbarque(){
    return this.manosYTabiquesForm.getRawValue().manosDeEmbarque;
  }

  obtenerTabiques(){
    return this.manosYTabiquesForm.getRawValue().tabiques;
  }

  patchManosDeEmbarque(manos){
    this.manosYTabiquesForm.get('manosDeEmbarque').patchValue(manos);
  }

  patchTabiques(tabiques){
    this.manosYTabiquesForm.get('tabiques').patchValue(tabiques);
  }


  drawGraphic() {
    forkJoin([
      this.moduloCargaService.obtenerListadoSentidoManoDeEmbarque(),
      this.moduloCargaService.obtenerListadoCeldaManoDeEmbarque()
    ]).subscribe(([res1, res2]) => {
      this.sentidosManoDeEmbarque = res1;
      this.celdasManoDeEmbarque = res2;
    })
  }
  ngAfterViewInit(){
    this.makeDraggable(document.getElementById('grafico-carga'));
  }
 
  initEventosManos(){
    this._manosEmbarqueService.removerManoDeEmbarque.subscribe(
      res => this.removerManoDeEmbarque(res.celda, res.sentido)
    );
    this._manosEmbarqueService.removerResaltadoSilos.subscribe(
      res => this.removerResaltadoSilos(res.posicion, res.esPrevious, res.cantidadEnSilo)
    );
    this._manosEmbarqueService.resaltarSilo.subscribe(
      res => this.resaltarSilo(res)
    );
    this._manosEmbarqueService.agregarManoDeEmbarque.subscribe(
      res => this.agregarManoDeEmbarque(res.celda, res.sentido)
    );
    this._manosEmbarqueService.agregarTabique.subscribe(
      res => this.agregarTabique(res.celda, res.tabiqueDesde, res.tabiqueHasta)
    );
    this._manosEmbarqueService.removerTabique.subscribe(
      res => this.removerTabique(res)
    );
  }
  

  makeDraggable(evt) {
    var svg: any = evt;
    var thisComponent = this;
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);

    svg.addEventListener('contextmenu', agregarElementoGrafico, false);

    //Eventos para mobile
    svg.addEventListener('touchstart', startDrag);
    svg.addEventListener('touchmove', drag);
    svg.addEventListener('touchend', endDrag);
    svg.addEventListener('touchleave', endDrag);
    svg.addEventListener('touchcancel', endDrag);

    var selectedElement, offset, transform, minX, maxX, minY, maxY, lastdx = 0, lastdy = 0;
    var tempIdCounter = 1;

    var lastResizeValues = {};
    function startDrag(evt) {
      if (evt.target.classList.contains('draggable')) {
        selectedElement = evt.target;
        initialiseDragging(evt);
      }else if (evt.target.classList.contains('resize-drag')) {
        selectedElement = evt.target;
        initialiseDragging(evt);
      }
      else if (evt.target.parentNode.classList.contains('draggable-group')) {
        selectedElement = evt.target.parentNode;
        initialiseDragging(evt);
      }
    }
    function initialiseDragging(evt){
      offset = getMousePosition(evt);

      //Set boundaries
      var bbox = selectedElement.getBBox();
      let svgViewBox = svg.viewBox.baseVal;
      minX = svgViewBox.x - bbox.x;
      maxX = svgViewBox.width - bbox.x - bbox.width;
      minY = svgViewBox.y - bbox.y;
      maxY = svgViewBox.height - bbox.y - bbox.height;
      // Get all the transforms currently on this element
      var transforms = selectedElement.transform.baseVal;
      // Ensure the first transform is a translate transform
      if (transforms.length === 0 ||
          transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
        // Create an transform that translates by (0, 0)
        var translate = svg.createSVGTransform();
        translate.setTranslate(0, 0);
        // Add the translation to the front of the transforms list
        selectedElement.transform.baseVal.insertItemBefore(translate, 0);
      }
      // Get initial translation amount
      transform = transforms.getItem(0);
      offset.x -= transform.matrix.e;
      offset.y -= transform.matrix.f;
    }
    function drag(evt) {
      if (selectedElement) {
        evt.preventDefault();
        var coord = getMousePosition(evt);
        var dx = coord.x - offset.x;
        var dy = coord.y - offset.y;

        if (dx < minX) { dx = minX; }
        else if (dx > maxX) { dx = maxX; }
        if (dy < minY) { dy = minY; }
        else if (dy > maxY) { dy = maxY; }

        transform.setTranslate(dx, dy);
        //transform.setRotate(45, );
        if(evt.target.classList.contains('resize-drag')){
          let containerElement = evt.target.parentNode.children[0];
          let isResized = containerElement.classList.contains('resized');

           if(isResized && lastdx == 0 && lastdy == 0){
            let key = containerElement.classList[containerElement.classList.length - 1];
            let lastResize = lastResizeValues[key];
            lastdx = lastResize.dx;
            lastdy = lastResize.dy;
          }
          
          if(containerElement.tagName == "ellipse"){
            // let radiusChange = dx+dy > lastdx+lastdy ? 1.5 : -1.5;
            let radiusXChange = Number(containerElement.getAttribute('rx')) - lastdx + 20;
            containerElement.setAttribute('rx', radiusXChange + dx - 20);
            let radiusYChange = Number(containerElement.getAttribute('ry')) - lastdy + 20;
            containerElement.setAttribute('ry', radiusYChange + dy - 20);
          } else if(containerElement.tagName == "rect"){
            let initialWidth = Number(containerElement.getAttribute('width')) - lastdx + 20;
            let initialHeight = Number(containerElement.getAttribute('height')) - lastdy + 20;
            containerElement.setAttribute('width', initialWidth + dx - 20);
            containerElement.setAttribute('height', initialHeight + dy - 20);
          }
          if(!isResized){
            containerElement.classList.add('resized');
            containerElement.classList.add('resize'+Object.keys(lastResizeValues).length);
            lastResizeValues['resize'+Object.keys(lastResizeValues).length] = {dx: dx, dy: dy};
          } else if(isResized){
            let key = containerElement.classList[containerElement.classList.length - 1];
            lastResizeValues[key] = {dx: dx, dy: dy};
          }
          lastdx = dx;
          lastdy = dy;
        }
      }
    }
    function endDrag(evt) {
      selectedElement = null;
      lastdx = 0;
      lastdy = 0;
    }
    function getMousePosition(evt) {
      var CTM = svg.getScreenCTM();
      if (evt.touches) { evt = evt.touches[0]; }
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
      };
    }

    function agregarElementoGrafico(evt){
      evt.preventDefault();
      let mousePos = getMousePosition(evt);
      if(thisComponent.materialSeleccionado){
        let tempId = tempIdCounter;
        tempIdCounter++;
        if(thisComponent.toggleForma == 'ellipse'){
          thisComponent.agregarCirculo(mousePos, thisComponent.materialSeleccionado?.color, thisComponent.toggleColor ? "Color" : "Prod.", tempId);
        } else if(thisComponent.toggleForma == 'rect'){
          mousePos.x = (mousePos.x - 100) > 0 ? (mousePos.x - 100) : 0;
          mousePos.y = (mousePos.y - 75) > 0 ? (mousePos.y - 75) : 0;
          thisComponent.agregarRectangulo(mousePos, thisComponent.materialSeleccionado?.color, tempId);
        }
        thisComponent.tempDictionary[tempId] = thisComponent.materialSeleccionado;
      }
    }
    // function checkIfInsideRects(){
    //   let rectCoords = [];

    //   for (let coord of rectCoords){
    //     if(isInsideCoord) return coord;
    //   }
    //   return false;
    // }
  }

  agregarTabique(celda: number, tabiqueDesde: number, tabiqueHasta: number){
    if(celda && tabiqueDesde && tabiqueHasta){
      this.removerTabique(celda);

      let tabique = document.getElementById(`celda${celda}-T${tabiqueDesde}-${tabiqueHasta}`);
      if(tabique) tabique.classList.add("tabique");
    }
  }

  removerTabique(celda: number){
    let tabiqueAnterior = document.querySelector(`.tabique[id^="celda${celda}-"]`);​
    if(tabiqueAnterior) tabiqueAnterior.classList.remove("tabique");
  }

  removerManoDeEmbarque(celda, sentido){
    if(!isNaN(celda)){
      let flechaAnterior = document.querySelector('#arrowCelda'+celda+'-'+sentido);​
      if(flechaAnterior) flechaAnterior.remove();
    }
  }

  agregarManoDeEmbarque(celda: number, sentido: number){
    if(celda && sentido && !isNaN(celda)){
      let grupoCelda = document.querySelector('#gc' + celda);

      if(grupoCelda){
        //Guia de sentidos
        //1 == Norte a sur
        //2 == Sur a norte
        //3 == Centro a sur
        //4 == Centro a norte
        //5 == Oeste a este
        //6 == Este a oeste
        //7 == Centro a este
        //8 == Centro a Oeste
        let coordenadasPorCeldaYSentido = {
          '7': {
            '5': {'x':48, 'y':15, 'z': 270},
            '6': {'x':48, 'y':340, 'z': 90},
            '7': {'x':33, 'y':170, 'z': 270},
            '8': {'x':61, 'y':170, 'z': 90}
          },
          '20': {
            '1': {'x':860, 'y':555, 'z': 0},
            '2': {'x':465, 'y':555, 'z': 180},
            '3': {'x':670, 'y':540, 'z': 0},
            '4': {'x':670, 'y':570, 'z': 180}
          },
          '23': {
            '1': {'x':390, 'y':109, 'z': 0},
            '2': {'x':-5, 'y':109, 'z': 180},
            '3': {'x':195, 'y':94, 'z': 0},
            '4': {'x':195, 'y':124, 'z': 180}
          },
          '30': {
            '1': {'x':300, 'y':109, 'z': 0},
            '2': {'x':-5, 'y':109, 'z': 180},
            '3': {'x':150, 'y':94, 'z': 0},
            '4': {'x':150, 'y':124, 'z': 180}
          },
        }

        let arrowTemplate = 
        `
          <g id="arrowCelda${celda}-${sentido}" transform="translate(${coordenadasPorCeldaYSentido[celda][sentido].x} ${coordenadasPorCeldaYSentido[celda][sentido].y}) rotate(${coordenadasPorCeldaYSentido[celda][sentido].z},33,16)">
            <use xlink:href="#myArrow"></use>
          </g>
        `;
        grupoCelda.insertAdjacentHTML('beforeend',arrowTemplate);
      }
    }
  }

  agregarElementosGraficos(elementos: ElementoGrafico[]){
    for(let elemento of elementos){
      let coordenadas = {x: elemento.x, y: elemento.y};
      this.materialDictionary[elemento.id] = elemento.materialPuerto;
      if(elemento.forma == 'ellipse'){
        this.agregarCirculo(coordenadas, elemento.materialPuerto?.color ?? '#D87621', elemento.tipo == "Prod." ? "Prod." : "Color",null , elemento.radioX, elemento.radioY, elemento.id);
      } else if(elemento.forma == 'rect'){
        this.agregarRectangulo(coordenadas, elemento.materialPuerto?.color ?? '#D87621',null, elemento.width, elemento.height, elemento.rotacion, elemento.id);
      }
    } 
  }

  agregarCirculo(mousePos, color, texto, tempId = null, radioX = null, radioY = null, id = null){
    let template = `
    <g id="${id ?? ''}" tempid="${tempId ?? ''}" class="draggable-group elementoGrafico" style="cursor: move;">
      <ellipse cx="${mousePos.x}" cy="${mousePos.y}" rx="${radioX ?? (texto == "Prod." ? 28 : 40)}" ry="${radioY ?? (texto == "Prod." ? 16 : 40)}" fill='${color}' opacity= "${texto == "Prod." ? 0.85: 0.95}"  ${texto == "Prod." ? `stroke="black" stroke-width="2"`:""} />
      <text x="${mousePos.x}" y="${mousePos.y}" 
      text-anchor="middle"
      fill="${color == '#555555' ? 'white' : 'black'}"
      alignment-baseline="middle"
      style="-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"
      >${texto}</text>
      ${texto != "Prod." ? 
      `<circle class="resize-drag" cx="${mousePos.x + 50}" cy="${mousePos.y + 50}" r="5" fill='gray' style="cursor: pointer; visibility: hidden"/>`
      : ""}
    </g>
    `;
    this.agregarTemplateElemento(template, texto);
  }

  agregarRectangulo(mousePos, color = null, tempId = null, width = null, height = null, rotacion = false, id = null){
    let template = `
    <g id="${id ?? ''}" tempid="${tempId ?? ''}" class="draggable-group elementoGrafico" style="cursor: move;" ${rotacion ? `transform="translate(0 0) rotate(120 ${mousePos.x + width/2} ${mousePos.y + height/2})"`: ""}>
      <rect x="${mousePos.x}" y="${mousePos.y}" width="${width ?? 200}" height="${height ?? 150}" fill='${color ?? "#D87621"}' opacity= "0.85" rx="15" ry="15"/>
      <circle class="resize-drag" cx="${mousePos.x + 210}" cy="${mousePos.y + 160}" r="5" fill='gray' style="cursor: pointer; visibility: hidden"/>
    </g>
    `;
    this.agregarTemplateElemento(template);
  }

  agregarTemplateElemento(template, tipo = null){
    let svg = tipo != "Prod." ? document.getElementById('elementosGraficos') : document.getElementById('elementosGraficosProd');

    svg.insertAdjacentHTML('beforeend',template);
    svg.lastElementChild.addEventListener('dblclick', function(evt){
      if(thisComponent.lastSelectedElement.getAttribute('tempid') == (<HTMLElement>evt.target).getAttribute('tempid')
        || thisComponent.lastSelectedElement.id == (<HTMLElement>evt.target).id){
        thisComponent.lastSelectedElement = null;
      } 
      this.remove();
    });
    let thisComponent = this;
    svg.lastElementChild.addEventListener('mousedown', function(evt){
      let list = document.querySelectorAll(".resize-drag");
      thisComponent.lastSelectedElement = (<HTMLElement>evt.target).parentElement;
      thisComponent.rotacionCheckbox = (<HTMLElement>evt.target).parentElement.getAttribute("transform")?.includes('rotate');
      if(!thisComponent.rotacionCheckbox){
        for (var i = 0; i < list.length; ++i) {
          (<HTMLElement>list[i]).style.visibility = "visible";
        }
      }
    });
    svg.lastElementChild.addEventListener('blur', function(evt){
      let list = document.querySelectorAll(".resize-drag");
      for (var i = 0; i < list.length; ++i) {
        (<HTMLElement>list[i]).style.visibility = "hidden";
      }
    });
  }

  rotacionLastSelected(){
    if(this.lastSelectedElement){
      let gContainer = this.lastSelectedElement;
      let transforms = gContainer.transform.baseVal;
      if(this.rotacionCheckbox){
        let rect = gContainer.children[0];
        if(rect.tagName == 'rect'){
          // let coordTransform = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(gContainer.getAttribute('transform'));
          let svg: any = document.getElementById('grafico-carga');
          let width = rect.getAttribute('width');
          let height = rect.getAttribute('height');
          let x = Number(rect.getAttribute('x'));
          let y = Number(rect.getAttribute('y'));

          let cx = x + width/2;
          let cy = y + height/2;

          let rotate = svg.createSVGTransform();
          rotate.setRotate(300, cx, cy);

          if (transforms.length == 1 && transforms.getItem(transforms.length - 1).type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
            transforms.appendItem(rotate);
          }else if (transforms.length > 0 && transforms.getItem(transforms.length - 1).type == SVGTransform.SVG_TRANSFORM_ROTATE){
            transforms.replaceItem(rotate, transforms.length - 1);
          }
        }
      } else {
        if(transforms.getItem(transforms.length - 1).type == SVGTransform.SVG_TRANSFORM_ROTATE){
          transforms.removeItem(transforms.length - 1);
        }
      }
    }
  }

  obtenerElementosGraficos() : ElementoGrafico[]{
    let elementos: ElementoGrafico[] = [];
    
    for(let item of document.querySelectorAll('.elementoGrafico')){
      let id = item.id ? item.id : null;
      let coordTransform = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(item.getAttribute('transform'));
      let forma = item.children[0].tagName;

      let tipo = forma == 'ellipse' ? item.children[1].innerHTML : item.children[0].classList[0];

      let width = forma == 'rect' ? item.children[0].getAttribute('width') : null;
      let height = forma == 'rect' ? item.children[0].getAttribute('height') : null;
      let radioX = forma == 'ellipse' ? item.children[0].getAttribute('rx') : null;
      let radioY = forma == 'ellipse' ? item.children[0].getAttribute('ry') : null;

      let formaX = forma == 'ellipse' ? item.children[1].getAttribute('x') : item.children[0].getAttribute('x');
      let formaY = forma == 'ellipse' ? item.children[1].getAttribute('y') : item.children[0].getAttribute('y');
      let x = coordTransform ? Number(formaX) + Number(coordTransform[1]) : Number(formaX);
      let y = coordTransform ? Number(formaY) + Number(coordTransform[2]) : Number(formaY);

      let rotacion = !!item.getAttribute('transform')?.includes('rotate');

      let materialPuerto;
      if(!id){
        let tempId = item.getAttribute('tempid');
        materialPuerto = this.tempDictionary[tempId];
      } else{
        materialPuerto = this.materialDictionary[id];
      }
      
      let elementoGrafico = new ElementoGrafico(id, tipo, x, y, forma, width, height, radioX, radioY, materialPuerto, rotacion);
      elementos.push(elementoGrafico);
    }

    return elementos;
  }

  limpiarGraficoCarga(){
    for(let item of document.querySelectorAll('.elementoGrafico')){
      item.remove();
    }
  }

  resaltarSilo(id){
    let silo = document.querySelector('#siloId'+id);
    if(silo) silo.classList.add('siloResaltado');
  }

  
  removerResaltadoSilos(id, esPrevious?, cantidadEnSilo?){
    let silos = document.querySelectorAll('#siloId'+id);

    if(silos.length == 0) return;
    
    let silo = document.querySelector('#siloId'+id);
    console.log('Se remueve resaltado Silo ', id);
    if(silo) silo.classList.remove('siloResaltado');
    
    // let silos = document.querySelectorAll('.silo');
    // for (var i = 0; i < silos.length; ++i) {
    //   (<HTMLElement>silos[i]).classList.remove('siloResaltado');
    // }
  }

  toggleElementoGrafico(){
    this.toggleColor = !this.toggleColor;
  }

  toggleFormaElementoGrafico(){
    if(this.toggleForma == 'ellipse'){
      this.toggleForma = 'rect';
    } else if(this.toggleForma == 'rect'){
      this.toggleForma = 'ellipse';
    }
  }

  obtenerFecha(){
    return new Date().toLocaleDateString();
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
  }

  inicializarFormulario() {
    this.planoDeCargaForm = this.formBuilder.group({
     // id: [this.embarqueSelected.planoDeCargaId],
     id:[5103],
      defensasMoviles: [{value:'',disable:true}],
      observaciones: [{value:'',disable:true}],
      caladoSalida: [{value:'',disable:true}],
      estiba: [{value:'',disable:true}],
      estibasList: [{value:'',disable:true}],
      agenciaControlPrivado: [{value:'',disable:true}],
      agenciasControlPrivadoList: [{value:'',disable:true}],
      agentesControlPrivadoSeleccionado: [{value:'',disable:true}],
      agentesControlPrivadoList: [{value:'',disable:true}],
      planoDeCargaBodegas: this.formBuilder.array([]),
      cargasComerciales: this.formBuilder.array([]),
      enviado: [false],
      fumigacion: [{value:'',disable:true}],
      empresaFumigadora: [{value:'',disable:true}],
      FilePathPlano: [{value:'',disable:true}],
      planoDeCargaArchivoNombre: [{value:'',disable:true}],
      FilePathSecuencia: [{value:'',disable:true}],
      planoDeCargaArchivoSecuenciaNombre: [{value:'',disable:true}],
      usuarioFinalizacion: [{value:'',disable:true}],
    });
    this.cargarEmbarque();
  }

  obtenerPlanoDeCarga() {

    this.planoDeCargaService.obtenerPlanoDeCarga(5103).subscribe(res => {
      this.planoDeCargaForm.patchValue({
        ...res, planoDeCargaBodegas: this.planoDeCargaForm.get('planoDeCargaBodegas').value
      });
      this._turnoService.setExportadores(this.planoDeCargaForm.controls.cargasComerciales.value);
      if (res.planoDeCargaBodegas.length > 0) {
        let total = 0;
        for (var i = 0; i < res.planoDeCargaBodegas.length; i++) {
        if (res.planoDeCargaBodegas[i].cantidad) {
            total += res.planoDeCargaBodegas[i].cantidad;
            this.calculoTotal = total;
        }
    }
        for (let index = 0; index < 9; index++) {
          var bodega = res.planoDeCargaBodegas.find(x => x.bodegaParcel == index + 1);
          if (bodega != null) {
            this.planoDeCargaBodegasFormArray.at(index).setValue(bodega);
            this.onChangeCondicion(bodega.condicion, index);
            if (bodega.materialPuerto != null)
              this.planoDeCargaBodegasFormArray.at(index).get('materialPuerto').setValue(
                this.materialesPuerto.find(x => x.id == bodega.materialPuerto.id)
              );
            if (bodega.destino != null)
              this.planoDeCargaBodegasFormArray.at(index).get('destino').setValue(
                this.destinos.find(x => x.id == bodega.destino.id)
              );
            let bodegas = this.planoDeCargaForm.controls.planoDeCargaBodegas.value.filter(b => b.cantidad > 0 || b.condicion || b.destino || b.materialPuerto || b.tanqueDeAbordo);
            this._turnoService.setBodega(bodegas);
          }
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
      for (let index = 0; index < res.cargasComerciales.length; index++) {
        this.cargasComercialesFormArray.at(index).get('materialPuerto').setValue(
          this.materialesPuerto.find(x => x.id == res.cargasComerciales[index].materialPuerto.id)
        );
      }
      this.mostrarFumigadora = res.fumigacion;

      this.lineupService.obtenerEstadoPuerto().subscribe(x => { this.estadoAlturaValor = Number(x.alturaDelRio); this.calcularRecomendacionDefensas(x); });
      this.mostrarContent = true;
      this.showCargas.emit(true);
    });
  }

  cargarEmbarque() {
    // Aca se debe recuperar el id del embarque por mientras se esta poniendo en duro
    this.embarqueService.obtenerEmbarque(3021).subscribe(
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
          listaMateriales: res.materialesPuertoCantidad?.map(x => ({ id: x.materialId, descripcionCorta: x.descripcionCorta, color: x.color })),
        }
        this._procesoService.setDatosGrafico(this.datosGrafico);
        this.getDestinos();
      }, () => {
        this.confirmationDialogService.confirm('¡Error!', `Error al obtener el embarque ${this.embarqueSelected.id}`, 'Cerrar', '', null, null, Tipoalerta.Error);
      });
  }

  getDestinos() {
    this.planoDeCargaService.obtenerDestinos().subscribe(
      res => {
        this.destinos = res;
        this.getExportadores();
      });
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
    for (let index = 0; index < 4; index++) {
      this.cargasComercialesFormArray.push(this.formBuilder.group({
        id: [{ value: '', disabled: true }],
        exportador: [{ value: '', disabled: true }],
        nombre: [{ value: '', disabled: true }],
        materialPuerto: [{ value: '', disabled: true }],
        cantidad: [{ value: '', disabled: true }],
      }))
    };
    this.cargarPlanoDeCargaBodegas();
  }

  cargarPlanoDeCargaBodegas() {
    this.planoDeCargaBodegasFormArray.clear();
    for (let index = 0; index < 9; index++) {
      this.planoDeCargaBodegasFormArray.push(this.formBuilder.group({
        id: [{ value: '', disabled: true }],
        bodegaParcel: [index + 1],
        cantidad: [{ value: '', disabled: true }],
        materialPuerto: [{ value: '', disabled: true }],
        condicion: [{ value: '', disabled: true }],
        sfFull: [{ value: '', disabled: true }],
        destino: [{ value: '', disabled: true }],
        tanqueDeAbordo: [{ value: '', disabled: true }],
      }))
    };
    this.obtenerPlanoDeCarga();
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

  public numberOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  calcularRecomendacionDefensas(estadoPuerto?: any) {
    this.estadoPuerto = estadoPuerto;

    if (this.embarque.freeboard == 0 && this.estadoAlturaValor == 0) {
      this.recomendacionDefensas = "Altura y Freeboard desconocidos, no se pueden calcular las defensas móviles";
    } else if (this.embarque.freeboard == 0) {
      this.recomendacionDefensas = "Freeboard desconocido, no se pueden calcular las defensas móviles";
    } else if (this.estadoAlturaValor == 0) {
      this.recomendacionDefensas = "Altura desconocida, no se pueden calcular las defensas móviles";
    } else {
      var result = this.embarque.freeboard +
        (this.estadoAlturaValor ? this.estadoAlturaValor : Number(this.estadoPuerto.alturaDelRio)) - 1
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

  public guardarPlanoDeCarga(finalizar: boolean) {
    if (this.planoDeCargaForm.invalid)
      return;
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
    bodegasCargadas = this.planoDeCargaForm.value.planoDeCargaBodegas.filter(x => x.cantidad > 0 && x.destino == null);
    
    if (bodegasCargadas.length > 0) {
      this.confirmationDialogService.confirm("Alerta", "No se ha ingresado el DESTINO para una o mas bodegas cargadas.", 'Cerrar', '', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if(confirmed)
          return;
      }).catch(() => window.location.reload());
    }else{        

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
        this.planoDeCargaService.guardarPlanoDeCarga(this.planoDeCargaForm.value)
          .subscribe((res: any) => {
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
            this.hideSpinner.emit(false);
          },
            errmess => {
              console.log(errmess.error)
              // this.confirmationDialogService.confirm('¡Error!', 'Error al crear el plano de carga: ' + <any>errmess.error, 'Cerrar', '', null, null, Tipoalerta.Error);
            });
      } catch (e) {
        console.log(e);
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
    if (this.esLiquido)
      this._turnoService.setTnTotales(this.planoDeCargaBodegasFormArray.value.reduce((prev, next) => prev + +next.cantidad, 0))
      
    this._procesoService.sendTotalPlanoDeEmbarque.emit(this.planoDeCargaBodegasFormArray.value.reduce((prev, next) => prev + +next.cantidad, 0))
    return this.planoDeCargaBodegasFormArray.value.reduce((prev, next) => prev + +next.cantidad, 0);
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

  sendExportador(value: any, j: number) {
    if( this.cargasComercialesFormArray.controls[j]['controls'].exportador.value === undefined ){
      this.planoDeCargaForm.get('cargasComerciales')['controls'][j]['controls'].exportador.value = null;
      this.planoDeCargaForm.get('cargasComerciales').value[j].exportador = null;
      (<HTMLInputElement>document.getElementsByClassName("prueba22")[j]).value = '';
    }

    this._turnoService.setExportadores(this.cargasComercialesFormArray.controls[j]['controls'].exportador.value);
    this.verificarCargaComercial();
  }

  sendMaterialPuerto(value: any) {
    this._turnoService.setExportadores(value);
    this.verificarCargaComercial();
  }

  verificarCargaComercial(){
    let cant = 0;
    for(let i=0; i<this.cargasComercialesFormArray.controls.length; i++ ){
      if( (( (this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === null || 
          this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === '') &&
          (this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value !== null ||
            this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value !== '') ) ||
          ((this.cargasComercialesFormArray.controls[i]['controls'].exportador.value !== null || 
          this.cargasComercialesFormArray.controls[i]['controls'].exportador.value !== '') &&
          (this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === null ||
            this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === '') ))  &&
          !( (this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === null || 
            this.cargasComercialesFormArray.controls[i]['controls'].exportador.value === '') && 
            (this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === null ||
            this.cargasComercialesFormArray.controls[i]['controls'].materialPuerto.value === '') ) )
      {
        cant += 1;
      }
    }

    if(cant>0) 
      this.cargaComercialIncompleto = true;
    else
      this.cargaComercialIncompleto = false;
  }

  sendDataParcel(bodegas) {
    let bodegasFull = bodegas.filter(b => b.cantidad > 0 || b.condicion || b.destino || b.materialPuerto || b.tanqueDeAbordo);
    this._turnoService.sendBodega.emit(bodegasFull);
  }
}
