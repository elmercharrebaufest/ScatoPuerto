import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export type FiltroCargasModo = 'embarques' | 'embarques-por-buques';

@Component({
  selector: 'app-filtro-cargas',
  templateUrl: './filtro-cargas.component.html',
  styleUrls: ['./filtro-cargas.component.css']
})
export class FiltroCargasComponent implements OnInit {

  @Input() exportadores: any[] = [];
  @Input() materiales: any[] = [];
  @Input() modo: FiltroCargasModo = 'embarques-por-buques';
  @Output() filtrar = new EventEmitter<any>();
  @Output() limpiar = new EventEmitter<void>();

  public filtroForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.modo === 'embarques') {
      this.filtroForm = this.fb.group({
        NumeroBalanza: [''],
        Id: [null],
        VaporDesc: [''],
        BodegaDesc: [''],
        DestinoDesc: [''],
        ExportadorDesc: [''],
        MaterialDesc: [''],
        FechaDesde: [''],
        FechaHasta: ['']
      });
    } else {
      this.filtroForm = this.fb.group({
        Vapor: [''],
        Bodega: [''],
        Exportador_Id: [null],
        Material_Id: [null],
        FechaDesde: [''],
        FechaHasta: ['']
      });
    }
  }

  aplicarFiltro(): void {
    this.filtrar.emit(this.filtroForm.value);
  }

  limpiarFiltro(): void {
    this.filtroForm.reset();
    this.limpiar.emit();
  }
}
