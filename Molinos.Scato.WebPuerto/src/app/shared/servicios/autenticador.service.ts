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

  // permisosUser: Usuario = {
  //   "username":"usuarioPrueba",
  //   "permisos":
  //     [
  //       'LineUp_Ver',
  //       'LineUp_AltaEmbarque', // IMPLEMENTADO
  //       'LineUp_VerCalendario', // IMPLEMENTADO
  //       'LineUp_VerGeo', // IMPLEMENTADO
  //       'LineUp_EditarEmbarqueEnCalidad', // IMPLEMENTADO
  //       'LineUp_EditarOrdenEmbarque', // IMPLEMENTADO
  //       'LineUp_EditarUbicacionEmbarque', // IMPLEMENTADO
  //       'LineUp_EditarChecksEmbarque', // IMPLEMENTADO
  //       'LineUp_EditarPlanoDeCarga', // IMPLEMENTADO
  //       'LineUp_EditarBuque', // IMPLEMENTADO
  //       'LineUp_EliminarBuque', // IMPLEMENTADO
  //       'LineUp_EnviarMail', // nuevo, agregar // IMPLEMENTADO
  //       'LineUp_Exportar', // nuevo, agregar // IMPLEMENTADO
  //       // PlanoDeCarga
  //       'PlanoDeCarga_Ver',
  //       // 'PlanoDeCarga_Modificar', // nuevo, agregar
  //       'PlanoDeCarga_AgregarNuevoBuque', // IMPLEMENTADO
  //       'PlanoDeCarga_AMB', // IMPLEMENTADO
  //       'PlanoDeCarga_Adjuntar', // IMPLEMENTADO
  //       'PlanoDeCarga_Guardar', // IMPLEMENTADO
  //       'PlanoDeCarga_Finalizar', // IMPLEMENTADO
  //       'PlanoDeCarga_Imprimir', // IMPLEMENTADO
  //       'PlanoDeCarga_Cancelar', // IMPLEMENTADO
  //       'GraficoDeCeldas_Modificar',
  //       // 'ConformacionManosEmbarque_Modificar', // IMPLEMENTADO

  //       'Operadores_EnviarATablerista', // nuevo, agregar // IMPLEMENTADO

  //       // TableroSolido
  //       // 'TableroSolido_Amarre_Modificar',
  //       'TableroSolido_Umap_EliminarRegistro', // IMPLEMENTADO
  //       'TableroSolido_Umap_AgregarEncendido', // IMPLEMENTADO
  //       // 'TableroSolido_IniciarCargaBalanzas', // IMPLEMENTADO
  //       'TableroSolido_CorteManualBalanzas', // IMPLEMENTADO
  //       'TableroSolido_VerMotivoCorte',
  //       'TableroSolido_MotivoCorte_Editar', // IMPLEMENTADO
  //       'TableroSolido_TerminarCarga_Exportar', // IMPLEMENTADO
  //       'TableroSolido_VerRitmosEmbarqueBlzas78', // IMPLEMENTADO
  //       'TableroSolido_VerCargasBodegas', // IMPLEMENTADO
  //       'TableroSolido_VerRitmos', // IMPLEMENTADO
  //       'TableroSolido_VerInformacionAdicional', // IMPLEMENTADO
  //       // Liquido
  //       'Liquido_VerPeriodoDeCarga',
  //       // 'Liquido_EditarPeriodoDeCarga',
  //       'Liquido_VerHabilitacionTanques',
  //       // 'Liquido_EditarHabilitacionTanques', // IMPLEMENTADO
  //       // 'Liquido_ConformacionLineasEmb_Editar', // IMPLEMENTADO
  //       'Liquido_ConformacionLineasEmb_Eliminar', // IMPLEMENTADO
  //       'Liquido_PlanillaEmbarque_Guardar', // IMPLEMENTADO
  //       // TableroLiquido
  //       'TableroLiquido_Planilla_Editar', // IMPLEMENTADO
  //       'TableroLiquido_AgregarTurno', // IMPLEMENTADO
  //       'TableroLiquido_GuardarTurno', // IMPLEMENTADO
  //       'TableroLiquido_EnviarARecibidores', // IMPLEMENTADO
  //       'TableroLiquido_AgregarCorte', // IMPLEMENTADO
  //       'TableroLiquido_Exportar', // IMPLEMENTADO
  //       'TableroLiquido_VerRitmos',
  //       // Recibidores / Calidad
  //       'Recibidores_Ver',
  //       'Recibidores_ExportarEnviarPlanillas', // IMPLEMENTADO
  //       'Recibidores_EmitirRecibo', // IMPLEMENTADO
  //       'Recibidores_Nir_AgregarNuevaFila', // IMPLEMENTADO
  //       'Recibidores_Nir_EliminarFila', // IMPLEMENTADO
  //       'Recibidores_Nir_EnviarNir', // IMPLEMENTADO
  //       "Recibidores_Recibo_Imprimir", // IMPLEMENTADO
  //       "Recibidores_Recibo_ConfirmarDatos", // IMPLEMENTADO
  //       "Recibidores_Imprimir", // IMPLEMENTADO
  //       // Geolocalizacion
  //       'Geolocalizacion_Ver',
  //     ],
  //     "token": "",
  //     "autenticado": false
  // }
  
  constructor(private http: HttpClient, 
              private sessionService: SessionService) { }

  /**
   * 
   * @returns {Observable<any>} Observable<any>
   * @memberof AutenticadorService
   */
  public autenticarUsuario() {
    // return this.http.get(`${this.url}AutenticarUsuario`, { 'withCredentials': true });
    return this.http.get(`${this.url}AutenticarUsuarioAD`, { 'withCredentials': true });
  }

  public renovarAuthUsuario(){
    this.autenticarUsuario().subscribe((res: Usuario) => {
      this.sessionService.clear();
      res.autenticado = true;
      this.sessionService.setUser(res);
      // this.permisosUser.autenticado = true; // hardcode
      // this.sessionService.setUser(this.permisosUser); // hardcode
    })
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
