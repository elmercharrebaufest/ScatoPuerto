import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Vapor } from '@ScatoModels/embarque';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { SessionService } from '@ScatoServicios/session.service';

export interface CombosConsultaEmbarques {
  buques: Vapor[];
  muelles: MuelleDeCarga[];
  exportadores: Exportador[];
  productos: MaterialPuerto[];
  agencias: AgenciaMaritimaPuerto[];
}

export interface FiltrosAdministracion {
  desamarre: Date;
  buques: string;
  muelles: string;
  tanques: string;
  exportadores: string;
  materiales: string;
  estados: string;
  pagina: number;
  itemsPorPagina: number;
}

export interface TotalProducto {
  descripcion: string;
  total: number;
}

@Component({
  selector: 'app-consulta-embarques',
  templateUrl: './consulta-embarques.component.html',
  styleUrls: ['./consulta-embarques.component.css']
})

export class ConsultaEmbarquesComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public estaCargando: boolean = false;
  public mostrarFiltros: boolean = true;

  public mensaje: string = null;
  public desde: string = this.AnioMesActual();

  public itemsTotales: number = 0;

  public filtroBusqueda: FormGroup;

  public embarques: any[] = [];
  public buques: Vapor[] = [];
  public muelles: MuelleDeCarga[] = [];
  public exportadores: Exportador[] = [];
  public materiales: MaterialPuerto[] = [];

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(
    private formBuilder: FormBuilder,
    private administracionService: AdministracionService,
    private confirmationDialogService: ConfirmationDialogService,
    public session: SessionService,
    private route: Router,
  ) {
    this.inicializarForm();
    this.listarCombos();
    this.user = this.session.getUser();
  }

  ngOnInit(): void {
  }

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  public inicializarForm(): void {
    this.filtroBusqueda = this.formBuilder.group({
      desamarre: this.AnioMesActual(),
      buques: [],
      muelles: [],
      tanques: null,
      exportadores: [],
      materiales: [],
      estados: null,
    });
  }

  private listarCombos(): void {
    this.administracionService.listarCombos().subscribe((data: CombosConsultaEmbarques) => {
      this.buques = [{ id: null, nombre: 'TODOS', habilitado: false }, ...data.buques]; 
      this.muelles = [{ id: null, descripcion: 'TODOS' }, ...data.muelles];
      this.exportadores = [{ id: null, nombre: 'TODOS', almacenDesc: null, almacenId: null, habilitado: false }, ...data.exportadores];
      this.materiales = [{ id: null, descripcion: 'TODOS', descripcionCorta: null, descripcionCortaIngles: null, codigoSAP: null, esLiquido: false, 
        color: null, almacenId: null, almacenDesc: null}, ...data.productos];
      this.onBuscar();
    }, (error: any) => {
      console.error(error);
    });
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

  public onBuscar(page?: PageEvent) {
    let pagina = 1, itemsPorPagina = 10;

    if (!page && this.paginator) {
      this.paginator.firstPage();
    }

    if (page) {
      pagina = page.pageIndex + 1;
      itemsPorPagina = page.pageSize;
    }
    console.log(this.filtroBusqueda.value);
    const filtroConvertido = this.convertirFiltro(pagina, itemsPorPagina);

    this.mensaje = 'Cargando datos';
    this.estaCargando = true;

    this.administracionService.listarEmbarques(
      filtroConvertido).subscribe(res => {
        this.embarques = res.items;
        console.log(this.embarques);
        this.itemsTotales = res.itemsTotales;
        this.estaCargando = false;
      }, err => {
        this.confirmationDialogService.error('Ocurrió un error al cargar los datos');
        console.error(err);
        this.estaCargando = false;
      });
  }

  public onLimpiar(): void {
    this.filtroBusqueda.reset();
    if (this.paginator) {
      this.paginator.firstPage();
    }
    const pageEvent: PageEvent = { pageIndex: 0, pageSize: 10, length: this.itemsTotales };
    this.onBuscar(pageEvent);
  }

  public onExportar() {
    const filtroConvertido = this.convertirFiltro();
    this.mensaje = 'Exportando listado';
    this.estaCargando = true;
    this.administracionService.exportarListado(filtroConvertido).subscribe(
      (data: any) => {
        this.estaCargando = false;
        const element = document.createElement('a');
        element.href = URL.createObjectURL(data);
        element.download = "listado_embarques" + '.xls';
        document.body.appendChild(element);
        element.click();
      }, (error) => {
        this.estaCargando = false;
        console.error(error);
      }
    );
  }

  public onVerDetalle(embarque: any): void {
    this.route.navigate(
      [`administracion/embarque/${embarque.idEmbarque}`], 
    );
  }

  public onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public convertirFiltro(pagina: number = 1, itemsPorPagina: number = 10): FiltrosAdministracion {
    const filtros = this.filtroBusqueda.value;

    return {
      desamarre: filtros.desamarre || null,
        buques: filtros.buques?.some(b => b.nombre === "TODOS") ? null : filtros.buques || null,
        muelles: filtros.muelles?.some(m => m.descripcion == "TODOS")? null : filtros.muelles || null,
        tanques: filtros.tanques || null,
        exportadores: filtros.exportadores?.some(b => b.nombre === "TODOS") ? null : filtros.exportadores || null,
        materiales: filtros.materiales?.some(b => b.descripcion === "TODOS") ? null : filtros.materiales || null,
        estados: filtros.estados || null,
        pagina: pagina,
        itemsPorPagina: itemsPorPagina      
    };
  }

  getProductoCantidadAgrupado(): TotalProducto[] {
    const agrupadoMap = new Map<string, number>();
    for (const embarque of this.embarques) {
      for (const item of embarque.itemsEmbarque) {
        const prod = item.producto;
        const cantidadActual = agrupadoMap.get(prod) || 0;
        const cantidadNueva = parseFloat(item.itemsExportadores.reduce((sum, x) => sum + (parseFloat(x.tn) || 0), 0)) || 0; // Asegura que item.tn sea un número válido con decimales
        agrupadoMap.set(prod, cantidadActual + cantidadNueva);
      }
    }
    return Array.from(agrupadoMap.entries()).map(([descripcion, total]) => ({
      descripcion,
      total: parseFloat(total.toFixed(3)) // Asegura que el total tenga hasta 3 decimales
    }));
  }

  tienePermisoFacturar() {
    return this.user.permisos.find(p => p === this.permisosScato.Administracion_Facturar);
  }

  public maxExportadores(embarque: any): number {
    return Math.max(...embarque.itemsEmbarque.map((item: any) => item.itemsExportadores.length), 0);
  }

  totalExportadores(embarque: any): number {
    return embarque.itemsEmbarque.reduce((total, item) => {
      const exportadores = item.itemsExportadores;
      return total + (Array.isArray(exportadores) && exportadores.length > 0 ? exportadores.length : 1);
    }, 0);
  }

  public getRelacionAcuerdo(muelle: string, exportador: string, estadoAcuerdo: string): string {
    const muelleNorm = muelle ? muelle.toUpperCase() : '';
    const exportadorNorm = exportador ? exportador.toUpperCase() : '';

    if (muelleNorm.includes('SAN BENITO') && exportadorNorm.includes('MOLINOS')) {
      return '';
    }

    return estadoAcuerdo || 'NO';
  }

}