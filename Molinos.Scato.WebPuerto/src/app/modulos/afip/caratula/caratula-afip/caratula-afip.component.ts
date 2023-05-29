import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Caratula } from '@ScatoModels/afip/caratula';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
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
  public buscarHistorialCaratulas: boolean = true;
  private paginaActual: number = 1;
  private listaPaginas: any;
  private totalPaginas: number = 0;
  caratulaId:number;
  caratulaImo:string;
  esNoExisteRegistros:boolean= true;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  datosTabla: any[]=[]; // Datos completos de la tabla
  tablaPaginada: any[]; // Datos paginados de la tabla
  pageSize: number = 5; // Tamaño de página 
  currentPage: number = 1; // Página actual
  paginas: number[] = [];

  constructor(private modalService: NgbModal, private confirmationDialogService: ConfirmationDialogService, private caratulaService: CaratulaAfipService) 
  {  this.listarCaratulas(); }

  ngOnInit(): void {

    
   
  }

  actualizarTabla() {
    // Calcular el índice de inicio y fin de los datos paginados
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    console.log(startIndex)
    console.log(endIndex)
    // Obtener los datos paginados de la tabla
    this.tablaPaginada = this.datosTabla.slice(startIndex, endIndex);
    console.log(this.tablaPaginada)
  }

  paginaAnterior() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.actualizarTabla();
      this.calcularPaginas()
    }
  }

  paginaSiguiente() {
    const totalPages = Math.ceil(this.datosTabla.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.actualizarTabla();
      this.calcularPaginas()
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.datosTabla.length / this.pageSize);
  }
  irAPagina(page: number) {
    this.currentPage = page;
    this.actualizarTabla();
  }

  calcularPaginas() {
    const totalPages = this.getTotalPages();
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    console.log(totalPages)
    console.log(startPage)
    console.log(endPage)
    this.paginas = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    console.log(this.paginas)
  }

 

  listarCaratulas(){
    this.caratulaService.listarCaratulas().subscribe((datos)=>{
      datos.length == 0 ? this.esNoExisteRegistros : this.esNoExisteRegistros = false;
      this.listaHistorialCaratulas=datos;
      this.datosTabla=datos;
      this.buscarHistorialCaratulas=false
      this.actualizarTabla();
      this.calcularPaginas();
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

}
