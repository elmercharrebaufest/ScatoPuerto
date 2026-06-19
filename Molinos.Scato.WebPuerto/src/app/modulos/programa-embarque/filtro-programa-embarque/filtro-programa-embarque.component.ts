import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { take } from 'rxjs/operators';

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
  private filtroBuquedaForm: FormGroup;;
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
      allowSearchFilter: true,
      itemsShowLimit: 1,
      enableCheckAll: false,
    };
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

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  public setFiltroBuquedaForm() {

    const fecha = this.AnioMesActual();

    this.filtroBuquedaForm = this.formBuilder.group({
      producto: '',
      buque: [],
      muelle: '',
      fecha: fecha,
      zarpo: null
    });

    const filtroGuardado = sessionStorage.getItem('filtroProgramaEmbarque');
    if (filtroGuardado) {
      this.filtroBuquedaForm.setValue(JSON.parse(filtroGuardado));
    }
  }

  onLimpiarFiltros() {
    this.filtroBuquedaForm.controls.producto.setValue('');
    this.filtroBuquedaForm.controls.buque.setValue(null);
    this.filtroBuquedaForm.controls.muelle.setValue('');
    this.filtroBuquedaForm.controls.fecha.setValue(this.AnioMesActual());
    this.filtroBuquedaForm.controls.zarpo.setValue(null);
    this.onBuscar();
  }

  async onBuscar() {
    sessionStorage.setItem('filtroProgramaEmbarque', JSON.stringify(this.filtroBuquedaForm.value));
    this.estaCargando = true;
    this.programaEmbarqueService.ListarProgramaEmbarque(
      null,
      null,
      this.filtroBuquedaForm.controls.fecha.value,
      this.filtroBuquedaForm.controls.buque.value?.some(b => b === "TODOS") ? '' : this.filtroBuquedaForm.controls.buque.value || '',
      this.filtroBuquedaForm.controls.muelle.value,
      this.filtroBuquedaForm.controls.producto.value,
      this.filtroBuquedaForm.controls.zarpo.value);
      
    await this.programaEmbarqueService.observablePrograma.pipe(take(1)).toPromise();
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
