import { Injectable } from "@angular/core";
import { Exportador } from "@ScatoModels/exportador";
import { PlanoDeCargaService } from "@ScatoServicios/plano-de-carga.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class NominacionDatoTecnicoRegistroService {

    constructor(private planoDeCargaServices: PlanoDeCargaService) {
    }
    public listarExportadores(): Observable<Exportador[]> {
        return this.planoDeCargaServices.obtenerExportadores().pipe(map((data: Exportador[]) => { return data; }));
    }

    public listarFormatos():string[]{
        const formatos: string[] = ["Asiático", "Europeo"];
        return formatos;
    }
    public listarUnidades(): string[]{
        const unidades: string[] = ["Kg", "Tn"];
        return unidades;

    }
}