import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { COEM, SolicitudNoABordoDto } from '@ScatoModels/afip/coem';
import { AfipMotivoNoABordo } from '@ScatoModels/afip/tablas-afip';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-no-abordo',
  templateUrl: './modal-no-abordo.component.html',
  styleUrls: ['./modal-no-abordo.component.css']
})
export class ModalNoAbordoComponent implements OnInit, OnChanges {
  @Input() coem: COEM
  public form: FormGroup;
  public listaMotivos: AfipMotivoNoABordo[] = [];
  public cargando: boolean = false;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private coemService: CoemAfipService,
    private tablasAfipService: TablasAfipService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    this.tablasAfipService.listarMotivosNoABordo().subscribe(motivos =>
      this.listaMotivos = motivos,
      err => console.error(err)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.coem) {
      this.initForm(changes.coem.currentValue);
    }
  }

  private initForm(coem: COEM) {
    const declaracionesForms = coem.mercaderiasSueltas.filter(m => !m.noABordo).map(m => this.formBuilder.group({
      cuit: m.cuitATA,
      peso: m.embalajes[0].peso,
      declaracion: m.identificadorDeclaracion,
      seleccionado: false
    }));
    const decalaracionesFormArray = this.formBuilder.array(declaracionesForms);
    this.form = this.formBuilder.group({
      idCoem: coem.id,
      codigoMotivo: ['', Validators.required],
      descripcionMotivo: '',
      declaraciones: decalaracionesFormArray
    });
  }

  public get declaracionesFormArray(): FormArray {
    return this.form.get('declaraciones') as FormArray;
  }

  public esSeleccionado(declaracion: FormGroup) {
    return declaracion.get('seleccionado').value;
  }

  public async solicitarNoABordo() {
    const solicitud = this.form.getRawValue() as SolicitudNoABordoDto;
    solicitud.declaraciones = solicitud.declaraciones.filter((d: any) => d.seleccionado).map((d: any) => d.declaracion);
    if (!solicitud.declaraciones.length) {
      await this.confirmationDialogService.confirm('Advertencia', 'No se han seleccionado declaraciones', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    if (!solicitud.codigoMotivo) {
      await this.confirmationDialogService.alertar('El motivo es obligatorio');
    }
    const motivo = this.listaMotivos.find(m => m.codigo == solicitud.codigoMotivo);
    if (motivo.descripcion == 'OTROS' && !solicitud.descripcionMotivo?.trim()) {
      await this.confirmationDialogService.alertar('El detalle de motivo es obligatorio cuando el motivo es "OTROS"');
      return;
    }

    this.cargando = true;
    this.coemService.solicitarNoABordo(solicitud).subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito('Se ha realizado la solicitud correctamente');
      this.modalService.dismissAll();
      this.coemService.$recargarCoems.next();
    }, (err) => {
      this.cargando = false;
      console.error(err);
      const msj = err.error ? err.error.message || err.error : err.message;
      this.confirmationDialogService.error(msj);
    });
  }

  public cerrarModal() {
    this.modalService.dismissAll();
  }

}
