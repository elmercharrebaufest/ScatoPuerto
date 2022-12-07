import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-programa-embarque',
  templateUrl: './programa-embarque.component.html',
  styleUrls: ['./programa-embarque.component.css']
})
export class ProgramaEmbarqueComponent implements OnInit {

  constructor(private route: Router,) { }

  ngOnInit(): void {
  }
  
  public onCrearNuevaNominacion(){
    this.route.navigate([`programa/nominacion`]);
  }
}
