import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BalanzaPuertoService } from 'app/shared/servicios/balanza-puerto.service';
import { ConfirmationDialogService } from 'app/shared/servicios/confirmation-dialog.service';

@Component({
  selector: 'app-configuracion-puerto',
  templateUrl: './configuracion-puerto.component.html',
  styleUrls: ['./configuracion-puerto.component.css']
})
export class ConfiguracionPuertoComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public mensaje: string = 'Cargando datos';
  public filtroTexto: string = '';
  public modoEdicion: boolean = false;
  public editandoId: number = null;
  public balanzaForm: FormGroup;

  constructor(
    private balanzaService: BalanzaPuertoService,
    private confirmDialog: ConfirmationDialogService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargar();
  }

  initForm(): void {
    this.balanzaForm = this.fb.group({
      CodigoBalanza: ['', Validators.required],
      CodigoDispositivo: [''],
      CentroId: [null],
      Administrativa: [false],
      OffSetPlc: [null],
      IntentosValidacion: [null]
    });
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.balanzaService.listar(this.filtroTexto, pagina).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      err => { this.cargando = false; }
    );
  }

  onBuscar(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.cargar(1);
  }

  onNuevo(): void {
    this.modoEdicion = true;
    this.editandoId = null;
    this.balanzaForm.reset({ Administrativa: false });
  }

  onEditar(item: any): void {
    this.modoEdicion = true;
    this.editandoId = item.Id;
    this.balanzaForm.patchValue(item);
  }

  onGuardar(): void {
    if (this.balanzaForm.invalid) return;
    const dto = { ...this.balanzaForm.value, Id: this.editandoId };
    const op$ = this.editandoId
      ? this.balanzaService.modificar(dto)
      : this.balanzaService.crear(dto);

    op$.subscribe(
      () => { this.modoEdicion = false; this.cargar(); },
      err => console.error(err)
    );
  }

  onCancelar(): void {
    this.modoEdicion = false;
    this.balanzaForm.reset();
  }

  onEliminar(item: any): void {
    this.confirmDialog.confirm(
      'Eliminar balanza',
      `¿Desea eliminar la balanza ${item.CodigoBalanza}?`,
      'Eliminar', 'Cancelar'
    ).then(confirmado => {
      if (confirmado) {
        this.balanzaService.eliminar(item.Id).subscribe(() => this.cargar());
      }
    });
  }

  onPage(page: PageEvent): void {
    this.cargar(page.pageIndex + 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cargar(pagina);
  }
}
