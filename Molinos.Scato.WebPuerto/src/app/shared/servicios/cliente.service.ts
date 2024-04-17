import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cliente } from '@ScatoModels/cliente/cliente';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
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
        let nroPagina = pagina != null ? pagina.toString() : null;
        let itemPorPagina = itemsPorPagina != null ? itemsPorPagina.toString() : null;
        let params = new HttpParams()
            .set('pagina', nroPagina)
            .set('itemsPorPagina', itemPorPagina)
            .set('nombre', nombre);
        return this.http.get<Cliente>(`${this.url}Clientes/ListarClientes`,
            {
                params: params,
                'withCredentials': true,
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
        return this.http.post(`${this.url}Clientes/GuardarCliente`, cliente, { 'withCredentials': true });
    }

    public obtenerCliente(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.url}Clientes/ObtenerCliente?id=${id}`, { 'withCredentials': true });
    }

    public eliminarCliente(cliente: any) {
        return this.http.post(`${this.url}Clientes/DeshabilitarCliente`, cliente, { 'withCredentials': true });
    }

    public exportarExcel(nombre: string): any {
        return this.http.get(`${this.url}Clientes/ExportarExcel?nombre=${nombre}`, { 'withCredentials': true, responseType: 'blob' });
    }

}
