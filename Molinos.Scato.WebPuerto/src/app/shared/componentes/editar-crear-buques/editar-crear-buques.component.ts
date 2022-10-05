import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Pais } from '@ScatoModels/Buques/Pais';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { TipoDeBuquePuerto } from '@ScatoModels/tipo-de-buque-puerto';
import { Vapor } from '@ScatoModels/vapor';
import { BuqueService } from '@ScatoServicios/buque.service';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Component({
  selector: 'app-editar-crear-buques',
  templateUrl: './editar-crear-buques.component.html',
  styleUrls: ['./editar-crear-buques.component.css']
})
export class EditarCrearBuquesComponent implements OnInit {

  // #region Variables
  errorMessage: boolean = false;
  editarBuque: boolean = false;
  crearEditarBuqueForm: FormGroup;
  submitted = false;
  nombreBuque: string;
  tipoBuquePuerto: TipoDeBuquePuerto[];
  paisesPuerto: Pais[];
  vaporesPuerto: Vapor[];
  categoriasBuque: TipoDeBuquePuerto[];
  nombresBuquesLineUp: string[];
  listadoBanderasModificadas: boolean = false;
  vaporInfoBD: VaporInformacion;
  vaporInformacion: VaporInformacion;
  // #endregion

  // #region Constructor
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
    private buqueSharingService: BuqueSharingService,
    private buqueService: BuqueService,
  ) {

  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {
    this.initFormCrearEditarBuque();
    this.initListas();
  }
  // #endregion

  // #region Metodos
  private initFormCrearEditarBuque() {
    this.crearEditarBuqueForm = this.formBuilder.group({
      nombreBuque: ['', Validators.required],
      tipoBuque: ['', Validators.required],
      capitan: [],
      bandera: ['', Validators.required],
      categoriaBuque: [],
      freeboard: [],
      porteNeto: [],
      porteBruto: [],
      cantBodegastks: [],
      eslora: [],
      manga: [],
      puntual: [],
      imoVapor: [],
      tipoBuquePuerto: [] //este es el arr de tipos de buques
    })
  }

  private initListas() {
    forkJoin([
      this.embarqueService.obtenerListadoTipoDeBuquePuerto(),
      this.buqueService.obtenerPaises(),
      this.buqueService.obtenerVapores()
    ]).subscribe(([res1, res2, res3]) => {
      this.tipoBuquePuerto = res1.filter(a => a.nombre == "Bulk Carrier" || a.nombre == "Oil Tanker");
      this.categoriasBuque = res1.filter(cat => cat.nombre == "Handy-max" || cat.nombre == "Handy-sized" || cat.nombre == "Wood-chip carriers" || cat.nombre == "WPanamax");

      this.paisesPuerto = res2;
      this.vaporesPuerto = res3;

    }, err => { console.log(err); });
  }

  public numberOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  public decimalOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 46)
      return true;
    return false;
  }

  public searchVapores = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.vaporesPuerto.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatterVapores = (v: Vapor) => v.nombre;


  public onBlurBandera() {
    this.listadoBanderasModificadas = !this.crearEditarBuqueForm.value.bandera;
  }

  public sendBandera(value: any) {
    if (this.crearEditarBuqueForm['controls'].bandera.value === undefined) {
      this.crearEditarBuqueForm.controls.bandera.setValue(null);
      (<HTMLInputElement>document.getElementById("ban")).value = '';
    }
  }

  public formatterPaises = (p: Pais) => p.descripcion;

  public searchPaises = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.paisesPuerto.filter(b => b.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public selectedVapor($event) {
    let { id, nombre } = $event.item
    this.editarBuque = true

    this.buqueService.obtenerVaporInformaconion(id).subscribe((res: VaporInformacion) => {
      this.vaporInfoBD = res;
      // console.log(this.vaporInfoBD);
      let pais;
      if(this.vaporInfoBD.bandera_Id != null){
        pais = this.paisesPuerto.filter(p => p.id == this.vaporInfoBD.bandera_Id)
      }
      let tipoBuqueBD = this.tipoBuquePuerto.filter(tipo => tipo.nombre == this.vaporInfoBD.tipoBuque)
      let categoriaBuqueBD = this.categoriasBuque.filter(tipo => tipo.nombre == this.vaporInfoBD.categoriaBuque)

      this.vaporInfoBD.freeboard !== null && this.crearEditarBuqueForm.controls.freeboard.setValue(this.vaporInfoBD.freeboard);
      this.vaporInfoBD.porteNeto !== null && this.crearEditarBuqueForm.controls.porteNeto.setValue(this.vaporInfoBD.porteNeto);
      this.vaporInfoBD.porteBruto !== null && this.crearEditarBuqueForm.controls.porteBruto.setValue(this.vaporInfoBD.porteBruto);
      this.vaporInfoBD.eslora !== null && this.crearEditarBuqueForm.controls.eslora.setValue(this.vaporInfoBD.eslora);
      this.vaporInfoBD.manga !== null && this.crearEditarBuqueForm.controls.manga.setValue(this.vaporInfoBD.manga);
      this.vaporInfoBD.puntual !== null && this.crearEditarBuqueForm.controls.puntual.setValue(this.vaporInfoBD.puntual);
      this.vaporInfoBD.cantidadBodegasTks !== null && this.crearEditarBuqueForm.controls.cantBodegastks.setValue(this.vaporInfoBD.cantidadBodegasTks);
      pais !== null && this.crearEditarBuqueForm.controls.bandera.setValue(pais[0] != null ? pais[0] : null);
      tipoBuqueBD !== null && this.crearEditarBuqueForm.controls.tipoBuque.setValue(tipoBuqueBD[0]);
      categoriaBuqueBD !== null && this.crearEditarBuqueForm.controls.categoriaBuque.setValue(categoriaBuqueBD[0]);
      this.vaporInfoBD.imoVapor !== null && this.crearEditarBuqueForm.controls.imoVapor.setValue(this.vaporInfoBD.imoVapor);
    })
  }

  public openModalEditarCrearBuque(modal: any) {
    this.errorMessage = false;
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  get f() { return this.crearEditarBuqueForm.controls; }
  // #endregion

  // #region Eventos Controles
  public onResetForm() {
    this.crearEditarBuqueForm.reset();
    this.editarBuque = false
  }

  public onEditarBuque() {
    this.submitted = true
    let buque = this.crearEditarBuqueForm.getRawValue();
    const objVapor = [
      {
        vapor_id: buque.nombreBuque.id,
        paisPuerto_id: buque.bandera.id,
        nombrebuque: buque.nombreBuque.nombre,
        tipoBuque: buque.tipoBuque.nombre,
        categoriaBuque: buque.categoriaBuque.nombre,
        imoVapor: buque.imoVapor,
        freeboard: buque.freeboard,
        eslora: buque.eslora,
        porteNeto: buque.porteNeto,
        porteBruto: buque.porteBruto,
        manga: buque.manga,
        puntual: buque.puntual,
        cantidadBodegasTks: buque.cantBodegastks,
      }]

    this.buqueService.guardarVaporInformacion(objVapor).subscribe(res => res = objVapor);

    if (this.crearEditarBuqueForm.controls['nombreBuque'].invalid || this.crearEditarBuqueForm.controls['tipoBuque'].invalid || this.crearEditarBuqueForm.controls['bandera'].invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return
    }
    this.modalService.dismissAll();
    this.onResetForm();
  }

  public onCrearBuque() {
    this.submitted = true
    let buque = this.crearEditarBuqueForm.getRawValue();
    const objVapor = [
      {
        vapor_id: 0,
        // nombrebuque: typeof buque.nombreBuque.nombre !== 'object'  ? buque.nombreBuque : buque.nombreBuque.nombre,
        paisPuerto_id: buque.bandera.id,
        nombrebuque: buque.nombreBuque,
        tipoBuque: buque.tipoBuque.nombre,
        categoriaBuque: buque.categoriaBuque.nombre,
        imoVapor: buque.imoVapor,
        freeboard: buque.freeboard,
        eslora: buque.eslora,
        porteNeto: buque.porteNeto,
        porteBruto: buque.porteBruto,
        manga: buque.manga,
        puntual: buque.puntual,
        cantidadBodegasTks: buque.cantBodegastks,
      }
    ]

    // console.log(objVapor);
    this.buqueService.guardarVaporInformacion(objVapor).subscribe(res => res = objVapor);

    if (this.crearEditarBuqueForm.controls['nombreBuque'].invalid || this.crearEditarBuqueForm.controls['tipoBuque'].invalid || this.crearEditarBuqueForm.controls['bandera'].invalid)
    // if(this.crearEditarBuqueForm.controls['nombreBuque'].invalid || this.crearEditarBuqueForm.controls['tipoBuque'].invalid)
    {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)

      return
    }
    this.modalService.dismissAll();
    this.onResetForm()
  }
  // #endregion

}
