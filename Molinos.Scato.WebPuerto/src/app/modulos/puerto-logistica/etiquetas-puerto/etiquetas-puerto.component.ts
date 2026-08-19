import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { EtiquetaPuertoService } from 'app/shared/servicios/puerto-logistica/etiqueta-puerto.service';
import { SessionService } from 'app/shared/servicios/session.service';

@Component({
  selector: 'app-etiquetas-puerto',
  templateUrl: './etiquetas-puerto.component.html',
  styleUrls: ['./etiquetas-puerto.component.css']
})
export class EtiquetasPuertoComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public mensaje: string = 'Cargando datos';
  public username: string;

  public archivoSeleccionado: File | null = null;
  public archivoNombre: string = 'Ningún Archivo Seleccionado';
  public mensajeExito: string = '';
  public mensajeError: string = '';
  public erroresImportacion: string[] = [];

  public sortColumn: string = '';
  public sortDirection: 'asc' | 'desc' | '' = '';

  constructor(
    private etiquetaService: EtiquetaPuertoService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    const user = this.sessionService.getUser();
    this.username = user ? user.username : '';
    this.cargar();
  }

  cargar(pagina: number = 1): void {
    this.cargando = true;
    this.paginaActual = pagina;
    this.mensajeError = '';
    this.etiquetaService.listar(pagina).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      err => {
        this.cargando = false;
        this.items = [];
        this.itemsTotales = 0;
        console.error('Error al listar etiquetas de puerto', err);
        this.mensajeError = err?.error || err?.message || 'No se pudieron cargar las etiquetas';
      }
    );
  }

  onSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files;

    this.mensajeExito = '';
    this.mensajeError = '';
    this.erroresImportacion = [];

    if (!files || files.length === 0) {
      this.archivoSeleccionado = null;
      this.archivoNombre = 'Ningún Archivo Seleccionado';
      return;
    }

    const archivo = files[0];
    const ext = (archivo.name.split('.').pop() || '').toLowerCase();
    if (ext !== 'xlsx') {
      this.archivoSeleccionado = null;
      this.archivoNombre = 'Ningún Archivo Seleccionado';
      this.mensajeError = 'El archivo debe tener formato .xlsx';
      input.value = '';
      return;
    }

    this.archivoSeleccionado = archivo;
    this.archivoNombre = archivo.name;
    this.importarArchivo();
  }

  importarArchivo(): void {
    if (!this.archivoSeleccionado) {
      this.mensajeError = 'Seleccione un archivo';
      return;
    }

    this.cargando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.erroresImportacion = [];

    this.etiquetaService.importar(this.archivoSeleccionado).subscribe(
      res => {
        this.mensajeExito = res?.Mensaje || res?.mensaje || 'Se grabó correctamente';
        this.sortColumn = '';
        this.sortDirection = '';
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.cargar(1);
      },
      err => {
        this.cargando = false;
        const apiErrores = err?.error?.Errores;
        if (Array.isArray(apiErrores) && apiErrores.length > 0) {
          this.erroresImportacion = apiErrores;
          this.mensajeError = 'Se detectaron errores al importar el archivo.';
        } else {
          this.mensajeError = err?.error || 'No se pudo importar el archivo';
        }
      }
    );
  }

  onDescargarTemplate(): void {
    this.etiquetaService.descargarTemplate().subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'EtiquetaPuerto.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      () => {
        this.mensajeError = 'No se pudo descargar el template';
      }
    );
  }

  onVer(item: any): void {
    const id = item?.Id || item?.id;
    if (!id) {
      return;
    }

    this.etiquetaService.previsualizar(id).subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      () => {
        this.mensajeError = 'No se pudo generar la previsualización';
      }
    );
  }

  onImprimir(idEtiqueta?: number): void {
    this.etiquetaService.imprimir(idEtiqueta).subscribe(
      () => {
        this.mensajeExito = 'Impresión enviada correctamente';
        this.mensajeError = '';
      },
      err => {
        this.mensajeError = err?.error || 'No se pudo enviar la impresión';
        this.mensajeExito = '';
      }
    );
  }

  onPage(page: PageEvent): void {
    this.cargar(page.pageIndex + 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cargar(pagina);
  }

  ordenarPor(columna: string): void {
    if (this.sortColumn === columna) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortColumn = '';
        this.sortDirection = '';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = columna;
      this.sortDirection = 'asc';
    }

    if (!this.sortColumn || !this.sortDirection) {
      this.cargar(this.paginaActual);
      return;
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;
    const columnasFecha = ['fecha', 'fechaCreacion'];
    const columnasNumero = ['kg'];

    this.items = [...this.items].sort((a, b) => {
      const va = a ? a[columna] : null;
      const vb = b ? b[columna] : null;

      const aNulo = va === null || va === undefined || va === '';
      const bNulo = vb === null || vb === undefined || vb === '';
      if (aNulo && bNulo) return 0;
      if (aNulo) return 1;
      if (bNulo) return -1;

      if (columnasFecha.indexOf(columna) !== -1) {
        const da = new Date(va).getTime();
        const db = new Date(vb).getTime();
        return (da - db) * dir;
      }

      if (columnasNumero.indexOf(columna) !== -1) {
        const na = this.parsearNumero(va);
        const nb = this.parsearNumero(vb);
        return (na - nb) * dir;
      }

      return String(va).localeCompare(String(vb), 'es', { sensitivity: 'base' }) * dir;
    });
  }

  iconoSort(columna: string): string {
    if (this.sortColumn !== columna || !this.sortDirection) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  private parsearNumero(valor: any): number {
    if (typeof valor === 'number') return valor;
    const limpio = String(valor).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const n = parseFloat(limpio);
    return isNaN(n) ? 0 : n;
  }
}
