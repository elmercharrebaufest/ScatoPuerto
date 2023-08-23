import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { ATAPuerto } from '@ScatoModels/ata-puerto';
import { CompaniaDeFumigacion } from '@ScatoModels/programa-embarque/compania-de-fumigacion';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TipoDeFumigacion } from '@ScatoModels/programa-embarque/tipo-de-fumigacion';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AltaBajaMantenimientoService {

  constructor(private formBuilder: FormBuilder,
              private embarqueService: EmbarqueService,
              private nominacionService: NominacionService) { }

  public inicializarFormNuevo(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      nombre: [''],
      descripcion: [''],
      mail: ['']
    });
  }

  public registrarSurveyor(surveyor: Surveyor): Observable<boolean> {
    return this.nominacionService.registrarSurveyor(surveyor);
  }
  public registrarAgenciaMaritimaPuerto(agencia: AgenciaMaritimaPuerto) {
    return this.embarqueService.agregarAgenciaMaritimaPuerto(agencia).subscribe(data => {return of(true)});
  }
  public registrarAgregarATAPuerto(ataPuerto: ATAPuerto) {
    return this.embarqueService.agregarATAPuerto(ataPuerto).subscribe(data => {return of(true)});
  }
  public registrarTipoDeFumigacion(tipoDeFumigacion: TipoDeFumigacion) {
    return this.nominacionService.registrarTipoDeFumigacion(tipoDeFumigacion).subscribe(data => {return of(true)});
  }
  public registrarCompaniaDeFumigacion(companiaDeFumigacion: CompaniaDeFumigacion) {
    return this.nominacionService.registrarCompaniaDeFumigacion(companiaDeFumigacion).subscribe(data => {return of(true)});
  }
}
