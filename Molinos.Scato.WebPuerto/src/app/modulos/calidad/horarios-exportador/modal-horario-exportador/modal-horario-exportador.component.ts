import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HorariosExportador } from '@ScatoModels/calidad/horarios-exportador';
import { PlanillaDeTurnos } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { PlanoDeCargaBodegaDestino } from '@ScatoModels/plano-de-carga-bodega-destino';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

export interface EdicionHorarioExportador {
  id: number,
  fechaInicio: string,
  horaInicio: string,
  fechaFin: string,
  horaFin: string
}

@Component({
  selector: 'app-modal-horario-exportador',
  templateUrl: './modal-horario-exportador.component.html',
  styleUrls: ['./modal-horario-exportador.component.css']
})

export class ModalHorarioExportadorComponent implements OnInit {

  @Input() id: number;
  @Output() refrescarListado = new EventEmitter();

  public formHorario: FormGroup;
  public horario: HorariosExportador;
  public horaInicioMinimo: string = '00:00';
  public horaInicioMaximo: string = '23:59';
  public horaFinMinimo: string = '00:00';
  public horaFinMaximo: string = '23:59';
  public turnos: PlanillaDeTurnos[];
  public esLiq: boolean = false;
  constructor(private fb: FormBuilder,
    private moduloDeCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
  ) { 
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.obtenerHorario();
  }

  private obtenerHorario() : void{
    try {
      this.moduloDeCargaService.obtenerHorarioExportador(this.id).subscribe((horario : HorariosExportador) => {
        this.rellenarForm(horario);
        this.horario = horario;
      }, (error: any) => {
        console.error(error);
        this.mostrarError("Hubo un error al intentar obtener la informacion del horario del exportador.");
      });
    } catch (error) {
      console.error(error);
      this.mostrarError("Hubo un error al intentar obtener la informacion del horario del exportador.");
    }
  }

  private inicializarForm(): void{
    this.formHorario = this.fb.group({
      id: [0, [Validators.required]],
      fechaInicio: ['', [Validators.required]], 
      horaInicio: ['', [Validators.required]], 
      fechaFin: ['', [Validators.required]], 
      horaFin: ['', [Validators.required]],
      nombreExportador: '',
      descMaterialPuerto: '',
      cantidad: 0,
      bodegaParcel: '',
      destino: ''
    });
  }
  private rellenarForm(horario: HorariosExportador): void {
    const fechaInicioString = horario.inicio? this.convertirFechaACadena(horario.inicio) : null; 
    const fechaFinString = horario.fin? this.convertirFechaACadena(horario.fin) : null; 

    this.formHorario.patchValue({
      id: horario.id ?? 0, 
      fechaInicio: horario.inicio? formatDate(horario.inicio, 'yyyy-MM-dd', 'es-ar') : null,
      horaInicio: fechaInicioString ? fechaInicioString.split(' ')[1] : null, // Solo hh:mm
      fechaFin: horario.fin? formatDate(horario.fin, 'yyyy-MM-dd', 'es-ar'): null,
      horaFin: fechaFinString ? fechaFinString.split(' ')[1] : null, // Solo hh:mm
      nombreExportador: horario.exportador?.nombre ?? '',
      descMaterialPuerto: horario.materialPuerto?.descripcion ?? '',
      cantidad: horario.cantidad ?? 0,
      bodegaParcel: horario.bodegaParcel?? "",
      destino: horario.destino?.nombre ?? ''
    });
    this.esLiq = horario.materialPuerto.esLiquido;
  }  

  private convertirFechaACadena(fecha: Date): string{
     return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ''); 
  }

  private mostrarError(msj: string) : void {
    this.confirmationDialogService.error(msj);
  }

  public onGuardar(){
    this.formHorario.markAllAsTouched();

    const obj: EdicionHorarioExportador = {
      id: this.formHorario.value.id,
      fechaInicio: this.formHorario.value.fechaInicio,  
      horaInicio: this.formHorario.value.horaInicio,
      fechaFin: this.formHorario.value.fechaFin,
      horaFin: this.formHorario.value.horaFin
    };

    if(this.sonCamposInvalidos()){
      this.mostrarError("Atención, debe completar todos los campos marcados en rojo.");
      return;
    }
    
    if(this.esRangoInvalido(obj)){
      this.mostrarError("La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    try {
      this.moduloDeCargaService.editarHorarioExportador(obj).subscribe(() => {
        this.refrescarListado.emit(true);
        this.modalService.dismissAll();
      }, (error: any) => {
        let msj: string;
        if (typeof error.error == 'string') {
        msj = error.error;
        } else {
        msj = error.error?.message || error.error?.error || 'Hubo un error al intentar editar el horario del exportador.';
        }
        console.error(error);
        this.mostrarError(msj);
      });
    } catch (error) {
      console.error(error);
      this.mostrarError("Hubo un error al intentar editar el horario del exportador.");
    }
  }

  public onCancelar() : void {
    this.modalService.dismissAll();
    this.formHorario.reset();
  }

  private esRangoInvalido(obj: EdicionHorarioExportador): boolean {
    const inicio = this.convertirCadenaADateTime(obj.fechaInicio, obj.horaInicio);
    const fin = this.convertirCadenaADateTime(obj.fechaFin, obj.horaFin);
    return inicio > fin;
  }

  private sonCamposInvalidos(): boolean {
    return this.formHorario.invalid;
  }

  private convertirCadenaADateTime(fecha: string, hora: string): Date{
    const fechaHoraString = `${fecha}T${hora}:00`;
    return new Date(fechaHoraString);
  }

}
