import { Component, OnInit } from '@angular/core';
import { EmbarquesPorBuquesService } from 'app/shared/servicios/embarques-por-buques.service';

@Component({
  selector: 'app-embarques-por-buques',
  templateUrl: './embarques-por-buques.component.html',
  styleUrls: ['./embarques-por-buques.component.css']
})
export class EmbarquesPorBuquesComponent implements OnInit {

  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
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
    this.embarquesService.listar(filtro, pagina).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      err => { this.cargando = false; }
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
}
