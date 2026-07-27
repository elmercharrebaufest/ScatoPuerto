import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReportePesadaService } from 'app/shared/servicios/puerto-logistica/reporte-pesada.service';

@Component({
  selector: 'app-reportes-por-turnos',
  templateUrl: './reportes-por-turnos.component.html',
  styleUrls: ['./reportes-por-turnos.component.css']
})
export class ReportesPorTurnosComponent implements OnInit {

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
  public ordenarPor: string = 'Fecha';
  public dirOrden: 'Asc' | 'Desc' = 'Asc';
  public totalesPagina: any = {};

  constructor(private reporteService: ReportePesadaService) {}

  ngOnInit(): void {
    this.cargarFiltros();
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  cargarFiltros(): void {
    this.reporteService.listarExportadores().subscribe(res => {
      const items = res || [];
      this.exportadores = items.map(x => ({
        Id: x.Id ?? x.id,
        Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion
      }));
    });

    this.reporteService.listarMateriales().subscribe(res => {
      const items = res || [];
      this.materiales = items.map(x => ({
        Id: x.Id ?? x.id,
        Descripcion: x.Descripcion ?? x.descripcion ?? x.Nombre ?? x.nombre
      }));
    });
  }

  onFiltrar(filtro: any): void {
    this.filtroActual = filtro;
    this.ordenarPor = 'Fecha';
    this.dirOrden = 'Asc';

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.cargar(1);
  }

  onLimpiar(): void {
    this.items = [];
    this.itemsTotales = 0;
    this.totalesPagina = {};
    this.filtroActual = {};
    this.ordenarPor = 'Fecha';
    this.dirOrden = 'Asc';
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  cargar(pagina: number): void {
    if (!this.filtroActual?.FechaDesde || !this.filtroActual?.FechaHasta) {
      this.items = [];
      this.itemsTotales = 0;
      this.totalesPagina = {};
      return;
    }

    this.cargando = true;
    this.paginaActual = pagina;

    this.reporteService.listar(
      this.filtroActual.FechaDesde,
      this.filtroActual.FechaHasta,
      this.filtroActual.Exportador_Id,
      this.filtroActual.Material_Id,
      pagina,
      this.ordenarPor,
      this.dirOrden
    ).subscribe(
      res => {
        if (Array.isArray(res)) {
          this.items = res;
          this.itemsTotales = res.length;
        } else {
          this.items = res?.Items || res?.items || [];
          this.itemsTotales = res?.ItemsTotales || res?.itemsTotales || this.items.length;
        }
        this.calcularTotalesPagina();
        this.cargando = false;
      },
      () => { this.cargando = false; }
    );
  }

  calcularTotalesPagina(): void {
    if (this.items.length === 0) {
      this.totalesPagina = {};
      return;
    }

    this.totalesPagina = {
      Total: this.items.reduce((sum, item) => sum + (parseFloat(item.Total || item.total) || 0), 0),
      RangoCeroASeis: this.items.reduce((sum, item) => sum + (parseFloat(item.RangoCeroASeis || item.rangoCeroASeis) || 0), 0),
      RangoSeisADoce: this.items.reduce((sum, item) => sum + (parseFloat(item.RangoSeisADoce || item.rangoSeisADoce) || 0), 0),
      RangoDoceADieciseis: this.items.reduce((sum, item) => sum + (parseFloat(item.RangoDoceADieciseis || item.rangoDoceADieciseis) || 0), 0),
      RangoDieciseisAveinticuatro: this.items.reduce((sum, item) => sum + (parseFloat(item.RangoDieciseisAveinticuatro || item.rangoDieciseisAveinticuatro) || 0), 0)
    };
  }

  onPage(page: PageEvent): void {
    this.cargar(page.pageIndex + 1);
  }

  onOrdenar(columna: string): void {
    if (this.ordenarPor === columna) {
      this.dirOrden = this.dirOrden === 'Asc' ? 'Desc' : 'Asc';
    } else {
      this.ordenarPor = columna;
      this.dirOrden = 'Asc';
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.cargar(1);
  }

  esColumnaOrdenada(columna: string): boolean {
    return this.ordenarPor === columna;
  }
}
