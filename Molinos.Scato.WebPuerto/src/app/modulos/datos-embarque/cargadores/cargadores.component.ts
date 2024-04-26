import { Exportador } from '@ScatoModels/exportador';
import { CargadoresService } from '@ScatoServicios/cargadores.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cargadores',
  templateUrl: './cargadores.component.html',
  styleUrls: ['./cargadores.component.css']
})
export class CargadoresComponent implements OnInit {

  public filtro: FormGroup;
  public cargadores: Exportador[];
  public id: number;
  //#region Variables Paginacion
  public paginator: any;
  public length = 0;
  public pageSize: number;
  public pageIndex: number = 0;
  public pageSizeOptions = [10, 20, 50, 100];
  public hidePageSize = false;
  public showPageSizeOptions = true;
  public showFirstLastButtons = true;
  public disabled = false;
  public pageEvent: PageEvent;
  //#endregion Variables Paginacion
  public orderedByColumn: string;
  public orderDirection: number;
  public estaCargando: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private cargadoresService: CargadoresService,
    private router: Router,
    private modalService: NgbModal

  ) { }

  ngOnInit(): void {
    this.inicializarFiltro();
    this.listarCargadores();
  }

  public inicializarFiltro(): void {
    this.filtro = this.formBuilder.group({
      nombre: '',
    });
  }

  public onLimpiarFiltros() {
    this.filtro.controls.nombre.setValue('');
    this.onBuscar();
  }

  public onBuscar() {
    this.listarCargadores();
  }

  public listarCargadores() {
    this.cargadoresService.ListarCargadores(this.pageIndex, this.pageSize, this.filtro.controls.nombre.value)
      .subscribe((data: any) => {
        this.cargadores = data.items;
        this.length = data.itemsTotales ? data.itemsTotales : 0;
        this.pageSize = data.itemsPorPagina ? data.itemsPorPagina : 10;
        this.pageIndex = data.pagina ? data.pagina : 0;
        this.estaCargando = false;
      }, (error) => {
        console.log(error);
      }
    );
  }

  public onExportExcel() {
    this.cargadoresService.ExportarExcel(this.filtro.controls.nombre.value).subscribe(
      (data: any) => {
        const element = document.createElement('a');
        element.href = URL.createObjectURL(data);
        element.download = "listado_exportadores" + '.xls';
        document.body.appendChild(element);
        element.click();
      }, (error) => {
        console.error(error);
      }
    );
  }

  public onVolver() {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  public tienePermisoModificarCargador() {
    return true;
  }

  public tienePermisoEliminarCargador() {
    return true;
  }

  public eliminarCargador(cargador: Exportador) {

  }

  //#region  Paginacion
  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.disabled = false;
    this.listarCargadores();
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.disabled = false;
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
  //#endregion Paginacion

  public orderColumnBy(column: string) {
    if (column == this.orderedByColumn) {
      this.orderDirection = -this.orderDirection;
    } else {
      this.orderDirection = 1;
      this.orderedByColumn = column;
    }
    var columArray = column.split('.')
    if (columArray.length == 1) {
      this.cargadores.sort((a, b) => {
        if (a[column] > b[column]) {
          return 1
        }
        if (a[column] < b[column]) {
          return -1
        }
        return 0
      })
    }
    else {
      this.cargadores.sort((a, b) => {
        if (a[columArray[0]][0][columArray[1]] > b[columArray[0]][0][columArray[1]]) {
          return 1
        }
        if (a[columArray[0]][0][columArray[1]] < b[columArray[0]][0][columArray[1]]) {
          return -1
        }
        return 0
      })
    }
    if (this.orderDirection <= 0) this.cargadores = this.cargadores.reverse()
  }

  agregarCargador(modal: any){
    this.id = 0;
    this.abrirModal(modal);    
  }

  editarCargador(id: number, modal: any){
    this.id = id;
    this.abrirModal(modal);
  }

  abrirModal(modal: any){
    this.modalService.open(modal, { size: 'md', centered: true, backdrop: 'static', keyboard: false }).result
    .then(() => {     
      console.log('_modalService.open');
    })
    .catch((res) => { console.log(res) }); 
  }

  refrescarListado(){
    this.listarCargadores();
  }

}
