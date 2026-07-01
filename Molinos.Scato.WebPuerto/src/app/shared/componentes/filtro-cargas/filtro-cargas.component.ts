import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filtro-cargas',
  templateUrl: './filtro-cargas.component.html',
  styleUrls: ['./filtro-cargas.component.css']
})
export class FiltroCargasComponent implements OnInit {

  @Input() exportadores: any[] = [];
  @Input() materiales: any[] = [];
  @Output() filtrar = new EventEmitter<any>();
  @Output() limpiar = new EventEmitter<void>();

  public filtroForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      Vapor: [''],
      Bodega: [''],
      Exportador_Id: [null],
      Material_Id: [null],
      FechaDesde: [''],
      FechaHasta: ['']
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
