import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TasaDeCarga } from '@ScatoModels/programa-embarque/tasa-de-carga';
import { TipoDeContrato } from '@ScatoModels/programa-embarque/tipo-de-contrato';
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


    set NominacionParametros(value: any) {
        this._nominacionParametros.next(value);
    }
    get NominacionParametros() {
        return this._nominacionParametros.asObservable();
    }
    public obtenerMuellesDeCarga(): Observable<MuelleDeCarga[]> {
        return this.http.get<MuelleDeCarga[]>(`${this.url}ProgramaEmbarque/ListarMuelleDeCarga`, { 'withCredentials': true });
    }
    public obtenerTipoDeContrato(): Observable<TipoDeContrato[]> {
        return this.http.get<TipoDeContrato[]>(`${this.url}ProgramaEmbarque/ListarTipoDeContrato`, { 'withCredentials': true });
    }
    public obtenerSurveyor(): Observable<Surveyor[]> {
        return this.http.get<Surveyor[]>(`${this.url}ProgramaEmbarque/ListarSurveyor`, { 'withCredentials': true });
    }
    public obtenerTasaDeCarga(): Observable<TasaDeCarga[]> {
        return this.http.get<TasaDeCarga[]>(`${this.url}ProgramaEmbarque/ListarTasaDeCarga`, { 'withCredentials': true });
    }
}
