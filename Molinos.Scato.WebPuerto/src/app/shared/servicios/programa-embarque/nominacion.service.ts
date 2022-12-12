import { Injectable } from '@angular/core';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NominacionService {
    private _nominacionParametros: BehaviorSubject<NominacionParametros> = new BehaviorSubject<NominacionParametros>(null);


    set NominacionParametros(value: any){
        this._nominacionParametros.next(value);
    }
    get NominacionParametros(){
        return this._nominacionParametros.asObservable();
    }
}
