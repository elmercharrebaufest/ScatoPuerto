import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filtro-programa-embarque',
  templateUrl: './filtro-programa-embarque.component.html',
  styleUrls: ['./filtro-programa-embarque.component.css']
})
export class FiltroProgramaEmbarqueComponent implements OnInit {
  private listaProductos;
  private listaBuques;
  private listaMuelles;
  constructor() { }

  ngOnInit(): void {
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
  public onBuscar(){
  }
  public onLimpiarBusqueda(){
  }
}
