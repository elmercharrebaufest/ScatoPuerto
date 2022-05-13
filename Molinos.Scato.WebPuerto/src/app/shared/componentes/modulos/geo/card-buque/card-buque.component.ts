import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card-buque',
  templateUrl: './card-buque.component.html',
  styleUrls: ['./card-buque.component.css']
})
export class CardBuqueComponent implements OnInit {

  @Input() buque: any;
  @Output() cerrar = new EventEmitter<boolean>();
  
  constructor() { }

  ngOnInit(): void {
  }

  cerrarModal(){
    this.cerrar.emit(true);
  }

}