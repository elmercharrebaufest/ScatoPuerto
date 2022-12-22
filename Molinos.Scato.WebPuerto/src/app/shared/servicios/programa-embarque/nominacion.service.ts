import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NominacionService {
    // #region Variables  
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
    
}
