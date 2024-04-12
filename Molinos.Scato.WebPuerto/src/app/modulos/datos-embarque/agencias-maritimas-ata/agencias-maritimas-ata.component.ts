import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgenciaMaritimaAtaService } from '@ScatoServicios/agencia-maritima-ata.service';
import { AgenciaMaritimaATA } from '@ScatoModels/programa-embarque/agencia-maritima-ata';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';

@Component({
  selector: 'app-agencias-maritimas-ata',
  templateUrl: './agencias-maritimas-ata.component.html',
  styleUrls: ['./agencias-maritimas-ata.component.css']
})
export class AgenciasMaritimasATAComponent implements OnInit {
  public frmFiltros: FormGroup;
  private suscripcion: Subscription;
  private parametrosFiltro: any;
  public isLoading: boolean = false;

  public nombre: string;
  public cuit: string;
  public tipo: number;

  id: number;

  idAgencia: number;
  tittle: string;
  typeAgencia: number;

  // Paginado
  currentPage: number = 1; // Página actual
  totalItems: number; // Total de elementos
  totalPages: number; // Total de páginas
  itemsPerPage: number = 10; // Elementos por página
  visiblePages: number[] = []; // Páginas visibles en la paginación
  showEllipsisStart: boolean = false; // Mostrar puntos suspensivos al inicio
  showEllipsisEnd: boolean = false; // Mostrar puntos suspensivos al final
  listadoAgenciasMaritimasAta: AgenciaMaritimaATA[] = []; // Elementos mostrados en la tabla

  constructor(
    private formBuilder: FormBuilder, 
    private route: ActivatedRoute,
    private agenciaMaritimaAtaService: AgenciaMaritimaAtaService,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      this.id = Number(params['id']);
      this.suscripcion = this.agenciaMaritimaAtaService.$recargarAgenciasMaritimasAta.subscribe(() => {
        this.buscar();
      });
    });

    this.buscar();
  }

  initForm = () => {
    this.frmFiltros = this.formBuilder.group({
      nombre: '',
      cuit: '',
      tipo: '0'
    });
  }

  buscar = () => {
    this.parametrosFiltro = this.frmFiltros.value;
    this.currentPage = 1;
    this.filtrar();
  }

  filtrar = () => {
    this.cargarDatos(this.parametrosFiltro);
  }

  cargarDatos = (params: any = {}) => {
    this.isLoading = true;
    params.pagina = this.currentPage;
    params.itemsPorPagina = this.itemsPerPage;

    const obsAgenciasMaritimasAta = this.agenciaMaritimaAtaService.listar(params);

    obsAgenciasMaritimasAta.subscribe((resp) => {
      resp.items.forEach(r => {
        if (r.tipo == 1) {
          r.tipoNombre = 'Agencia Marítima';
        } else {
          r.tipoNombre = 'A.T.A.';
        }
      });

      this.listadoAgenciasMaritimasAta = resp.items;
      this.crearPaginado(resp.itemsTotales);
      this.isLoading = false;
    }, error => {
      console.error(error);
      this.isLoading = false;
    });
  }

  limpiarFiltros = () => {
    this.frmFiltros.reset();
    this.frmFiltros.get('estado').setValue('');
  }

  editarAgenciaMaritimaAta = (agenciaMaritimaAta: AgenciaMaritimaATA, modal: NgbModal) => {
    this.idAgencia = agenciaMaritimaAta.id;
    this.typeAgencia = agenciaMaritimaAta.tipo;

    this.tittle = "Rectificar ";
    if (this.typeAgencia == 1) {
      this.tittle += "Agencia Marítima: " + agenciaMaritimaAta.nombre;
    } else {
      this.tittle += "ATA: " + agenciaMaritimaAta.nombre;
    }

    this.modalService.open(modal, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  eliminarAgenciaMaritimaAta = async (agenciaMaritimaAta: AgenciaMaritimaATA) => {
    let destination = "";
    if (agenciaMaritimaAta.tipo == 1) {
      destination += "Agencia Marítima";
    } else {
      destination += "ATA";
    }

    const confirmacion = await this.confirmationDialogService.confirmar('Advertencia', `¿Está seguro de eliminar la ${destination} con id: ${agenciaMaritimaAta.id}?`);
    if (!confirmacion) {
      return;
    }
    this.isLoading = true;
    this.agenciaMaritimaAtaService.eliminar(agenciaMaritimaAta.id, agenciaMaritimaAta.tipo).subscribe(() => {
      this.confirmationDialogService.exito(`Se ha eliminado correctamente la ${destination}`);
      this.isLoading = false;
      this.listadoAgenciasMaritimasAta = [];
      this.filtrar();
    }, (err) => {
      console.error(err);
      this.isLoading = false;
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || `Ha ocurrido un error al eliminar la ${destination}`;
      }
      this.confirmationDialogService.error(msj);
    });
  }

  nuevaAgenciaMaritimaAta = (modal: NgbModal) => {
    this.tittle = "Nueva Agencia Marítima / A.T.A.";

    this.idAgencia = null;
    this.typeAgencia = null;

    this.modalService.open(modal, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  exportarXLS = () => {
    this.isLoading = true;
    const obsAgenciasMaritimasAta = this.agenciaMaritimaAtaService.exportar(this.parametrosFiltro);

    obsAgenciasMaritimasAta.subscribe(resp => {
      console.log(resp);

      let title = 'Agencias Marítimas y A.T.A.s ';
      if (this.parametrosFiltro.tipo == 1){
        title = 'Agencias Marítimas ';
      } else if (this.parametrosFiltro.tipo == 2){
        title = 'A.T.A.s ';
      }
      let workbook = new Workbook();
      const worksheet = workbook.addWorksheet(title + formatDate(new Date(), 'yyyy-MM-dd', 'en'));

      worksheet.columns = [
        { header: 'NOMBRE', key: 'nombre', width: 30 },
        { header: 'CUIT', key: 'cuit', width: 12 },
        { header: 'TIPO', key: 'tipo', width: 20 }
      ];

      resp.forEach(agenciaMaritimaAta  => {
        console.log(agenciaMaritimaAta );
        worksheet.addRow({
          nombre: agenciaMaritimaAta.nombre,
          cuit: agenciaMaritimaAta.cuit,
          tipo: agenciaMaritimaAta.tipo == 1 ? 'Agencia Maritima': 'ATA'
        });
      });
      
      workbook.xlsx.writeBuffer().then((data) => {
        const archivo = title + formatDate(new Date(), 'yyyy-MM-dd', 'en') + '.xlsx'
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, archivo);
      });

      this.isLoading = false;
    }, error => {
      console.error(error);
      this.isLoading = false;
    });
  }

  editFinish = (event) => {
    this.filtrar();
  }

  crearPaginado = (total: number) => {
    // Calcular el total de elementos y las páginas
    this.totalItems = total;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    // Calcular las páginas visibles
    this.calculateVisiblePages();
  }

  goToPage = (page: number) => {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filtrar();
    }
  }

  calculateVisiblePages = () => {
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