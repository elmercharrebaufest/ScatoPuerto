import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-periodo-carga',
  templateUrl: './periodo-carga.component.html',
  styleUrls: ['./periodo-carga.component.css']
})
export class PeriodoCargaComponent implements OnInit {
  guardando: boolean;
  periodoCargaForm: FormGroup;
  @Input() esSoloLectura: boolean = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  
  constructor(
    private formBuilder: FormBuilder,
    private _moduloDeCargaService: ModuloDeCargaService,
    private _confirmationDialogService: ConfirmationDialogService,
    private session: SessionService,
  ) { 
  this.user = this.session.getUser();
  }

@Input() ModuloDeCarga_Id: number;

  ngOnInit(): void {
    this.initFormulario();

    if(!this.hasPermisoLiquido_EditarPeriodoDeCarga()) this.periodoCargaForm.disable();
  }

  initFormulario(){
    
    this.periodoCargaForm = this.formBuilder.group({
      id: [{ value: '', disabled: this.esSoloLectura }],
      fechaAmarro : [{ value: '', disabled: this.esSoloLectura }],
      horaAmarro : [{ value: '', disabled: this.esSoloLectura }],
      vientoAmarro : [{ value: '', disabled: this.esSoloLectura }],
      direccionAmarro : [{ value: '', disabled: this.esSoloLectura }],
      fechaDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      horaDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      vientoDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      direccionDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      fechaHabilitacion : [{ value: '', disabled: this.esSoloLectura }],
      horaHabilitacion : [{ value: '', disabled: this.esSoloLectura }],
      fechaConexionMangueras : [{ value: '', disabled: this.esSoloLectura }],
      fechaDesconexionMangueras : [{ value: '', disabled: this.esSoloLectura }],
      fechaComienzoCarga : [{ value: '', disabled: this.esSoloLectura }],
      fechaFinalizacionCarga : [{ value: '', disabled: this.esSoloLectura }],
      horaConexionMangueras : [{ value: '', disabled: this.esSoloLectura }],
      horaDesconexionMangueras : [{ value: '', disabled: this.esSoloLectura }],
      horaComienzoCarga : [{ value: '', disabled: this.esSoloLectura }],
      horaFinalizacionCarga :[{ value: '', disabled: this.esSoloLectura }],
    });
  }
  // this.fechaCarta = formatDate(this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada, 'yyyy-MM-dd', 'es-ar');
  // this.horaCarta = formatDate(this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada, 'HH:mm', 'es-ar');
  // initFechaHora(){
  //   return this.formBuilder.group({
  //     id: '',
  //     fecha: '',
  //     hora: '',
  //   });
  // }

  // initAmarre(){
  //   return this.formBuilder.group({
  //     id: '',
  //     fecha: '',
  //     hora: '',
  //     viento: '',
  //     direccion: ''
  //   });

  guardar(){
    this._confirmationDialogService.confirm("Atención!", "¿Seguro que desea guardar el período de carga?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
      .then( (confirmed) => {
        if(confirmed){
          this.guardando = true;
          if (this.ModuloDeCarga_Id > 0)
          this._moduloDeCargaService.guardarPeriodoDeCarga(this.obtenerDatosPeriodoCarga(), this.ModuloDeCarga_Id ).subscribe((res: any) => {
            this.guardando = false;
          });
        }
      });
    
  }

  updatePeriodoCarga(periodoCarga = null){
    // console.log('periodoCarga: ', periodoCarga);
    let pc = periodoCarga;
    pc.fechaAmarro = pc?.fechaAmarro ? formatDate(pc.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : "";
    pc.fechaDesamarro = pc?.fechaDesamarro ? formatDate(pc.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : "";
    pc.fechaComienzoCarga = pc?.fechaComienzoCarga ? formatDate(pc.fechaComienzoCarga, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaConexionMangueras = pc?.fechaConexionMangueras ? formatDate(pc.fechaConexionMangueras, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaDesconexionMangueras = pc?.fechaDesconexionMangueras ? formatDate(pc.fechaDesconexionMangueras, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaFinalizacionCarga = pc?.fechaFinalizacionCarga ? formatDate(pc.fechaFinalizacionCarga, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaHabilitacion = pc?.fechaHabilitacion ? formatDate(pc.fechaHabilitacion, 'yyyy-MM-dd', 'es-ar') : " ";
    this.periodoCargaForm.patchValue(pc);
  }

  obtenerDatosPeriodoCarga(){
    return this.periodoCargaForm.getRawValue();
  }

  clForm(){
    console.log(this.periodoCargaForm.getRawValue());
  }

  hasPermisoLiquido_EditarPeriodoDeCarga() {
    return this.user.permisos.find(p => p === this.permisosScato.Liquido_EditarPeriodoDeCarga);
  }
}
