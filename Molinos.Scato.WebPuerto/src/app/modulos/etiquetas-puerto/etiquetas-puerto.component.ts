import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { EtiquetaPuertoService } from 'app/shared/servicios/etiqueta-puerto.service';
import { SessionService } from 'app/shared/servicios/session.service';
import { ConfirmationDialogService } from 'app/shared/servicios/confirmation-dialog.service';

@Component({
  selector: 'app-etiquetas-puerto',
  templateUrl: './etiquetas-puerto.component.html',
  styleUrls: ['./etiquetas-puerto.component.css']
})
export class EtiquetasPuertoComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public mensaje: string = 'Cargando datos';
  public username: string;

  constructor(
    private etiquetaService: EtiquetaPuertoService,
    private sessionService: SessionService,
    private confirmDialog: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    const user = this.sessionService.getUser();
    this.username = user ? user.username : '';
    this.cargar();
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.etiquetaService.listar(this.username, pagina).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      err => { this.cargando = false; }
    );
  }

  onEliminar(): void {
    this.confirmDialog.confirm(
      'Eliminar etiquetas',
      '¿Desea eliminar todas sus etiquetas?',
      'Eliminar', 'Cancelar'
    ).then(confirmado => {
      if (confirmado) {
        this.etiquetaService.eliminar(this.username).subscribe(() => this.cargar());
      }
    });
  }

  onPage(page: PageEvent): void {
    this.cargar(page.pageIndex + 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cargar(pagina);
  }
}
