import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ResumenOperatoriaEmbarque } from '@ScatoModels/Buques/resumenOperatoria';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';
import { GetObtenerHistorialBuques, LoadingHistorialBuques } from 'app/store/buques/buques.actions';
import { BuquesState } from 'app/store/buques/buques.state';
import { Observable, Subscription, interval } from 'rxjs';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { SessionService } from '@ScatoServicios/session.service';

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
  public buscarHistorialBuques: boolean = false;
  public esNoExisteRegistros = false;
  public esResumenOperatoria = false;
  private ritmoBajaCarga: number;
  public embarquesEnviandoSAP: Set<number> = new Set<number>();
  public pollingSubscription: Subscription;
  public isPollingRefresh = false;

  //paginado nuevo
  paginator: any;
  length = 0;
  pageSize: number;
  pageIndex: number = 0;
  pageSizeOptions = [10, 20, 50, 100];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  // #endregion

  // #region Observable
  @Select(BuquesState.getHistorialBuques) historialBuques$: Observable<any[]>;
  storeBuques: Subscription;
  // #endregion

  // #region Constructor
  constructor(private buqueSharingService: BuqueSharingService,
    private store: Store,
    private route: Router,
    private confirmationDialogService: ConfirmationDialogService,
    private _parametros: ParametrosService,
    private embarqueService: EmbarqueService,
    private session: SessionService) {
    this.buqueSharingService.getFiltroBusques().subscribe(data => {
      if (data != null && data != undefined) {
        this.filtroBuquedaForm = data;
        if (this.esRegresar) {
          this.filtroBuquedaForm?.controls?.esBusqueda?.setValue(true);
          this.esRegresar = false;
        }
        this.setCargarHistorialBuque();
      }
    });
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit() {
    this._parametros.obtenerParametro("toneladasBajaCarga").subscribe((res: any) => {
      this.ritmoBajaCarga = res.parametro2;
    });
  }

  ngOnDestroy() {
    if (this.listaHistorialBuques$ != undefined) {
      this.listaHistorialBuques$.unsubscribe();
    }

    if (this.storeBuques != undefined || this.storeBuques != null) {
      this.storeBuques.unsubscribe();
    }
    
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
  // #endregion

  // #region Metodos
  private setCargarHistorialBuque() {
    this.esResumenOperatoria = this.filtroBuquedaForm?.controls?.esResumenOperatoria.value;
    const esBusqueda = this.filtroBuquedaForm?.controls?.esBusqueda.value;
    const esLimpiarBusqueda = this.filtroBuquedaForm?.controls?.esLimpiarBusqueda.value;
    if (esLimpiarBusqueda) {
      this.esNoExisteRegistros = false;
      this.listaHistorialBuques = null;
      this.listaHistorialBuquesFiltro = null;
      this.filtroBuquedaForm?.controls?.esLimpiarBusqueda.setValue(false);
      this.resetPagination();
      return;
    }
    if (this.esResumenOperatoria) {
      this.setObtenerHistorialBuques();
    } else {
      if (esBusqueda && !esLimpiarBusqueda) {
        this.listaHistorialBuques = null;
        this.listaHistorialBuquesFiltro = null;
        this.setObtenerHistorialBuques();
      }
    }

  }

  private setObtenerHistorialBuques() {

    const filtro = this.filtroBuquedaForm;

    if (filtro != null) {
      if (!this.isPollingRefresh) {
        this.buscarHistorialBuques = true;
      }
      const filVaporId = filtro?.controls?.vaporId?.value;
      let desde = filtro?.controls?.desde?.value;
      let hasta = filtro?.controls?.hasta?.value;
      const producto = filtro.controls.producto.value != "" ?
        filtro?.controls?.producto?.value.map(({ descripcionCorta }) => descripcionCorta).join(",") : "";
      const muelle = filtro?.controls?.muelle?.value != "" ?
        filtro?.controls?.muelle?.value.map(({ descripcion }) => descripcion).join(",") : "";
      const buque = filtro?.controls?.buque?.value ?? "";
      const destino = filtro?.controls?.destino?.value ?? "";
      const control = filtro?.controls?.control?.value ?? "";
      const exportador = filtro?.controls?.nombreExportador?.value ?? "";
      const vaporId: number = filVaporId > '' ? parseInt(filVaporId, 0) : 0;
      const pagina: number = this.pageIndex ?? 0;
      const itemsPorPagina: number = this.pageSize ?? 0;

      if (vaporId > 0) {
        desde = null;
        hasta = null;
        if (!this.isPollingRefresh) {
          this.store.dispatch(new LoadingHistorialBuques());
        }
        this.store.dispatch(new GetObtenerHistorialBuques(vaporId, buque, destino, exportador,
          control, desde, hasta, producto, muelle, pagina, itemsPorPagina));
        this.setListaHistorialBuques();
      } else {
        if (desde != null && hasta != null) {
          if (!this.isPollingRefresh) {
            this.store.dispatch(new LoadingHistorialBuques());
          }
          this.store.dispatch(new GetObtenerHistorialBuques(vaporId, buque, destino, exportador,
            control, desde, hasta, producto, muelle, pagina, itemsPorPagina)).subscribe(result => {
              this.setListaHistorialBuques();
            });
        }
      }
    }
  }

  public setListaHistorialBuques() {
    this.esNoExisteRegistros = false;
    if (this.filtroBuquedaForm == null || this.filtroBuquedaForm == undefined) {
      this.buscarHistorialBuques = false;
      return;
    }
    if (!this.isPollingRefresh) {
      this.buscarHistorialBuques = true;
    }
    if (this.storeBuques) {
      this.storeBuques.unsubscribe();
    }
    this.storeBuques = this.historialBuques$.subscribe(data => {
      if (data == null || data == undefined) {
        this.buscarHistorialBuques = false;
        this.esNoExisteRegistros = true;
        this.resetPagination();
        return;
      }
      if (data.length === 0) {
        this.buscarHistorialBuques = false;
        this.esNoExisteRegistros = true;
        this.resetPagination();
        return;
      }

      if (data !== null || data !== undefined) {                        
        if (data.length > 0) {

          data = JSON.parse(JSON.stringify(data));

          this.length = data.length > 0 ? data[0].itemsTotales : data.length;
          this.pageSize = data.length > 0 ? data[0].itemsPorPagina : 10;
          this.pageIndex = data.length > 0 ? data[0].pagina : 1;

          data.forEach(item => {

            const muelles = item.muelleCarga?.length
              ? item.muelleCarga
              : [item.nombreMuelle];

            const esVicentinONouryon = muelles?.some(m =>
              m?.toUpperCase().includes('VICENTIN') ||
              m?.toUpperCase().includes('NOURYON')
            );

            if (item.esLiquido && esVicentinONouryon && item.productoExportador) {
              item.productoExportador.forEach(o => {
                o.toneladas = o.toneladas / 1000;
              });
            }

            if (item.productoExportador != undefined && item.productoExportador != null) {
              var result = item.productoExportador.reduce(function (r, o) {
                var key = o.exportador_Id + '-' + o.materialPuerto_Id;

                if (!item.productoExportador[key]) {
                  item.productoExportador[key] = Object.assign({}, o); // create a copy of o
                  r.push(item.productoExportador[key]);
                } else {
                  item.productoExportador[key].toneladas += o.toneladas;
                }

                item.productoExportador[key].toneladas = item.productoExportador[key].toneladas;

                return r;
              }, []);

              item.productoExportador = result;
            }

            item.agenciaControlPrivado = item.agentesControlPrivado.length > 0 ?
              item.agentesControlPrivado.map(a => a.nombre + " " + a.apellido).join(", ") : "";

            // Errores SAP
            let errorBruto = item.mensajeErrorSap || item.MensajeErrorSap;
            if (errorBruto) {
              if (errorBruto.includes("<EX_MESSAGE>")) {
                const match = errorBruto.match(/<EX_MESSAGE>(.*?)<\/EX_MESSAGE>/);
                const errorLimpio = match && match[1] ? match[1] : "Error en SAP";
                item.mensajeErrorSap = errorLimpio;
                item.MensajeErrorSap = errorLimpio; 
              } 
              else if (errorBruto.includes("<Exception>")) {
                const match = errorBruto.match(/<Exception>(.*?)<\/Exception>/);
                const errorLimpio = match && match[1] ? match[1] : "Error de sistema";
                item.mensajeErrorSap = errorLimpio;
                item.MensajeErrorSap = errorLimpio;
              }
            }
            
            // Desbloqueo
            const embId = item.embarqueId || item.EmbarqueId;
            const enProceso = item.enProceso || item.EnProceso;

            if (!enProceso && this.embarquesEnviandoSAP.has(embId)) {
                this.embarquesEnviandoSAP.delete(embId);
            }
          });
          
          const mostrarPorEmbarque = this.filtroBuquedaForm?.controls.mostrarPorEmbarque.value;
          if (mostrarPorEmbarque) {
            this.listaHistorialBuques = data.filter(x => x.embarqueId == this.filtroBuquedaForm.controls.embarqueId.value);
          } else {
            this.listaHistorialBuques = JSON.parse(JSON.stringify(data));
            this.listaHistorialBuquesFiltro = JSON.parse(JSON.stringify(data));
          }
          this.buscarHistorialBuques = false;
        } else {
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
  onVerHistorial(embarqueId, vaporId, moduloDeCargaId, nombreBuque, esLiquido) {
    const embarqueBuque = {
      embarqueId: embarqueId,
      vaporId: vaporId,
      moduloDeCargaId: moduloDeCargaId,
      nombreBuque: nombreBuque,
      esLiquido: esLiquido
    }
    localStorage.removeItem("embarqueBuque");
    localStorage.setItem("embarqueBuque", JSON.stringify(embarqueBuque));

    this.filtroBuquedaForm.controls.esResumenOperatoria.setValue(true);
    this.filtroBuquedaForm.controls.esBusqueda.setValue(true);
    this.filtroBuquedaForm.controls.esDetalle.setValue(true);
    this.filtroBuquedaForm.controls.mostrarPorEmbarque.setValue(true);
    this.filtroBuquedaForm.controls.mostrarOtrasOperaciones.setValue(false);
    this.filtroBuquedaForm.controls.embarqueId.setValue(embarqueId);
    this.filtroBuquedaForm.controls.vaporId.setValue(vaporId);
    this.filtroBuquedaForm.controls.moduloDeCargaId.setValue(moduloDeCargaId);
    const resumenOperatoriaEmbarque: ResumenOperatoriaEmbarque = {
      embarqueId: embarqueId,
      actualizarDatos: this.esResumenOperatoria ? true : false
    };
    this.buqueSharingService.setActualizarResumenOperatoria(resumenOperatoriaEmbarque);
    this.buqueSharingService.setFiltroFormulario(this.filtroBuquedaForm);
    this.route.navigate([`buques/operatoria/${vaporId}/${embarqueId}/buques`]);
  }

  hayCambiosParaEnviar(historial: any): boolean {
    return historial.TieneCambiosPendientes === true || historial.tieneCambiosPendientes === true;
  }

  onEnviarASAP(historial: any) {
    const embarqueId = historial.embarqueId !== undefined ? historial.embarqueId : historial.EmbarqueId;

    if (this.embarquesEnviandoSAP.has(embarqueId) || historial.enProceso || historial.EnProceso) {
        return;
    }

    const id = historial.embarqueId || historial.EmbarqueId;
    this.embarquesEnviandoSAP.add(id);
    historial.enProceso = true; // Bloqueo visual inmediato

    this.embarqueService.enviarEmbarqueSAP(id, this.session.getUser()?.username).subscribe(
      res => {
        // El backend encolo el comando exitosamente. Iniciar polling
        // para detectar cuando termina el procesamiento en segundo plano.
        this.iniciarPolling();
      },
      err => {
        // Error al intentar encolar
        this.embarquesEnviandoSAP.delete(id);
        historial.enProceso = false;

        const errorMsg = err.error && err.error.message ? err.error.message : "";
        if (errorMsg.includes("SYSTEM_ERROR")) {
          this.confirmationDialogService.alertar("Ocurrió un error de comunicación con SAP. Intente reenviar más tarde.");
        }
        else if (errorMsg.includes("Deberá al menos actualizar uno de los datos del embarque")) {
          this.confirmationDialogService.alertar("Deberá al menos actualizar uno de los datos del embarque para corregir el error devuelto por SAP.");
        }
        else {
          this.confirmationDialogService.alertar(errorMsg || "Ocurrió un error al intentar enviar a SAP.");
        }
      }
    );
  }

  iniciarPolling() {
    // Si ya existe un timer andando, no creamos otro
    if (this.pollingSubscription && !this.pollingSubscription.closed) return;

    this.pollingSubscription = interval(4000).subscribe(() => {
      if (this.embarquesEnviandoSAP.size === 0) {
        this.pollingSubscription.unsubscribe();
        return;
      }
      this.refreshSilencioso();
    });
  }

  private refreshSilencioso() {
    this.isPollingRefresh = true;
    this.setObtenerHistorialBuques();
    setTimeout(() => { this.isPollingRefresh = false; }, 500);
  }

  esEnvioSAPHabilitado(historial: any): boolean {
    const nroOpSap = historial.nroOpSap !== undefined ? historial.nroOpSap : historial.NroOpSap;
    const embarqueId = historial.embarqueId !== undefined ? historial.embarqueId : historial.EmbarqueId;

    if (!nroOpSap || !embarqueId) {
      return false;
    }

    return (Number(nroOpSap) - 10000) === Number(embarqueId);
  }
  // #endregion

  // #region Paginado
  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.disabled = false;
    this.setCargarHistorialBuque();
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.disabled = false;
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  resetPagination() {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.length = 0;
  }
  // #endregion

}
