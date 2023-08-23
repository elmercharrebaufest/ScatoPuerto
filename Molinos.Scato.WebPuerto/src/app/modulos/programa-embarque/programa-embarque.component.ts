import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';


@Component({
  selector: 'app-programa-embarque',
  templateUrl: './programa-embarque.component.html',
  styleUrls: ['./programa-embarque.component.css']
})
export class ProgramaEmbarqueComponent implements OnInit {

  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;

  constructor(private route: Router,
              public session: SessionService,
              private modalService: NgbModal) {
    this.user = this.session.getUser(); 
  }

  ngOnInit(): void {
  }
  
  public onCrearNuevaNominacion(){
    this.route.navigate([`programa/nominacion`]);
  }

  
  tienePermisoEnviarALineUp() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Enviar_LineUp);
  }
  tienePermisoCrearNuevaNominacion() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Guardar);
  }

  public onOpenModalEnviarLineUp(modal) {
    this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-pro', backdropClass: 'modal-pro' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }


}
