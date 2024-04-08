import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-datos-embarque',
  templateUrl: './datos-embarque.component.html',
  styleUrls: ['./datos-embarque.component.css']
})
export class DatosEmbarqueComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('DatosEmbarqueComponent');
  }
}