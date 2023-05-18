import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Caratula } from '@ScatoModels/afip/caratula';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
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
  public buscarHistorialCaratulas: boolean = false;
  private paginaActual: number = 1;
  private listaPaginas: any;
  caratulaId:number;
  caratulaImo:string;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(private modalService: NgbModal, private caratulaService: CaratulaAfipService) {   }

  ngOnInit(): void {

    this.listarCaratulas();
  }

  public getListaHistorialCaratula() {
    return this.listaHistorialCaratulas;
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

  listarCaratulas(){
    this.caratulaService.listarCaratulas().subscribe((datos)=>{
      this.listaHistorialCaratulas=datos
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

  tienePermisoModificarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Editar);
  }

  tienePermisoEliminarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Eliminar);
  }

}
