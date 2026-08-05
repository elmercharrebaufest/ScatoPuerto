import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BodegaService } from 'app/shared/servicios/puerto-logistica/bodega.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

@Component({
  selector: 'app-modal-bodega',
  templateUrl: './modal-bodega.component.html',
  styleUrls: ['./modal-bodega.component.css']
})
export class ModalBodegaComponent implements OnInit {

  @Input() item: any = null;

  public form: FormGroup;
  public guardando = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private bodegaService: BodegaService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Nombre: [this.item?.nombre || '', Validators.required]
    });
  }

  get titulo(): string {
    return this.item ? 'Modificar bodega' : 'Nueva bodega';
  }

  get esEdicion(): boolean {
    return !!this.item;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const dto = { ...this.form.value, Id: this.item?.id || null };
    const op$ = this.esEdicion
      ? this.bodegaService.modificar(dto)
      : this.bodegaService.crear(dto);

    op$.subscribe(
      () => {
        this.guardando = false;
        this.activeModal.close(true);
      },
      err => {
        this.guardando = false;
        const errores = err?.error;
        const msg = typeof errores === 'string'
          ? errores
          : (errores && Object.values(errores)[0] as string) || 'Ocurrió un error al guardar.';
        this.confirmationDialogService.error(msg);
      }
    );
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }
}
