import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
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
  public nomDocId: number = null;
  private extensionesInvalidas: string[] = ['doc', 'docx', 'xls', 'xlsx'];
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

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
      this.documentos = data.map((doc: NominacionDocumento) => ({
        documento: doc,
        mostrarArchivos: false
      }));
      this.elementos = this.documentos;
      this.filtrarDocumentos();
      this.desplegarArchivosSubidos();
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

  public onAbrirSelectorArchivos(nomDocId: number): void {
    this.fileInput.nativeElement.click();
    this.nomDocId = nomDocId;
  }

  public async onSeleccionarArchivos(event: any) {
    const archivos: FileList = event.target.files;

    if (archivos.length > 0) {
      const archivosASobreescribir = this.existenArchivosASobreescribir(archivos);
      if(archivosASobreescribir.length > 0){
        const confirm = await this.confirmationDialogService.confirm('Advertencia', `Los siguientes archivos ya existen: ${archivosASobreescribir.join(', ')}, ¿Desea sobrescribirlos?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
        if (!confirm) {
          return;
        }
      }

      const formatosPermitidos = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/pdf', // .pdf
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'image/png', // .png
        'image/jpeg' // .jpg, .jpeg
      ];

      const maxTamanioBytes = 28 * 1024 * 1024; 
      let tamanioTotal = 0;

      for (let i = 0; i < archivos.length; i++) {
        const arch = archivos[i];

        if (!formatosPermitidos.includes(arch.type)) {
          this.mostrarError("El formato del archivo: " + arch.name + " no es válido.");
          return;
        }

        tamanioTotal += arch.size;

        if (tamanioTotal > maxTamanioBytes) {
          this.mostrarError("El tamaño total de los archivos supera el límite de 28 MB.");
          return;
        }
      }

      if(archivos.length > 5){
        this.mostrarError("El maximo permitido de archivos a subir es 5.");
        return;
      }

      this.guardarArchivos(archivos);
    } else {
      this.mostrarError("Ningun archivo fue seleccionado.");
    }
  }

  private existenArchivosASobreescribir(archivos: FileList): string[]{
    const archivosExistentes = this.elementos.find(e=> e.documento.id == this.nomDocId)?.documento?.archivos;
    const archivosASobreescribir: string[] = [];
    for (let i = 0; i < archivos.length; i++) {
      const arch = archivos[i];
      if(archivosExistentes.some(ae => ae.nombre == arch.name)){
        archivosASobreescribir.push(arch.name);
      }
    }
    return archivosASobreescribir;
  }

  guardarArchivos(files: FileList): void {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
   
    this.documentosService.guardarArchivos(this.nomDocId, formData).subscribe(blob => {
      this.obtenerDocumentosNominacion(this.configuracionId);
    }, error => {
      console.error('Error al intentar guardar los archivos:', error);
      this.mostrarError("Hubo un error al intentar guardar los archivos.");
    });
  }

  onDesplegarArchivos(index: number): void {
    this.elementos[index].mostrarArchivos = !this.elementos[index].mostrarArchivos;
  }

  private desplegarArchivosSubidos() {
    if (this.nomDocId != null) {
      const index = this.elementos.findIndex(e => e.documento.id == this.nomDocId);
      if (index > -1) {
        this.elementos[index].mostrarArchivos = true;
      }
    }
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

  public onAbrirComentarios(modal: any, nomDocId: number) {
    this.nomDocId = nomDocId;
    this.modalService.open(modal, { size: 'lg', windowClass: 'window-modal-pro', backdropClass: 'modal-pro' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }

  public onVisualizarArchivo(archivo: NominacionDocumentoArchivo): void {
    this.documentosService.descargarArchivo(archivo.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const nuevaPestana = window.open(url);
      if (nuevaPestana) {
        nuevaPestana.onload = () => {
          window.URL.revokeObjectURL(url);
        };
      } else {
        console.error('No se pudo abrir la nueva pestaña. Asegúrate de que el bloqueador de ventanas emergentes no esté habilitado.');
      }

      if (nuevaPestana) {
        nuevaPestana.document.title = archivo.nombre; // Cambia el título de la pestaña
      }
    }, error => {
      console.error('Error al descargar el archivo:', error);
      this.mostrarError(`Hubo un error al intentar realizar la descarga del archivo: ${archivo.nombre}.`);
    });
  }

  private mostrarError(msj: string) {
    this.confirmationDialogService.error(msj);
  }

  public puedeVisualizarArchivo(archivo: NominacionDocumentoArchivo) {
    const partes = archivo.nombre.split('.');
    const extension = partes.length > 1 ? partes.pop().toLowerCase() : '';
    return !this.extensionesInvalidas.includes(extension);
  }

  public tienePermisoDescargarArchivo(){
    return this.user.permisos.find(p => p === this.permisosScato.Archivo_Digitalizacion_Descargar);
  }

  public tienePermisoEliminarArchivo(){
    return this.user.permisos.find(p => p === this.permisosScato.Archivo_Digitalizacion_Eliminar);
  }

  public tienePermisoCrearArchivo(){
    return this.user.permisos.find(p => p === this.permisosScato.Archivo_Digitalizacion_Crear);
  }
}
