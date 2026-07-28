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

  public vapores: any[] = [];
  public exportadores: any[] = [];
  public destinos: any[] = [];
  public materiales: any[] = [];

  public vaporesFiltrados: any[] = [];
  public exportadoresFiltrados: any[] = [];
  public destinosFiltrados: any[] = [];
  public materialesFiltrados: any[] = [];

  public filtroVaporDesc: string = '';
  public filtroExportadorTexto: string = '';
  public filtroDestinoTexto: string = '';
  public filtroMaterialTexto: string = '';

  public filtroVaporId: number | null = null;
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
    this.service.listarVapores().subscribe(res => {
      this.vapores = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Nombre: x.Nombre ?? x.nombre
      }));
      this.vaporesFiltrados = [...this.vapores];
    });

    this.service.listarExportadores().subscribe(res => {
      this.exportadores = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion
      }));
      this.exportadoresFiltrados = [...this.exportadores];
    });

    this.service.listarDestinos().subscribe(res => {
      this.destinos = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Nombre: x.Nombre ?? x.nombre ?? x.Descripcion ?? x.descripcion
      }));
      this.destinosFiltrados = [...this.destinos];
    });

    this.service.listarMateriales().subscribe(res => {
      this.materiales = (res || []).map(x => ({
        Id: x.Id ?? x.id,
        Descripcion: x.Descripcion ?? x.descripcion ?? x.Nombre ?? x.nombre
      }));
      this.materialesFiltrados = [...this.materiales];
    });
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  onInputBuque(): void {
    const texto = this.normalizar(this.filtroVaporDesc);
    this.vaporesFiltrados = !texto
      ? [...this.vapores]
      : this.vapores.filter(x => this.normalizar(x.Nombre).includes(texto));
  }

  onInputExportador(): void {
    const texto = this.normalizar(this.filtroExportadorTexto);
    this.exportadoresFiltrados = !texto
      ? [...this.exportadores]
      : this.exportadores.filter(x => this.normalizar(x.Nombre).includes(texto));
  }

  onInputDestino(): void {
    const texto = this.normalizar(this.filtroDestinoTexto);
    this.destinosFiltrados = !texto
      ? [...this.destinos]
      : this.destinos.filter(x => this.normalizar(x.Nombre).includes(texto));
  }

  onInputMaterial(): void {
    const texto = this.normalizar(this.filtroMaterialTexto);
    this.materialesFiltrados = !texto
      ? [...this.materiales]
      : this.materiales.filter(x => this.normalizar(x.Descripcion).includes(texto));
  }

  onFiltrar(): void {
    this.filtroVaporId = this.obtenerIdExacto(this.vapores, this.filtroVaporDesc, 'Nombre');
    this.filtroExportadorId = this.obtenerIdExacto(this.exportadores, this.filtroExportadorTexto, 'Nombre');
    this.filtroDestinoId = this.obtenerIdExacto(this.destinos, this.filtroDestinoTexto, 'Nombre');
    this.filtroMaterialId = this.obtenerIdExacto(this.materiales, this.filtroMaterialTexto, 'Descripcion');

    this.filtroActual = {};
    if (this.filtroVaporId) {
      this.filtroActual['IdVapor'] = this.filtroVaporId;
    } else if (this.filtroVaporDesc && this.filtroVaporDesc.trim()) {
      this.filtroActual['VaporDesc'] = this.filtroVaporDesc.trim();
    }
    if (this.filtroExportadorId) { this.filtroActual['IdExportador'] = this.filtroExportadorId; }
    if (this.filtroDestinoId) { this.filtroActual['IdDestino'] = this.filtroDestinoId; }
    if (this.filtroMaterialId) { this.filtroActual['IdMaterial'] = this.filtroMaterialId; }

    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  onLimpiar(): void {
    this.filtroVaporDesc = '';
    this.filtroExportadorTexto = '';
    this.filtroDestinoTexto = '';
    this.filtroMaterialTexto = '';

    this.filtroVaporId = null;
    this.filtroExportadorId = null;
    this.filtroDestinoId = null;
    this.filtroMaterialId = null;

    this.vaporesFiltrados = [...this.vapores];
    this.exportadoresFiltrados = [...this.exportadores];
    this.destinosFiltrados = [...this.destinos];
    this.materialesFiltrados = [...this.materiales];

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

  private obtenerIdExacto(items: any[], texto: string, campo: string): number | null {
    const valor = this.normalizar(texto);
    if (!valor) {
      return null;
    }

    const encontrado = (items || []).find(x => this.normalizar(x[campo]) === valor);
    return encontrado ? encontrado.Id : null;
  }

  private normalizar(valor: any): string {
    return (valor ?? '')
      .toString()
      .trim()
      .toLowerCase();
  }
}
