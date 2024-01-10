import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Bandera } from '@ScatoModels/bandera';
import { VaporService } from '@ScatoServicios/vapor.service';

@Component({
  selector: 'app-filtro-vapor',
  templateUrl: './filtro-vapor.component.html',
  styleUrls: ['./filtro-vapor.component.css']
})
export class FiltroVaporComponent implements OnInit {
  //#region Variables  
  private buque;
  private listaTipoBuque: string[] = ['Bulk Carrier', 'Oil Tanker'];
  private configListaMultiple;
  private filtroBuquedaForm: FormGroup;
  listaBandera: string[];
  combos: any;
  filtros = new Subject<any>();
  public estaCargando = true;
  //#endregion

  // #region Observables
  constructor(private formBuilder: FormBuilder, private store: Store,
    private vaporService: VaporService, 
    private embarqueService: EmbarqueService) {
    this.setFiltroBuquedaForm();
    this.onBuscar();
  }

  ngOnInit(): void {
   
  }
  
  public getListaTipoBuque() {
    return this.listaTipoBuque;
  }

  public getConfigListaMultiple() {
    return this.configListaMultiple;
  }
  public setConfigListaMultiple() {
    this.configListaMultiple = {
      singleSelection: false,
      primaryKey: 'id',
      textField: 'descripcionCorta',
      selectAllText: 'Marcar Todos',
      unSelectAllText: 'Desmarcar Todos',
    };
  }

  public setFiltroBuquedaForm() {
    this.filtroBuquedaForm = this.formBuilder.group({
      bandera: '',
      buque: '',
      imo: '',
      tipoBuque: '',
    });    

  }

  onLimpiarFiltros() {
    this.filtroBuquedaForm.controls.bandera.setValue('');
    this.filtroBuquedaForm.controls.buque.setValue('');
    this.filtroBuquedaForm.controls.imo.setValue('');
    this.filtroBuquedaForm.controls.tipoBuque.setValue('');
    this.onBuscar();    
  }
  onBuscar() {
    this.estaCargando = true;
    this.vaporService.ListarVaporInformacion(
      null,
      null,  
      this.filtroBuquedaForm.controls.buque.value,
      this.filtroBuquedaForm.controls.imo.value,
      this.filtroBuquedaForm.controls.tipoBuque.value,
      this.filtroBuquedaForm.controls.bandera.value)
    this.estaCargando = false;
  } 

  public getFiltroBusquedaForm() {    
    return this.filtroBuquedaForm;
  }


}
