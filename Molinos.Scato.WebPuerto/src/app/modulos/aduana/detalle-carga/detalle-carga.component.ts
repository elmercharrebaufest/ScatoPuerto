import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetalleCargaItem } from '../models/aduana.models';
import { PesadasService } from '../servicios/pesadas.service';

@Component({
  selector: 'app-detalle-carga',
  templateUrl: './detalle-carga.component.html',
  styleUrls: ['./detalle-carga.component.css']
})
export class DetalleCargaComponent implements OnInit {
  origen: 'online' | 'historicas' = 'online';
  idCarga: number = 0;
  numeroBalanza: string = '';
  items: DetalleCargaItem[] = [];
  cargando = false;
  error = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 50;
  totalItems = 0;

  // Ordenamiento
  ordenarPor: 'Fecha' | 'PesoBruto' | 'PesoTara' | 'PesoNeto' | 'Capacidad' = 'Fecha';
  direccionOrden: 'asc' | 'desc' = 'asc';

  constructor(
    private route: ActivatedRoute,
    private pesadasService: PesadasService
  ) {}

  ngOnInit(): void {
    const origen = (this.route.snapshot.queryParamMap.get('origen') || '').toLowerCase();
    this.origen = origen === 'historicas' ? 'historicas' : 'online';
    
    this.idCarga = parseInt(this.route.snapshot.queryParamMap.get('idCarga') || '0', 10);
    this.numeroBalanza = this.route.snapshot.queryParamMap.get('numeroBalanza') || '';

    if (this.idCarga > 0 && this.numeroBalanza) {
      this.cargarDetalleCarga();
    }
  }

  cargarDetalleCarga(): void {
    this.cargando = true;
    this.error = '';

    this.pesadasService.obtenerDetalleCarga(
      this.idCarga,
      this.numeroBalanza,
      this.paginaActual,
      this.itemsPorPagina,
      this.ordenarPor,
      this.direccionOrden
    ).subscribe(
      (respuesta) => {
        this.items = this.mapearDetalleBalanzadas(respuesta.items);
        this.totalItems = respuesta.itemsTotales;
        this.paginaActual = respuesta.pagina;
        this.cargando = false;
      },
      (error) => {
        console.error('Error al obtener detalle de carga:', error);
        this.error = 'Error al cargar el detalle de carga. Intente nuevamente.';
        this.cargando = false;
      }
    );
  }

  cambiarPagina(numeroPagina: number): void {
    this.paginaActual = numeroPagina;
    this.cargarDetalleCarga();
  }

  onOrdenarColumna(columna: 'fecha' | 'pesoBruto' | 'pesoTara' | 'pesoNeto' | 'capacidad'): void {
    const mapaColumnas: { [key: string]: 'Fecha' | 'PesoBruto' | 'PesoTara' | 'PesoNeto' | 'Capacidad' } = {
      fecha: 'Fecha',
      pesoBruto: 'PesoBruto',
      pesoTara: 'PesoTara',
      pesoNeto: 'PesoNeto',
      capacidad: 'Capacidad'
    };

    const columnaBackend = mapaColumnas[columna] || 'Fecha';

    if (this.ordenarPor === columnaBackend) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = columnaBackend;
      this.direccionOrden = 'asc';
    }

    this.paginaActual = 1;
    this.cargarDetalleCarga();
  }

  esColumnaActiva(columna: string): boolean {
    const mapaNormalizacion: { [key: string]: string } = {
      fecha: 'Fecha',
      pesoBruto: 'PesoBruto',
      pesoTara: 'PesoTara',
      pesoNeto: 'PesoNeto',
      capacidad: 'Capacidad'
    };
    return mapaNormalizacion[columna] === this.ordenarPor;
  }

  getSortIcon(columna: string): string {
    if (!this.esColumnaActiva(columna)) {
      return '↕';
    }
    return this.direccionOrden === 'asc' ? '▲' : '▼';
  }

  onItemsPorPaginaChange(value: string): void {
    const parsed = Number(value);
    if (!isNaN(parsed) && parsed > 0) {
      this.itemsPorPagina = parsed;
      this.paginaActual = 1;
      this.cargarDetalleCarga();
    }
  }

  get totalPaginas(): number {
    if (!this.itemsPorPagina || !this.totalItems) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPorPagina));
  }

  get paginaInicio(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get paginaFin(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.totalItems);
  }

  get paginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const inicio = Math.max(1, actual - 2);
    const fin = Math.min(total, inicio + 4);
    const paginas: number[] = [];
    for (let p = inicio; p <= fin; p++) {
      paginas.push(p);
    }
    return paginas;
  }

  private mapearDetalleBalanzadas(dtos: any[]): DetalleCargaItem[] {
    return dtos.map(dto => ({
      fecha: (dto.Fecha ?? dto.fecha) ? new Date(dto.Fecha ?? dto.fecha).toLocaleString() : '',
      pesoBruto: dto.PesoBruto ?? dto.pesoBruto ?? 0,
      pesoTara: dto.PesoTara ?? dto.pesoTara ?? 0,
      pesoNeto: dto.PesoNeto ?? dto.pesoNeto ?? 0,
      capacidad: this.parseCapacidad(dto.Capacidad ?? dto.capacidad)
    }));
  }

  private parseCapacidad(valor: any): number {
    if (valor === null || valor === undefined || valor === '') {
      return 0;
    }

    if (typeof valor === 'number') {
      return isNaN(valor) ? 0 : valor;
    }

    const normalizado = String(valor)
      .trim()
      .replace('%', '')
      .replace(',', '.');

    let numero = Number(normalizado);
    if (!isNaN(numero)) {
      return numero;
    }

    const limpio = normalizado.replace(/[^0-9.-]/g, '');
    numero = Number(limpio);

    return isNaN(numero) ? 0 : numero;
  }

  get leftLinkText(): string {
    return this.origen === 'historicas' ? 'IR A PESADAS ONLINE' : 'IR A PESADAS HISTÓRICA';
  }

  get leftLinkUrl(): string {
    return this.origen === 'historicas' ? '/aduana/pesadas-online' : '/aduana/pesadas-historicas';
  }

  get volverUrl(): string {
    return this.origen === 'historicas' ? '/aduana/pesadas-historicas' : '/aduana/pesadas-online';
  }
}
