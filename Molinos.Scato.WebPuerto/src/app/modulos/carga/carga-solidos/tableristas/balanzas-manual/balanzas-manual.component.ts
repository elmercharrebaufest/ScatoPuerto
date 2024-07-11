import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { BalanzaManual, DestinosPorMaterialPuertoBodega, ExportadorPorMaterialPuerto } from '@ScatoModels/balanza-manual/balanza-manual';
import { BodegaParcel } from '@ScatoModels/bodega-parcel';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { PlanoDeCarga } from '@ScatoModels/plano-de-carga';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BalanzasManualService } from './balanzas-manual.service';
import { Destino } from '@ScatoModels/destino';
import { BalanzasManualCorteService } from '../balanzas-manual-corte/balanzas-manual-corte.service';
import { BalanzasManualBajaCargaService } from '../balanzas-manual-baja-carga/balanzas-manual-baja-carga.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

@Component({
  selector: 'app-balanzas-manual',
  templateUrl: './balanzas-manual.component.html',
  styleUrls: ['./balanzas-manual.component.css']
})
export class BalanzasManualComponent implements OnInit, OnDestroy {
  @Input() esSoloLectura: boolean = false;
  embarqueSelected: EmbarqueNav;
  destinosBodegaPorMaterial: DestinosPorMaterialPuertoBodega[] = []
  exportadoresPorMaterial: ExportadorPorMaterialPuerto[] = []
  private planoCargaSeleccionado:PlanoDeCarga; 
  private paramSoloLectura: any;
  private periodoDeCarga: PeriodoDeCarga;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  balanza7Form: FormGroup;
  balanza8Form: FormGroup;
  startBalanza7: any;
  startBalanza8: any;
  numeroBalanza: number;
  private destroy$ = new Subject();

  constructor(private embarqueSharingService: EmbarqueSharingService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private procesoService: DatosEmbarquesProcesoService,
    private planoDeCargaService: PlanoDeCargaService,
    private balanzasManualService: BalanzasManualService,
    private balanzasManualCorteService: BalanzasManualCorteService,
    private balanzasManualBajaCargaService: BalanzasManualBajaCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private session: SessionService) {

    this.user = this.session.getUser();
    this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data => {
      this.paramSoloLectura = data;
    });
    if (!this.embarqueSelected) {
      this.embarqueSelected = this.procesoService.getEmbarqueSelected();
      this.cargarPeriodoPlanoDeCarga();
      this.listarBalanzaManual();
    }
    this.construirFormularios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
  }

  public onOpenModal(modal, numeroBalanza , esCorte: boolean = false) {
    this.numeroBalanza = numeroBalanza;
    this.enviarListaParaBajaCarga(esCorte);
    this.modalService.open(modal).result
    .then(() => {
      console.log('_modalService.open');
    })
    .catch((res) => { console.log(res) });
  }

  public onOpenEditarModal(modal, numeroBalanza, balanza: BalanzaManual) {
    this.numeroBalanza = numeroBalanza;
    this.enviarListaParaBajaCarga(balanza.corteManual);
    if (balanza.corteManual){
      this.balanzasManualCorteService.BalanzaManual = balanza;
      this.balanzasManualBajaCargaService.PeriodoDeCarga = this.periodoDeCarga;
    }

    if (!balanza.corteManual){
      this.balanzasManualBajaCargaService.BalanzaManual = balanza;
      this.balanzasManualBajaCargaService.PeriodoDeCarga = this.periodoDeCarga;
    }

    this.modalService.open(modal).result
    .then(() => {
      console.log('_modalService.open');
    })
    .catch((res) => { console.log(res) });
  }
  async onEliminarCorteBajaCarga(numeroBalanza: number ,index: number, balanzaId: number, corteManual:boolean){
    const titulo = corteManual ? `Eliminación de Corte Balanza ${numeroBalanza}` :  `Eliminación de Baja Carga Balanza ${numeroBalanza}`;
    const mensaje = `¿Está seguro de eliminar ${corteManual? 'el Corte seleccionado' : 'la Baja Carga seleccionada'}?`; 
    const confirm = await this.confirmationDialogService.confirm(titulo, mensaje, ' Sí ', ' No ', null, null, Tipoalerta.Warning);
    if (!confirm) {
      return;
    }else{
      this.balanzasManualService.eliminarCortesBajaCarga(balanzaId).pipe(takeUntil(this.destroy$)).subscribe((resultado: boolean) =>{
        if (resultado){
          if (numeroBalanza == 7)
            this.balanzas7.removeAt(index);
      
          if (numeroBalanza == 8)
            this.balanzas8.removeAt(index);
        }
      });
    }
  }
  public async onAgregarCortes(event, numeroBalanza) {
    if (numeroBalanza == 7)
      this.balanzasManualService.agregarCorteBajaCarga(this.balanzas7,event, true, numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username);

    if (numeroBalanza == 8)
      this.balanzasManualService.agregarCorteBajaCarga(this.balanzas8,event, true,numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username);
  }
  public async onAgregarBajaCarga(event, numeroBalanza) {
    if (numeroBalanza == 7)
      this.balanzasManualService.agregarCorteBajaCarga(this.balanzas7,event, false, numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username);
    
    if (numeroBalanza == 8)
      this.balanzasManualService.agregarCorteBajaCarga(this.balanzas8,event, false, numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username);
  }  

  get balanzas7(): FormArray {
    var myArray = (this.balanza7Form.get("balanzas7") as FormArray).value;
    myArray = myArray.sort((a, b) => Number(new Date(a.fechaInicio)) - Number(new Date(b.fechaInicio)));
    (this.balanza7Form.get("balanzas7") as FormArray).patchValue(myArray)
    return this.balanza7Form.get("balanzas7") as FormArray;
  }

  get balanzas8(): FormArray {
    var myArray = (this.balanza8Form.get("balanzas8") as FormArray).value;
    myArray = myArray.sort((a, b) => Number(new Date(a.fechaInicio)) - Number(new Date(b.fechaInicio)));
    (this.balanza8Form.get("balanzas8") as FormArray).patchValue(myArray)
    return this.balanza8Form.get("balanzas8") as FormArray;
  }

  private construirFormularios() {
    this.balanza7Form = this.formBuilder.group({
      balanzas7: this.formBuilder.array([])
    });

    this.balanza8Form = this.formBuilder.group({
      balanzas8: this.formBuilder.array([])
    });
  }

  private cargarPeriodoPlanoDeCarga(){
    this.planoDeCargaService.obtenerPlanoDeCarga(this.embarqueSelected.planoDeCargaId).subscribe(data => {
      this.planoCargaSeleccionado = data;
    });
    this.balanzasManualService.obtenerPeriodoDeCarga(this.embarqueSelected.moduloDeCargaId).pipe(takeUntil(this.destroy$)).subscribe((data: PeriodoDeCarga) =>{
      this.periodoDeCarga = data;
    });

  }
  private listarBalanzaManual(){
    this.balanzasManualService.listarBalanzaManual(this.embarqueSelected.moduloDeCargaId).pipe(takeUntil(this.destroy$)).subscribe((data: BalanzaManual[]) =>{
      data.forEach(item =>{
        if (item.numeroBalanza == '7')
          this.balanzasManualService.cargarCorteBajaCarga(this.balanzas7,item);
        if (item.numeroBalanza == '8')
          this.balanzasManualService.cargarCorteBajaCarga(this.balanzas8,item);
      })
    });
  }
  private enviarListaParaBajaCarga(eCorteManual:boolean = false){
    this.destinosBodegaPorMaterial = [];
    this.planoCargaSeleccionado.planoDeCargaBodegas.forEach(plano=>{
      let materialBodega = new DestinosPorMaterialPuertoBodega();
      let bodega = new BodegaParcel();
      bodega.id = plano.bodegaParcel;
      bodega.nombre = 'Bodega ' + plano.bodegaParcel;
      materialBodega.materiales = plano.materialPuerto;
      materialBodega.bodegas = bodega;
      materialBodega.destinos = [];
      plano.destinos.forEach(filtro=>{
        materialBodega.destinos.push({
          id : filtro.destino.id,
          nombre : filtro.destino.nombre
        });
      });

      this.destinosBodegaPorMaterial.push(materialBodega);
    });

    this.exportadoresPorMaterial = [];
    this.planoCargaSeleccionado.cargasComerciales.forEach(comercial=>{
      let exportadorMaterial = new ExportadorPorMaterialPuerto();
      exportadorMaterial.materiales = comercial.materialPuerto;
      exportadorMaterial.exportadores = comercial.exportador;
      this.exportadoresPorMaterial.push(exportadorMaterial);
    });
    if (eCorteManual){
      this.balanzasManualCorteService.ExportadorPorMaterialPuerto = this.exportadoresPorMaterial;
      this.balanzasManualCorteService.DestinosPorMaterialPuertoBodega = this.destinosBodegaPorMaterial;
      this.balanzasManualCorteService.BalanzaManual = null;
      this.balanzasManualCorteService.PeriodoDeCarga = this.periodoDeCarga;

    }else{
      this.balanzasManualBajaCargaService.ExportadorPorMaterialPuerto = this.exportadoresPorMaterial;
      this.balanzasManualBajaCargaService.DestinosPorMaterialPuertoBodega = this.destinosBodegaPorMaterial;
      this.balanzasManualBajaCargaService.BalanzaManual = null;
      this.balanzasManualBajaCargaService.PeriodoDeCarga = this.periodoDeCarga;

    }

  }


  hasPermisoCorteManualBalanzas() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_CorteManualBalanzas);
  }
  hasPermisoTableroSolido_MotivoCorte_Editar() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_MotivoCorte_Editar);
  }
  hasPermisoTableroSolido_TerminarCarga_Exportar() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_TerminarCarga_Exportar);
  }

}
