import { AfterViewInit,  Component, EventEmitter,  OnInit, Output, ViewChild} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Exportador } from "@ScatoModels/exportador";
import { MotivosDeCorte } from '@ScatoModels/planilla-turnos/motivo-de-corte';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { LineasService } from '@ScatoServicios/lineas.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Mail } from '@ScatoModels/mail';
import { PlanillaDeTurnos, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { TurnoDetalleLiquido } from '@ScatoModels/planilla-turnos/turno';
import { CorteTurno } from '@ScatoModels/planilla-turnos/corte-turno';
import { convertActionBinding, ConvertActionBindingResult } from '@angular/compiler/src/compiler_util/expression_converter';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { PlanoContentComponent } from 'app/modulos/lineup/plano-de-carga/plano-content/plano-content.component';
import { style } from '@angular/animations';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';

@Component({
  selector: 'app-planilla-turno-liquidos',
  templateUrl: './planilla-turno-liquidos.component.html',
  styleUrls: ['./planilla-turno-liquidos.component.css']
})
export class PlanillaTurnoLiquidosComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;
  formTurnos: FormGroup;
  formCorte: FormGroup;
  formNuevoTurno: FormGroup;
  formExportarExcel: FormGroup;
  moduloCarga: ModuloDeCarga;
  exportadores: any[];
  lineas: any[];
  arrLineas: any[];
  partidas: any[];
  producto: any[];
  tanques: any[];
  hoy: any;
  bodegas: any[];
  productos: any[];
  destinos: any[];
  turnos = ['00-06', '06-12', '12-18', '18-24'];
  turnoPuerto: any[];
  motivosCorte: MotivosDeCorte[];
  idModuloDeCarga: number;
  planillaDeTurnos: PlanillaDeTurnos[];
  nuevoTurno: PlanillaDeTurnos;
  cortesTurno: CorteTurno[] = [];

  
  embarqueId: number; 
  embarque: Embarque;
  vientoAmarre: string;
  direccionViento: string;
  valorCargado: number;
  pedidoPorPlano: number;
  mostrarBtn:boolean=true;
  constructor(
    private _builder: FormBuilder,
    private _modalService: NgbModal,
    private _procesoService: DatosEmbarquesProcesoService,
    private datePipe: DatePipe,
    private _turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private messageService: MessageService,
    private lineasService: LineasService,
    private confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
  ) {
    console.log('modulo de carga: ', this.procesoService.getModuloDeCarga());
    console.log('this._turnosService.getTnTotales(): ', this._turnosService.getTnTotales());
    this.pedidoPorPlano = this._turnosService.getTnTotales()
    this.embarqueId = this.procesoService.getEmbarqueId();
    this.embarqueService.obtenerEmbarque(this.embarqueId).subscribe(res => this.embarque = res); 
    this._turnosService.sendBodega.subscribe(res => {
      this.bodegas = res;
      if(this.formExportarExcel) this.addParcelChecks();
      this.getProductos();

      this.getDestinos();
    });

  }

  ngOnInit(): void {
    this.newForm()
    // this.fillPlanilla();
    setTimeout(() => {
      this.fillPlanilla();
    }, 2000);
  }
  expandir()
  {
    document.getElementById('collapsePlanillaTurnosLiquidos').className = "collapse show";
  }
  desabilitarTurno()
  {
    this.mostrarBtn=false;
  }
  newForm() {
    this.formTurnos = this._builder.group({
      diasTurno: this._builder.array([this.initDia()]),
    });

    this.formCorte = this._builder.group({
      motivosDeCorte: '0',
      horaInicio: '',
      horaFin: '',
      tiempoTotal: '',
      observaciones: ''
    });

    this.formNuevoTurno = this._builder.group({
      fecha: ""
    });

    this.formExportarExcel = this._builder.group({
      parcelSeleccionados: this._builder.array([]),
      filtroTurnos: ''
    });

    this.formCorte.get('tiempoTotal').disable();
    this.getCombos();
  }

  selectedNewTurno: number;

  addTurno(turno: any){
    if (this.formNuevoTurno.value.fecha != null){
      let fechaSplit = this.formNuevoTurno.value.fecha.split("-",3);
      let fechaSeleccionada: Date = new Date(fechaSplit[0],fechaSplit[1] - 1,fechaSplit[2]);
      
      //Harcodeo una fecha de inicio mínima hasta que se controle por DB
      let fechaInicio: Date = new Date();
      let diaTurnoToAdd: number= -1;
      let exitFunction: boolean = false;
    
      fechaInicio.setDate(fechaInicio.getDate()-10);
      if (this.formNuevoTurno.value.fecha != ''){
        if (fechaSeleccionada < fechaInicio || fechaSeleccionada > new Date()){
            this.confirmationDialogService.confirm('¡Atención!', 'La fecha debe ser entre ' + fechaInicio.toLocaleString().split(', ')[0] +  ' y ' + new Date().toLocaleString().split(', ')[0] + '.' , 'Cerrar', '', null, null, Tipoalerta.Warning)  
        } else {
            let exists:boolean = false;
            //Si la fecha es válida tengo que revisar que el turno en esa fecha esté disponible.

            this.formTurnos.get('diasTurno')['controls'].forEach((dia, diaIndex) => {
              // //Si el día ya está agregado
              if (new Date(dia.controls.diaTurno.value).getFullYear()  == fechaSeleccionada.getFullYear() &&
              new Date(dia.controls.diaTurno.value).getMonth()  == fechaSeleccionada.getMonth() &&
              new Date(dia.controls.diaTurno.value).getDate()  == fechaSeleccionada.getDate()){
                dia.controls.turnos.controls.forEach(turnoLista => {
                  if (turnoLista.value.turnoPuerto.turnoPuerto.id == turno){
                    this.confirmationDialogService.confirm('¡Atención!', 'El turno que deseas agregar no se encuentra disponible.', 'Cerrar', '', null, null, Tipoalerta.Warning)
                    exitFunction = true;
                  }
                });
                //El día ya existe en la lista
                diaTurnoToAdd = diaIndex;
              }
            });

            if (exitFunction){
              return;
            }
            //Si llegamos hasta aca es porque tenemos que crear el turno.
            let turnoNuevo: PlanillaDeTurnos = new PlanillaDeTurnos();

            turnoNuevo.guardadoPorTablerista = false;
            turnoNuevo.fecha = fechaSeleccionada;
            turnoNuevo.fechaMiliseconds = fechaSeleccionada.getTime();
              this.moduloCargaService.obtenerTurnoPuerto().subscribe((res: TurnoPuerto[]) => {
              res.forEach((turnoPuerto: TurnoPuerto) => {
                if (turnoPuerto.id == turno){
                  turnoNuevo.turnoPuerto = turnoPuerto;

            //Si diaTurnoToAdd > -1 es porque el turno pertenecea un día existente y simplemente tengo que agregar el turno en ese día.
            if (diaTurnoToAdd > -1){
              this.setTurno(diaTurnoToAdd,turnoNuevo, true);
              //Y ordenar el array del día correspondiente
              this.formTurnos.get('diasTurno')['controls'][diaTurnoToAdd].controls.turnos   

            }else{
                    diaTurnoToAdd = 0;
              this.setDia(null, turnoNuevo, fechaSeleccionada)  
                  }
            }
              })
            });          

            //CIERRO EL MODAL
            //this._modalService.dismissAll();
        }
        //Si seleccionó una fecha revisamos en la planilla si el día tiene el turno disponible
      } else {
        this.confirmationDialogService.confirm('¡Atención!', 'Debes elegir una fecha para el turno.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      }
    }else{
      this.confirmationDialogService.confirm('¡Atención!', 'Debes elegir una fecha para el turno.', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
    
    
  }
  fillPlanilla(){
    this.planillaDeTurnos = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == true);
    this.diasTurno.clear();

    //Si la planilla tiene turnos
    if(this.planillaDeTurnos != undefined && this.planillaDeTurnos.length > 0){

      //Agrego variable de milisegundos (fecha) para poder ordenar
      this.planillaDeTurnos.forEach(element => {
        element.fechaMiliseconds = new Date(element.fecha).getTime();
      });
  
  
      this.planillaDeTurnos = this.planillaDeTurnos.sort((a,b) =>{
        return a.fechaMiliseconds - b.fechaMiliseconds;
      });
    
      this.turnoPuerto = [];
      this.planillaDeTurnos.forEach((dia, indexDia)=>{
        let exists: boolean = false;
        let dayIndex: number;
        //Me fijo si el día ya está agregado
        this.formTurnos.get('diasTurno')['controls'].forEach((element,indexDiaTurno) => {
          //Si el día ya está agregado
          if(new Date(dia.fecha).getDate() == new Date(element.value.diaTurno).getDate()){
            exists = true;
          } 
          dayIndex = indexDiaTurno;
        });

        //Si no existe el día, lo creo.
        if (!exists){
          this.setDia(dia);
          dayIndex = this.diasTurno.length -1;
        }else{
          //Si ya existe el día agrego 1 turno al array del día.
          
          this.setTurno(dayIndex,dia);
        }
        
        //Agrego detalles
        if(dia.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length > 0){
          this.initTurnoDetalle(dia.moduloDeCargaPlanillaDeTurnosDetallesLiquido,
                                this.diasTurno['controls'][dayIndex]['controls'].turnos, 
                                this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        }else{
          this.initTurnoDetalle(null,
          this.diasTurno['controls'][dayIndex]['controls'].turnos, 
          this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        }

        //Agrego cortes
        if(dia.moduloDeCargaPlanillaDeTurnosCortes?.length > 0){
          this.initTurnoCortes(dia.moduloDeCargaPlanillaDeTurnosCortes,
                                this.diasTurno['controls'][dayIndex]['controls'].turnos, 
                                this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        }
      });
    
    }

    //Me obtengo la fecha del último día
    //let diaUltimoTurno;
    //let ultimoDiaIndex;
    if (this.diasTurno != undefined && this.diasTurno['controls'].length > 0){
      //diaUltimoTurno = this.diasTurno['controls'][this.diasTurno['controls'].length - 1]['controls']['diaTurno']['value'];
      //ultimoDiaIndex = this.diasTurno['controls'].length - 1;
      
      const diasTurno = this.diasTurno['controls'];
      const ultimoDiaIndex = this.diasTurno['controls'].length - 1;
      const diaUltimoTurno = diasTurno[ultimoDiaIndex]['controls']['diaTurno']['value'];

      //Me fijo si ese día es hoy
      if(new Date().getDate() == new Date(diaUltimoTurno).getDate()){
        //Si es hoy reviso el id del último turno
        const ultimoDiaRevIndex = [diasTurno[ultimoDiaIndex]['controls']['turnos']['controls'].length - 1];
        const idTurnoPuerto = diasTurno[ultimoDiaIndex]['controls']['turnos']['controls'][ultimoDiaRevIndex].value.turnoPuerto.turnoPuerto.id
        
        //Me traigo la hora actual (solo la hora, no me interesan los minutos.)
        let horaActual = new Date().getHours();
        
        //Me traigo el rango de horario del último turno y lo guardo en un array de 2 posiciones
        let rangoHorarios: string[] =  this.turnos[idTurnoPuerto - 1].split('-');

        //Me fijo si la hora actual está dentro de ese rango.
        if( horaActual >= parseInt(rangoHorarios[0]) && horaActual < parseInt(rangoHorarios[1])){
          //Si está dentro del rango quiere decir que ya existe el turno.
        }else{
          this.setTurnoODia(true, ultimoDiaIndex);        
        }
      }
      else{
        this.setTurnoODia();
      }
    }else{
      this.setTurnoODia();
    }

  }

  setTurnoODia(soloTurno: boolean = false, diaIndex?: number){
       //Si entro aca creo el turno del día actual en hora actual.

       //Calculo el turnoPuerto actual así lo traigo de la DB
       let idTurnoPuerto = Math.floor(new Date().getHours()/6) + 1

       //Si no, tengo que agregar el turno
       let turno: PlanillaDeTurnos = new PlanillaDeTurnos();
               
       turno.guardadoPorRecibidor = false;
       turno.guardadoPorTablerista = false;
       turno.fecha = new Date();
       turno.fechaMiliseconds = new Date().getTime();
       
       this.moduloCargaService.obtenerModuloDeCargaPlanillaDeTurnos(idTurnoPuerto, this.procesoService.getModuloDeCarga().id).subscribe((turnoDb: PlanillaDeTurnos) => {

         if (turnoDb == null){

          this.moduloCargaService.obtenerTurnoPuerto().subscribe((res: TurnoPuerto[]) => {
            res.forEach((turnoPuerto: TurnoPuerto) => {
              if (turnoPuerto.id == idTurnoPuerto){
                turno.turnoPuerto = turnoPuerto;
                //Aca me fijo si solo agrego el turno o también tengo que agregar el día. Es solo para la visualización de la planilla
                if (soloTurno)
                  this.setTurno(diaIndex,turno);  
                else
                  this.setDia(null,turno)

                this.guardarTurno(turno);
                
              }
            })          
          });
         }
       }); 
  }



  setTurno(dia: number, Turno: PlanillaDeTurnos, esNuevoTurno?: boolean){
    (this.diasTurno['controls'][dia]['controls'].turnos as FormArray).push(this.initTurno(Turno,esNuevoTurno)); 
  }
  
  setDia(dia: any, turno?: PlanillaDeTurnos, date?: Date){
    this.diasTurno.push(this.initDia(dia,turno,date));
  }

  getDia(index: number){
    //Calculo el día y lo convierto a dd--MM-yyyy
    return this.datePipe.transform(this.formTurnos.get('diasTurno')['controls'][index]['controls'].diaTurno.value, 'dd-MM-yyyy');
  }
  
  getCombos() {
    this.lineas = this._procesoService.getModuloDeCarga().moduloDeCargaLineasDeEmbarque;
    this.arrLineas = this.lineas;
    this.arrLineas = this.arrLineas.map(l => { return l = l.linea });
    this.arrLineas.filter((value, index, array) => {
      return array.indexOf(value) === index;
    })

    let exportadoresForm = this._turnosService.getExportadores();
    this.exportadores = new Array();
    for (let e of exportadoresForm) {
      if (e.exportador) this.exportadores.push(e.exportador);
    }
    
    this.hoy = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    this.bodegas = this._turnosService.getBodega();
    this.addParcelChecks();

    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.vientoAmarre = this.procesoService.getVientoAmarre();
    this.direccionViento = this.procesoService.getDireccionViento();
    let planilla = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == true);
    planilla?.length > 0 ? this.formTurnos.get('diasTurno').patchValue(planilla) : '';
    this.getDestinos();
    this.getProductos();
    this.getMotivosCorte();
  }

  addParcelChecks(){
    while (this.parcelSeleccionados.length !== 0) {
      this.parcelSeleccionados.removeAt(0)
    }
    this.bodegas.forEach(() => this.parcelSeleccionados.push(new FormControl(false)));
  }

  getMotivosCorte() {
    this.moduloCargaService.obtenerMotivosDeCorte().subscribe(
      res => {
        this.motivosCorte = res;
      }
    )
  }

  //Obtener los horarios de los turnos
  getTurnoPuerto() {
    this.moduloCargaService.obtenerTurnoPuerto().subscribe(
      res => {
        this.turnoPuerto = res;
        this.diasTurno['controls'].forEach((dia)=>{
          dia['controls'].turnos = this._builder.array(
            res.map(turno => {
              const group = this.initTurno(turno.nombre);
              return group;
            }));
        })
      }
    )
  }

  get diasTurno(): FormArray {
    return this.formTurnos.get('diasTurno') as FormArray;
  }
  get parcelSeleccionados(): FormArray {
    return this.formExportarExcel.get('parcelSeleccionados') as FormArray;
  }

  getTurnos(dia): FormArray {
    const turno = this.diasTurno["controls"][dia]['controls'].turnos;
    return turno as FormArray;
  }

  getTurnoDetalles(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosDetallesLiquido as FormArray;
  }

  getTurno2(d, t): FormArray {
    return this.getTurnos(d)['controls'][t] as FormArray;
  }

  getCorteTurnos(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosCortes as FormArray;
  }

  openModalNuevoTurno(modal){
    this.formNuevoTurno.reset();

    this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result.then(() => {
      
    })

  }
 

  onLineaChange(result: any, dia: number, turno: number, index: number){
    const lineaFiltro = this.lineas.filter(linea => linea.id == result.value.linea);
    if (lineaFiltro.length > 0 ){
      const lineaSel = lineaFiltro[0];
      const valueTk = lineaSel.tkInicial != null ? lineaSel.tkInicial : null;
      const valueMaterialPuerto = lineaSel?.materialPuerto != null ? lineaSel?.materialPuerto : null ;
  
      let controSel = this.getTurnoDetalles(dia,turno);
  
      controSel['controls'][index]['controls'].tk.setValue(valueTk);
      controSel['controls'][index]['controls'].materialPuerto.setValue(valueMaterialPuerto);
    }
   }

  openModalCorte(modal, dia, turno) {
    this.formCorte.reset();

    if (!this.getTurnos(dia)['controls'][turno]['controls'].guardadoPorTablerista.value) {
      this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result.then(() => {
        this.getCorteTurnos(dia, turno).push(this.initCorte(this.formCorte.getRawValue()));
      })
    }else{
      this.confirmationDialogService.confirm('¡Atención!', 'No puedes agregar un corte a un turno cerrado.', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
  }

  //Calcula el total de tiempo de los cortes
  calcularTotal() {
    let desde = this.formCorte.get('horaInicio').value ? this.formCorte.get('horaInicio').value.split(':') : '',
      hasta = this.formCorte.get('horaFin').value ? this.formCorte.get('horaFin').value.split(':') : '',
      f_desde = new Date(),
      f_hasta = new Date(),
      total = new Date();

    f_desde.setHours(desde[0], desde[1], 0, 0);
    f_hasta.setHours(hasta[0], hasta[1], 0, 0);

    total.setHours(f_hasta.getHours() - f_desde.getHours(), f_hasta.getMinutes() - f_desde.getMinutes(), 0, 0);

    if (total.getHours())
      this.formCorte.get('tiempoTotal').setValue(`${total.getHours() < 10 ? '0' + total.getHours() : total.getHours()}:${total.getMinutes() < 10 ? '0' + total.getMinutes() : total.getMinutes()}`)
  }

  getRowSpan(dia: any) {
    let contador = 0;
    for (let turnos of dia.controls.turnos.controls) {
      contador += this.getRowSpanTurno(turnos);
      contador += 2;
    }
    return contador;
  }

  getRowSpanTurno(turno: any) {
    if (turno.controls.moduloDeCargaPlanillaDeTurnosCortes.length > 0)
      return turno.controls['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls.length + 1;
    else
      return turno.controls['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls.length;
  }

  getTurnoHorario(dia, turno) {
    let fecha = new Date();
    let horario = fecha.getHours();
    
    //Busca dentro de los 4 turnos, un turno cuyo horario sea entre (REF: 0-6) el horario buscado
    let returnHorario = this.turnoPuerto.find(h => horario >= Number(h.nombre.split('-')[0]) && horario < Number(h.nombre.split('-')[1]));
    this.getTurnos(dia)['controls'][turno]['controls'].turnoPuerto.setValue(returnHorario);
    return returnHorario;
  }


  sendRitmos(dia, turno) {
    this._turnosService.setTurnos(this.getTurnos(dia).controls[turno].value)
  }

  getCantTurno(t) {
    let contador = 0;
    // return 0;
    for (let turno of t['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls) {
      contador += turno.controls.cantidad.value ? turno.controls.cantidad.value : 0;
    }
    return contador;
  }

  getCantDia(d) {
    let contador = 0;
    // return 0;
    for (let turno of d['controls']['turnos']['controls']) {
      contador += this.getCantTurno(turno);
    }
    return contador;
  }

  getCantTotalABordo() {
    let contador = 0;
    // return 0;
    for (let dia of this.formTurnos['controls']['diasTurno']['controls']) {
      contador += this.getCantDia(dia);
    }
    return contador;
  }

  initDia(dia?: any, turno?: PlanillaDeTurnos, date?: Date) {
    if (dia != null){
      return this._builder.group({
        turnos: this._builder.array([this.initTurno(dia)]),
        diaTurno: dia.fecha
      });
    }else{
      return this._builder.group({
        // turnos: this._builder.array([this.initTurno()]),
        // diaTurno: null
        turnos: this._builder.array([this.initTurno(turno,true)]),
        diaTurno: date? date : new Date()
      });
    }    
  }

  initTurnoDetalle(detalle:TurnoDetalleLiquido [], turno: PlanillaDeTurnos, turnoIndex?: number){
    let planillaTurnoDetalles = turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'];
    
    
     if (detalle != null){
        if(detalle.length > 0){
          detalle.forEach(element => {      
            (planillaTurnoDetalles as FormArray).push(this.initLinea(element, turno['controls'][0]['controls'].guardadoPorTablerista.value));
          });

          //HAGO ESTO PARA COMPLETAR CON LINEAS VACÍAS HASTA LLEGAR A 4.
          for(let i=detalle.length; i<4; i++){
            (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea(null,turno['controls'][0]['controls'].guardadoPorTablerista.value));
          }
        }
    //Si no hay detalles completo con 4 lineas vacías.
    }else{
      for (let i= 1; i <= 4; i++) {
        (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea());
      }
    }
  }

  initTurnoCortes(corte: CorteTurno [], turno: PlanillaDeTurnos, turnoIndex?: number){
    corte.forEach(element => {      
      (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosCortes'] as FormArray).push(this.initCorte(element, turno['controls'][0]['controls'].cerrado.value));
    });
  }

  initTurno(turnoPuerto?: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    let fg: FormGroup;

    if(!esNuevoTurno){
      fg = this._builder.group({      
        moduloDeCargaPlanillaDeTurnosDetallesLiquido:this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),      
        guardadoPorTablerista: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        cerrado: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    }else{
      fg = this._builder.group({      
        moduloDeCargaPlanillaDeTurnosDetallesLiquido:this._builder.array([this.initLinea(),this.initLinea(),this.initLinea(),this.initLinea()]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),      
        guardadoPorTablerista: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        cerrado: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    }
    
    return fg;
  }

  compareFields(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  initLinea(line?: any, guardado?: boolean) {
    return this._builder.group({
      linea:[{value: line ? line.linea_Id : '', disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      exportador: [{value: line ? line.exportador : '', disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      bodegaParcel: [{value: line ? line.bodegaParcel : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      materialPuerto: [{value: line ? line.materialPuerto :'',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      tk: [{value: line ? line.tk : '' , disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      temperatura: [{value: line ? line.temperatura : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      medidaInicialCM: [{value: line ? line.medidaInicialCM : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      medidaInicialMM:  [{value: line ? line.medidaInicialMM :'',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      medidaFinalCM: [{value: line ? line.medidaFinalCM : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      medidaFinalMM: [{value: line ? line.medidaFinalMM : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      destino: [{value: line ? line.destino.id : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      cantidad: [{value: line ? line.cantidad : '',disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}] ,
      id:  [{value: line ? line.id : null,disabled: localStorage.getItem('desabilitar')=='true'?true:guardado}]
    })
  }

  initCorte(corte?: any, guardado?: boolean) {
    if(corte != null){
      return this._builder.group({
        motivosDeCorte: [{value: corte.motivosDeCorte? corte.motivosDeCorte : '', disabled: guardado }, Validators.required],
        horaInicio: [{value: corte.horaInicio, disabled: guardado }, Validators.required],
        horaFin: [{value: corte.horaFin, disabled: guardado },  Validators.required],
        tiempoTotal: [{value: corte.tiempoTotal, disabled: guardado }, Validators.required],
        observaciones: [{value: corte.observaciones, disabled: guardado }, Validators.required],
        id: [{value: corte.id, disabled: guardado }, Validators.required]
      })
    }
  }

  getToneladasParcelDia(bodega: number, d: number) {
    let dia = this.getTurnos(d);
    let cantidad = 0;
    // return 0;
    for (let turno of dia.controls) {
      for (let linea of turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido']['controls']) {
        cantidad += (linea.controls.bodegaParcel.value == bodega ? Number(linea.controls.cantidad.value) : 0);
      }
    }
    return cantidad;
  }

  getToneladasParcelTurno(bodega: number, d: number, t: number) {
    let turno = this.getTurnoDetalles(d, t);
    let cantidad = 0;
    // return 0;
    for (let linea of turno.controls) {
      cantidad += (linea['controls'].bodegaParcel.value == bodega ? Number(linea['controls'].cantidad.value) : 0);
    }
    return cantidad;
  }

  getToneladasLinea(value: string) {    
    let contador = 0;
    // return 0;
    this.diasTurno.controls.forEach(dia => {
      const turnos = dia['controls']['turnos']['controls'];
      turnos.forEach(turno => {
        const lineaTurnos = turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido']['controls'];
        lineaTurnos.forEach(linea => {
          if(linea.get('linea').value!=''){
            const lineaId = linea.get('linea').value;
            const lineaFiltro = this.lineas.filter(linea => linea.id == lineaId);
            if (lineaFiltro.length > 0 ){
              const lineaSel = lineaFiltro[0];
              const lineaValue = lineaSel.linea != null ? lineaSel.linea : '';
              contador += (lineaValue.toLowerCase()  == value ? Number(linea.get('cantidad').value) : 0);
            }
          }
        })
      });
    })

    return contador;
  }

  getProductos() {
    this.productos = new Array();
    this.bodegas.forEach(b => {
      if (b.materialPuerto && !this.productos.find(p => p == b.materialPuerto)){
          this.productos.push(b.materialPuerto)
      } 
    })
  }

  getDestinos() {
    this.destinos = new Array();
    this.bodegas.forEach(b => {
      if (!this.destinos.find(d => d.nombre == b.destino)){
        this.destinos.push(b.destino);
      } 
    })
  }

  getCantidadLinea(linea: any){
    let lineaTurno = linea?.controls;
    if (lineaTurno?.medidaInicialCM.value &&
        lineaTurno?.medidaInicialMM.value &&
        lineaTurno?.medidaFinalCM.value &&
        lineaTurno?.medidaFinalMM.value &&
        lineaTurno?.tk.value &&
        lineaTurno?.temperatura &&
        lineaTurno?.materialPuerto){
        const medidaInicialCM = lineaTurno?.medidaInicialCM.value;
        const medidaInicialMM = lineaTurno?.medidaInicialMM.value;
        const medidaFinalCM   = lineaTurno?.medidaFinalCM.value;
        const medidaFinalMM   = lineaTurno?.medidaFinalMM.value;
        const tkLinea         = lineaTurno?.tk.value.toString().padStart(3,"0");;
        const temperatura     = lineaTurno?.temperatura.value;
        const materialPuerto  = lineaTurno?.materialPuerto?.value.id

        Promise.all([
        //await
        this.lineasService.obtenerLlenadoMilimetroPorTanque(medidaInicialCM, medidaInicialMM, tkLinea).toPromise(),
        this.lineasService.obtenerLlenadoMilimetroPorTanque(medidaFinalCM, medidaFinalMM, tkLinea).toPromise(),
        this.lineasService.obtenerDensidadPorTemperaturaDeMaterial(materialPuerto, temperatura).toPromise()
        ]).then(([inicial, final, densidad]) => {
          let cantidad = (Number(inicial) - Number(final)) * Number(densidad);
          lineaTurno.cantidad.setValue(cantidad);
        })

      }
  }


  async getImgMolinos(){
    let response = await fetch('assets/iconMolinos.png');
    let buffer = await response.arrayBuffer();
    return buffer;
  }

  async generarExcelPorParcel(){
    let fname = "parcels";
    let header = ["Exportador","Partida","Tks de abordo",,"Destino","Tks Tierra",,"TN","Producto"];
    let header2 = ["Día", "Turno","Exportador","Línea","Partida", "Producto", "Tk" , "°C", "Med. Ini. Cm.", "Med. Ini. Mm.", "Med. fin. Cm.","Med. fin. Cm.", "Destino", "Cant."];
    let headerDetalles = ["Exportador","Línea","Partida", "Producto", "Tk" , "°C", "Med. Ini. Cm.", "Med. Ini. Mm.", "Med. fin. Cm.","Med. fin. Cm.", "Destino", "Cant."];
    let headerCortes = ["Motivo","Inicio","Fin","Tiempo total","Observaciones"];
    let referencias = ["REFERENCIAS",
      "CSBO = ACTE CRUDO DE SOJA",
      "CSFO = ACTE CRUDO DE GSOL.",
      "RSBO = ACTE REFINADO DE SOJA",
      "RSFO = ACTE REFINADO DE GSOL.",
      "FAME = BIODIESEL"];
    
    const imgMolinos = await this.getImgMolinos();
    // datosModal.parcelSeleccionados.forEach((element, i) => {
      let workbook = new Workbook();
      
      const molinosImg = workbook.addImage({
        buffer: imgMolinos,
        extension: 'png',
      });

      let worksheet = workbook.addWorksheet("Turnos",
      {
        views:[
          {state: 'frozen', activeCell: 'A1', showGridLines:false}
        ]
      });

      //Seteo el ancho de todas las columnas.
      worksheet.columns = [
        {width: 12},
        {width: 11},
        {width: 13},
        {width: 10},
        {width: 9},
        {width: 10},
        {width: 5},
        {width: 11},
        {width: 16},
        {width: 11},
        {width: 17},
        {width: 11},
        {width: 11},
      ];

      //Merge cells cabecera
      worksheet.mergeCells('A1:B4');
      worksheet.mergeCells('C1:H3');
      worksheet.mergeCells('I1:M3');
      worksheet.mergeCells('C4:M4');
      worksheet.mergeCells('A5:B5');
      worksheet.mergeCells('C5:M5');
      worksheet.addImage(molinosImg, 'A1:B4');
      ['C1', 'I1', 'C4', 'A5', 'C5'].forEach((cell)=>{
        let currentCell = worksheet.getCell(cell);
        currentCell.border = {
          top: {style:'medium'},
          left:{style:'medium'},
          bottom: {style:'medium'},
          right: {style:'medium'},
        };
        currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
        currentCell.font = {
          name: 'Arial',
          family: 2,
          size: 12,
          bold: true
        }
      });
      ['C1', 'I1', 'C4'].forEach((cell)=>{
        let currentCell = worksheet.getCell(cell);
        currentCell.fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'FFC0C0C0'}
        };
      });
      worksheet.getCell('C1').value = "Código: F-XXXX";
      worksheet.getCell('I1').value = "Revisión: 01";
      worksheet.getCell('C4').value = "Título: Planilla Embarque de Líquidos";
      worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'right' };
      worksheet.getCell('A5').value = "Buque:";
      worksheet.getCell('C5').value = this.procesoService.getEmbarqueSelected().nombreBuque;

      /* Planilla de embarque */
      //Martín: revisar
      [8,9,10,11,12,13,14,15,16,17].forEach((x)=>{
        worksheet.mergeCells(`C${x}:D${x}`);
        worksheet.mergeCells(`F${x}:G${x}`);
      });

      // worksheet.getCell('A9').value = "PEPE"

      
      let headerInserted1 = worksheet.getRow(8);
      header.forEach((text, index)=>{
        let currentCell = headerInserted1.getCell(index + 1);
        if(text){
          currentCell.value = text;
          currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
          currentCell.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'FFCCFFCC'}
          }
          currentCell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          }
          currentCell.font = {
            name: 'Arial',
            family: 2,
            size: 11,
            bold: true
          }
        }
      });

      
      let rowOffset = 9;
      let planillaDeEmbarque = this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeEmbarque;
      let PlanillaEmbarqueData = worksheet.getRows(rowOffset, planillaDeEmbarque.length)
      PlanillaEmbarqueData.forEach((row, i) => {
        let currentRow = worksheet.getRow(rowOffset + i);
        currentRow.getCell('A').value = planillaDeEmbarque[i].exportador.nombre;
        currentRow.getCell('B').value =  planillaDeEmbarque[i].bodegaParcel;
        currentRow.getCell('C').value = planillaDeEmbarque[i].tanqueDeAbordo;
        currentRow.getCell('E').value = planillaDeEmbarque[i].destino.nombre;
        currentRow.getCell('F').value = planillaDeEmbarque[i].tk;
        currentRow.getCell('H').value = planillaDeEmbarque[i].tn;
        currentRow.getCell('I').value = planillaDeEmbarque[i].materialPuerto.descripcion;

      });

      let rowsTable1 = worksheet.getRows(9, planillaDeEmbarque.length);
      rowsTable1.forEach((row)=>{
        [1,2,3,4,5,6,7,8,9].forEach((number)=>{
          let currentCell = row.getCell(number);
          currentCell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          }
        });
      });


      referencias.forEach((ref, index)=>{
        let numCelda = index + 8;
        let currentCell = worksheet.getCell(`K${numCelda}`);
        currentCell.value = ref;
      });
      //Ordeno por turno
      this.planillaDeTurnos = this.planillaDeTurnos.sort((a,b) =>{
        if (a.turnoPuerto.id > b.turnoPuerto.id) return 1;
        if (a.turnoPuerto.id < b.turnoPuerto.id) return -1;
        return 0;
      });

      //Ordeno por día
      this.planillaDeTurnos = this.planillaDeTurnos.sort((a,b) =>{
        if (a.fechaMiliseconds > b.fechaMiliseconds) return 1;
        if (a.fechaMiliseconds < b.fechaMiliseconds) return -1;
        return 0;
      });

      let diaOrder = 0;
      this.planillaDeTurnos.forEach((turno: PlanillaDeTurnos, i) => {
        if(i == 0 ){
          turno.indexDia = diaOrder;
        }else{
          //
          if (new Date(turno.fecha).getDate() == new Date(this.planillaDeTurnos[i-1].fecha).getDate() &&
          new Date(turno.fecha).getMonth() == new Date(this.planillaDeTurnos[i-1].fecha).getMonth() &&
          new Date(turno.fecha).getFullYear() == new Date(this.planillaDeTurnos[i-1].fecha).getFullYear()){
            turno.indexDia = diaOrder;
          }else{
            diaOrder++;
            turno.indexDia = diaOrder;
          }
        }
        });

        
      let baseCell = 20;//37

      let offset = baseCell;
      //Calculo la cantidad de rows que va a ocupar la planilla
      
      let numeroTurno = 0;
      let totalNumeroTurnos = this.planillaDeTurnos.length;

      this.planillaDeTurnos.forEach((turno:PlanillaDeTurnos) => {
        // sino tiene informacion de detalle de turnos y cortes no lo considera
        if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0){
            totalNumeroTurnos-=1;
        }
      });
      
      //Renderizo todos los detalles
      this.planillaDeTurnos.forEach((turno:PlanillaDeTurnos) => {

        // sino tiene informacion de detalle de turnos y cortes no lo considera
        if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0){
            return;
        }

        numeroTurno += 1;
        if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0){
           /* Planilla de turnos */
          headerDetalles.forEach((text, index)=>{
            let currentCell = worksheet.getRow(offset).getCell(index + 3);
            if(text){
              currentCell.value = text;
              currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
              currentCell.fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{argb:'FFCCFFCC'}
              }
              currentCell.border = {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
              }
              currentCell.font = {
                name: 'Arial',
                family: 2,
                size: 11,
                bold: true
              }
            }
          });

          offset = offset + 1;

          // Cargando Agrupador de Turnos
          let registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length - 1;
          const numRegistroTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length;
          const nombreTurno = turno.turnoPuerto.nombre;

          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0){
              registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length
              const registroCorte = turno.moduloDeCargaPlanillaDeTurnosCortes.length ;
              registrosTurno += registroCorte;
              
          }
          const inicioTurnoMerge = offset; 
          const finTurnoMerge = offset + registrosTurno;
          worksheet.mergeCells(`B${inicioTurnoMerge}:B${(finTurnoMerge)}`);
          worksheet.getCell(`B${inicioTurnoMerge}`).value = nombreTurno;
          worksheet.getCell(`B${inicioTurnoMerge}`).alignment = { vertical: 'middle', horizontal: 'center'}

          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0){
              if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0 ){
                if (numeroTurno != totalNumeroTurnos){
                const filaRellenoTurno = inicioTurnoMerge + numRegistroTurno;
                worksheet.getCell(`B${filaRellenoTurno}`).fill = {
                  type: 'pattern',
                  pattern:'solid',
                  fgColor:{argb:'FFCCFFCC'}
                };
                };
            }
          }
          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0){
            if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0 ){
              let filaRellenoTurno = finTurnoMerge;
              if (numeroTurno != totalNumeroTurnos){
                  filaRellenoTurno = finTurnoMerge + 1;
                  worksheet.getCell(`B${filaRellenoTurno}`).fill = {
                    type: 'pattern',
                    pattern:'solid',
                    fgColor:{argb:'FFCCFFCC'}
                  };
              }
          }
        }

          worksheet.getCell(`B${offset}`).border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          }

          turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.forEach((turno: any, index) => {

            let lineaDescripcion;
            const lineaFiltro = this.lineas.filter(linea => linea.id == turno.linea_Id);
            if (lineaFiltro.length > 0 ){
               lineaDescripcion = lineaFiltro[0].linea != null ? lineaFiltro[0].linea : '';
            }
            
            worksheet.getRow(offset).getCell(3).value = turno.exportador.nombre;
            worksheet.getRow(offset).getCell(4).value = lineaDescripcion;
            worksheet.getRow(offset).getCell(5).value = turno.bodegaParcel;
            worksheet.getRow(offset).getCell(6).value = turno.materialPuerto.descripcion;
            worksheet.getRow(offset).getCell(7).value = turno.tk;
            worksheet.getRow(offset).getCell(8).value = turno.temperatura;
            worksheet.getRow(offset).getCell(9).value = turno.medidaInicialCM;
            worksheet.getRow(offset).getCell(10).value = turno.medidaFinalMM;
            worksheet.getRow(offset).getCell(11).value = turno.medidaFinalCM;
            worksheet.getRow(offset).getCell(12).value = turno.medidaFinalMM;
            worksheet.getRow(offset).getCell(13).value = turno.destino.nombre;
            worksheet.getRow(offset).getCell(14).value = turno.cantidad;
            
            let celdaDetalle = 3
            for (let indexCell = 1; indexCell<=12; indexCell++) {
                 worksheet.getRow(offset).getCell(celdaDetalle).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }  
                 celdaDetalle+=1;
            }            
            offset = offset + 1;
          });

        }

        if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0){
          
          worksheet.mergeCells(`C${offset}:D${offset}`);
          worksheet.mergeCells(`E${offset}:F${offset}`);
          worksheet.mergeCells(`G${offset}:H${offset}`);
          worksheet.mergeCells(`I${offset}:J${offset}`);
          worksheet.mergeCells(`K${offset}:N${offset}`);

          headerCortes.forEach((text, index)=>{
          let currentCell = worksheet.getRow(offset).getCell(3 + (2 * index));

          if(text){
            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern:'solid',
              fgColor:{argb:'FFC5101A'}
            }
            currentCell.border = {
              top: {style:'thin'},
              left: {style:'thin'},
              bottom: {style:'thin'},
              right: {style:'thin'}
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }
          }
          });

         offset = offset + 1;
         turno.moduloDeCargaPlanillaDeTurnosCortes.forEach((turno: CorteTurno, index) => {

            worksheet.mergeCells(`C${offset}:D${offset}`);
            worksheet.mergeCells(`E${offset}:F${offset}`);
            worksheet.mergeCells(`G${offset}:H${offset}`);
            worksheet.mergeCells(`I${offset}:J${offset}`);
            worksheet.mergeCells(`K${offset}:N${offset}`);

            worksheet.getRow(offset).getCell(3).value = turno.motivosDeCorte.nombre;
            worksheet.getRow(offset).getCell(5).value = turno.horaInicio;
            worksheet.getRow(offset).getCell(7).value = turno.horaFin;
            worksheet.getRow(offset).getCell(9).value = turno.tiempoTotal;
            worksheet.getRow(offset).getCell(11).value = turno.observaciones;
            
            let celdaCorte = 3
            for (let indexCell = 1; indexCell<=5; indexCell++) {
                 worksheet.getRow(offset).getCell(celdaCorte).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} }
                 celdaCorte += 2; 
            }
            
            offset = offset + 1;
          });

       }
        
      });


      //renderizo detalles


      for(let dia=0; dia<=diaOrder; dia++){
        let CantRows = 0;
        let fechaDia;
          this.planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
            //si es el mismo día cuento las filas que voy a necesitar para calcular el merge
            if(turno.indexDia == dia){
              fechaDia = new Date(turno.fecha);
              if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0){
                CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length + 1);
              }
              if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0){
                CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosCortes?.length + 1);
              }
            }
          });
          
          const diaTurno = `${(fechaDia.getDate())}`.padStart(2,'0');
          const mesTurno = `${(fechaDia.getMonth()+1)}`.padStart(2,'0');
          const anioTurno = fechaDia.getFullYear();
          const fechaTurno =  `${diaTurno}-${mesTurno}-${anioTurno}`;
          /* Contenido Fecha */
          worksheet.getCell(`A${baseCell + 1}`).value = fechaTurno;
          worksheet.getCell(`A${baseCell + 1}`).alignment = { vertical: 'middle', horizontal: 'center'}
          worksheet.getCell(`A${baseCell + 1}`).border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          }
          /* Cabeceras Fecha */
          worksheet.mergeCells(`A${baseCell + 1}:A${baseCell+(CantRows > 0 ? CantRows -1 : CantRows)}`);
          worksheet.getCell(`A${baseCell}`).value = "Fecha";


          worksheet.getCell(`A${baseCell}`).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'FFCCFFCC'}
          };
          worksheet.getCell(`A${baseCell}`).border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          }
          worksheet.getCell(`A${baseCell}`).font = {
            name: 'Arial',
            family: 2,
            size: 11,
            bold: true
          }
          
          /* Cabeceras Turno */
          worksheet.getCell(`B${baseCell}`).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'FFCCFFCC'}
          };
          worksheet.getCell(`B${baseCell}`).border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          }
          worksheet.getCell(`B${baseCell}`).font = {
            name: 'Arial',
            family: 2,
            size: 11,
            bold: true
          }
          worksheet.getCell(`B${baseCell}`).value = "Turno";
          baseCell = baseCell + (CantRows > 0 ? CantRows : CantRows);
     
        }
      
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, fname + /*'-' + i +*/ '.xlsx');
      });
  }

   guardarTurno(Turno: PlanillaDeTurnos, reload: boolean = false){
     Turno.fecha =  new Date();
     this.moduloCargaService.guardarTurnoPlanillaDeTurnos(Turno, this.idModuloDeCarga).subscribe(res => {
       this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos.push(Turno);
       this.fillPlanilla();
     }, error => {
      this.confirmationDialogService.confirm('¡Error!', 'No se ha podido guardar el turno.', 'Cerrar', '', null, null, Tipoalerta.Error)
     })
   };

   guardarTurnoGeneral(dia, turno, enviado: boolean = false){
    let Turno:PlanillaDeTurnos = this.getTurnos(dia)['controls'][turno]['controls'];
    
    try {
      
      let moduloDeCargaPlanillaDeTurnosCortes = [];
      let moduloDeCargaPlanillaDeTurnosDetallesLiquido = [];
     
      for (const index in Turno.moduloDeCargaPlanillaDeTurnosCortes['controls']) {
          moduloDeCargaPlanillaDeTurnosCortes.push(Turno.moduloDeCargaPlanillaDeTurnosCortes['controls'][index].value);
      }

      for (const index in Turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido['controls']) {
           const turnoDetalle = Turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido['controls'][index];

        
           const turnoDestinoSel   = this.destinos.filter(destino => destino.id === turnoDetalle.value.destino)
           const turnoDestinoVal   = turnoDestinoSel.length > 0 ?  turnoDestinoSel[0]: 0
           const lineaIdVal        = turnoDetalle.value.linea;
           const tkVal             = turnoDetalle['controls'].tk.value;
           const bodegaParcelVal   = turnoDetalle.value.bodegaParcel;
           const materialPuertoVal = turnoDetalle['controls'].materialPuerto.value;
           
           if ( turnoDestinoVal != '0' && lineaIdVal != '' &&
                tkVal != '' && bodegaParcelVal != '' &&
                materialPuertoVal != '')  
              {
         
                 const objTurnosDetalles = {
                   bodegaParcel   : turnoDetalle.value.bodegaParcel,
                   cantidad       : turnoDetalle['controls'].cantidad.value != '' ? turnoDetalle['controls'].cantidad.value : 0,
                   destino        : turnoDestinoVal,
                   exportador     : turnoDetalle.value.exportador,
                   id             : turnoDetalle.value.id,
                   linea_id       : turnoDetalle.value.linea,
                   medidaFinalCM  : turnoDetalle.value.medidaFinalCM   !='' ? turnoDetalle.value.medidaFinalCM   : 0,
                   medidaFinalMM  : turnoDetalle.value.medidaFinalMM   !='' ? turnoDetalle.value.medidaFinalMM   : 0,
                   medidaInicialCM: turnoDetalle.value.medidaInicialCM !='' ? turnoDetalle.value.medidaInicialCM : 0,
                   medidaInicialMM: turnoDetalle.value.medidaInicialMM !='' ? turnoDetalle.value.medidaInicialMM : 0,
                   temperatura    : turnoDetalle.value.temperatura     !='' ? turnoDetalle.value.temperatura     : 0,
                   MaterialPuerto : turnoDetalle['controls'].materialPuerto.value,
                   Tk             : turnoDetalle['controls'].tk.value
                 }
                 moduloDeCargaPlanillaDeTurnosDetallesLiquido.push(objTurnosDetalles);
              }
      }
       
      let planillaTurno = {
        Fecha: Turno.turnoPuerto['value'].fecha,
        guardadoPorTablerista : Turno.guardadoPorTablerista['value'],
        id: Turno.id['value'],
        moduloDeCargaPlanillaDeTurnosCortes: moduloDeCargaPlanillaDeTurnosCortes,
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: moduloDeCargaPlanillaDeTurnosDetallesLiquido,
        turnoPuerto: Turno.turnoPuerto['value'].turnoPuerto
      }

      
      if (moduloDeCargaPlanillaDeTurnosCortes.length == 0 && moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0){
          var texto = "No se puede guardar, debido a que no se han completado la información para el registro del corte o turno.";
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Success)
            .then((confirmed) => {
              if (confirmed)
              return;
              else
                return;
            }).catch();
      }else if (planillaTurno.guardadoPorTablerista == true) {
        var texto = "El turno ya ha sido guardado anteriormente.";
        this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Success)
          .then((confirmed) => {
            if (confirmed)
            return;
            else
              return;
          }).catch();
      }else{
        this.confirmationDialogService.confirm( enviado ? "Enviar turno" : "Guardar turno", "Está seguro que desea " +  enviado ? "enviar" : "guardar" + " el turno?", "Aceptar", "Cancelar")
        .then((confirmed) => {
            this.moduloCargaService.guardarTurnoPlanillaDeTurnos(planillaTurno, this.idModuloDeCarga, enviado).subscribe(res => {

              this.confirmationDialogService.confirm('¡Atención!', 'Se guardaron los cambios en el turno correctamente', 'Aceptar', '', null, null, Tipoalerta.Success);

                this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
                  if (resp.moduloDeCargaPlanillaDeTurnos.length > 0){
                      this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
                      const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
                      this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
                      this.fillPlanilla();
                  }
                });
            }, error => {
              console.log(error);
              this.confirmationDialogService.confirm("¡Error!", "No se ha podido " + enviado? "enviar" : "guardar" + " el turno.", "Cerrar", "", null, null, Tipoalerta.Error)
            })       
        })
        .catch((e) => {
          this.hideSpinner.emit(false)
          return;
        });
      }
    }catch(error) {
      console.error(error);
    }
  };


  
}
