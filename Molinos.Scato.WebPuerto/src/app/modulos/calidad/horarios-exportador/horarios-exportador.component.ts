import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HorariosExportador } from '@ScatoModels/calidad/horarios-exportador';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

@Component({
  selector: 'app-horarios-exportador',
  templateUrl: './horarios-exportador.component.html',
  styleUrls: ['./horarios-exportador.component.css']
})
export class HorariosExportadorComponent implements OnInit {

  @ViewChild('modalHorarioExportador') modalHorarioExportador: TemplateRef<any>;
  
  private moduloDeCargaId: number;
  public horarios: HorariosExportador[];
  public id: number = 0;
  constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private procesoService: DatosEmbarquesProcesoService,
  ) { 
    this.moduloDeCargaId = this.procesoService.getModuloDeCargaId();
    this.listarHorariosExportador(); 
  }


  ngOnInit(): void {
  }

  private listarHorariosExportador() {
    this.moduloDeCargaService.listarHorariosExportador(this.moduloDeCargaId).subscribe(data => {
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
    this.listarHorariosExportador();
  }

  private obtenerTiempoDeDif(d1: any, d2: any): string {
    const fecha1 = d1 instanceof Date ? d1 : new Date(d1);
    const fecha2 = d2 instanceof Date ? d2 : new Date(d2);
  
    if (isNaN(fecha1.getTime()) || isNaN(fecha2.getTime())) {
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
}
