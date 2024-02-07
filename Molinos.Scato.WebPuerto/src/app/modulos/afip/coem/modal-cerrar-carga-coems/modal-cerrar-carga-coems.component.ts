import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { COEM, SolicitudCierreCargaDto } from '@ScatoModels/afip/coem';
import { NuevasMercaderiasSueltasCoem } from '@ScatoModels/afip/nuevasMercaderiasSueltasCoem';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-cerrar-carga-coems',
  templateUrl: './modal-cerrar-carga-coems.component.html',
  styleUrls: ['./modal-cerrar-carga-coems.component.css']
})
export class ModalCerrarCargaCoemsComponent implements OnInit, OnChanges {

  @Input() coemsSeleccionadas: COEM[];
  @Input() idCaratula: number;
  @Output() finalizar: EventEmitter<void> = new EventEmitter();
  public form: FormGroup;
  public mensajeCarga: string;
  public cargando: boolean;

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private coemAfipService: CoemAfipService
  ) { }

  ngOnInit(): void {
    this.inicializarForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.coemsSeleccionadas) {
      this.inicializarForm();
    }
  }

  private inicializarForm() {
    const coems = this.crearCoemFormArray();
    this.form = this.formBuilder.group({
      idCaratula: [this.idCaratula, Validators.required],
      fechaZarpada: ['', Validators.required],
      numeroViaje: ['', Validators.required],
      coems
    });
  }

  private crearCoemFormArray() {
    const coems = this.coemsSeleccionadas;
    const formGroups = coems.map(coem => {
      const declaraciones = this.crearDeclaracionesFormArray(coem.mercaderiasSueltas);
      return this.formBuilder.group({
        idCoem: coem.id,
        identificadorCoem: coem.identificadorCOEM,
        declaraciones
      });
    });
    return this.formBuilder.array(formGroups);
  }

  private crearDeclaracionesFormArray(mercaderias: NuevasMercaderiasSueltasCoem[]) {
    const formGroups = mercaderias.filter(m => !m.noABordo).map(mercaderia => this.formBuilder.group({
      identificadorDeclaracion: mercaderia.identificadorDeclaracion,
      fechaEmbarque: ['', Validators.required],
      cantidadReal: ['', Validators.required],
      cantidadOriginal: [mercaderia.embalajes[0].peso]
    }));
    return this.formBuilder.array(formGroups);
  }

  public get coems() {
    return (this.form.get('coems') as FormArray).controls;
  }

  public getDeclaraciones(coem: FormGroup) {
    return (coem.get('declaraciones') as FormArray).controls;
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  public async cerrarCargasCoem() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    const confirm = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de solicitar el cierre de carga?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirm) {
      return;
    }

    this.cargando = true;
    var solicitudCierreCargaDto: SolicitudCierreCargaDto = this.form.getRawValue();
    this.coemAfipService.solicitarCierreDeCarga(solicitudCierreCargaDto).subscribe(async () => {
      await this.confirmationDialogService.confirm('Resultado exitoso', 'Se ha solicitado correctamente el cierre de carga', 'Cerrar', '', null, null, Tipoalerta.Success);
      this.cargando = false;
      this.finalizar.emit();
      this.closeModal();
    }, (err) => {
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || 'Ha ocurrido un error al solicitar cierre de carga';
      }
      this.confirmationDialogService.confirm('¡Error!', msj, 'Cerrar', '', null, null, Tipoalerta.Error);
      this.cargando = false;
    });
  }

}
