import { Injectable } from '@angular/core';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { BuqueService } from '@ScatoServicios/buque.service';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { NominacionDatoTecnicoService } from '@ScatoServicios/programa-embarque/nominacion-dato-tecnico.service';
import { TipoDeCalidad } from '@ScatoModels/programa-embarque/tipo-de-calidad';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { CalidadValor } from '@ScatoModels/programa-embarque/calidad-valor';
import { TasaDeCarga } from '@ScatoModels/programa-embarque/tasa-de-carga';
import { TipoDeContrato } from '@ScatoModels/programa-embarque/tipo-de-contrato';
import { ProgramaEmbarqueNominacionDatoTecnico } from '@ScatoModels/programa-embarque/programa-embarque-nominacion-dato-tecnico';
import { NominacionDatoTecnico } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico';
import { NominacionValida } from '@ScatoModels/programa-embarque/nominacion-valida';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ATAPuerto } from '@ScatoModels/ata-puerto';

@Injectable({
    providedIn: 'root'
})
export class NominacionDatoTecnicoRegistroService {

    constructor(private confirmationDialogService: ConfirmationDialogService,
        private buqueService: BuqueService,
        private embarqueService: EmbarqueService,
        private nominacionService: NominacionDatoTecnicoService,
        private formBuilder: FormBuilder) {
    }

    public seleccionarInformacionVapor(vaporId: number): Observable<VaporInformacion> {
        return this.buqueService.obtenerVaporInformacion(vaporId);
    }

    public inicializarFormNuevo(): FormGroup {
        const validadorImo = this.crearFnValidarImo();
        return this.formBuilder.group({
            id: [0, Validators.required],
            materialPuerto: ['', Validators.required],
            tipoDeCalidad: [''],
            nominacionDatoTecnicoCalidad: [],
            cantidadTotal: ['', Validators.required],
            tolerancia: [''],
            observaciones: [''],
            vaporInformacion: [null, [Validators.required, validadorImo]],
            bandera: [{ value: '', disabled: true }],
            etaRecalada: ['', Validators.required],
            obligacionDeCarga: ['', Validators.required],
            muelleDeCarga: ['', Validators.required],
            otroMuelleNombre: [''],
            tasaDeCarga: [''],
            tasaDeCargaValor: [''],
            dem: [''],
            des: [''],
            tipoDeContrato: ['', Validators.required],
            ataPuerto: [[]],
            agenciaMaritimaPuerto: [[], Validators.required],
            surveyor: [[]],
            observacionesSurveyor: [''],
            nominacionDatoTecnicoExportador: this.formBuilder.array([]),
            nominacionDatoTecnicoDestino: this.formBuilder.array([]),
            nominacionDatoTecnicoCoordinadorPuerto: this.formBuilder.array([]),
        });
    }

    private crearFnValidarImo(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors => {
            const vapor = control.value as VaporInformacion;
            if (!vapor || typeof vapor != 'object') { // Esta validación ya se prevee en la función validaSeleccionVapor() del componente
                return null;
            }
            if (!vapor.imoVapor) {
                const mensaje = 'El buque seleccionado no tiene establecido su IMO lo cuál no permitirá continuar con el guardado';
                this.confirmationDialogService.confirm('Registro Nominación - Dato Tecnico', mensaje, 'Cerrar.', '', null, null, Tipoalerta.Warning);
                return { buqueSinImo: true };
            }
            return null;
        }
    }

    public inicializarFormExportador(exportador: NominacionDatoTecnicoExportador = null, nominacionDatoTecnico: number = 0): FormGroup {
      const group = this.formBuilder.group({
        id: '',
        exportador: ['', Validators.required],
        cantidad: [0, Validators.required],
        tolerancia: 0,
        nominacionDatoTecnico_Id: '',
        toleranciasDiferenciadas: false,
        toleranciaPositiva: 0,
        toleranciaNegativa: 0
      });
      if (exportador) {
        group.patchValue({
          id: exportador.id,
          exportador: exportador.exportador,
          cantidad: exportador.cantidad,
          tolerancia: exportador.tolerancia || 0,
          nominacionDatoTecnico_Id: nominacionDatoTecnico,
          toleranciasDiferenciadas: exportador.toleranciasDiferenciadas || false,
          toleranciaPositiva: exportador.toleranciaPositiva || 0,
          toleranciaNegativa: exportador.toleranciaNegativa || 0
        });
      }
      return group;
    }

    public inicializarFormDestino(destino: NominacionDatoTecnicoDestino = null, nominacionDatoTecnico: number = 0): FormGroup {
        if (destino != null) {
            return this.formBuilder.group({
                id: destino.id,
                destino: destino.destino,
                cantidad: destino.cantidad,
                nominacionDatoTecnico_Id: nominacionDatoTecnico
            })
        } else {
            return this.formBuilder.group({
                id: 0,
                destino: ['', Validators.required],
                cantidad: [0, Validators.required],
                nominacionDatoTecnico_Id: 0
            })
        }
    }

    public inicializarFormCoordinadorPuerto(coordinadorPuerto: NominacionDatoTecnicoCoordinador = null, nominacionDatoTecnico: number = 0): FormGroup {
        if (coordinadorPuerto != null) {
            return this.formBuilder.group({
                id: coordinadorPuerto.id,
                coordinadorPuerto: coordinadorPuerto.coordinadorPuerto,
                cantidad: coordinadorPuerto.cantidad,
                nominacionDatoTecnico_Id: nominacionDatoTecnico
            })
        } else {
            return this.formBuilder.group({
                id: 0,
                coordinadorPuerto: ['', Validators.required],
                cantidad: [0, Validators.required],
                nominacionDatoTecnico_Id: 0
            })
        }
    }

    public validacionGrabar(datoTecnicoForm: FormGroup): boolean {
      const mostrarError = (mensaje: string) => this.confirmationDialogService.confirm('Registro Nominación - Dato Tecnico', mensaje, 'Cerrar.', '', null, null, Tipoalerta.Warning);

      if (datoTecnicoForm.invalid == true) {
        mostrarError('Revise que este completado los campos marcados en rojo, asi como la información en Destino, Cliente y Cargador.');
        return false;
      }

      const datoTecnicoCoordinadorForm = datoTecnicoForm.get('nominacionDatoTecnicoCoordinadorPuerto') as FormArray;
      const datoTecnicoDestinoForm = datoTecnicoForm.get('nominacionDatoTecnicoDestino') as FormArray;
      const datoTecnicoExportadorForm = datoTecnicoForm.get('nominacionDatoTecnicoExportador') as FormArray;

      const coordinadores = datoTecnicoCoordinadorForm?.controls ?? null;
      const destinos = datoTecnicoDestinoForm?.controls ?? null;
      const exportadores = datoTecnicoExportadorForm?.controls ?? null;

      if (!coordinadores || !destinos || !exportadores) {
        mostrarError('Debe agregar destino, cargador y cliente para la nominación')
        return false;
      }

      if (datoTecnicoCoordinadorForm.status != 'VALID' || datoTecnicoCoordinadorForm.status != 'VALID' || datoTecnicoCoordinadorForm.status != 'VALID') {
        mostrarError('Debe completar todos los datos en destino, cargador y cliente');
        return false;
      }

      if (coordinadores.length == 0 || destinos.length == 0 || exportadores.length == 0) {
        mostrarError('Debe agregar destino, cargador y cliente a la nominación');
        return false;
      }

      const cantidadTotal = +datoTecnicoForm.get('cantidadTotal').value;

      let cantidadSumaDestino = 0;
      for (const destino of destinos) {
        const cantidad = +destino.get('cantidad').value;
        cantidadSumaDestino += cantidad;

        if (!destino.get('destino').value || !cantidad) {
          mostrarError('Falta completar información en destino');
          return false;
        }

        if (cantidadSumaDestino > cantidadTotal) {
          mostrarError('La cantidad en destino excede al total')
          return false;
        }
      }

      let cantidadSumaCoordinador = 0;
      for (const coordinador of coordinadores) {
        const cantidad = +coordinador.get('cantidad').value;
        cantidadSumaCoordinador += cantidad;

        if (!coordinador.get('coordinadorPuerto').value || !cantidad) {
          mostrarError('Falta completar información en cliente');
          return false;
        }

        if (cantidadSumaCoordinador > cantidadTotal) {
          mostrarError('La cantidad en cliente excede al total');
          return false;
        }
      }

      let cantidadSumaExportador = 0;
      for (const exportador of exportadores) {
        const cantidad = +exportador.get('cantidad').value;
        cantidadSumaExportador += cantidad;

        const controlTolerancia = exportador.get('tolerancia');
        if (controlTolerancia.value === null || controlTolerancia.value === undefined || controlTolerancia.value === '') {
          controlTolerancia.setValue(0);
        }

        if (!exportador.get('exportador').value || !cantidad) {
          mostrarError('Falta completar información en Cargador');
          return false;
        }

        if (cantidadSumaExportador > cantidadTotal) {
          mostrarError('La cantidad en cargador excede al total');
          return false;
        }
      }

      const etaRecalada = new Date(datoTecnicoForm.get('etaRecalada').value);
      if (isNaN(etaRecalada.getTime()) || etaRecalada.getFullYear() < 2020 || etaRecalada.getFullYear() > 2099) {
        mostrarError('La fecha ETA Recalada no es válida');
        return false;
      }

      const obligacionDeCarga = new Date(datoTecnicoForm.get('obligacionDeCarga').value);
      if (isNaN(obligacionDeCarga.getTime()) || obligacionDeCarga.getFullYear() < 2020 || obligacionDeCarga.getFullYear() > 2099) {
        mostrarError('La fecha ETA Recalada no es válida');
        return false;
      }

      return true;
    }

    public grabarNominacion(nominacion: Nominacion): Observable<boolean>{
        return this.nominacionService.registroNominacion(nominacion).pipe(map((data: boolean) => { return data; }));
    }

    public listarCombosDatoTecnico(): Observable<ProgramaEmbarqueNominacionDatoTecnico> {
        return this.nominacionService.listarCombosDatoTecnico().pipe(map((data: ProgramaEmbarqueNominacionDatoTecnico) => { return data; }));
    }

    public validarCreacionNominacion(nominacion: NominacionValida): Observable<boolean> {
        return this.nominacionService.validarCreacionNominacion(nominacion).pipe(map((data: boolean) => { return data; }));
    }

    public listarAgenciaMaritimaPuerto(): Observable<AgenciaMaritimaPuerto[]> {
        return this.embarqueService.obtenerListadoAgenciasMaritimas().pipe(map((data: AgenciaMaritimaPuerto[]) => { return data; }));
    }

    public listarATAPuerto(): Observable<ATAPuerto[]> {
        return this.embarqueService.obtenerListadoATAPuerto().pipe(map((data: ATAPuerto[]) => { return data; }));
    }

    public listarSurveyor(): Observable<Surveyor[]> {
        return this.nominacionService.obtenerSurveyor().pipe(map((data: Surveyor[]) => { return data; }));
    }
}
