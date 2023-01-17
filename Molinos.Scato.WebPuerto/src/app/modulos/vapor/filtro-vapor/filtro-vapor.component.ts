import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';

@Component({
  selector: 'app-filtro-vapor',
  templateUrl: './filtro-vapor.component.html',
  styleUrls: ['./filtro-vapor.component.css']
})
export class FiltroVaporComponent implements OnInit {
  //#region Variables
  private listaBandera;
  private buque;
  private listaTipoBuque: string[] = ['Bulk Carrier', 'Oil Tanker'];
  private configListaMultiple;
  private filtroBuquedaForm: FormGroup; ;
  combos: any;
  filtros = new Subject<any>();
  public estaCargando = true;
  //#endregion

  // #region Observables
  constructor(private formBuilder: FormBuilder, private store: Store,
    private programaEmbarqueService: ProgramaEmbarqueService, 
    private embarqueService: EmbarqueService) {
    this.setFiltroBuquedaForm();
    this.onBuscar();
  }

  ngOnInit(): void {
    this.setListaCombos();
  }

  public getListaBandera() {
    return this.listaBandera;
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
      idField: 'id',
      textField: 'descripcionCorta',
      selectAllText: 'Marcar Todos',
      unSelectAllText: 'Desmarcar Todos',
    };
  }

  private SetearAnioMesActual(){
    const date= new Date()
    const month=("0" + (date.getMonth() + 1)).slice(-2)
    const year=date.getFullYear();
    this.filtroBuquedaForm['controls'].fecha.setValue(`${year}-${month}`)

  }

  public setFiltroBuquedaForm() {
    this.filtroBuquedaForm = this.formBuilder.group({
      bandera: '',
      buque: '',
      imo: '',
      tipoBuque: '',
    });
    
    this.SetearAnioMesActual();

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
    this.programaEmbarqueService.ListarProgramaEmbarque(
      null,
      null,
      this.filtroBuquedaForm.controls.bandera.value,
      this.filtroBuquedaForm.controls.buque.value,
      this.filtroBuquedaForm.controls.imo.value,
      this.filtroBuquedaForm.controls.tipoBuque.value)
    this.estaCargando = false;
  }

  public setListaCombos() {
    this.embarqueService.obtenerBanderas().subscribe(
      (data: any) => {
        this.listaBandera = data;
      }
    )
  }

  public getFiltroBusquedaForm() {    
    return this.filtroBuquedaForm;
  }


}
