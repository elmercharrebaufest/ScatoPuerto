import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';

@Component({
  selector: 'app-embarque-modificar',
  templateUrl: './embarque-modificar.component.html',
  styleUrls: ['./embarque-modificar.component.css']
})
export class EmbarqueModificarComponent implements OnInit {

  public cargaId: number = 0;
  public numeroBalanza: string = '';
  public idFin: number = 0;

  public carga: any = null;
  public balanzadas: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public enviandoLote: boolean = false;
  public enviandoIds: { [id: number]: boolean } = {};
  public errorMensaje: string = '';
  public mensajeInfo: string = '';
  public filtroEnviado: boolean | null = null;
  public balanzadaEditando: any = null;
  public guardando: boolean = false;
  public orderedByColumn: string = '';
  public orderDirection: number = 1;
  public todoEnviado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operacionesService: OperacionesPuertoService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.cargaId = Number(this.route.snapshot.paramMap.get('id'));
    this.numeroBalanza = this.route.snapshot.paramMap.get('numeroBalanza') || '';
    this.idFin = Number(this.route.snapshot.paramMap.get('idFin') || 0);
    this.cargarDatos();
  }

  cargarDatos(pagina: number = 1): void {
    this.cargando = true;
    this.errorMensaje = '';
    this.paginaActual = pagina;
    this.operacionesService.obtenerCarga(this.cargaId, this.numeroBalanza).subscribe(
      c => this.carga = c,
      err => console.error('[embarque-modificar] obtenerCarga error:', err)
    );
    const idFinParam = this.idFin > 0 ? this.idFin : null;
    console.log('[embarque-modificar] listarBalanzadas params:',
      { id: this.cargaId, idFin: idFinParam, numeroBalanza: this.numeroBalanza, enviado: this.filtroEnviado, pagina });
    this.operacionesService.listarBalanzadas(this.cargaId, idFinParam, this.numeroBalanza, this.filtroEnviado, pagina).subscribe(
      res => {
        console.log('[embarque-modificar] listarBalanzadas response:', res);
        this.balanzadas = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
        this.operacionesService.todoEnviado(this.cargaId, this.idFin > 0 ? this.idFin : null, this.numeroBalanza).subscribe(
          r => this.todoEnviado = r === true || r === 'true',
          () => this.todoEnviado = false
        );
      },
      err => {
        console.error('[embarque-modificar] listarBalanzadas error:', err);
        this.errorMensaje = 'Error al cargar balanzadas: ' +
          (err?.error?.Message || err?.message || err?.status || JSON.stringify(err));
        this.cargando = false;
      }
    );
  }

  onCambiarPagina(pagina: number): void {
    this.cargarDatos(pagina);
  }

  aplicarFiltroEnviado(): void {
    this.cargarDatos(1);
  }

  enviarASap(bal: any): void {
    if (bal.enviadoASap) return;
    this.enviandoIds[bal.id] = true;
    this.errorMensaje = '';
    this.mensajeInfo = '';
    this.operacionesService.enviarASap({ Id: bal.id, NumeroBalanza: bal.numeroBalanza }).subscribe(
      () => {
        this.enviandoIds[bal.id] = false;
        bal.enviadoASap = true;
        this.mensajeInfo = `Balanzada ${bal.id} enviada a SAP.`;
      },
      err => {
        this.enviandoIds[bal.id] = false;
        this.errorMensaje = this.extraerError(err);
      }
    );
  }

  enviarASapLote(): void {
    this.enviandoLote = true;
    this.errorMensaje = '';
    this.mensajeInfo = '';
    this.operacionesService.enviarASapLote(this.cargaId, this.numeroBalanza).subscribe(
      () => {
        this.enviandoLote = false;
        this.mensajeInfo = 'Envío a SAP en lote completado.';
        this.todoEnviado = true;
        this.cargarDatos(this.paginaActual);
      },
      err => {
        this.enviandoLote = false;
        this.errorMensaje = this.extraerError(err);
      }
    );
  }

  eliminarBalanzada(bal: any): void {
    if (!confirm(`¿Eliminar la balanzada ${bal.id}?`)) return;
    this.operacionesService.eliminarBalanzada(bal.id).subscribe(
      () => this.cargarDatos(this.paginaActual),
      err => this.errorMensaje = this.extraerError(err)
    );
  }

  orderColumnBy(column: string): void {
    if (column === this.orderedByColumn) {
      this.orderDirection = -this.orderDirection;
    } else {
      this.orderedByColumn = column;
      this.orderDirection = 1;
    }
    this.balanzadas = [...this.balanzadas].sort((a, b) => {
      const va = a[column] ?? '';
      const vb = b[column] ?? '';
      if (va > vb) return this.orderDirection;
      if (va < vb) return -this.orderDirection;
      return 0;
    });
  }

  abrirModal(bal: any, template: any): void {
    this.balanzadaEditando = {
      id: bal.id,
      cargaInicial_Id: bal.cargaInicial_Id,
      numeroBalanza: bal.numeroBalanza,
      pesoBruto: bal.pesoBruto,
      pesoTara: bal.pesoTara,
      pesoNeto: bal.pesoNeto,
      fechaStr: bal.fecha ? new Date(bal.fecha).toLocaleString('es-AR') : '',
      _original: bal
    };
    this.modalService.open(template, { centered: true });
  }

  guardarBalanzada(modal: any): void {
    this.guardando = true;
    this.errorMensaje = '';
    const dto = {
      Id: this.balanzadaEditando.id,
      NumeroBalanza: this.balanzadaEditando.numeroBalanza,
      PesoBruto: this.balanzadaEditando.pesoBruto,
      PesoTara: this.balanzadaEditando.pesoTara,
      PesoNeto: this.balanzadaEditando.pesoNeto
    };
    this.operacionesService.modificarBalanzada(dto).subscribe(
      () => {
        this.guardando = false;
        const orig = this.balanzadaEditando._original;
        orig.pesoBruto = dto.PesoBruto;
        orig.pesoTara = dto.PesoTara;
        orig.pesoNeto = dto.PesoNeto;
        modal.close();
      },
      err => {
        this.guardando = false;
        this.errorMensaje = this.extraerError(err);
      }
    );
  }

  volver(): void {
    this.router.navigate(['/puerto-logistica/embarques']);
  }

  private extraerError(err: any): string {
    if (err?.error) {
      if (typeof err.error === 'string') return err.error;
      if (err.error.Message) return err.error.Message;
      const values = Object.keys(err.error).map(k => err.error[k]);
      if (values.length) return values.join(' | ');
    }
    return 'Ocurrió un error.';
  }
}
