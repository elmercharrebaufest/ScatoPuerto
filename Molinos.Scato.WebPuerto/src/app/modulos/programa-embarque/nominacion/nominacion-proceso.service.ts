import { Injectable } from '@angular/core';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Destino } from '@ScatoModels/destino';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NominacionProcesoService {

  private _destinosSeleccionados = new BehaviorSubject<Destino[]>([]);
  private _clientesSeleccionados = new BehaviorSubject<CoordinadorPuerto[]>([]);
  private _materialPuertoSeleccionado = new BehaviorSubject<MaterialPuerto>(undefined);
  public destinosSeleccionados$ = this._destinosSeleccionados.asObservable();
  public clientesSeleccionados$ = this._clientesSeleccionados.asObservable();
  public materialPuertoSeleccionado$ = this._materialPuertoSeleccionado.asObservable();

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

  public inicializar() {
    this._destinosSeleccionados.next([]);
  }

  public actualizarDestinos(destinos: Destino[]) {
    this._destinosSeleccionados.next(destinos);
  }

  public actualizarClientes(coordinadores: CoordinadorPuerto[]) {
    this._clientesSeleccionados.next(coordinadores);
  }

  public actualizarMaterialPuerto(materialPuerto: MaterialPuerto) {
    this._materialPuertoSeleccionado.next(materialPuerto);
  }

}
