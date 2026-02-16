import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { ModuloDeCargaService } from './modulo-de-carga.service';
import { EnvioMailDialogService } from './envio-mail-dialog.service';
import { ConfirmationDialogService } from './confirmation-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class MailPlanillaService {

  constructor(
    private moduloCargaService: ModuloDeCargaService,
    private envioDialogService: EnvioMailDialogService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  public async enviarMailFinalizacionPlanilla(
    esLiquido: boolean,
    moduloDeCargaId: number,
    cortesOcultos: number[], 
    verObservacionesCalidad?: boolean
  ): Promise<void> {

    let mail: any;

    if (esLiquido) {

      mail = await this.moduloCargaService
        .obtenerDatosMailPlanillaLiquidos(
          moduloDeCargaId,
          cortesOcultos,
          true,
          true
        )
        .pipe(take(1))
        .toPromise();

    } else {

      mail = await this.moduloCargaService
        .obtenerDatosMailPlanillaSolidos(
          moduloDeCargaId,
          cortesOcultos,
          verObservacionesCalidad || false,
          true
        )
        .pipe(take(1))
        .toPromise();
    }

    const confirm = await this.envioDialogService.confirm(
      "Enviar Email Fin",
      'Cuerpo del Mail:',
      mail.titulo,
      'Enviar',
      'Cancelar',
      'xl',
      mail,
      null,
      "Para:",
      "CC:",
      true
    );

    if (!confirm) {
      return;
    }

    mail.body = this.repararTablasHtml(mail.body);

    try {
      await this.moduloCargaService
        .enviarMail(mail)
        .pipe(take(1))
        .toPromise();

      this.confirmationDialogService.exito(
        'El email fue enviado con éxito',
        'Email enviado'
      );

    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error(
        'Ocurrió un error al enviar el email'
      );
    }
  }

  private repararTablasHtml(html: string): string {

    if (!html || !html.includes('<figure class="table">')) {
      return html;
    }

    let htmlLimpio = html
      .replace(/<figure class="table">/g, '')
      .replace(/<\/figure>/g, '')
      .replace(/<th[^>]*>\s*(?:&nbsp;|\s)*<\/th>/gi, '')
      .replace(/<th(?!ead)([^>]*)>/g, '<th$1 style="border: 1px solid black; padding: 8px; text-align: left;">')
      .replace(/<td([^>]*)>/g, '<td$1 style="border: 1px solid black; padding: 8px; text-align: left;">');

    return `<div style="font-family: Arial, sans-serif; font-size: 14px;">${htmlLimpio}</div>`;
  }
}
