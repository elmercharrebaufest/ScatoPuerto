import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operacionesService: OperacionesPuertoService
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
      () => { }
    );
    const idFinParam = this.idFin > 0 ? this.idFin : null;
    this.operacionesService.listarBalanzadas(this.cargaId, idFinParam, this.numeroBalanza, this.filtroEnviado, pagina).subscribe(
      res => {
        this.balanzadas = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      () => { this.cargando = false; }
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
