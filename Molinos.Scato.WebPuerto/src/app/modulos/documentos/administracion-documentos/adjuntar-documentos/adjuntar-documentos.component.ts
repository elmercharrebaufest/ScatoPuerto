import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentoService } from '@ScatoServicios/documento.service';

interface Elemento {
  nombre: string;
}

@Component({
  selector: 'app-adjuntar-documentos',
  templateUrl: './adjuntar-documentos.component.html',
  styleUrls: ['./adjuntar-documentos.component.css']
})
export class AdjuntarDocumentosComponent implements OnInit {

  @Input() configuracionId: number;
  public tabSeleccionado: string = "DeEmbarque";
  public documentos: [];//NominacionDocumento[];
  public listaDocumentos: [];

  
  public lista: Elemento[] = [
    { nombre: 'Elemento 1' },
    { nombre: 'Elemento 2' },
    { nombre: 'Elemento 3' },
    { nombre: 'Elemento 4' },
    { nombre: 'Elemento 5' }
  ];

  constructor(private modalService: NgbModal,
    private documentosService: DocumentoService

  ) { 
    this.obtenerDocumentosNominacion();
  }

  ngOnInit(): void {
  }

  public onSelectTab(tab: string){
    this.tabSeleccionado = tab;
    this.filtrarDocumentos();
  }

  private filtrarDocumentos(){
    //this.listaDocumentos = this.documentos.filter(doc => doc.tipo === this.tabSeleccionado);
  }

  public onOpenComentarios(modal: any){
    this.modalService.open(modal, { size: 'lg', windowClass: 'window-modal-pro', backdropClass: 'modal-pro' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }

  public obtenerDocumentosNominacion(){
    this.documentosService.listarDocumentosPorConfiguracion(0).subscribe((data: any) =>{
      this.documentos = data;
    }, (error: Error) =>{
      console.error(error);
    });
  }

  abrirSelectorArchivos(): void {
    const inputFile = document.getElementById('fileInput') as HTMLInputElement;
    inputFile.click();
  }

  // Método que maneja el archivo seleccionado
  onSeleccionarArchivo(event: any): void {
    const archivoSeleccionado: File = event.target.files[0];
    console.log('Archivo seleccionado:', archivoSeleccionado);
    // Aquí puedes implementar la lógica para manejar el archivo
  }

  toggleSublista(index: number): void {
    //this.items[index].mostrarSublista = !this.items[index].mostrarSublista;
  }

  onBorrarArchivo(index: number): void{

  }

  onDescargarArchivo(index: number): void{

  }
}
