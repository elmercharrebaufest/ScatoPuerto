import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReciboDeBuque, ReciboDeBuqueDetalles } from '@ScatoModels/reciboDeBuque';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ReciboSharingService } from '@ScatoServicios/recibo.shared.service';
import { ReciboBuqueService } from '@ScatoServicios/reciboBuque.service';
import { forkJoin } from 'rxjs';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { FormGroup } from '@angular/forms';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';

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
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  nominaciones: Nominacion[] = [];

  constructor
  (
    private _datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
    private _embarqueService: EmbarqueService,
    private _reciboBuqueService: ReciboBuqueService,
    private _reciboSharingService: ReciboSharingService,
    private session: SessionService,
  )
  {
    this.user = this.session.getUser();
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
      this._reciboBuqueService.obtenerRecibos(this.idEmbarque),
      this._reciboBuqueService.obtenerNominacionRecibos(this.idEmbarque),
    ]).subscribe(([res1, res2, nominacionRecibos]) => {
      this.nombreBuque = res1.nombreBuque;
      this.recibosDeBuque = res2;
      this.nominaciones = nominacionRecibos;
      });
  }

  onVerReciboSelected(recibo){
    recibo.desdeTabla = true;
    this._reciboSharingService.setFiltroRecibos(recibo);
    this.mostrarModal = true;

  }
  generarPDF(recibo){
    if(!this.hasPermisoRecibidores_Recibo_Imprimir())
      return;

    recibo.fechaHoraImpresion = new Date();
    this._reciboBuqueService.guardarReciboDeBuque(this.idEmbarque, recibo).subscribe(res => {
      this.refreshRecibos();
      this._reciboSharingService.setReciboImpresionSubject(recibo);
    });
  }

  precargarRecibo(nominacionRecibo: NominacionRecibo){
    let reciboAGenerar: ReciboDeBuque = new ReciboDeBuque();
    reciboAGenerar.embarque_Id = this.idEmbarque;
    let reciboDetalle: ReciboDeBuqueDetalles = new ReciboDeBuqueDetalles();
    reciboDetalle.esEuropeo = ['Europeo', 'Normal', ''].includes(nominacionRecibo.formato);
    reciboDetalle.cantidad = nominacionRecibo.cantidad;
    reciboDetalle.exportador = nominacionRecibo.exportador.nombre;
    reciboDetalle.valorEnKG = nominacionRecibo.unidad == 'Kg'? true: false;
    reciboDetalle.puertoOrigen = nominacionRecibo.puertoDeCarga;
    reciboDetalle.puertoDestino = nominacionRecibo.puertoDeDescarga;
    reciboDetalle.cantidadLetrasYClaseCarga = nominacionRecibo.descripcionesBienes;
    reciboDetalle.nombreBuque =  this.nombreBuque;
    let reciboDeBuqueDetalles: ReciboDeBuqueDetalles[] = [];
    reciboDeBuqueDetalles.push(reciboDetalle);
    reciboAGenerar.reciboDeBuqueDetalles = reciboDeBuqueDetalles;
    reciboAGenerar.desdeTabla = false;
    this._reciboSharingService.setFiltroRecibos(reciboAGenerar);
    this.mostrarModal = true;
  }

  hasPermisoRecibidores_Recibo_Imprimir() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Recibo_Imprimir);
  }
}
