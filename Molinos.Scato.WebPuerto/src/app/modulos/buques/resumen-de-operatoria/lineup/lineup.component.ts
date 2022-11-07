import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lineup-buque',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.css']
})
export class LineupComponent implements OnInit {
  captura: string | ArrayBuffer;
  private embarqueId: number = 0;

  constructor(private route: ActivatedRoute,
              private embarqueService: EmbarqueService) { 
    
    this.embarqueId = parseInt(this.route.snapshot.paramMap.get('embarqueid'));  
  }

  ngOnInit(): void {
    this.mostrarImagenLineUp();
  }

  private mostrarImagenLineUp(){
    this.embarqueService.obtenerEmbarque(this.embarqueId)
    .subscribe( embarque => {
      if (embarque!=null){
        this.captura = embarque.filePathImgLineUp;
      }
    });
  }
  
}
