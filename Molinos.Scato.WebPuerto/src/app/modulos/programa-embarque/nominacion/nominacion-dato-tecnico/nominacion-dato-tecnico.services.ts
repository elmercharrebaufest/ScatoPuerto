import { Injectable } from '@angular/core';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

@Injectable({
    providedIn: 'root'
})
export class NominacionDatoTecnicoRegistroService {

    constructor(private confirmationDialogService: ConfirmationDialogService,
        private buqueService: BuqueService,
        private nominacionService: NominacionDatoTecnicoService,
        private formBuilder: FormBuilder) {
    }

    public seleccionarInformacionVapor(vaporId: number): Observable<VaporInformacion> {
        return this.buqueService.obtenerVaporInformacion(vaporId);
    }

    private inicializarFormNuevo(): FormGroup{
        return this.formBuilder.group({
            id: [0, Validators.required],
            materialPuerto: ['', Validators.required],
            tipoDeCalidad: [''],
            nominacionDatoTecnicoCalidad: [],
            cantidadTotal: ['', Validators.required],
            tolerancia: [''],
            observaciones: [''],
            vaporInformacion: [[], Validators.required],
            bandera: [''],
            etaRecalada: ['', Validators.required],
            obligacionDeCarga: ['', Validators.required],
            muelleDeCarga: ['', Validators.required],
            tasaDeCarga: [''],
            tasaDeCargaValor: [''],
            dem: [''],
            des: [''],
            tipoDeContrato: [''],
            ataPuerto: [[]],
            agenciaMaritimaPuerto: [[]],
            surveyor: [[]],
            observacionesSurveyor: [''],
            nominacionDatoTecnicoExportador: this.formBuilder.array([]),
            nominacionDatoTecnicoDestino: this.formBuilder.array([]),
            nominacionDatoTecnicoCoordinadorPuerto: this.formBuilder.array([]),
        });
    } 

    public inicializarForm() {
        return this.inicializarFormNuevo();
    }
    public inicializarFormExportador(exportador: NominacionDatoTecnicoExportador = null): FormGroup {
        if (exportador != null) {
            return this.formBuilder.group({
                nominacionDatoTecnicoExportador_Id: exportador.nominacionDatoTecnicoExportador_Id,
                exportador: exportador.exportador,
                cantidad: exportador.cantidad,
                tolerancia: exportador.tolerancia,
                nominacionDatoTecnico_Id: exportador.nominacionDatoTecnico.id
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
    public inicializarFormDestino(destino: NominacionDatoTecnicoDestino = null): FormGroup {
        if (destino != null) {
            return this.formBuilder.group({
                nominacionDatoTecnicoDestino_Id: destino.nominacionDatoTecnicoDestino_Id,
                exportador: destino.destino,
                cantidad: destino.cantidad,
                nominacionDatoTecnico_Id: destino.nominacionDatoTecnico.id
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
    public inicializarFormCoordinadorPuerto(coordinadorPuerto: NominacionDatoTecnicoCoordinador = null): FormGroup {
        if (coordinadorPuerto != null) {
            return this.formBuilder.group({
                nominacionDatoTecnicoCoordinador_Id: coordinadorPuerto.nominacionDatoTecnicoCoordinador_Id,
                coordinadorPuerto: coordinadorPuerto.coordinadorPuerto,
                cantidad: coordinadorPuerto.cantidad,
                nominacionDatoTecnico_Id: coordinadorPuerto.nominacionDatoTecnico.id
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
        if (datoTecnicoForm.invalid) {
            bValidacion = false;
            let erroresDestinos: boolean = false;
            let erroresCoordinador: boolean = false;
            let erroresExportador: boolean = false;
            const datoTecnicoCoordinador = datoTecnicoForm.controls['datoTecnicoCoordinador']['controls'];
            const datoTecnicoDestino = datoTecnicoForm.controls['datoTecnicoDestino']['controls'];
            const datoTecnicoExportador = datoTecnicoForm.controls['datoTecnicoExportador']['controls'];
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
        }
        return bValidacion;
    }
    public grabarNominacion(nominacion: Nominacion){
        this.nominacionService.registroNominacion(nominacion).subscribe(data=> {console.log(data)});
    }

    
    public listarCombosDatoTecnico(): Observable<ProgramaEmbarqueNominacionDatoTecnico>{
        return this.nominacionService.listarCombosDatoTecnico().pipe(map((data: ProgramaEmbarqueNominacionDatoTecnico) => { return data;}));
    }

}