import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import * as html2pdf from 'html2pdf.js';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
import { Mail } from '@ScatoModels/mail';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-liquidos',
  templateUrl: './liquidos.component.html',
  styleUrls: ['./liquidos.component.css']
})
export class LiquidosComponent implements OnInit {

  @Output() hideSpinner = new EventEmitter<boolean>();
  RecibidoresPdf: boolean = false;
  periodoDeCarga: PeriodoDeCarga;
  fechaAmarro: Date=new Date();
  horaAmarro: string='';
  fechaDesamarro: Date=new Date();
  horaDesamarro: string='';
  public amarreForm: FormGroup;
  errorMessage: boolean;
  embarqueSelected: any;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  listadoEmbarques: InstanciaWorkflowPuerto[] = null;

  constructor(private _CalidadSharedService: CalidadSharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService,
  private _procesoService: DatosEmbarquesProcesoService,
  private _builder: FormBuilder,
  private moduloCargaService: ModuloDeCargaService,
  private modalService: NgbModal,
  private session: SessionService,
  private workflowService: WorkflowService,
  private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService
  ) {
    this.user = this.session.getUser();
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
    this.cargarModuloCarga();
  }

  ngOnInit(): void {
    this.hideSpinner.emit(false);
    this.newFormAmarre();
  }

  finalizaCalidad():void{
    this._CalidadSharedService.emitFinalizaEnCalidad(true);
  }

  imprimir(imprimir: boolean = false){
      this._CalidadSharedService.ocultarBotonesImprimir();

    this.RecibidoresPdf = true;


    let opt = {
      margin:       [0.05, 0],
      filename:     'Pantalla Recibidores',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 3, letterRendering: true},                         //IMPRIMO PANTALLA DE SOLIDOS USANDO LIBRERIA HTML2PDF, SETEANDO
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak: { after: '.page-break' }
    };

    let ele = Array.from(document.getElementsByClassName('break'));

    let html = html2pdf()
    .set(opt)
    .from(ele[0]);

    if (ele.length > 1) {
      html = html.toPdf();
      ele.slice(1).forEach((ele, index) => {
        html = html
          .get('pdf')
          .then(pdf => {
           pdf.addPage()
           })
          .from(ele)
          .toContainer()
          .toCanvas()
          .toPdf()
      })
    }
    html = html.then(() => {
      if (!imprimir) this.RecibidoresPdf = false;
      this._CalidadSharedService.retirarEstilosImprimirLiquido();
   }).save();
  }

 /* SECCION GUARDAR FECHA DESAMARRE Y ZARPAR */
 newFormAmarre(){
  this.amarreForm = this._builder.group({
    fechaAmarro : ['',  [Validators.required]],
      horaAmarro : ['',  [Validators.required]],
      fechaDesamarro :  ['',  [Validators.required]],
      horaDesamarro : ['',  [Validators.required]],
  })
}

  public async enviarMailFinalizacion() {
    const mail = await this.moduloCargaService.obtenerDatosMailPlanillaLiquidos(this.embarqueSelected.moduloDeCargaId, true, true).pipe(take(1)).toPromise();
    const confirm = await this.envioDialogService.confirm("Enviar Email Fin", 'Cuerpo del Mail:', mail.titulo, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
    if (!confirm) {
      return;
    }
    try {
      await this.moduloCargaService.enviarMailPlanillaTurnos(mail).pipe(take(1)).toPromise();
      this.confirmationDialogService.exito('El email fue enviado con éxito', 'Email enviado')
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ocurrió un error al enviar el email');
    }
  }

public openModalCargarAmarre(modal: any) {
  this.cargarHorasDesamarro(this.amarreForm);
      this.errorMessage = false;
      this.modalService.open(modal, { size: 'm', centered: true, backdrop: 'static', keyboard: false });

}

async guardarAmarre()
{
  if(
      (this.amarreForm.value.fechaAmarro == '' || this.amarreForm.value.fechaAmarro == null || this.amarreForm.value.fechaAmarro == undefined) ||
      (this.amarreForm.value.fechaDesamarro == '' || this.amarreForm.value.fechaDesamarro == null || this.amarreForm.value.fechaDesamarro == undefined)
    ){
    this.confirmationDialogService.confirm('¡Atención!', 'No se ha ingresado la fecha amarró o fecha desamarró.', 'Aceptar', '', null, null, Tipoalerta.Warning)
    return false;
  }

  if(this.amarreForm.value.fechaAmarro > this.amarreForm.value.fechaDesamarro || (this.amarreForm.value.fechaAmarro == this.amarreForm.value.fechaDesamarro &&
    this.amarreForm.value.horaAmarro > this.amarreForm.value.horaDesamarro ) ){
    this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de Amarro es posterior a la de Desamarro.', 'Aceptar', '', null, null, Tipoalerta.Warning)
  }else{
    await this.cargarLineUp();
    await this.guardarHistoricoEmbarqueLineUp(this.embarqueSelected.id);

    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((res: any) => {
      let  periodoCargarActualizar =  res['moduloDeCargaPeriodoDeCarga'][0];
      periodoCargarActualizar.horaAmarro=this.amarreForm.value.horaAmarro;
      periodoCargarActualizar.fechaAmarro=this.amarreForm.value.fechaAmarro;
      periodoCargarActualizar.horaDesamarro=this.amarreForm.value.horaDesamarro;
      periodoCargarActualizar.fechaDesamarro=this.amarreForm.value.fechaDesamarro;

      this.moduloCargaService.guardarPeriodoDeCarga(periodoCargarActualizar, this.embarqueSelected.moduloDeCargaId).subscribe((res: any) => {
        this.modalService.dismissAll();
        this.finalizaCalidad();
      });
    });
  }
}
  cargarLineUp = async () => {
    const listadoEmbarques = await this.workflowService.obtenerListado().toPromise();
    this.listadoEmbarques = listadoEmbarques;
  }

  guardarHistoricoEmbarqueLineUp = async (embarqueId: number) =>{
    // console.log(' guardarHistoricoEmbarqueLineUp()');
    try {
      // this.listadoEmbarquesFiltrado.forEach((embarquePuerto) => {
      this.listadoEmbarques.forEach((embarquePuerto) => {
        // console.log(embarquePuerto);

        let lineUpDto = JSON.parse(JSON.stringify(embarquePuerto.lineUp));

        let historicoEmbarqueLineUp: HistoricoEmbarqueLineUp = {
          vaporNombre: embarquePuerto.embarque.nombreBuque,
          actualizado: embarquePuerto.fechaUltimaModificacion?.toString(),
          ubicacion: embarquePuerto.embarque.ubicacion?.toString(),
          cartaSubidaEnviada: embarquePuerto.lineUp.cartaDeSubidaEnviada,
          cartaSubidaAprobada: embarquePuerto.lineUp.cartaDeSubidaAprobada,
          cargaEnSap: embarquePuerto.lineUp.cargaEnSap,
          nominacionDePractico: embarquePuerto.lineUp.nominacionDePractico,
          seguridadPortuaria: embarquePuerto.lineUp.seguridadPortuaria,
          inspeccionSenasa: embarquePuerto.lineUp.inspeccionSenasa,
          controlSenasa: embarquePuerto.lineUp.controlSenasa,
          controlPrivado: embarquePuerto.lineUp.controlPrivado,
          amarrador: embarquePuerto.lineUp.amarrador,
          agenciaContactada: embarquePuerto.lineUp.agenciaContactada,
          fechaRecalada: embarquePuerto.embarque.fechaRecalada?.toString(),
          puertoActual: '',
          observaciones: embarquePuerto.embarque.observaciones,
          materiales: '',
          planoDeCargaEnviado: embarquePuerto.lineUp.planoDeCargaEnviado,
          obligacionCarga: embarquePuerto.embarque.obligacionCarga?.toString(),
          agenteNombre: this.extraeNombre(embarquePuerto.embarque.agencias),
          ataNombre: this.extraeNombre(embarquePuerto.embarque.ata),
          otroMuelleNombre: embarquePuerto.embarque.otroMuelleNombre,
          lineUpId: lineUpDto.id,
          embarqueId: embarqueId
        };

        let materiales = '';
        embarquePuerto.lineUp.planoDeCarga.planoDeCargaBodegas.forEach((planoDeCargaBodega) => {
          if (planoDeCargaBodega.materialPuerto) {
            if (planoDeCargaBodega.materialPuerto.descripcionCorta && planoDeCargaBodega.materialPuerto.descripcionCorta != '') {
              materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
            }
          }
          // historicoEmbarqueLineUp.materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
        });

        historicoEmbarqueLineUp.materiales = materiales;
        // console.log(historicoEmbarqueLineUp);
        this.historicoEmbarqueLineUpService.crearHistoricoEmbarqueLineUp(historicoEmbarqueLineUp).subscribe(x => {
          console.log(' HistoricoEmbarqueLineUp Guardado, buque: ', historicoEmbarqueLineUp.vaporNombre);
        });
      });
    } catch (err) {
      console.error('Ocurrio un error inesperado: ', err.message);
    }
  }

  extraeNombre(objeto): string {
    return objeto != null ? objeto?.nombre?.toString(): '';
  }

hasPermisoRecibidores_Imprimir() {
  return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Imprimir);
}
hasPermisoRecibidores_Finalizar() {
  return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Finalizar);
}

cargarHorasDesamarro(amarre)
{
  var newDate = new Date();
  var horaActual = newDate.getHours() + ":"+newDate.getMinutes();

  amarre.fechaAmarro =   this.fechaAmarro? formatDate(this.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
  amarre.horaAmarro = this.horaAmarro=='' ? horaActual : this.horaAmarro ;
  amarre.fechaDesamarro = this.fechaDesamarro? formatDate(this.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
  amarre.horaDesamarro = this.horaDesamarro=='' ?  horaActual : this.horaDesamarro ;

  this.amarreForm.patchValue(amarre);
}
cargarModuloCarga() {
  this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe(res => {

      if(res.moduloDeCargaPeriodoDeCarga.length > 0){
        this.periodoDeCarga=res.moduloDeCargaPeriodoDeCarga[0];
        this.fechaAmarro = res.moduloDeCargaPeriodoDeCarga[0].fechaAmarro;
        this.horaAmarro = res.moduloDeCargaPeriodoDeCarga[0].horaAmarro;
        this.fechaDesamarro = res.moduloDeCargaPeriodoDeCarga[0].fechaDesamarro;
        this.horaDesamarro = res.moduloDeCargaPeriodoDeCarga[0].horaDesamarro;
      }

    });
}

}
