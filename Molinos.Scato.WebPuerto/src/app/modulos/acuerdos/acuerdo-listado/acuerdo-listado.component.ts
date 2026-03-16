import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Acuerdo, AcuerdoTipo } from '@ScatoModels/acuerdos/acuerdos';
import { Vapor } from '@ScatoModels/embarque';
import { Exportador } from '@ScatoModels/exportador';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { AcuerdoService } from '@ScatoServicios/acuerdo.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { SessionService } from '@ScatoServicios/session.service';
import { take } from 'rxjs/operators';

const STORAGE_FECHA_INICIO = 'acuerdo-listado-fechaInicio';
const STORAGE_FECHA_FIN = 'acuerdo-listado-fechaFin';

@Component({
  selector: 'app-acuerdo-listado',
  templateUrl: './acuerdo-listado.component.html',
  styleUrls: ['./acuerdo-listado.component.css']
})
export class AcuerdoListadoComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public filtroBusqueda: FormGroup;
  public buques: Vapor[] = [];
  public muelles: MuelleDeCarga[] = [];
  public tiposAcuerdo: AcuerdoTipo[] = [];
  public exportadores: Exportador[] = [];

  public acuerdos: Acuerdo[] = [];

  public mensajeCarga: string = 'Cargando...';
  public estaCargando: boolean = false;

  public itemsTotales: number = 0;

  public puedeVer: boolean = false;
  public puedeAsociarTarifas: boolean = false;
  public puedeEditarEliminar: boolean = false;

  constructor(
    private acuerdoService: AcuerdoService,
    private router: Router,
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private sessionService: SessionService
  ) {
    this.inicializarForm();

    const user = this.sessionService.getUser();
    if (user && user.permisos) {
      const permisos: string[] = user.permisos;

      this.puedeVer = permisos.includes('Acuerdos_Visualizar');

      this.puedeAsociarTarifas = permisos.includes('Acuerdos_AdmFacturacion_VisualizarAsociarTarifas');

      this.puedeEditarEliminar = permisos.includes('Acuerdos_Comex_CrearEditarEliminar');
    }
  }

  ngOnInit(): void {
    this.cargarCombos();
  }

  private obtenerFechasDefault() {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
    return { primerDiaMes, ultimoDiaMes };
  }

  private obtenerFechasIniciales() {
    const { primerDiaMes, ultimoDiaMes } = this.obtenerFechasDefault();
    const fechaInicio = localStorage.getItem(STORAGE_FECHA_INICIO) || primerDiaMes;
    const fechaFin = localStorage.getItem(STORAGE_FECHA_FIN) || ultimoDiaMes;
    return { fechaInicio, fechaFin };
  }

  private guardarFechasEnStorage(): void {
    const fechaInicio = this.filtroBusqueda.get('fechaInicio')?.value;
    const fechaFin = this.filtroBusqueda.get('fechaFin')?.value;

    if (fechaInicio) {
      localStorage.setItem(STORAGE_FECHA_INICIO, fechaInicio);
    } else {
      localStorage.removeItem(STORAGE_FECHA_INICIO);
    }

    if (fechaFin) {
      localStorage.setItem(STORAGE_FECHA_FIN, fechaFin);
    } else {
      localStorage.removeItem(STORAGE_FECHA_FIN);
    }
  }

  private inicializarForm(): void {
    const { fechaInicio, fechaFin } = this.obtenerFechasIniciales();

    this.filtroBusqueda = this.fb.group({
      buques: [[]],
      muelles: [[]],
      tiposAcuerdo: [[]],
      exportadores: [[]],
      fechaInicio: [fechaInicio],
      fechaFin: [fechaFin]
    });
  }

  private async cargarCombos(): Promise<void> {
    this.estaCargando = true;
    const combos = await this.acuerdoService.listarCombos(true).pipe(take(1)).toPromise();
    this.muelles = [{ id: null, descripcion: 'TODOS' }, ...combos.muellesDeCarga];
    this.tiposAcuerdo = [{ id: null, descripcion: 'TODOS' }, ...combos.tipos];
    this.exportadores = [{ id: null, nombre: 'TODOS', almacenDesc: null, almacenId: null, habilitado: false }, ...combos.exportadores];
    this.buques = [{ id: null, nombre: 'TODOS', habilitado: false }, ...combos.buques];
    this.onBuscar();
  }

  public async eliminarAcuerdo(acuerdoId: number): Promise<void> {
    try {
      const confirm = await this.confirmationDialogService.confirmar('Atención', '¿Está seguro que desea eliminar este acuerdo?');
      if (!confirm) {
        return;
      }

      this.mensajeCarga = 'Eliminando acuerdo...';
      this.estaCargando = true;
      await this.acuerdoService.eliminarAcuerdo(acuerdoId).pipe(take(1)).toPromise();
      
      this.confirmationDialogService.exito('El acuerdo ha sido eliminado correctamente.');
      this.onBuscar();
    } catch (error: any) {
      let errorMsg = '';
      
      if (typeof error.error === 'string') {
        errorMsg = error.error;
      } else if (error.error && error.error.Message) {
        errorMsg = error.error.Message;
      }

      if (errorMsg.includes("El acuerdo no puede ser editado/eliminado")) {
        this.confirmationDialogService.error(errorMsg);
      } else {
        this.confirmationDialogService.error('Ocurrió un error al eliminar el acuerdo.');
      }
    } finally {
      this.estaCargando = false;
    }
  }

  public getConfigListaMultiple(textField: string) {
    return {
      singleSelection: false,
      primaryKey: 'id',
      textField: textField,
      allowSearchFilter: true,
      itemsShowLimit: 1,
      enableCheckAll: false
    };
  }

  public async onBuscar(page?: PageEvent): Promise<void> {
    let pagina = 1, itemsPorPagina = 10;

    if (!page && this.paginator) {
      this.paginator.firstPage();
    }

    if (page) {
      pagina = page.pageIndex + 1;
      itemsPorPagina = page.pageSize;
    }

    this.guardarFechasEnStorage();

    const filtroConvertido = this.convertirFiltro(pagina, itemsPorPagina);

    this.mensajeCarga = 'Cargando datos';
    this.estaCargando = true;

    try {
      const acuerdos = await this.acuerdoService.listarAcuerdos(filtroConvertido).pipe(take(1)).toPromise();
      this.acuerdos = acuerdos.items;
      this.itemsTotales = acuerdos.itemsTotales;
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al cargar los acuerdos.');
    } finally {
      this.estaCargando = false;
    }
  }

  public onLimpiar(): void {
    this.filtroBusqueda.reset();
    const { primerDiaMes, ultimoDiaMes } = this.obtenerFechasDefault();
    this.filtroBusqueda.patchValue({ fechaInicio: primerDiaMes, fechaFin: ultimoDiaMes }, { emitEvent: false });

    localStorage.removeItem(STORAGE_FECHA_INICIO);
    localStorage.removeItem(STORAGE_FECHA_FIN);

    this.onBuscar();
  }

  private convertirFiltro(pagina: number = 1, itemsPorPagina: number = 10): any {
    const filtros = this.filtroBusqueda.value;
    return {
      tiposAcuerdo: filtros.tiposAcuerdo?.some(t => t.descripcion === "TODOS") ? [] : filtros.tiposAcuerdo || [],
      fechaInicio: filtros.fechaInicio || null,
      fechaFin: filtros.fechaFin || null,
      buques: filtros.buques?.some(b => b.nombre === "TODOS") ? [] : filtros.buques || [],
      muelles: filtros.muelles?.some(m => m.descripcion == "TODOS") ? [] : filtros.muelles || [],
      exportadores: filtros.exportadores?.some(b => b.nombre === "TODOS") ? [] : filtros.exportadores || [],
      pagina: pagina,
      itemsPorPagina: itemsPorPagina,
    };
  }

  public isAcuerdoBloqueado(acuerdo: Acuerdo): boolean {
    const tieneEmbarques = acuerdo.acuerdoDetalles.some(d => d.relacionEmbarque);
    const tieneTarifasCerradas = acuerdo.estado === 'completo'; 

    return tieneEmbarques || tieneTarifasCerradas;
  }

  public async onEditarAcuerdo(acuerdo: Acuerdo): Promise<void> {
    const tieneEmbarques = acuerdo.acuerdoDetalles.some(d => d.relacionEmbarque);
    const tieneTarifasCerradas = acuerdo.tieneTarifasCerradas;

    if (tieneEmbarques || tieneTarifasCerradas) {
        this.confirmationDialogService.error("El acuerdo no puede ser editado/eliminado contacte a administración.");
        return;
    }

    this.router.navigate(['/acuerdos/editar', acuerdo.id]);
  }
}