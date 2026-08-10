import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { EtiquetaPuertoService } from 'app/shared/servicios/puerto-logistica/etiqueta-puerto.service';
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

  public archivoSeleccionado: File | null = null;
  public archivoNombre: string = 'Ningún Archivo Seleccionado';
  public mensajeExito: string = '';
  public mensajeError: string = '';
  public erroresImportacion: string[] = [];

  constructor(
    private etiquetaService: EtiquetaPuertoService,
    private sessionService: SessionService,
    private confirmDialog: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    const user = this.sessionService.getUser();
    this.username = user ? user.username : '';
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.etiquetaService.listar(pagina).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      () => { this.cargando = false; }
    );
  }

  onSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files;

    this.mensajeExito = '';
    this.mensajeError = '';
    this.erroresImportacion = [];

    if (!files || files.length === 0) {
      this.archivoSeleccionado = null;
      this.archivoNombre = 'Ningún Archivo Seleccionado';
      return;
    }

    const archivo = files[0];
    const ext = (archivo.name.split('.').pop() || '').toLowerCase();
    if (ext !== 'xlsx') {
      this.archivoSeleccionado = null;
      this.archivoNombre = 'Ningún Archivo Seleccionado';
      this.mensajeError = 'El archivo debe tener formato .xlsx';
      input.value = '';
      return;
    }

    this.archivoSeleccionado = archivo;
    this.archivoNombre = archivo.name;
    this.importarArchivo();
  }

  importarArchivo(): void {
    if (!this.archivoSeleccionado) {
      this.mensajeError = 'Seleccione un archivo';
      return;
    }

    this.cargando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.erroresImportacion = [];

    this.etiquetaService.importar(this.archivoSeleccionado).subscribe(
      res => {
        this.items = res?.Items || res?.items || [];
        this.itemsTotales = this.items.length;
        this.paginaActual = 1;
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.mensajeExito = res?.Mensaje || res?.mensaje || 'Se grabó correctamente';
        this.cargando = false;
      },
      err => {
        this.cargando = false;
        const apiErrores = err?.error?.Errores;
        if (Array.isArray(apiErrores) && apiErrores.length > 0) {
          this.erroresImportacion = apiErrores;
          this.mensajeError = 'Se detectaron errores al importar el archivo.';
        } else {
          this.mensajeError = err?.error || 'No se pudo importar el archivo';
        }
      }
    );
  }

  onDescargarTemplate(): void {
    this.etiquetaService.descargarTemplate().subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'EtiquetaPuerto.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      () => {
        this.mensajeError = 'No se pudo descargar el template';
      }
    );
  }

  onVer(item: any): void {
    const id = item?.Id || item?.id;
    if (!id) {
      return;
    }

    this.etiquetaService.previsualizar(id).subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      () => {
        this.mensajeError = 'No se pudo generar la previsualización';
      }
    );
  }

  onImprimir(idEtiqueta?: number): void {
    this.etiquetaService.imprimir(idEtiqueta).subscribe(
      () => {
        this.mensajeExito = 'Impresión enviada correctamente';
        this.mensajeError = '';
      },
      err => {
        this.mensajeError = err?.error || 'No se pudo enviar la impresión';
        this.mensajeExito = '';
      }
    );
  }

  onEliminar(): void {
    this.confirmDialog.confirm(
      'Eliminar etiquetas',
      '¿Desea eliminar todas sus etiquetas?',
      'Eliminar', 'Cancelar'
    ).then(confirmado => {
      if (confirmado) {
        this.etiquetaService.eliminar().subscribe(() => {
          this.archivoSeleccionado = null;
          this.archivoNombre = 'Ningún Archivo Seleccionado';
          this.mensajeExito = '';
          this.mensajeError = '';
          this.erroresImportacion = [];
          this.cargar();
        });
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
