import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NominacionRoutingModule } from './nominacion-routing.module';
import { NominacionRegistroComponent } from './nominacion-registro/nominacion-registro.component';
import { NominacionDatoTecnicoComponent } from './nominacion-dato-tecnico/nominacion-dato-tecnico.component';
import { NominacionRecibosComponent } from './nominacion-recibos/nominacion-recibos.component';
import { NominacionIntervencionesComponent } from './nominacion-intervenciones/nominacion-intervenciones.component';
import { SharedModule } from 'app/shared/shared.module';
import { VaporState } from '@ScatoStores/programa-embarque/vapor/vapor.state';
import { NgxsModule } from '@ngxs/store';
import { DestinoState } from '@ScatoStores/programa-embarque/destino/destino.state';
import { ExportadorState } from '@ScatoStores/programa-embarque/exportador/exportador.state';
import { AgenciaMaritimaPuertoState } from '@ScatoStores/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.state';
import { ATAPuertoState } from '@ScatoStores/programa-embarque/ata-puerto/ata-puerto.state';
import { CoordinadorPuertoState } from '@ScatoStores/programa-embarque/coordinador-puerto/coordinador-puerto.state';
import { BanderaState } from '@ScatoStores/programa-embarque/bandera/bandera.state';
import { FormsModule } from '@angular/forms';
import { TipoDeContratoState } from '@ScatoStores/programa-embarque/tipo-de-contrato/tipo-de-contrato.state';
import { SurveyorState } from '@ScatoStores/programa-embarque/surveyor/surveyor.state';
import { MuelleDeCargaState } from '@ScatoStores/programa-embarque/muelle-de-carga/muelle-de-carga.state';
import { TasaDeCargaState } from '@ScatoStores/programa-embarque/tasa-de-carga/tasa-de-carga.state';
import { TipoDeCalidadState } from '@ScatoStores/programa-embarque/tipo-de-calidad/tipo-de-calidad.state';
import { CalidadValorState } from '@ScatoStores/programa-embarque/calidad-valor/calidad-valor.state';

const libComponents = [
  NominacionRegistroComponent, 
  NominacionDatoTecnicoComponent, 
  NominacionRecibosComponent, 
  NominacionIntervencionesComponent
];
const libState = [
  DestinoState,
  ExportadorState,
  CoordinadorPuertoState,
  VaporState,
  ATAPuertoState,
  AgenciaMaritimaPuertoState,
  BanderaState,
  TipoDeContratoState,
  SurveyorState,
  MuelleDeCargaState,
  TasaDeCargaState,
  TipoDeCalidadState,
  CalidadValorState,
]
@NgModule({

  declarations: [libComponents],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NominacionRoutingModule,
    NgxsModule.forRoot(
      libState
    )
  ]
})
export class NominacionModule { }
