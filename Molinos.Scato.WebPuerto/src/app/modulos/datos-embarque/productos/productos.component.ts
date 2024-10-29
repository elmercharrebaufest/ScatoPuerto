import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Usuario } from '@ScatoInterfaces/usuario';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ProductosService } from '@ScatoServicios/productos.service';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  @ViewChild('modalProducto') modalProducto: TemplateRef<any>;
  public estaCargando: boolean = false;
  public mensaje: string = "";
  public orderedByColumn: string;
  public orderDirection: number;
  public productos: MaterialPuerto[];
  public filtro: FormGroup;
  public productoForm: FormGroup;
  public itemsTotales: number = 0; 
  public id: number = 0;
  private errorExisteProducto: string = "No se puede anular al producto ya que esta siendo utilizado en una Nominación y / o embarque";
  private user: Usuario;
  private permisosScato: typeof PermisosScato = PermisosScato;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productosService: ProductosService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly modalService: NgbModal,
    private readonly session: SessionService,
  ){       
    this.inicializarForm();
    this.user = this.session.getUser();
  }
  
  ngOnInit(): void {
    this.onBuscar();
  }

  public inicializarForm(): void {
    this.filtro = this.formBuilder.group({
      nombre: '',
    });
    this.productoForm = this.formBuilder.group({
      id: 0,
      nombre: ['', [Validators.required, Validators.pattern(/[\S]/g)]]
    });
  }

  public onBuscar(page?: PageEvent) {
    let pagina = 1, itemsPorPagina = 10;
    if (page) {
      pagina = page.pageIndex + 1;
      itemsPorPagina = page.pageSize;
    }
    const nombre: string = this.filtro.get('nombre').value?.trim() || '';
    this.mensaje = 'Cargando productos. Por favor, espere...';
    this.estaCargando = true;
    this.productosService.ListarProductos(pagina, itemsPorPagina, nombre).subscribe(res => {
      this.productos = res.items;
      this.itemsTotales = res.itemsTotales;
      this.estaCargando = false;
    }, err => {
      this.confirmationDialogService.error('Ocurrió un error al cargar los datos');
      console.error(err);
      this.estaCargando = false;
    });
  }

  public onLimpiar(){
    this.filtro.reset();
    this.onBuscar();
  }

  
  public onExportar() {
    this.mensaje = 'Exportando planilla de Excel...';
    this.estaCargando = true;
    const nombre: string = this.filtro.get('nombre').value?.trim() || '';
    this.productosService
      .ExportarExcel(nombre)
      .subscribe(
        (data: any) => {
          const element = document.createElement('a');
          element.href = URL.createObjectURL(data);
          element.download = 'listado_productos' + '.xls';
          document.body.appendChild(element);
          element.click();
          this.estaCargando = false;
        },
        (error : Error) => {
          console.error(error);
          this.estaCargando = false;
          this.confirmationDialogService.error('Ocurrió un error al exportar los productos.');
        }
      ); 
  }

  public onAgregarProducto(){
    this.id = 0;
    this.modalService.open(this.modalProducto, { size: 'xl', centered: true, backdrop: 'static', keyboard: false })
    .result.then(() => {
      console.log('_modalService.open');
    })
    .catch((res) => {
      console.log(res);
    });
  }

  public onEditarProducto(id: number){
    this.id = id;
    this.modalService.open(this.modalProducto, { size: 'xl', centered: true, backdrop: 'static', keyboard: false })
    .result.then(() => {
      console.log('_modalService.open');
    })
    .catch((res) => {
      console.log(res);
    });
  }

  public onEliminarProducto(producto: MaterialPuerto) {
    try {
      this.confirmationDialogService.confirm('Eliminar Producto', `¿Esta seguro de querer eliminar el producto: ${producto.descripcion}?`, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          if (confirmed) {
            this.productosService.EliminarProducto(producto.id).subscribe(res => {
              this.modalService.dismissAll();
              this.onBuscar();
              this.confirmationDialogService.exito('Eliminado con éxito.');
            }, (error: any) => {
              const msj = error.error == this.errorExisteProducto ? this.errorExisteProducto : "Hubo un error al intentar eliminar el producto.";
              console.error('Error al enviar el formulario', msj);
              this.modalService.dismissAll();
              this.mostrarError(msj);
            });
          }
        })
    } catch (error) {
      console.error(error);
      this.modalService.dismissAll();
      this.mostrarError("Hubo un error al intentar eliminar el producto.");
    }
  }

  private mostrarError(msj: string) {
    this.confirmationDialogService.error(msj);
  }

  tienePermisoModificarProducto() {
    return this.user.permisos.find(p => p === this.permisosScato.Productos_Editar);
  }

  tienePermisoEliminarProducto(){
    return this.user.permisos.find(p => p === this.permisosScato.Productos_Eliminar);
  }

  tienePermisoCrearProducto() {
    return this.user.permisos.find(p => p === this.permisosScato.Productos_Crear);
  }

  public refrescarListado(){
    this.onBuscar();
  }

}
