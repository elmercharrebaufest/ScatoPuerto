import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { MaterialPuertoCantidad } from '@ScatoModels/material-puerto-cantidad';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';

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

  constructor(
    private router: Router,
    private balanzaService: BalanzaService) { }

  ngOnInit(): void {

    if(this.instanciaWorkflow){
      
      if(this.instanciaWorkflow.embarque.esLiquido){
        this.balanzaService.obtenerRitmosLiquidos(this.instanciaWorkflow.embarque.vapor.id, this.instanciaWorkflow.lineUp['moduloDeCarga'].id)
        .subscribe( res => {
          console.log('obtenerRitmosLiquidos: ', res);
          this.ritmoDeCarga = res?.ritmoAcumulado ? res.ritmoAcumulado : 0;
        });
      }else{
      this.balanzaService.obtenerRitmos(this.instanciaWorkflow.embarque.vapor.id, this.instanciaWorkflow.lineUp['moduloDeCarga'].id)
        .subscribe( res => {
          console.log('obtenerRitmos: ', res);
          this.ritmoDeCarga = res?.ritmoDeCarga ? res.ritmoDeCarga : 0;
        });
      }
  
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