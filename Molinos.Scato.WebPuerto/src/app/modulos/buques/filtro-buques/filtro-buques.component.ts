import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import UtilesBuques from '../buques.funciones';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';

import { Select, Store } from '@ngxs/store';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ProductoState } from 'app/store/productos/material.state';
import { GetObtenerProductos } from 'app/store/productos/material.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-filtro-buques',
  templateUrl: './filtro-buques.component.html',
  styleUrls: ['./filtro-buques.component.css']
})
export class FiltroBuquesComponent implements OnInit, OnDestroy {

  // #region Variables
  private filtroBuquedaForm: FormGroup;
  private listaProductos;
  private listaAnios;
  private listaMeses;
  private listaProductos$: any;
  private configListaMultiple;
  // #endregion

  // #region Observables
  @Select(ProductoState.getListaProductos) productos$: Observable<MaterialPuerto[]>;
  // #endregion

  // #region Constructor
  constructor(private formBuilder: FormBuilder,
    private buqueSharingService: BuqueSharingService,
    private store: Store) {
    this.setFiltroBuquedaForm();
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {
    this.store.dispatch(new GetObtenerProductos());
    this.setListaAnios();
    this.setListaMeses();
    this.setListaProductos();
    //this.setCargarFiltroBusqueda();

  }

  ngOnDestroy() {
    this.listaProductos$.unsubscribe();
  }
  // #endregion

  // #region Metodos
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

  public setFiltroBuquedaForm() {
    this.filtroBuquedaForm = this.formBuilder.group({
      esResumenOperatoria : false,
      esBusqueda: false,
      esDetalle: false,
      esLimpiarBusqueda: false,
      mostrarPorEmbarque: false,
      mostrarOtrasOperaciones: false,
      vaporId: 0,
      embarqueId: 0,
      moduloDeCargaId: 0,
      anio: '',
      mes: '',
      producto: '',
      buque: '',
      destino: '',
      control: '',
      ata: ''
    });
  }

  public getFiltroBuquedaForm() {
    return this.filtroBuquedaForm;
  }

  public setListaAnios() {
    this.listaAnios = UtilesBuques.listarAnios();
  }

  public setListaMeses() {
    this.listaMeses = UtilesBuques.listarMeses();
  }

  public getListaAnios() {
    return this.listaAnios;
  }

  public getListaMeses() {
    return this.listaMeses;
  }

  public setListaProductos() {
    this.listaProductos$ = this.productos$.subscribe(data => {
      this.listaProductos = data;
      this.setConfigListaMultiple();
    });
  }

  public getListaProductos() {
    return this.listaProductos;
  }

  public setCargarFiltroBusqueda() {
    this.buqueSharingService.getFiltroBusques().subscribe(data => {
      if (data != undefined) {
        const esLimpiarBusqueda = data.controls.esLimpiarBusqueda.value;
        if (esLimpiarBusqueda) {
          this.filtroBuquedaForm.controls.anio.setValue('');
          this.filtroBuquedaForm.controls.mes.setValue('');
          this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
        }
      }
    });
  }

  // #endregion 

  // #region Eventos Controles
  onChangeBusqueda(event) {
    if (event != undefined) {
      this.filtroBuquedaForm.controls.esBusqueda.setValue(true);
      this.filtroBuquedaForm.controls.esLimpiarBusqueda.setValue(false);
      this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
    }
  }

  onChangeValues(event) {
    if (event != undefined) {
      this.filtroBuquedaForm.controls.esBusqueda.setValue(false);
      this.filtroBuquedaForm.controls.esDetalle.setValue(false);
      this.filtroBuquedaForm.controls.embarqueId.setValue(0);
      this.filtroBuquedaForm.controls.vaporId.setValue(0);
      this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
    }
  }

  onLimpiarFiltros() {
    this.filtroBuquedaForm.controls.anio.setValue('');
    this.filtroBuquedaForm.controls.mes.setValue('');
    this.filtroBuquedaForm.controls.producto.setValue('');
    this.filtroBuquedaForm.controls.buque.setValue('');
    this.filtroBuquedaForm.controls.destino.setValue('');
    this.filtroBuquedaForm.controls.control.setValue('');
    this.filtroBuquedaForm.controls.ata.setValue('');
    this.filtroBuquedaForm.controls.esDetalle.setValue(false);
    this.filtroBuquedaForm.controls.esLimpiarBusqueda.setValue(true);
    this.filtroBuquedaForm.controls.embarqueId.setValue(0);
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
  }
  // #endregion

}
