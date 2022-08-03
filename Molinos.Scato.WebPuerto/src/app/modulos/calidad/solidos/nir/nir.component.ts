import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Nir } from '@ScatoModels/nir';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Bodega } from '@ScatoModels/balanzadas/balanza';
import { finalize } from 'rxjs/operators';
import { Mail } from '@ScatoModels/mail';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { readFile } from 'fs';

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
  conTrigo: boolean = false;
  conMaiz: boolean = false;
  hideSpinner: any;
  destinatarios: string[];
  envioNir:boolean = false;
  objetoMailNir: object;
  celdasManoDeEmbarque: CeldaManoDeEmbarque[];
  promedioHDMano1:number;
  promedioHDMano2:number;
  promedioTotalHD:number;
  promedioPHMano1:number;
  promedioPHMano2:number;
  promedioTotalPH:number;
  promedioProtBaseMano1:number;
  promedioProtBaseMano2:number;
  promedioTotalProtBase:number;
  promedioProtBSMano1:number;
  promedioProtBSMano2:number;
  promedioTotalProtBS:number;
  file:any;


  public configListaMultiple: any;


  constructor(
    private fb: FormBuilder,
    private moduloDeCargaService: ModuloDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService,
    confirmationDialogService: ConfirmationDialogService,
    private procesoCalidadService: ProcesoCalidadService,
    private datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
  ) {
    this.confirmationDialogService = confirmationDialogService;
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.materialesPuerto = this.datosEmbarque.listaMateriales;
    this.materialTrigo = this.materialesPuerto.find(m => m.descripcionCorta.includes('TRIGO'));
    if(this.materialTrigo) this.conTrigo = true;
    this.materialMaiz = this.materialesPuerto.find(m => m.descripcionCorta.includes('MAIZ'));
    if(this.materialMaiz) this.conMaiz = true;
  }

  ngOnInit(): void {
    this.initFormulario();

    this.obtenerCeldasOrigen();

    this.moduloDeCargaService.obtenerListadoBodegas()
      .pipe( finalize( () => this.obtenerNir() ) )
      .subscribe( bod => this.bodegas = bod );

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
      ritmo: x?.ritmo ?? '',
      hd: x?.hd ?? '',
      ph: x?.ph ?? '',
      protBase: x?.protBase ?? '',
      prot_BS: x?.prot_BS ?? '',
      origen: x?.origen ?? '',
      bodega: x?.bodega ?? '',
      mano: x?.mano ?? this.asignarMano(numeroMano),
      moduloDeCargaId: x?.moduloDeCargaId ?? 0,
      material_id: x?.material_id ?? this.materialMaiz?.id
    });
  }

  initTrigo(x: Nir = null, numeroMano?: number){
    return this.fb.group({
      id: x?.id ?? 0,
      fecha: x?.fecha ? x.fecha : '',
      hora: x?.hora ?? '',
      ritmo: x?.ritmo ?? '',
      hd: x?.hd ?? '',
      ph: x?.ph ?? '',
      protBase: x?.protBase ?? '',
      prot_BS: x?.prot_BS ?? '',
      origen: x?.origen ?? '',
      bodega: x?.bodega ?? '',
      mano: x?.mano ?? this.asignarMano(numeroMano),
      moduloDeCargaId: x?.moduloDeCargaId ?? 0,
      material_id: x?.material_id ?? this.materialTrigo?.id
    });
  }

  obtenerCeldasOrigen(){
    this.moduloDeCargaService.obtenerListadoCeldaManoDeEmbarque().subscribe(data => {
      this.celdasManoDeEmbarque = data;
      this.setConfigListaMultiple();
    })
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

      let trigoMano1 = nir.filter(n => n.material_id === this.materialTrigo?.id && n.mano=='mano1');
      let trigoMano2 = nir.filter(n => n.material_id === this.materialTrigo?.id && n.mano=='mano2');
      let maizMano1 = nir.filter(n => n.material_id === this.materialMaiz?.id && n.mano=='mano1');
      let maizMano2 = nir.filter(n => n.material_id === this.materialMaiz?.id && n.mano=='mano2');

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

    return nir;
  }
  
  public setConfigListaMultiple() {

    this.configListaMultiple = {
    singleSelection: false,
    idField: 'id',
    textField: 'nombre',
    enableCheckAll: false,
    maxHeight: 100,
    
    // selectAllText: 'Marcar Todos',
    
    // unSelectAllText: 'Desmarcar Todos',
    
    }
    
    }
  enviarNir(guardarYEnviar : boolean = false) {
    let nir: Nir[] = this.obtenerNirCompleto();
    this.calcularPromedios(nir);
    if(guardarYEnviar == true) {
      this.enviarMail(nir);
      
    }else{
      let ObjetoMailNir = {
        nirManualPuerto : nir,
        mail: '',
      }
      this.moduloDeCargaService.guardarModuloDeCargaNirManualPuerto( ObjetoMailNir, this.moduloDeCarga_Id ).subscribe(res => {console.log('200 OK')});   
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
    //#region variables mail
    var titulo = "Enviar NIR";
    var text = "Cuerpo del Mail:"
    var textoCuerpoMail = 'Cuerpo del mail';
    var inputTitle = "Destinatarios";
    var mailNir = new Mail(`NIR.`,`${textoCuerpoMail}`);
    let destinatariosLista: string[];

    this.procesoCalidadService.obtenerDestinatariosNirManual('NirManual')
    .subscribe(data => {mailNir.destinatarios = data

      var button1 = 'Enviar';
      var button2 = 'Cancelar';
      let ObjetoMailNir = {
        nirManualPuerto : nir,
        mail: mailNir
      }
      this.objetoMailNir = ObjetoMailNir;
      //#endregion 
      this.confirmationDialogService.confirm(titulo, text, button1, button2, 'lg', mailNir, null, inputTitle, true)
        .then((confirmed) => {
          // this.hideSpinner.emit(true);
          if (confirmed) {
              console.log(ObjetoMailNir);
              
              let nombreBuque = this.datosEmbarqueProcesoService.getEmbarqueSelected().nombreBuque
              this.moduloDeCargaService.guardarModuloDeCargaNirManualPuerto( ObjetoMailNir, this.moduloDeCarga_Id, nombreBuque ).subscribe(res => {console.log('200 OK');
              this.envioNir = true;
              });
            }
        })
        .catch((e) => {
          this.confirmationDialogService.confirm(e, 'Cerrar', button1, button2, null, )
          .then((confirmed) => {
            if (confirmed){
              this.envioNir = false;
              return
            }
            // this.hideSpinner.emit(false)
            return
            }).catch(() => window.location.reload());
          // this.hideSpinner.emit(false);
        });
    })
  }
  calcularPromedios(nirs : Nir[]){
    let contadorMano1 = 0;
    let contadorMano2 = 0;
    let hdMano1 = 0;
    let hdMano2 = 0;
    let phMano1 = 0;
    let phMano2 = 0;
    let protBaseMano1 = 0;
    let protBaseMano2 = 0;
    let prot_BSMano1 = 0;
    let prot_BSMano2 = 0;
    nirs.forEach(nir => {
      if(nir.mano == "mano1"){
        hdMano1 += parseFloat(nir.hd);
        phMano1 += parseFloat(nir.ph);
        if(nir.material_id == 17){
        prot_BSMano1 += parseFloat(nir.prot_BS);
        protBaseMano1 += parseFloat(nir.protBase);
        }
        contadorMano1++;
      }else if(nir.mano == "mano2"){
        hdMano2 += parseFloat(nir.hd);
        phMano2 += parseFloat(nir.ph);
        if(nir.material_id == 17){
          prot_BSMano2 += parseFloat(nir.prot_BS);
          protBaseMano2 += parseFloat(nir.protBase);
        }
        contadorMano2++;
      }
    });
    this.promedioHDMano1 = hdMano1 / contadorMano1;
    this.promedioHDMano2 = hdMano2 / contadorMano2;
    this.promedioTotalHD = (this.promedioHDMano1 + this.promedioHDMano2) / 2;
    this.promedioPHMano1 = phMano1 / contadorMano1;
    this.promedioPHMano2 = phMano2 / contadorMano2;
    this.promedioTotalPH = (this.promedioPHMano1 + this.promedioPHMano2) / 2;
    this.promedioProtBSMano1 = prot_BSMano1 / contadorMano1;
    this.promedioProtBSMano2 = prot_BSMano2 / contadorMano2;
    this.promedioTotalProtBS = (this.promedioProtBSMano1 + this.promedioProtBSMano2) / 2
    this.promedioProtBaseMano1 = protBaseMano1 / contadorMano1;
    this.promedioProtBaseMano2 = protBaseMano2 / contadorMano2;
    this.promedioTotalProtBase = (this.promedioProtBaseMano1 + this.promedioProtBaseMano2) / 2
  }
}
