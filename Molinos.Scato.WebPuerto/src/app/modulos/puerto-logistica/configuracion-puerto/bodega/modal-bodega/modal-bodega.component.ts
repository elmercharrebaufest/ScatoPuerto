import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BodegaService } from 'app/shared/servicios/puerto-logistica/bodega.service';

@Component({
  selector: 'app-modal-bodega',
  templateUrl: './modal-bodega.component.html',
  styleUrls: ['./modal-bodega.component.css']
})
export class ModalBodegaComponent implements OnInit {

  @Input() item: any = null;

  public form: FormGroup;
  public guardando = false;
  public errorServidor: string = null;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private bodegaService: BodegaService
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
    this.errorServidor = null;
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
        this.errorServidor = err?.error || 'Ocurrió un error al guardar.';
      }
    );
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }
}
