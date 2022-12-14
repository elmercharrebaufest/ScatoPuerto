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


    constructor(private store: Store) {
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