import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { finalize, pairwise, startWith } from 'rxjs/operators';
// MODELOS
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { LineasDeEmbarque } from '@ScatoModels/linea-embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
// SERVICIOS
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { EstadoTanquesService } from '@ScatoServicios/estado-tanques.service';
import { LineasService } from '@ScatoServicios/lineas.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { forkJoin } from 'rxjs';
import { cpuUsage } from 'process';
import { regExpEscape } from '@ng-bootstrap/ng-bootstrap/util/util';

import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-lineas',
  templateUrl: './lineas.component.html',
  styleUrls: ['./lineas.component.css']
})
export class LineasComponent implements OnInit, OnChanges {
  confirmationDialogService: any;
  embarque: EmbarqueNav;
  formInitialValues: any;
  tanqueSi: boolean;
  tanquesOption: any;
  idModuloDeCarga: number;
  tanquesOptionAux: any[] = new Array();
  materialesPuerto: MaterialPuerto[];
  tipoLineaEmbarque: any;
  tipoLineaProductoTk: any;
  lineasDeEmbarqueForm: FormGroup;
  colorSelected: any[] = new Array();

  moduloDeCarga: ModuloDeCarga;
  esGuardadoActivo: boolean = true;
  @Input() tanquesSeleccionados;
  @Input() esCalidad: boolean = false;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(
    private formBuilder: FormBuilder,
    confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
    private _procesoService: DatosEmbarquesProcesoService,
    private moduloCargaService: ModuloDeCargaService,
    private _tanquesService: EstadoTanquesService,
    private _lineasService: LineasService,
    private session: SessionService,
  ) {
    this.user = this.session.getUser();
    this.creaFormLineasEmbarque();
    this._tanquesService.sendData.subscribe(resObj => {
      let tanks = new Array();
      for (var [key, value] of Object.entries(resObj.value)) {
        let tank = { [key]: value, value: key.substr(6), color: (value ? 'tanqueSi' : 'tanqueNo') }
        tanks.push(tank);
      }

      this.tanquesOption = tanks;
    });
    this.confirmationDialogService = confirmationDialogService;
    this.obtenerTipoLineaEmbarque();
  }

  ngOnChanges() {
    this._tanquesService.sendData.subscribe(resObj => {
      let tanks = new Array();
      for (var [key, value] of Object.entries(resObj.value)) {
        let tank = { [key]: value, value: key.substr(6), color: (value ? 'tanqueSi' : 'tanqueNo') }
        tanks.push(tank);
      }

      this.tanquesOption = tanks;
    });
    if (this.tanquesOption == undefined) {
      if (this.tanquesSeleccionados != undefined) {
        let tanks = new Array();
        for (var [key, value] of Object.entries(this.tanquesSeleccionados.value)) {
          let tank = { [key]: value, value: key.substr(6), color: (value ? 'tanqueSi' : 'tanqueNo') }
          tanks.push(tank);
        }
        this.tanquesOption = tanks;
      }
    }
  }

  ngOnInit(): void {
    this.cargarDatosLineas();

    if(!this.hasPermisoLiquido_ConformacionLineasEmb_Editar()) this.lineasDeEmbarqueForm.disable();
  }

  expandir() {
    document.getElementById('collapseLineasEmbarque').className = "collapse show";
  }

  private cargarDatosLineas() {
    this.obtenerEmbarque();
    forkJoin([
      this.cargarLineasEmbarque(),
      this.obtenerDatosModuloCarga(),
    ]
    );
  }

  private creaFormLineasEmbarque() {
    this.lineasDeEmbarqueForm = this.formBuilder.group({
      lineasEmbarque: this.formBuilder.array([this.initLineasEmbarque()]),
    });
    this.formInitialValues = this.lineasDeEmbarqueForm.getRawValue();
  }
  private obtenerTipoLineaEmbarque() {
    this.moduloCargaService.listarTipoLineaEmbarque().subscribe(res => {
      this.tipoLineaEmbarque = res;
    });
  }


  private obtenerEmbarque() {
    this._procesoService.sendEmbarque.subscribe(
      res => {
        this.embarque = res;
      });
    if (!this.embarque)
      this.embarque = this._procesoService.getEmbarqueSelected();
    this.cargarEmbarque(this.embarque.id);
  }

  public validateMedicion(event, linea, inicial:boolean): boolean {
    var rg = new RegExp(/^(\d)*(\,)?([0-9]{1})?$/);
    var str = inicial ? linea.controls.alturaInicialCMyMM.value.toString() : linea.controls.alturaFinalCMyMM.value.toString();
    if(rg.test(str + event.key)) return true;
    return false;

  }


  private obtenerDatosModuloCarga() {
    this.obtenerModuloDeCarga();
    this.idModuloDeCarga = this._procesoService.getModuloDeCargaId();
  }
  public onCalculaLitros(linea, inicial:boolean) {
    //El parametro inicial me indica para que altura calcular (Inicial = true o final = false)

    //en base al tk que tengo y a la altura obtengo los litros
    let litros = 0;
    const densidadInicial = linea.controls['densidadInicial'].value;
    let altura = inicial ? linea.controls['alturaInicialCMyMM'].value : linea.controls['alturaFinalCMyMM'].value;
    let tk = linea.controls['tkInicial'].value.value;

    this.obtenerLitros(altura, tk,linea, inicial).subscribe(result => {
      litros = result;
      let m3 = litros / 1000;
      let tn = this.calcularTn(this.calcularKilos(densidadInicial, litros));
      let salidaTk = 0

      if (inicial){
        linea.controls['kilos'].setValue(tn.toFixed(3).toString());
        linea.controls['litros'].setValue(m3.toString());
      }else{
        linea.controls['kilosFinales'].setValue(tn.toFixed(3).toString());
        linea.controls['litrosFinales'].setValue(m3.toString());

      }
       salidaTk  =  parseFloat(linea.controls['kilos'].value != ''? linea.controls['kilos'].value : 0) - parseFloat(linea.controls['kilosFinales'].value != ''? linea.controls['kilosFinales'].value : 0);
      linea.controls['tkFinal'].setValue(salidaTk.toFixed(3).toString());

    });


  }

  splitMediciones(medicion:Number): any[] {
    let arrMedicion = medicion.toString().split(',');
    if(arrMedicion != null){
      if(arrMedicion.length == 1){
        return [arrMedicion[0] == ''? 0 :arrMedicion[0], '0']
      }
      if(arrMedicion.length == 2){
        return [arrMedicion[0] != '' ? arrMedicion[0] : '0', arrMedicion[1] != '' ? arrMedicion[1] : '0']
      }
    }else{
      return ['0','0'];
    }


  }

  public onCalculaKilos(linea) {
    const temperaturaInicial = linea.controls['temperaturaInicial'].value;



  }

  calcularKilos(densidad: number, litros:number): number{
    return densidad * litros;
  }

  calcularTn(kilos:number){
    return kilos/1000;
  }

  obtenerLitros(altura:number, tk:string,linea:FormGroup, inicial:boolean){
    let arrMediciones = this.splitMediciones(altura);
    let cm = parseInt(arrMediciones[0]);
    let mm = parseInt(arrMediciones[1]);

    if(inicial){
      linea.controls['alturaInicialCM'].setValue(cm);
      linea.controls['alturaInicialMM'].setValue(mm);
      linea.controls['alturaInicialCMyMM'].setValue(cm + ',' + mm);
    }else{
      linea.controls['alturaFinalCM'].setValue(cm);
      linea.controls['alturaFinalMM'].setValue(mm);
      linea.controls['alturaFinalCMyMM'].setValue(cm + ',' + mm);
    }
    linea.controls['alturaFinalMM'].setValue(mm);
    return this._lineasService.obtenerLlenadoMilimetroPorTanque(cm, mm, '0' + tk)
  }

  private cargarLineasEmbarque() {
    console.log('entro a cargarLineasEmbarque');

  }

  private cargarEmbarque(idEmbarque: number) {
    this.embarqueService.obtenerEmbarque(idEmbarque).subscribe(
      res => {
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
      }, () => {
        this.confirmationDialogService.confirm('¡Error!', `Error al obtener el embarque ${idEmbarque}`, 'Cerrar', '', null, null, Tipoalerta.Error);
      });
  }

  initLineasEmbarque(x: LineasDeEmbarque = null) {
    let deshabilitar = this.esCalidad ? true : false;
    let esVicentin = x?.linea == 'Vicentin';
    return this.formBuilder.group({
      id: x?.id ?? "",
      linea: [{ value: x?.linea ?? "", disabled: deshabilitar }],
      tipoLineaEmbarque: [{ value: x?.tipoLineaEmbarque ?? "", disabled: deshabilitar }],
      tkInicial: [{ value: (x && this.tanquesOption != undefined) ? this.tanquesOption.find(t => t.value == x.tkInicial) : '', disabled: deshabilitar || esVicentin}],
      materialPuerto: [{ value: x?.materialPuerto ?? "", disabled: deshabilitar}],
      temperaturaInicial: [{ value: x && x.temperaturaInicial ? x.temperaturaInicial > 0 ? x.temperaturaInicial : "" : "", disabled: deshabilitar || esVicentin, }],
      alturaInicialCMyMM: [{ value: x?.alturaInicialCM >= 0 ? x.alturaInicialMM >= 0 ? `${x.alturaInicialCM},${x.alturaInicialMM}` :`${x.alturaInicialCM},0`:"", disabled: deshabilitar || esVicentin }],
      alturaInicialCM: x?.alturaInicialCM >= 0 ? x.alturaInicialCM : 0,
      alturaInicialMM: x?.alturaInicialMM >= 0 ? x.alturaInicialMM : 0,
      densidadInicial: [{ value: x && x.densidadInicial ? x.densidadInicial > 0 ? x.densidadInicial : "" : "", disabled: true || esVicentin }],
      temperaturaFinal: [{ value: x && x.temperaturaFinal ? x.temperaturaFinal > 0 ? x.temperaturaFinal : "" : "", disabled: true || esVicentin }],
      litros: [{ value: x && x.litros ? x.litros > 0 ? x.litros : "" : "", disabled: true || esVicentin }],
      densidadFinal: [{ value: x && x.densidadFinal ? x.densidadFinal > 0 ? x.densidadFinal : "" : "", disabled: true || esVicentin }],
      alturaFinalCM: x?.alturaFinalCM >= 0 ? x.alturaFinalCM : 0,
      alturaFinalMM: x?.alturaFinalMM >= 0 ? x.alturaFinalMM : 0,
      alturaFinalCMyMM: [{ value: x?.alturaFinalCM >= 0 ? x.alturaFinalMM >= 0 ? `${x.alturaFinalCM},${x.alturaFinalMM}` :`${x.alturaFinalCM},0`:"", disabled: deshabilitar || esVicentin }],
      kilos: [{ value: x && x.kilos ? x.kilos > 0 ? x.kilos : "" : "", disabled: true || esVicentin }],
      tkFinal: [{ value: x?.tkFinal ?? "", disabled: true || esVicentin }],
      litrosFinales:[{ value: x && x.litrosFinales ? x.litrosFinales > 0 ? x.litrosFinales : "" : "", disabled: deshabilitar || esVicentin }],
      kilosFinales:[{ value: x && x.kilosFinales ? x.kilosFinales > 0 ? x.kilosFinales : "" : "", disabled: deshabilitar || esVicentin }],
    });
  }

  get lineasEmbarque(): FormArray {
    return this.lineasDeEmbarqueForm.get("lineasEmbarque") as FormArray;
  }

  obtenerModuloDeCarga() {
    this.idModuloDeCarga = this._procesoService.getModuloDeCarga().id;

    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {

      this.moduloDeCarga = resp;

      if (this.moduloDeCarga.moduloDeCargaLineasDeEmbarque && this.moduloDeCarga.moduloDeCargaLineasDeEmbarque.length > 0) {
        this.lineasEmbarque.clear();
        this.moduloDeCarga.moduloDeCargaLineasDeEmbarque.forEach((x, index) => {
          this.lineasEmbarque.push(this.initLineasEmbarque(x))
        });
      }

    });
  }
  compareLineaEmbarque(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareLineas(c1: LineasDeEmbarque, c2: LineasDeEmbarque) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareTanque(c1: any, c2: any) {
    return c1 && c2 ? c1.value === c2.value : c1 === c2;
  }

  setClase(index: number) {
    let item = this.tanquesOption?.find(x => x.value == this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls'].tkInicial?.value?.value)
    return item?.color;
  }

  onAgregarLineasEmbarque() {
    if (this.esCalidad) return;
    this.lineasEmbarque.push(this.initLineasEmbarque());
  }

  onEliminarLineasEmbarque(pos: number) {
    if (this.esCalidad) return;

    this.confirmationDialogService.confirm('¡Atención!', "¿Seguro que desea eliminar la linea de embarque?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
    .then((confirmed) => {
      if (confirmed) {
        this.lineasEmbarque.removeAt(pos);
        this.colorSelected.splice(pos, 1);

        //Si no queda ninguna agrego una nueva al principio.
        if (this.lineasEmbarque.length == 0){
          this.lineasEmbarque.push(this.initLineasEmbarque());
        }
      } else return;
    }).catch();


  }

  obtenerLineasEmbarque() {
    let lineas = this.lineasDeEmbarqueForm ? this.lineasDeEmbarqueForm.getRawValue().lineasEmbarque : null;

    if (lineas != null) {
      lineas.forEach((l, index) => {
        if (l.tkInicial?.value == undefined) {
          // lineas.splice(index, 1);
          l.tkInicial = null;
        } else {
          l.tkInicial = l.tkInicial.value;
        }

      });
    }
    return lineas;


  }

  onLineaSeleccionada(lineaSel: FormGroup) {
    console.log('lineaSel-->>')
    console.log(lineaSel)
    const tipoLineaEmbarqueSel = lineaSel['controls']?.tipoLineaEmbarque?.value;
    lineaSel['controls']?.linea.setValue(tipoLineaEmbarqueSel?.linea);
    console.log(lineaSel)
    //#region Elige vicentin
    let selectedVicentin: boolean;
    selectedVicentin = lineaSel['controls'].tipoLineaEmbarque.value.linea == 'Vicentin'
    if(selectedVicentin){
      lineaSel['controls'].alturaFinalCMyMM.disable();
      lineaSel['controls'].alturaInicialCMyMM.disable();
      lineaSel['controls'].temperaturaInicial.disable();
      lineaSel['controls'].tkInicial.disable();
      lineaSel['controls'].kilos.disable();
      lineaSel['controls'].kilosFinales.disable();
      lineaSel['controls'].litrosFinales.disable();

      lineaSel['controls'].alturaFinalCMyMM.setValue(0)
      lineaSel['controls'].alturaInicialCMyMM.setValue(0);
      lineaSel['controls'].temperaturaInicial.setValue('');
      lineaSel['controls'].densidadFinal.setValue('');
      lineaSel['controls'].litros.setValue(0);
      lineaSel['controls'].litrosFinales.setValue(0);
      lineaSel['controls'].densidadFinal.setValue('');
      lineaSel['controls'].densidadInicial.setValue('');
      lineaSel['controls'].temperaturaFinal.setValue('');
      lineaSel['controls'].tkFinal.setValue('');
      lineaSel['controls'].kilos.setValue(0);
      lineaSel['controls'].kilosFinales.setValue(0);
      lineaSel['controls'].tkInicial.setValue('');
    }else {
      lineaSel['controls'].alturaFinalCMyMM.enable();
      lineaSel['controls'].alturaInicialCMyMM.enable();
      lineaSel['controls'].temperaturaInicial.enable();
      lineaSel['controls'].tkInicial.enable();
      lineaSel['controls'].kilosFinales.enable;
      lineaSel['controls'].litrosFinales.enable;



      // this.onCalculaLitros(lineaSel);
    }
    //#endregion
  }

  onFocusOutEvent(index: number, linea) {
    const materialPuertoId = this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['materialPuerto'].value.id;
    let temperatura = this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaInicial'].value;
    temperatura = temperatura == '' ? 0 : temperatura;
    linea['controls'].temperaturaFinal.setValue(temperatura);
    if (temperatura == 0) {
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaInicial'].setValue(0);
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaFinal'].setValue(0);
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadInicial'].setValue(0);
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadFinal'].setValue(0);
      return;
    }
    console.log('entro onFocusOutEvent')
    this._lineasService.obtenerDensidadPorTemperaturaDeMaterial(materialPuertoId, temperatura)
      .subscribe(res => {
        if (res == 0 || !res) {
          const texto = 'No existe la densidad para los valores ingresados.';
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Warning)
            .then((confirmed) => {
              if (confirmed) {
              } else return;
            }).catch();
        }
        this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadInicial'].setValue(res, { emitEvent: false });
        this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadFinal'].setValue(res, { emitEvent: false });
        if (this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['litros'].value) {
          const kilosInicial = (Number(res) * Number(this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['litros'].value)).toFixed(3);
          this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['kilos'].setValue(kilosInicial, { emitEvent: false })
          // this.onCalculaLitros(linea);
        }
      });
  }

  private validarLineasDuplicadas() {

    const lineasEmbarque = this.obtenerLineasEmbarque();
    let bValidarDuplicadas: boolean = false;
    let filtroLineas = [];

    lineasEmbarque.forEach(function (item) {
      console.log('filtroLineas...>>')
      console.log(filtroLineas)
      if (filtroLineas.length == 0) {
        filtroLineas.push({
          idTipoLinea: item.tipoLineaEmbarque.id,
          idMaterial: item.materialPuerto.id,
          tkInicial: item.tkInicial,
          cantidad: 0
        });
      } else {
        const linea = filtroLineas.findIndex(x => x.idTipoLinea == item.tipoLineaEmbarque.id &&
          x.idMaterial == item.materialPuerto.id &&
          x.tkInicial == item.tkInicial);
        if (linea <= -1) {
          filtroLineas.push({
            idTipoLinea: item.tipoLineaEmbarque.id,
            idMaterial: item.materialPuerto.id,
            tkInicial: item.tkInicial,
            cantidad: 0
          });
        }
      }
    });

    filtroLineas.forEach(filtro =>{
      const selLinea = lineasEmbarque.filter(item =>{
        return (filtro.idTipoLinea == item.tipoLineaEmbarque.id &&
                filtro.idMaterial == item.materialPuerto.id &&
                filtro.tkInicial == item.tkInicial)

      });
      filtro.cantidad = selLinea.length;
    })
    const cantidadLineas =  filtroLineas.filter(linea => {return linea.cantidad > 1 });
    if (cantidadLineas.length > 0)
      bValidarDuplicadas = true;
    return bValidarDuplicadas;
  }
  onGuardar() {
    if (this.esCalidad) return;
    const bValidarDuplicadas = this.validarLineasDuplicadas();
    if (bValidarDuplicadas){
      const mensaje = "No se puede guardar, debido a que existe un tipo de linea, producto y tanque duplicado en la conformacion de lineas de embarque.";
      this.confirmationDialogService.confirm('¡Atención!', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    this.esGuardadoActivo = false;
    const lineasEmabarque = this.obtenerLineasEmbarque();
    let erroresLinea = false;
    lineasEmabarque.forEach(item => {
      if (item.tipoLineaEmbarque.linea == 'Vicentin'){
        if ( (item.materialPuerto == '' || item.materialPuerto == undefined)){
          erroresLinea = true;
          return;
        }
      }else{
        if ((item.tkInicial == '' || item.tkInicial == undefined) ||
            (item.materialPuerto == '' || item.materialPuerto == undefined)){
          erroresLinea = true;
          return;
        }
      }
    });
    if (erroresLinea) {
      var texto = "No se puede guardar, debido a que no se han completado la información para el registro de linea.";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          this.esGuardadoActivo = true;
          if (confirmed)
            return;
          else
            return;
        }).catch();
    } else {

      console.log('this.obtenerLineasEmbarque()---->>>');
      console.log(this.obtenerLineasEmbarque());

      this.moduloCargaService.guardarLineasDeEmbarque(this.obtenerLineasEmbarque(), this.idModuloDeCarga).subscribe(res => {
        let texto = "Se guardaron las lineas de embarque correctamente";
        this.esGuardadoActivo = true;
        this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
        this.creaFormLineasEmbarque();
        this.cargarDatosLineas();
        this.moduloCargaService.actualizarPlanillaLiquido = true;
      });
    }
  }

  hasPermisoLiquido_ConformacionLineasEmb_Eliminar() {
    return this.user.permisos.find(p => p === this.permisosScato.Liquido_ConformacionLineasEmb_Eliminar);
  }
  hasPermisoLiquido_ConformacionLineasEmb_Editar() {
    return this.user.permisos.find(p => p === this.permisosScato.Liquido_ConformacionLineasEmb_Editar);
  }
}
