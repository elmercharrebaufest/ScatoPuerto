import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReportePesadaService } from 'app/shared/servicios/reporte-pesada.service';

@Component({
  selector: 'app-reporte-pesada',
  templateUrl: './reporte-pesada.component.html',
  styleUrls: ['./reporte-pesada.component.css']
})
export class ReportePesadaComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public mostrarFiltros: boolean = true;
  public mensaje: string = 'Cargando datos';
  public filtroActual: any = {};
  public exportadores: any[] = [];
  public materiales: any[] = [];

  constructor(private reporteService: ReportePesadaService) {}

  ngOnInit(): void {
    this.cargarFiltros();
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  cargarFiltros(): void {
    this.reporteService.listarExportadores().subscribe(res => this.exportadores = res || []);
    this.reporteService.listarMateriales().subscribe(res => this.materiales = res || []);
  }

  onFiltrar(filtro: any): void {
    this.filtroActual = filtro;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.cargar(filtro, 1);
  }

  onLimpiar(): void {
    this.items = [];
    this.itemsTotales = 0;
  }

  cargar(filtro: any, pagina: number): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.reporteService.listar(
      filtro.FechaDesde,
      filtro.FechaHasta,
      filtro.Exportador_Id,
      filtro.Material_Id,
      pagina
    ).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      err => { this.cargando = false; }
    );
  }

  onPage(page: PageEvent): void {
    this.cargar(this.filtroActual, page.pageIndex + 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cargar(this.filtroActual, pagina);
  }
}
