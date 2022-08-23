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

  constructor(
    private formBuilder: FormBuilder,
    confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
    private _procesoService: DatosEmbarquesProcesoService,
    private moduloCargaService: ModuloDeCargaService,
    private _tanquesService: EstadoTanquesService,
    private _lineasService: LineasService,
  ) {
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

  private obtenerDatosModuloCarga() {
    this.obtenerModuloDeCarga();
    this.idModuloDeCarga = this._procesoService.getModuloDeCargaId();
  }
  public onCalculaLitros(linea) {
    const temperaturaInicial = linea.controls['temperaturaInicial'].value;
    const alturaInicialCM = linea.controls['alturaInicialCM'].value;
    const alturaInicialMM = linea.controls['alturaInicialMM'].value;
    const tkInicial = linea.controls['tkInicial'].value.value;
    linea.controls['temperaturaFinal'].setValue(0);
    linea.controls['litros'].setValue(0);
    linea.controls['kilos'].setValue(0)
    linea.controls['temperaturaFinal'].setValue(temperaturaInicial);
    this._lineasService.obtenerLlenadoMilimetroPorTanque(alturaInicialCM, alturaInicialMM, '0' + tkInicial)
      .subscribe(res => {
        let resultado = res != null ? res : '0';
        const densidadInicial = linea.controls['densidadInicial'].value;
        const valResultado = resultado.toString().replace(',', '');

        linea.controls['litros'].setValue(valResultado, { emitEvent: false });
        if (densidadInicial != undefined || densidadInicial != null) {
          const kilosInicial = (Number(valResultado) * Number(densidadInicial));
          linea.controls['kilos'].setValue(kilosInicial, { emitEvent: false })
        }
      });
  }
  public onCalculaKilos(linea) {
    const temperaturaInicial = linea.controls['temperaturaInicial'].value;
    const alturaFinalCM = linea.controls['alturaFinalCM'].value;
    const alturaFinalMM = linea.controls['alturaFinalMM'].value;
    const tkInicial = linea.controls['tkInicial'].value.value;
    linea.controls['tkFinal'].setValue(0, { emitEvent: false })
    linea.controls['temperaturaFinal'].setValue(0, { emitEvent: false });
    linea.controls['temperaturaFinal'].setValue(temperaturaInicial, { emitEvent: false });
    this._lineasService.obtenerLlenadoMilimetroPorTanque(alturaFinalCM, alturaFinalMM, '0' + tkInicial)
      .subscribe(res => {
        let litrosFinal = res != null ? res : '0';
        litrosFinal = litrosFinal.toString().replace(',', '');
        const densidadFinal = linea.controls['densidadFinal'].value;
        const kilos = linea.controls['kilos'].value;
        console.log('resultado alturaFinalMM ')
        console.log('densidadFinal ', densidadFinal)
        console.log(' ', litrosFinal, ' ', densidadFinal, ' ', kilos)

        if ((litrosFinal != undefined || litrosFinal != null) &&
          (densidadFinal != undefined || densidadFinal != null) &&
          (kilos != undefined || kilos != null)
        ) {
          let kilosFinal = Number((Number(densidadFinal) * Number(litrosFinal)));
          linea.controls['tkFinal'].setValue(Number(kilos) - kilosFinal, { emitEvent: false })
        }
      });
  }

  private cargarLineasEmbarque() {
    console.log('entro a cargarLineasEmbarque');
    /*
    this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'].forEach((linea, indexLinea) => {
      linea.controls['alturaInicialCM'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          linea.controls['alturaInicialMM'].setValue(null, { emitEvent: false });
          if (current) {
            if (current > 0) {
              linea.controls['alturaInicialMM'].setValue(0, { emitEvent: false })
            }
            linea.controls['alturaInicialMM'].enable({ emitEvent: false });
          } else {
            linea.controls['alturaInicialMM'].disable({ emitEvent: false });
          }
        });

      linea.get('alturaInicialMM').valueChanges.pipe(startWith(null), pairwise())
        .subscribe(([previous, current]) => {
          console.log('previo alturaInicialMM')
          if (current && linea.controls['alturaInicialCM'].value && linea.controls['tkInicial']) {
            console.log('entro alturaInicialMM')
            this._lineasService.obtenerLlenadoMilimetroPorTanque(linea.controls['alturaInicialCM'].value, current, '0' + linea.controls['tkInicial'].value.value)
              .subscribe(res => {
                let resultado = res != null ? res : '0';
                const densidadInicial = linea.controls['densidadInicial'].value;
                console.log('resultado alturaInicialMM ')
                console.log(' ', resultado, ' ', densidadInicial)
                const valResultado = resultado.toString().replace(',', '');
                console.log(' ', valResultado, ' ', densidadInicial)

                linea.controls['litros'].setValue(valResultado, { emitEvent: false });
                if (densidadInicial != undefined || densidadInicial != null) {
                  const kilosInicial = (Number(valResultado) * Number(densidadInicial));
                  linea.controls['kilos'].setValue(kilosInicial, { emitEvent: false })
                }
              });
          } else {
            linea.controls['litros'].setValue(null, { emitEvent: false });
          }
        });

      linea.get('alturaFinalCM').valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          linea.controls['alturaFinalMM'].setValue(null, { emitEvent: false });
          if (current) {
            if (current > 0) {
              linea.controls['alturaFinalMM'].setValue(0, { emitEvent: false })
            }
            linea.controls['alturaFinalMM'].enable({ emitEvent: false });
          } else {
            linea.controls['alturaFinalMM'].disable({ emitEvent: false });
          }
        });

      linea.controls['alturaFinalMM'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          console.log('previo alturaFinalMM')

          if (current && linea.controls['alturaFinalCM'].value && linea.controls['tkInicial']) {
            console.log('entro alturaFinalMM')
            this._lineasService.obtenerLlenadoMilimetroPorTanque(linea.controls['alturaFinalCM'].value, current, '0' + linea.controls['tkInicial'].value.value)
              .subscribe(res => {
                let litrosFinal = res != null ? res : '0';
                litrosFinal = litrosFinal.toString().replace(',', '');
                const densidadFinal = linea.controls['densidadFinal'].value;
                const kilos = linea.controls['kilos'].value;
                console.log('resultado alturaFinalMM ')
                console.log('densidadFinal ', densidadFinal)
                console.log(' ', litrosFinal, ' ', densidadFinal, ' ', kilos)

                if ((litrosFinal != undefined || litrosFinal != null) &&
                  (densidadFinal != undefined || densidadFinal != null) &&
                  (kilos != undefined || kilos != null)
                ) {
                  let kilosFinal = Number((Number(densidadFinal) * Number(litrosFinal)));
                  linea.controls['tkFinal'].setValue(Number(kilos) - kilosFinal, { emitEvent: false })
                }
              });
          } else {
            linea.controls['tkFinal'].setValue(null, { emitEvent: false });
          }
        });

      linea.controls['temperaturaInicial'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          if (current && linea.controls['materialPuerto'].value) {
            linea.controls['temperaturaFinal'].setValue(current, { emitEvent: false });

          } else {
            linea.controls['temperaturaFinal'].setValue('', { emitEvent: false });
          }
        });
    });
    */
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
      tkInicial: [{ value: (x && this.tanquesOption != undefined) ? this.tanquesOption.find(t => t.value == x.tkInicial) : '', disabled: deshabilitar}],
      materialPuerto: [{ value: x?.materialPuerto ?? "", disabled: deshabilitar}],
      temperaturaInicial: [{ value: x && x.temperaturaInicial ? x.temperaturaInicial > 0 ? x.temperaturaInicial : "" : "", disabled: deshabilitar || esVicentin, }],
      alturaInicialCM: [{ value: x && x.alturaInicialCM ? x.alturaInicialCM > 0 ? x.alturaInicialCM : "" : "", disabled: deshabilitar || esVicentin }],
      alturaInicialMM: [{ value: x && x.alturaInicialMM ? x.alturaInicialMM > 0 ? x.alturaInicialMM : "" : "", disabled: deshabilitar || esVicentin }],
      densidadInicial: [{ value: x && x.densidadInicial ? x.densidadInicial > 0 ? x.densidadInicial : "" : "", disabled: true || esVicentin }],
      temperaturaFinal: [{ value: x && x.temperaturaFinal ? x.temperaturaFinal > 0 ? x.temperaturaFinal : "" : "", disabled: true || esVicentin }],
      litros: [{ value: x && x.litros ? x.litros > 0 ? x.litros : "" : "", disabled: true || esVicentin }],
      densidadFinal: [{ value: x && x.densidadFinal ? x.densidadFinal > 0 ? x.densidadFinal : "" : "", disabled: true || esVicentin }],
      alturaFinalCM: [{ value: x && x.alturaFinalCM ? x.alturaFinalCM > 0 ? x.alturaFinalCM : "" : "", disabled: deshabilitar || esVicentin }],
      alturaFinalMM: [{ value: x && x.alturaFinalMM ? x.alturaFinalMM > 0 ? x.alturaFinalMM : "" : "", disabled: deshabilitar || esVicentin }],
      kilos: [{ value: x && x.kilos ? x.kilos > 0 ? x.kilos : "" : "", disabled: true || esVicentin }],
      tkFinal: [{ value: x?.tkFinal ?? "", disabled: true || esVicentin }]
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
    this.lineasEmbarque.removeAt(pos);
    this.colorSelected.splice(pos, 1);
  }

  obtenerLineasEmbarque() {
    let lineas = this.lineasDeEmbarqueForm ? this.lineasDeEmbarqueForm.getRawValue().lineasEmbarque : null;

    if (lineas != null) {
      lineas.forEach((l, index) => {
        if (l.tkInicial.value == undefined) {
          lineas.splice(index, 1);
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
      lineaSel['controls'].alturaFinalCM.disable();
      lineaSel['controls'].alturaFinalMM.disable();
      lineaSel['controls'].alturaInicialCM.disable();
      lineaSel['controls'].alturaInicialMM.disable();
      lineaSel['controls'].temperaturaInicial.disable();


      lineaSel['controls'].alturaFinalCM.setValue('')
      lineaSel['controls'].alturaFinalCM.setValue('');
      lineaSel['controls'].alturaFinalMM.setValue('');
      lineaSel['controls'].alturaInicialCM.setValue('');
      lineaSel['controls'].alturaInicialMM.setValue('');
      lineaSel['controls'].temperaturaInicial.setValue('');
      lineaSel['controls'].densidadFinal.setValue('');
      lineaSel['controls'].litros.setValue('');
      lineaSel['controls'].densidadFinal.setValue('');
      lineaSel['controls'].densidadInicial.setValue('');
      lineaSel['controls'].temperaturaFinal.setValue('');
      lineaSel['controls'].kilos.setValue('');
      lineaSel['controls'].kilos.enable();

    }else {
      lineaSel['controls'].alturaFinalCM.enable();
      lineaSel['controls'].alturaFinalMM.enable();
      lineaSel['controls'].alturaInicialCM.enable();
      lineaSel['controls'].alturaInicialMM.enable();
      lineaSel['controls'].temperaturaInicial.enable();
      lineaSel['controls'].kilos.disable();
      
    }
    //#endregion
  }

  onFocusOutEvent(index: number) {
    const materialPuertoId = this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['materialPuerto'].value.id;
    let temperatura = this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaInicial'].value;
    temperatura = temperatura == '' ? 0 : temperatura;
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
      if (
        (item.tkInicial == '' || item.tkInicial == undefined) ||
        (item.materialPuerto == '' || item.materialPuerto == undefined)
      ) {
        erroresLinea = true;
        return;
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

}
