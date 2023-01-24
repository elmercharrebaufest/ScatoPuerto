import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Auditoria } from '@ScatoModels/programa-embarque/auditoria';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { NominacionDatoTecnico } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico';
import { NominacionDetalleIntervencion } from '@ScatoModels/programa-embarque/nominacion-detalle-intervencion';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { StringifyOptions } from 'querystring';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionDatoTecnicoComponent } from '../nominacion-dato-tecnico/nominacion-dato-tecnico.component';
import { NominacionIntervencionesComponent } from '../nominacion-intervenciones/nominacion-intervenciones.component';
import { NominacionRecibosComponent } from '../nominacion-recibos/nominacion-recibos.component';
import { NominacionRegistroService } from './nominacion-registro.services';


@Component({
  selector: 'app-nominacion-registro',
  templateUrl: './nominacion-registro.component.html',
  styleUrls: ['./nominacion-registro.component.css']
})
export class NominacionRegistroComponent implements OnInit, OnDestroy {

  @ViewChild(NominacionDatoTecnicoComponent) datoTecnico!: NominacionDatoTecnicoComponent;
  @ViewChild(NominacionRecibosComponent) datoRecibos!: NominacionRecibosComponent;
  @ViewChild(NominacionIntervencionesComponent) datoIntervencion!: NominacionIntervencionesComponent;

  public titulo: string = "Nueva Nominación"
  public nominacionId: number = 0;
  private destroy$ = new Subject();
  public mensajeRegistro: string = '';
  public cargandoRegistro: boolean = false;
  public fechaActualizacion: string;

  public fechaActualizacionNominacionRecibo: Date;
  public fechaActualizacionNominacionDatoTecnico: Date;
  public fechaActualizacionNominacionDetalleIntervencion: Date;
  public fechasModificacion: Array<any> = [];
  constructor(private router: Router,
    private route: ActivatedRoute,
    private nominacionService: NominacionService,
    private confirmationDialogService: ConfirmationDialogService,
    private nominacionRegistroService: NominacionRegistroService,
    private programaEmbarqueService: ProgramaEmbarqueService
  ) {
    this.cargarValoresNominacion();
  }

  ngOnInit(): void {

  }
  private crearValidarObjetoNominacionDatoTecnico(): Subject<NominacionDatoTecnico> {
    let nominacion: NominacionDatoTecnico;
    let subjectNominacion = new Subject<NominacionDatoTecnico>();

    this.datoTecnico.validarDatoTecnico().subscribe(data => {
      if (data) nominacion = this.datoTecnico.crearObjectoDatoTecnico().nominacionDatoTecnico;
      subjectNominacion.next(nominacion);
      return nominacion;
    });
    return subjectNominacion;
  }
  public onRegresarNominacion() {
    this.router.navigate([`programa`]);
  }
  public onGuardarNominacion() {
    this.mensajeRegistro = Mensajes.grabando;
    let validacionDatoTecnico: boolean = true;
    let validacionIntervencion: boolean = true;
    let validacionRecibo: boolean = true;
    this.cargandoRegistro = true;

    validacionDatoTecnico = this.datoTecnico.validarRegistroDatoTecnico();
    if (!validacionDatoTecnico) {
      this.cargandoRegistro = false;
      return validacionDatoTecnico;
    }
    let nominacion = new Nominacion();
    this.datoTecnico.validarCreacionNominacion().subscribe(validacion => {
      if (validacion) {
        const nominacionRecibo: NominacionRecibo[] = this.datoRecibos.crearObjectoRecibos();
        const nominacionIntervencion: NominacionDetalleIntervencion = this.datoIntervencion.crearObjectoIntervencion();
        const nominacionDatoTecnico: NominacionDatoTecnico = this.datoTecnico.crearObjectoDatoTecnico().nominacionDatoTecnico;
    
        nominacion.fechaCreacion = new Date();
        nominacion.id = 0;
        nominacion.embarque_Id = 0;
        nominacion.nominacionDatoTecnico = nominacionDatoTecnico;
        nominacion.nominacionDetalleIntervencion = nominacionIntervencion;

        if (nominacionRecibo.length > 0){
          validacionRecibo = this.datoRecibos.validarCreacionRecibo();
          nominacion.nominacionRecibo = nominacionRecibo;
        }

        if (!validacionRecibo) {
          this.cargandoRegistro = false;
          return validacionRecibo;
        }

        if (nominacionIntervencion != null)
          validacionIntervencion = this.datoIntervencion.validacionIntervencion();
        if (!validacionIntervencion) {
          this.cargandoRegistro = false;
          return validacionIntervencion;
        }

        if (validacionRecibo && validacionIntervencion) {
          this.nominacionRegistroService.grabarNominacion(nominacion).pipe(takeUntil(this.destroy$)).subscribe(data => {
            this.cargandoRegistro = false;
            this.confirmationDialogService.confirm('Registro Nominación', 'Se registro la nominacion correctamente.', 'Aceptar', '', null, null, Tipoalerta.Success);
            this.router.navigate(['programa']);
          });
        }
      } else {
        this.cargandoRegistro = false;
      }
    });
  }

  private cargarValoresNominacion() {
    const nominacionId = this.route.snapshot.paramMap.get('idnominacion');
    this.nominacionId = nominacionId != null ? parseInt(nominacionId) : 0;
    this.titulo = this.nominacionId == 0 ? 'Nueva Nominación' : 'Editar Nominación';
    this.asignarNominacionParametros(this.nominacionId);

  }

  obtenerAuditorias() {



     this.programaEmbarqueService.obtenerAuditoria(this.nominacionId).subscribe((res: Auditoria[]) => {


      res.forEach(element => {
        let fecha: Date;
        switch (element.entidadNombre) {
          case 'NominacionRecibo':
            fecha = new Date(element.fechaModificacion);
            if (this.fechaActualizacionNominacionRecibo == undefined || fecha > new Date(this.fechaActualizacionNominacionRecibo))
              this.fechaActualizacionNominacionRecibo = new Date(element.fechaModificacion);
            break;

          case 'NominacionDatoTecnico':
          case 'NominacionDatoTecnicoCalidad':
          case 'NominacionDatoTecnicoCoordinadorPuerto':
          case 'NominacionDatoTecnicoExportador':
          case 'NominacionDatoTecnicoDestino':
            fecha = new Date(element.fechaModificacion);
            if (this.fechaActualizacionNominacionDatoTecnico == undefined || fecha > new Date(this.fechaActualizacionNominacionDatoTecnico))
              this.fechaActualizacionNominacionDatoTecnico = new Date(element.fechaModificacion);
            break;

          case 'Senasa':
          case 'NominacionDetalleIntervencion':
            fecha = new Date(element.fechaModificacion);
            if (this.fechaActualizacionNominacionDetalleIntervencion == undefined || fecha > new Date(this.fechaActualizacionNominacionDetalleIntervencion))
              this.fechaActualizacionNominacionDetalleIntervencion = new Date(element.fechaModificacion);
            break;
        }

      });

    }, error => { })
  }

  private asignarNominacionParametros(nominacionId: number) {
    let nominacionParametos: NominacionParametros = {
      nominacion_Id: nominacionId,
      actualizarDatoTecnico: true,
      actualizarRecibos: true,
      actualizarIntervenciones: true,
      nominacion: null,
    };
    if (nominacionId > 0) {
      this.nominacionService.obtenerNominacion(nominacionId).pipe(takeUntil(this.destroy$)).subscribe(data => {
        nominacionParametos.nominacion = data;
        this.nominacionService.NominacionParametros = nominacionParametos;
        this.obtenerAuditorias();

      });
    } else {
      this.nominacionService.NominacionParametros = nominacionParametos;
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }


}
enum Mensajes {
  cargando = "Cargando información de nominación. Por favor, espere...",
  grabando = "Guardando información de nominación. Por favor, espere...",
}
