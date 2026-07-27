import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

export type TablaCargasModo = 'embarques' | 'embarques-por-buques';

@Component({
  selector: 'app-tabla-cargas',
  templateUrl: './tabla-cargas.component.html',
  styleUrls: ['./tabla-cargas.component.css']
})
export class TablaCargasComponent implements OnChanges {

  @ViewChild('paginator') paginator: MatPaginator;
  @Input() items: any[] = [];
  @Input() itemsTotales: number = 0;
  @Input() paginaActual: number = 1;
  @Input() itemsPorPagina: number = 10;
  @Input() cargando: boolean = false;
  @Input() modo: TablaCargasModo = 'embarques-por-buques';
  @Input() ordenColumna: string = '';
  @Input() ordenDireccion: string = 'Desc';
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() cambiarItemsPorPagina = new EventEmitter<number>();
  @Output() seleccionarCarga = new EventEmitter<any>();
  @Output() modificarCarga = new EventEmitter<any>();
  @Output() ordenar = new EventEmitter<{ columna: string; direccion: string }>();

  public orderedByColumn: string = '';
  public orderDirection: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.paginaActual && this.paginator) {
      const pagina = changes.paginaActual.currentValue as number;
      if (this.paginator.pageIndex !== pagina - 1) {
        this.paginator.pageIndex = pagina - 1;
      }
    }
    if (changes.itemsPorPagina && this.paginator) {
      const cantidad = changes.itemsPorPagina.currentValue as number;
      if (this.paginator.pageSize !== cantidad) {
        this.paginator.pageSize = cantidad;
      }
    }
    if (changes.ordenColumna) {
      this.orderedByColumn = changes.ordenColumna.currentValue || '';
    }
    if (changes.ordenDireccion) {
      const dir = changes.ordenDireccion.currentValue;
      if (!dir) {
        this.orderDirection = 0; 
      } else {
        this.orderDirection = dir === 'Asc' ? 1 : -1;
      }
    }
  }

  orderColumnBy(column: string): void {
    if (column === this.orderedByColumn) {
      this.orderDirection = this.orderDirection === 1 ? -1 : 1;
    } else {
      this.orderedByColumn = column;
      this.orderDirection = 1;
    }
    this.ordenar.emit({
      columna: this.orderedByColumn,
      direccion: this.orderDirection > 0 ? 'Asc' : 'Desc'
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
    if (page.previousPageIndex !== undefined && page.previousPageIndex !== page.pageIndex) {
      // Cambió la página
      this.cambiarPagina.emit(page.pageIndex + 1);
    } else if (page.pageSize !== this.itemsPorPagina) {
      // Cambió el tamaño de página
      this.cambiarItemsPorPagina.emit(page.pageSize);
    }
  }

  onCambiarPagina(pagina: number): void {
    this.cambiarPagina.emit(pagina);
  }

  estadoDescripcion(carga: any): string {
    if (carga == null) return '';
    if (carga.error == null || carga.error === undefined) return 'OK';

    switch (carga.error) {
      case 1: return 'En Progreso';
      case 2: return 'Falta Inicio';
      case 3: return 'Falta Peso';
      case 4: return 'Diferencia de peso AW';
      case 5: return 'Fin inconsistente';
      case 6: return 'Faltan Balanzadas';
      default: return 'OK';
    }
  }

  estadoClase(carga: any): string {
    const est = this.estadoDescripcion(carga);
    switch (est) {
      case 'OK': return 'badge-success'; // Verde
      case 'En Progreso': return 'badge-warning'; // Naranja
      case 'Falta Inicio': 
      case 'Faltan Balanzadas': 
      case 'Diferencia de peso AW': 
      case 'Fin inconsistente': 
        return 'badge-danger'; // Rojo
      case 'Falta Peso': return 'badge-info'; // Celeste
      default: return 'badge-secondary';
    }
  }
}
