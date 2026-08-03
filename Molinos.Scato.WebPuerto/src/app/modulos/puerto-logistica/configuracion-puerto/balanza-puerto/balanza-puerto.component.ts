import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BalanzaPuertoService } from 'app/shared/servicios/puerto-logistica/balanza-puerto.service';
import { ConfirmationDialogService } from 'app/shared/servicios/confirmation-dialog.service';
import { ModalBalanzaPuertoComponent } from './modal-balanza-puerto/modal-balanza-puerto.component';

@Component({
  selector: 'app-balanza-puerto',
  templateUrl: './balanza-puerto.component.html',
  styleUrls: ['./balanza-puerto.component.css']
})
export class BalanzaPuertoComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public filtroTexto: string = '';
  public ordenarPor: string = 'CodigoBalanza';
  public dirOrden: 'Asc' | 'Desc' = 'Asc';

  constructor(
    private balanzaService: BalanzaPuertoService,
    private confirmDialog: ConfirmationDialogService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.balanzaService.listar(this.filtroTexto, pagina, this.ordenarPor, this.dirOrden).subscribe(
      res => {
        this.items = res.items || [];
        this.itemsTotales = res.itemsTotales || 0;
        this.cargando = false;
      },
      err => { console.error('Error al cargar balanzas:', err); this.cargando = false; }
    );
  }

  onBuscar(): void {
    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  onLimpiar(): void {
    this.filtroTexto = '';
    this.ordenarPor = 'CodigoBalanza';
    this.dirOrden = 'Asc';
    if (this.paginator) { this.paginator.firstPage(); }
    this.cargar(1);
  }

  onOrdenar(columna: string): void {
    if (this.ordenarPor === columna) { this.dirOrden = this.dirOrden === 'Asc' ? 'Desc' : 'Asc'; }
    else { this.ordenarPor = columna; this.dirOrden = 'Asc'; }
    this.cargar(1);
  }

  onNuevo(): void {
    const ref = this.modalService.open(ModalBalanzaPuertoComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.item = null;
    ref.result.then(g => { if (g) { this.cargar(this.paginaActual); } }, () => {});
  }

  onEditar(item: any): void {
    const ref = this.modalService.open(ModalBalanzaPuertoComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.item = { ...item };
    ref.result.then(g => { if (g) { this.cargar(this.paginaActual); } }, () => {});
  }

  onEliminar(item: any): void {
    this.confirmDialog.confirm('Eliminar balanza', '¿Desea eliminar la balanza ' + item.codigoBalanza + '?', 'Eliminar', 'Cancelar')
      .then(c => { if (c) { this.balanzaService.eliminar(item.id).subscribe(() => this.cargar(this.paginaActual)); } });
  }

  onPage(page: PageEvent): void { this.cargar(page.pageIndex + 1); }

  iconoOrden(columna: string): string {
    if (this.ordenarPor !== columna) { return 'fa-sort'; }
    return this.dirOrden === 'Asc' ? 'fa-sort-asc' : 'fa-sort-desc';
  }
}
