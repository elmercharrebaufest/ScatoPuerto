import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Exportador } from '@ScatoModels/exportador';
import { NominacionExportadores } from '@ScatoModels/programa-embarque/nominacion-exportadores';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { isThursday } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionDatoTecnicoRegistroService } from './nominacion-recibos.services';

@Component({
  selector: 'app-nominacion-recibos',
  templateUrl: './nominacion-recibos.component.html',
  styleUrls: ['./nominacion-recibos.component.css'],
})
export class NominacionRecibosComponent implements OnInit {
  private _nominacionParametros: NominacionParametros = null;
  private destroy$ = new Subject();
  public formRecibos: FormGroup;
  public exportadores: Exportador[] = [];
  public formatos: string[];
  public unidades: string[];
  public guardando: boolean = false;
  public nominacionId: number = 0;
  public mensajeRecibos: string = '';
  public cargandoRecibos: boolean = false;

  constructor(
    private nominacionService: NominacionService,
    private programaEmbarqueService: ProgramaEmbarqueService,
    private confirmationDialogService: ConfirmationDialogService,
    private fb: FormBuilder,
    private nominacionDatoTecnicoRegistroService: NominacionDatoTecnicoRegistroService
  ) {
    this.actualizarListaExportadores();
    this.inicializarFormNuevo();
    this.cargarListasRecibo();
    this.asignarNominacionParametros();
  }

  ngOnInit(): void {}

  agregarRecibo() {
    this.recibosFormArray.push(
      this.fb.group({
        id: [''],
        numeroRecibo: ['0'],
        exportador: [''],
        formato: [''],
        unidad: [''],
        cantidad: ['0'],
        ajuste: [''],
        puertoDeCarga: [''],
        puertoDeDescarga: [''],
        descripcionesBienes: [''],
        recibosPorDia: [false],
        mostrarDestinos: [false],
        mostrarBodegas: [false],
      })
    );
    this.recibosFormArray['controls'].forEach((item) => {
      const formulario: FormGroup = item as FormGroup;
      const recibosPorDia = item['controls'].recibosPorDia.value;
      const mostrarDestinos = item['controls'].mostrarDestinos.value;
      this.onActivarDischargePort(formulario, mostrarDestinos);
    });
  }

  get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  set nominacionParametros(value: NominacionParametros) {
    this._nominacionParametros = value;
  }

  public crearObjectoRecibos(): NominacionRecibo[] {
    let nominacionRecibo: NominacionRecibo[] = [];
    const recibos = this.formRecibos.controls['recibos'].value;
    if (recibos != null && recibos.length > 0) nominacionRecibo = recibos;
    return nominacionRecibo;
  }
  public validarCreacionRecibo(): boolean {
    let bValidacion: boolean = true;
    this.recibosFormArray['controls'].forEach((item) => {
      const exportador = item['controls'].exportador.value;
      const formato = item['controls'].formato.value;
      if (exportador == '' || formato == '') {
        bValidacion = false;
      }
    });
    if (!bValidacion)
      this.confirmationDialogService.confirm(
        'Registro Nominación - Recibos',
        'Debe completar ingresar el cargador y formato.',
        'Aceptar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
    return bValidacion;
  }
  get recibosFormArray(): FormArray {
    return this.formRecibos.get('recibos') as FormArray;
  }
  private actualizarListaExportadores() {
    this.nominacionService.NominacionExportadores.subscribe(
      (data: NominacionExportadores) => {
        if (data != null && data.actualizar) {
          this.nominacionDatoTecnicoRegistroService
            .listarExportadores()
            .pipe(takeUntil(this.destroy$))
            .subscribe((exportadores: Exportador[]) => {
              this.exportadores = exportadores;
              this.exportadores = this.exportadores.filter(
                (expoData: Exportador) => {
                  return data.listaExportadores.some(
                    (expoFilter: Exportador) => {
                      return expoData.id == expoFilter.id;
                    }
                  );
                }
              );
            });
        }
      }
    );
  }
  private inicializarFormEdicion(dataRecibos: NominacionRecibo[]) {
    this.inicializarFormNuevo();
    if (dataRecibos != null) {
      dataRecibos.forEach((element) => {
        this.recibosFormArray.push(
          this.fb.group({
            id: element == null ? 0 : element.id,
            numeroRecibo: element == null ? 0 : element.numeroRecibo,
            exportador: element == null ? '' : element.exportador,
            formato: element == null ? '' : element.formato,
            unidad: element == null ? '' : element.unidad,
            cantidad: element == null ? 0 : element.cantidad,
            ajuste: element == null ? '' : element.ajuste,
            puertoDeCarga: element == null ? '' : element.puertoDeCarga,
            puertoDeDescarga: element == null ? '' : element.puertoDeDescarga,
            descripcionesBienes:
              element == null ? '' : element.descripcionesBienes,
            recibosPorDia: [
              {
                value:
                  element == null
                    ? false
                    : element.recibosPorDia == true
                    ? true
                    : false,
                disabled: false,
              },
            ],
            mostrarDestinos: [
              {
                value:
                  element == null
                    ? false
                    : element.mostrarDestinos == true
                    ? true
                    : false,
                disabled: false,
              },
            ],
            mostrarBodegas: [
              {
                value:
                  element == null
                    ? false
                    : element.mostrarBodegas == true
                    ? true
                    : false,
                disabled: false,
              },
            ],
          })
        );
      });
      this.recibosFormArray['controls'].forEach((item) => {
        const formulario: FormGroup = item as FormGroup;
        const mostrarDestinos = item['controls'].mostrarDestinos.value;
        this.onActivarDischargePort(formulario, mostrarDestinos);
      });
    }
  }

  private asignarNominacionParametros() {
    this.nominacionService.NominacionParametros.subscribe((parametro) => {
      if (parametro != null) {
        const nominacionParametos: NominacionParametros = {
          nominacion_Id: parametro.nominacion_Id,
          actualizarDatoTecnico: parametro.actualizarDatoTecnico,
          actualizarRecibos: parametro.actualizarRecibos,
          actualizarIntervenciones: parametro.actualizarIntervenciones,
          nominacion: parametro.nominacion,
        };
        this.nominacionParametros = nominacionParametos;
        this.nominacionId = this.nominacionParametros.nominacion_Id;
        if (nominacionParametos.actualizarDatoTecnico) {
          if (nominacionParametos.nominacion != null)
            this.inicializarFormEdicion(
              nominacionParametos.nominacion.nominacionRecibo
            );
        }
      }
    });
  }

  private cargarFormulario() {
    this.mensajeRecibos = Mensajes.cargando;
    this.cargandoRecibos = true;
    this.nominacionService
      .obtenerNominacion(this.nominacionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.cargandoRecibos = false;
        this.inicializarFormEdicion(data.nominacionRecibo);
      });
  }

  onGuardarRecibos() {
    if (this.validarCreacionRecibo()) {
      this.mensajeRecibos = Mensajes.grabando;
      this.cargandoRecibos = true;
      this.programaEmbarqueService
        .registrarNominacionRecibo(
          this.nominacionId,
          this.formRecibos.controls['recibos'].value
        )
        .subscribe((res: any) => {
          this.confirmationDialogService.confirm(
            'Registro Nominación - Recibos',
            'Recibos guardados correctamente.',
            'Aceptar',
            '',
            null,
            null,
            Tipoalerta.Success
          );
          this.cargandoRecibos = false;
          this.cargarFormulario();
          this.nominacionService.ActualizarAuditoria = true;
        });
    }
  }

  onCancelarRecibos() {
    const nominacionId = this._nominacionParametros.nominacion.id;
    this.inicializarFormNuevo();
    this.cargarFormulario();
  }

  cargarListasRecibo() {
    this.cargandoRecibos = true;
    this.mensajeRecibos = Mensajes.listados;
    this.nominacionDatoTecnicoRegistroService
      .listarExportadores()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Exportador[]) => {
        this.exportadores = data;
        this.formatos =
          this.nominacionDatoTecnicoRegistroService.listarFormatos();
        this.unidades =
          this.nominacionDatoTecnicoRegistroService.listarUnidades();
        this.cargandoRecibos = false;
      });
  }

  onActivarDischargePort(recibo: FormGroup, estado: boolean) {
    if (!estado) {
      recibo.controls['puertoDeDescarga'].disable();
      recibo.controls['puertoDeDescarga'].setValue('');
    } else {
      recibo.controls['puertoDeDescarga'].enable();
    }
  }

  onEliminarRecibo(i: number, recibo) {
    (this.formRecibos.controls['recibos'] as FormArray).removeAt(i);
  }
  getNumeroRecibo(recibo) {
    return recibo.controls.numeroRecibo.value;
  }
  public inicializarFormNuevo() {
    this.formRecibos = this.fb.group({
      recibos: this.fb.array([]),
    });
  }

  compareFields(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  public numberOnly(event): boolean {
    var charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  setCantidadNominacionRecibo(i: number): void {
    const cantidadFormControl = this.recibosFormArray
      .at(i)
      .get('cantidad') as FormControl;
    const unidadFormControl = this.recibosFormArray
      .at(i)
      .get('unidad') as FormControl;
    if (unidadFormControl.value == 'Kg') {
      cantidadFormControl.setValue(
        parseFloat(cantidadFormControl.value).toFixed(0)
      );
    } else {
      cantidadFormControl.setValue(
        parseFloat(cantidadFormControl.value).toFixed(3)
      );
    }
  }
}
enum Mensajes {
  cargando = "Cargando información de recibos. Por favor, espere...",
  grabando = "Guardando información de recibos. Por favor, espere...",
  listados = "Cargando listados de recibos. Por favor, espere...",
}
