import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { GetObtenerHistorialBuques, LoadingHistorialBuques } from 'app/store/buques/buques.actions';
import { BuquesState } from 'app/store/buques/buques.state';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-historial-buques',
  templateUrl: './historial-buques.component.html',
  styleUrls: ['./historial-buques.component.css']
})
export class HistorialBuquesComponent implements OnInit, OnDestroy {
  @Input() esRegresar: boolean = false;
  // #region Variables
  private listaHistorialBuques;
  private listaHistorialBuquesFiltro;
  private filtroBuquedaForm: FormGroup;
  private listaHistorialBuques$: any;
  private tamanioPagina = 6;
  private paginaActual: number = 1;
  private totalPaginas: number = 0;
  private listaPaginas: any;
  public buscarHistorialBuques: boolean = false;
  // #endregion

  // #region Observable
  @Select(BuquesState.getHistorialBuques) historialBuques$: Observable<any[]>;
  storeBuques: Subscription;
  // #endregion

  // #region Constructor
  constructor(private buqueSharingService: BuqueSharingService,
    private store: Store,
    private route: Router) {
    this.buqueSharingService.getFiltroBusques().subscribe(data => {
      this.filtroBuquedaForm = data;
      if (this.esRegresar) {
        this.filtroBuquedaForm?.controls?.esBusqueda?.setValue(true);
        this.esRegresar = false;
      }
      this.setCargarHistorialBuque();
    });
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit() {
    this.setListaHistorialBuques();
  }

  ngOnDestroy() {
    if (this.listaHistorialBuques$ != undefined) {
      this.listaHistorialBuques$.unsubscribe();
    }
    if (this.storeBuques != undefined || this.storeBuques != null) {
      this.storeBuques.unsubscribe();
    }
  }
  // #endregion

  // #region Metodos
  private setCargarHistorialBuque() {
    const esBusqueda = this.filtroBuquedaForm?.controls?.esBusqueda.value;
    const esLimpiarBusqueda = this.filtroBuquedaForm?.controls?.esLimpiarBusqueda.value;
    if (esLimpiarBusqueda) {
      this.listaHistorialBuques = null;
      this.listaHistorialBuquesFiltro = null;
      this.store.dispatch(new LoadingHistorialBuques());
      this.filtroBuquedaForm?.controls?.esLimpiarBusqueda.setValue(false);
      return;
    }

    if (esBusqueda) {
      const anio = this.filtroBuquedaForm?.controls.anio?.value;
      const mes = this.filtroBuquedaForm?.controls?.mes.value;
      if (anio > '' && mes > '') {
        this.buscarHistorialBuques = true
        this.setObtenerHistorialBuques();
      }
    } else {
      if (this.listaHistorialBuquesFiltro != null) {
        this.listaHistorialBuques = JSON.parse(JSON.stringify(this.listaHistorialBuquesFiltro));
        this.setCargarPaginas();
      }
    }
  }

  private setObtenerHistorialBuques() {

    const filtro = this.filtroBuquedaForm;

    if (filtro != null) {

      const filVaporId = filtro.controls.vaporId.value;
      const filAnio = filtro.controls.anio.value;
      const filMes = filtro.controls.mes.value;

      const vaporId: number = filVaporId > '' ? parseInt(filVaporId, 0) : 0;
      let anio: number = filAnio > '' ? parseInt(filAnio, 0) : 0;
      let mes: number = filMes > '' ? parseInt(filMes, 0) : 0;
      if (vaporId > 0) {
        anio = 0;
        mes = 0;

        this.store.dispatch(new LoadingHistorialBuques());
        this.store.dispatch(new GetObtenerHistorialBuques(anio, mes, vaporId));
      } else {
        if (anio > 0 && mes > 0) {
          this.store.dispatch(new LoadingHistorialBuques());
          this.store.dispatch(new GetObtenerHistorialBuques(anio, mes, vaporId));
        }
      }
    }
  }

  public setListaHistorialBuques() {
    this.storeBuques = this.historialBuques$.subscribe(data => {
      if (data !== null || data !== undefined) {
        if (data.length > 0) {
          data.forEach(item => {
            if (item.productoExportador != undefined && item.productoExportador != null) {
              var result = item.productoExportador.reduce(function (r, o) {
                var key = o.exportador_Id + '-' + o.materialPuerto_Id;

                if (!item.productoExportador[key]) {
                  item.productoExportador[key] = Object.assign({}, o); // create a copy of o
                  r.push(item.productoExportador[key]);
                } else {
                  item.productoExportador[key].toneladas += o.toneladas;
                }
                return r;
              }, []);
              item.productoExportador = result;
            }
          });

          const mostrarPorEmbarque = this.filtroBuquedaForm?.controls.mostrarPorEmbarque.value;
          if (mostrarPorEmbarque) {
            this.listaHistorialBuques = data.filter(x => x.embarqueId == this.filtroBuquedaForm.controls.embarqueId.value);
          } else {
            this.listaHistorialBuques = JSON.parse(JSON.stringify(data));
            this.listaHistorialBuquesFiltro = JSON.parse(JSON.stringify(data));
          }
          this.setCargarPaginas();
          this.buscarHistorialBuques = false;
        }else{
          this.buscarHistorialBuques = false;
        }
      }
    }, error => { },
      () => {
        this.buscarHistorialBuques = false;
      });

  }

  public getListaHistorialBuques() {
    return this.listaHistorialBuques;
  }

  public getFiltroBuques() {
    return this.filtroBuquedaForm;
  }

  public getFiltrosSeleccionado() {
    return this.filtroBuquedaForm.value;
  }
  // #endregion

  // #region Eventos Controles
  onVerHistorial(embarqueId, vaporId, moduloDeCargaId) {
    this.filtroBuquedaForm.controls.esBusqueda.setValue(true);
    this.filtroBuquedaForm.controls.esDetalle.setValue(true);
    this.filtroBuquedaForm.controls.mostrarPorEmbarque.setValue(true);
    this.filtroBuquedaForm.controls.mostrarOtrasOperaciones.setValue(false);
    this.filtroBuquedaForm.controls.embarqueId.setValue(embarqueId);
    this.filtroBuquedaForm.controls.vaporId.setValue(vaporId);
    this.filtroBuquedaForm.controls.moduloDeCargaId.setValue(moduloDeCargaId);
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
    this.route.navigate([`buques/operatoria/${vaporId}//${embarqueId}/buques`]);
  }
  // #endregion

  // #region Paginado de historial de buques

  private marcarPaginas() {
    let numeroRegistro = 1;
    let numeroPagina = 1;
    this.listaHistorialBuques.forEach((item) => {

      if (numeroRegistro > this.tamanioPagina) {
        numeroRegistro = 1;
        numeroPagina++;
      }
      item.numeroPaginado = numeroPagina;
      numeroRegistro++;
    });
  }

  public setPaginaActual(pagina) {
    this.paginaActual = pagina;
  }

  public getPaginaActual() {
    return this.paginaActual;
  }

  public getListaPaginas() {
    return this.listaPaginas;
  }

  public getTotalPaginas() {
    return this.totalPaginas;
  }

  private setCargarPaginas() {
    if (this.listaHistorialBuques != undefined) {
      const registros = this.listaHistorialBuques.length;
      this.totalPaginas = (registros / this.tamanioPagina);
      this.totalPaginas = Math.ceil(this.totalPaginas);
      this.listaPaginas = new Array(this.totalPaginas);
      this.marcarPaginas()
    }
  }

  // #endregion

}
