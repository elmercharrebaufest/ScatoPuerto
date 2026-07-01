import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-tabla-cargas',
  templateUrl: './tabla-cargas.component.html',
  styleUrls: ['./tabla-cargas.component.css']
})
export class TablaCargasComponent {

  @ViewChild('paginator') paginator: MatPaginator;
  @Input() items: any[] = [];
  @Input() itemsTotales: number = 0;
  @Input() paginaActual: number = 1;
  @Input() cargando: boolean = false;
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() seleccionarCarga = new EventEmitter<any>();

  onSeleccionar(carga: any): void {
    this.seleccionarCarga.emit(carga);
  }

  onPage(page: PageEvent): void {
    this.cambiarPagina.emit(page.pageIndex + 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cambiarPagina.emit(pagina);
  }
}
