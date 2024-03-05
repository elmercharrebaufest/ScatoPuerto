import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Caratula } from '@ScatoModels/afip/caratula';
import { CaratulaAfipService, EstadosCaratulaAFIP } from '@ScatoServicios/afip/caratula-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-caratula-afip',
  templateUrl: './caratula-afip.component.html',
  styleUrls: ['./caratula-afip.component.css']
})
export class CaratulaAfipComponent implements OnInit {

  public cargarCaratulas: boolean = true;
  caratulaId: number;
  caratulaImo: string;
  esNoExisteRegistros: boolean = true;

  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  public estados: EstadosCaratulaAFIP;
  public formFiltros: FormGroup;
  private parametrosFiltro: any;

  // Paginado
  currentPage: number = 1; // Página actual
  totalPages: number; // Total de páginas
  totalItems: number; // Total de elementos
  itemsPerPage: number = 5; // Elementos por página
  visiblePages: number[] = []; // Páginas visibles en la paginación
  showEllipsisStart: boolean = false; // Mostrar puntos suspensivos al inicio
  showEllipsisEnd: boolean = false; // Mostrar puntos suspensivos al final
  displayedItems: any[] = []; // Elementos mostrados en la tabla

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private caratulaService: CaratulaAfipService,
    private formBuilder: FormBuilder
  ) {
    this.estados = caratulaService.estados;
    this.iniciarFormFiltros();
  }

  ngOnInit(): void {
    this.onBuscar();
  }

  private iniciarFormFiltros() {
    this.formFiltros = this.formBuilder.group({
      fechaArribo: '',
      buque: '',
      identificador: '',
      estado: ''
    });
    this.setMesActual();
  }

  private setMesActual() {
    const date = new Date()
    const month = ("0" + (date.getMonth() + 1)).slice(-2)
    const year = date.getFullYear();
    this.formFiltros.get('fechaArribo').setValue(`${year}-${month}`);
  }

  public onBuscar() {
    this.parametrosFiltro = this.formFiltros.value;
    this.currentPage = 1;
    this.filtrar();
  }

  private filtrar() {
    this.listarCaratulas(this.parametrosFiltro);
  }

  public limpiarFiltros() {
    this.formFiltros.reset();
    this.formFiltros.get('estado').setValue('');
  }

  listarCaratulas(params: any = {}) {
    this.cargarCaratulas = true;
    params.pagina = this.currentPage;
    params.itemsPorPagina = this.itemsPerPage;
    this.caratulaService.listarCaratulas(params).subscribe(({ items, itemsTotales }) => {
      this.esNoExisteRegistros = itemsTotales == 0;

      // Calcular el total de elementos y las páginas
      this.totalItems = itemsTotales;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      // Mostrar los elementos de la página actual
      this.displayedItems = items;

      // Calcular las páginas visibles
      this.calculateVisiblePages();
      this.cargarCaratulas = false;
    }, (err) => {
      console.error(err);
      this.confirmationDialogService.error('No se han podido cargar correctamente las Caratulas');
      this.cargarCaratulas = false;
    });
  }

  public editarCaratula(historial, modal) {
    this.caratulaId = historial.id;
    this.caratulaImo = historial.identificadorBuque
    this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-vapor', backdropClass: 'modal-vapor' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }

  public async eliminarCaratula(id: number, idCaratula: string) {
    const confirm = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de anular la Caratula con id: ${idCaratula}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirm) {
      return;
    }
    this.cargarCaratulas = true;
    this.caratulaService.eliminarCaratula(id).subscribe(() => {
      this.confirmationDialogService.confirm('¡Felicitaciones!', `¡La Caratula con id: ${idCaratula} fue anulada con éxito!`, 'Cerrar', '', null, null, Tipoalerta.Success)
      this.listarCaratulas();
    }, (err) => {
      this.cargarCaratulas = false;
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || 'Ha ocurrido un error al anular la Caratula';
      }
      this.confirmationDialogService.error(msj);
    });
  }

  editFinish(event) {
    this.listarCaratulas();
  }

  tienePermisoModificarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Editar);
  }

  tienePermisoEliminarCaratula() {
    return this.user.permisos.find(p => p === this.permisosScato.Caratula_Eliminar);
  }

  public async onCambiarEstado(event: Event, caratula: Caratula) {
    const input = event.target as HTMLInputElement;
    const confirm = await this.confirmationDialogService.confirm(
      'Advertencia',
      `¿Está seguro de cambiar el estado de la Caratula con id: ${caratula.identificadorCaratula} de "${caratula.estado}" a "${input.value}"?`,
      'Sí', 'Cancelar', null, null, Tipoalerta.Warning
    );
    if (!confirm) {
      input.value = caratula.estado;
      return;
    }
    this.cargarCaratulas = true;
    this.caratulaService.cambiarEstadoCaratula(caratula.id, input.value).subscribe(
      () => this.listarCaratulas(),
      (error) => {
        console.error(error);
        this.confirmationDialogService.confirm(`¡Error!`, 'No se ha podido cambiar el estado de la Caratula', 'Cerrar', '', null, null, Tipoalerta.Error);
      }, () => this.cargarCaratulas = false
    );
  }

  // Paginado
  goToPage(page: number) {
    // Validar que la página esté dentro de los límites
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filtrar();
    }
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

}
