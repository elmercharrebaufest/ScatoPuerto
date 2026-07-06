import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

export type TablaCargasModo = 'embarques' | 'embarques-por-buques';

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
  @Input() modo: TablaCargasModo = 'embarques-por-buques';
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() seleccionarCarga = new EventEmitter<any>();
  @Output() modificarCarga = new EventEmitter<any>();

  public orderedByColumn: string = '';
  public orderDirection: number = 1;

  orderColumnBy(column: string): void {
    if (column === this.orderedByColumn) {
      this.orderDirection = -this.orderDirection;
    } else {
      this.orderedByColumn = column;
      this.orderDirection = 1;
    }
    this.items = [...this.items].sort((a, b) => {
      const va = a[column] ?? '';
      const vb = b[column] ?? '';
      if (va > vb) return this.orderDirection;
      if (va < vb) return -this.orderDirection;
      return 0;
    });
  }

  onSeleccionar(carga: any): void {
    this.seleccionarCarga.emit(carga);
  }

  onModificar(carga: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.modificarCarga.emit(carga);
  }

  onPage(page: PageEvent): void {
    this.cambiarPagina.emit(page.pageIndex + 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cambiarPagina.emit(pagina);
  }

  estadoDescripcion(carga: any): string {
    if (carga == null) return '';
    if (carga.estado) return carga.estado;
    switch (carga.error) {
      case 0: return 'OK';
      case 1: return 'En Progreso';
      case 2: return 'Falta Inicio';
      case 3: return 'Falta Peso';
      case 4: return 'Diferencia de peso AW';
      case 5: return 'Faltan Balanzadas';
      default: return '';
    }
  }

  estadoClase(carga: any): string {
    const est = this.estadoDescripcion(carga);
    switch (est) {
      case 'OK': return 'badge-success';
      case 'En Progreso': return 'badge-info';
      case 'Falta Inicio':
      case 'Falta Peso':
      case 'Faltan Balanzadas':
      case 'Diferencia de peso AW': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }
}
