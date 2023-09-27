import { AfipCondicionContenedor, AfipLugarOperativo, AfipNaturalezaEmbalaje, AfipPais, AfipPuerto, AfipPuntoAduanero, AfipTipoDocumento, AfipTipoEmbalaje } from '@ScatoModels/afip/tablas-afip';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { debounceTime, startWith, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TablasAfipService {

  private url: string = environment.apiUrl + 'afip/';
  constructor(private http: HttpClient) { }

  // TIPEMB_DESC
  public listarTiposEmbalaje(): Observable<AfipTipoEmbalaje[]> {
    return this.http.get<AfipTipoEmbalaje[]>(this.url + 'ListarTiposEmbalaje', { withCredentials: true });
  }

  // BUR_DESC
  public listarPuntosAduaneros(): Observable<AfipPuntoAduanero[]> {
    return this.http.get<AfipPuntoAduanero[]>(this.url + 'ListarPuntosAduaneros', { withCredentials: true });
  }

  // POR_PAIS
  public listarPuertos(): Observable<AfipPuerto[]> {
    return this.http.get<AfipPuerto[]>(this.url + 'ListarPuertos', { withCredentials: true });
  }

  // PAY_PAIS
  public listarPaises(): Observable<AfipPais[]> {
    return this.http.get<AfipPais[]>(this.url + 'ListarPaises', { withCredentials: true });
  }

  // DOCIDE_DESC
  public listarTiposDocumento(): Observable<AfipTipoDocumento[]> {
    return this.http.get<AfipTipoDocumento[]>(this.url + 'ListarTiposDocumento', { withCredentials: true });
  }

  // NEB_DESC
  public listarNaturalezasEmbalaje(): Observable<AfipNaturalezaEmbalaje[]> {
    return this.http.get<AfipNaturalezaEmbalaje[]>(this.url + 'ListarNaturalezasEmbalaje', { withCredentials: true });
  }

  // LOT_ADUA
  public listarLugaresOperativos(): Observable<AfipLugarOperativo[]> {
    return this.http.get<AfipLugarOperativo[]>(this.url + 'ListarLugaresOperativos', { withCredentials: true });
  }

  // CONCTD_DESC
  public listarCondicionesContenedor(): Observable<AfipCondicionContenedor[]> {
    return this.http.get<AfipCondicionContenedor[]>(this.url + 'ListarCondicionesContenedor', { withCredentials: true });
  }

  // Función que setea el comportamiento de un form control autocompletable
  public crearObservableAutocompletar<T>(form: FormGroup, controlName: string, data: T[]): Observable<T[]> {
    return form.get(controlName)?.valueChanges.pipe(
      debounceTime(500),
      startWith(''),
      map(val => this._filtrar(data, val))
    );
  }

  // Función que permite filtrar los arrays para los desplegables
  private _filtrar<T>(arr: T[], val: string): T[] {
    if (typeof (val) != 'string') { // Cuando se selecciona una opción se produce un valueChanges con el valor como objeto. Ya no sería necesario filtrar
      return;
    }
    const lowerVal = val.toLocaleLowerCase().trim();
    const res = arr.filter(item =>
      item['descripcion'].toLocaleLowerCase().indexOf(lowerVal) > -1 ||
      item['codigo'].toLocaleLowerCase().indexOf(lowerVal) > -1
    );
    return res.slice(0, 10);
  }
}
