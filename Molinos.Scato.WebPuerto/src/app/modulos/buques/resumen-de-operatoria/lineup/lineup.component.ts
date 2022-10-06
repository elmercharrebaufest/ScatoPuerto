import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { finalize } from 'rxjs/operators';
import { Embarque } from '@ScatoModels/embarque';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.css']
})
export class LineupComponent implements OnInit, AfterViewInit {
  captura: string | ArrayBuffer;

  constructor(private embarqueService: EmbarqueService) { 
  }

  ngAfterViewInit(): void {
    let embarque: Embarque;
    
    // TODO: Por ahora está a mano hasta unir lo producido por el equipo.
    this.embarqueService.obtenerEmbarque(1020)
    .pipe( finalize(() => {
      console.log('embarque: ', embarque);
    }) )
    .subscribe( res => {
      if (res!=null){
        embarque = res;
        this.captura = embarque.filePathImgLineUp;
      }
    });
  }

  ngOnInit(): void {
  }

}
