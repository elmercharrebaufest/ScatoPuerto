import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { PrimeNGConfig } from 'primeng/api'
import { Subscription } from 'rxjs';
export let browserRefresh = false;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web-puerto';
  subscription: Subscription;

  constructor(
    private primeConfig: PrimeNGConfig,
    private auth: AutenticadorService,
    private router: Router
    ) { 
      this.auth.autenticarUsuario();
      this.subscription = router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          browserRefresh = !router.navigated;
        }
    });
    }

  ngOnInit() {
    this.primeConfig.ripple = true;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
