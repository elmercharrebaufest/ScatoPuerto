import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BodegaService } from 'app/shared/servicios/puerto-logistica/bodega.service';
import { ConfirmationDialogService } from 'app/shared/servicios/confirmation-dialog.service';
import { ModalBodegaComponent } from './modal-bodega/modal-bodega.component';

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  styleUrls: ['./bodega.component.css']
})
export class BodegaComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public filtroTexto: string = '';
  public ordenarPor: string = 'Id';
  public dirOrden: 'Asc' | 'Desc' = 'Asc';

  constructor(
    private bodegaService: BodegaService,
    private confirmDialog: ConfirmationDialogService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.bodegaService.listar(this.filtroTexto, pagina, this.ordenarPor, this.dirOrden).subscribe(
      res => { this.items = res.Items || res.items || []; this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0; this.cargando = false; },
      () => { this.cargando = false; }
    );
  }

  onBuscar(): void {
    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  onLimpiar(): void {
    this.filtroTexto = '';
    this.ordenarPor = 'Id';
    this.dirOrden = 'Asc';
    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  onOrdenar(columna: string): void {
    if (this.ordenarPor === columna) { this.dirOrden = this.dirOrden === 'Asc' ? 'Desc' : 'Asc'; }
    else { this.ordenarPor = columna; this.dirOrden = 'Asc'; }
    this.cargar(1);
  }

  esBodegaNoEditable(item: any): boolean { return item.Id >= 1 && item.Id <= 9; }

  onNuevo(): void {
    const ref = this.modalService.open(ModalBodegaComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.item = null;
    ref.result.then(g => { if (g) { this.cargar(this.paginaActual); } }, () => {});
  }

  onEditar(item: any): void {
    if (this.esBodegaNoEditable(item)) { return; }
    const ref = this.modalService.open(ModalBodegaComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.item = { ...item };
    ref.result.then(g => { if (g) { this.cargar(this.paginaActual); } }, () => {});
  }

  onEliminar(item: any): void {
    if (this.esBodegaNoEditable(item)) { return; }
    this.confirmDialog.confirm('Eliminar bodega', '¿Desea eliminar la bodega ' + item.Nombre + '?', 'Eliminar', 'Cancelar')
      .then(c => { if (c) { this.bodegaService.eliminar(item.Id).subscribe(() => this.cargar(this.paginaActual)); } });
  }

  onCambiarPagina(pagina: number): void { this.cargar(pagina); }

  onPage(page: PageEvent): void { this.cargar(page.pageIndex + 1); }

  iconoOrden(columna: string): string {
    if (this.ordenarPor !== columna) { return 'fa-sort'; }
    return this.dirOrden === 'Asc' ? 'fa-sort-asc' : 'fa-sort-desc';
  }
}
