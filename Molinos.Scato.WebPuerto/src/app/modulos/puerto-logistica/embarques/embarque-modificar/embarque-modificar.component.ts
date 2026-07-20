import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';
import { SessionService } from 'app/shared/servicios/session.service';

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
  public orderedByColumn: string = 'id';
  public orderDirection: number = 1;
  public todosEnviados: boolean = false;
  public usuario: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operacionesService: OperacionesPuertoService,
    private modalService: NgbModal,
    private sessionService: SessionService
  ) {
    this.usuario = this.sessionService.getUser()?.username;
   }

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
      c => {
        this.carga = c;
        this.carga.fechaInicio = this.carga.fecha || this.carga.Fecha || this.carga.fechaInicio || this.carga.FechaInicio;
        const idFinReal = this.idFin > 0 
            ? this.idFin 
            : (this.carga.idFin || this.carga.IdFin || this.carga.cargaOpuesta_Id || this.carga.CargaOpuesta_Id || 0);

        if (idFinReal > 0) {
          this.operacionesService.obtenerCarga(idFinReal, this.numeroBalanza).subscribe(
            cargaFin => {
              this.carga.fechaFin = cargaFin.fecha || cargaFin.Fecha || cargaFin.fechaInicio || cargaFin.FechaInicio;
            },
            err => console.error('[embarque-modificar] Error al obtener la carga fin:', err)
          );
        }

        const idFinParam = idFinReal > 0 ? idFinReal : null;
        
        this.operacionesService.listarBalanzadas(this.cargaId, idFinParam, this.numeroBalanza, this.filtroEnviado, 1, this.orderedByColumn, this.orderDirection > 0 ? 'Asc' : 'Desc', 99999).subscribe(
          (res: any) => {
            this.balanzadas = res.Items || res.items || [];
            this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
            this.todosEnviados = this.balanzadas.length > 0 && this.balanzadas.every(b => b.enviadoASap);
            this.cargando = false;
          },
          (err: any) => {
            console.error('[embarque-modificar] listarBalanzadas error:', err);
            this.errorMensaje = 'Error al cargar balanzadas: ' +
              (err?.error?.Message || err?.message || err?.status || JSON.stringify(err));
            this.cargando = false;
          }
        );

      },
      err => {
        console.error('[embarque-modificar] obtenerCarga error:', err);
        this.errorMensaje = 'Error al cargar los datos del embarque.';
        this.cargando = false;
      }
    );
  }

  aplicarFiltroEnviado(): void {
    this.cargarDatos(1);
  }

  enviarASap(bal: any): void {
    if (bal.enviadoASap) return;
    this.enviandoIds[bal.id] = true;
    this.errorMensaje = '';
    this.mensajeInfo = '';
    this.operacionesService.enviarASap({ 
      Id: bal.id, 
      NumeroBalanza: bal.numeroBalanza, 
      Usuario: this.usuario
    }).subscribe(
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
    this.operacionesService.enviarASapLote(this.cargaId, this.numeroBalanza, this.usuario).subscribe(
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
    this.mensajeInfo = '';

    const orig = this.balanzadaEditando._original;    
    const dto = {
      Id: this.balanzadaEditando.id,
      NumeroBalanza: this.balanzadaEditando.numeroBalanza,
      PesoBruto: this.balanzadaEditando.pesoBruto,
      PesoTara: this.balanzadaEditando.pesoTara,
      PesoNeto: this.balanzadaEditando.pesoNeto,
      // CargaInicial
      CargaInicial_Id: orig.cargaInicial_Id || orig.CargaInicial_Id || 0,
      CargaInicial_NumeroBalanza: orig.cargaInicial_NumeroBalanza || orig.CargaInicial_NumeroBalanza || orig.numeroBalanza,
      Fecha: orig.fecha || orig.Fecha,
      Capacidad: orig.capacidad || orig.Capacidad || "",
      EnviadoASap: orig.enviadoASap || orig.EnviadoASap || false
    };
    
    this.operacionesService.modificarBalanzada(dto).subscribe(
      () => {
        const orig = this.balanzadaEditando._original;
        orig.pesoBruto = dto.PesoBruto;
        orig.pesoTara = dto.PesoTara;
        orig.pesoNeto = dto.PesoNeto;

        this.operacionesService.enviarASap({ 
            Id: dto.Id, 
            NumeroBalanza: dto.NumeroBalanza,
            Usuario: this.usuario
        }).subscribe(
          () => {
            this.guardando = false;
            this.mensajeInfo = `Balanzada guardada y enviada a SAP exitosamente.`;
            modal.close();
          },
          errSap => {            
            this.guardando = false;
            this.errorMensaje = `La balanzada se guardó, pero falló el envío a SAP: ${this.extraerError(errSap)}`;
            modal.close();
            window.scrollTo(0,0);
          }
        );
      },
      err => {
        // Error al guardar en base de datos
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
