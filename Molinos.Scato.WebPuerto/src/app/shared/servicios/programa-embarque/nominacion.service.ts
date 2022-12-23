import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
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

    public obtenerNominacion(id: number) {
        return this.http.get<Nominacion>(`${this.url}ProgramaEmbarque/ObtenerNominacion?id=${id}`, { 'withCredentials': true });
    }


    
}
