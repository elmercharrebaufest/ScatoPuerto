import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Bandera } from '@ScatoModels/bandera';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { TipoDeBuquePuerto } from '@ScatoModels/tipo-de-buque-puerto';
import { Vapor } from '@ScatoModels/vapor';


@Component({
  selector: 'app-editar-crear-buques',
  templateUrl: './editar-crear-buques.component.html',
  styleUrls: ['./editar-crear-buques.component.css']
})
export class EditarCrearBuquesComponent implements OnInit {

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

  // #endregion

  // #region Constructor
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
    this.initFormCrearEditarBuque();
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {

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
      imoVapor: [],
      tipoBuquePuerto: [] //este es el arr de tipos de buques
    })
  }

  public openModalEditarCrearBuque(modal: any) {
    this.errorMessage = false;
    this.initFormCrearEditarBuque();
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

}
  // #endregion

