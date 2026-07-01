import { Component, OnInit } from '@angular/core';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';
import { SessionService } from 'app/shared/servicios/session.service';

@Component({
  selector: 'app-embarques',
  templateUrl: './embarques.component.html',
  styleUrls: ['./embarques.component.css']
})
export class EmbarquesComponent implements OnInit {

  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public mostrarFiltros: boolean = true;
  public filtroActual: any = {};
  public exportadores: any[] = [];
  public materiales: any[] = [];

  constructor(
    private operacionesService: OperacionesPuertoService,
    private sessionService: SessionService
  ) {}

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
    this.operacionesService.listarCargas(filtro, pagina).subscribe(
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
