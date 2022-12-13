import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
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
        return this.http.get<MuelleDeCarga[]>(`${this.url}Nominacion/ObtenerMuelleDeCarga`, { 'withCredentials': true });
    }
    public obtenerTipoDeContrato(): Observable<TipoDeContrato[]> {
        return this.http.get<TipoDeContrato[]>(`${this.url}Nominacion/ObtenerTipoDeContrato`, { 'withCredentials': true });
    }
}
