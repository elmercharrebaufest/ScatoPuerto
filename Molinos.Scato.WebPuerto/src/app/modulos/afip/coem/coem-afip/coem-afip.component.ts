import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { COEM } from '@ScatoModels/afip/coem';
import { EstadoCOEM } from '@ScatoModels/afip/estadoCoem';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
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
  listaEstados:EstadoCOEM[]=[];
  estados:EstadoCOEM[]=[
                        {
                            "id": 1,
                            "estado": "REG"
                        },
                        {
                            "id": 2,
                            "estado": "PRE"
                        },
                        {
                            "id": 3,
                            "estado": "AUTO"
                        },
                        {
                            "id": 4,
                            "estado": "CAN"
                        },
                        {
                            "id": 5,
                            "estado": "CANAF"
                        },
                        {
                            "id": 6,
                            "estado": "ANU"
                        }
                    ];

  constructor(private modalService: NgbModal, private coemAfipService:CoemAfipService, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit(): void {
    this.listarCoems();
    this.listarEstados();
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
      this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });

  }

  eliminarCoem(id){
    this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de eliminar la nueva Caratula con id: ${id}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
    .then((confirmed)=>{
      if(confirmed){
        this.coemAfipService.eliminarCoem(id).subscribe((datos)=>{
          this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La Caratula con id: ${id} fue eliminada con éxito!`, 'Cerrar','', null, null, Tipoalerta.Success)
          this.listarCoems();
        },(error) => {
          this.confirmationDialogService.confirm(`¡Error!`, 'No se ha podido crear una nueva Caratula, comunicarse con soporte técnico', 'Cerrar', '', null, null, Tipoalerta.Error);
        })
      }
    })
  }

  listarCoems(){
    let estadoCOEM: EstadoCOEM = new EstadoCOEM;
    this.coem.idCoem=2000;
    this.coem.caratulaCoem=null;
    this.coem.mercaderiasSueltasCoem='1231231';
    this.coem.estadosCoem=estadoCOEM;
    this.coem.estadosCoem.estado='REG';
    this.coem.estadosCoem.id=1;
    this.coem.numeroPaginado=true;
    this.listaHistorialCoem.push(this.coem)

    // this.coemAfipService.listarCoems().subscribe((data)=>{
    //   this.listaHistorialCoem=data
    // })
  }

  listarEstados(){
    this.listaEstados=this.estados;
    // this.coemAfipService.estadosCoem().subscribe((data)=>{
    //   this.listaEstados=data;
    // })
  }

  cambiarEstado(event:Event){
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.value;
    // this.coemAfipService.cambiarEstadosCoem(selectedOption).subscribe((data)=>{
    //   this.listaEstados=data;
    // })
  }

}
