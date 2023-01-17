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

  constructor(private _CalidadSharedService: CalidadSharedService,
    private confirmationDialogService: ConfirmationDialogService,
  private _procesoService: DatosEmbarquesProcesoService,
  private _builder: FormBuilder,
  private moduloCargaService: ModuloDeCargaService,
  private modalService: NgbModal,
  private session: SessionService,
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

public openModalCargarAmarre(modal: any) {
  this.cargarHorasDesamarro(this.amarreForm);
      this.errorMessage = false;
      this.modalService.open(modal, { size: 'm', centered: true, backdrop: 'static', keyboard: false });

}

guardarAmarre()
{
  if(
      (this.amarreForm.value.fechaAmarro == '' ||
       this.amarreForm.value.fechaAmarro == null ||
       this.amarreForm.value.fechaAmarro == undefined) ||
      (this.amarreForm.value.fechaDesamarro == '' ||
       this.amarreForm.value.fechaDesamarro == null ||
       this.amarreForm.value.fechaDesamarro == undefined)
    ){
    this.confirmationDialogService.confirm('¡Atención!', 'No se ha ingresado la fecha amarró o fecha desamarró.', 'Aceptar', '', null, null, Tipoalerta.Warning)
    return false;
  }

  if(this.amarreForm.value.fechaAmarro > this.amarreForm.value.fechaDesamarro || (this.amarreForm.value.fechaAmarro == this.amarreForm.value.fechaDesamarro &&
    this.amarreForm.value.horaAmarro > this.amarreForm.value.horaDesamarro ) ){
    this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de Amarro es posterior a la de Desamarro.', 'Aceptar', '', null, null, Tipoalerta.Warning)
  }else{
    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((res: any) => {

      let  periodoCargarActualizar =  res['moduloDeCargaPeriodoDeCarga'][0];
      //let periodoCargarActualizar= this.listadoEmbarques.find(x=>x.embarque.id = this.embarqueId)['lineUp']['moduloDeCarga']['moduloDeCargaPeriodoDeCarga'][0];
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
