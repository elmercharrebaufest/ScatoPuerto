import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { BalanzaManual, BalanzaManualCargas, DestinosPorMaterialPuertoBodega, ExportadorPorMaterialPuerto } from '@ScatoModels/balanza-manual/balanza-manual';
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
import { BalanzasManualCargaNormalService } from '../balanzas-manual-carga-normal/balanzas-manual-carga-normal.service';

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
  permisosScato: typeof PermisosScato = PermisosScato;
  balanza7Form: FormGroup;
  balanza8Form: FormGroup;
  numeroBalanza: number;
  balanza8Cargas: BalanzaManualCargas=new BalanzaManualCargas();
  balanza7Cargas: BalanzaManualCargas=new BalanzaManualCargas();
  private destroy$ = new Subject();
  private planoCargaSeleccionado:PlanoDeCarga;
  private paramSoloLectura: any;
  public periodoDeCarga: PeriodoDeCarga;
  private user: Usuario;
  IdUltimoRegistroBalanza8: number;
  IdUltimoRegistroBalanza7: number;
  constructor(private embarqueSharingService: EmbarqueSharingService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private procesoService: DatosEmbarquesProcesoService,
    private planoDeCargaService: PlanoDeCargaService,
    private balanzasManualService: BalanzasManualService,
    private balanzasManualCorteService: BalanzasManualCorteService,
    private balanzasManualBajaCargaService: BalanzasManualBajaCargaService,
    private balanzasManualCargaNormalService: BalanzasManualCargaNormalService,
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

  public onOpenModal(modal, numeroBalanza , esCorte: boolean = false, esCargaNormal: boolean = false) {
    this.numeroBalanza = numeroBalanza;
    if (esCargaNormal){
      this.enviarMaterialExportador(esCorte,esCargaNormal);
      this.balanzasManualCargaNormalService.BalanzaManual = null;
    }else{
      this.enviarMaterialExportador(esCorte);
      if (esCorte)
        this.balanzasManualCorteService.BalanzaManual = null;
      else
        this.balanzasManualBajaCargaService.BalanzaManual = null;
    }
    this.modalService.open(modal);
  }

  public onOpenEditarModal(modal, numeroBalanza, balanza: BalanzaManual) {
    this.numeroBalanza = numeroBalanza;
    if (balanza.cargaNormal){
      this.enviarMaterialExportador(balanza.corteManual, true);
      this.balanzasManualCargaNormalService.BalanzaManual = balanza;
      this.balanzasManualCargaNormalService.PeriodoDeCarga = this.periodoDeCarga;
    }else{
      this.enviarMaterialExportador(balanza.corteManual);
      if (balanza.corteManual){
        this.balanzasManualCorteService.BalanzaManual = balanza;
        this.balanzasManualCorteService.PeriodoDeCarga = this.periodoDeCarga;
      }
      if (!balanza.corteManual){
        this.balanzasManualBajaCargaService.BalanzaManual = balanza;
        this.balanzasManualBajaCargaService.PeriodoDeCarga = this.periodoDeCarga;
      }
    }

    this.modalService.open(modal);
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
          if (numeroBalanza == 7){
            this.balanzas7.removeAt(index);
            this.calcularUltimoRegistroPorBalanza('7');
          }
          if (numeroBalanza == 8){
            this.balanzas8.removeAt(index);
            this.calcularUltimoRegistroPorBalanza('8');
          }
          this.calcularFechasCargaBalanzas();
        }
      });
    }
  }
  public async onAgregarCortes(event, numeroBalanza) {
    let balanzas = numeroBalanza == 8 ? this.balanzas8 : this.balanzas7;
    this.balanzasManualService.agregarCorteBajaCarga(balanzas,event, false, numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username).subscribe((data) =>{
      this.listarBalanzaManualPorBalanza(numeroBalanza);
      let divTablaBalanza = document.getElementById(`divBalanza${numeroBalanza}`);
      divTablaBalanza.scrollTop = divTablaBalanza.scrollHeight + 10;
      this.balanzasManualService.guardoCorteBajaCarga$.next();
    });
    setTimeout(() => this.calcularFechasCargaBalanzas(), 1000);
  }
  public async onAgregarBajaCarga(event, numeroBalanza) {
    let balanzas = numeroBalanza == 8 ? this.balanzas8 : this.balanzas7;
    this.balanzasManualService.agregarCorteBajaCarga(balanzas,event, false, numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username).subscribe((data) =>{
      this.listarBalanzaManualPorBalanza(numeroBalanza);
      let divTablaBalanza = document.getElementById(`divBalanza${numeroBalanza}`);
      divTablaBalanza.scrollTop = divTablaBalanza.scrollHeight + 10;
      this.balanzasManualService.guardoCorteBajaCarga$.next();
    });
    setTimeout(() => this.calcularFechasCargaBalanzas(), 1000);
  }
  public async onAgregarCargaNormal(event, numeroBalanza) {
    let balanzas = numeroBalanza == 8 ? this.balanzas8 : this.balanzas7;
    this.balanzasManualService.agregarCorteBajaCarga(balanzas,event, false, numeroBalanza, this.embarqueSelected.moduloDeCargaId, this.user.username).subscribe((data) =>{
      this.listarBalanzaManualPorBalanza(numeroBalanza);
      let divTablaBalanza = document.getElementById(`divBalanza${numeroBalanza}`);
      divTablaBalanza.scrollTop = divTablaBalanza.scrollHeight + 10;
      this.balanzasManualService.guardoCorteBajaCarga$.next();
    });
    setTimeout(() => this.calcularFechasCargaBalanzas(), 1000);
  }
  public async enviarBuqueCalidad() {
    const mensaje: string = "¿Desea terminar la carga y exportar planillas?";
    this.confirmationDialogService.confirm('¡Atención!', mensaje, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success).then((confirmed) => {
      if (confirmed) {
        this.balanzasManualService.enviarBuqueCalidad(this.embarqueSelected.id).pipe(takeUntil(this.destroy$)).subscribe((data: boolean) =>{
          if (data){
            this.balanzasManualService.exportarBalanzasAExcel(this.balanzas7,this.balanzas8, this.embarqueSelected);
          }
        });
      }
    });
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
    },error=>{},()=>{
      this.calcularUltimoRegistroPorBalanza('7');
      this.calcularUltimoRegistroPorBalanza('8');
      this.calcularFechasCargaBalanzas();
    });
  }

  private calcularUltimoRegistroPorBalanza(numeroBalanza: string){
    let listaFechas = [];
    let listaFiltrar;
    if (numeroBalanza == "7")
      listaFiltrar = this.balanzas7;
    if (numeroBalanza == "8")
      listaFiltrar = this.balanzas8;
    

    for(var i = 0; i<= listaFiltrar.controls.length-1; i++) {
      const registro = listaFiltrar.controls[i].value;
      const id = registro.id;
      const fecha = registro.fechaCorte;
      const hora = registro.horaCorte;
      const fechaHora = this.balanzasManualService.convertirFecha(fecha,hora);
      listaFechas.push({
        id: id,
        fechaCorte : fecha,
        horaCorte : hora,
        fechaHora: fechaHora
      });
    }
    const listas = listaFechas.sort((a, b) => a.fechaHora - b.fechaHora);
    const registroMaximo = listas.reverse()[0];

    if (numeroBalanza == "7")
      this.IdUltimoRegistroBalanza7 = registroMaximo.id;
    if (numeroBalanza == "8")
      this.IdUltimoRegistroBalanza8 = registroMaximo.id;
   
  }
  private listarBalanzaManualPorBalanza(numeroBalanza: string){

    let registros = numeroBalanza == '8'? this.balanzas8.controls.length : this.balanzas7.controls.length;
    let balanzas = numeroBalanza == '8'? this.balanzas8 : this.balanzas7;
    for (let i = 0; i <= registros; i++) {
      balanzas.removeAt(registros - i);
    }
    this.balanzasManualService.listarBalanzaManual(this.embarqueSelected.moduloDeCargaId).pipe(takeUntil(this.destroy$)).subscribe((data: BalanzaManual[]) =>{
      data.forEach(item =>{
        if (item.numeroBalanza == numeroBalanza){
          this.balanzasManualService.cargarCorteBajaCarga((numeroBalanza == '8' ? this.balanzas8 : this.balanzas7),item);
        }
      })

    },error=>{},()=>{
      this.calcularFechasCargaBalanzas();
      if (numeroBalanza == '7') this.calcularUltimoRegistroPorBalanza('7');
      if (numeroBalanza == '8') this.calcularUltimoRegistroPorBalanza('8');
    });
  }
  private calcularFechasCargaBalanzas(){
    this.balanza7Cargas = this.balanzasManualService.fechasMaximasYMinimas(this.balanzas7);
    this.balanza8Cargas = this.balanzasManualService.fechasMaximasYMinimas(this.balanzas8);
  }
  private enviarMaterialExportador(eCorteManual:boolean = false, esCargaNormal: boolean = false){
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
    if (esCargaNormal){
      this.balanzasManualCargaNormalService.ExportadorPorMaterialPuerto = this.exportadoresPorMaterial;
      this.balanzasManualCargaNormalService.DestinosPorMaterialPuertoBodega = this.destinosBodegaPorMaterial;
      this.balanzasManualCargaNormalService.PeriodoDeCarga = this.periodoDeCarga;
      if (this.numeroBalanza == 7)
        this.balanzasManualCargaNormalService.RegistroBalanza = this.balanzas7;
      else
      this.balanzasManualCargaNormalService.RegistroBalanza = this.balanzas8;
    }else{
      if (eCorteManual){
        this.balanzasManualCorteService.ExportadorPorMaterialPuerto = this.exportadoresPorMaterial;
        this.balanzasManualCorteService.DestinosPorMaterialPuertoBodega = this.destinosBodegaPorMaterial;
        this.balanzasManualCorteService.PeriodoDeCarga = this.periodoDeCarga;
        if (this.numeroBalanza == 7)
          this.balanzasManualCorteService.RegistroBalanza = this.balanzas7;
        else
        this.balanzasManualCorteService.RegistroBalanza = this.balanzas8;
  
      }else{
        if (this.numeroBalanza == 7)
          this.balanzasManualBajaCargaService.RegistroBalanza = this.balanzas7;
        else
        this.balanzasManualBajaCargaService.RegistroBalanza = this.balanzas8;
  
        this.balanzasManualBajaCargaService.ExportadorPorMaterialPuerto = this.exportadoresPorMaterial;
        this.balanzasManualBajaCargaService.DestinosPorMaterialPuertoBodega = this.destinosBodegaPorMaterial;
        this.balanzasManualBajaCargaService.PeriodoDeCarga = this.periodoDeCarga;
      }
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

  public existeCorteConRecordatorio(balanza: number): boolean {
    const formKey = balanza === 7 ? 'balanza7Form' : balanza === 8 ? 'balanza8Form' : null;
    if (!formKey) {
      return false; 
    }
    const formArray = (this[formKey]?.get(`balanzas${balanza}`) as FormArray)?.value;
    return Array.isArray(formArray) && formArray.some(b => b.recordatorio === true);
  }

}
