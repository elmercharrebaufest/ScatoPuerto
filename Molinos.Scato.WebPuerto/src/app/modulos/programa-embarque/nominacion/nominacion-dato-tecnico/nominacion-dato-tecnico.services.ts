import { Injectable } from '@angular/core';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
        return this.formBuilder.group({
            id: [0, Validators.required],
            materialPuerto: ['', Validators.required],
            tipoDeCalidad: [''],
            nominacionDatoTecnicoCalidad: [],
            cantidadTotal: ['', Validators.required],
            tolerancia: [''],
            observaciones: [''],
            vaporInformacion: [[], Validators.required],
            bandera: [{value: '', disabled: true }],
            etaRecalada: ['', Validators.required],
            obligacionDeCarga: ['', Validators.required],
            muelleDeCarga: ['', Validators.required],
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

    public inicializarFormExportador(exportador: NominacionDatoTecnicoExportador = null, nominacionDatoTecnico: number = 0): FormGroup {
        if (exportador != null) {
            return this.formBuilder.group({
                nominacionDatoTecnicoExportador_Id: exportador.nominacionDatoTecnicoExportador_Id,
                exportador: exportador.exportador,
                cantidad: exportador.cantidad,
                tolerancia: exportador.tolerancia,
                nominacionDatoTecnico_Id: nominacionDatoTecnico
            })
        } else {
            return this.formBuilder.group({
                nominacionDatoTecnicoExportador_Id: '',
                exportador: ['', Validators.required],
                cantidad: [0, Validators.required],
                tolerancia: [0, Validators.required],
                nominacionDatoTecnico_Id: '',
            })
        }
    }

    public inicializarFormDestino(destino: NominacionDatoTecnicoDestino = null, nominacionDatoTecnico: number = 0): FormGroup {
        if (destino != null) {
            return this.formBuilder.group({
                nominacionDatoTecnicoDestino_Id: destino.nominacionDatoTecnicoDestino_Id,
                destino: destino.destino,
                cantidad: destino.cantidad,
                nominacionDatoTecnico_Id: nominacionDatoTecnico
            })
        } else {
            return this.formBuilder.group({
                nominacionDatoTecnicoDestino_Id: 0,
                destino: ['', Validators.required],
                cantidad: [0, Validators.required],
                nominacionDatoTecnico_Id: 0
            })
        }
    }

    public inicializarFormCoordinadorPuerto(coordinadorPuerto: NominacionDatoTecnicoCoordinador = null, nominacionDatoTecnico: number = 0): FormGroup {
        if (coordinadorPuerto != null) {
            return this.formBuilder.group({
                nominacionDatoTecnicoCoordinador_Id: coordinadorPuerto.nominacionDatoTecnicoCoordinador_Id,
                coordinadorPuerto: coordinadorPuerto.coordinadorPuerto,
                cantidad: coordinadorPuerto.cantidad,
                nominacionDatoTecnico_Id: nominacionDatoTecnico
            })
        } else {
            return this.formBuilder.group({
                nominacionDatoTecnicoCoordinador_Id: 0,
                coordinadorPuerto: ['', Validators.required],
                cantidad: [0, Validators.required],
                nominacionDatoTecnico_Id: 0
            })
        }
    }

    public validacionGrabar(datoTecnicoForm: FormGroup): boolean {
        let bValidacion: boolean = true;
        const tituloMensaje = 'Registro Nominación - Dato Tecnico';
        if (datoTecnicoForm.invalid == true){
            this.confirmationDialogService.confirm(tituloMensaje, 'Revise que este completado los campos marcados en rojo, asi como la información en Destino, Cliente y Cargador.', 'Cerrar', '', null, null, Tipoalerta.Warning);
            bValidacion = false;
            return bValidacion;
        }

        const datoTecnicoCoordinadorForm = datoTecnicoForm.controls['nominacionDatoTecnicoCoordinadorPuerto'];
        const datoTecnicoDestinoForm = datoTecnicoForm.controls['nominacionDatoTecnicoDestino'];
        const datoTecnicoExportadorForm = datoTecnicoForm.controls['nominacionDatoTecnicoExportador'];
        
        const datoTecnicoCoordinador = datoTecnicoCoordinadorForm != null || datoTecnicoCoordinadorForm != undefined ? datoTecnicoCoordinadorForm['controls']: null;
        const datoTecnicoDestino = datoTecnicoDestinoForm !=null || datoTecnicoDestinoForm !=undefined ? datoTecnicoDestinoForm['controls'] : null;
        const datoTecnicoExportador = datoTecnicoExportadorForm !=null || datoTecnicoExportadorForm != undefined ? datoTecnicoExportadorForm['controls'] : null;
        
        if (datoTecnicoCoordinador == null || datoTecnicoDestino == null || datoTecnicoExportador == null){
            this.confirmationDialogService.confirm(tituloMensaje, 'Debe agregar destino, cargador y cliente para la nominación', 'Cerrar', '', null, null, Tipoalerta.Warning);
            bValidacion = false;
            return bValidacion;
        }

        if (datoTecnicoCoordinadorForm.status !='VALID' || datoTecnicoCoordinadorForm.status !='VALID' || datoTecnicoCoordinadorForm.status !='VALID'){
            this.confirmationDialogService.confirm(tituloMensaje, 'Debe completar todos los datos en destino, cargador y cliente', 'Cerrar', '', null, null, Tipoalerta.Warning);
            bValidacion = false;
            return bValidacion;
        }

            let erroresDestinos: boolean = false;
            let erroresCoordinador: boolean = false;
            let erroresExportador: boolean = false;
            
            if (datoTecnicoExportador.length == 0 || datoTecnicoDestino.length == 0 || datoTecnicoExportador.length == 0) {
                this.confirmationDialogService.confirm(tituloMensaje, 'Debe agregar destino, cargador y cliente a la nominación', 'Cerrar', '', null, null, Tipoalerta.Warning);
                bValidacion = false;
                return bValidacion;
            }
            datoTecnicoDestino.forEach(detalle => {
                const datos = detalle['controls'];
                if (datos.destino.value == '' || datos.cantidad.value == '' || datos.cantidad.value == '0') {
                    erroresDestinos = true;
                    return;
                }
            });
            datoTecnicoCoordinador.forEach(detalle => {
                const datos = detalle['controls'];
                if (datos.coordinadorPuerto.value == '' || (datos.cantidad.value == '' || datos.cantidad.value == '0')) {
                    erroresCoordinador = true;
                    return;
                }
            });
            datoTecnicoExportador.forEach(detalle => {
                const datos = detalle['controls'];
                if (datos.exportador.value == '' ||
                    (datos.cantidad.value == '' || datos.cantidad.value == '0') ||
                    (datos.tolerancia.value == '' || datos.tolerancia.value == '0')) {
                    erroresExportador = true;
                    return;
                }
            });

            if (erroresDestinos || erroresCoordinador || erroresExportador) {
                this.confirmationDialogService.confirm(tituloMensaje, 'Falta completar información en destino, cargador o cliente.', 'Cerrar', '', null, null, Tipoalerta.Warning);
                bValidacion = false;
                return bValidacion;
            } else {
                if (!bValidacion) {
                    this.confirmationDialogService.confirm(tituloMensaje, 'Falta completar información para el registro de nominación.', 'Cerrar', '', null, null, Tipoalerta.Warning);
                    return bValidacion;
                }
            }
       
        return bValidacion;
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