import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nominacion-registro',
  templateUrl: './nominacion-registro.component.html',
  styleUrls: ['./nominacion-registro.component.css']
})
export class NominacionRegistroComponent implements OnInit {

  public titulo: string = "Nueva Nominación"
  public idNominacion: number = 0;
  
  constructor(private router: Router,
              private route: ActivatedRoute) { 
      this.cargarValoresNominacion();
  }

  ngOnInit(): void {
  }

  public onGuardarNominacion(){
  }

  public onCancelarNominacion(){
    this.router.navigate([`programa`]);
  }

  private cargarValoresNominacion() {   
    const idNominacion = this.route.snapshot.paramMap.get('idnominacion');
    this.idNominacion = idNominacion !=null? parseInt(this.route.snapshot.paramMap.get('idnominacion')) : 0;
    this.titulo = this.idNominacion == 0 ? 'Nueva Nominación' : 'Editar Nominación';
  }

}
