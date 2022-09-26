import { Component, OnInit } from '@angular/core';
import { ArchivoPuerto } from '@ScatoModels/ArchivosPuerto';
import { TipoArchivoPuerto } from '@ScatoModels/TipoArchivoPuerto';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-archivos',
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.css']
})
export class ArchivosComponent implements OnInit {
  constructor(
    private embarqueService: EmbarqueService,
    private _modalService: NgbModal,
    private _sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private confirmationDialogService: ConfirmationDialogService,
    ) {
      this.idEmbarque = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
     }  
   
  ListTipoArchivoPuerto: TipoArchivoPuerto[];
  ArchivosPuertoDb: ArchivoPuerto[];
  ArchivosPuerto: ArchivoPuerto[];
  imagePath: any;
  TipoArchivosDbList: TipoArchivoPuerto[] = [];
  nombreArchivo: TipoArchivoPuerto;
  fileToUpload: any | null = null;
  selectAll: boolean = false;  
  listArchivos: ArchivoPuerto[] = [];
  listArchivosToSave: ArchivoPuerto[] = [];
  idEmbarque: number;
  loaded: boolean = false;
  checkedLines: boolean = false;
  downloadSelectionActivated: boolean = false

  ngOnInit(): void {
   this.initArchivos();
  }

  checkValue(event){
    this.listArchivos.forEach(file => {
      file.isSelected = event.target.checked;
    })

    if(event.target.checked){
      this.downloadSelectionActivated = true
    }else{
      this.downloadSelectionActivated = false
    }
  }

  initArchivos(){
    this.embarqueService.obtenerArchivos(this.idEmbarque).subscribe((res: ArchivoPuerto[]) => {
      this.listArchivos = res;
      this.loaded = true;
    });
  }

  checkChange(){
    let isActivated: boolean = false;
    let allSelected: boolean = true;
    this.listArchivos.forEach(file => {
      if(file.isSelected){
        isActivated = true;        
      }else{
        allSelected = false;
      }
    })
    if(allSelected){      
      (document.getElementById("switchAllFiles") as HTMLInputElement).checked = true;
    }else{
      (document.getElementById("switchAllFiles") as HTMLInputElement).checked = false;
    }
    this.downloadSelectionActivated = isActivated;
  }

  deleteFile(file: ArchivoPuerto){
    this.confirmationDialogService.confirm("Atención",`¿Seguro que desea eliminar el archivo ${file.nombreArchivo}?`, "Aceptar", "Cancelar", null, null, Tipoalerta.Warning)
    .then((confirmed) => {
      if (confirmed) { 
        let filesToDelete: ArchivoPuerto[] = [];
        filesToDelete.push(file);
        this.embarqueService.eliminarArchivos(filesToDelete).subscribe((res: boolean)=>{
          this.listArchivos = this.listArchivos.filter(x => x.id != file.id);
        });
      }});    
  }

  openAddFilesModal(Modal: any){
    this.listArchivosToSave = [];
    this.embarqueService.obtenerTipoArchivos().subscribe((res : TipoArchivoPuerto[]) => {this.TipoArchivosDbList = res}); 
    this._modalService.open(Modal);
  }
  
  
  downloadFile(file: ArchivoPuerto){
    //Me fijo si el archivo a descargar es de alguno de los siguientes formatos.
    if(file.archivo.includes("data:image") || file.archivo.includes("openxmlformats") || file.archivo.includes("data:application/pdf") || file.archivo.includes("text/plain")){
      const linkSource = file.archivo;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = file.nombreArchivo;
      downloadLink.click();
    //En caso de no ser, le aviso que no se puede descargar.
    }else{
      this.confirmationDialogService.confirm('¡Atención!', "El archivo tiene un formato inválido para la acción que desea realizar.", 'Aceptar', '', null, null, Tipoalerta.Warning)
    }    
  }

  comprimirYDescargarSeleccion(){
    this.listArchivos.forEach(file => {
      if(file.isSelected) this.downloadFile(file);
    })
  }
  
  previewFile(Modal: any, file: ArchivoPuerto){
    if(file.archivo.includes("data:image")){
      this.convertB64ToImg(file);
      this._modalService.open(Modal);
    }else if(file.archivo.includes("data:application/pdf")){      
      let pdfWindow = window.open("");
      pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" +
      encodeURI(file.archivo) + "'></iframe>"
      )      
    }else{
      this.confirmationDialogService.confirm('¡Atención!', "El tipo de archivo no se puede mostrar", 'Aceptar', '', null, null, Tipoalerta.Warning)
    }    
  }
    
  convertB64ToImg(file: ArchivoPuerto) {
    this.imagePath = this._sanitizer.bypassSecurityTrustResourceUrl(file.archivo);
  }

  initializeModalArchivos(){
    this.nombreArchivo = null;
  }
    
  guardarArchivos(){

    this.confirmationDialogService.confirm('¡Atención!', "Estás seguro que deseas guardar los archivos?", 'Aceptar', 'Cerrar', null, null, Tipoalerta.Warning)
    .then((confirmed) => {
      if (confirmed) {
        this.embarqueService.guardarArchivos(this.idEmbarque, this.listArchivosToSave, true).subscribe(res => {
          this.listArchivos.push(...this.listArchivosToSave);
          this._modalService.dismissAll();
        })          
      }
    })
  }


  eliminarArchivo(reg: ArchivoPuerto){
    if(reg.id > 0){  
      this.ArchivosPuerto.forEach((element,index)=>{
        if(element.id ==reg.id) this.ArchivosPuerto.splice(index,1);
     });
    } else{
      this.ArchivosPuerto.forEach((element,index)=>{
        if(element.nombreArchivo ==reg.nombreArchivo) this.ArchivosPuerto.splice(index,1);
     });
    }
  }

  handleFileInput(files: any) {
    this.fileToUpload = files.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload);
    reader.onload = () => {
        console.log(reader.result);
    };
}

tagInputLostFocus(tipoArchivo: TipoArchivoPuerto){
  if(tipoArchivo[0] != undefined && tipoArchivo[0].tipoArchivo != ""){
    this.TipoArchivosDbList.forEach(TA => {
      if(TA.tipoArchivo.toLowerCase() == tipoArchivo[0].tipoArchivo.toLowerCase()){
        return;
        this.nombreArchivo = TA;
      } 
    })
    //Si llego hasta aca es porque el tipoArchivo no existía, por ende lo tengo que agregar en la DB.
      let tipoArchivoToAddDB: any = new TipoArchivoPuerto();
      tipoArchivoToAddDB.tipoArchivo = tipoArchivo[0].tipoArchivo;
    this.embarqueService.guardarTipoArchivo(tipoArchivoToAddDB).subscribe((res: number) => {
      tipoArchivoToAddDB.id = res;
      this.nombreArchivo[0].id = res;
      this.TipoArchivosDbList.push(tipoArchivoToAddDB);
    })
  }
  
}

addFileToSave(){
  if(this.fileToUpload == null){
    this.confirmationDialogService.confirm('Atención','No has seleccionado ningún archivo.', 'Cerrar', '', null, null, Tipoalerta.Warning);
    return;
  }

  if(!this.nombreArchivo[0] || this.nombreArchivo[0].tipoArchivo == undefined || this.nombreArchivo[0].tipoArchivo == ""){
    this.confirmationDialogService.confirm('Atención','No has seleccionado un tipo de archivo.', 'Cerrar', '', null, null, Tipoalerta.Warning);  
    return;
  }
  
  if (this.fileToUpload.name  == "" ){
    this.confirmationDialogService.confirm('Atención','El archivo no tiene nombre.', 'Cerrar', '', null, null, Tipoalerta.Warning);  
    return;
  }

  if(this.fileToUpload.size >= 5000000){  
    this.confirmationDialogService.confirm('Atención','El tamaño del archivo debe ser menor a 5MB.', 'Cerrar', '', null, null, Tipoalerta.Warning);
    return;
  }

  let exist: boolean = false;
  this.listArchivos.forEach(file => {
    if(file.tipoArchivoPuerto.id == this.nombreArchivo[0].id){
      exist = true;
    }
  });

  if (exist){
    this.confirmationDialogService.confirm('Atención','Ya has guardado un archivo de ese tipo.', 'Cerrar', '', null, null, Tipoalerta.Warning);
    return;
  }

  
  const reader = new FileReader();
  reader.readAsDataURL(this.fileToUpload);
  reader.onload = () => {
    var file = reader.result.toString(); 
      if(file.includes("data:image") || file.includes("openxmlformats") || file.includes("data:application/pdf") || file.includes("text/plain")){

        let fileToAdd = new ArchivoPuerto;

        fileToAdd.archivo = file;
        fileToAdd.fecha = new Date;
        fileToAdd.embarque_Id = this.idEmbarque;
        fileToAdd.nombreArchivo = this.fileToUpload.name        
        fileToAdd.tipoArchivoPuerto = this.nombreArchivo[0];
        fileToAdd.id = 0;
        fileToAdd.extension = fileToAdd.nombreArchivo.split(".")[1];
        fileToAdd.size = this.fileToUpload.size;

        this.listArchivosToSave.push(fileToAdd);
        this.listArchivosToSave = this.listArchivosToSave.sort((a,b) => a.id - b.id)
        this.nombreArchivo = null;
        this.fileToUpload = null
  
    }else{
      //Salgo y no lo dejo agregar 
      this.confirmationDialogService.confirm('Atención','El archivo tiene un formato inválido.', 'Cerrar', '', null, null, Tipoalerta.Warning);
    }
  }
    
    //Lo agrego a la lista de existentes, para saber cuales guardar van a ser los que tengan id en 0 o nulo
    //Primero valido que esté toda la data necesaria completa
   
}

}
