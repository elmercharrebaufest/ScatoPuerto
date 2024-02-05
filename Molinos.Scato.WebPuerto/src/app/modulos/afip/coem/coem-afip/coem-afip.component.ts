import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { COEM } from '@ScatoModels/afip/coem';
import { EstadoCOEM } from '@ScatoModels/afip/estadoCoem';
import { AfipMotivoSolicitudCambio } from '@ScatoModels/afip/tablas-afip';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, forkJoin, of } from 'rxjs';


// TODO: AHORA QUE SE LISTAN LAS COEMS POR PÁGINAS, PODRÍA OCURRIR QUE NO SE LISTEN TODAS LAS COEMS DE LA CARATULA
// ESTO PROVOCARÍA QUE AL MOMENTO DE SOLICITAR CIERRE NO SE VEAN EN EL MODAL TODAS LAS COEMS!!!
// Esto podría no ser prioritario porque dificilmente se dé que haya más de una página de COEMs por carátula
@Component({
  selector: 'app-coem-afip',
  templateUrl: './coem-afip.component.html',
  styleUrls: ['./coem-afip.component.css']
})
export class CoemAfipComponent implements OnInit, OnDestroy {

  private listaHistorialCoem: COEM[] = [];
  public load: boolean = false;
  esNoExisteRegistros: boolean = true;
  coem: COEM = new COEM();
  coemId: number;
  coemIdentificador: string;
  coemImo: string;
  listaEstados: EstadoCOEM[] = [];
  solicitarNoABordoForm: FormGroup;
  public formFiltros: FormGroup;

  public caratulaId: number;
  public listaMotivos: AfipMotivoSolicitudCambio[] = [];
  private suscripcion: Subscription;

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
    private caratulaService: CaratulaAfipService,
    private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute,
    private tablasAfipService: TablasAfipService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initForms();

    this.route.params.subscribe(params => {
      this.caratulaId = Number(params['id']);
      this.suscripcion = this.coemAfipService.$recargarCoems.subscribe(() => {
        this.cargarDatos();
      });
      this.cargarDatos();
    });

    this.tablasAfipService.listarMotivosNoABordo().subscribe(motivos =>
      this.listaMotivos = motivos,
      err => console.error(err)
    );
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  public cargarDatos(params: any = {}) {
    this.load = true;
    params.pagina = this.currentPage;
    params.itemsPorPagina = this.itemsPerPage;
    params.idCaratula = this.caratulaId || null;
    const obsCoems = this.coemAfipService.listarCoems(params);
    const obsEstados: Observable<EstadoCOEM[]> = this.listaEstados.length ? of(null) : this.coemAfipService.estadosCoem(); // no es necesario cargar los estados si ya estan
    forkJoin([obsEstados, obsCoems]).subscribe(([estados, coems]) => {
      if (estados) {
        this.listaEstados = estados;
      }
      if (this.caratulaId) {
        this.caratulaService.$caratulaCoems.next(coems);
      }
      this.listaHistorialCoem = coems;
      this.crearPaginado();
      this.load = false;
    }, error => {
      console.error(error);
      this.load = false;
    });
  }

  editFinish(event) {
    this.cargarDatos();
  }

  public editarCoem(historial, modal) {
    this.coemId = historial.id;
    this.coemIdentificador = historial.identificadorCOEM
    this.modalService.open(modal, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  public async eliminarCoem(id: number, identificadorCOEM: string) {
    const confirmacion = await this.confirmationDialogService.confirmar('Advertencia', `¿Está seguro de eliminar la COEM con id: ${identificadorCOEM}?`);
    if (!confirmacion) {
      return;
    }

    this.load = true;
    this.coemAfipService.anularCoem(id).subscribe(() => {
      this.confirmationDialogService.exito(`Se ha eliminado la COEM con id: ${identificadorCOEM}`);
      this.cargarDatos();
    }, (err) => {
      console.error(err);
      this.load = false;
      const msj = err.error || 'No se ha podido anular la COEM, comunicarse con soporte técnico';
      this.confirmationDialogService.error(msj);
    })
  }

  public async cerrarCoem(id: number, identificadorCOEM: string) {
    const confirmacion = await this.confirmationDialogService.confirmar('Advertencia', `¿Está seguro de <b>CERRAR</b> la COEM con id: ${identificadorCOEM}?`);
    if (!confirmacion) {
      return;
    }

    this.load = true;
    this.coemAfipService.cerrarCoem(id).subscribe(() => {
      this.confirmationDialogService.exito(`Se ha cerrado la COEM con id ${identificadorCOEM}`);
      this.cargarDatos();
    }, (err) => {
      console.error(err);
      this.load = false;
      const msj = err.error || `No se ha podido CERRAR la COEM, comunicarse con soporte técnico`;
      this.confirmationDialogService.error(msj);
    });
  }

  public async cambiarEstado(event: Event, idCoem: number, identificadorCOEM: string, codigoEstado: string) {
    const selectElement = event.target as HTMLSelectElement;

    if (await this.validarEstadoCoem(selectElement, codigoEstado)) {
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
    } else {
      this.cargarDatos();
    }
  }

  openModal(titulo: string, texto: string, tipoAlerta: Tipoalerta) {
    return this.confirmationDialogService.confirm(titulo, texto, 'Cerrar', '', null, null, tipoAlerta);
  }

  async validarEstadoCoem(selectElement, codigoEstado): Promise<boolean> {

    const codigoSeleccionado = this.listaEstados.find(e => e.id === selectElement.selectedIndex).codigo;
    let valido: boolean = true;

    const showModalAndCheckConfirmation = async (texto: string): Promise<void> => {
      const confirmation = await this.openModal("¡Alerta!", texto, Tipoalerta.Warning);
      if (confirmation) {
        valido = false;
      }
    };

    switch (codigoSeleccionado) {
      case "CUR":
        if (codigoEstado !== "CUR") {
          await showModalAndCheckConfirmation("La COEM no puede volver a estar en el estado EN CURSO");
        }
        break;

      case "ANU":
        if (codigoEstado !== "CUR" && codigoEstado !== "REG" && codigoEstado !== "PRE") {
          await showModalAndCheckConfirmation("Para ANULAR la COEM, debe estar en CURSO, REGISTRADA o PRESENTADA");
        }
        break;

      case "REG":
        if (codigoEstado !== "CUR") {
          await showModalAndCheckConfirmation("Para cambiar la COEM a REGISTRADA, debe estar en estado EN CURSO");
        }
        break;

      case "PRE":
        if (codigoEstado !== "REG") {
          await showModalAndCheckConfirmation("Para cambiar la COEM a PRESENTADA, debe estar en estado REGISTRADA");
        }
        break;

      case "REC":
        if (codigoEstado !== "PRE") {
          await showModalAndCheckConfirmation("Para cambiar la COEM a RECHAZADA, debe estar en estado PRESENTADA");
        }
        break;

      case "AUTO":
        if (codigoEstado !== "PRE") {
          await showModalAndCheckConfirmation("Para cambiar la COEM a AUTORIZADA, debe estar en estado PRESENTADA");
        }
        break;

      case "CAN":
        if (codigoEstado !== "AUTO") {
          await showModalAndCheckConfirmation("Para cambiar la COEM a CANCELADA, debe estar en estado AUTORIZADA");
        }
        break;

      case "CODE":
        if (codigoEstado !== "AUTO") {
          await showModalAndCheckConfirmation("Para transformar la COEM en una CODE, debe estar en estado AUTORIZADA");
        }
        break;
    }

    return valido;
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

  public async solicitarNoABordo(coem: COEM) {
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

  public async solicitarAnulacion(coem: COEM) {
    const confirmacion = await this.confirmationDialogService.confirmar('Advertencia', `¡Está seguro de solicitar la anulación de la COEM ${coem.identificadorCOEM}?`);
    if (!confirmacion) {
      return;
    }
    this.load = true;
    this.coemAfipService.solicitarAnulacionCoem(coem.id).subscribe(() => {
      this.confirmationDialogService.exito('Se ha soliitado correctamente la anulación de la COEM');
    }, (err) => {
      console.error(err);
      const msj = err.error || 'Ha ocurrido un error al solicitar no a bordo';
      this.confirmationDialogService.error(msj);
    }, () => this.load = false);
  }

  public abrirModal(modal: any, coem: COEM) {
    this.coemId = coem.id;
    this.coemIdentificador = coem.identificadorCOEM;
    this.modal = this.modalService.open(modal, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
  }

  public cerrarModal() {
    this.modal.close();
    this.load = false;
  }

  private initForms() {
    this.solicitarNoABordoForm = this.formBuilder.group({ codigoMotivo: ['', Validators.required] });
    this.formFiltros = this.formBuilder.group({
      identificador: '',
      declaracion: '',
      estado: ''
    });
  }

  public filtrar() {
    const params = this.formFiltros.value;
    this.cargarDatos(params);
  }

  public limpiarFiltros() {
    this.formFiltros.reset();
    this.formFiltros.get('estado').setValue('');
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

  mostrarRectificarAnular(codigoEstado: string): boolean {
    return ['CUR', 'REG'].includes(codigoEstado);
  }

  mostrarSolicitarNoABordo(codigoEstado: string): boolean {
    return ['PRE', 'AUTO'].includes(codigoEstado);
  }

  mostrarSolicitarAnulacion(codigoEstado: string): boolean {
    return ['REG', 'PRE'].includes(codigoEstado);
  }
}
