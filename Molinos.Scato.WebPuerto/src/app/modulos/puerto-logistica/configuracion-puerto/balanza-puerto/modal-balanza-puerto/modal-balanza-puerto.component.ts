import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BalanzaPuertoService } from 'app/shared/servicios/puerto-logistica/balanza-puerto.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

@Component({
  selector: 'app-modal-balanza-puerto',
  templateUrl: './modal-balanza-puerto.component.html',
  styleUrls: ['./modal-balanza-puerto.component.css']
})
export class ModalBalanzaPuertoComponent implements OnInit {

  @Input() item: any = null;

  public form: FormGroup;
  public guardando = false;
  public codigosDispositivos: Array<{ codigo: string; descripcion: string }> = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private balanzaService: BalanzaPuertoService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      CodigoBalanza: [this.item?.codigoBalanza || '', Validators.required],
      CodigoDispositivo: [this.item?.codigoDispositivo ?? null, Validators.required],
      Administrativa: [this.item?.administrativa || false],
      UltimaValidacion: [this.item?.ultimaValidacion ?? 0, [Validators.required, Validators.min(0)]],
      OffSetPlc: [this.item?.offSetPlc ?? 0, [Validators.required, Validators.min(0)]],
      IntentosValidacion: [this.item?.intentosValidacion ?? 1, [Validators.required, Validators.min(1)]]
    });

    this.cargarCodigosDispositivos();
  }

  private cargarCodigosDispositivos(): void {
    this.balanzaService.listarBalanzasDispositivos().subscribe(
      res => this.codigosDispositivos = res || [],
      () => this.codigosDispositivos = []
    );
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
    const dto = { ...this.form.value, Id: this.item?.id || null };
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
