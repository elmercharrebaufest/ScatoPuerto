import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filtro-reporte-pesada',
  templateUrl: './filtro-reporte-pesada.component.html',
  styleUrls: ['./filtro-reporte-pesada.component.css']
})
export class FiltroReportePesadaComponent implements OnInit {

  @Input() exportadores: any[] = [];
  @Input() materiales: any[] = [];
  @Output() filtrar = new EventEmitter<any>();
  @Output() limpiar = new EventEmitter<void>();

  public filtroForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const hoy = this.getFechaActual();

    this.filtroForm = this.fb.group({
      FechaDesde: [hoy],
      FechaHasta: [hoy],
      Exportador_Id: [null],
      Material_Id: [null]
    });
  }

  get minFechaHasta(): string {
    return this.filtroForm?.get('FechaDesde')?.value;
  }

  get maxFechaDesde(): string {
    return this.filtroForm?.get('FechaHasta')?.value;
  }

  onFechaDesdeChange(value: string): void {
    const fechaHasta = this.filtroForm.get('FechaHasta')?.value;
    if (fechaHasta && value && fechaHasta < value) {
      this.filtroForm.patchValue({ FechaHasta: value });
    }
  }

  onFechaHastaChange(value: string): void {
    const fechaDesde = this.filtroForm.get('FechaDesde')?.value;
    if (fechaDesde && value && fechaDesde > value) {
      this.filtroForm.patchValue({ FechaDesde: value });
    }
  }

  aplicarFiltro(): void {
    this.filtrar.emit(this.filtroForm.value);
  }

  limpiarFiltro(): void {
    const hoy = this.getFechaActual();
    this.filtroForm.reset({
      FechaDesde: hoy,
      FechaHasta: hoy,
      Exportador_Id: null,
      Material_Id: null
    });
    this.limpiar.emit();
  }

  private getFechaActual(): string {
    return new Date().toISOString().substring(0, 10);
  }
}
