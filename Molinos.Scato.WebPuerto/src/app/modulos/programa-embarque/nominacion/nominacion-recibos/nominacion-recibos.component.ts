import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Exportador } from '@ScatoModels/exportador';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { isThursday } from 'date-fns';

@Component({
  selector: 'app-nominacion-recibos',
  templateUrl: './nominacion-recibos.component.html',
  styleUrls: ['./nominacion-recibos.component.css']
})
export class NominacionRecibosComponent implements OnInit {

  private _nominacionParametros: NominacionParametros = null;

  constructor(private nominacionService: NominacionService,
              private programaEmbarqueService: ProgramaEmbarqueService,
              private confirmationDialogService: ConfirmationDialogService,
              private fb: FormBuilder,
              private planoDeCargaServices: PlanoDeCargaService) { 
    this.asignarNominacionParametros();
    this.inicializarCargadores();      
  }

  // recibos: NominacionRecibo[] = [];
  formRecibos: FormGroup;
  exportadores: Exportador[] = [];
  formatos: string[] = ["Asiático", "Europeo"];
  unidades: string[] = ["Kg", "Tn"];
  guardando: boolean = false;

  ngOnInit(): void {      

    this.obtenerRecibos();
  }
  
  agregarRecibo(){
     (this.formRecibos.controls.recibos as FormArray).push(this.fb.group({
      id: '',
      exportador: '', 
      formato: '', 
      unidad: '', 
      cantidad: '', 
      ajuste: '', 
      puertoDeCarga: '', 
      puertoDeDescarga: '', 
      descripcionesBienes: '', 
      recibosPorDia: false,
      mostrarDestinos: false,
      mostrarBodegas:  false,
    }));
  }

  eliminarRecibo(i: number){
    // this.formRecibos.splice(i,1);
  }

  get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  set nominacionParametros(value: NominacionParametros){
    this._nominacionParametros = value;
  }

  obtenerRecibos(): FormBuilder[]{
    this.formRecibos = this.inicializarFormNuevo();
    // this.programaEmbarqueService.obtenerProgramaEmbarqueRecibo(this._nominacionParametros.nominacion_Id).subscribe((res: NominacionRecibo[]) => {
      let FA: FormBuilder[];
    this.programaEmbarqueService.obtenerProgramaEmbarqueRecibo(31).subscribe((res: NominacionRecibo[]) => {
      if(res != null){
         res.forEach(element => {
          (this.formRecibos.controls["recibos"] as FormArray).push(this.fb.group({
            id: element == null? 0: element.id,
            exportador: element == null? '' : element.exportador, 
            formato: element == null? '' : element.formato,
            unidad: element == null? '' : element.unidad,
            cantidad: element == null? 0 : element.cantidad,
            ajuste: element == null? '': element.ajuste,
            puertoDeCarga: element == null? '' : element.puertoDeCarga,
            puertoDeDescarga: element == null? '' : element.puertoDeDescarga,
            descripcionesBienes: element == null? '' : element.descripcionesBienes,
            recibosPorDia: [{ value: element == null? false : element.recibosPorDia == true? true : false, disabled: false }],
            mostrarDestinos: [{ value: element == null? false : element.mostrarDestinos == true? true : false, disabled: false }],
            mostrarBodegas:  [{ value: element == null? false : element.mostrarBodegas == true? true : false, disabled: false }],
          }))
        })
      }else{

      }
      
    });
    return FA;
  }

  private asignarNominacionParametros(){
    this.nominacionService.NominacionParametros.subscribe(parametro =>{
      if (parametro!=null){
        const nominacionParametos: NominacionParametros = {
          nominacion_Id : parametro.nominacion_Id,
          actualizarDatoTecnico : parametro.actualizarDatoTecnico,
          actualizarRecibos  : parametro.actualizarRecibos,
          actualizarIntervenciones : parametro.actualizarIntervenciones,
          nominacion : null};
        this.nominacionParametros = nominacionParametos;
      }
    });
  }

  guardarRecibos(){
    this.guardando = true;
    this.programaEmbarqueService.registrarNominacionRecibo(31, this.formRecibos.controls["recibos"].value).subscribe((res: any)=> {
      this.guardando = false;
      this.confirmationDialogService.confirm('¡Atención!', 'Recibos guardados correctamente.', 'Aceptar', '', null, null, Tipoalerta.Success);
    }, ((e: any) => {
      this.guardando = false;
    }));
  }
  
  inicializarCargadores(){
    this.planoDeCargaServices.obtenerExportadores().subscribe((res: Exportador[]) => {
    this.exportadores = res;      
    })
  }

  eliminarItem(i: number){
    const value = this.formRecibos.controls["recibos"].value;
    this.formRecibos.controls["recibos"].setValue(
      value.slice(0, i).concat(
        value.slice(i + 1),
      ).concat(value[i]),
    );

    (this.formRecibos.controls["recibos"] as FormArray).removeAt(value.length - 1);
  } 

  inicializarFormNuevo(): FormGroup {
    return this.fb.group({
      recibos: this.fb.array([])
    })
  }

  compareFields(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}
