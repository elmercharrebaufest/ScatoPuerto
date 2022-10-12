import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-recibidores-buque',
  templateUrl: './recibidores.component.html',
  styleUrls: ['./recibidores.component.css']
})
export class RecibidoresComponent implements OnInit {

  @Input() esEmbarqueLiquido: boolean = false;

  constructor() { }
  ngOnInit(): void {
  }

}
