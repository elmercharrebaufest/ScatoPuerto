import { Component, OnDestroy, OnInit } from '@angular/core';
import { DocumentosEstadoListadoService } from './documentos-estado-listado-service';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionDocumentoEstadoPorEmbarque } from '@ScatoModels/digitalizacion-documentos/nominacion-documento-estado-por-embarque';
import { NominacionDocumentoEmbarque } from '@ScatoModels/digitalizacion-documentos/nominacion-documento-embarque';
import { Documento } from '@ScatoModels/digitalizacion-documentos/documento';
import { DocumentoEstado } from '@ScatoModels/digitalizacion-documentos/documento-estado';
import { ConfiguracionDocumentoPorNominacion } from '@ScatoModels/digitalizacion-documentos/configuracion-documentos-por-nominacion';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentosEstadoService } from '../administracion-documentos-estado/documentos-estado-service';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { DocumentoAlertaDatosAsunto } from '@ScatoModels/digitalizacion-documentos/documento-alerta-datos-asunto';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-administracion-documentos-estado-listado',
  templateUrl: './administracion-documentos-estado-listado.component.html',
  styleUrls: ['./administracion-documentos-estado-listado.component.css']
})
export class AdministracionDocumentosEstadoListadoComponent implements OnInit, OnDestroy {


  public datosEmbarqueForm: FormGroup;
  public datosFiltroForm: FormGroup;
  public documentosEstadoForm: FormGroup;

  public listadoDocumentos: Documento[];
  public listarConfiguracionDocumento: ConfiguracionDocumentoPorNominacion[];
  public listadoDocumentoEstado: DocumentoEstado[];

  private configDocumentoMultiple;
  private configEstadoMultiple;
  public documentosACerrar: number[] = [];

  private destroy$ = new Subject();
  private nominacionId: number = 0;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(private _documentosEstadoListadoService: DocumentosEstadoListadoService,
    private _documentosEstadoService: DocumentosEstadoService,
    private _documentosService: DocumentoService,
    private _confirmationDialogService: ConfirmationDialogService,
    private _modalService: NgbModal,
    private _router: Router,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private session: SessionService
  ) {
    this.user = this.session.getUser();
    this.cargarDatosNominacion();
  }


  ngOnInit(): void {
  }

  onFiltrarDocumentos() {
    let configuracionDocumento = 0;
    let documento = '';
    let documentoEstado = '';

    if (this.datosFiltroForm.controls.configuracionDocumento.value > '0')
      configuracionDocumento = this.datosFiltroForm.controls.configuracionDocumento.value.id;

    if (this.datosFiltroForm.controls.documento.value > '')
      documento = this.datosFiltroForm.controls.documento.value.map((item) => { return item.id }).join(',');

    if (this.datosFiltroForm.controls.documentoEstado.value > '')
      documentoEstado = this.datosFiltroForm.controls.documentoEstado.value.map((item) => { return item.id }).join(',');

    if (configuracionDocumento == 0){
      let mensaje: string = 'Debe seleccionar una configuración.';
      this._confirmationDialogService.confirm('Administración de documentos', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    this.cargarDocumentosEstado(this.nominacionId, configuracionDocumento, documento, documentoEstado);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  get embarques(): FormArray {
    return this.datosEmbarqueForm.get("embarque") as FormArray;
  }
  get documentos(): FormArray {
    var myArray = (this.documentosEstadoForm.get("documentos") as FormArray).value;
    myArray = myArray.sort((a, b) => a.documento > b.documento);
    (this.documentosEstadoForm.get("documentos") as FormArray).patchValue(myArray)
    return this.documentosEstadoForm.get("documentos") as FormArray;
  }
  public setConfigDocumentoMultiple() {
    this.configDocumentoMultiple = {
      singleSelection: false,
      primaryKey: 'id',
      textField: 'nombre',
      selectAllText: 'Marcar Todos',
      unSelectAllText: 'Desmarcar Todos',
    };
  }
  public setConfigEstadoMultiple() {
    this.configEstadoMultiple = {
      singleSelection: false,
      primaryKey: 'id',
      textField: 'estado',
      selectAllText: 'Marcar Todos',
      unSelectAllText: 'Desmarcar Todos',
    };
  }
  public getConfigDocumentoMultiple() {
    return this.configDocumentoMultiple;
  }
  public getConfigEstadoMultiple() {
    return this.configEstadoMultiple;
  }
  public getListadoDocumentoEstado() {
    return this.listadoDocumentoEstado;
  }
  public getListadoDocumentos() {
    return this.listadoDocumentos;
  }
  public trackByFn(index: any, item: any) {
    return index;
  }
  public onOpenModalAlerta(modal) {
    const configuracionDocumento = this.datosFiltroForm.controls["configuracionDocumento"].value;
    const nombreBuque = this.embarques.controls[0].get("nombreBuque").value;
    const fechaNominacion = this.embarques.controls[0].get("fechaNominacion").value;
    if (configuracionDocumento == 0){
      let mensaje: string = 'Debe seleccionar una configuración para generar la alerta.';
      this._confirmationDialogService.confirm('Administración de documentos', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    let documentoAlertaDatosAsunto = {
      clienteDestino : configuracionDocumento.descripcion,
      nombreBuque : nombreBuque,
      fechaNominacion : fechaNominacion
    };
    this._documentosEstadoService.DocumentoAlertaDatosAsunto = documentoAlertaDatosAsunto;
    this._modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' });
  }

  private cargarDatosNominacion() {
    this._documentosEstadoService.NominacionSeleccionada.pipe(takeUntil(this.destroy$)).subscribe((resultado: number) => {
      this.nominacionId = resultado != null ? resultado : 0;
      this.setConfigDocumentoMultiple();
      this.setConfigEstadoMultiple();
      this.construirFormularios();
      this.cargarDatosEmbarque();
    });
  }

  private construirFormularios() {
    this.datosFiltroForm = this._documentosEstadoListadoService.inicializarFormFiltro();
    this.datosEmbarqueForm = this._formBuilder.group({
      embarque: this._formBuilder.array([])
    });

    this.inicializarDocumentosEstadoForm();
    this.cargarConfiguracionDocumento();
    this.cargarDocumentosPorNominacion();
    this.cargarNominacionDocumentoEstados();
  }
  private inicializarDocumentosEstadoForm() {
    this.documentosEstadoForm = this._formBuilder.group({
      documentos: this._formBuilder.array([])
    });
  }
  private cargarConfiguracionDocumento() {
    this._documentosEstadoListadoService.listarConfiguracionDocumentoPorNominacion(this.nominacionId).pipe(takeUntil(this.destroy$)).subscribe((data: ConfiguracionDocumentoPorNominacion[]) => {
      if (data != null)
        this.listarConfiguracionDocumento = data;
    });
  }
  private cargarDocumentosPorNominacion() {
    this._documentosEstadoListadoService.listarDocumentosPorNominacion(this.nominacionId).pipe(takeUntil(this.destroy$)).subscribe((data: Documento[]) => {
      if (data != null)
        this.listadoDocumentos = data;
    });
  }
  private cargarNominacionDocumentoEstados() {
    this._documentosEstadoListadoService.listarNominacionDocumentoEstados().pipe(takeUntil(this.destroy$)).subscribe((data: DocumentoEstado[]) => {
      if (data != null)
        this.listadoDocumentoEstado = data;
    });
  }
  private cargarDatosEmbarque(){
    this._documentosEstadoListadoService.obtenerNominacionDocumentoEmbarque(this.nominacionId).pipe(takeUntil(this.destroy$)).subscribe((data: NominacionDocumentoEmbarque) =>{
      if (data!=null){
        this._documentosEstadoListadoService.cargarDatosEmbarque(this.embarques, data);
      }
    });
  }
  private cargarDocumentosEstado(nominacionId: number, configuracionDocumentoId: number, documento: string, documentoEstado: string) {
    this._documentosEstadoListadoService.listarNominacionDocumentoEstadoPorEmbarque(this.nominacionId, configuracionDocumentoId, documento, documentoEstado).pipe(takeUntil(this.destroy$)).subscribe((data: NominacionDocumentoEstadoPorEmbarque[]) => {
      this.documentosEstadoForm.setControl('documentos', this._formBuilder.array([]));
      const documentosFormArray = this._formBuilder.array(
        data.map(doc => this._documentosEstadoListadoService.cargarDocumentosEstado(doc))
      );
      this.documentosEstadoForm.setControl('documentos', documentosFormArray);
      this.modificarControles();
      this.documentosACerrar = [];
    });
  }

  public modificarControles() {
    const documentosArray = this.documentosEstadoForm.get('documentos') as FormArray;

    documentosArray?.controls?.forEach((documentoGroup: FormGroup) => {
      let esDocumentoCerradoControl = documentoGroup.get('esDocumentoCerrado');
      let esDocumentoEnviadoControl = documentoGroup.get('esDocumentoEnviado');
      if (esDocumentoEnviadoControl?.value === true && !this.visualizaComex()) {
        esDocumentoCerradoControl?.enable();
      } else {
        esDocumentoCerradoControl?.disable();
      }
      documentoGroup.get('esBorradorSolicitado').disable();
      documentoGroup.get('esBorradorAprobado').disable();
      documentoGroup.get('esBorradorModificado').disable();
      documentoGroup.get('esBorradorEnviado').disable();
      documentoGroup.get('esDocumentoEnviado').disable();
    });
  }

  public marcarDocumentoCerrado(documento: AbstractControl) {
    const documentoGroup = documento as FormGroup;

    const esDocumentoCerradoControl = documentoGroup.get('esDocumentoCerrado');
    const documentoId = documentoGroup.get('documentoId').value;
    if (esDocumentoCerradoControl.value) {
      this.documentosACerrar.push(documentoId);
    } else {
      const index = this.documentosACerrar.indexOf(documentoId);
      if (index !== -1) {
        this.documentosACerrar.splice(index, 1);
      }
      this.desmarcarBotonCerrarTodos();
    }
  }

  public onCerrarDocumentosMarcados() {
    this._documentosService.cerrarDocumentos(this.documentosACerrar).subscribe(() => {
      this.documentosACerrar = [];
      this.onFiltrarDocumentos();
      this._confirmationDialogService.confirm('Administración de documentos', 'Se cerraron los documentos con éxito.', 'Aceptar', '', null, null, Tipoalerta.Warning);
      return;
    }, (err) => {
      console.error(err);
      this._confirmationDialogService.confirm('Administración de documentos', 'Hubo un error al intentar cerrar los documentos seleccionados.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    });
  }

  public onMarcarTodosACerrar(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.checked;
    if (value) {
      this.documentos.controls.forEach((documentoGroup: FormGroup) => {
        const esDocumentoCerradoControl = documentoGroup.get('esDocumentoCerrado');
        if (!esDocumentoCerradoControl.value && !esDocumentoCerradoControl.disabled) {
          esDocumentoCerradoControl.setValue(true);
          this.documentosACerrar.push(documentoGroup.get('documentoId').value);
        }
      });
    } else {
      this.documentos.controls.forEach((documentoGroup: FormGroup) => {
        const esDocumentoCerradoControl = documentoGroup.get('esDocumentoCerrado');
        if (esDocumentoCerradoControl.value && !esDocumentoCerradoControl.disabled) {
          esDocumentoCerradoControl.setValue(false);
        }
      });
      this.documentosACerrar = [];
    }
  }

  private desmarcarBotonCerrarTodos() {
    const checkbox = document.getElementById("closeall") as HTMLInputElement;
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
    }
  }

  public visualizaComex(){
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Documentos_Visualizar);
  }

}
