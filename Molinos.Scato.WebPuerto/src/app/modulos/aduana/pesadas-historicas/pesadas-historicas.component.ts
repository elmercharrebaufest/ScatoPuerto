import { Component, OnInit } from '@angular/core';
import { PesadaItem, TotalBalanza } from '../models/aduana.models';
import { PesadasService } from '../servicios/pesadas.service';

@Component({
  selector: 'app-pesadas-historicas',
  templateUrl: './pesadas-historicas.component.html',
  styleUrls: ['./pesadas-historicas.component.css']
})
export class PesadasHistoricasComponent implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  horaDesde = '00:00:00';
  horaHasta = '23:59:00';
  cargando = false;
  error = '';

  items: PesadaItem[] = [];
  totales: TotalBalanza[] = [];

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalItems = 0;

  // Ordenamiento
  ordenarPor = 'Fecha';
  direccionOrden: 'asc' | 'desc' = 'asc';

  get maxFecha(): string {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${y}-${m}-${d}`;
  }

  constructor(private pesadasService: PesadasService) {}

  ngOnInit(): void {
    const today = new Date();
    this.fechaDesde = this.toDateInputValue(today);
    this.fechaHasta = this.toDateInputValue(today);

    this.cargarPesadasHistoricas();
  }

  cargarPesadasHistoricas(): void {
    this.cargando = true;
    this.error = '';
    
    // Fechas ya vienen en formato yyyy-mm-dd desde datepicker
    const fechaDesdeEnvio = this.fechaDesde;
    const fechaHastaEnvio = this.fechaHasta;
    
    this.pesadasService.obtenerPesadasHistoricas(
      fechaDesdeEnvio,
      fechaHastaEnvio,
      this.horaDesde,
      this.horaHasta,
      this.paginaActual,
      this.itemsPorPagina,
      this.ordenarPor
    ).subscribe(
      (respuesta) => {
        this.items = this.mapearPesadas(respuesta.items);
        this.ordenarItemsEnMemoria();
        this.totalItems = respuesta.itemsTotales;
        this.paginaActual = respuesta.pagina;

        this.generarTotales();
        this.cargando = false;
      },
      (error) => {
        console.error('Error al obtener pesadas históricas:', error);
        this.error = 'Error al cargar pesadas históricas. Intente nuevamente.';
        this.cargando = false;
      }
    );
  }

  onAceptar(): void {
    this.paginaActual = 1; // Reiniciar a primera página
    this.cargarPesadasHistoricas();
  }

  onFechaDesdeChange(value: string): void {
    this.fechaDesde = value;
  }

  onFechaHastaChange(value: string): void {
    this.fechaHasta = value;
  }

  onHoraDesdeChange(value: string): void {
    this.horaDesde = value;
  }

  onHoraHastaChange(value: string): void {
    this.horaHasta = value;
  }

  onOrdenarColumna(columna: string): void {
    const mapaColumnas: { [key: string]: string } = {
      fecha: 'Fecha',
      numeroBalanza: 'NumeroBalanza',
      totalEmbarcado: 'TotalEmbarcado',
      commodity: 'Commodity',
      bodega: 'Bodega',
      destino: 'Destino',
      exportador: 'Exportador',
      vapor: 'Vapor',
      pesoProgramado: 'PesoProgramado'
    };

    const columnaBackend = mapaColumnas[columna] || 'Fecha';
    if (this.ordenarPor === columnaBackend) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = columnaBackend;
      this.direccionOrden = 'asc';
    }

    this.paginaActual = 1;
    this.cargarPesadasHistoricas();
  }

  cambiarPagina(numeroPagina: number): void {
    this.paginaActual = numeroPagina;
    this.cargarPesadasHistoricas();
  }

  onItemsPorPaginaChange(value: number): void {
    this.itemsPorPagina = value;
    this.paginaActual = 1;
    this.cargarPesadasHistoricas();
  }

  private mapearPesadas(dtos: any[]): PesadaItem[] {
    return dtos.map(dto => ({
      id: dto.IdCarga ?? dto.idCarga ?? 0,
      idCarga: dto.IdCarga ?? dto.idCarga ?? 0,
      numeroBalanza: dto.NumeroBalanza ?? dto.numeroBalanza ?? '',
      totalEmbarcado: dto.TotalEmbarcado ?? dto.totalEmbarcado ?? 0,
      totalEmbarcadoKg: dto.TotalEmbarcado ?? dto.totalEmbarcado ?? 0,
      commodity: dto.Commodity ?? dto.commodity ?? '',
      bodega: dto.Bodega ?? dto.bodega ?? '',
      destino: dto.Destino ?? dto.destino ?? '',
      fecha: (dto.Fecha ?? dto.fecha) ? new Date(dto.Fecha ?? dto.fecha).toLocaleString() : '',
      fechaCarga: (dto.Fecha ?? dto.fecha) ? new Date(dto.Fecha ?? dto.fecha).toLocaleString() : '',
      exportador: dto.Exportador ?? dto.exportador ?? '',
      vapor: dto.Vapor ?? dto.vapor ?? '',
      pesoProgramado: dto.PesoProgramado ?? dto.pesoProgramado ?? 0,
      pesoProgramadoKg: dto.PesoProgramado ?? dto.pesoProgramado ?? 0,
      balanza: dto.NumeroBalanza ?? dto.numeroBalanza ?? ''
    }));
  }

  private generarTotales(): void {
    // Agrupar por balanza única desde los datos reales
    const balanzasMap = new Map<string, any>();
    
    this.items.forEach(item => {
      if (!balanzasMap.has(item.balanza)) {
        balanzasMap.set(item.balanza, {
          balanza: item.balanza,
          material: item.commodity,
          pesoTotal: item.totalEmbarcado,
          itemCount: 1
        });
      }
    });

    this.totales = Array.from(balanzasMap.values()).map(b => ({
      balanza: b.balanza,
      embarcando: false,
      material: b.material,
      embarcadoPorcentaje: 0
    }));
  }

  private toDateInputValue(value: Date): string {
    const d = String(value.getDate()).padStart(2, '0');
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const y = value.getFullYear();
    return `${y}-${m}-${d}`;
  }

  private ordenarItemsEnMemoria(): void {
    const selector: { [key: string]: (i: PesadaItem) => any } = {
      Fecha: i => i.fechaCarga || i.fecha,
      NumeroBalanza: i => i.numeroBalanza || i.balanza,
      TotalEmbarcado: i => i.totalEmbarcado,
      Commodity: i => i.commodity,
      Bodega: i => i.bodega,
      Destino: i => i.destino,
      Exportador: i => i.exportador,
      Vapor: i => i.vapor,
      PesoProgramado: i => i.pesoProgramado
    };

    const pick = selector[this.ordenarPor] || selector.Fecha;
    const factor = this.direccionOrden === 'asc' ? 1 : -1;

    this.items = [...this.items].sort((a, b) => {
      const av = pick(a);
      const bv = pick(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * factor;
      if (bv == null) return 1 * factor;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }
}
