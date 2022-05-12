import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';
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
  lineas = [{ idLinea: 0, nombreLinea: '' }, { idLinea: 1, nombreLinea: 'Nueva' }, { idLinea: 2, nombreLinea: 'Vieja' },
  { idLinea: 3, nombreLinea: 'Vicentin' }, { idLinea: 4, nombreLinea: 'Biodiesel' }];
  lineasDeEmbarqueForm: FormGroup;
  colorSelected: any[] = new Array();

  moduloDeCarga: ModuloDeCarga;
  @Input() tanquesSeleccionados;

  constructor(
    private formBuilder: FormBuilder,
    confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
    private _procesoService: DatosEmbarquesProcesoService,
    private moduloCargaService: ModuloDeCargaService,
    private _tanquesService: EstadoTanquesService,
    private _lineasService: LineasService,
  ) {

    this._tanquesService.sendData.subscribe(resObj => {
      let tanks = new Array();
      for (var [key, value] of Object.entries(resObj.value)) {
        let tank = { [key]: value, value: key.substr(6), color: (value ? 'tanqueSi' : 'tanqueNo') }
        tanks.push(tank);
      }

      this.tanquesOption = tanks;
    });
    this.confirmationDialogService = confirmationDialogService;

  }

  ngOnChanges(){

    this._tanquesService.sendData.subscribe(resObj => {
      let tanks = new Array();
      for (var [key, value] of Object.entries(resObj.value)) {
        let tank = { [key]: value, value: key.substr(6), color: (value ? 'tanqueSi' : 'tanqueNo') }
        tanks.push(tank);
      }

      this.tanquesOption = tanks;
    });
      if(this.tanquesOption == undefined){
        let tanks = new Array();
        for (var [key, value] of Object.entries(this.tanquesSeleccionados.value)) {
          let tank = { [key]: value, value: key.substr(6), color: (value ? 'tanqueSi' : 'tanqueNo') }
          tanks.push(tank);
        }
        this.tanquesOption = tanks; 
      }
    
  }

  ngOnInit(): void {

    this._procesoService.sendEmbarque.subscribe(
      res => this.embarque = res
    )
    if (!this.embarque)
      this.embarque = this._procesoService.getEmbarqueSelected();
    this.cargarEmbarque(this.embarque.id);

    this.lineasDeEmbarqueForm = this.formBuilder.group({
      lineasEmbarque: this.formBuilder.array([this.initLineasEmbarque()]),
    });

    this.formInitialValues = this.lineasDeEmbarqueForm.getRawValue();
    this.obtenerModuloDeCarga();

    this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'].forEach((linea, indexLinea) => {
      linea.controls['alturaInicialCM'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          linea.controls['alturaInicialMM'].setValue(null, { emitEvent: false });
          if (current) {
            if(current > 0){
              linea.controls['alturaInicialMM'].setValue(0, {emitEvent: false })
            }
            linea.controls['alturaInicialMM'].enable({ emitEvent: false });
          } else {
            linea.controls['alturaInicialMM'].disable({ emitEvent: false });
          }
        });

      linea.controls['alturaInicialMM'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          if (current && linea.controls['alturaInicialCM'].value && linea.controls['tkInicial']) {
            this._lineasService.obtenerLlenadoMilimetroPorTanque(linea.controls['alturaInicialCM'].value, current, '0' + linea.controls['tkInicial'].value.value)
              .subscribe(res => {
                linea.controls['litros'].setValue(res, { emitEvent: false });
                if (linea.controls['densidadInicial'].value) {
                  let kilosInicial = (Number(res) * Number(linea.controls['densidadInicial'].value));
                  linea.controls['kilos'].setValue(kilosInicial, { emitEvent: false })
                }
              });
          } else {
            linea.controls['litros'].setValue(null, { emitEvent: false });
          }
        });

      linea.controls['alturaFinalCM'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          linea.controls['alturaFinalMM'].setValue(null, { emitEvent: false });
          if (current) {
            if(current > 0){
              linea.controls['alturaFinalMM'].setValue(0, {emitEvent: false })
            }
            linea.controls['alturaFinalMM'].enable({ emitEvent: false });
          } else {
            linea.controls['alturaFinalMM'].disable({ emitEvent: false });
          }
        });

      linea.controls['alturaFinalMM'].valueChanges.pipe(startWith(null as object), pairwise())
        .subscribe(([previous, current]) => {
          if (current && linea.controls['alturaFinalCM'].value && linea.controls['tkInicial']) {
            this._lineasService.obtenerLlenadoMilimetroPorTanque(linea.controls['alturaFinalCM'].value, current, '0' + linea.controls['tkInicial'].value.value)
              .subscribe(res => {
                let litrosFinal = res;
                let densidadFinal = linea.controls['densidadFinal'].value;
                if (litrosFinal && densidadFinal && linea.controls['kilos'].value) {
                  let kilosFinal = Number((Number(densidadFinal) * Number(litrosFinal)));
                  linea.controls['tkFinal'].setValue(Number(linea.controls['kilos'].value) - kilosFinal, { emitEvent: false })
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

      // linea.controls['temperaturaFinal'].valueChanges.pipe(startWith(null as object), pairwise())
      //   .subscribe(([previous, current]) => {
      //     if(current && linea.controls['materialPuerto'].value){
      //       this._lineasService.obtenerDensidadPorTemperaturaDeMaterial(linea.controls['materialPuerto'].value.id, current)
      //         .subscribe(res => {
      //           linea.controls['densidadFinal'].setValue(res, { emitEvent: false });
      //         });
      //     }
      //   });

      // linea.controls['sarasa'].valueChanges.pipe(startWith(null as object), pairwise())
      //   .subscribe(([previous, current]) => {});
    });
    this.idModuloDeCarga = this._procesoService.getModuloDeCargaId();
  }

  expandir()
  {
    document.getElementById('collapseLineasEmbarque').className = "collapse show";
  }

  cargarEmbarque(idEmbarque: number) {
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
    return this.formBuilder.group({
      id: x?.id ?? "",
      linea: x?.linea ?? "",
      tkInicial: (x && this.tanquesOption != undefined) ? this.tanquesOption.find(t => t.value == x.tkInicial) : '',
      materialPuerto: x?.materialPuerto ?? "",
      temperaturaInicial: [{ value: x && x.temperaturaInicial ? x.temperaturaInicial > 0 ? x.temperaturaInicial : "" : "", disabled: false }],
      alturaInicialCM: [{ value: x && x.alturaInicialCM ? x.alturaInicialCM > 0 ? x.alturaInicialCM : "" : "", disabled: false }],
      alturaInicialMM: [{ value: x && x.alturaInicialMM ? x.alturaInicialMM > 0 ? x.alturaInicialMM : "" : "", disabled: false }],
      densidadInicial: [{ value: x && x.densidadInicial ? x.densidadInicial > 0 ? x.densidadInicial : "" : "", disabled: true }],
      temperaturaFinal: [{ value: x && x.temperaturaFinal ? x.temperaturaFinal > 0 ? x.temperaturaFinal : "" : "", disabled: true }],
      litros: [{ value: x && x.litros ? x.litros > 0 ? x.litros : "" : "", disabled: true }],
      densidadFinal: [{ value: x && x.densidadFinal ? x.densidadFinal > 0 ? x.densidadFinal : "" : "", disabled: true }],
      alturaFinalCM: [{ value: x && x.alturaFinalCM ? x.alturaFinalCM > 0 ? x.alturaFinalCM : "" : "", disabled: false }],
      alturaFinalMM: [{ value: x && x.alturaFinalMM ? x.alturaFinalMM > 0 ? x.alturaFinalMM : "" : "", disabled: false }],
      kilos: [{ value: x && x.kilos ? x.kilos > 0 ? x.kilos : "" : "", disabled: true }],
      tkFinal: [{ value: x?.tkFinal ?? "", disabled: true }]
    });
  }

  get lineasEmbarque(): FormArray {
    return this.lineasDeEmbarqueForm.get("lineasEmbarque") as FormArray;
  }

  obtenerModuloDeCarga() {
    this.moduloDeCarga = this._procesoService.getModuloDeCarga();
    this.idModuloDeCarga = this._procesoService.getModuloDeCarga().id;
    if (this.moduloDeCarga.moduloDeCargaLineasDeEmbarque && this.moduloDeCarga.moduloDeCargaLineasDeEmbarque.length > 0) {
      this.lineasEmbarque.clear();

      this.moduloDeCarga.moduloDeCargaLineasDeEmbarque.forEach((x, index) => {
        this.lineasEmbarque.push(this.initLineasEmbarque(x))
      });
    }
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

  agregarLineasEmbarque() {
    this.lineasEmbarque.push(this.initLineasEmbarque());
  }

  eliminarLineasEmbarque(pos: number) {
    this.lineasEmbarque.removeAt(pos);
    this.colorSelected.splice(pos, 1);
  }

  obtenerLineasEmbarque() {
    let lineas = this.lineasDeEmbarqueForm ? this.lineasDeEmbarqueForm.getRawValue().lineasEmbarque : null;

    if (lineas != null){
      lineas.forEach( (l,index) => {
        if (l.tkInicial.value == undefined){
          lineas.splice(index, 1);
        }else{
          l.tkInicial = l.tkInicial.value;
        }
      });
    }
    return lineas;


  }

  onFocusOutEvent(index:number){
    const materialPuertoId = this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['materialPuerto'].value.id;
    let temperatura = this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaInicial'].value;
    temperatura = temperatura == '' ? 0: temperatura;
    if (temperatura == 0 ){
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaInicial'].setValue(0);
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['temperaturaFinal'].setValue(0);
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadInicial'].setValue(0);
      this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadFinal'].setValue(0);
      return;
    }
    
    this._lineasService.obtenerDensidadPorTemperaturaDeMaterial(materialPuertoId, temperatura)
              .subscribe(res => {
                if( res == 0 || !res){
                  const texto = 'No existe la densidad para los valores ingresados.';
                  this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success)
                  .then((confirmed) => {
                    if (confirmed) {
                    } else return;
                  }).catch(() => window.location.reload());
                }
                this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadInicial'].setValue(res, { emitEvent: false });
                this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['densidadFinal'].setValue(res, { emitEvent: false });
                if (this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['litros'].value) {
                  const kilosInicial = (Number(res) * Number(this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['litros'].value)).toFixed(3);
                  this.lineasDeEmbarqueForm.get('lineasEmbarque')['controls'][index]['controls']['kilos'].setValue(kilosInicial, { emitEvent: false })
                }
              });
  }

  guardar() {
    const lineasEmabarque = this.obtenerLineasEmbarque();
    let erroresLinea = false;
    lineasEmabarque.forEach(item =>{
      if (
          (item.linea == ''          || item.linea == undefined) ||
          (item.tkInicial == ''      || item.tkInicial == undefined) ||
          (item.materialPuerto == '' || item.materialPuerto == undefined)
         ){
          erroresLinea = true;
          return;
         }
    });
    if (erroresLinea){
        var texto = "No se puede guardar, debido a que no se han completado la información para el registro de linea.";
        this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Success)
            .then((confirmed) => {
              if (confirmed)  
              return;
              else
                return;
            }).catch();
    }else{
    this.moduloCargaService.guardarLineasDeEmbarque(this.obtenerLineasEmbarque(), this.idModuloDeCarga).subscribe( res => {
    let texto = "Se guardaron las lineas de embarque correctamente";
    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
  } );
}
  }

}
