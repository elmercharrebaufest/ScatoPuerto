import { CODE } from '@ScatoModels/afip/code';
import { COEM } from '@ScatoModels/afip/coem';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-code-afip',
  templateUrl: './code-afip.component.html',
  styleUrls: ['./code-afip.component.css']
})
export class CodeAfipComponent implements OnInit {

  private listaHistorialCode: CODE[]=[];
  public buscarHistorialCode: boolean = false;
  private paginaActual: number = 1;
  code: CODE=new CODE();
  private listaPaginas: any;
  codeId:number;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    
    this.code.idCaratula='001'
    this.code.idCode='Jerry Matedi'
    this.code.idViaje='1231231';
    this.code.estadoCode='San Benito'
    this.code.idCoems='1';
    this.code.numeroPaginado=true
    this.listaHistorialCode.push(this.code)
    console.log(this.listaHistorialCode)
  }

  public getListaHistorialCode() {
    return this.listaHistorialCode;
  }

  public getPaginaActual() {
    return this.paginaActual;
  }

  public setPaginaActual(pagina) {
    this.paginaActual = pagina;
  }

  public getListaPaginas() {
    return this.listaPaginas;
  }

  public editarCaratula(historial,modal){
      this.codeId = historial.idCcode;
      this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-vapor', backdropClass: 'modal-vapor' }).result
      .then(() => {     
        console.log('_modalService.open');
  
      })
      .catch((res) => { console.log(res) }); 
  }

 


}
