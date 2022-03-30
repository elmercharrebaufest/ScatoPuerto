import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Nir } from '@ScatoModels/nir';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Bodega } from '@ScatoModels/balanzadas/balanza';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-nir',
  templateUrl: './nir.component.html',
  styleUrls: ['./nir.component.css']
})
export class NIRComponent implements OnInit {
  forms: FormGroup;
  datosEmbarque: any;
  materialesPuerto: MaterialPuerto[] = [];
  materialMaiz: MaterialPuerto;
  materialTrigo: MaterialPuerto;
  moduloDeCarga_Id: number;
  confirmationDialogService: any;
  bodegas: Bodega[];
  
  constructor(
    private fb: FormBuilder,
    private moduloDeCargaService: ModuloDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService,
    confirmationDialogService: ConfirmationDialogService,
  ) {
    this.confirmationDialogService = confirmationDialogService;
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.materialesPuerto = this.datosEmbarque.listaMateriales;    
    this.materialTrigo = this.materialesPuerto.find(m => m.descripcionCorta.includes('TRIGO'));
    this.materialMaiz = this.materialesPuerto.find(m => m.descripcionCorta.includes('MAIZ'));
  }

  ngOnInit(): void {
    this.initFormulario();

    this.moduloDeCargaService.obtenerListadoBodegas()
      .pipe( finalize( () => this.obtenerNir() ) )
      .subscribe( bod => this.bodegas = bod );
  }
  
  initFormulario(){
    this.forms = this.fb.group({
      maiz: this.fb.array([this.initMaiz()]),
      trigo: this.fb.array([this.initTrigo()])
    });
  }

  initMaiz(x: Nir = null, numeroMano?: number){
    return this.fb.group({
      // id: x.id ?? 0,
      fecha: x?.fecha ? x.fecha : '',
      hora: x?.hora ?? '',
      hd: x?.hd ?? '',
      ph: x?.ph ?? '',
      origen: x?.origen ?? '',
      bodega: x?.bodega ?? '',
      mano: x?.mano ?? '',
      moduloDeCargaId: x?.moduloDeCargaId ?? 0,
      material_id: x?.material_id ?? this.materialMaiz.id
    });
  }

  initTrigo(x: Nir = null, numeroMano?: number){
    return this.fb.group({
      // id: x.id ?? 0,
      fecha: x?.fecha ? x.fecha : '',
      hora: x?.hora ?? '',
      ritmo: x?.ritmo ?? '',
      hd: x?.hd ?? '',
      protBase: x?.protBase ?? '',
      prot_BS: x?.prot_BS ?? '',
      ph: x?.ph ?? '',
      origen: x?.origen ?? '',
      bodega: x?.bodega ?? '',
      mano: x?.mano ?? '',
      moduloDeCargaId: x?.moduloDeCargaId ?? 0,
      material_id: x?.material_id ?? this.materialTrigo.id
    });
  }

  obtenerNir(){
    console.log('this.bodegas: ', this.bodegas);
    
    this.moduloDeCargaService.obtenerNir(this.moduloDeCarga_Id).subscribe( nir => {
      console.log('obtenerNir NIR: ', nir);
      
      let trigo = nir.filter(n => n.material_id === this.materialTrigo.id);
      let maiz = nir.filter(n => n.material_id === this.materialMaiz.id);

      this.trigo.clear();
      trigo.forEach( x => this.trigo.push( this.initTrigo(x) ));

      this.maiz.clear();
      maiz.forEach( x => this.maiz.push( this.initMaiz(x) ));

    } );
  }

  get trigo(): FormArray {
    return this.forms.get("trigo") as FormArray;
  }
  get maiz(): FormArray {
    return this.forms.get("maiz") as FormArray;
  }

  obtenerMaiz(): []{
    return this.forms.getRawValue().maiz;
  }
  obtenerTrigo(): []{
    return this.forms.getRawValue().trigo;
  }

  getDia(fecha: Date, formato: string = 'ES'): string{
    let date1 = fecha.toString().substr(0, 10);
    let aa = date1.toString().substr(0, 4);
    let mm = date1.toString().substr(5, 2);
    let dd = date1.toString().substr(8, 2);
    let date = ``;

    if( formato == 'EN' ){
      date = `${aa}-${mm}-${dd}`;
    } else {
      date = `${dd}-${mm}-${aa}`;
    }

    return date;
  }

  agregarLineasEmbarqueTrigo(numeroMano: number) {
    this.trigo.push(this.initTrigo(null, numeroMano));
  }
  agregarLineasEmbarqueMaiz(numeroMano: number) {
    this.maiz.push(this.initMaiz(null, numeroMano));
  }
  
  eliminarLineasEmbarque(pos: number) {
    this.trigo.removeAt(pos);
  }

  enviarNir(){

    let nir = [];
    let maiz = [];
    let trigo = [];
    maiz = this.obtenerMaiz();
    trigo = this.obtenerTrigo();
    
    for(let m of maiz){
      nir.push(m);
    }
    for(let t of trigo){
      nir.push(t);
    }

    // nir.push( this.obtenerMaiz() );
    // nir.push( this.obtenerTrigo() );

    console.log('.:: MAIZ: ::.', maiz );
    console.log('.:: TRIGO: ::.', trigo );
    console.log('.:: NIR: ::.', nir );
    
    // this.moduloDeCargaService.guardarNir( this.obtenerMaiz() )
  }

  compareOrigen(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareBodega(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}