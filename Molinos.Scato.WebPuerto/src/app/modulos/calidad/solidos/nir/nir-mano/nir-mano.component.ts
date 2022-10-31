import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Bodega } from '@ScatoModels/balanzadas/balanza';
import { Mano, NirManualPuerto } from '@ScatoModels/nir';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-nir-mano',
  templateUrl: './nir-mano.component.html',
  styleUrls: ['./nir-mano.component.css'],
  
})
export class NirManoComponent implements OnInit {
  @Input() esSoloLectura: boolean = false;
  @Input() mano : Mano;
  @Input() queMano : number;
  bodegas: Bodega[] = [];
  formMano: FormGroup;
  loaded: boolean = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private calidadSharedService: CalidadSharedService,
    private session: SessionService,
    private fb: FormBuilder) {
      this.user = this.session.getUser();
      this.obtenerNir();
    }

  ngOnInit(): void {
    this.formMano = this.fb.group({
      tipo: '',
      nirManualPuerto: this.fb.array([])
    });
    this.obtenerBodegas();
    this.obtenerNir();

    if(!this.hasPermisoRecibidores_Nir_Modificar()) this.formMano.disable();
  }

  obtenerNir(){
    if(this.queMano != undefined){
      if(this.queMano == 1){
        this.calidadSharedService.mano1.subscribe((res: Mano) => {
          res.nirManualPuerto.forEach(nirsito => {
            this.agregarObjetoNir(nirsito);
          })
        })
      } else if(this.queMano == 2) {
        this.calidadSharedService.mano2.subscribe((res: Mano) => {
          res.nirManualPuerto.forEach(nirsito => {
            this.agregarObjetoNir(nirsito);
          })
        })
      }
      this.loaded = true
    }
  }
  
  initNirManualPuerto(nirManualPuerto: NirManualPuerto): FormGroup{
    let fa: FormGroup;

    if(nirManualPuerto){
      fa = this.fb.group({
        id             : [{value: nirManualPuerto?.id ? nirManualPuerto.id : 0, disabled: this.esSoloLectura}],
        fecha          : [{value: nirManualPuerto?.fecha ? nirManualPuerto.fecha : null, disabled: this.esSoloLectura}],
        hd             : [{value: nirManualPuerto?.hd ?? '', disabled: this.esSoloLectura}],
        ph             : [{value: nirManualPuerto?.ph ?? '', disabled: this.esSoloLectura}],
        protBase       : [{value: nirManualPuerto?.protBase ?? '', disabled: this.mano.tipo == 'Trigo' ? (this.esSoloLectura? true: false) : true}],
        prot_BS        : [{value: nirManualPuerto?.prot_BS ?? '',  disabled: this.mano.tipo == 'Trigo' ? (this.esSoloLectura? true: false): true}],
        origen         : [{value: nirManualPuerto?.origen ?? '', disabled: this.esSoloLectura}],
        bodega         : [{value: nirManualPuerto?.bodega ?? '0', disabled: this.esSoloLectura}],
        mano           : [{value: nirManualPuerto?.mano ?? '', disabled: this.esSoloLectura}],
        material_id    : [{value: nirManualPuerto?.material_id ? nirManualPuerto?.material_id : this.mano.tipo == "Trigo" ? 17:11, disabled: this.esSoloLectura}],
        moduloDeCargaId: [{value: nirManualPuerto?.moduloDeCargaId ?? 0, disabled: this.esSoloLectura}],
      })
    } else { 
      fa = this.fb.group({
        id: null,
        fecha: null,
        hd:  '',
        ph: '',
        protBase: [{value: '', disabled: this.mano.tipo == 'Trigo' ? false : true}],
        prot_BS: [{value: '',  disabled: this.mano.tipo == 'Trigo' ? false : true}],
        origen: '',
        bodega: '0',
        mano:  this.queMano == 1 ? 'mano1' : 'mano2',
        material_id: this.mano.tipo == "Trigo" ? 17:11,
        moduloDeCargaId: null,
      })
    }
    return fa;
  }

  agregarObjetoNir(nir: NirManualPuerto = null){
    (this.formMano["controls"]["nirManualPuerto"] as FormArray).push(this.initNirManualPuerto(nir));
  }

  eliminarObjetoNir(index: number){
    (this.formMano["controls"]["nirManualPuerto"] as FormArray).removeAt(index);
  }

  obtenerMano(): number{
    return this.queMano;
  }

  promedioHD(): number{
    if(this.loaded){        
      let promedio = 0;
      let divisor = 0;

      var arr = (this.formMano["controls"]["nirManualPuerto"] as FormArray).value;

       arr.forEach(x => {
        if(!isNaN(parseFloat(x.hd))){
          promedio += parseFloat(x.hd);
          divisor += 1;          
        }
      });    
      
      return promedio /divisor;
    }else{
      return 0
    }
  }

  promedioPH(): number{
    if(this.loaded){        
      let promedio = 0;
      let divisor = 0;

      var arr = (this.formMano["controls"]["nirManualPuerto"] as FormArray).value;
      arr.forEach(x => {
        if(!isNaN(parseFloat(x.ph))){
          promedio += parseFloat(x.ph);
          divisor += 1;          
        }
      });    
      
      return promedio /divisor;
    }else{
      return 0
    }
  }

  promedioProtBase(): number{
    if(this.loaded){        
      let promedio = 0;
      let divisor = 0;

      var arr = (this.formMano["controls"]["nirManualPuerto"] as FormArray).value;
      arr.forEach(x => {
        if(!isNaN(parseFloat(x.protBase))){
          promedio += parseFloat(x.protBase);
          divisor += 1;          
        }
      });    
      
      return promedio /divisor;
    }else{
      return 0
    }
  }

  promedioProtBS(): number{
    if(this.loaded){        
      let promedio = 0;
      let divisor = 0;

      var arr = (this.formMano["controls"]["nirManualPuerto"] as FormArray).value;
      arr.forEach(x => {
        if(!isNaN(parseFloat(x.prot_BS))){
          promedio += parseFloat(x.prot_BS);
          divisor += 1;          
        }
      });    
      
      return promedio /divisor;
    }else{
      return 0
    }
  }

  obtenerBodegas(){
    this.moduloDeCargaService.obtenerListadoBodegas()
    .subscribe( bod =>  this.bodegas = bod);
  }

  getNir(): NirManualPuerto[]{
    return (this.formMano["controls"]["nirManualPuerto"] as FormArray).value
  }
  
  compareBodegaItem(c1: any, c2: any){
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  // hasPermisoRecibidores_Nir_AgregarNuevaFila() {
  //   return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_AgregarNuevaFila);
  // }
  // hasPermisoRecibidores_Nir_EliminarFila() {
  //   return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_EliminarFila);
  // }
  hasPermisoRecibidores_Nir_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Nir_Modificar);
  }

}
