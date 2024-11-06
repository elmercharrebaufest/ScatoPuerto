import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PlanillaDeEmbarque } from '@ScatoModels/planilla-de-embarque';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Alert } from 'selenium-webdriver';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { borderTopRightRadius } from 'html2canvas/dist/types/css/property-descriptors/border-radius';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-planilla-embarque',
  templateUrl: './planilla-embarque.component.html',
  styleUrls: ['./planilla-embarque.component.css']
})
export class PlanillaEmbarqueComponent implements OnInit, AfterViewInit, OnDestroy {
  lineasEmbarque: FormGroup;
  exportadores: any[];
  bodegas: PlanoDeCargaBodega[];
  lineas: any[];
  productos: any[];
  // destinos: any[];
  partidas: any[];
  tanquesAbordo: any[];
  idModuloDeCarga: number;
  planillaDeEmbarque: PlanillaDeEmbarque[];
  guardando: boolean;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  private suscripciones: Subscription[] = [];

  constructor(
    private builder: FormBuilder,
    private turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private procesoService: DatosEmbarquesProcesoService,
    private session: SessionService,
  ) {
    this.user = this.session.getUser();
    const sus1 = this.turnosService.sendExportadores.subscribe(res => this.exportadores = res);
    const sus2 = this.turnosService.sendBodega.subscribe((res: PlanoDeCargaBodega[]) => {
      this.bodegas = res;
      this.getProductos();
      this.getTanqueAbordo();
      this.refrescarParceles();
    });
    this.suscripciones.push(sus1, sus2); // necesario para desuscripcion
    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
      this.lineas = resp.moduloDeCargaLineasDeEmbarque;
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.newForm();

    if (!this.hasPermisoLiquido_PlanillaEmbarque_Editar()) this.lineasEmbarque.disable();
  }

  /**
   * IMPORTANTE: Las suscripciones de rxjs deben desuscribirse manualmente.
   * De no hacerlo, la suscripción con su funcionamiento quedarán activas aún cuando ya no se esté usando el componente.
   * Además se creará una nueva suscripción al ingresar nuevamente al componente, lo cual hará que se ejecute varias veces el codigo de la suscripción.
   * No solo es peligroso que un fragmento de codigo se ejecute más veces de las esperadas, sino que también provoca un memory leak haciendo cada vez más pesada la app.
   *
   * La única excepción son las suscripciones que se completan. Los http request se completan automaticamente.
   */
  ngOnDestroy(): void {
    for (const suscripcion of this.suscripciones) {
      suscripcion.unsubscribe();
    }
  }

  expandir() {
    document.getElementById('planillaEmbarque').className = "pb-5 collapse show";
  }


  eliminarObjPlanilla(i: number) {
    this.getPlanillaDeEmbarque().removeAt(i);
  }

  agregarObjPlanilla() {
    this.getPlanillaDeEmbarque().push(this.initLinea())
  }


  newForm() {
    console.log('this.lineas...>>')
    console.log(this.lineas)

    if (this.lineas == undefined || this.lineas == null) {
      this.lineas = this.procesoService.getModuloDeCarga()?.moduloDeCargaLineasDeEmbarque;
    }

    // Evangelino Se considera exportadores unicos no duplicados
    //this.exportadores = this.turnosService.getExportadores().filter(e => e.exportador && e.cantidad);
    const exportadoresData = this.turnosService.getExportadores().filter(e => e.exportador && e.cantidad)
    const exportadorFiltro = exportadoresData.map(item => item.exportador);
    this.exportadores = [...new Map(exportadorFiltro.map(item => [item['nombre'], item])).values()];

    //this.partidas = this.bodegas.map(item => ({bodegaParcel: item.bodegaParcel}));


    //antes de iniciar las lineas vacias me fijo cuantos registros hay de la DB.
    this.planillaDeEmbarque = this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeEmbarque;

    this.bodegas = this.turnosService.getBodega();
    this.getProductos();
    this.getTanqueAbordo();

    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.lineasEmbarque = new FormGroup({
      linea: this.builder.array([])
    });

    // this.planillaDeEmbarque = this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque;

    //Si tengo items en la planilla de embarque los agrego a la tabla.
    setTimeout(() => {
      if (this.planillaDeEmbarque) {

        if (this.planillaDeEmbarque.length > 0) {
          this.fillPlanillaDeEmbarque();
        } else {
          //Si no tengo ningún item en la planilla de embarque, agrego 1 vacío.
          this.getPlanillaDeEmbarque().push(this.initLinea());
        }
      }
    }, 1000);

  }

  fillPlanillaDeEmbarque() {
    this.planillaDeEmbarque.forEach((item: PlanillaDeEmbarque) => {
      this.getPlanillaDeEmbarque().push(this.initLinea(item));
    })
    this.refrescarParceles();
  }

  getPlanillaDeEmbarque(): FormArray {
    return this.lineasEmbarque.controls.linea as FormArray;
  }


  getProductos() {
    this.productos = [];
    // this.destinos = [];

    for (const bodega of this.bodegas) {
      if (bodega.materialPuerto && !this.productos.find(p => p == bodega.materialPuerto.descripcionCorta)) {
        this.productos.push(bodega.materialPuerto);
      }
    }
  }

  initLinea(planilla?: PlanillaDeEmbarque) {
    var result = localStorage.getItem('desabilitar');
    return this.builder.group({

      id: { value: planilla?.id ? planilla.id : '0', disabled: true },
      exportador: { value: planilla?.exportador ? planilla.exportador : '', disabled: result == 'true' ? true : false },
      bodegaParcel: { value: planilla?.bodegaParcel ? planilla.bodegaParcel : '', disabled: result == 'true' ? true : false },
      tanqueDeAbordo: { value: planilla?.tanqueDeAbordo ? planilla.tanqueDeAbordo : '', disabled: true },
      destino: { value: planilla?.destino ? planilla.destino : null, disabled: true },
      destinoTexto: '',
      tk: { value: planilla?.tk ? planilla.tk : '', disabled: result == 'true' ? false : false },
      tn: { value: planilla?.tn ? planilla.tn : null, disabled: false },
      materialPuerto: { value: planilla?.materialPuerto ? planilla.materialPuerto : null, disabled: true },
      fechaComienzoCarga: { value: planilla?.fechaComienzoCarga ? planilla.fechaComienzoCarga : '', disabled: result == 'true' ? true : false },
      fechaFinalizacionCarga: { value: planilla?.fechaFinalizacionCarga ? planilla.fechaFinalizacionCarga : '', disabled: result == 'true' ? true : false }
    })
  }

  compareLineaItem(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  get linea(): FormArray {
    return this.lineasEmbarque?.get('linea') as FormArray;
  }

  // Funcion necesaria para que no se borre la selección de bodega al pisar la variable "this.bodegas"
  public trackBodegas(index: number, item: PlanoDeCargaBodega) {
    return item.bodegaParcel;
  }

  private refrescarParceles() {
    const planillaEmbarque = this.getPlanillaDeEmbarque();
    for (const linea of planillaEmbarque.controls) {
      const bodega = this.bodegas.find(b => b.bodegaParcel == linea.get('bodegaParcel').value);
      const materialPuerto = this.productos.find(p => p.id == bodega?.materialPuerto.id);
      const destinoTexto = bodega.destinosPaises.map(dp => dp.nombre).join(', ');
      linea.get('tanqueDeAbordo').setValue(bodega?.tanqueDeAbordo || '');
      linea.get('destino').setValue(bodega.destino || null);
      linea.get('materialPuerto').setValue(materialPuerto || null);
      linea.get('destinoTexto').setValue(destinoTexto || null);
    }
  }

  autoCompleteParcel(parcel, l: FormGroup) {

    // Evangelino Se corrige el codigo para obtener por parcel los valores de tanque, destino, tn y producto(material)
    /*
    const parcelValue =  parcel.split(":");
    parcel = (parcelValue.length > 0) ? parcelValue[1] :  parcel;
    */
    let bodega = this.bodegas.find(b => b.bodegaParcel == parcel);

    l.controls?.tanqueDeAbordo.setValue(bodega != null ? bodega.tanqueDeAbordo : '');
    l.controls?.destino.setValue(bodega != null ? bodega.destino : null);
    // l.controls?.tn.setValue(bodega != null ? bodega.cantidad : 0);
    l.controls?.materialPuerto.setValue(bodega != null ? bodega.materialPuerto : null);
    const destinoTexto = bodega.destinosPaises.map(dp => dp.nombre).join(', ');
    l.controls?.destinoTexto.setValue(destinoTexto);
  }

  obtenerDatosPlanillaDeEmbarque() {
    return this.lineasEmbarque.getRawValue()['linea'].filter(x => x.materialPuerto != null && x.exportador != null);;
  }

  getTanqueAbordo() {
    this.tanquesAbordo = new Array();
    this.bodegas.forEach(b => {
      if (this.tanquesAbordo.find(t => t == b.tanqueDeAbordo)) this.tanquesAbordo.push(b.tanqueDeAbordo);
    })
  }
  cargarPlanilla() {
    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
      this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque = resp.moduloDeCargaPlanillaDeEmbarque;
      this.planillaDeEmbarque = this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque;
      console.log('this.planillaDeEmbarque ini-->>>');
      console.log(this.planillaDeEmbarque);
      if (this.planillaDeEmbarque) {
        this.lineasEmbarque = null;
        this.lineasEmbarque = new FormGroup({
          linea: this.builder.array([])
        });

        if (this.planillaDeEmbarque.length > 0) {
          this.fillPlanillaDeEmbarque();
        } else {
          //Si no tengo ningún registro, agrego 1 por default.
          this.getPlanillaDeEmbarque().push(this.initLinea());
        }
      }
      console.log(resp);
    });
  }
  guardar() {
    const planillaEmbarque = this.getPlanillaDeEmbarque().getRawValue().filter(x => x.materialPuerto > '' && x.exportador > '');
    console.log('this.planillaDeEmbarque fin-->>>');
    console.log(planillaEmbarque);
    this.guardando = true;

    if (this.validarExportadorYPartida(planillaEmbarque) == false) {
      this.confirmationDialogService.confirm('¡Atención!', 'La combinación de Exportador y Partida no se puede repetir.', 'Aceptar', '', null, null, Tipoalerta.Success);
      this.guardando = false;
      return;
    }

    this.moduloCargaService.guardarPlanillaDeEmbarque(planillaEmbarque, this.idModuloDeCarga).subscribe(
      res => {
        this.guardando = false;
        console.log(res);
        const texto = "Se guardo la planilla de embarque correctamente";
        this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
        this.moduloCargaService.actualizarPlanillaLiquido = true;
      },
      err => {
        this.guardando = false;
        console.log(err);
      },
      () => {
        this.guardando = false;
        this.cargarPlanilla();
      });
  }

  validarExportadorYPartida(planilla: any[]): boolean {
    for (let i = 0; i <= planilla.length - 1; i++) {
      if (i < planilla.length - 1)
        for (let j = i + 1; j <= planilla.length - 1; j++) {
          if (planilla[i].exportador != null && planilla[i].bodegaParcel != null && planilla[j].exportador != null && planilla[j].bodegaParcel != null) {
            if (planilla[i].exportador.nombre == planilla[j].exportador.nombre && planilla[i].bodegaParcel == planilla[j].bodegaParcel) {
              return false;
            }
          }
        }
    }
    return true;
  }

  hasPermisoLiquido_PlanillaEmbarque_Editar() {
    return this.user.permisos.find(p => p === this.permisosScato.Liquido_PlanillaEmbarque_Editar);
  }
}
