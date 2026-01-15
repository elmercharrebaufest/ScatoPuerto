import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Acuerdo, AcuerdoTipo } from '@ScatoModels/acuerdos/acuerdos';
import { Vapor } from '@ScatoModels/embarque';
import { Exportador } from '@ScatoModels/exportador';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { AcuerdoService } from '@ScatoServicios/acuerdo.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { take } from 'rxjs/operators';

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

  constructor(
    private acuerdoService: AcuerdoService,
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.cargarCombos();
  }

  private inicializarForm(): void {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

    this.filtroBusqueda = this.fb.group({
      buques: [[]],
      muelles: [[]],
      tiposAcuerdo: [[]],
      exportadores: [[]],
      fechaInicio: [primerDiaMes],
      fechaFin: [ultimoDiaMes]
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
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al eliminar el acuerdo.');
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
}
