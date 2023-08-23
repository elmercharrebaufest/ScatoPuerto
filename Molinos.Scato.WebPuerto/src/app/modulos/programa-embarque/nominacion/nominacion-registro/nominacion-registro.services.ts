import { Injectable } from "@angular/core";
import { Nominacion } from "@ScatoModels/programa-embarque/nominacion";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class NominacionRegistroService {

    constructor(private nominacionService: NominacionService) {
    }

    public obtenerNominacion(id: number): Observable<Nominacion>{
        return this.nominacionService.obtenerNominacion(id).pipe(map((data: Nominacion) => {
            return data;
        }));
    }
    public grabarNominacion(nominacion: Nominacion): Observable<boolean>{
        return this.nominacionService.registroNominacion(nominacion).pipe(map((data: boolean) => { return data; }));
    }
}