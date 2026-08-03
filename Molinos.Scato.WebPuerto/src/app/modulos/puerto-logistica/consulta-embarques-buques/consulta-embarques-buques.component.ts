import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ConsultaEmbarquesBuquesService } from 'app/shared/servicios/puerto-logistica/consulta-embarques-buques.service';

@Component({
  selector: 'app-consulta-embarques-buques',
  templateUrl: './consulta-embarques-buques.component.html',
  styleUrls: ['./consulta-embarques-buques.component.css']
})
export class ConsultaEmbarquesBuquesComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;

  public items: any[] = [];
  public itemsConBuque: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public pageIndex: number = 0;
  public cargando: boolean = false;
  public mostrarFiltros: boolean = true;
  public mensaje: string = 'Cargando datos';

  public vapores: any[] = [];
  public exportadores: any[] = [];
  public destinos: any[] = [];
  public materiales: any[] = [];

  public vaporesFiltrados: any[] = [];
  public exportadoresFiltrados: any[] = [];
  public destinosFiltrados: any[] = [];
  public materialesFiltrados: any[] = [];

  public filtroActual: any = {};
  public ordenarPor: string = 'Fecha';
  public dirOrden: 'Asc' | 'Desc' = 'Desc';

  public pageSize: number = 10;

  constructor(private service: ConsultaEmbarquesBuquesService) {}

  ngOnInit(): void {
    this.cargarFiltros();
    this.cargar(1);
  }

  cargarFiltros(): void {
    this.service.listarVapores().subscribe(res => {
      this.vapores = (res || []).map(x => ({ Id: x.Id ?? x.id, Nombre: x.Nombre ?? x.nombre }));
      this.vaporesFiltrados = [...this.vapores];
    });

    this.service.listarExportadores().subscribe(res => {
      this.exportadores = (res || []).map(x => ({ Id: x.Id ?? x.id, Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion }));
      this.exportadoresFiltrados = [...this.exportadores];
    });

    this.service.listarDestinos().subscribe(res => {
      this.destinos = (res || []).map(x => ({ Id: x.Id ?? x.id, Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion }));
      this.destinosFiltrados = [...this.destinos];
    });

    this.service.listarMateriales().subscribe(res => {
      this.materiales = (res || []).map(x => ({ Id: x.Id ?? x.id, Descripcion: x.Descripcion ?? x.descripcion ?? x.Nombre ?? x.nombre }));
      this.materialesFiltrados = [...this.materiales];
    });
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  onFiltrar(filtro?: any): void {
    this.filtroActual = filtro || {};
    this.irPrimeraPagina();
  }

  onLimpiar(): void {
    this.filtroActual = {};
    this.ordenarPor = 'Fecha';
    this.dirOrden = 'Desc';
    this.irPrimeraPagina();
  }

  cargar(pagina: number): void {
    this.cargando = true;
    this.paginaActual = pagina;

    this.service.listar(this.filtroActual, pagina, this.ordenarPor, this.dirOrden, this.pageSize).subscribe(
      res => {
        if (Array.isArray(res)) {
          this.items = res;
          const primerItem = this.items.length > 0 ? this.items[0] : null;
          this.itemsTotales = this.obtenerNumero(
            primerItem?.itemsTotales
            ?? primerItem?.ItemsTotales
            ?? primerItem?.total
            ?? primerItem?.Total,
            this.items.length
          );
          this.pageSize = this.obtenerNumero(
            primerItem?.itemPorPagina
            ?? primerItem?.itemsPorPagina
            ?? primerItem?.ItemsPorPagina,
            this.pageSize
          );
          this.pageIndex = this.obtenerNumero(primerItem?.pagina ?? primerItem?.Pagina, pagina) - 1;
        } else {
          this.items = res?.Items || res?.items || [];
          this.itemsTotales = this.obtenerTotalRegistros(res);
          this.pageSize = this.obtenerNumero(res?.ItemsPorPagina ?? res?.itemsPorPagina, this.pageSize);
          this.pageIndex = this.obtenerNumero(res?.Pagina ?? res?.pagina, pagina) - 1;
        }
        this.aplicarAgrupacionBuque();
        this.cargando = false;
      },
      () => { this.cargando = false; }
    );
  }

  aplicarAgrupacionBuque(): void {
    let ultimoVapor: any = null;

    this.itemsConBuque = (this.items || []).map(item => {
      const vaporActual = item.VaporId ?? item.vaporId ?? item.Vapor ?? item.vapor;
      const mostrarBuque = vaporActual !== ultimoVapor;
      ultimoVapor = vaporActual;

      return {
        ...item,
        _mostrarBuque: mostrarBuque
      };
    });
  }

  onPage(page: PageEvent): void {
    this.pageSize = page.pageSize;
    this.pageIndex = page.pageIndex;
    this.cargar(page.pageIndex + 1);
  }

  onOrdenar(columna: string): void {
    if (this.ordenarPor === columna) {
      this.dirOrden = this.dirOrden === 'Asc' ? 'Desc' : 'Asc';
    } else {
      this.ordenarPor = columna;
      this.dirOrden = 'Asc';
    }
    this.irPrimeraPagina();
  }

  esColumnaOrdenada(columna: string): boolean {
    return this.ordenarPor === columna;
  }

  private irPrimeraPagina(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.cargar(1);
  }

  private obtenerTotalRegistros(res: any): number {
    return this.obtenerNumero(
      res?.ItemsTotales
      ?? res?.itemsTotales
      ?? res?.Total
      ?? res?.total
      ?? res?.CantidadTotal
      ?? res?.cantidadTotal,
      this.items.length
    );
  }

  private obtenerNumero(valor: any, defecto: number): number {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : defecto;
  }
}
