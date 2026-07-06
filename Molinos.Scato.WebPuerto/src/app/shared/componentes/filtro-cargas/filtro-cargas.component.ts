import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';

export type FiltroCargasModo = 'embarques' | 'embarques-por-buques';

@Component({
  selector: 'app-filtro-cargas',
  templateUrl: './filtro-cargas.component.html',
  styleUrls: ['./filtro-cargas.component.css']
})
export class FiltroCargasComponent implements OnInit {

  @Input() exportadores: any[] = [];
  @Input() materiales: any[] = [];
  @Input() balanzasPuerto: string[] = [];
  @Input() modo: FiltroCargasModo = 'embarques-por-buques';
  @Output() filtrar = new EventEmitter<any>();
  @Output() limpiar = new EventEmitter<void>();

  public filtroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private operacionesService: OperacionesPuertoService
  ) {}

  ngOnInit(): void {
    if (this.modo === 'embarques') {
      this.filtroForm = this.fb.group({
        NumeroBalanza: [null],
        Id: [null],
        Vapor: [null],
        Bodega: [null],
        Destino: [null],
        Exportador: [null],
        Material: [null],
        FechaDesde: [''],
        FechaHasta: ['']
      });
    } else {
      this.filtroForm = this.fb.group({
        Vapor: [''],
        Bodega: [''],
        Exportador_Id: [null],
        Material_Id: [null],
        FechaDesde: [''],
        FechaHasta: ['']
      });
    }
  }

  searchVapor = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarVapores(term))
  )

  searchBodega = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarBodegas(term))
  )

  searchExportador = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarExportadores(term))
  )

  searchDestino = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarDestinos(term))
  )

  searchMaterial = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => term.length < 1 ? [] : this.operacionesService.buscarMaterialesPuerto(term))
  )

  formatterNombre = (item: any) => item?.Nombre || item?.nombre || '';
  formatterMaterial = (item: any) => item?.Descripcion || item?.descripcion || '';

  tieneValorInvalido(controlName: string): boolean {
    const control = this.filtroForm?.get(controlName);
    if (!control || !control.touched) return false;
    const val = control.value;
    return typeof val === 'string' && val.trim().length > 0;
  }

  aplicarFiltro(): void {
    if (this.modo === 'embarques') {
      const v = this.filtroForm.value;
      const filtro: any = {};
      if (v.NumeroBalanza) filtro.NumeroBalanza = v.NumeroBalanza;
      if (v.Id) filtro.Id = v.Id;
      if (v.Vapor && typeof v.Vapor === 'object') {
        filtro.IdVapor = v.Vapor.Id || v.Vapor.id;
      }
      if (v.Bodega && typeof v.Bodega === 'object') {
        filtro.IdBodega = v.Bodega.Id || v.Bodega.id;
      }
      if (v.Exportador && typeof v.Exportador === 'object') {
        filtro.IdExportador = v.Exportador.Id || v.Exportador.id;
      }
      if (v.Destino && typeof v.Destino === 'object') {
        filtro.IdDestino = v.Destino.Id || v.Destino.id;
      }
      if (v.Material && typeof v.Material === 'object') {
        filtro.IdMaterial = v.Material.Id || v.Material.id;
      }
      if (v.FechaDesde) filtro.FechaDesde = v.FechaDesde;
      if (v.FechaHasta) filtro.FechaHasta = v.FechaHasta;
      this.filtrar.emit(filtro);
    } else {
      this.filtrar.emit(this.filtroForm.value);
    }
  }

  limpiarFiltro(): void {
    this.filtroForm.reset();
    this.limpiar.emit();
  }
}
