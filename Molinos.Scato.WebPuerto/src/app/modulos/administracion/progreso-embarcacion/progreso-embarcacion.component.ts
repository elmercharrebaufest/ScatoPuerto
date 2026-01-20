import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';

@Component({
  selector: 'app-progreso-embarcacion',
  templateUrl: './progreso-embarcacion.component.html',
  styleUrls: ['./progreso-embarcacion.component.css']
})
export class ProgresoEmbarcacionComponent implements OnInit {

  @Input() detalle: DetalleEmbarqueAFacturar;
  @Input() rutaVolver: any[];
  @Output() generarAlerta = new EventEmitter<void>();

  public estados = [
    { id: 1, nombre: 'Lineup' },
    { id: 2, nombre: 'Operaciones' },
    { id: 3, nombre: 'Calidad' },
    { id: 4, nombre: 'A Facturar' },
    { id: 5, nombre: 'Facturado' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  public onVolver(): void {
    if (this.rutaVolver) {
      this.router.navigate(this.rutaVolver);
    }
  }

  public onGenerarAlerta(): void {
    this.generarAlerta.emit();
  }

  getEstadoSrc(estadoId: number) {
    if (this.detalle == null) return;
    const estadoIdActual = this.estados.find(e => e.nombre.toLowerCase() === this.detalle.estado.toLowerCase()).id;
    if (estadoIdActual == estadoId) {
      return "assets/administracion/estado-actual.svg";
    }
    else if (estadoIdActual > estadoId) {
      return "assets/administracion/estado-transitado.svg";
    } else {
      return "assets/administracion/estado-a-transitar.svg";
    }
  }

  get pasosVisuales() {
    return [
        { id: 1, nombre: 'LineUp', fecha: this.detalle?.fechaLineUp },
        { id: 2, nombre: 'Operaciones', fecha: this.detalle?.fechaOperaciones },
        { id: 3, nombre: 'Calidad', fecha: this.detalle?.fechaCalidad },
        { id: 4, nombre: 'A Facturar', fecha: this.detalle?.fechaZarpado },
        { id: 5, nombre: 'Facturado', fecha: this.detalle?.fechaFacturado }
    ];
  }
}