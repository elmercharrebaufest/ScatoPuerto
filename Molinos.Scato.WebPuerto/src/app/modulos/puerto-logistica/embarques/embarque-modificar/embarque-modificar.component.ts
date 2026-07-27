import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';
import { SessionService } from 'app/shared/servicios/session.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-embarque-modificar',
  templateUrl: './embarque-modificar.component.html',
  styleUrls: ['./embarque-modificar.component.css']
})
export class EmbarqueModificarComponent implements OnInit, OnDestroy {
  public formCrearBalanzada!: FormGroup;
  public fechaInicioStr: string = '';
  public fechaFinStr: string = '';

  public cargaId: number = 0;
  public numeroBalanza: string = '';
  public idFin: number = 0;

  public puedeCrearBalanzada: boolean = false;
  public balanzadasFaltantesLista: any[] = [];
  public balanzadaFaltanteSeleccionada: any = null;
  public creando: boolean = false;

  public carga: any = null;
  public balanzadas: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public enviandoLote: boolean = false;
  public enviandoIds: { [id: number]: boolean } = {};
  public errorMensaje: string = '';
  public mensajeInfo: string = '';
  public mensajeInfoDesapareciendo: boolean = false;
  public filtroEnviado: boolean | null = null;
  public balanzadaEditando: any = null;
  public guardando: boolean = false;
  public orderedByColumn: string = 'id';
  public orderDirection: number = 1;
  public todosEnviados: boolean = false;
  public usuario: string = '';
  private netoSyncSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operacionesService: OperacionesPuertoService,
    private modalService: NgbModal,
    private sessionService: SessionService,
    private fb: FormBuilder
  ) {
    this.usuario = this.sessionService.getUser()?.username;
   }

  ngOnInit(): void {
    this.cargaId = Number(this.route.snapshot.paramMap.get('id'));
    this.numeroBalanza = this.route.snapshot.paramMap.get('numeroBalanza') || '';
    this.idFin = Number(this.route.snapshot.paramMap.get('idFin') || 0);
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.netoSyncSubscription?.unsubscribe();
  }

  private mostrarMensajeInfo(msg: string): void {
    this.mensajeInfo = msg;
    this.mensajeInfoDesapareciendo = false;
    setTimeout(() => {
      this.mensajeInfoDesapareciendo = true;
    }, 0);
    setTimeout(() => {
      this.mensajeInfo = '';
      this.mensajeInfoDesapareciendo = false;
    }, 5000);
  }

  cargarDatos(pagina: number = 1): void {
    this.cargando = true;
    this.errorMensaje = '';
    this.paginaActual = pagina;
    
    this.operacionesService.obtenerCarga(this.cargaId, this.numeroBalanza).subscribe(
      c => {
        this.carga = c;
        this.carga.fechaInicio = this.carga.fecha || this.carga.Fecha || this.carga.fechaInicio || this.carga.FechaInicio;
        
        const cargaOpuestaId = this.carga.cargaOpuesta_Id || this.carga.CargaOpuesta_Id;
        const idFinReal = this.idFin > 0 ? this.idFin : (this.carga.idFin || this.carga.IdFin || cargaOpuestaId || 0);

        if (idFinReal > 0) {
          this.operacionesService.obtenerCarga(idFinReal, this.numeroBalanza).subscribe(
            cargaFin => {
              this.carga.fechaFin = cargaFin.fecha || cargaFin.Fecha || cargaFin.fechaInicio || cargaFin.FechaInicio;
            },
            err => console.error('[embarque-modificar] Error al obtener la carga fin:', err)
          );
        }

        if (cargaOpuestaId != null) {
          const idFinFaltantes = this.idFin > 0 ? this.idFin : 0;
          this.operacionesService.balanzadasFaltantes(this.cargaId, idFinFaltantes, this.numeroBalanza).subscribe(
            faltantes => {
              this.balanzadasFaltantesLista = faltantes || [];
              this.puedeCrearBalanzada = this.balanzadasFaltantesLista.length > 0;
              if (this.puedeCrearBalanzada) {
                this.balanzadaFaltanteSeleccionada = this.balanzadasFaltantesLista[0];
              }
            }
          );
        } else {
          this.puedeCrearBalanzada = false;
          this.balanzadaFaltanteSeleccionada = null;
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
            this.errorMensaje = 'Error al cargar balanzadas: ' + this.extraerError(err);
            this.cargando = false;
          }
        );
      },
      err => {
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
        this.mostrarMensajeInfo(`Balanzada ${bal.id} enviada a SAP.`);
        this.cargarDatos(this.paginaActual);
      },
      err => {
        this.enviandoIds[bal.id] = false;
        this.cargarDatos(this.paginaActual);
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
        this.mostrarMensajeInfo('Se enviaron las pesadas a SAP con éxito, verifique en la columna Enviado a Sap para el detalle de cada una.');
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
            this.mostrarMensajeInfo(`Balanzada guardada y enviada a SAP exitosamente.`);
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

  //#region Crear Balanzada Faltante
  private pesoNetoValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const bruto = Math.trunc(Number(group.get('PesoBruto')?.value || 0));
      const tara = Math.trunc(Number(group.get('PesoTara')?.value || 0));
      const neto = Math.trunc(Number(group.get('PesoNeto')?.value || 0));
      const esperado = bruto - tara;
      return neto !== esperado ? { pesoNetoInvalido: true } : null;
    };
  }

  private rangoFechaValidator(inicio: Date | null, fin: Date | null): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const fechaVal = group.get('Fecha')?.value;
      if (!fechaVal || !inicio || !fin) return null;
      const seleccionada = new Date(fechaVal);
      if (isNaN(seleccionada.getTime())) return { fechaInvalida: true };
      if (seleccionada < inicio || seleccionada > fin) return { fechaFueraDeRango: true };
      return null;
    };
  }

  abrirModalCrearFaltante(template: any): void {
    const idFaltante = this.obtenerIdFaltanteSeleccionado(this.balanzadaFaltanteSeleccionada);
    if (idFaltante == null) return;

    const now = new Date();
    const fechaIso = this.aInputDateTime(now);
    const dInicio = this.carga?.fechaInicio ? new Date(this.carga.fechaInicio) : null;
    const dFin = this.carga?.fechaFin ? new Date(this.carga.fechaFin) : null;

    this.fechaInicioStr = dInicio ? this.formatearFechaLegible(dInicio) : '';
    this.fechaFinStr = dFin ? this.formatearFechaLegible(dFin) : '';

    this.formCrearBalanzada = this.fb.group({
      Id: [{ value: idFaltante, disabled: true }],
      NumeroBalanza: [{ value: this.numeroBalanza, disabled: true }],
      CargaInicial_Id: [{ value: this.cargaId, disabled: true }],
      PesoBruto: [0, [Validators.required, Validators.min(0)]],
      PesoTara: [0, [Validators.required, Validators.min(0)]],
      PesoNeto: [0, [Validators.required]],
      Fecha: [fechaIso, [Validators.required]]
    }, {
      validators: [
        this.pesoNetoValidator(),
        this.rangoFechaValidator(dInicio, dFin)
      ]
    });

    this.netoSyncSubscription?.unsubscribe();
    this.netoSyncSubscription = new Subscription();
    const brutoSub = this.formCrearBalanzada.get('PesoBruto')?.valueChanges.subscribe(() => this.actualizarNetoAutomatico());
    const taraSub = this.formCrearBalanzada.get('PesoTara')?.valueChanges.subscribe(() => this.actualizarNetoAutomatico());
    if (brutoSub) this.netoSyncSubscription.add(brutoSub);
    if (taraSub) this.netoSyncSubscription.add(taraSub);

    this.actualizarNetoAutomatico();
    this.modalService.open(template, { centered: true });
  }

  private actualizarNetoAutomatico(): void {
    const bruto = Math.trunc(Number(this.formCrearBalanzada.get('PesoBruto')?.value || 0));
    const tara = Math.trunc(Number(this.formCrearBalanzada.get('PesoTara')?.value || 0));
    const netoControl = this.formCrearBalanzada.get('PesoNeto');
    if (netoControl) {
      netoControl.setValue(bruto - tara, { emitEvent: false });
      netoControl.markAsTouched();
      this.formCrearBalanzada.updateValueAndValidity({ emitEvent: false });
    }
  }

  guardarNuevaBalanzada(modal: any): void {
    if (this.formCrearBalanzada.invalid) {
      this.formCrearBalanzada.markAllAsTouched();
      return;
    }

    this.creando = true;
    this.errorMensaje = '';
    this.mensajeInfo = '';

    const raw = this.formCrearBalanzada.getRawValue();
    const fechaPayload = this.normalizarFechaLocalParaBackend(raw.Fecha);
    const dto = {
      Id: raw.Id,
      NumeroBalanza: raw.NumeroBalanza,
      CargaInicial_Id: raw.CargaInicial_Id,
      PesoBruto: raw.PesoBruto,
      PesoTara: raw.PesoTara,
      PesoNeto: raw.PesoNeto,
      Fecha: fechaPayload,
      Capacidad: '0',
      EnviadoASap: false
    };

    console.log('[CrearBalanzada] Fecha enviada al backend', {
      fechaControl: raw.Fecha,
      fechaPayload
    });

    this.operacionesService.crearBalanzada(dto).subscribe(
      () => {
        this.creando = false;
        this.mensajeInfo = `Balanzada ${dto.Id} creada exitosamente.`;
        modal.close();
        this.cargarDatos(this.paginaActual);
      },
      err => {
        this.creando = false;
        this.errorMensaje = this.extraerError(err);
      }
    );
  }

  private aInputDateTime(fecha: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
  }

  private formatearFechaLegible(fecha: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
  }

  private normalizarFechaLocalParaBackend(fechaControl: string): string {
    if (!fechaControl) return this.aInputDateTime(new Date()) + ':00';
    return fechaControl.length === 16 ? `${fechaControl}:00` : fechaControl;
  }

  private obtenerIdFaltanteSeleccionado(faltanteSeleccionado: any): number | null {
    if (faltanteSeleccionado == null) return null;
    const valor = faltanteSeleccionado.Value != null ? faltanteSeleccionado.Value : faltanteSeleccionado;
    const id = Number(valor);
    return Number.isFinite(id) ? id : null;
  }
  //#endregion

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
