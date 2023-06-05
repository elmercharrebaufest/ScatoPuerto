import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CaratulaAfipComponent } from './caratula-afip/caratula-afip.component';

@Component({
  selector: 'app-caratula',
  templateUrl: './caratula.component.html',
  styleUrls: ['./caratula.component.css']
})
export class CaratulaComponent implements OnInit {

  @ViewChild(CaratulaAfipComponent) caratulaAfipComponent: CaratulaAfipComponent;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openModalEditarCrearCaratula(modal: any) {
    // this.errorMessage = false;
    
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  crearFinish(event) {
    this.caratulaAfipComponent.listarCaratulas();
  }

  tienePermisoVisualizarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Visualizar);
  }
  
  tienePermisoCrearCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Crear);
  }

  
}
