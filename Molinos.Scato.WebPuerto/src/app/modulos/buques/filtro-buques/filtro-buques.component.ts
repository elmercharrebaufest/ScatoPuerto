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
  mes: string ;
  anio: string;
  desde: string = this.AnioMesActual();
  hasta: string = this.AnioMesActual();
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
    this.getMesActual();
    this.getAnioActual();   
    this.filtroBuquedaForm.controls.esBusqueda.setValue(true);
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
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
      anio: this.getAnioActual(),
      mes: this.getMesActual(),
      producto: '',
      buque: '',
      destino: '',
      control: '',
      ata: '',
      nombreExportador: '',
      desde: this.AnioMesActual(),
      hasta: this.AnioMesActual()
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

  public AnioMesActual(){
    return new Date().getFullYear() + '-' +(new Date().getMonth()+1);   
  }
  public getListaMeses() {
    return this.listaMeses;
  }

  public getMesActual() {
    return this.mes = (new Date().getMonth() + 1).toString();
  }

  public getAnioActual() {
    return this.anio = new Date().getFullYear().toString();
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
 
  onLimpiarFiltros() {
   
    this.filtroBuquedaForm.controls.producto.setValue('');
    this.filtroBuquedaForm.controls.buque.setValue('');
    this.filtroBuquedaForm.controls.destino.setValue('');
    this.filtroBuquedaForm.controls.control.setValue('');
    this.filtroBuquedaForm.controls.ata.setValue('');
    this.filtroBuquedaForm.controls.esDetalle.setValue(false);
    this.filtroBuquedaForm.controls.esLimpiarBusqueda.setValue(true);
    this.filtroBuquedaForm.controls.embarqueId.setValue(0);
    this.filtroBuquedaForm.controls.nombreExportador.setValue('');
    this.filtroBuquedaForm.controls.desde.setValue('');
    this.filtroBuquedaForm.controls.hasta.setValue('');
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
  }
  onBuscar(){
    this.filtroBuquedaForm.controls.esBusqueda.setValue(true);
    this.filtroBuquedaForm.controls.esLimpiarBusqueda.setValue(false); 
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
  }
  // #endregion 

}
