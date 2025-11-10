import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HorariosExportador } from '@ScatoModels/calidad/horarios-exportador';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { SignalRService } from '@ScatoServicios/signal-r.service';

@Component({
  selector: 'app-horarios-exportador',
  templateUrl: './horarios-exportador.component.html',
  styleUrls: ['./horarios-exportador.component.css']
})
export class HorariosExportadorComponent implements OnInit {

  @ViewChild('modalHorarioExportador') modalHorarioExportador: TemplateRef<any>;
  @Input() public esSoloLectura: boolean = false;

  private moduloDeCarga: ModuloDeCarga;
  public esLiq: boolean = false;
  public horarios: HorariosExportador[];
  public id: number = 0;
  constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private signalr: SignalRService,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private procesoService: DatosEmbarquesProcesoService,
  ) {
    this.moduloDeCarga = this.procesoService.getModuloDeCarga();
    this.listarHorariosExportador();
  }


  ngOnInit(): void {
  }

  private listarHorariosExportador() {
    this.moduloDeCargaService.listarHorariosExportador(this.moduloDeCarga.id).subscribe(data => {
      this.esLiq = data[0]?.materialPuerto?.esLiquido;
      this.horarios =  data.map(horario => {
        horario.tiempo = this.obtenerTiempoDeDif(horario.inicio, horario.fin);
        return horario;
      });
    }, err => {
      this.confirmationDialogService.error('Ocurrió un error al intentar cargar los horarios.');
      console.error(err);
    });
  }

  public onEditarHorario(id: number) {
    this.id = id;
    this.modalService.open(this.modalHorarioExportador, { size: 'm', centered: true, backdrop: 'static', keyboard: false });
  }

  public refrescarListado(){
    this.signalr.enviarNotificacion('horariosExportador', this.moduloDeCarga.id);
    this.listarHorariosExportador();
  }

  private obtenerTiempoDeDif(d1: any, d2: any): string {
    const fecha1 = d1 instanceof Date ? d1 : new Date(d1);
    const fecha2 = d2 instanceof Date ? d2 : new Date(d2);

    if (isNaN(fecha1.getTime()) || isNaN(fecha2.getTime()) || d1 == null || d2 == null) {
      return '00:00';
    }

    const diferenciaMs = Math.abs(fecha1.getTime() - fecha2.getTime());

    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  public getHorariosExportador() {
    return this.horarios;
  }

  public tieneHorariosIncompletos() : boolean{
    return this.horarios.some(x=> x.fin == null);
  }
}
