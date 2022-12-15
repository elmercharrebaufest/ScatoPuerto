import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ProductoState } from 'app/store/productos/material.state';
import { GetObtenerProductos } from 'app/store/productos/material.actions';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GetObtenerDestino } from 'app/store/programa-embarque/destino/destino.actions';
import { GetObtenerExportador } from 'app/store/programa-embarque/exportador/exportador.actions';
import { GetObtenerCoordinadorPuerto } from 'app/store/programa-embarque/coordinador-puerto/coordinador-puerto.actions';
import { GetObtenerVapor } from 'app/store/programa-embarque/vapor/vapor.actions';
import { GetObtenerATAPuerto } from 'app/store/programa-embarque/ata-puerto/ata-puerto.actions';
import { GetObtenerAgenciaMaritimaPuerto } from 'app/store/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.actions';

@Injectable({
    providedIn: 'root'
})
export class NominacionDatoTecnicoService {

    @Select(ProductoState.getListaProductos) productos$: Observable<MaterialPuerto[]>;

    constructor(private store: Store) {
    }

    public cargarListasDeNominacion() {
        this.store.dispatch(new GetObtenerProductos());
        this.store.dispatch(new GetObtenerDestino());
        this.store.dispatch(new GetObtenerExportador());
        this.store.dispatch(new GetObtenerCoordinadorPuerto());
        this.store.dispatch(new GetObtenerVapor());
        this.store.dispatch(new GetObtenerATAPuerto());
        this.store.dispatch(new GetObtenerAgenciaMaritimaPuerto());
    }
    public async obtenerMaterialPuerto1() {
        this.productos$.subscribe(materialPuerto => {
          console.log('materialPuerto-->', materialPuerto);
        });
    }
    public obtenerMaterialPuerto(listaMaterialPuerto) {
        this.productos$.subscribe(data => {
            console.log('materialPuerto-->', data);
            listaMaterialPuerto = data;
        });        
    }
    public cargarMaterialPuerto() {
        this.store.dispatch(new GetObtenerProductos());
    }

    public cargarDestinos() {
        this.store.dispatch(new GetObtenerDestino());
    }

    public cargarExportador() {
        this.store.dispatch(new GetObtenerExportador());
    }

    public cargarCoordinadorPuerto() {
        this.store.dispatch(new GetObtenerCoordinadorPuerto());
    }

    public cargarVapor() {
        this.store.dispatch(new GetObtenerVapor());
    }

    public cargarTipoContrato() {

    }

    public cargarATAPuerto() {
        this.store.dispatch(new GetObtenerATAPuerto());
    }

    public cargarAgenciaMaritima() {
        this.store.dispatch(new GetObtenerAgenciaMaritimaPuerto());
    }

}