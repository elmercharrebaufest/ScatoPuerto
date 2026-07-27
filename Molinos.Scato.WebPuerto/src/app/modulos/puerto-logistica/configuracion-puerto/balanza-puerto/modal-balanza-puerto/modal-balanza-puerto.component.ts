import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BalanzaPuertoService } from 'app/shared/servicios/puerto-logistica/balanza-puerto.service';

@Component({
  selector: 'app-modal-balanza-puerto',
  templateUrl: './modal-balanza-puerto.component.html',
  styleUrls: ['./modal-balanza-puerto.component.css']
})
export class ModalBalanzaPuertoComponent implements OnInit {

  @Input() item: any = null;

  public form: FormGroup;
  public guardando = false;
  public errorServidor: string = null;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private balanzaService: BalanzaPuertoService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      CodigoBalanza: [this.item?.CodigoBalanza || '', Validators.required],
      CodigoDispositivo: [this.item?.CodigoDispositivo || '', Validators.required],
      CentroId: [this.item?.CentroId || null],
      Administrativa: [this.item?.Administrativa || false],
      OffSetPlc: [this.item?.OffSetPlc ?? null],
      IntentosValidacion: [this.item?.IntentosValidacion ?? null]
    });
  }

  get titulo(): string {
    return this.item ? 'Modificar balanza' : 'Nueva balanza';
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
    const dto = { ...this.form.value, Id: this.item?.Id || null };
    const op$ = this.esEdicion
      ? this.balanzaService.modificar(dto)
      : this.balanzaService.crear(dto);

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
