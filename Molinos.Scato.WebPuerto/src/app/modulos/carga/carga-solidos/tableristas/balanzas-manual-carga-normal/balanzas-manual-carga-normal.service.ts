import { BalanzaManual, DestinosPorMaterialPuertoBodega, ExportadorPorMaterialPuerto} from "@ScatoModels/balanza-manual/balanza-manual";
import { PeriodoDeCarga } from "@ScatoModels/periodo-carga";
import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { BehaviorSubject } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class BalanzasManualCargaNormalService {
    private _balanzaManual: BehaviorSubject<BalanzaManual> = new BehaviorSubject<BalanzaManual>(null);
    private _destinosBodegaPorMaterial: BehaviorSubject<DestinosPorMaterialPuertoBodega[]> = new BehaviorSubject<DestinosPorMaterialPuertoBodega[]>(null);
    private _exportadoresPorMaterial: BehaviorSubject<ExportadorPorMaterialPuerto[]> = new BehaviorSubject<ExportadorPorMaterialPuerto[]>(null);
    private _periodoDeCarga: BehaviorSubject<PeriodoDeCarga> = new BehaviorSubject<PeriodoDeCarga>(null);
    private _registroBalanza: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private formBuilder: FormBuilder) {
    }

    set RegistroBalanza(value: any) {
      this._registroBalanza.next(value);
    }
    get RegistroBalanza() {
        return this._registroBalanza.asObservable();
    }
    set PeriodoDeCarga(value: any) {
      this._periodoDeCarga.next(value);
    }
    get PeriodoDeCarga() {
        return this._periodoDeCarga.asObservable();
    }
    set DestinosPorMaterialPuertoBodega(value: any) {
      this._destinosBodegaPorMaterial.next(value);
    }
    get DestinosPorMaterialPuertoBodega() {
        return this._destinosBodegaPorMaterial.asObservable();
    }
    set ExportadorPorMaterialPuerto(value: any) {
      this._exportadoresPorMaterial.next(value);
    }
    get ExportadorPorMaterialPuerto() {
        return this._exportadoresPorMaterial.asObservable();
    }
    set BalanzaManual(value: any) {
      this._balanzaManual.next(value);
    }
    get BalanzaManual() {
        return this._balanzaManual.asObservable();
    }
    inicializaCargaNormal(x: BalanzaManual = null, esCorteManual: boolean = false) {
      return this.formBuilder.group({
        id: x?.id ?? 0,
        fechaInicio: x?.fechaInicio ?? '',
        horaInicio: x?.horaInicio ?? '',
        fechaCorte: x?.fechaCorte ?? '',
        horaCorte: x?.horaCorte ?? '',
        material: x?.material ?? null,
        bodega: x?.bodega ?? null,
        destino: x?.destino ?? null,
        exportador: x?.exportador ?? null,
        motivosFallasBalanza: x?.motivosFallasBalanza ?? null,
        kilogramos: x?.kilogramos ?? 0,
        toneladas: x?.kilogramos / 1000,
        corteManual: x?.corteManual ?? esCorteManual,
        cargaNormal: x?.cargaNormal ? x?.cargaNormal : null,
        observaciones: x?.observaciones ?? '',
        correlativo: x?.correlativo ?? 0,
      });
    }
}