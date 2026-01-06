import { Component, OnInit } from '@angular/core';
import { Acuerdo } from '@ScatoModels/acuerdos/acuerdos';
import { AcuerdoService } from '@ScatoServicios/acuerdo.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-acuerdo-listado',
  templateUrl: './acuerdo-listado.component.html',
  styleUrls: ['./acuerdo-listado.component.css']
})
export class AcuerdoListadoComponent implements OnInit {

  public acuerdos: Acuerdo[] = [];

  constructor(
    private acuerdoService: AcuerdoService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    this.cargarAcuerdos();
  }

  private async cargarAcuerdos(): Promise<void> {
    try {
      this.acuerdos = await this.acuerdoService.listarAcuerdos().pipe(take(1)).toPromise();
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al cargar los acuerdos.');
    }
  }

  public async eliminarAcuerdo(acuerdoId: number): Promise<void> {
    try {
      const confirm = await this.confirmationDialogService.confirmar('Atención', '¿Está seguro que desea eliminar este acuerdo?');
      if (!confirm) {
        return;
      }
      await this.acuerdoService.eliminarAcuerdo(acuerdoId).pipe(take(1)).toPromise();
      this.confirmationDialogService.exito('El acuerdo ha sido eliminado correctamente.');
      this.cargarAcuerdos();
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al eliminar el acuerdo.');
    }
  }
}
