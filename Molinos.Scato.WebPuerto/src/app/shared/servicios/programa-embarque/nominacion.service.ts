import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompaniaDeFumigacion } from '@ScatoModels/programa-embarque/compania-de-fumigacion';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
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
    // #endregion

    // #region Constructor
    constructor(private http: HttpClient) { }
    // #endregion

    // #region Compartir Datos
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
    // #endregion
    
}
