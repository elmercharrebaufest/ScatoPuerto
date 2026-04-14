import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
      periodo: [''],
      cotizacion: [{ value: '', disabled: true }]
    });
  }

  public preseleccionarPeriodoActual(): void {
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const month = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const periodoActual = `${year}-${month}`;
    
    this.formulario.patchValue({ periodo: periodoActual });
    this.onSeleccionarPeriodo();
  }

  public cargarPeriodosDisponibles(): void {
    this.estaCargando = true;
    this.tarifaDolarService.obtenerPeriodosDisponibles().subscribe(
      (periodos: string[]) => {
        this.periodos = periodos;
        this.estaCargando = false;
      },
      (error) => {
        console.error('Error al cargar periodos:', error);
        this.estaCargando = false;
      }
    );
  }

  // Validar que el período sea igual o posterior al MES ANTERIOR
  private esPeriodoValidoParaEdicion(periodo: string): boolean {
    if (!periodo) return false;
    
    const fechaActual = new Date();
    const yearActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1; // getMonth() es 0-11
    
    const partes = periodo.split('-');
    if (partes.length !== 2) return false;
    
    const yearPeriodo = parseInt(partes[0], 10);
    const mesPeriodo = parseInt(partes[1], 10);
    
    const mesesAbsolutosActual = (yearActual * 12) + mesActual;
    const mesesAbsolutosPeriodo = (yearPeriodo * 12) + mesPeriodo;
    
    return mesesAbsolutosPeriodo >= (mesesAbsolutosActual - 1);
  }

  public onSeleccionarPeriodo(): void {
    const periodoSeleccionado = this.formulario.get('periodo')?.value;
    
    if (!periodoSeleccionado) {
      this.tarifaDolar = null;
      this.formulario.patchValue({ cotizacion: null });
      this.formulario.get('cotizacion')?.disable();
      this.puedeEditar = false;
      return;
    }

    const esValido = this.esPeriodoValidoParaEdicion(periodoSeleccionado);

    this.estaCargando = true;
    
    this.tarifaDolarService.obtenerTarifaDolar(periodoSeleccionado).subscribe(
      (tarifa: TarifaDolar) => {
        this.tarifaDolar = tarifa;
        this.actualizarFormularioConTarifa(tarifa, esValido);
        this.estaCargando = false;
      },
      (error) => {
        console.error('Error al obtener la tarifa:', error);
        this.tarifaDolar = null;
        this.formulario.patchValue({ cotizacion: null });
        
        this.puedeEditar = esValido;
        if (esValido) {
            this.formulario.get('cotizacion')?.enable();
        } else {
            this.formulario.get('cotizacion')?.disable();
        }
        
        this.estaCargando = false;
      }
    );
  }

  private actualizarFormularioConTarifa(tarifa: TarifaDolar, esValido: boolean): void {
    if (tarifa && tarifa.id > 0) {
      this.formulario.patchValue({
        cotizacion: tarifa.valorDolar
      });
    } else {
      this.formulario.patchValue({ cotizacion: null });
    }

    this.puedeEditar = esValido;
    if (esValido) {
        this.formulario.get('cotizacion')?.enable();
    } else {
        this.formulario.get('cotizacion')?.disable();
    }
  }

  public onGuardar(): void {
    const periodoRaw = this.formulario.get('periodo')?.value;
    const cotizacionRaw = this.formulario.get('cotizacion')?.value;
    
    if (!periodoRaw) {
      this.confirmationDialogService.alertar('Debe seleccionar un período.', Tipoalerta.Warning);
      return;
    }

    let cotizacion = 0;
    if (cotizacionRaw !== null && cotizacionRaw !== undefined && cotizacionRaw !== '') {
        cotizacion = Number(cotizacionRaw.toString().replace(',', '.'));
    }

    if (cotizacionRaw === null || cotizacionRaw === '' || isNaN(cotizacion) || cotizacion <= 0) {
      this.confirmationDialogService.alertar('Debe ingresar un valor en la tarifa', Tipoalerta.Error);
      return;
    }

    const periodoFormato = this.formatearPeriodoParaMostrar(periodoRaw);

    this.confirmationDialogService.confirm(
      'Confirmar Tarifa',
      `¿Está seguro que desea registrar la tarifa de $${cotizacion} para el período ${periodoFormato}?`,
      'Guardar',
      'Cancelar',
      null,
      null,
      Tipoalerta.Warning
    ).then((confirmado) => {
      if (confirmado) {
        this.ejecutarGuardado(periodoRaw, cotizacion);
      }
    });
  }

  private ejecutarGuardado(periodo: string, cotizacion: number): void {
    this.estaCargando = true;
    
    this.tarifaDolarService.guardarTarifaDolar(periodo, cotizacion).subscribe(
      (respuesta: any) => {
        this.estaCargando = false;
        this.confirmationDialogService.exito("Tarifario registrado correctamente.");
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
      return periodoDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    } catch (e) {
      return periodo;
    }
  }

  public onCancelar(): void {
    this.router.navigate(['/acuerdos']);
  }

  public onVolver(): void {
    this.router.navigate(['/acuerdos']);
  }

  public numberWithTwoDecimals(event: any, value: string): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    const target = event.target as HTMLInputElement;
    
    if (charCode >= 48 && charCode <= 57) {
      if (value.includes('.') || value.includes(',')) {
        const separatorIndex = value.indexOf('.') !== -1 ? value.indexOf('.') : value.indexOf(',');
        const decimalPart = value.substring(separatorIndex + 1);
        
        if (decimalPart.length >= 2 && target.selectionStart !== null && target.selectionStart > separatorIndex) {
          if (target.selectionStart !== target.selectionEnd) {
              return true;
          }
          return false;
        }
      }
      return true;
    }
    
    if (charCode === 44 || charCode === 46) {
      if (value.includes('.') || value.includes(',')) {
        return false;
      }
      return true;
    }
    
    return false;
  }
}