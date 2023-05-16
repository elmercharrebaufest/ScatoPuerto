import { COEM } from '@ScatoModels/afip/coem';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-coem-afip',
  templateUrl: './coem-afip.component.html',
  styleUrls: ['./coem-afip.component.css']
})
export class CoemAfipComponent implements OnInit {

  private listaHistorialCoem: COEM[]=[];
  public buscarHistorialCoem: boolean = false;
  private paginaActual: number = 1;
  coem: COEM=new COEM();
  private listaPaginas: any;
  coemId:number;
  coemImo:string;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    
    this.coem.idCoem=2000
    this.coem.caratulaCoem=null
    this.coem.mercaderiasSueltasCoem='1231231';
    this.coem.estadosCoem='REC'
    this.coem.numeroPaginado=true
    this.listaHistorialCoem.push(this.coem)
    console.log(this.listaHistorialCoem)
  }

  public getListaHistorialCoem() {
    return this.listaHistorialCoem;
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

  public editarCoem(historial,modal){
      this.coemId = historial.idCoem;
      // this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-coem', backdropClass: 'modal-coem' }).result
      // .then(() => {     
      //   console.log('_modalService.open');
      // })
      // .catch((res) => { console.log(res) }); 
      this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });

  }

}
