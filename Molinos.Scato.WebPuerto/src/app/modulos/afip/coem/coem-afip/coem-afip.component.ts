import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { COEM } from '@ScatoModels/afip/coem';
import { EstadoCOEM } from '@ScatoModels/afip/estadoCoem';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-coem-afip',
  templateUrl: './coem-afip.component.html',
  styleUrls: ['./coem-afip.component.css']
})
export class CoemAfipComponent implements OnInit {

  private listaHistorialCoem: COEM[]=[];
  public load: boolean = false;
  esNoExisteRegistros : boolean = true;
  private paginaActual: number = 1;
  coem: COEM=new COEM();
  private listaPaginas: any;
  coemId:number;
  coemIdentificador:string;
  coemImo:string;
  listaEstados:EstadoCOEM[]=[];
  // Paginado
  currentPage: number = 1; // Página actual
  totalPages: number; // Total de páginas
  totalItems: number; // Total de elementos
  itemsPerPage: number = 5; // Elementos por página
  visiblePages: number[] = []; // Páginas visibles en la paginación
  showEllipsisStart: boolean = false; // Mostrar puntos suspensivos al inicio
  showEllipsisEnd: boolean = false; // Mostrar puntos suspensivos al final
  displayedItems: any[] = []; // Elementos mostrados en la tabla

  constructor(private modalService: NgbModal, private coemAfipService:CoemAfipService, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit(): void {
    this.listarCoems();
    this.listarEstados();
  }

  public getListaHistorialCoem() {
    return this.displayedItems;
  }

  public getPaginaActual() {
    return this.paginaActual;
  }

  public setPaginaActual(pagina) {
    this.paginaActual = pagina;
  }

  public getListaPaginas() {
    return this.listaPaginas;
  }

  editFinish(event) {
    console.log('si')
    this.listarCoems();
    this.listarEstados();
  }

  public editarCoem(historial,modal){
      this.coemId = historial.id;
      this.coemIdentificador=historial.identificadorCOEM
      this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });

  }

  eliminarCoem(id,identificadorCOEM){
    this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de eliminar la nueva COEM con id: ${identificadorCOEM}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
    .then((confirmed)=>{
      if(confirmed){
        this.load=true;
        this.coemAfipService.anularCoem(id).subscribe((datos)=>{
          this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La COEM con id: ${identificadorCOEM} fue eliminada con éxito!`, 'Cerrar','', null, null, Tipoalerta.Success)
          this.listarCoems();
          this.load = false;
        },(error) => {
          this.confirmationDialogService.confirm(`¡Error!`, 'No se ha podido crear una nueva COEM, comunicarse con soporte técnico', 'Cerrar', '', null, null, Tipoalerta.Error);
        })
      }
    })
  }

  listarCoems(){
    this.coemAfipService.listarCoems().subscribe((data)=>{
      this.listaHistorialCoem=data;
      // Calcular el total de elementos y las páginas
      this.totalItems = this.listaHistorialCoem.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      // Mostrar los elementos de la página actual
      this.displayedItems = this.getItemsForPage(this.currentPage);

        // Calcular las páginas visibles
      this.calculateVisiblePages();
    })
  }

  listarEstados(){
    this.coemAfipService.estadosCoem().subscribe((data)=>{
      this.listaEstados=data;
      this.load=false
    })
  }

  cambiarEstado(event:Event,idCoem,identificadorCOEM){
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.value;
    this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de cambiar el estado del COEM con id: ${identificadorCOEM}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
    .then((confirmed)=>{
      if(confirmed){
        this.load = true
        this.coemAfipService.cambiarEstadosCoem(selectedOption,idCoem).subscribe((datos)=>{
          this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La Estado del COEM con id: ${identificadorCOEM} fue cambiado con éxito!`, 'Cerrar','', null, null, Tipoalerta.Success)
          this.listaEstados=datos;
          this.listarCoems();
          this.listarEstados();
        },(error) => {
          this.confirmationDialogService.confirm(`¡Error!`, 'No se ha podido cambiar el estado del COEM, comunicarse con soporte técnico', 'Cerrar', '', null, null, Tipoalerta.Error);
        })
      }else{
          this.listarCoems();
          this.listarEstados();
      }
    })
  }

  

  goToPage(page: number) {
    // Validar que la página esté dentro de los límites
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayedItems = this.getItemsForPage(this.currentPage);
      this.calculateVisiblePages();
    }
  }

  getItemsForPage(page: number): any[] {
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.listaHistorialCoem.slice(startIndex, endIndex);
  }

  calculateVisiblePages() {
    const pagesToShow = 5; // Número máximo de páginas visibles
    const half = Math.floor(pagesToShow / 2); // Mitad de las páginas visibles

    // Inicializar las banderas
    this.showEllipsisStart = false;
    this.showEllipsisEnd = false;

    // Calcular el rango de páginas visibles
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(start + pagesToShow - 1, this.totalPages);

    // Ajustar el rango si está cerca de los extremos
    if (end - start + 1 < pagesToShow) {
      start = Math.max(1, end - pagesToShow + 1);
    }

    // Mostrar puntos suspensivos al inicio si hay páginas ocultas
    if (start > 1) {
      this.showEllipsisStart = true;
    }

    // Mostrar puntos suspensivos al final si hay páginas ocultas
    if (end < this.totalPages) {
      this.showEllipsisEnd = true;
    }

    // Generar el arreglo de páginas visibles
    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

}
