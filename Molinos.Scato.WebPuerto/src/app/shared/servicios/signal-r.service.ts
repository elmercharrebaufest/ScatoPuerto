import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take, timeout } from 'rxjs/operators';
import { SessionService } from './session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { ConfirmationDialogService } from './confirmation-dialog.service';
declare var $: any;

export type ModuloNotificacion = 'planoCarga' | 'moduloCarga' | 'periodoCarga' | 'lineasEmbarque' | 'planillaEmbarque' | 'turnosLiquidos' | 'turnosSolidos' |
  'umap' | 'balanzaCorte' | 'cargaSolidos' | 'nir' | 'horariosExportador' | 'recibos';

interface NotificacionGrupoDto {
  Id: number;
  IdModuloCarga: number;
  Usuario: string;
  Modulo: ModuloNotificacion;
  FechaActualizacion: Date;
  nombreModulo?: string;
}

const NotifMap: Record<ModuloNotificacion, string> = {
  // Operadores
  planoCarga: 'Plano de carga',
  moduloCarga: 'Modulo de carga',
  periodoCarga: 'Periodo de carga',
  // OP Liquidos
  lineasEmbarque: 'Conformación de líneas de embarque',
  planillaEmbarque: 'Planilla de embarque',
  turnosLiquidos: 'Planilla de turnos', // También en Recibidores Líquidos
  // OP Sólidos
  umap: 'UMAP',
  balanzaCorte: 'Cortes y bajas cargas',
  cargaSolidos: 'Planilla Embarque de Sólidos',
  // Recibidores
  recibos: 'Datos de recibos',
  horariosExportador: 'Horarios de carga',
  // Recibidores Sólidos
  turnosSolidos: 'Planilla de turnos',
  nir: 'NIR',
};

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection: any;
  private hubProxy: any;

  private notifSource = new Subject<NotificacionGrupoDto>();
  public notif$ = this.notifSource.asObservable();

  private estadoConexion = new BehaviorSubject<boolean>(false);
  public online$ = this.estadoConexion.asObservable();

  private usuario: Usuario;

  constructor(
    session: SessionService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    this.iniciarConexion();
    this.usuario = session.getUser();
  }

  private iniciarConexion(): void {
    this.hubConnection = $.hubConnection('/Scato.ServiciosWeb');
    this.hubProxy = this.hubConnection.createHubProxy('notificacionHub');

    this.hubProxy.on('notificarAGrupo', (message: NotificacionGrupoDto) => {
      message.FechaActualizacion = new Date(message.FechaActualizacion);
      message.nombreModulo = NotifMap[message.Modulo];
      this.notifSource.next(message);
    });

    this.hubConnection.start()
      .done(() => this.estadoConexion.next(true))
      .fail((err: any) => console.error('❌ Error al conectar a NotificacionHub:', err));
  }

  private async esperarConexion(): Promise<void> {
    try {
      // Se filtra solo para esperar a recibir el estado online.
      await this.online$.pipe(filter(v => v), timeout(10000), take(1)).toPromise();
    } catch (error) {
      throw new Error('❌ No se pudo conectar a SignalR: Timeout');
    }
  }

  public async suscribirAGrupo(modulo: ModuloNotificacion, idModuloCarga: number): Promise<void> {
    await this.esperarConexion();
    const codigoGrupo = idModuloCarga + '|' + modulo;
    await this.hubProxy.invoke('suscribirAGrupo', codigoGrupo);
  }

  public async desuscribirDeGrupo(modulo: ModuloNotificacion, idModuloCarga: number): Promise<void> {
    await this.esperarConexion();
    const codigoGrupo = idModuloCarga + '|' + modulo;
    await this.hubProxy.invoke('desuscribirDeGrupo', codigoGrupo);
  }

  public async enviarNotificacion(Modulo: ModuloNotificacion, IdModuloCarga: number): Promise<void> {
    await this.esperarConexion();
    const Usuario = this.usuario?.username.split('@')[0];
    const notificacion: NotificacionGrupoDto = {
      Id: 1,
      IdModuloCarga,
      Usuario,
      Modulo,
      FechaActualizacion: new Date()
    }

    await this.hubProxy.invoke('notificarAGrupo', notificacion);
  }

  public alertar(notificacion: NotificacionGrupoDto) {
    const { Usuario, nombreModulo, FechaActualizacion: fecha } = notificacion;
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString();
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');
    const fechaStr = `${dia}/${mes}/${anio} ${hora}:${minutos}:${segundos}hs`;
    const mensaje = `El usuario ${Usuario} ha realizado cambios en ${nombreModulo} el ${fechaStr}.\n` +
      'Por favor recargue la pantalla para ver reflejados los cambios y evitar sobreescribir datos.';
    this.confirmationDialogService.alertar(mensaje);
  }
}
