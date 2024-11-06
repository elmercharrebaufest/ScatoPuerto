import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import { Subject } from 'rxjs';
import { DocumentoMotivoAlerta } from '@ScatoModels/digitalizacion-documentos/documento-motivo-alerta';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { takeUntil } from 'rxjs/operators';
import { DocumentoEnvioAlerta } from '@ScatoModels/digitalizacion-documentos/documentacion-envio-alerta';
import { DocumentosEstadoService } from '../administracion-documentos-estado/documentos-estado-service';
import { DocumentoAlertaDatosAsunto } from '@ScatoModels/digitalizacion-documentos/documento-alerta-datos-asunto';

@Component({
  selector: 'app-administracion-documentos-estado-alerta',
  templateUrl: './administracion-documentos-estado-alerta.component.html',
  styleUrls: ['./administracion-documentos-estado-alerta.component.css']
})
export class AdministracionDocumentosEstadoAlertaComponent implements OnInit, OnDestroy {
  @Output() cerrar = new EventEmitter<void>()
  public Editor = ClassicEditor;
  public estaCargando = false;
  public validators = [ this.must_be_email.bind(this) ];
  public documentoAlertaForm: FormGroup;
  public listaMotivoAlerta: DocumentoMotivoAlerta[];
  private destroy$ = new Subject();
  public mostrarSeccionOtros: boolean = false;
  public documentoAlertaDatosAsunto: DocumentoAlertaDatosAsunto;
  constructor(private _formBuilder: FormBuilder,
              private _documentosEstadoService: DocumentosEstadoService,
              private _documentoService: DocumentoService) { 
    this.documentoAlertaForm = this.inicializarForm();
    this.cargarConfiguracionDocumento();
    this.cargarCorreoAlertaDocumentos();
    this.cargarDatosNominacion();
  }

  ngOnInit(): void {
  }

  onCerraModal() {
    this.cerrar.emit();
  }
  onSeleccionaMotivo(){
    const motivo = this.documentoAlertaForm.controls['motivo'].value;
    if (motivo.motivo == 'Otros'){
      this.mostrarSeccionOtros = true;
      this.documentoAlertaForm.controls['motivoDescripcion'].setValue("");
    }else{
      this.mostrarSeccionOtros = false;
      this.documentoAlertaForm.controls['motivoDescripcion'].setValue(motivo.motivo);
    }
     this.onCompletarAsunto();
  }
  onCompletarAsunto(){
    const motivoDescripcion: string = this.documentoAlertaForm.controls['motivoDescripcion'].value;
    const asunto = `${motivoDescripcion} ${this.documentoAlertaDatosAsunto.nombreBuque} ${this.documentoAlertaDatosAsunto.fechaNominacion}  ${this.documentoAlertaDatosAsunto.clienteDestino}`;
    this.documentoAlertaForm.controls['asunto'].setValue(asunto);   
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
  }
  onEnviarNotificacion(){
    let documentoEnvioAlerta: DocumentoEnvioAlerta = {
        destinatarios : this.documentoAlertaForm.controls["destinatarios"].value.join(';'),
        motivo : this.documentoAlertaForm.controls["motivo"].value.motivo,
        motivoDescripcion : this.documentoAlertaForm.controls["motivoDescripcion"].value,
        asunto : this.documentoAlertaForm.controls["asunto"].value,
        comentario : this.documentoAlertaForm.controls["comentario"].value
    };

    this._documentoService.enviarCorreoAlertaDocumentos(documentoEnvioAlerta).subscribe(data=>{
    });

  }
  
  private cargarDatosNominacion(){
    this._documentosEstadoService.DocumentoAlertaDatosAsunto.subscribe(data=>{
      if (data != null)
        this.documentoAlertaDatosAsunto = data;
    });
  }
  private cargarConfiguracionDocumento(){
    this._documentoService.listarDocumentoMotivoAlerta().pipe(takeUntil(this.destroy$)).subscribe((data: DocumentoMotivoAlerta[]) =>{
      if (data!=null)
        this.listaMotivoAlerta = data;
        this.documentoAlertaForm.controls['motivo'].setValue(data[0]);
        this.onSeleccionaMotivo();
    });
  }
  private cargarCorreoAlertaDocumentos() {
    this._documentoService.correoAlertaDocumentos().subscribe(correos=>{
      if (correos!=null){
        this.documentoAlertaForm.controls.destinatarios.setValue(correos);
      }
    });
  }
  private must_be_email(control: FormControl) {        
    if (!this.validateEmail(control.value)) {
        return { "must_be_email": true };
    }
    return null;
  }
  private validateEmail(text: string) {
    var EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/i;
    return (text && EMAIL_REGEXP.test(text));
  }
  private inicializarForm(): FormGroup {
    return this._formBuilder.group({
      destinatarios: '',
      motivo: '',
      motivoDescripcion: '',
      asunto: '',
      comentario: ''
    });
  }
}
