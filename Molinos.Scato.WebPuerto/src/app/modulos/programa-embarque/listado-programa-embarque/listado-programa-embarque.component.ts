import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { ListaProgramaEmbarque } from '@ScatoModels/programa-embarque/lista-programa-embarque';
import { FiltroProgramaEmbarqueComponent } from '../filtro-programa-embarque/filtro-programa-embarque.component';


@Component({
  selector: 'app-listado-programa-embarque',
  templateUrl: './listado-programa-embarque.component.html',
  styleUrls: ['./listado-programa-embarque.component.css']
})
export class ListadoProgramaEmbarqueComponent implements OnInit, OnDestroy {
  //#region Variables  
  public orderedByColumn: string;
  public orderDirection: number;
  programa: any[]
  subscripcionPrograma: Subscription
  
  paginator: any;
  length = 0;
  pageSize: number;
  pageIndex: number = 0;
  pageSizeOptions = [10, 20, 50, 100];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: PageEvent;
  filtros: any;
  //#endregion
  constructor(private progamaService: ProgramaEmbarqueService, 
    private programaEmbarqueService: ProgramaEmbarqueService) { }

  ngOnInit(): void {
    this.subscripcionPrograma = this.progamaService.observablePrograma.subscribe(
      (data: any) => {
        this.programa = data;
        this.length = this.programa.length > 0 ? this.programa[0].itemsTotales : this.programa.length;
        this.pageSize = this.programa.length > 0 ? this.programa[0].itemPorPagina : 10;
        this.pageIndex = this.programa.length > 0 ? this.programa[0].pagina : 1;
      }
    )   
  }
  ngOnDestroy(): void {
    this.subscripcionPrograma.unsubscribe();
  }

  public getListaProgramaEmbarque() {
    return this.programa;
  }

  public orderColumnBy(column: string) {
    if (column == this.orderedByColumn) {
      this.orderDirection = -this.orderDirection;
    } else {
      this.orderDirection = 1;
      this.orderedByColumn = column;
    }

    this.programa.sort((a, b) => {
      if (a[column] > b[column]) {
        return 1
      }
      if (a[column] < b[column]) {
        return -1
      }
      return 0
    })
    if(this.orderDirection < 0) this.programa= this.programa.reverse()
  }

  public retornarColor(color){
    return color;
  }
 

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.disabled = false;
    this.programaEmbarqueService.ListarProgramaEmbarque(this.pageIndex, this.pageSize)
    
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.disabled = false;
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
}
