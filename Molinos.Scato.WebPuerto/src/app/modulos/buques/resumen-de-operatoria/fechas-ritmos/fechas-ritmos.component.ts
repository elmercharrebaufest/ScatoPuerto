import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegistroFechas } from '@ScatoModels/Buques/registroFechas';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { BuqueService } from '@ScatoServicios/buque.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-fechas-ritmos',
  templateUrl: './fechas-ritmos.component.html',
  styleUrls: ['./fechas-ritmos.component.css']
})
export class FechasRitmosComponent implements OnInit, AfterViewInit {
  //#region variables
  moduloDeCargaId: number = 0;
  embarqueId: number;
  vaporId: number = 0;
  registroFechas: RegistroFechas;
  mostrarFechas : boolean = false;
  horasPuerto: number;
  tieneLimpieza: boolean;
  enBuque: boolean = false;
  liquido: boolean;
  tieneMotivoLimpieza: boolean;
  tieneObsLimpieza: boolean;
//#endregion
//#region constructor
  constructor(
    private balanzas78Service: Balanzas78Service,
    private route: ActivatedRoute,
    private buqueService: BuqueService,
    private embarqueSharingService: EmbarqueSharingService,
  ) {
    this.enBuque = true;
    this.embarqueId = parseInt(this.route.snapshot.paramMap.get('embarqueid'));  
    
    this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data =>{
      this.moduloDeCargaId = data.moduloDeCarga_Id;
      this.embarqueId = data.embarque_Id;
      this.liquido = data.esLiquido;
      this.balanzas78Service.setEmbarqueBalanzaCalidad(this.moduloDeCargaId);
    });
    this.embarqueSharingService.setEmbarqueId(this.embarqueId);                      
    this.vaporId = parseInt(this.route.snapshot.paramMap.get('vaporid'));      //consigo el vaporID que esta en la ruta y lo seteo
  }

  //#endregion
  //#region metodos


  ngOnInit(): void {
    console.log('Iniciaa componente FechasRitmosComponent');
    this.initRegistroFechas();
    this.initRitmos()
  }
  //obtengo las fechas para la linea temporal que luego seteo en el HTML
  initRegistroFechas(){
    this.buqueService.obtenerRegistroFechas(this.embarqueId).subscribe((res:RegistroFechas) => {
      this.registroFechas = res
      if(this.registroFechas.limpiezaDesde != "-") this.tieneLimpieza = true;    //si limpieza == "-" es por que no tiene y no se mostrará
      if(this.registroFechas.motivoLimpieza != "-") this.tieneMotivoLimpieza = true;  //en el registro de fechas
      if(this.registroFechas.obsLimpieza != "-") this.tieneObsLimpieza = true;
      this.horasPuerto= parseInt(this.registroFechas.hsEnPuerto);
      this.mostrarFechas = true;

    });
  }

  initRitmos(){
    this.embarqueSharingService.setModuloDeCargaId(this.moduloDeCargaId);
    this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.getBalanzada7());
    this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.getBalanzada8());
    this.balanzas78Service.setBalanzada7Kilos(this.balanzas78Service.getBalanzada7());
    this.balanzas78Service.setBalanzada8Kilos(this.balanzas78Service.getBalanzada8());
  }
  ngAfterViewInit(): void {
    console.log('Terminar componente FechasRitmosComponent');
  }

  //#endregion
}
