import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DetalleEmbarqueAFacturar, EstadoEmbarque } from '@ScatoModels/administracion/detalle-embarque-a-facturar';

const ESTADOS: EstadoEmbarque[] = [
  { id: 1, descripcion: 'LineUp' },
  { id: 2, descripcion: 'Operaciones' },
  { id: 3, descripcion: 'Calidad' },
  { id: 4, descripcion: 'A Facturar' },
  { id: 5, descripcion: 'Aplicado' },
  { id: 6, descripcion: 'Facturado' }
];

interface Estado {
  id: number;
  nombre: string;
  fecha: Date | null;
}

@Component({
  selector: 'app-progreso-embarcacion',
  templateUrl: './progreso-embarcacion.component.html',
  styleUrls: ['./progreso-embarcacion.component.css']
})
export class ProgresoEmbarcacionComponent implements OnInit, OnChanges {

  @Input() detalle: DetalleEmbarqueAFacturar;
  @Input() rutaVolver: any[];
  @Input() estados: EstadoEmbarque[] = [];

  @Output() generarAlerta = new EventEmitter<void>();

  public estadosCalculados: Estado[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.calcularPasos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.detalle || changes.estados) {
      this.calcularPasos();
    }
  }

  private calcularPasos(): void {
    const estadosAUsar = this.estados && this.estados.length > 0
      ? this.estados
      : ESTADOS;

    const estadosOrdenados = [...estadosAUsar].sort((a, b) => a.id - b.id);

    this.estadosCalculados = estadosOrdenados.map(estado => ({
      id: estado.id,
      nombre: estado.descripcion,
      fecha: this.obtenerFechaPorEstado(estado.id)
    }));
  }

  private obtenerFechaPorEstado(estadoId: number): Date | null {
    if (!this.detalle) return null;

    switch (estadoId) {
      case 1: return this.detalle.fechaLineUp;
      case 2: return this.detalle.fechaOperaciones;
      case 3: return this.detalle.fechaCalidad;
      case 4: return this.detalle.fechaZarpado;
      case 5: return this.detalle.fechaAplicado;
      case 6: return this.detalle.fechaFacturado;
      default: return null;
    }
  }

  public onVolver(): void {
    if (this.rutaVolver) {
      this.router.navigate(this.rutaVolver);
    }
  }

  public onGenerarAlerta(): void {
    this.generarAlerta.emit();
  }

  getEstadoSrc(stepId: number): string {
    if (this.detalle == null || this.estadosCalculados.length === 0) {
      return "assets/administracion/estado-a-transitar.svg";
    }

    const estadoActualNombre = this.detalle.estado?.toLowerCase();
    const currentIndex = this.estadosCalculados.findIndex(
      e => e.nombre.toLowerCase() === estadoActualNombre
    );
    const stepIndex = this.estadosCalculados.findIndex(e => e.id === stepId);

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
}