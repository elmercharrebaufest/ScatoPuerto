import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { NominacionDocumento, NominacionDocumentoArchivo } from '@ScatoModels/digitalizacion-documentos/documento';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DocumentoService } from '@ScatoServicios/documento.service';

export interface ElementoNominacionDocumento {
  documento: NominacionDocumento,
  mostrarArchivos: boolean,
}

@Component({
  selector: 'app-adjuntar-documentos',
  templateUrl: './adjuntar-documentos.component.html',
  styleUrls: ['./adjuntar-documentos.component.css']
})

export class AdjuntarDocumentosComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  public tabSeleccionado: string = "A solicitar en la nominación";
  public documentos: ElementoNominacionDocumento[] = [];
  public elementos: ElementoNominacionDocumento[] = [];
  public configuracionId: number = 0;

  constructor(
    private documentosService: DocumentoService,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService
  ) {
  }

  ngOnInit(): void {
    this.actualizarDocumentosNominacion();
  }

  public onSeleccionarTipo(tab: string) {
    this.tabSeleccionado = tab;
    this.filtrarDocumentos();
  }

  private obtenerDocumentosNominacion(configId: number) {
    this.documentosService.listarDocumentosPorConfiguracion(configId).subscribe((data: any) => {
      this.documentos = data.map(doc => ({
        documento: doc,
        mostrarArchivos: false,
      }));
      this.elementos = this.documentos;
      this.filtrarDocumentos();
    }, (error: Error) => {
      console.error(error);
    });
  }

  private filtrarDocumentos() {
    this.elementos = this.documentos.filter(doc => doc.documento.documento.documentoTipo.nombre === this.tabSeleccionado);
  }

  private actualizarDocumentosNominacion() {
    this.documentosService.config$.subscribe(configId => {
      if (configId) {
        this.configuracionId = configId;
        this.obtenerDocumentosNominacion(configId);
      }
    });
  }

  onAbrirSelectorArchivos(): void {
    this.fileInput.nativeElement.click();
  }

  onSeleccionarArchivos(event: any): void {
    const archivos: FileList = event.target.files;

    if (archivos.length > 0) {
      const formatosPermitidos = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/pdf', // .pdf
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'image/png', // .png
        'image/jpeg' // .jpg, .jpeg
      ];

      for (let i = 0; i < archivos.length; i++) {
        const arch = archivos[i];

        if (!formatosPermitidos.includes(arch.type)) {
          this.mostrarError("El formato del archivo: " + arch.name + " no es válido.");
          return;
        }
      }
      this.guardarArchivos(archivos);
    } else {
      this.mostrarError("Ningun archivo fue seleccionado.");
    }
  }

  guardarArchivos(files: FileList): void {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }
    this.documentosService.guardarArchivos(this.configuracionId, formData).subscribe(blob => {
      this.obtenerDocumentosNominacion(this.configuracionId);
    }, error => {
      console.error('Error al intentar guardar los archivos:', error);
      this.mostrarError("Hubo un error al intentar guardar los archivos.");
    });
  }

  onDesplegarArchivos(index: number): void {
    this.elementos[index].mostrarArchivos = !this.elementos[index].mostrarArchivos;
  }

  public onBorrarArchivo(id: number): void {
    try {
      this.confirmationDialogService.confirm('Eliminar Archivo', `¿Esta seguro de querer eliminar el archivo seleccionado?`, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          if (confirmed) {
            this.documentosService.eliminarArchivo(id).subscribe(res => {
              this.modalService.dismissAll();
              this.obtenerDocumentosNominacion(this.configuracionId);
              this.confirmationDialogService.exito('Archivo eliminado con éxito.');
            }, (error: any) => {
              console.error('Error al enviar el formulario', error);
              this.modalService.dismissAll();
              this.mostrarError("Hubo un error al intentar eliminar el archivo.");
            });
          }
        })
    } catch (error) {
      console.error(error);
      this.modalService.dismissAll();
      this.mostrarError("Hubo un error al intentar eliminar el archivo.");
    }
  }

  public onDescargarArchivo(archivo: NominacionDocumentoArchivo): void {
    this.documentosService.descargarArchivo(archivo.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archivo.nombre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Error al descargar el archivo:', error);
      this.mostrarError(`Hubo un error al intentar realizar la descarga del archivo: ${archivo.nombre}.`);
    });
  }

  public onAbrirComentarios(modal: any) {
    this.modalService.open(modal, { size: 'lg', windowClass: 'window-modal-pro', backdropClass: 'modal-pro' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }

  public onVisualizarArchivo(url: string): void {
    window.open(url, '_blank');
  }

  private mostrarError(msj: string) {
    this.confirmationDialogService.error(msj);
  }
}
