import { Component, OnInit } from '@angular/core';
import { EmbarquesPorBuquesService } from 'app/shared/servicios/puerto-logistica/embarques-por-buques.service';

@Component({
  selector: 'app-embarques-por-buques',
  templateUrl: './embarques-por-buques.component.html',
  styleUrls: ['./embarques-por-buques.component.css']
})
export class EmbarquesPorBuquesComponent implements OnInit {

  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public itemsPorPagina: number = 10;
  public cargando: boolean = false;
  public mostrarFiltros: boolean = true;
  public filtroActual: any = {};

  constructor(private embarquesService: EmbarquesPorBuquesService) {}

  ngOnInit(): void {
    this.cargar();
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  cargar(filtro: any = {}, pagina: number = 1): void {
    this.cargando = true;
    this.filtroActual = filtro;
    this.paginaActual = pagina;
    this.embarquesService.listar(filtro, pagina, 'Fecha', 'Asc', this.itemsPorPagina).subscribe(
      res => {
        if (Array.isArray(res)) {
          this.items = res;
          const primerItem = this.items.length > 0 ? this.items[0] : null;
          this.itemsTotales = this.obtenerNumero(primerItem?.itemsTotales ?? primerItem?.ItemsTotales, this.items.length);
          this.itemsPorPagina = this.obtenerNumero(primerItem?.itemPorPagina ?? primerItem?.itemsPorPagina ?? primerItem?.ItemsPorPagina, this.itemsPorPagina);
          this.paginaActual = this.obtenerNumero(primerItem?.pagina ?? primerItem?.Pagina, pagina);
        } else {
          this.items = res?.Items || res?.items || [];
          this.itemsTotales = this.obtenerNumero(res?.ItemsTotales ?? res?.itemsTotales, this.items.length);
          this.itemsPorPagina = this.obtenerNumero(res?.ItemsPorPagina ?? res?.itemsPorPagina, this.itemsPorPagina);
          this.paginaActual = this.obtenerNumero(res?.Pagina ?? res?.pagina, pagina);
        }

        this.cargando = false;
      },
      () => { this.cargando = false; }
    );
  }

  onFiltrar(filtro: any): void {
    this.cargar(filtro, 1);
  }

  onLimpiar(): void {
    this.cargar({}, 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cargar(this.filtroActual, pagina);
  }

  onCambiarItemsPorPagina(cantidad: number): void {
    this.itemsPorPagina = cantidad;
    this.cargar(this.filtroActual, 1);
  }

  private obtenerNumero(valor: any, defecto: number): number {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
  }
}
