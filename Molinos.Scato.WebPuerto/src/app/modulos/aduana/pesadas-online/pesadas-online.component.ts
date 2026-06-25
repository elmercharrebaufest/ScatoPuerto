import { Component, OnInit } from '@angular/core';
import { PesadaItem, TotalBalanza } from '../models/aduana.models';
import { PesadasService } from '../servicios/pesadas.service';

@Component({
  selector: 'app-pesadas-online',
  templateUrl: './pesadas-online.component.html',
  styleUrls: ['./pesadas-online.component.css']
})
export class PesadasOnlineComponent implements OnInit {
  fechaDesde = '';
  horaDesde = '00:00:00';
  horaHasta = '';
  cargando = false;
  error = '';

  totales: TotalBalanza[] = [];
  items: PesadaItem[] = [];
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalItems = 0;

  // Ordenamiento
  ordenarPor = 'Fecha';
  direccionOrden: 'asc' | 'desc' = 'asc';

  constructor(private pesadasService: PesadasService) {}

  ngOnInit(): void {
    this.fechaDesde = this.getToday();
    this.horaHasta = this.getCurrentTime();
    
    this.cargarPesadasOnline();
  }

  cargarPesadasOnline(): void {
    this.cargando = true;
    this.error = '';
    
    // Convertir fecha dd/mm/yyyy a yyyy-mm-dd para envío al backend
    const fechaEnvio = this.convertirFecha(this.fechaDesde);
    
    this.pesadasService.obtenerPesadasOnline(
      fechaEnvio,
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
        console.error('Error al obtener pesadas online:', error);
        this.error = 'Error al cargar pesadas online. Intente nuevamente.';
        this.cargando = false;
      }
    );
  }

  onAceptar(): void {
    this.paginaActual = 1; // Reiniciar a primera página
    this.cargarPesadasOnline();
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
    this.cargarPesadasOnline();
  }

  cambiarPagina(numeroPagina: number): void {
    this.paginaActual = numeroPagina;
    this.cargarPesadasOnline();
  }

  onItemsPorPaginaChange(value: number): void {
    this.itemsPorPagina = value;
    this.paginaActual = 1;
    this.cargarPesadasOnline();
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

  private convertirFecha(fechaStr: string): string {
    // Convierte de dd/mm/yyyy a yyyy-mm-dd
    const partes = fechaStr.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return fechaStr;
  }

  private getToday(): string {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  }

  private getCurrentTime(): string {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}:00`;
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
