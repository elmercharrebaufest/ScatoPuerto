import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReciboDeBuque, ReciboDeBuqueDetalles } from '@ScatoModels/reciboDeBuque';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ReciboSharingService } from '@ScatoServicios/recibo.shared.service';
import { ReciboBuqueService } from '@ScatoServicios/reciboBuque.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-registro-recibos',
  templateUrl: './registro-recibos.component.html',
  styleUrls: ['./registro-recibos.component.css']
})
export class RegistroRecibosComponent implements OnInit, OnDestroy {
  idEmbarque: number;
  nombreBuque:string;
  mostrarGrilla:boolean = true;
  recibosDeBuque: ReciboDeBuque[];
  recibosDeBuqueArray:ReciboDeBuque[];
  recibo:ReciboDeBuque;
  mostrarModal:boolean = false;
  reciboAImprimir: ReciboDeBuqueDetalles;
  // impresion:boolean = false;

  constructor
  (
    private _datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
    private _embarqueService: EmbarqueService,
    private _reciboBuqueService: ReciboBuqueService,
    private _reciboSharingService: ReciboSharingService,

  ) 
  {
    this.refreshRecibos();
    this._reciboSharingService.getFiltroRecibos().subscribe((data:ReciboDeBuque) => {
      this.recibo = data;
    });
    this._reciboSharingService.getReciboImpresionSubject().subscribe((data:ReciboDeBuque) => {
      this.recibo = data;
    });
    
   }

  ngOnInit(): void {
    this.initGrillaRecibos();
    
  }

  ngOnDestroy(): void {
  }
  
  refreshRecibos(){
    this._reciboSharingService.getRefreshRecibo().subscribe(refresh => { 
      if(refresh == true){
        this._reciboBuqueService.obtenerRecibos(this.idEmbarque).subscribe(data => {
          this.recibosDeBuque = data;
        })
      }
    })
    this._reciboSharingService.setRefreshRecibo(false);
    
    // this.subscriptionRecibo = this._reciboBuqueService.refresh.subscribe(() =>{
    //   this._reciboBuqueService.obtenerRecibos(this.idEmbarque).subscribe(data => this.recibosDeBuque = data);
    // })
  }

  initGrillaRecibos() {
    this.idEmbarque = this._datosEmbarqueProcesoService.getEmbarqueId();

    forkJoin([
      this._embarqueService.obtenerEmbarque(this.idEmbarque),
      this._reciboBuqueService.obtenerRecibos(this.idEmbarque)
    ]).subscribe(([res1, res2,]) => {
      this.nombreBuque = res1.nombreBuque;
      this.recibosDeBuque = res2;
            

      });
  }

  onVerReciboSelected(recibo){
    this._reciboSharingService.setFiltroRecibos(recibo);
    this.mostrarModal = true;
  
  }
  generarPDF(recibo){
    recibo.fechaHoraImpresion = new Date();
    this._reciboBuqueService.guardarReciboDeBuque(this.idEmbarque, recibo).subscribe(res => {
      console.log('200 Ok')
      this.refreshRecibos();
      this._reciboSharingService.setReciboImpresionSubject(recibo);
    });
  }
}
