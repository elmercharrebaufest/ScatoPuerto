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
  
  @Input() estados: any[] = [
    { id: 1, nombre: 'Lineup' },
    { id: 2, nombre: 'Operaciones' },
    { id: 3, nombre: 'Calidad' },
    { id: 4, nombre: 'A Facturar' },
    { id: 5, nombre: 'Aplicado' },
    { id: 6, nombre: 'Facturado' }
  ];

  @Output() generarAlerta = new EventEmitter<void>();

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

  getEstadoSrc(stepId: number) {
    if (this.detalle == null || !this.estados) return;

    const estadoActualNombre = this.detalle.estado.toLowerCase();

    const currentIndex = this.estados.findIndex(e => e.nombre.toLowerCase() === estadoActualNombre);
    const stepIndex = this.estados.findIndex(e => e.id === stepId);

    if (currentIndex === -1 || stepIndex === -1) {
       return "assets/administracion/estado-a-transitar.svg";
    }

    if (currentIndex === stepIndex) {
      return "assets/administracion/estado-actual.svg";
    } else if (currentIndex > stepIndex) {
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
        { id: 5, nombre: 'Aplicado', fecha: null },
        { id: 6, nombre: 'Facturado', fecha: this.detalle?.fechaFacturado }
    ];
  }
}