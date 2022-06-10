import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card-buque',
  templateUrl: './card-buque.component.html',
  styleUrls: ['./card-buque.component.css']
})
export class CardBuqueComponent implements OnInit {

  // #region Variables
  @Input() buque: any;
  @Output() cerrar = new EventEmitter<boolean>();
  public fotoEmbarque: string;
  // #endregion

  // #region Constructor
  constructor() { }
  // #endregion

  // #region Eventos del Componente  
  ngOnInit(): void {
    this.fotoEmbarque = 'data:image/jpeg;base64,' + this.buque.informacion.fotoEmbarque;
  }
  // #endregion

  // #region Eventos Controles
  onCerrarModal(){
    this.cerrar.emit(true);
  }
  // #endregion

}