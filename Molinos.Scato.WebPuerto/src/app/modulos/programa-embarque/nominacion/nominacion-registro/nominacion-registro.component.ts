import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nominacion-registro',
  templateUrl: './nominacion-registro.component.html',
  styleUrls: ['./nominacion-registro.component.css']
})
export class NominacionRegistroComponent implements OnInit {
  public titulo: string = "Nueva Nominación"

  constructor(private route: Router) { }

  ngOnInit(): void {
  }


  public onGuardarNominacion(){
  }
  
  public onCancelarNominacion(){
    this.route.navigate([`programa`]);
  }

}
