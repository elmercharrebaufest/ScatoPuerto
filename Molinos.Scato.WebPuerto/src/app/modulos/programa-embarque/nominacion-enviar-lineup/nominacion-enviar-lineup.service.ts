import { Injectable } from '@angular/core';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { NominacionLineUp } from '@ScatoModels/programa-embarque/nominacion-lineup';
import { ProgramaEmbarqueNominacionesEnvioLineUp } from '@ScatoModels/programa-embarque/programa-embarque-nominaciones-envio';
import { ProgramaEmbarqueResultadoResultado } from '@ScatoModels/programa-embarque/programa-embarque-nominaciones-resultado';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NominacionEnviarLineupService {

  constructor(private nominacionService: NominacionService) {
  }

  public listarBuquesNominacion(): Observable<VaporInformacion[]> {
    return this.nominacionService.listarBuquesNominacion().pipe(map((data: VaporInformacion[]) => { return data; }));
  }
  public listarNominacionPorBuque(vaporInformacion_Id: number): Observable<NominacionLineUp[]> {
    return this.nominacionService.listarNominacionPorBuque(vaporInformacion_Id).pipe(map((data: NominacionLineUp[]) => { return data; }));
  }
  public enviarNominacionLineUp(nominacionesEnvioLineUp: ProgramaEmbarqueNominacionesEnvioLineUp): Observable<ProgramaEmbarqueResultadoResultado> {
    return this.nominacionService.enviarNominacionLineUp(nominacionesEnvioLineUp).pipe(map((data: ProgramaEmbarqueResultadoResultado) => { return data; }));
  }
}
