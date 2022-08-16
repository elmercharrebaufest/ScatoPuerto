import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { MaterialPuertoCantidad } from '@ScatoModels/material-puerto-cantidad';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

@Component({
  selector: 'app-cargando-muelle',
  templateUrl: './cargando-muelle.component.html',
  styleUrls: ['./cargando-muelle.component.css']
})
export class CargandoMuelleComponent implements OnInit {
  @Input() instanciaWorkflow: InstanciaWorkflowPuerto;
  balanzas:  Balanzas[];
  valorRitmo: number = 0;
  colorRitmo: string = '#28a745';
  ritmoDeCarga: number = 0;
  valorCargando: number = 0;
  tnTotales: number = 0;
  liquido: boolean;
  fechaAmarro: any;

  constructor(
    private router: Router,
    private balanzaService: BalanzaService,
    private moduloCargaService: ModuloDeCargaService,) { }

  ngOnInit(): void {

    if(this.instanciaWorkflow){
      
      if(this.instanciaWorkflow.embarque.esLiquido){
        this.liquido = true;
        this.balanzaService.obtenerRitmosLiquidos(this.instanciaWorkflow.embarque.vapor.id, this.instanciaWorkflow.lineUp['moduloDeCarga'].id)
        .subscribe( res => {
          console.log('obtenerRitmosLiquidos: ', res);
          this.ritmoDeCarga = res?.ritmoAcumulado ? res.ritmoAcumulado : 0;
          this.valorCargando = res?.llevasCargado ? res.llevasCargado : 0;
        });
      }else{
        this.liquido = false;
      this.balanzaService.obtenerRitmos(this.instanciaWorkflow.embarque.vapor.id, this.instanciaWorkflow.lineUp['moduloDeCarga'].id)
        .subscribe( res => {
          console.log('obtenerRitmos: ', res);
          this.ritmoDeCarga = res?.ritmoDeCarga ? res.ritmoDeCarga : 0;
          this.valorCargando = res?.totalCargado ? res.totalCargado : 0;
        });
      }

      this.moduloCargaService.obtenerModuloDeCarga(this.instanciaWorkflow.lineUp['moduloDeCarga'].id)
      .subscribe(res => {
        if(res.moduloDeCargaPeriodoDeCarga.length > 0){
          this.fechaAmarro = res.moduloDeCargaPeriodoDeCarga[0].fechaAmarro;
        }
      });
  
      // this.balanzaService.listarBalanzadaBuque(this.instanciaWorkflow.embarque.vapor.id).subscribe(res => this.balanzas = res.balanzadasBajaCarga);
    }
  }

  public fechaRecaladaCorrecta() {
    var date = new Date();
    
    // if(!this.instanciaWorkflow.embarque.fechaRecalada) return 'warning';
    // if(new Date(this.instanciaWorkflow.embarque.fechaRecalada).getTime() > date.getTime()) return 'success';
    return 'danger';
  }

  public editarEmbarque() {
    this.router.navigate([`/lineup/alta-embarque/${this.instanciaWorkflow.embarque.id}/lineup`]);
  }

  extraeNombre(objeto): string {
    return objeto != null ? objeto.nombre.toString() : '';
  }

  get filteredMaterialList(): MaterialPuertoCantidad[] {
    return this.instanciaWorkflow.embarque.materialesPuertoCantidad.filter(x => x.cantidad > 0);
  }
}