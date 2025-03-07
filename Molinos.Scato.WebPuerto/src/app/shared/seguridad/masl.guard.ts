import { SessionService } from '@ScatoServicios/session.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class MaslGuard implements CanActivate {

  constructor(
    private msalService: MsalService,
    public session: SessionService,
    private router: Router
  ){ }

  canActivate() {
    // console.log('MaslGuard canActivate')
    // console.log(this.msalService.instance.getActiveAccount())
    // console.log(this.session.getUser())
    if (this.msalService.instance.getActiveAccount() == null && 
        this.session.getUser() == null){

      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
