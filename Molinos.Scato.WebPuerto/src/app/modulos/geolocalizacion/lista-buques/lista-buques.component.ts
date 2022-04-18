import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GeolocalizacionSharingService } from '@ScatoServicios/geolocalizacion.sharing.service';

@Component({
  selector: 'app-lista-buques',
  templateUrl: './lista-buques.component.html',
  styleUrls: ['./lista-buques.component.css']
})
export class ListaBuquesComponent implements OnInit, OnDestroy  {
  
  private listaBuquesGeolocalizacion: any;
  @Output() listaBuquesGeolocalizacionFiltro = new EventEmitter();
  @Output() coordenadasBuqueSeleccionado = new EventEmitter();
  private embarcacionSubject$: any
  private listadoMuelleCarga = [];
  cargarListado = true;
  private tamanioPagina =10;
  paginaActual: number = 1;
  numeroPagina: number = 0;
  totalPaginas: number = 0;
  listaPaginas;

  constructor(private geolocalizacionSharingService : GeolocalizacionSharingService) {
    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuquesLineUp().subscribe((data) =>{

      if (data != null){
        this.setListaBuquesGeolocalizacion(data);
        this.cargarListado = true;
        this.cargarPaginas();
      }else{
        this.cargarListado = false;
      }      

    });
  }

  ngOnInit(){
    this.setListadoMuelleCarga(this.getListaBuquesGeolocalizacion());
  }
  
  setListadoMuelleCarga(listaBuques: any){
    this.listadoMuelleCarga = [];
    const listaMuelles = [...new Set( listaBuques.map(obj => obj.muelleCarga)) ];
    let muelleCargaTodos = {
      codigo: 'Todos',
      descripcion: 'Todos los muelles'
    }
    this.listadoMuelleCarga.push(muelleCargaTodos);
    
    listaMuelles.forEach((muelle)=>{      
      let muelleCarga = {
        codigo: muelle,
        descripcion: muelle
      }
      this.listadoMuelleCarga.push(muelleCarga);
    });
  }

  getListadoMuelleCarga(){
    return this.listadoMuelleCarga;
  }  

  setListaBuquesGeolocalizacion(listaBuques: any){
    this.listaBuquesGeolocalizacion = listaBuques;
  }
  
  getListaBuquesGeolocalizacion(){
    return this.listaBuquesGeolocalizacion;
  }
  
  onChangeMuelleSeleccionado(event: any){
    console.log(event.target.value)
    const muelleSeleccionado = event.target.value;
    if (muelleSeleccionado == 'Todos'){
      this.listaBuquesGeolocalizacion.forEach((item)=>{
        item.esSeleccionadoPorMuelle = true;
      });
    }else{
      this.listaBuquesGeolocalizacion.forEach((item)=>{
        item.esSeleccionadoPorMuelle = false;
        if (item.muelleCarga == muelleSeleccionado){
          item.esSeleccionadoPorMuelle = true;
        }
      });
    }
    this.listaBuquesGeolocalizacionFiltro.emit(this.listaBuquesGeolocalizacion)
    this.geolocalizacionSharingService.setBuquesLineUp(this.listaBuquesGeolocalizacion);
  }

  onChangeBuqueSeleccionado(event: any){
    const embarqueId = event.target?.defaultValue;
    const esSeleccionado = event.target?.checked;
    const indexEmbarque = this.listaBuquesGeolocalizacion.findIndex((item => item.embarque_Id == embarqueId));
    this.listaBuquesGeolocalizacion[indexEmbarque].esSeleccionado = esSeleccionado
    this.listaBuquesGeolocalizacionFiltro.emit(this.listaBuquesGeolocalizacion)
    this.geolocalizacionSharingService.setBuquesLineUp(this.listaBuquesGeolocalizacion);
  }
  
  onZoomBuqueSeleccionado(event) {
    const esSeleccionado = event.esSeleccionado;
    if(esSeleccionado){
      const ubicacionPosicion = event.posicion;
      this.coordenadasBuqueSeleccionado.emit(ubicacionPosicion);
    }
  }
  
  ngOnDestroy() {
    this.embarcacionSubject$.unsubscribe();
  }
  
  paginaSeleccionada(pagina){
    this.paginaActual = pagina;
  }

  private marcarPaginas(){
    let numeroRegistro = 1;
    let numeroPagina = 1;
    this.listaBuquesGeolocalizacion.forEach((item) =>{
        if(item.esSeleccionadoPorMuelle){
          
           if(numeroRegistro > 10) {
              numeroRegistro = 1;
              numeroPagina++;
           }
           item.numeroPaginado = numeroPagina;
           numeroRegistro++;
        }
    });
  }

  seleccionaPagina(pagina){
    this.paginaActual = pagina;
  }

  cargarPaginas(){
    
    const registros = this.getListaBuquesGeolocalizacion().filter(d => d.esSeleccionadoPorMuelle == true).length + 1;
    this.totalPaginas = (registros / this.tamanioPagina);
    this.totalPaginas = Math.ceil(this.totalPaginas);
    this.listaPaginas = new Array(this.totalPaginas);
    this.marcarPaginas()
    this.paginaActual = 1;
  }

}
