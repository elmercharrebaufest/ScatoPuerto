import { ClienteService } from '@ScatoServicios/cliente.service';
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

  constructor(private formBuilder : FormBuilder, private clienteService: ClienteService) { 
    this.setFiltroBuquedaForm();
    this.onBuscar();
  }

  ngOnInit(): void {
  }

  public setFiltroBuquedaForm() {
    this.filtroBuquedaForm = this.formBuilder.group({
      nombre: '',
    });    
  }

  onLimpiarFiltros() {
    this.filtroBuquedaForm.controls.nombre.setValue('');
    this.onBuscar();    
  }

  onBuscar() {
    this.estaCargando = true;
    this.clienteService.ListarClientes(
      null,
      null,  
      this.filtroBuquedaForm.controls.nombre.value)
    this.estaCargando = false;
  } 

  public getFiltroBusquedaForm() {    
    return this.filtroBuquedaForm;
  }

}
