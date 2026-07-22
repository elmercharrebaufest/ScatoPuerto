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
  public cargando: boolean = false;
  public mostrarFiltros: boolean = true;
  public mensaje: string = 'Cargando datos';

  public exportadores: any[] = [];
  public destinos: any[] = [];
  public materiales: any[] = [];

  public filtroVaporDesc: string = '';
  public filtroExportadorId: number | null = null;
  public filtroDestinoId: number | null = null;
  public filtroMaterialId: number | null = null;

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
    this.service.listarExportadores().subscribe(res => {
      this.exportadores = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion
      }));
    });

    this.service.listarDestinos().subscribe(res => {
      this.destinos = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion
      }));
    });

    this.service.listarMateriales().subscribe(res => {
      this.materiales = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Descripcion: x.Descripcion ?? x.descripcion ?? x.Nombre ?? x.nombre
      }));
    });
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  onFiltrar(): void {
    this.filtroActual = {};
    if (this.filtroVaporDesc) { this.filtroActual['VaporDesc'] = this.filtroVaporDesc; }
    if (this.filtroExportadorId) { this.filtroActual['IdExportador'] = this.filtroExportadorId; }
    if (this.filtroDestinoId) { this.filtroActual['IdDestino'] = this.filtroDestinoId; }
    if (this.filtroMaterialId) { this.filtroActual['IdMaterial'] = this.filtroMaterialId; }

    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  onLimpiar(): void {
    this.filtroVaporDesc = '';
    this.filtroExportadorId = null;
    this.filtroDestinoId = null;
    this.filtroMaterialId = null;
    this.filtroActual = {};
    this.ordenarPor = 'Fecha';
    this.dirOrden = 'Desc';
    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  cargar(pagina: number): void {
    this.cargando = true;
    this.paginaActual = pagina;

    this.service.listar(this.filtroActual, pagina, this.ordenarPor, this.dirOrden, this.pageSize).subscribe(
      res => {
        if (Array.isArray(res)) {
          this.items = res;
          this.itemsTotales = res.length;
        } else {
          this.items = res?.Items || res?.items || [];
          this.itemsTotales = res?.ItemsTotales || res?.itemsTotales || this.items.length;
        }
        this.aplicarAgrupacionBuque();
        this.cargando = false;
      },
      () => { this.cargando = false; }
    );
  }

  aplicarAgrupacionBuque(): void {
    const vistos = new Set<any>();
    this.itemsConBuque = this.items.map(item => {
      const vaporId = item.VaporId ?? item.vaporId ?? (item.Vapor || item.vapor);
      const mostrar = !vistos.has(vaporId);
      if (mostrar) { vistos.add(vaporId); }
      return { ...item, _mostrarBuque: mostrar };
    });
  }

  onPage(page: PageEvent): void {
    this.pageSize = page.pageSize;
    this.cargar(page.pageIndex + 1);
  }

  onOrdenar(columna: string): void {
    if (this.ordenarPor === columna) {
      this.dirOrden = this.dirOrden === 'Asc' ? 'Desc' : 'Asc';
    } else {
      this.ordenarPor = columna;
      this.dirOrden = 'Asc';
    }
    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  esColumnaOrdenada(columna: string): boolean {
    return this.ordenarPor === columna;
  }
}
