import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export type TipoCarga = 'inicio' | 'fin';

function objetoSeleccionadoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return { requerido: true };
    if (typeof val === 'string') return { noEncontrado: true };
    return null;
  };
}

@Component({
  selector: 'app-modal-crear-carga',
  templateUrl: './modal-crear-carga.component.html',
  styleUrls: ['./modal-crear-carga.component.css']
})
export class ModalCrearCargaComponent implements OnInit {

  @Input() tipo: TipoCarga = 'inicio';
  @Input() balanzasPuerto: string[] = [];

  public form: FormGroup;
  public guardando = false;
  public errorMensaje = '';

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private operacionesService: OperacionesPuertoService
  ) { }

  ngOnInit(): void {
    const base: any = {
      NumeroBalanza: ['', Validators.required],
      Vapor: [null, [Validators.required, objetoSeleccionadoValidator()]],
      Bodega: [null, [Validators.required, objetoSeleccionadoValidator()]],
      Exportador: [null, [Validators.required, objetoSeleccionadoValidator()]],
      Destino: [null, [Validators.required, objetoSeleccionadoValidator()]],
      Material: [null, [Validators.required, objetoSeleccionadoValidator()]],
      PesoProgramado: [0, [Validators.required, Validators.min(0)]],
      Fecha: [this.aInputDateTime(new Date()), Validators.required]
    };
    if (this.tipo === 'fin') {
      base.ToneladasAW = [0, [Validators.required, Validators.min(0)]];
      base.FechaInicio = [this.aInputDateTime(new Date()), Validators.required];
      base.CargaOpuesta_Id = [null, [Validators.required, Validators.min(1)]];
    }
    this.form = this.fb.group(base);
  }

  get titulo(): string {
    return this.tipo === 'inicio' ? 'Crear Pesada de Inicio' : 'Crear Pesada de Fin';
  }

  searchVapor = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarVapores(term))
  )

  searchBodega = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarBodegas(term))
  )

  searchExportador = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarExportadores(term))
  )

  searchDestino = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarDestinos(term))
  )

  searchMaterial = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarMaterialesPuerto(term))
  )

  formatterNombre = (item: any) => item?.Nombre || item?.nombre || '';
  formatterMaterial = (item: any) => item?.Descripcion || item?.descripcion || '';

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    this.errorMensaje = '';
    const value = this.form.value;
    const dto: any = {
      NumeroBalanza: value.NumeroBalanza,
      Vapor: value.Vapor?.Nombre || value.Vapor?.nombre || '',
      VaporId: value.Vapor?.Id || value.Vapor?.id || 0,
      Bodega: value.Bodega?.Nombre || value.Bodega?.nombre || '',
      BodegaId: value.Bodega?.Id || value.Bodega?.id || 0,
      Exportador: value.Exportador?.Nombre || value.Exportador?.nombre || '',
      ExportadorId: value.Exportador?.Id || value.Exportador?.id || 0,
      Destino: value.Destino?.Nombre || value.Destino?.nombre || '',
      DestinoId: value.Destino?.Id || value.Destino?.id || 0,
      Material: value.Material?.Descripcion || value.Material?.descripcion || '',
      MaterialId: value.Material?.Id || value.Material?.id || 0,
      PesoProgramado: value.PesoProgramado,
      Fecha: value.Fecha,
      Tipo: this.tipo,
      EnviadoASap: false,
      ToneladasAW: this.tipo === 'fin' ? value.ToneladasAW : 0
    };
    if (this.tipo === 'fin') {
      dto.FechaInicio = value.FechaInicio;
      dto.CargaOpuesta_Id = value.CargaOpuesta_Id;
      dto.CargaOpuesta_NumeroBalanza = value.NumeroBalanza;
    }
    this.operacionesService.crearCarga(dto).subscribe(
      () => {
        this.guardando = false;
        this.activeModal.close(true);
      },
      err => {
        this.guardando = false;
        this.errorMensaje = this.extraerError(err);
      }
    );
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }

  private aInputDateTime(fecha: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
  }

  private extraerError(err: any): string {
    if (err?.error) {
      if (typeof err.error === 'string') return err.error;
      if (err.error.Message) return err.error.Message;
      const values = Object.keys(err.error).map(k => err.error[k]);
      if (values.length) return values.join(' | ');
    }
    return 'Ocurrió un error al crear la carga.';
  }
}

