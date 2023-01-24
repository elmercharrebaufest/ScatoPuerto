import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { CompaniaDeFumigacion } from '@ScatoModels/programa-embarque/compania-de-fumigacion';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { NominacionExportadores } from '@ScatoModels/programa-embarque/nominacion-exportadores';
import { NominacionLineUp } from '@ScatoModels/programa-embarque/nominacion-lineup';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { ProgramaEmbarqueNominacionesEnvioLineUp } from '@ScatoModels/programa-embarque/programa-embarque-nominaciones-envio';
import { ProgramaEmbarqueResultadoResultado } from '@ScatoModels/programa-embarque/programa-embarque-nominaciones-resultado';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TipoDeFumigacion } from '@ScatoModels/programa-embarque/tipo-de-fumigacion';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NominacionService { 

    // #region Variables  
    private url: string = environment.apiUrl;
    private _nominacionParametros: BehaviorSubject<NominacionParametros> = new BehaviorSubject<NominacionParametros>(null);
    private _nominacionExportadores: BehaviorSubject<NominacionExportadores> = new BehaviorSubject<NominacionExportadores>(null);
    private _actualizarAuditoria: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

    // #endregion

    // #region Constructor
    constructor(private http: HttpClient) { }
    // #endregion

    // #region Compartir Datos
    set NominacionExportadores(value: any) {
        this._nominacionExportadores.next(value);
    }
    get NominacionExportadores() {
        return this._nominacionExportadores.asObservable();
    }
    set ActualizarAuditoria(value: any) {
        this._actualizarAuditoria.next(value);
    }
    get ActualizarAuditoria() {
        return this._actualizarAuditoria.asObservable();
    }
    set NominacionParametros(value: any) {
        this._nominacionParametros.next(value);
    }
    get NominacionParametros() {
        return this._nominacionParametros.asObservable();
    }
    // #endregion

    // #region Servicios

    public registroNominacion(nominacion: Nominacion) {
        return this.http.post(`${this.url}ProgramaEmbarque/RegistrarNominacion`, nominacion, { 'withCredentials': true });
    }

    public obtenerNominacion(id: number) {
        return this.http.get<Nominacion>(`${this.url}ProgramaEmbarque/ObtenerNominacion?id=${id}`, { 'withCredentials': true });
    }
    public registrarSurveyor(surveyor: Surveyor) {
        return this.http.post<boolean>(`${this.url}ProgramaEmbarque/RegistrarSurveyor`, surveyor, { 'withCredentials': true });
    }
    public registrarTipoDeFumigacion(tipoDeFumigacion: TipoDeFumigacion) {
        return this.http.post<boolean>(`${this.url}ProgramaEmbarque/RegistrarTipoDeFumigacion`, tipoDeFumigacion, { 'withCredentials': true });
    }
    public registrarCompaniaDeFumigacion(companiaDeFumigacion: CompaniaDeFumigacion) {
        return this.http.post<boolean>(`${this.url}ProgramaEmbarque/RegistrarCompaniaDeFumigacion`, companiaDeFumigacion, { 'withCredentials': true });
    }
    public listarBuquesNominacion():Observable<VaporInformacion[]> {
        return this.http.get<VaporInformacion[]>(`${this.url}ProgramaEmbarque/ListarBuquesNominacion`, { 'withCredentials': true });
    }
    public listarNominacionPorBuque(vaporInformacion_Id: number):Observable<NominacionLineUp[]> {
        return this.http.get<NominacionLineUp[]>(`${this.url}ProgramaEmbarque/ListarNominacionPorBuque?vaporInformacion_Id=${vaporInformacion_Id}`, { 'withCredentials': true });
    }
    public enviarNominacionLineUp(nominacionesEnvioLineUp: ProgramaEmbarqueNominacionesEnvioLineUp):Observable<ProgramaEmbarqueResultadoResultado> {
        return this.http.post<ProgramaEmbarqueResultadoResultado>(`${this.url}ProgramaEmbarque/EnviarNominacionLineUp`,nominacionesEnvioLineUp, { 'withCredentials': true });
    }
    
    // #endregion
    
}
