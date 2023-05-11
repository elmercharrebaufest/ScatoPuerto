import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { SessionService } from './session.service';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class AutenticadorService {
  url: string = environment.apiUrl;
  urlAzure: string = environment.apiAzureUrl;
  constructor(private http: HttpClient,
              private sessionService: SessionService) { }

  /**
   *
   * @returns {Observable<any>} Observable<any>
   * @memberof AutenticadorService
   */
  /* public autenticarUsuario() {
    return this.http.get(`${this.url}AutenticarUsuarioAD`, { 'withCredentials': true });
  } */

   public autenticarUsuario() {
    return this.http.get(`${this.url}AutenticarUsuarioAzureAD?username=${'embarque_id'}&password=${'fechaHorastring'}`, { 'withCredentials': true });
  }
  public ObtenerGruposAD(grupos: string[]) {
    return this.http.post(`${this.url}ObtenerGruposAD`, grupos, { 'withCredentials': true });
    //return this.http.get(`${this.url}ObtenerGruposAD?username=${'embarque_id'}&password=${'fechaHorastring'}`, { 'withCredentials': true });
  }

  public autenticarUsuarioAd(username, password) {
    return this.http.get(`${this.urlAzure}azure/${username}/${password}`, { 'withCredentials': false });
  }
  public renovarAuthUsuario(){
   /*  this.autenticarUsuario().subscribe((res: Usuario) => {
      this.sessionService.clear();
      res.autenticado = true;
      this.sessionService.setUser(res);
    }) */
  }

  // public getUserName() {
  //   return this.sessionService.getUsername();
  // }

  // public estaAutenticado() {
  //   let permisos = sessionStorage.getItem('username') ? sessionStorage.getItem('permisos').replace('[', '').replace(']', '').split(',') : '';
  //   return permisos ? true : false;
  // }

  // public Is(permiso: PermisosScato): boolean {
  //   if (this.sessionService.getPermisos())
  //     return this.sessionService.getPermisos().some(u => u == permiso);
  //   return false;
  // }
}
