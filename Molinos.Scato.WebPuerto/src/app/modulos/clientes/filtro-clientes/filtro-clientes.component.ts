import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-filtro-clientes',
  templateUrl: './filtro-clientes.component.html',
  styleUrls: ['./filtro-clientes.component.css']
})
export class FiltroClientesComponent implements OnInit {

  private filtroBuquedaForm: FormGroup;
  filtros = new Subject<any>();
  public estaCargando = true;

  constructor(private formBuilder : FormBuilder/*, clienteService: ClienteService*/) { 
    this.setFiltroBuquedaForm();
    this.onBuscar();
  }

  ngOnInit(): void {
  }

  public setFiltroBuquedaForm() {
    this.filtroBuquedaForm = this.formBuilder.group({
      nombre: '',
      cuit: '',
    });    
  }

  onLimpiarFiltros() {
    this.filtroBuquedaForm.controls.nombre.setValue('');
    this.filtroBuquedaForm.controls.cuit.setValue('');
    this.onBuscar();    
  }

  onBuscar() {
    this.estaCargando = true;
    /*this.vaporService.ListarVaporInformacion(
      null,
      null,  
      this.filtroBuquedaForm.controls.buque.value,
      this.filtroBuquedaForm.controls.imo.value,
      this.filtroBuquedaForm.controls.tipoBuque.value,
      this.filtroBuquedaForm.controls.bandera.value)*/
    this.estaCargando = false;
  } 

  public getFiltroBusquedaForm() {    
    return this.filtroBuquedaForm;
  }

}
