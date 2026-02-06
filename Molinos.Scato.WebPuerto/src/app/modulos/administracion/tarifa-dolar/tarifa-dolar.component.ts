import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { TarifaDolarService } from '@ScatoServicios/tarifa-dolar.service';
import { TarifaDolar } from '@ScatoModels/administracion/tarifa-dolar';

@Component({
  selector: 'app-tarifa-dolar',
  templateUrl: './tarifa-dolar.component.html',
  styleUrls: ['./tarifa-dolar.component.css']
})
export class TarifaDolarComponent implements OnInit {

  public formulario: FormGroup;
  public tarifaDolar: TarifaDolar | null = null;
  public periodos: string[] = [];
  public estaCargando: boolean = false;
  public puedeEditar: boolean = false;
  public ultimaActualizacion: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private tarifaDolarService: TarifaDolarService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPeriodosDisponibles();
    this.preseleccionarPeriodoActual();
  }

  private inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      periodo: ['', Validators.required],
      cotizacion: [null, [Validators.required, Validators.min(0.001)]]
    });
  }

  private cargarPeriodosDisponibles(): void {
    this.estaCargando = true;
    this.tarifaDolarService.obtenerPeriodosDisponibles().subscribe(
      (periodos: string[]) => {
        this.periodos = periodos;
        this.estaCargando = false;
      },
      (error: any) => {
        console.error('Error cargando períodos:', error);
        this.confirmationDialogService.alertar('Error al cargar los períodos disponibles.', Tipoalerta.Error);
        this.estaCargando = false;
      }
    );
  }

  public preseleccionarPeriodoActual(): void {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const periodoActual = `${año}-${mes}`;
    
    this.formulario.patchValue({ periodo: periodoActual });
    this.onSeleccionarPeriodo();
  }

  public onSeleccionarPeriodo(): void {
    const periodoSeleccionado = this.formulario.get('periodo')?.value;
    
    if (!periodoSeleccionado) {
      this.tarifaDolar = null;
      this.formulario.patchValue({ cotizacion: null });
      this.actualizarEstadoEdicion();
      return;
    }

    this.estaCargando = true;
    this.tarifaDolarService.obtenerTarifaDolar(periodoSeleccionado).subscribe(
      (tarifa: any) => {
        this.tarifaDolar = {
          id: tarifa.Id || tarifa.id,
          periodo: tarifa.Periodo || tarifa.periodo,
          valorDolar: tarifa.ValorDolar || tarifa.valorDolar,
          fechaActualizacion: tarifa.FechaActualizacion || tarifa.fechaActualizacion
        };
        this.formulario.patchValue({
          cotizacion: tarifa.ValorDolar || tarifa.valorDolar
        });
        this.actualizarEstadoEdicion();
        this.estaCargando = false;
      },
      (error: any) => {
        if (error.status === 404) {
          this.tarifaDolar = null;
          this.formulario.patchValue({
            cotizacion: null
          });
          this.actualizarEstadoEdicion();
        } else {
          console.error('Error cargando tarifa:', error);
          this.confirmationDialogService.alertar('Error al cargar la tarifa.', Tipoalerta.Error);
        }
        this.estaCargando = false;
      }
    );
  }

  private actualizarEstadoEdicion(): void {
    const periodoSeleccionado = this.formulario.get('periodo')?.value;
    const puedeEditarPeriodo = this.validarPuedeEditarPeriodo(periodoSeleccionado);
    
    if (puedeEditarPeriodo) {
      this.formulario.get('cotizacion')?.enable();
      this.puedeEditar = true;
    } else {
      this.formulario.get('cotizacion')?.disable();
      this.puedeEditar = false;
    }

    if (this.tarifaDolar && this.tarifaDolar.fechaActualizacion) {
      const fecha = new Date(this.tarifaDolar.fechaActualizacion);
      this.ultimaActualizacion = `Última actualización al ${fecha.toLocaleDateString('es-ES')}`;
    } else {
      this.ultimaActualizacion = 'Sin registros';
    }
  }

  private validarPuedeEditarPeriodo(periodo: string): boolean {
    if (!periodo) return false;

    try {
      const periodoDate = this.tarifaDolarService.convertirPeriodoADate(periodo);
      const hoy = new Date();
      const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      
      console.log('Periodo seleccionado:', periodo);
      console.log('Periodo Date:', periodoDate);
      console.log('Mes Anterior permitido:', mesAnterior);
      console.log('¿Puede editar?:', periodoDate >= mesAnterior);
      
      return periodoDate >= mesAnterior;
    } catch (error) {
      console.error('Error validando período:', error);
      return false;
    }
  }

  public onGuardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const cotizacion = this.formulario.get('cotizacion')?.value;

    if (!cotizacion || cotizacion <= 0) {
      this.confirmationDialogService.alertar('Debe ingresar un valor en la tarifa', Tipoalerta.Error);
      return;
    }

    const periodo = this.formulario.get('periodo')?.value;
    const periodoFormato = this.formatearPeriodoParaMostrar(periodo);

    this.confirmationDialogService.confirm(
      'Guardar Tarifa',
      `¿Está seguro que desea guardar la tarifa de $${cotizacion} para el período ${periodoFormato}?`,
      'Guardar',
      'Cancelar',
      null,
      null,
      Tipoalerta.Warning
    ).then((confirmado) => {
      if (confirmado) {
        this.ejecutarGuardado(periodo, cotizacion);
      }
    });
  }

  private ejecutarGuardado(periodo: string, cotizacion: number): void {
    this.estaCargando = true;

    this.tarifaDolarService.guardarTarifaDolar(periodo, cotizacion).subscribe(
      (respuesta: any) => {
        this.estaCargando = false;
        this.confirmationDialogService.alertar(
          'Tarifa registrada correctamente.',
          Tipoalerta.Success
        );
        this.onSeleccionarPeriodo();
      },
      (error: any) => {
        this.estaCargando = false;
        console.error('Error guardando tarifa:', error);
        const mensaje = error.error?.message || error.error || 'Error al guardar la tarifa.';
        this.confirmationDialogService.alertar(mensaje, Tipoalerta.Error);
      }
    );
  }

  private formatearPeriodoParaMostrar(periodo: string): string {
    try {
      const periodoDate = this.tarifaDolarService.convertirPeriodoADate(periodo);
      return periodoDate.toLocaleDateString('es-ES', { month: '2-digit', year: 'numeric' });
    } catch {
      return periodo;
    }
  }

  public onCancelar(): void {
    this.router.navigate(['/administracion']);
  }

  public onVolver(): void {
    this.router.navigate(['/administracion']);
  }
}