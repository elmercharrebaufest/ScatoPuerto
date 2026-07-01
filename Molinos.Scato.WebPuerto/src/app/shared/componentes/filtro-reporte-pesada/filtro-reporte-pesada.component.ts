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
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    this.filtroForm = this.fb.group({
      FechaDesde: [hace7dias.toISOString().substring(0, 10)],
      FechaHasta: [hoy.toISOString().substring(0, 10)],
      Exportador_Id: [null],
      Material_Id: [null]
    });
  }

  aplicarFiltro(): void {
    this.filtrar.emit(this.filtroForm.value);
  }

  limpiarFiltro(): void {
    this.filtroForm.reset();
    this.limpiar.emit();
  }
}
