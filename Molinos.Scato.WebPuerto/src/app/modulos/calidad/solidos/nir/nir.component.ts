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

    // this.moduloDeCargaService.obtenerListadoBodegas()
    //   .pipe( finalize( () => this.obtenerNir() ) )
    //   .subscribe( bod => this.bodegas = bod );
    this.obtenerNir()
  }
  
  initFormulario(){
    this.forms = this.fb.group({
      maizMano1: this.fb.array([this.initMaiz(null, 1)]),
      maizMano2: this.fb.array([this.initMaiz(null, 2)]),
      trigoMano1: this.fb.array([this.initTrigo(null, 1)]),
      trigoMano2: this.fb.array([this.initTrigo(null, 2)])
    });
  }

  initMaiz(x: Nir = null, numeroMano?: number){
    return this.fb.group({
      id: x?.id ?? 0,
      fecha: x?.fecha ? x.fecha : '',
      hora: x?.hora ?? '',
      hd: x?.hd ?? '',
      ph: x?.ph ?? '',
      origen: x?.origen ?? '',
      bodega: x?.bodega ?? '',
      mano: x?.mano ?? this.asignarMano(numeroMano),
      moduloDeCargaId: x?.moduloDeCargaId ?? 0,
      material_id: x?.material_id ?? this.materialMaiz.id
    });
  }

  initTrigo(x: Nir = null, numeroMano?: number){
    return this.fb.group({
      id: x?.id ?? 0,
      fecha: x?.fecha ? x.fecha : '',
      hora: x?.hora ?? '',
      ritmo: x?.ritmo ?? '',
      hd: x?.hd ?? '',
      protBase: x?.protBase ?? '',
      prot_BS: x?.prot_BS ?? '',
      ph: x?.ph ?? '',
      origen: x?.origen ?? '',
      bodega: x?.bodega ?? '',
      mano: x?.mano ?? this.asignarMano(numeroMano),
      moduloDeCargaId: x?.moduloDeCargaId ?? 0,
      material_id: x?.material_id ?? this.materialTrigo.id
    });
  }

  asignarMano(numeroMano: number):string{
    if(!numeroMano) return '';

    let mano = '';
    if(numeroMano==1)
      mano = 'mano1';
    else
      mano = 'mano2';
    
    return mano;
  }

  obtenerNir(){
    this.moduloDeCargaService.obtenerNir(this.moduloDeCarga_Id).subscribe( nir => {
      console.log('obtenerNir NIR: ', nir);
      
      let trigoMano1 = nir.filter(n => n.material_id === this.materialTrigo.id && n.mano=='mano1');
      let trigoMano2 = nir.filter(n => n.material_id === this.materialTrigo.id && n.mano=='mano2');
      let maizMano1 = nir.filter(n => n.material_id === this.materialMaiz.id && n.mano=='mano1');
      let maizMano2 = nir.filter(n => n.material_id === this.materialMaiz.id && n.mano=='mano2');

      this.trigoMano1.clear();
      trigoMano1.forEach( x => this.trigoMano1.push( this.initTrigo(x, 1) ));
      this.trigoMano2.clear();
      trigoMano2.forEach( x => this.trigoMano2.push( this.initTrigo(x, 2) ));
      this.maizMano1.clear();
      maizMano1.forEach( x => this.maizMano1.push( this.initMaiz(x, 1) ));
      this.maizMano2.clear();
      maizMano2.forEach( x => this.maizMano2.push( this.initMaiz(x, 2) ));

    } );
  }

  get trigoMano1(): FormArray {
    return this.forms.get("trigoMano1") as FormArray;
  }
  get trigoMano2(): FormArray {
    return this.forms.get("trigoMano2") as FormArray;
  }
  get maizMano1(): FormArray {
    return this.forms.get("maizMano1") as FormArray;
  }
  get maizMano2(): FormArray {
    return this.forms.get("maizMano2") as FormArray;
  }

  obtenerTrigoMano1(): []{
    return this.forms.getRawValue().trigoMano1;
  }
  obtenerTrigoMano2(): []{
    return this.forms.getRawValue().trigoMano2;
  }
  obtenerMaizMano1(): []{
    return this.forms.getRawValue().maizMano1;
  }
  obtenerMaizMano2(): []{
    return this.forms.getRawValue().maizMano2;
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
    if(numeroMano == 1)
      this.trigoMano1.push(this.initTrigo(null, numeroMano));
    else
      this.trigoMano2.push(this.initTrigo(null, numeroMano));
  }
  agregarLineasEmbarqueMaiz(numeroMano: number) {
    if(numeroMano == 1)
      this.maizMano1.push(this.initMaiz(null, numeroMano));
    else
      this.maizMano2.push(this.initMaiz(null, numeroMano));
  }
  
  eliminarLineasEmbarque(pos: number, productoMano: string) {
    // this.trigoMano1.removeAt(pos);
    this[productoMano].removeAt(pos);
  }

  obtenerNirCompleto(): Nir[]{
    let nir: Nir[] = [];
    let maizMano1 = [], maizMano2 = [], trigoMano1 = [], trigoMano2 = [];

    maizMano1 = this.obtenerMaizMano1();
    maizMano2 = this.obtenerMaizMano2();
    trigoMano1 = this.obtenerTrigoMano1();
    trigoMano2 = this.obtenerTrigoMano2();
    
    for(let m1 of maizMano1){ nir.push(m1); }
    for(let m2 of maizMano2){ nir.push(m2); }
    for(let t1 of trigoMano1){ nir.push(t1); }
    for(let t2 of trigoMano2){ nir.push(t2); }

    console.log('obtenerNirCompleto(): ', nir);
    
    return nir;
  }

  enviarNir(){
    let nir: Nir[] = this.obtenerNirCompleto();
    console.log('.:: NIR: ::.', nir );
    
    this.moduloDeCargaService.guardarModuloDeCargaNirManualPuerto( nir, this.moduloDeCarga_Id )
      .subscribe( res => console.log(res) );
  }

  compareOrigen(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareBodega(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}