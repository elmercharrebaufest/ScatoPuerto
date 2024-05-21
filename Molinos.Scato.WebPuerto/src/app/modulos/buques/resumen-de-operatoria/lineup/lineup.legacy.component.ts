import { Component, OnInit } from '@angular/core';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ActivatedRoute } from '@angular/router';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { ResumenOperatoriaEmbarque } from '@ScatoModels/Buques/resumenOperatoria';

@Component({
  selector: 'app-legacy-lineup-buque',
  templateUrl: './lineup.legacy.component.html',
  styleUrls: ['./lineup.legacy.component.css']
})
export class LineupLegacyComponent implements OnInit {
  captura: string | ArrayBuffer;
  mostrarImagen: boolean = false;
  cargandoImagenLineUp: boolean = true;
  
  private embarqueId: number = 0;

  constructor(private route: ActivatedRoute,
              private buqueSharingService: BuqueSharingService,
              private embarqueService: EmbarqueService) { 
    
    this.embarqueId = parseInt(this.route.snapshot.paramMap.get('embarqueid'));  
    this.actualizarEmbarqueLineUp();
  }

  ngOnInit(): void {
    // console.log('LineupLegacyComponent.ngOnInit()');
    this.mostrarImagenLineUp();
  }

  private actualizarEmbarqueLineUp(){
    this.buqueSharingService.getActualizarResumenOperatoria().subscribe(res=>{
      const resumenOperatoriaEmbarque: ResumenOperatoriaEmbarque = res;
      if (resumenOperatoriaEmbarque !=null && resumenOperatoriaEmbarque.actualizarDatos) {
          this.embarqueId = resumenOperatoriaEmbarque.embarqueId;
          this.mostrarImagenLineUp();
      }
    });
  }
  
  private mostrarImagenLineUp(){
    this.mostrarImagen = false;
    this.embarqueService.obtenerEmbarque(this.embarqueId)
    .subscribe( embarque => {
      if (embarque!=null){
        this.captura = embarque.filePathImgLineUp;
      }
    }, error => {
      this.mostrarImagen = true;
      this.cargandoImagenLineUp = false;
    }, () => {
      this.mostrarImagen = true;
      this.cargandoImagenLineUp = false;
     });
  }
}
