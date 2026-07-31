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
      this.ordenarPor,
      this.direccionOrden
    ).subscribe(
      (respuesta) => {
        this.items = this.mapearPesadas(respuesta.items);
        this.totalItems = respuesta.itemsTotales;
        this.paginaActual = respuesta.pagina;

        this.cargarTotalesPorBalanza(fechaEnvio);
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

  private cargarTotalesPorBalanza(fechaEnvio: string): void {
    this.pesadasService.obtenerTotalesPorBalanza(fechaEnvio, this.horaDesde, this.horaHasta)
      .subscribe(
        (respuesta: any) => {
          const items = (respuesta && (respuesta.items || respuesta.Items)) || [];
          const balanzasMap = new Map<string, { material: string; pesoTotal: number }>();

          items.forEach((item: any) => {
            const clave = item.balanza || item.numeroBalanza || item.Balanza || item.NumeroBalanza || '';
            if (!clave) {
              return;
            }

            if (!balanzasMap.has(clave)) {
              balanzasMap.set(clave, {
                material: item.material || item.commodity || item.Material || item.Commodity || '',
                pesoTotal: Number(item.pesoTotal || item.totalEmbarcado || item.TotalEmbarcado || 0)
              });
            }
          });

          this.totales = Array.from(balanzasMap.entries()).map(([balanza, data]) => ({
            balanza,
            embarcando: data.pesoTotal > 0,
            material: data.material,
            embarcadoPorcentaje: data.pesoTotal > 0 ? 100 : 0
          }));
        },
        () => {
          this.totales = [];
        }
      );
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

  private convertirFecha(fechaStr: string): string {
    // Convierte de dd/mm/yyyy a yyyy-mm-dd
    const partes = fechaStr.split('/');
    if (partes.length === 3) {
      return partes[2] + '-' + partes[1] + '-' + partes[0];
    }
    return fechaStr;
  }

  private getToday(): string {
    const today = new Date();
    const d = this.pad2(today.getDate());
    const m = this.pad2(today.getMonth() + 1);
    const y = today.getFullYear();
    return d + '/' + m + '/' + y;
  }

  private getCurrentTime(): string {
    const now = new Date();
    const h = this.pad2(now.getHours());
    const m = this.pad2(now.getMinutes());
    return h + ':' + m + ':00';
  }

  private pad2(value: number): string {
    return value < 10 ? '0' + value : String(value);
  }

  private ordenarItemsEnMemoria(): void {
    return;
  }
}
