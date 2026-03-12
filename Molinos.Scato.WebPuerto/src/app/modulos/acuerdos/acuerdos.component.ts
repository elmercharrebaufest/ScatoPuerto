import { Component, OnInit } from '@angular/core';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-acuerdos',
  templateUrl: './acuerdos.component.html',
  styleUrls: ['./acuerdos.component.css']
})
export class AcuerdosComponent implements OnInit {

  public puedeAgregarAcuerdo: boolean = false;

  constructor(private sessionService: SessionService) {
    const user = this.sessionService.getUser();
    if (user && user.permisos) {
      const permisos: string[] = user.permisos;
      
      this.puedeAgregarAcuerdo = permisos.includes('Acuerdos_Comex_CrearEditarEliminar');
    }
  }

  ngOnInit(): void { }

}
