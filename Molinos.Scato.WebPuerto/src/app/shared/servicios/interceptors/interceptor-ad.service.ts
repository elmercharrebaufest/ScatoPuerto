import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InterceptorADService implements HttpInterceptor {
  confirmationDialogService: any;

  constructor(confirmationDialogService: ConfirmationDialogService,
              private router: Router) 
  { 
    this.confirmationDialogService = confirmationDialogService;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const requestClone = request.clone();

    return next.handle(requestClone).pipe(
      catchError(err => {
        if (err.status === 401) {
            // auto logout if 401 response returned from api
            // this.authenticationService.logout();
            // location.reload(true);
            this.mensajeGenerico(err.statusText, err.error);
        }
        
        const error = err.error || err.statusText;
        return throwError(console.warn(err));
      }));
  }

  mensajeGenerico(textTitle: string, text: string){
    this.confirmationDialogService.confirm(textTitle, text, 'Aceptar', '', null, null, Tipoalerta.Warning)
      .then( (confirmed) => {
        // if (confirmed) {
          // console.log('mensaje genérico de aviso');
          this.router.navigate(['/login']);
        // };
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }
}
