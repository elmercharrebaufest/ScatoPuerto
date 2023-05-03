import { Caratula } from '@ScatoModels/afip/caratula';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-caratula-afip',
  templateUrl: './caratula-afip.component.html',
  styleUrls: ['./caratula-afip.component.css']
})
export class CaratulaAfipComponent implements OnInit {

  // #region Variables
  private listaHistorialCaratulas: Caratula[]=[];
  public buscarHistorialCaratulas: boolean = false;
  private paginaActual: number = 1;
  caratula: Caratula=new Caratula();
  private listaPaginas: any;
  caratulaId:number;
  caratulaImo:string;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    
    this.caratula.idCaratula='001'
    this.caratula.buqueCaratula='Jerry Matedi'
    this.caratula.imoCaratula='1231231';
    this.caratula.puertoDestinoCaratula='San Benito'
    this.caratula.numeroPaginado=1;
    this.listaHistorialCaratulas.push(this.caratula)
    console.log(this.listaHistorialCaratulas)
  }

  public getListaHistorialCaratula() {
    return this.listaHistorialCaratulas;
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
      this.caratulaId = historial.idCaratula;
      this.caratulaImo = historial.imoCaratula
      this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-vapor', backdropClass: 'modal-vapor' }).result
      .then(() => {     
        console.log('_modalService.open');
  
      })
      .catch((res) => { console.log(res) }); 
  }

}
