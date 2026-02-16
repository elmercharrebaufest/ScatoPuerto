import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { MailPlanillaService } from '@ScatoServicios/mail-planilla.service';
import { TurnosRecibidoresComponent } from 'app/modulos/calidad/turnos-recibidores/turnos-recibidores/turnos-recibidores.component';

@Component({
  selector: 'app-liquidovn',
  templateUrl: './liquidovn.component.html',
  styleUrls: ['./liquidovn.component.css']
})
export class LiquidovnComponent implements OnInit {

  @Input() esLiquido: boolean = false;
  @Input() moduloDeCargaId: number = 0;
  @Input() esVicentinNouryon: boolean = false;
  @ViewChild(TurnosRecibidoresComponent) turnosComponent: TurnosRecibidoresComponent;

  constructor(
    private mailPlanillaService: MailPlanillaService,
    private confirmationDialogService: ConfirmationDialogService,) { }

  ngOnInit(): void {
  }

  imprimir(imprimir: boolean = false) {
  }

  public async enviarMailFinalizacion() {
    if (!this.turnosComponent || !this.turnosComponent.planillasTurnos) {
      return;
    }

    const hayTurnosSinCerrar = this.turnosComponent.planillasTurnos
      .some(t => !t.cerrado);

    if (hayTurnosSinCerrar) {
      this.confirmationDialogService.confirm(
        'Atención',
        'Hay turnos sin cerrar, verifique.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
      return;
    }
    await this.mailPlanillaService.enviarMailFinalizacionPlanilla(
      this.esLiquido,
      this.moduloDeCargaId,
      [],
      false
    );
  }

  public openModalCargarAmarre() {
  }

}
