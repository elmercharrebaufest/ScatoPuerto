import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PesadaItem } from '../../models/aduana.models';

@Component({
  selector: 'app-pesadas',
  templateUrl: './pesadas.component.html',
  styleUrls: ['./pesadas.component.css']
})
export class PesadasComponent {
  @Input() titulo = 'Pesadas Online';
  @Input() mostrarFechaHasta = false;
  @Input() usarDatePicker = false;
  @Input() fechaDesdeReadonly = false;
  @Input() maxFecha = '';

  @Input() fechaDesde: string;
  @Input() fechaHasta: string;
  @Input() horaDesde = '00:00:00';
  @Input() horaHasta = '23:59:00';

  @Input() items: PesadaItem[] = [];
  @Input() paginaActual = 1;
  @Input() itemsPorPagina = 50;
  @Input() totalItems = 0;
  @Input() sortColumn = 'fecha';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() itemsPorPaginaOpciones: number[] = [10, 20, 50, 100];

  @Output() aceptar = new EventEmitter<void>();
  @Output() fechaDesdeChange = new EventEmitter<string>();
  @Output() fechaHastaChange = new EventEmitter<string>();
  @Output() horaDesdeChange = new EventEmitter<string>();
  @Output() horaHastaChange = new EventEmitter<string>();
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() ordenarColumna = new EventEmitter<string>();
  @Output() itemsPorPaginaChange = new EventEmitter<number>();

  onAceptar(): void {
    this.aceptar.emit();
  }

  onFechaDesdeChange(value: string): void {
    this.fechaDesdeChange.emit(value);
  }

  onFechaHastaChange(value: string): void {
    this.fechaHastaChange.emit(value);
  }

  onHoraDesdeChange(value: string): void {
    this.horaDesdeChange.emit(value);
  }

  onHoraHastaChange(value: string): void {
    this.horaHastaChange.emit(value);
  }

  onOrdenar(columna: string): void {
    this.ordenarColumna.emit(columna);
  }

  onItemsPorPaginaChange(value: string): void {
    const parsed = Number(value);
    if (!isNaN(parsed) && parsed > 0) {
      this.itemsPorPaginaChange.emit(parsed);
    }
  }

  esColumnaActiva(columna: string): boolean {
    return this.normalizarSortColumn(this.sortColumn) === columna;
  }

  getSortIcon(columna: string): string {
    if (!this.esColumnaActiva(columna)) {
      return '↕';
    }
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  private normalizarSortColumn(valor: string): string {
    if (!valor) {
      return '';
    }

    const v = valor.toLowerCase();
    const mapa: { [key: string]: string } = {
      fecha: 'fecha',
      numerobalanza: 'numeroBalanza',
      totalembarcado: 'totalEmbarcado',
      commodity: 'commodity',
      bodega: 'bodega',
      destino: 'destino',
      exportador: 'exportador',
      vapor: 'vapor',
      pesoprogramado: 'pesoProgramado'
    };

    return mapa[v] || valor;
  }

  get totalPaginas(): number {
    if (!this.itemsPorPagina || !this.totalItems) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPorPagina));
  }

  get paginaInicio(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get paginaFin(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.totalItems);
  }

  get paginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const inicio = Math.max(1, actual - 2);
    const fin = Math.min(total, inicio + 4);
    const paginas: number[] = [];
    for (let p = inicio; p <= fin; p++) {
      paginas.push(p);
    }
    return paginas;
  }
}
