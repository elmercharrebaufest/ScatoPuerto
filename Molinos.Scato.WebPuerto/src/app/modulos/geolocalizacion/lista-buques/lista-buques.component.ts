import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GeolocalizacionSharingService } from '@ScatoServicios/geolocalizacion.sharing.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lista-buques',
  templateUrl: './lista-buques.component.html',
  styleUrls: ['./lista-buques.component.css']
})
export class ListaBuquesComponent implements OnInit, OnDestroy {

  // #region Variables
  private listaBuquesGeolocalizacion: any;
  @Output() listaBuquesGeolocalizacionFiltro = new EventEmitter();
  @Output() coordenadasBuqueSeleccionado = new EventEmitter();
  private listadoMuelleCarga = [];
  cargarListado = true;
  private tamanioPagina = 10;
  paginaActual: number = 1;
  numeroPagina: number = 0;
  totalPaginas: number = 0;
  listaPaginas;
  @Input() cerrar: boolean;
  buque: any;
  // #endregion

  // #region Observable
  private embarcacionSubject$: any
  // #endregion

  // #region Constructor
  constructor(private geolocalizacionSharingService: GeolocalizacionSharingService,
    private modalService: NgbModal,
    public config: NgbModalConfig,) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuquesLineUp().subscribe((data) => {
      if (data != null) {
        data.forEach((item) => {
          let fechaRecibida: Date = new Date(item.posicion.horaUTCPosicionRecibida);
          fechaRecibida.setHours(fechaRecibida.getHours() - 3);
          item.posicion.horaUTCPosicionRecibidaCalc = fechaRecibida;
          item.posicion.estado = this.setEstadoBuque(item.posicion.estado);
        })
        this.setListaBuquesGeolocalizacion(data);
        this.cargarListado = true;
        this.cargarPaginas();
      } else {
        this.cargarListado = false;
      }
    });
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit() {
    this.setListadoMuelleCarga(this.getListaBuquesGeolocalizacion());
  }

  ngOnDestroy() {
    this.embarcacionSubject$.unsubscribe();
  }
  // #endregion

  // #region Metodos
  private setEstadoBuque(estado) {
    let mensaje: string = '';

    switch (estado) {
      case 'At Anchor':
        mensaje = 'Fondeado';
        break;
      case 'Underway using Engine':
        mensaje = 'En viaje';
        break;
      case 'Moored':
        mensaje = 'Amarrado';
        break;
      case 'Underway':
        mensaje = 'En marcha';
        break;
      case 'Stopped':
        mensaje = 'Parado';
        break;
      default:
        mensaje = estado;
    }
    return mensaje;
  }
  private setListadoMuelleCarga(listaBuques: any) {
    if (listaBuques == undefined) return;
    this.listadoMuelleCarga = [];
    const listaMuelles = [...new Set(listaBuques.map(obj => obj.muelleCarga))];
    let muelleCargaTodos = {
      codigo: 'Todos',
      descripcion: 'Todos los muelles'
    }
    this.listadoMuelleCarga.push(muelleCargaTodos);

    listaMuelles.forEach((muelle) => {
      let muelleCarga = {
        codigo: muelle,
        descripcion: muelle
      }
      this.listadoMuelleCarga.push(muelleCarga);
    });
  }

  public getListadoMuelleCarga() {
    return this.listadoMuelleCarga;
  }

  private setListaBuquesGeolocalizacion(listaBuques: any) {
    this.listaBuquesGeolocalizacion = listaBuques;
  }

  public getListaBuquesGeolocalizacion() {
    return this.listaBuquesGeolocalizacion;
  }
  // #endregion

  // #region Eventos Controles
  public onChangeMuelleSeleccionado(event: any) {
    const muelleSeleccionado = event.target.value;
    if (muelleSeleccionado == 'Todos') {
      this.listaBuquesGeolocalizacion.forEach((item) => {
        item.esSeleccionadoPorMuelle = true;
      });
    } else {
      this.listaBuquesGeolocalizacion.forEach((item) => {
        item.esSeleccionadoPorMuelle = false;
        if (item.muelleCarga == muelleSeleccionado) {
          item.esSeleccionadoPorMuelle = true;
        }
      });
    }
    this.listaBuquesGeolocalizacionFiltro.emit(this.listaBuquesGeolocalizacion)
    this.geolocalizacionSharingService.setBuquesLineUp(this.listaBuquesGeolocalizacion);
  }

  public onChangeBuqueSeleccionado(event: any) {
    const embarqueId = event.target?.defaultValue;
    const esSeleccionado = event.target?.checked;
    let filtroBuque = this.listaBuquesGeolocalizacion.filter((item => item.embarque_Id == embarqueId));
    filtroBuque.esSeleccionado = esSeleccionado;
    this.listaBuquesGeolocalizacion.forEach((item) => {
      if (item.embarque_Id == embarqueId){
          item.esSeleccionado = esSeleccionado;
          return false;
      } 
    });
    this.listaBuquesGeolocalizacionFiltro.emit(this.listaBuquesGeolocalizacion)
    this.geolocalizacionSharingService.setBuquesLineUp(this.listaBuquesGeolocalizacion);
  }

  public onZoomBuqueSeleccionado(event) {
    
    const esSeleccionado = event.esSeleccionado;
    if (esSeleccionado) {
      const ubicacionPosicion = event.posicion;
      this.coordenadasBuqueSeleccionado.emit(ubicacionPosicion);
    }
  }

  public onOpenModalGeo(modal, geolocalizacion: any) {
    this.buque = geolocalizacion;
    this.modalService.open(modal, { windowClass: 'window-modal-geo', backdropClass: 'modal-geo' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }
  // #endregion

  // #region Paginado de geolocalizacion
  private marcarPaginas() {
    let numeroRegistro = 1;
    let numeroPagina = 1;
    this.listaBuquesGeolocalizacion.forEach((item) => {
      if (item.esSeleccionadoPorMuelle) {

        if (numeroRegistro > 10) {
          numeroRegistro = 1;
          numeroPagina++;
        }
        item.numeroPaginado = numeroPagina;
        numeroRegistro++;
      }
    });
  }

  public seleccionaPagina(pagina) {
    this.paginaActual = pagina;
  }

  private cargarPaginas() {
    const registros = this.getListaBuquesGeolocalizacion().filter(d => d.esSeleccionadoPorMuelle == true).length;
    this.totalPaginas = (registros / this.tamanioPagina);
    this.totalPaginas = Math.ceil(this.totalPaginas);
    this.listaPaginas = new Array(this.totalPaginas);
    this.marcarPaginas()
    this.paginaActual = 1;
  }
  // #endregion

}
