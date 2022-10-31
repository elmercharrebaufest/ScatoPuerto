import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Mano, Nir, NirManualPuerto, TipoNir } from '@ScatoModels/nir';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Mail } from '@ScatoModels/mail';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { ManosDeEmbarque } from '@ScatoModels/mano-embarque';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { NirManoComponent } from './nir-mano/nir-mano.component';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-nir',
  templateUrl: './nir.component.html',
  styleUrls: ['./nir.component.css']
})

export class NIRComponent {
  @ViewChild("mano1")Mano1Component: NirManoComponent;
  @ViewChild("mano2")Mano2Component: NirManoComponent;
  confirmationDialogService: any;
  
  //data
  nir: Nir;
  manosDeEmbarque: ManosDeEmbarque;
  moduloDeCarga_Id: number;

  //Flags
  Mano1Visible: boolean = false;
  Mano2Visible: boolean = false;
  TrigoMano1: boolean = false;
  TrigoMano2: boolean = false;
  MaizMano1: boolean = false;
  MaizMano2: boolean = false;
  isLoaded: boolean = false;
  guardando: boolean = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(
    private fb: FormBuilder,
    private moduloDeCargaService: ModuloDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService,
    confirmationDialogService: ConfirmationDialogService,
    private procesoCalidadService: ProcesoCalidadService,
    private datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
    private _CalidadSharedService: CalidadSharedService,
    private session: SessionService,
  ) {
    this.nir = new Nir();
    this.user = this.session.getUser();
    this.confirmationDialogService = confirmationDialogService;
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();

    this._CalidadSharedService.Manos.subscribe((res: any) => {
      this.manosDeEmbarque = res;
      this.TrigoMano1 = Object.values(this.manosDeEmbarque[0].moduloDeCargaManosDeEmbarqueDetalle.filter(x => x.materialPuerto?.descripcionCorta == "WHEAT")).length > 0
      this.TrigoMano2 = Object.values(this.manosDeEmbarque[1].moduloDeCargaManosDeEmbarqueDetalle.filter(x => x.materialPuerto?.descripcionCorta == "WHEAT")).length > 0
      this.MaizMano1 = Object.values(this.manosDeEmbarque[0].moduloDeCargaManosDeEmbarqueDetalle.filter(x => x.materialPuerto?.descripcionCorta == "CORN")).length > 0
      this.MaizMano2 = Object.values(this.manosDeEmbarque[1].moduloDeCargaManosDeEmbarqueDetalle.filter(x => x.materialPuerto?.descripcionCorta == "CORN")).length > 0

      this.nir.tipoNir = this.getTipoNir(this.TrigoMano1, this.TrigoMano2, this.MaizMano1, this.MaizMano2);
      this.Mano1Visible = this.nir.tipoNir > 0 && this.nir.tipoNir <= 6;
      this.Mano2Visible = this.nir.tipoNir > 0 && this.nir.tipoNir <= 4 || this.nir.tipoNir == 7 || this.nir.tipoNir == 8;      

      this.setTipoManos();
      this.moduloDeCargaService.obtenerNir(this.moduloDeCarga_Id).subscribe((res: NirManualPuerto[]) => {
        if(this.Mano1Visible){
          let materialId_mano1: number;
          //11: Maíz - 17: Trigo. Si si harcodeo, al lado de lo que vi soy Gardel. 
          //Para no harcodear hay que refactorizar y no había tiempo (Martín)
          materialId_mano1 = this.nir.mano1.tipo == 'Trigo' ? 17 : 11;
          this.nir.mano1.nirManualPuerto = [];
          this.nir.mano1.nirManualPuerto = res.filter(x => x.mano == 'mano1' && x.material_id == materialId_mano1);
          this._CalidadSharedService.mano1 = this.nir.mano1;
        }

        if(this.Mano2Visible){
          let materialId_mano2: number;
          //11: Maíz - 17: Trigo. Si si harcodeo, al lado de lo que vi soy Gardel. 
          //Para no harcodear hay que refactorizar y no había tiempo (Martín)
          materialId_mano2 = this.nir.mano2.tipo == 'Maíz' ? 11 : 17;
          this.nir.mano2.nirManualPuerto = [];
          this.nir.mano2.nirManualPuerto = res.filter(x => x.mano == 'mano2' && x.material_id == materialId_mano2);
          this._CalidadSharedService.mano2 = this.nir.mano2;
        }
        this.isLoaded = true;
      })
    });
    
  }


  initMano(mano: Mano = null){
    if(mano != null){
      return this.fb.group({
        tipo: mano?.tipo ? mano.tipo : '',
        nirManualPuerto: this.fb.array(mano.nirManualPuerto)
      });    
    }else 
      return null;
      
  }

  obtenerNirCompleto(): NirManualPuerto[]{
    let nir: NirManualPuerto[] = [];

    if(this.Mano1Visible){
       this.Mano1Component.getNir().forEach(x => {
        nir.push(x)
       });
    }

    if(this.Mano2Visible){
      this.Mano2Component.getNir().forEach(x => {
       nir.push(x)
      });
    }
    return nir;
  }
  
  enviarNir(guardarYEnviar : boolean = false) {
    let nir: NirManualPuerto[] = this.obtenerNirCompleto();
    // this.calcularPromedios(nir);
    if(guardarYEnviar == true) {
      this.enviarMail(nir);      
    }else{
      let ObjetoMailNir = {
        nirManualPuerto : nir,
        mail: '',
      }
      this.guardando = true;
      this.moduloDeCargaService.guardarModuloDeCargaNirManualPuerto( ObjetoMailNir, this.moduloDeCarga_Id ).subscribe(res => {
        this.guardando = false;
        this.confirmationDialogService.confirm('¡Atención!', 'NIR guardado correctamente.', 'Aceptar', '', null, null, Tipoalerta.Success).then((confirmed) => {
          if (confirmed) {
          }
        }).catch()
      });   
    }
  }

  compareOrigen(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareBodega(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareCeldaOrigen(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  enviarMail(nir) {
    var titulo = "Enviar NIR";
    var text = "Cuerpo del Mail:"
    var textoCuerpoMail = 'Cuerpo del mail';
    var inputTitle = "Destinatarios";
    var mailNir = new Mail(`NIR.`,`${textoCuerpoMail}`);

    this.procesoCalidadService.obtenerDestinatariosNirManual('NirManual')
    .subscribe(data => {mailNir.destinatarios = data

      var button1 = 'Enviar';
      var button2 = 'Cancelar';
      let ObjetoMailNir = {
        nirManualPuerto : nir,
        mail: mailNir
      }
      this.confirmationDialogService.confirm(titulo, text, button1, button2, 'lg', mailNir, null, inputTitle, true)
        .then((confirmed) => {
          if (confirmed) {
              console.log(ObjetoMailNir);              
              let nombreBuque = this.datosEmbarqueProcesoService.getEmbarqueSelected().nombreBuque
              this.guardando = true;
              this.moduloDeCargaService.guardarModuloDeCargaNirManualPuerto( ObjetoMailNir, this.moduloDeCarga_Id, nombreBuque ).subscribe(res => {
                this.confirmationDialogService.confirm('¡Atención!', 'Mail enviado correctamente.', 'Aceptar', '', null, null, Tipoalerta.Success)
                console.log('200 OK');
                this.guardando = false;
              }), (error => {
                console.log(error);
              })
          }
        })
    })
  }

  promedioTotalHD(): number{
    if(this.isLoaded){
      let promedio = 0;
      let divisor = 0;

      this.Mano1Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.hd))){
          promedio += parseFloat(x.hd);
          divisor += 1;          
        }
      });
      
      this.Mano2Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.hd))){
          promedio += parseFloat(x.hd);
          divisor += 1;          
        }
      });
      return promedio / divisor;
    }
    return 0;
  }
  
  promedioTotalPH(): number{
    if(this.isLoaded){
      let promedio = 0;
      let divisor = 0;

      this.Mano1Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.ph))){
          promedio += parseFloat(x.ph);
          divisor += 1;          
        }
      });
      
      this.Mano2Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.ph))){
          promedio += parseFloat(x.ph);
          divisor += 1;          
        }
      });
      return promedio / divisor;
    }
    return 0;
  }
  
  promedioTotalProtBS(): number{
    if(this.isLoaded){
      let promedio = 0;
      let divisor = 0;

      this.Mano1Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.prot_BS))){
          promedio += parseFloat(x.prot_BS);
          divisor += 1;          
        }
      });
      
      this.Mano2Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.prot_BS))){
          promedio += parseFloat(x.prot_BS);
          divisor += 1;          
        }
      });
      return promedio / divisor;
    }
    return 0;
  }

  promedioTotalProtBase(): number{
    if(this.isLoaded){
      let promedio = 0;
      let divisor = 0;

      this.Mano1Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.protBase))){
          promedio += parseFloat(x.protBase);
          divisor += 1;          
        }
      });
      
      this.Mano2Component?.formMano["controls"]["nirManualPuerto"].value.forEach(x => {
        if(!isNaN(parseFloat(x.protBase))){
          promedio += parseFloat(x.protBase);
          divisor += 1;          
        }
      });
      return promedio / divisor;
    }
    return 0;
  }

  getTipoNir(TrigoMano1: boolean, TrigoMano2: boolean, MaizMano1: boolean, MaizMano2: boolean): TipoNir{
    //Si no tengo nada en conformación de lineas de embarque "El buque no posee trigo ni maíz."
    if(!TrigoMano1 && !TrigoMano2 && !MaizMano1 && !MaizMano2){
      return TipoNir.NoNir;
    }else{
      if(TrigoMano1){
        if(TrigoMano2){
          return TipoNir.SoloTrigo;
        } else if(MaizMano2) {
          return TipoNir.CombinacionTrigoMaiz;
        } else {
          return TipoNir.SoloTrigoMano1;
        }
      }

      if(TrigoMano2){
        if(MaizMano1){
          return TipoNir.CombinacionMaizTrigo;
        }
        return TipoNir.SoloTrigoMano2;
      }

      if(MaizMano1){
        if(MaizMano2){
          return TipoNir.SoloMaiz;
        } else if(TrigoMano2) {
          return TipoNir.CombinacionMaizTrigo;
        } else {
          return TipoNir.SoloMaizMano1;
        }
      }

      if(MaizMano2){
        if(TrigoMano1){
          return TipoNir.CombinacionTrigoMaiz;
        }
        return TipoNir.SoloMaizMano2;
      }
    }
  }

  setTipoManos(){
    this.nir.mano1 = new Mano();
    this.nir.mano1.tipo = this.Mano1Visible ? this.TrigoMano1 ? 'Trigo' : 'Maíz' : ''
    this.nir.mano2 = new Mano();
    this.nir.mano2.tipo = this.Mano2Visible ? this.TrigoMano2 ? 'Trigo' : 'Maíz' : ''
  }

  // hasPermisoRecibidores_Nir_AgregarNuevaFila() {
  //   return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_AgregarNuevaFila);
  // }
  // hasPermisoRecibidores_Nir_EliminarFila() {
  //   return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_EliminarFila);
  // }
  hasPermisoRecibidores_Nir_EnviarNir() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_EnviarNir);
  }
  hasPermisoRecibidores_Nir_GuardarNir() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_GuardarNir);
  }
}
