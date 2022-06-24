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
    this.setCargarFoto();
  }
  // #endregion

  // #region Eventos Controles
  onCerrarModal(){
    this.cerrar.emit(true);
  }
  // #endregion

  // #region Metodos
  private setCargarFoto(){
    this.fotoEmbarque = this.buque.informacion.fotoEmbarque;
    if (this.fotoEmbarque != null || this.fotoEmbarque != undefined){
      this.fotoEmbarque = this.fotoEmbarque > '' ? ('data:image/png;base64,' + this.fotoEmbarque) : null;
    }else{
      this.fotoEmbarque = null
    }
  }
  // #endregion

}