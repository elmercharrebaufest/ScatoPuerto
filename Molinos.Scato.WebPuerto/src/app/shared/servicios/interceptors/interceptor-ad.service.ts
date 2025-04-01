import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';


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
    const username = environment.webPuertoApiUsername;  
    const password = environment.webPuertoApiPassword; 

    let isAzure = request.url.includes(environment.apiGraph);

    if (username && password && !isAzure) {
      // Construir el header de autenticación básica
      const auth = 'Basic ' + btoa(`${username}:${password}`);

      // Clonar la solicitud y agregar los encabezados
      const clonedRequest = request.clone({
        setHeaders: {
          'Authorization': auth  // Agregar el encabezado de Autenticación Básica
        }
      });

      // Manejar la solicitud clonada
      return next.handle(clonedRequest).pipe(
        catchError(err => {
          if (err.status === 401) {
            // Si la respuesta es 401 (No autorizado), mostramos un mensaje
            this.mensajeGenerico(err.statusText, err.error);
          }

          const error = err.error || err.statusText;
          return throwError(console.warn(err));
        })
      );
    } else {
      // Si no hay username o password, simplemente dejamos la solicitud sin modificar
      return next.handle(request).pipe(
        catchError(err => {
          if (err.status === 401) {
            this.mensajeGenerico(err.statusText, err.error);
          }

          const error = err.error || err.statusText;
          return throwError(console.warn(err));
        })
      );
    }
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
