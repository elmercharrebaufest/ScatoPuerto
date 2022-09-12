import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Bodega } from '@ScatoModels/balanzadas/balanza';
import { Mano, NirManualPuerto } from '@ScatoModels/nir';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { parse } from 'path';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-nir-mano',
  templateUrl: './nir-mano.component.html',
  styleUrls: ['./nir-mano.component.css'],
  
})
export class NirManoComponent implements OnInit {

@Input() mano : Mano;
@Input() queMano : number;
bodegas: Bodega[] = [];
formMano: FormGroup;
loaded: boolean = false;

constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private calidadSharedService: CalidadSharedService,
    private fb: FormBuilder) {
      this.obtenerNir() 
    }

  ngOnInit(): void {
    this.formMano = this.fb.group({
      tipo: '',
      nirManualPuerto: this.fb.array([])
    });
    this.loaded = true
    this.obtenerBodegas();
    this.obtenerNir() 
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
    }
  }
  
  initNirManualPuerto(nirManualPuerto: NirManualPuerto): FormGroup{
    let fa: FormGroup;

    if(nirManualPuerto){
      fa = this.fb.group({
        id: nirManualPuerto?.id ? nirManualPuerto.id : 0,
        fecha: nirManualPuerto?.fecha ? nirManualPuerto.fecha : null,
        hd: nirManualPuerto?.hd ?? '',
        ph: nirManualPuerto?.ph ?? '',
        protBase: [{value: nirManualPuerto?.protBase ?? '', disabled: this.mano.tipo == 'Trigo' ? false : true}],
        prot_BS: [{value: nirManualPuerto?.prot_BS ?? '',  disabled: this.mano.tipo == 'Trigo' ? false : true}],
        origen: nirManualPuerto?.origen ?? '',
        bodega: nirManualPuerto?.bodega ?? null,
        mano: nirManualPuerto?.mano ?? '',
        material_id: nirManualPuerto?.material_id ? nirManualPuerto?.material_id : this.mano.tipo == "Trigo" ? 17:11,
        moduloDeCargaId: nirManualPuerto?.moduloDeCargaId ?? 0,
      })
    } else { 
      fa = this.fb.group({
        id: null,
        fecha: null,
        hd:  '',
        ph: '',
        protBase: '',
        prot_BS: '',
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

}
