import { Injectable } from '@angular/core';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Destino } from '@ScatoModels/destino';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NominacionProcesoService {
  private _nominacion = new ReplaySubject<Nominacion>();
  private _destinosSeleccionados = new BehaviorSubject<Destino[]>([]);
  private _clientesSeleccionados = new BehaviorSubject<CoordinadorPuerto[]>([]);
  private _materialPuertoSeleccionado = new BehaviorSubject<MaterialPuerto>(undefined);

  public destinosSeleccionados$ = this._destinosSeleccionados.asObservable();
  public clientesSeleccionados$ = this._clientesSeleccionados.asObservable();
  public materialPuertoSeleccionado$ = this._materialPuertoSeleccionado.asObservable();
  public nominacionActual$ = this._nominacion.asObservable();

  constructor() { }

  public get destinosActuales() {
    return this._destinosSeleccionados.getValue();
  }

  public get clientesActuales() {
    return this._clientesSeleccionados.getValue();
  }

  public get materialPuertoActual() {
    return this._materialPuertoSeleccionado.getValue();
  }

  public inicializarServicio() {
    this._nominacion = new ReplaySubject<Nominacion>();
    this.nominacionActual$ = this._nominacion.asObservable();
    this._destinosSeleccionados.next([]);
    this._clientesSeleccionados.next([]);
    this._materialPuertoSeleccionado.next(undefined);
  }

  public setNominacion(n: Nominacion) {
    this._nominacion.next(n);
  }

  public actualizarDestinos(destinos: Destino[]) {
    if (!this.sonLosMismosDestinos(destinos)) {
      this._destinosSeleccionados.next(destinos);
    }
  }

  public actualizarClientes(coordinadores: CoordinadorPuerto[]) {
    if (!this.sonLosMismosClientes(coordinadores)) {
      this._clientesSeleccionados.next(coordinadores);
    }
  }

  public actualizarMaterialPuerto(materialPuerto: MaterialPuerto) {
    if (!this.esElMismoProducto(materialPuerto)) {
      this._materialPuertoSeleccionado.next(materialPuerto);
    }
  }

  private sonLosMismosDestinos(destinos: Destino[]) {
    const idDestinosActuales = this._destinosSeleccionados.getValue().map(d => d.id);
    const idDestinos = destinos.map(d => d.id);
    return JSON.stringify(idDestinosActuales) == JSON.stringify(idDestinos);
  }

  private sonLosMismosClientes(coordinadores: CoordinadorPuerto[]) {
    const idClientesActuales = this._clientesSeleccionados.getValue().map(c => c.id);
    const idClientes = coordinadores.map(c => c.id);
    return JSON.stringify(idClientesActuales) == JSON.stringify(idClientes);
  }

  private esElMismoProducto(materialPuerto: MaterialPuerto) {
    const idProductoActual = this._materialPuertoSeleccionado.getValue()?.id;
    return idProductoActual == materialPuerto.id;
  }

}
