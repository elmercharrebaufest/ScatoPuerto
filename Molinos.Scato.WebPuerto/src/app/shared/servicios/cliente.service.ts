import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cliente } from '@ScatoModels/cliente/cliente';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class ClienteService {

    private url: string = environment.apiUrl;
    listadoClientes: any;
    observableCliente = new Subject<any[]>();
    observableMensaje = new Subject<string>();
    filtros = {
        pagina: 1,
        itemsPorPagina: 20,
        nombre: "",
    }

    constructor(
        private http: HttpClient
    ) {
    }

    public ListarClientes(pagina: number = this.filtros.pagina, itemsPorPagina: number = this.filtros.itemsPorPagina,
        nombre: string = this.filtros.nombre) {
        this.actualizarFiltros(pagina, itemsPorPagina, nombre);
        return this.http.get<Cliente>(`${this.url}Clientes/ListarClientes?pagina=${this.filtros.pagina}&itemsPorPagina=${this.filtros.itemsPorPagina}&nombre=${this.filtros.nombre}`,
            {
                'withCredentials': true
            })
            .subscribe(
                (data: any) => {
                    this.listadoClientes = data;
                    this.observableCliente.next(this.listadoClientes.slice())
                }
            );
    }

    actualizarFiltros(pagina: number, itemsPorPagina: number, nombre: string) {
        this.filtros.nombre = nombre;
        this.filtros.itemsPorPagina = itemsPorPagina;
        this.filtros.pagina = pagina;
    }

    public guardarCliente(cliente: any) {
        return this.http.post(`${this.url}Cliente/GuardarCliente`, cliente, { 'withCredentials': true });
    }

}
