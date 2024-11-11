import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NominacionDocumento, NominacionDocumentoComentario } from '@ScatoModels/digitalizacion-documentos/documento';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DocumentoService } from '@ScatoServicios/documento.service';

@Component({
  selector: 'app-modal-comentarios',
  templateUrl: './modal-comentarios.component.html',
  styleUrls: ['./modal-comentarios.component.css']
})
export class ModalComentariosComponent implements OnInit {

  @ViewChild('tableContainer') tableContainer: ElementRef;
  @Input() id: number = 0;
  @Output() refrescarListado = new EventEmitter();
  public comentarios: NominacionDocumentoComentario[] = [];
  public texto: string = '';
  public nombreDocumento: string = null;

  constructor(
    private documentosService: DocumentoService,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.obtenerComentariosDocumentosNominacion();
  }

  private obtenerComentariosDocumentosNominacion() {
    this.documentosService.obtenerNominacionDocumento(this.id).subscribe((data: NominacionDocumento) => {
      this.comentarios = data.comentarios;
      this.nombreDocumento = data.documento.nombre;
      this.scrollToBottom();
    }, (error: Error) => {
      console.error(error);
      this.mostrarError("Hubo un error al intentar obtener los comentarios.");
    });
  }

  public onAgregarComentario() {
    if (this.texto == '' || this.texto == null) {
      this.mostrarError("Debe ingresar un comentario.");
      return;
    }
    this.documentosService.agregarComentario(this.id, this.texto).subscribe((data: any) => {
      this.obtenerComentariosDocumentosNominacion();
      this.texto = '';
      this.scrollToBottom();
      this.refrescarListado.emit(true);
    }, (error: Error) => {
      console.error(error);
      this.mostrarError("Hubo un error al intentar agregar el comentario.");
    });
  }

  private mostrarError(msj: string) {
    this.confirmationDialogService.error(msj);
  }

  public onCerrarModal() {
    this.modalService.dismissAll()
  }

  private scrollToBottom() {
    const tableElement = this.tableContainer.nativeElement;
    setTimeout(() => {
      tableElement.scrollTop = tableElement.scrollHeight;
    }, 100);
  }

}
