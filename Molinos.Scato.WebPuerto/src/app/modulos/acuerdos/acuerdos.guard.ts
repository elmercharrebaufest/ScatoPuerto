import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SessionService } from '@ScatoServicios/session.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class AcuerdosGuard implements CanActivate {

  constructor(
    private sessionService: SessionService, 
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.sessionService.getUser();
    
    if (!user || !user.permisos) {
      this.router.navigate(['/']); 
      return false;
    }

    const permisos: string[] = user.permisos;
    const path = route.routeConfig?.path;
    
    let hasAccess = false;
    
    switch (path) {
      case 'editar/:id':
        hasAccess = permisos.includes('Acuerdos_CrearEditarEliminar');
        break;

      case 'tarifas/:id':
        hasAccess = permisos.includes('Acuerdos_VisualizarAsociarTarifas');
        break;

      case 'ver/:id':
      case '':
        hasAccess = permisos.includes('Acuerdos_Visualizar') || permisos.includes('Acuerdos_Lectura_Visualizar');
        break;
    }

    if (!hasAccess) {
      this.confirmationDialogService.error('No tiene los permisos necesarios para acceder a esta pantalla.');
      
      this.router.navigate(['/acuerdos']); 
      return false;
    }

    return true;
  }
}
