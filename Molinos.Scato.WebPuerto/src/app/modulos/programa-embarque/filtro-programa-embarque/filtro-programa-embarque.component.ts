import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';

@Component({
  selector: 'app-filtro-programa-embarque',
  templateUrl: './filtro-programa-embarque.component.html',
  styleUrls: ['./filtro-programa-embarque.component.css']
})
export class FiltroProgramaEmbarqueComponent implements OnInit {
  //#region Variables
  private listaProductos;
  private listaBuques;
  private listaMuelles;
  private configListaMultiple;
  private filtroBuquedaForm: FormGroup; ;
  combos: any;
  filtros = new Subject<any>();
  public estaCargando = true;
  //#endregion

  // #region Observables
  constructor(private formBuilder: FormBuilder, private store: Store,
    private programaEmbarqueService: ProgramaEmbarqueService) {
    this.setFiltroBuquedaForm();
    this.onBuscar();
  }

  ngOnInit(): void {
    this.setListaCombos();
  }

  public getListaProductos() {
    return this.listaProductos;
  }
  public getListaBuques() {
    return this.listaBuques;
  }
  public getListaMuelleDeCarga() {
    return this.listaMuelles;
  }
  public onLimpiarBusqueda() {
  }
  public getConfigListaMultiple() {
    return this.configListaMultiple;
  }

  public getConfigListaMultipleBuque() {
    return {
      singleSelection: false,
      primaryKey: 'id',
      textField: 'descripcionCorta',
      selectAllText: 'Marcar Todos',
      unSelectAllText: 'Desmarcar Todos',
    };
  }

  public setConfigListaMultiple() {
    this.configListaMultiple = {
      singleSelection: false,
      primaryKey: 'id',
      textField: 'descripcionCorta',
      allowSearchFilter: true, 
      itemsShowLimit: 1,
      enableCheckAll: false,
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
      producto: '',
      buque: [],
      muelle: '',
      fecha: '',
      zarpo: null
    });
    
    this.SetearAnioMesActual();

  }

  onLimpiarFiltros() {
    this.filtroBuquedaForm.controls.producto.setValue('');
    this.filtroBuquedaForm.controls.buque.setValue(null);
    this.filtroBuquedaForm.controls.muelle.setValue('');
    this.filtroBuquedaForm.controls.fecha.setValue('');
    this.filtroBuquedaForm.controls.zarpo.setValue(null);
    this.onBuscar();    
  }
  onBuscar() {
    this.estaCargando = true;
    this.programaEmbarqueService.ListarProgramaEmbarque(
      null,
      null,
      this.filtroBuquedaForm.controls.fecha.value,
      this.filtroBuquedaForm.controls.buque.value?.some(b => b.descripcion === "TODOS") ? null : this.filtroBuquedaForm.controls.buque.value || null,
      this.filtroBuquedaForm.controls.muelle.value,
      this.filtroBuquedaForm.controls.producto.value,
      this.filtroBuquedaForm.controls.zarpo.value)
    this.estaCargando = false;
  }

  public setListaCombos() {
    this.programaEmbarqueService.obtenerDatosComboProgramaEmbarque().subscribe(
      (data: any) => {
        this.combos = data;
        this.listaBuques = ['TODOS', ...this.combos.listaBuque.filter(b => b != null)];
        this.listaMuelles = this.combos.listaMuelle;
        this.listaProductos = this.combos.listaProducto.filter(p => p != null);
      }
    )

  }

  public getFiltroBusquedaForm() {
    
    return this.filtroBuquedaForm;
  }


}
