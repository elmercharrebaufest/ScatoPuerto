import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { OperacionesPuertoService } from 'app/shared/servicios/puerto-logistica/operaciones-puerto.service';
import { SessionService } from 'app/shared/servicios/session.service';
import { ModalCrearCargaComponent } from './modal-crear-carga/modal-crear-carga.component';
import { ModalCrearEmbarqueLiquidoComponent } from './modal-crear-embarque-liquido/modal-crear-embarque-liquido.component';

@Component({
  selector: 'app-embarques',
  templateUrl: './embarques.component.html',
  styleUrls: ['./embarques.component.css']
})
export class EmbarquesComponent implements OnInit {

  public items: any[] = [];
  public itemsTotales: number = 0;
  public paginaActual: number = 1;
  public cargando: boolean = false;
  public mostrarFiltros: boolean = true;
  public filtroActual: any = {};

  public balanzasPuerto: string[] = [];
  public balanzasAdministrativas: string[] = [];

  public permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;

  constructor(
    private operacionesService: OperacionesPuertoService,
    private sessionService: SessionService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.user = this.sessionService.getUser();
  }

  ngOnInit(): void {
    this.cargarCombos();
    this.cargar();
  }

  cargarCombos(): void {
    this.operacionesService.listarBalanzasPuerto().subscribe(
      res => this.balanzasPuerto = res || [],
      () => this.balanzasPuerto = []
    );
    this.operacionesService.listarBalanzasAdministrativas().subscribe(
      res => this.balanzasAdministrativas = res || [],
      () => this.balanzasAdministrativas = []
    );
  }

  onMostrarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  cargar(filtro: any = {}, pagina: number = 1): void {
    this.cargando = true;
    this.filtroActual = filtro;
    this.paginaActual = pagina;
    this.operacionesService.listarCargas(filtro, pagina).subscribe(
      res => {
        this.items = res.Items || res.items || [];
        this.itemsTotales = res.ItemsTotales || res.itemsTotales || 0;
        this.cargando = false;
      },
      err => { console.error('Error API:', err); this.cargando = false; }
    );
  }

  onFiltrar(filtro: any): void {
    this.cargar(filtro, 1);
  }

  onLimpiar(): void {
    this.cargar({}, 1);
  }

  onCambiarPagina(pagina: number): void {
    this.cargar(this.filtroActual, pagina);
  }

  onModificarCarga(carga: any): void {
    const idFin = carga.idFin != null ? carga.idFin : 0;
    this.router.navigate(['/puerto-logistica/embarques/modificar', carga.id, carga.numeroBalanza, idFin]);
  }

  abrirCrearPesadaInicio(): void {
    const ref = this.modalService.open(ModalCrearCargaComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.tipo = 'inicio';
    ref.componentInstance.balanzasPuerto = this.balanzasPuerto;
    ref.result.then(
      creado => { if (creado) this.cargar(this.filtroActual, this.paginaActual); },
      () => { }
    );
  }

  abrirCrearPesadaFin(): void {
    const ref = this.modalService.open(ModalCrearCargaComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.tipo = 'fin';
    ref.componentInstance.balanzasPuerto = this.balanzasPuerto;
    ref.result.then(
      creado => { if (creado) this.cargar(this.filtroActual, this.paginaActual); },
      () => { }
    );
  }

  abrirCrearEmbarqueLiquido(): void {
    const ref = this.modalService.open(ModalCrearEmbarqueLiquidoComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.balanzasAdministrativas = this.balanzasAdministrativas;
    ref.result.then(
      creado => { if (creado) this.cargar(this.filtroActual, this.paginaActual); },
      () => { }
    );
  }

  tienePermisoCrearCarga(): boolean {
    return !!this.user?.permisos?.find(p => p === this.permisosScato.Embarques_Ver);
  }

  tienePermisoEmbarqueLiquido(): boolean {
    return !!this.user?.permisos?.find(p => p === this.permisosScato.Embarques_Ver);
  }
}
