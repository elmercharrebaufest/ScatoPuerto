import { Component, OnInit } from '@angular/core';
import { ComprobantesService } from '@ScatoServicios/comprobantes.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

@Component({
  selector: 'app-comprobantes',
  templateUrl: './comprobantes.component.html',
  styleUrls: ['./comprobantes.component.css']
})
export class ComprobantesComponent implements OnInit {

  private valorDB: string;
  public numeroInicioComprobante: string;

  constructor(
    private comprobantesService: ComprobantesService,
    private confirmattionDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    this.obtenerNumeroInicioComprobante();
  }

  private obtenerNumeroInicioComprobante(): void {
    this.comprobantesService.obtenerNumeroInicioComprobante().subscribe((numero: string) => {
      this.valorDB = numero;
      this.numeroInicioComprobante = numero;
    }, error => {
      this.confirmattionDialogService.error('No se pudo cargar el número de inicio del comprobante.');
      console.error('Error al cargar el número de inicio del comprobante:', error);
    });
  }

  public numberOnly(event: KeyboardEvent): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    return charCode >= 48 && charCode <= 57;
  }

  public onChange(event: Event): void {
    var input = event.target as HTMLInputElement;
    input.value = ('0000000000' + input.value).slice(-10);
    this.numeroInicioComprobante = input.value;
  }

  public async guardar() {
    if (this.numeroInicioComprobante < this.valorDB) {
      this.confirmattionDialogService.error(`El número de inicio de comprobantes no puede ser menor al valor actual (${this.valorDB}).`);
      return;
    }

    const confirmed = await this.confirmattionDialogService.confirmar('Confirmar', `¿Está seguro de guardar el nuevo número de inicio de comprobantes ${this.numeroInicioComprobante}?`);
    if (!confirmed) {
      return;
    }

    this.comprobantesService.guardarNumeroInicioComprobante(this.numeroInicioComprobante).subscribe(() => {
      this.valorDB = this.numeroInicioComprobante;
      this.confirmattionDialogService.exito('Se guardó con éxito el número de inicio de comprobantes.');
    }, error => {
      this.confirmattionDialogService.error('Error al guardar el número de inicio de comprobantes.');
      console.error('Error al guardar el número de inicio de comprobantes:', error);
    });
  }

  public cancelar() {
    this.numeroInicioComprobante = this.valorDB;
  }
}
