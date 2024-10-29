import { Component, OnDestroy, OnInit } from '@angular/core';
import { DocumentosEstadoListadoService } from './documentos-estado-listado-service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-administracion-documentos-estado-listado',
  templateUrl: './administracion-documentos-estado-listado.component.html',
  styleUrls: ['./administracion-documentos-estado-listado.component.css']
})
export class AdministracionDocumentosEstadoListadoComponent implements OnInit, OnDestroy  {


  public datosEmbarqueForm: FormGroup;
  public datosFiltroForm: FormGroup;
  public documentosEstadoForm: FormGroup;
  
  public listadoDocumentos:Documento[];
  public listarConfiguracionDocumento:ConfiguracionDocumentoPorNominacion[];
  public listadoDocumentoEstado:DocumentoEstado[];

  private configDocumentoMultiple;
  private configEstadoMultiple;


  private destroy$ = new Subject();
  private nominacionId: number = 0;
  private embarqueId: number = 684;
  constructor(private _documentosEstadoListadoService: DocumentosEstadoListadoService,
              private _documentosEstadoService: DocumentosEstadoService,
              private _confirmationDialogService: ConfirmationDialogService,
              private _modalService: NgbModal,
              private _router: Router,
              private _route: ActivatedRoute,
              private _formBuilder: FormBuilder) { 
    this.cargarDatosNominacion();
  }


  ngOnInit(): void {
  }

  onFiltrarDocumentos(){
    let configuracionDocumento = 0;
    let documento='';
    let documentoEstado='';
    
    if (this.datosFiltroForm.controls.configuracionDocumento.value > '0')
      configuracionDocumento = this.datosFiltroForm.controls.configuracionDocumento.value.id;

    if (this.datosFiltroForm.controls.documento.value > '')
      documento = this.datosFiltroForm.controls.documento.value.map((item) => { return item.id }).join(',');

    if (this.datosFiltroForm.controls.documentoEstado.value > '')
      documentoEstado = this.datosFiltroForm.controls.documentoEstado.value.map((item) => { return item.id }).join(',');

    if (configuracionDocumento == 0){
      let mensaje: string = 'Debe seleccionar el documento.';
      this._confirmationDialogService.confirm('Administración de documentos', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    this.cargarDocumentosEstado(this.nominacionId, configuracionDocumento, documento,documentoEstado);
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
    this._modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' });
  }

  private cargarDatosNominacion() {
    this._documentosEstadoService.NominacionSeleccionada.pipe(takeUntil(this.destroy$)).subscribe((resultado: number) =>{
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
  private inicializarDocumentosEstadoForm(){
    this.documentosEstadoForm = this._formBuilder.group({
      documentos: this._formBuilder.array([])
    });
  }
  private cargarConfiguracionDocumento(){
    this._documentosEstadoListadoService.listarConfiguracionDocumentoPorNominacion(this.nominacionId).pipe(takeUntil(this.destroy$)).subscribe((data: ConfiguracionDocumentoPorNominacion[]) =>{
      if (data!=null)
        this.listarConfiguracionDocumento = data;
    });
  }
  private cargarDocumentosPorNominacion(){
    this._documentosEstadoListadoService.listarDocumentosPorNominacion(this.nominacionId).pipe(takeUntil(this.destroy$)).subscribe((data: Documento[]) =>{
      if (data!=null)
        this.listadoDocumentos = data;
    });
  }
  private cargarNominacionDocumentoEstados(){
    this._documentosEstadoListadoService.listarNominacionDocumentoEstados().pipe(takeUntil(this.destroy$)).subscribe((data: DocumentoEstado[]) =>{
      if (data!=null)
        this.listadoDocumentoEstado = data;
    });
  }
  private cargarDatosEmbarque(){
    this._documentosEstadoListadoService.obtenerNominacionDocumentoEmbarque(this.nominacionId, this.embarqueId).pipe(takeUntil(this.destroy$)).subscribe((data: NominacionDocumentoEmbarque) =>{
      if (data!=null){
        this._documentosEstadoListadoService.cargarDatosEmbarque(this.embarques, data);
      }
    });
  }
  private cargarDocumentosEstado(nominacionId: number, configuracionDocumentoId:number, documento: string,documentoEstado:string){
    this._documentosEstadoListadoService.listarNominacionDocumentoEstadoPorEmbarque(this.nominacionId,configuracionDocumentoId,documento,documentoEstado).pipe(takeUntil(this.destroy$)).subscribe((data: NominacionDocumentoEstadoPorEmbarque[]) =>{
      this.inicializarDocumentosEstadoForm();
      if (data!=null){
        data.forEach(documento=>{
          this._documentosEstadoListadoService.cargarDocumentosEstado(this.documentos, documento);
        });
      }
    });
  }

}
