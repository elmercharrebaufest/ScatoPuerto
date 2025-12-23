import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PlanillaDeTurnos } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';

@Component({
  selector: 'app-turnos-recibidores',
  templateUrl: './turnos-recibidores.component.html',
  styleUrls: ['./turnos-recibidores.component.css'],
})
export class TurnosRecibidoresComponent implements OnInit, OnChanges {
  @Input() esLiquido: boolean = false;
  cerrarTurno: boolean = true;

  formTurnos!: FormGroup;
  planillasTurnos: PlanillaDeTurnos[] = [];

  constructor(
    private fb: FormBuilder,
    private procesoService: DatosEmbarquesProcesoService
  ) {}

  // ---------------------------------
  // INIT
  // ---------------------------------
  ngOnInit(): void {
    this.initForm();
    /*this.procesoService.moduloDeCarga$.subscribe((modulo) => {
      if (!modulo) return;
    
      this.cargarDesdeServicio();
    });*/
    this.procesoService.moduloDeCarga$.subscribe((modulo) => {
      if (!modulo) return;

      const planillas = modulo.moduloDeCargaPlanillaDeTurnos || [];

      // 🔥 RESET TOTAL (esto es lo que faltaba)
      this.formTurnos.reset();
      this.dias.clear();

      this.planillasTurnos = [...planillas];
      this.cargarPlanillasEnForm(this.planillasTurnos);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.esLiquido && !changes.esLiquido.firstChange) {
      // No se filtra data, solo UI
      console.log('Cambio esLiquido:', changes.esLiquido.currentValue);
    }
  }

  cerrarReabrirTurno(turnoForm: FormGroup): void {
    const estadoActual = turnoForm.get('cerrado')?.value;
    turnoForm.get('cerrado')?.setValue(!estadoActual);
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---------------------------------
  // FORM BASE
  // ---------------------------------
  initForm(): void {
    this.formTurnos = this.fb.group({
      dias: this.fb.array([]),
    });
  }

  get dias(): FormArray {
    return this.formTurnos.get('dias') as FormArray;
  }

  // ---------------------------------
  // HELPERS FECHA
  // ---------------------------------
  normalizarFecha(fecha: string): Date | null {
    if (!fecha) return null;
    return new Date(fecha.replace(' ', 'T'));
  }

  formatearFechaFront(fecha: Date): string {
    if (!fecha) return '';

    const d = new Date(fecha);

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();

    return `${dia}-${mes}-${anio}`;
  }

  // ---------------------------------
  // BUILDERS
  // ---------------------------------
  buildDia(fecha: Date): FormGroup {
    return this.fb.group({
      fecha, // YYYY-MM-DD
      turnos: this.fb.array([]),
    });
  }

  buildTurno(planilla: PlanillaDeTurnos): FormGroup {
    return this.fb.group({
      id: planilla.id,
      fecha: this.normalizarFecha(planilla.fecha), // 👈 FECHA DEL TURNO
      turnoPuerto: planilla.turnoPuerto,
      cerrado: planilla.cerrado,
      enviado: planilla.enviado,
      guardadoPorRecibidor: planilla.guardadoPorRecibidor,
      guardadoPorTablerista: planilla.guardadoPorTablerista,
      planilla, // referencia completa
    });
  }

  cargarPlanillasEnForm(planillas: PlanillaDeTurnos[]): void {
    this.dias.clear();

    planillas.forEach((planilla) => {
      const fechaDia = this.normalizarFecha(planilla.fecha);
      if (!fechaDia) return;

      let diaForm = this.dias.controls.find((d) => {
        const f = d.value.fecha as Date;
        return f?.getTime() === fechaDia.getTime();
      }) as FormGroup;

      if (!diaForm) {
        diaForm = this.buildDia(fechaDia);
        this.dias.push(diaForm);
      }

      (diaForm.get('turnos') as FormArray).push(this.buildTurno(planilla));
    });
  }

  // ---------------------------------
  // HELPERS HTML
  // ---------------------------------
  getTurnos(d: number): FormArray {
    return this.dias.at(d).get('turnos') as FormArray;
  }

  getRowSpanDia(d: number): number {
    return this.getTurnos(d).length + 1;
  }

  tieneLineas(turnoForm: FormGroup): boolean {
    const planilla = turnoForm.get('planilla')?.value;

    return (
      (planilla?.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length ?? 0) >
        0 ||
      (planilla?.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length ?? 0) > 0
    );
  }
}
