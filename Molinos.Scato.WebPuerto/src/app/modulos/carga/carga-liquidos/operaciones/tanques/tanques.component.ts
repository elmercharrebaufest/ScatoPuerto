import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EstadoTanquesService } from '@ScatoServicios/estado-tanques.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-tanques',
  templateUrl: './tanques.component.html',
  styleUrls: ['./tanques.component.css']
})
export class TanquesComponent implements OnInit {
  public tankGroup: FormGroup;
  hoy: Date;
  datosEmbarque: any;
  embarque: EmbarqueNav;
  moduloDeCarga: any;
  @Output() tanquesSeleccionados = new EventEmitter<any>();
  @Input() esCalidad: boolean = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  
  constructor(
    private _tanksService: EstadoTanquesService,
    private _procesoService: DatosEmbarquesProcesoService,
    private _moduloCargaService: ModuloDeCargaService,
    private rederer: Renderer2,
    private session: SessionService,
  ) {
    this.hoy = new Date();
    this.user = this.session.getUser();
  }

  ngOnInit(): void {
    this.newForm();
    this.setDeshabilitarTankes();

    if(!this.hasPermisoLiquido_EditarHabilitacionTanques()) this.tankGroup.disable();
  }

  newForm() {
    this.embarque = this._procesoService.getEmbarqueSelected();
    this.tankGroup = new FormGroup({
      Tanque32: new FormControl(true),
      Tanque33: new FormControl(true),
      Tanque34: new FormControl(true),
      Tanque35: new FormControl(true),
      Tanque36: new FormControl(true),
      Tanque37: new FormControl(true),
      Tanque40: new FormControl(true),
      Tanque38: new FormControl(true),
      Tanque31: new FormControl(true),
      Tanque30: new FormControl(true),
      Tanque7: new FormControl(true),
      Tanque8: new FormControl(true),
      Tanque9: new FormControl(true),
      Tanque1: new FormControl(true),
      Tanque2: new FormControl(true),
      Tanque20: new FormControl(true),
    });
    this.obtenerModuloDeCarga();
  }

  obtenerModuloDeCarga() {
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.moduloDeCarga = this._procesoService.getModuloDeCarga();
    
    if (this.moduloDeCarga?.cargado) {
      this.tankGroup.get('Tanque1').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque1);
      this.tankGroup.get('Tanque2').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque2);
      this.tankGroup.get('Tanque7').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque7);
      this.tankGroup.get('Tanque8').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque8);
      this.tankGroup.get('Tanque9').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque9);
      this.tankGroup.get('Tanque20').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque20);
      this.tankGroup.get('Tanque30').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque30);
      this.tankGroup.get('Tanque31').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque31);
      this.tankGroup.get('Tanque32').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque32);
      this.tankGroup.get('Tanque33').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque33);
      this.tankGroup.get('Tanque34').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque34);
      this.tankGroup.get('Tanque35').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque35);
      this.tankGroup.get('Tanque36').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque36);
      this.tankGroup.get('Tanque37').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque37);
      this.tankGroup.get('Tanque38').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque38);
      this.tankGroup.get('Tanque40').setValue(this.moduloDeCarga.moduloDeCargaHabilitacionDeTanques[0].tanque40);
      this._tanksService.setTank(this.tankGroup);
      this.tanquesSeleccionados.emit(this.tankGroup);
    } else {
      this._moduloCargaService.obtenerUltimaHabilitacionDeTanques().subscribe(
        (res: any) => {
          if (res.id != 0) {
            this.tankGroup.get('Tanque1').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque1);
            this.tankGroup.get('Tanque2').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque2);
            this.tankGroup.get('Tanque7').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque7);
            this.tankGroup.get('Tanque8').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque8);
            this.tankGroup.get('Tanque9').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque9);
            this.tankGroup.get('Tanque20').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque20);
            this.tankGroup.get('Tanque30').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque30);
            this.tankGroup.get('Tanque31').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque31);
            this.tankGroup.get('Tanque32').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque32);
            this.tankGroup.get('Tanque33').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque33);
            this.tankGroup.get('Tanque34').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque34);
            this.tankGroup.get('Tanque35').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque35);
            this.tankGroup.get('Tanque36').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque36);
            this.tankGroup.get('Tanque37').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque37);
            this.tankGroup.get('Tanque38').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque38);
            this.tankGroup.get('Tanque40').setValue(res.moduloDeCargaHabilitacionDeTanques[0].tanque40);
          }
          this._tanksService.setTank(this.tankGroup);
          this.tanquesSeleccionados.emit(this.tankGroup);
        }
      )
    };
  }

  setTankValue() {
    this._tanksService.setTank(this.tankGroup);
  }
  setDeshabilitarTankes() {
    if (!this.esCalidad) return;
    for (let inicio = 0; inicio <= 8; inicio++) {
      const nombreTanque = "customSwitch3" + inicio;
      const tanqueSel = document.getElementById(nombreTanque);
      if (tanqueSel != undefined || tanqueSel != null) {
        this.rederer.setAttribute(tanqueSel, 'disabled', 'true');
      }
    }
    const tanqueSel1 = document.getElementById('customSwitch1');
    const tanqueSel2 = document.getElementById('customSwitch2');
    const tanqueSel7 = document.getElementById('customSwitch7');
    const tanqueSel8 = document.getElementById('customSwitch8');
    const tanqueSel9 = document.getElementById('customSwitch9');
    const tanqueSel20 = document.getElementById('customSwitch20');
    const tanqueSel40 = document.getElementById('customSwitch40');

    if (tanqueSel1 != undefined || tanqueSel1 != null) this.rederer.setAttribute(tanqueSel1   , 'disabled', 'true');
    if (tanqueSel2 != undefined || tanqueSel2 != null) this.rederer.setAttribute(tanqueSel2   , 'disabled', 'true');
    if (tanqueSel7 != undefined || tanqueSel7 != null) this.rederer.setAttribute(tanqueSel7   , 'disabled', 'true');
    if (tanqueSel8 != undefined || tanqueSel8 != null) this.rederer.setAttribute(tanqueSel8   , 'disabled', 'true');
    if (tanqueSel9 != undefined || tanqueSel9 != null) this.rederer.setAttribute(tanqueSel9   , 'disabled', 'true');
    if (tanqueSel20 != undefined || tanqueSel20 != null) this.rederer.setAttribute(tanqueSel20, 'disabled', 'true');
    if (tanqueSel40 != undefined || tanqueSel40 != null) this.rederer.setAttribute(tanqueSel40, 'disabled', 'true');

  }

  hasPermisoLiquido_EditarHabilitacionTanques() {
    return this.user.permisos.find(p => p === this.permisosScato.Liquido_EditarHabilitacionTanques);
  }

}