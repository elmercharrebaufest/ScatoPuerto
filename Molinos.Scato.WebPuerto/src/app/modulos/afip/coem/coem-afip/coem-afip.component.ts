import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { COEM } from '@ScatoModels/afip/coem';
import { EstadoCOEM } from '@ScatoModels/afip/estadoCoem';
import { AfipMotivoSolicitudCambio } from '@ScatoModels/afip/tablas-afip';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-coem-afip',
  templateUrl: './coem-afip.component.html',
  styleUrls: ['./coem-afip.component.css']
})
export class CoemAfipComponent implements OnInit {

  private listaHistorialCoem: COEM[] = [];
  public load: boolean = false;
  esNoExisteRegistros: boolean = true;
  coem: COEM = new COEM();
  coemId: number;
  coemIdentificador: string;
  coemImo: string;
  listaEstados: EstadoCOEM[] = [];
  solicitarNoABordoForm : FormGroup;

  public caratulaId: number;
  public coemsSeleccionadas: COEM[] = [];
  public listaMotivos: AfipMotivoSolicitudCambio[] = [];

  private modal: NgbModalRef;

  // Paginado
  currentPage: number = 1; // Página actual
  totalPages: number; // Total de páginas
  totalItems: number; // Total de elementos
  itemsPerPage: number = 5; // Elementos por página
  visiblePages: number[] = []; // Páginas visibles en la paginación
  showEllipsisStart: boolean = false; // Mostrar puntos suspensivos al inicio
  showEllipsisEnd: boolean = false; // Mostrar puntos suspensivos al final
  listadoCoems: COEM[] = []; // Elementos mostrados en la tabla

  constructor(
    private modalService: NgbModal,
    private coemAfipService: CoemAfipService,
    private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute,
    private tablasAfipService: TablasAfipService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initForms();

    this.route.params.subscribe(params => {
      this.caratulaId = Number(params['id']);
      this.cargarDatos();
    });

    this.tablasAfipService.listarMotivosNoABordo().subscribe(motivos =>
      this.listaMotivos = motivos,
      err => console.error(err)
    );
  }

  public cargarDatos() {
    const obsCoems = this.caratulaId ? this.coemAfipService.listarCoemsDeCaratula(this.caratulaId) : this.coemAfipService.listarCoems();
    const obsEstados: Observable<EstadoCOEM[]> = this.listaEstados.length ? of(null) : this.coemAfipService.estadosCoem(); // no es necesario cargar los estados si ya estan
    forkJoin([obsEstados, obsCoems]).subscribe(([estados, coems]) => {
      if (estados) {
        this.listaEstados = estados;
      }
      this.listaHistorialCoem = coems;
      this.crearPaginado();
    }, error => {
      console.error(error);
    }, () => this.load = false);
  }

  editFinish(event) {
    this.cargarDatos();
  }

  public editarCoem(historial, modal) {
    this.coemId = historial.id;
    this.coemIdentificador = historial.identificadorCOEM
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  public async eliminarCoem(id: number, identificadorCOEM: string) {
    const confirmacion = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de eliminar la COEM con id: ${identificadorCOEM}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirmacion) {
      return;
    }

    this.load = true;
    this.coemAfipService.anularCoem(id).subscribe(() => {
      this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La COEM con id: ${identificadorCOEM} fue eliminada con éxito!`, 'Cerrar', '', null, null, Tipoalerta.Success)
      this.cargarDatos();
    }, (err) => {
      console.error(err);
      const msj = err.error || 'No se ha podido anular la COEM, comunicarse con soporte técnico';
      this.confirmationDialogService.confirm(`¡Error!`, msj, 'Cerrar', '', null, null, Tipoalerta.Error);
    }, () => this.load = false)
  }

  public async cerrarCoem(id: number, identificadorCOEM: string) {
    const confirmacion = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de <b>CERRAR</b> la COEM con id: ${identificadorCOEM}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
    if (!confirmacion) {
      return;
    }

    this.load = true;
    this.coemAfipService.cerrarCoem(id).subscribe(() => {
      this.confirmationDialogService.confirm('¡Felicitaciones', `¡La COEM con id ${identificadorCOEM} se ha podido cerrar con éxito!`, 'Cerrar', '', null, null, Tipoalerta.Success);
      this.cargarDatos();
    }, (err) => {
      console.error(err);
      const msj = err.error || `No se ha podido CERRAR la COEM, comunicarse con soporte técnico`;
      this.confirmationDialogService.confirm('¡Error!', msj, 'Cerrar', '', null, null, Tipoalerta.Error);
    }, () => this.load = false);
  }

  public async cambiarEstado(event: Event, idCoem: number, identificadorCOEM: string) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.value;
    const confirmacion = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de cambiar el estado del COEM con id: ${identificadorCOEM}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
    if (!confirmacion) {
      this.cargarDatos();
      return;
    }
    this.load = true;
    this.coemAfipService.cambiarEstadosCoem(selectedOption, idCoem).subscribe((datos) => {
      this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La Estado del COEM con id: ${identificadorCOEM} fue cambiado con éxito!`, 'Cerrar', '', null, null, Tipoalerta.Success)
      this.cargarDatos();
    }, (error) => {
      console.error(error);
      this.confirmationDialogService.confirm(`¡Error!`, 'No se ha podido cambiar el estado del COEM, comunicarse con soporte técnico', 'Cerrar', '', null, null, Tipoalerta.Error);
    })
  }

  public mostrarMercaderias(event: Event, trMercaderias: HTMLTableRowElement) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      trMercaderias.classList.remove('d-none');
      checkbox.nextElementSibling.className = 'fa fa-chevron-up';
    } else {
      trMercaderias.classList.add('d-none');
      checkbox.nextElementSibling.className = 'fa fa-chevron-down';
    }
  }

  public esCoemSeleccionada(coem: COEM, tr: HTMLTableRowElement) {
    if (this.coemsSeleccionadas.indexOf(coem) != -1) {
      tr.classList.add('checked');
      return true;
    }
    tr.classList.remove('checked');
    return false;
  }

  public seleccionarCoem(event: Event, coem: COEM) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.coemsSeleccionadas.push(coem);
    } else {
      this.coemsSeleccionadas.splice(this.coemsSeleccionadas.indexOf(coem), 1);
    }
    setTimeout(() => {
      const checkboxTodos = document.querySelector('thead input') as HTMLInputElement;
      checkboxTodos.checked = this.coemsSeleccionadas.length == this.listaHistorialCoem.length;
    }, 30);
  }

  public seleccionarTodas(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.coemsSeleccionadas = [...this.listaHistorialCoem];
    } else {
      this.coemsSeleccionadas = [];
    }
  }

  public async solicitarNoABordo() {
    const alertar = (titulo: string, mensaje: string, tipo: Tipoalerta, confirmar?: boolean) => this.confirmationDialogService.confirm(
      titulo, mensaje, confirmar ? 'Sí' : 'Cerrar', confirmar ? 'Cancelar' : '', null, null, tipo
    );

    const confirmacion = await alertar('Advertencia', `¿Está seguro de solicitar no a bordo a para la COEM ${this.coemIdentificador}?`, Tipoalerta.Warning, true);
    if (!confirmacion) {
      return;
    }
    var codigoMotivo = this.solicitarNoABordoForm.get('codigoMotivo').value;
    this.load = true;
    this.coemAfipService.solicitarNoABordo(this.coemId, this.caratulaId, codigoMotivo).subscribe(() => {
      alertar('Resultado exitoso', 'Se ha solicitado no a bordo correctamente para la COEM ' + this.coemIdentificador, Tipoalerta.Success);
    }, (err) => {
      console.error(err);
      const msj = err.error || 'Ha ocurrido un error al solicitar no a bordo';
      alertar('¡Error!', msj, Tipoalerta.Error);
    }, () => {
      this.load = false;
    });
  }

  public abrirModal(modal: any, coem : COEM) {
    this.coemId = coem.id;
    this.coemIdentificador = coem.identificadorCOEM;
    
    this.modal = this.modalService.open(modal, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
  }

  public cerrarModal() {
    this.modal.close();
    this.load = false;
  }

  public async solicitarCierreCarga() {
    const alertar = (titulo: string, mensaje: string, tipo: Tipoalerta, confirmar?: boolean) => this.confirmationDialogService.confirm(
      titulo, mensaje, confirmar ? 'Sí' : 'Cerrar', confirmar ? 'Cancelar' : '', null, null, tipo
    );

    if (!this.coemsSeleccionadas.length) {
      alertar('¡Error!', 'No se han seleccionado COEMs', Tipoalerta.Error);
      return;
    }

    const coemsEstadoinvalido = this.coemsSeleccionadas.filter(coem => coem.afipCoemEstado.codigo != 'AUTO').map(coem => coem.identificadorCOEM);
    if (this.coemsSeleccionadas.some(coem => coem.afipCoemEstado.codigo != 'AUTO')) {
      alertar('¡Error!', `Las COEMs ${coemsEstadoinvalido.join(', ')} no se encuentran en el estado 'AUTO'`, Tipoalerta.Error);
      return;
    }

    const identificadores = this.coemsSeleccionadas.map(coem => coem.identificadorCOEM);
    const confirmacion = await alertar('Advertencia', `¿Está seguro de solicitar cierre de carga para las siguientes COEMs: ${identificadores.join(', ')}?`, Tipoalerta.Warning, true);
    if (!confirmacion) {
      return;
    }

    this.load = true;
    this.coemAfipService.solicitarCierreDeCarga(this.coemsSeleccionadas, this.caratulaId).subscribe(() => {
      alertar('Resultado exitoso', 'Se ha solicitado correctamente el cierre de carga para las COEMs ' + identificadores.join(', '), Tipoalerta.Success);
    }, (err) => {
      console.error(err);
      const msj = err.error || 'Ha ocurrido un error al solicitar cierre de carga';
      alertar('¡Error!', msj, Tipoalerta.Error);
    }, () => {
      this.load = false;
    });
  }

  private initForms() {
       this.solicitarNoABordoForm = this.formBuilder.group({      
        codigoMotivo: ['', Validators.required]      
    });    
  }

  //#region Funciones de paginado
  private crearPaginado() {
    // Calcular el total de elementos y las páginas
    this.totalItems = this.listaHistorialCoem.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    // Mostrar los elementos de la página actual
    this.listadoCoems = this.getItemsForPage(this.currentPage);
    // Calcular las páginas visibles
    this.calculateVisiblePages();
  }

  public getListaHistorialCoem() {
    return this.listadoCoems;
  }

  goToPage(page: number) {
    // Validar que la página esté dentro de los límites
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.listadoCoems = this.getItemsForPage(this.currentPage);
      this.calculateVisiblePages();
    }
  }

  getItemsForPage(page: number): any[] {
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.listaHistorialCoem.slice(startIndex, endIndex);
  }

  calculateVisiblePages() {
    const pagesToShow = 5; // Número máximo de páginas visibles
    const half = Math.floor(pagesToShow / 2); // Mitad de las páginas visibles

    // Inicializar las banderas
    this.showEllipsisStart = false;
    this.showEllipsisEnd = false;

    // Calcular el rango de páginas visibles
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(start + pagesToShow - 1, this.totalPages);

    // Ajustar el rango si está cerca de los extremos
    if (end - start + 1 < pagesToShow) {
      start = Math.max(1, end - pagesToShow + 1);
    }

    // Mostrar puntos suspensivos al inicio si hay páginas ocultas
    if (start > 1) {
      this.showEllipsisStart = true;
    }

    // Mostrar puntos suspensivos al final si hay páginas ocultas
    if (end < this.totalPages) {
      this.showEllipsisEnd = true;
    }

    // Generar el arreglo de páginas visibles
    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }
  //#endregion

}
