import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Bandera } from '@ScatoModels/bandera';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { TipoDeBuquePuerto } from '@ScatoModels/tipo-de-buque-puerto';
import { Vapor } from '@ScatoModels/vapor';
import { BuqueService } from '@ScatoServicios/buque.service';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { VaporService } from '@ScatoServicios/vapor.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Component({
  selector: 'app-modal-crear-buque',
  templateUrl: './modal-crear-buque.component.html',
  styleUrls: ['./modal-crear-buque.component.css']
})
export class ModalCrearBuqueComponent implements OnInit {

  // #region Variables
  @Output() actualizarListaVapores = new EventEmitter();
  errorMessage: boolean = false;
  editarBuque: boolean = false;
  crearEditarBuqueForm: FormGroup;
  submitted = false;
  nombreBuque: string;
  tipoBuquePuerto: TipoDeBuquePuerto[];
  banderasBuque: Bandera[];
  vaporesPuerto: Vapor[];
  vaporSeleccionado: Vapor = null;
  categoriasBuque: TipoDeBuquePuerto[];
  nombresBuquesLineUp: string[];
  listadoBanderasModificadas: boolean = false;
  vaporInfoBD: VaporInformacion;
  vaporInformacion: VaporInformacion;
  mostrarSpinner: boolean = false;
  mensajeBuque: string = '';
  @Input() id: number = 0;
  @Output() cerrar = new EventEmitter<void>()
  subscripcionVaporMensaje: Subscription
  mensaje: string;
  mostrarMensaje: boolean;
  puedeCrearBuque: boolean = true;
  // #endregion

  // #region Constructor
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
    private buqueService: BuqueService,
    private vaporService: VaporService
  ) {
    this.initFormCrearEditarBuque();
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {
    this.initListas();

  }
  // #endregion

  // #region Metodos
  private initFormCrearEditarBuque() {
    this.crearEditarBuqueForm = null;
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
      imoVapor: ['', Validators.required],
      tipoBuquePuerto: [] //este es el arr de tipos de buques
    })
  }

  private initListas() {
    forkJoin([
      this.embarqueService.obtenerListadoTipoDeBuquePuerto(),
      this.embarqueService.obtenerBanderas(),
      this.buqueService.obtenerVapores()
    ]).subscribe(([res1, res2, res3]) => {
      this.tipoBuquePuerto = res1.filter(a => a.nombre == "Bulk Carrier" || a.nombre == "Oil Tanker");
      this.categoriasBuque = res1.filter(cat => cat.nombre == "Handy-max" || cat.nombre == "Handy-sized" || cat.nombre == "Wood-chip carriers" || cat.nombre == "WPanamax");

      this.banderasBuque = res2;
      this.vaporesPuerto = res3;

      if (this.id > 0) {
        this.selectedVapor(this.id)
      }
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

  public onInputNombreBuque(e: Event) {
    const input = e.target as HTMLInputElement;
    this.crearEditarBuqueForm['controls'].nombreBuque.setValue(input.value.toUpperCase());    
  }  

  public onBlurBandera() {
    this.listadoBanderasModificadas = !this.crearEditarBuqueForm.value.bandera;
  }

  public sendBandera(value: any) {
    if (this.crearEditarBuqueForm['controls'].bandera.value === undefined) {
      this.crearEditarBuqueForm.controls.bandera.setValue(null);
      (<HTMLInputElement>document.getElementById("ban")).value = '';
    }
  }

  public formatterBanderas = (p: Bandera) => p.nombre;

  public searchBanderas = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.banderasBuque.filter(b => b.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public selectedVapor(id) {
    this.mostrarSpinner = true;
    this.mensajeBuque = 'Cargando información de buque...............';
    this.vaporSeleccionado = new Vapor();
    this.vaporSeleccionado.id = id;
    this.editarBuque = true

    this.buqueService.obtenerVaporInformacion(id).subscribe((res: VaporInformacion) => {
      this.vaporInfoBD = res;
      // console.log(this.vaporInfoBD);
      if (this.vaporInfoBD != null) {
        let bandera;
        if (this.vaporInfoBD.bandera != null) {
          bandera = this.banderasBuque.filter(p => p.id == this.vaporInfoBD.bandera.id)
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
        this.crearEditarBuqueForm.controls.bandera.setValue((bandera != null || bandera != undefined) ? bandera[0] : null);
        this.crearEditarBuqueForm.controls.tipoBuque.setValue((tipoBuqueBD !== null || tipoBuqueBD !== undefined) ? tipoBuqueBD[0] : null);
        categoriaBuqueBD !== null && this.crearEditarBuqueForm.controls.categoriaBuque.setValue(categoriaBuqueBD[0]);
        this.vaporInfoBD.imoVapor !== null && this.crearEditarBuqueForm.controls.imoVapor.setValue(this.vaporInfoBD.imoVapor);
        this.vaporInfoBD.nombreBuque !== null && this.crearEditarBuqueForm.controls.nombreBuque.setValue(this.vaporInfoBD.nombreBuque);
      }
    }, error => { }
      , () => {
        this.mostrarSpinner = false;
        this.mensajeBuque = '';
      })
  }

  public openModalEditarCrearBuque(modal: any) {
    this.errorMessage = false;
    this.initFormCrearEditarBuque();
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  get f() { return this.crearEditarBuqueForm.controls; }
  // #endregion

  // #region Eventos Controles
  public onResetForm() {
    this.submitted = false;
    this.crearEditarBuqueForm.reset();
    this.editarBuque = false;
    this.cerrar.emit();
  }

  public onEditarBuque() {
    this.submitted = true
    let buque = this.crearEditarBuqueForm.getRawValue();
    if (this.crearEditarBuqueForm.controls['nombreBuque'].invalid ||
    this.crearEditarBuqueForm.controls['tipoBuque'].invalid ||
    this.crearEditarBuqueForm.controls['bandera'].invalid ||
    this.crearEditarBuqueForm.controls['imoVapor'].invalid) {
    this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
    return
  }
    const objVapor =
    {
      vapor: this.vaporSeleccionado,
      bandera: buque.bandera,
      nombrebuque: buque.nombreBuque.nombre,
      tipoBuque: buque.tipoBuque.nombre,
      categoriaBuque: '',
      imoVapor: buque.imoVapor,
      freeboard: buque.freeboard,
      eslora: buque.eslora,
      porteNeto: buque.porteNeto,
      porteBruto: buque.porteBruto,
      manga: buque.manga,
      puntual: buque.puntual,
      cantidadBodegasTks: buque.cantBodegastks,
    };


    if (this.ValidarBuque(objVapor)) {return;}
    this.mostrarSpinner = true;
    this.mensajeBuque = 'Guardando información de buque';
    this.vaporService.guardarVaporInformacion(objVapor).subscribe(
      res => res = objVapor
      , error => { }
      , () => {
        this.mostrarSpinner = false;
        this.mensajeBuque = '';
        this.actualizarListaVapores.emit(true);
        this.onResetForm();
        this.initListas();
        this.modalService.dismissAll();
      });

  }

  public onCrearBuque() {
    this.submitted = true
    let buque = this.crearEditarBuqueForm.getRawValue();
    if (this.id > 0) {
      this.vaporSeleccionado = new Vapor();
      this.vaporSeleccionado.id = this.id;
    }

    if (this.crearEditarBuqueForm.controls['nombreBuque'].invalid ||
    this.crearEditarBuqueForm.controls['tipoBuque'].invalid ||
    this.crearEditarBuqueForm.controls['bandera'].invalid ||
    this.crearEditarBuqueForm.controls['imoVapor'].invalid) {
    this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
    return
  }

    const objVapor =
    {
      vapor: this.id > 0 ? this.vaporSeleccionado : null,
      vaporId: this.id > 0 ? this.id  : null,
      // nombrebuque: typeof buque.nombreBuque.nombre !== 'object'  ? buque.nombreBuque : buque.nombreBuque.nombre,
      bandera: buque.bandera,
      nombrebuque: buque.nombreBuque.trim(),
      tipoBuque: buque.tipoBuque.nombre,
      categoriaBuque: '',
      imoVapor: buque.imoVapor,
      freeboard: buque.freeboard,
      eslora: buque.eslora,
      porteNeto: buque.porteNeto,
      porteBruto: buque.porteBruto,
      manga: buque.manga,
      puntual: buque.puntual,
      cantidadBodegasTks: buque.cantBodegastks,
    }



    this.ValidarBuque(objVapor).subscribe(
      (data)=> {
        this.mensaje = data;
        if (this.mensaje != "") { this.mostrarSpinner = false; this.puedeCrearBuque = false; return; }
        this.mostrarSpinner = true;
        this.mensajeBuque = 'Guardando información de buque';
        this.vaporService.guardarVaporInformacion(objVapor).subscribe(
          res => res = objVapor
          , error => { }
          , () => {
            this.mostrarSpinner = false;
            this.mensajeBuque = '';
            this.actualizarListaVapores.emit(true);
            this.onResetForm();
            this.initListas();
            this.modalService.dismissAll();

          });
      }
    )

  }

  public ValidarBuque(objVapor) {
     return this.vaporService.ValidarBuque(objVapor.bandera.nombre,
      objVapor.nombrebuque, objVapor.imoVapor, this.id)
  }
  // #endregion

}
