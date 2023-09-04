import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Caratula } from '@ScatoModels/afip/caratula';
import { CaratulaAfipService, EstadosCaratulaAFIP } from '@ScatoServicios/afip/caratula-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-caratula-afip',
  templateUrl: './caratula-afip.component.html',
  styleUrls: ['./caratula-afip.component.css']
})
export class CaratulaAfipComponent implements OnInit {

  // #region Variables
  private listaHistorialCaratulas: Caratula[]=[];
  public cargarCaratulas: boolean = true;
  caratulaId:number;
  caratulaImo:string;
  esNoExisteRegistros:boolean= true;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  public estados: EstadosCaratulaAFIP;

  // Paginado
  currentPage: number = 1; // Página actual
  totalPages: number; // Total de páginas
  totalItems: number; // Total de elementos
  itemsPerPage: number = 5; // Elementos por página
  visiblePages: number[] = []; // Páginas visibles en la paginación
  showEllipsisStart: boolean = false; // Mostrar puntos suspensivos al inicio
  showEllipsisEnd: boolean = false; // Mostrar puntos suspensivos al final
  displayedItems: any[] = []; // Elementos mostrados en la tabla

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private caratulaService: CaratulaAfipService
  ) {
    this.estados = caratulaService.estados;
  }

  ngOnInit(): void {
    this.listarCaratulas();
  }

  listarCaratulas(){
    this.caratulaService.listarCaratulas().subscribe((datos)=>{
      this.listaHistorialCaratulas=datos;
      this.listaHistorialCaratulas.length == 0 ? this.esNoExisteRegistros : this.esNoExisteRegistros = false;
      this.cargarCaratulas=false
      // Calcular el total de elementos y las páginas
      this.totalItems = this.listaHistorialCaratulas.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      // Mostrar los elementos de la página actual
      this.displayedItems = this.getItemsForPage(this.currentPage);

        // Calcular las páginas visibles
      this.calculateVisiblePages();
    })
  }

  public editarCaratula(historial,modal){
      this.caratulaId = historial.id;
      this.caratulaImo = historial.identificadorBuque
      this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-vapor', backdropClass: 'modal-vapor' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }

  eliminarCaratula(id:number,idCaratula:string){
    this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de eliminar la nueva Caratula con id: ${idCaratula}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
    .then((confirmed)=>{
      if(confirmed){
        this.caratulaService.eliminarCaratula(id).subscribe((datos)=>{
          this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La Caratula con id: ${idCaratula} fue eliminada con éxito!`, 'Cerrar','', null, null, Tipoalerta.Success)
          this.listarCaratulas();
        },(error) => {
          this.confirmationDialogService.confirm(`¡Error!`, 'No se ha podido crear una nueva Caratula, comunicarse con soporte técnico', 'Cerrar', '', null, null, Tipoalerta.Error);
        })
      }
    })
  }

  editFinish(event) {
    this.listarCaratulas();
  }

  tienePermisoModificarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Editar);
  }

  tienePermisoEliminarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Eliminar);
  }

  // Paginado
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
    return this.listaHistorialCaratulas.slice(startIndex, endIndex);
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
