import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NotificacionProgramaDeEmbarque } from '@ScatoModels/programa-embarque/notificacionProgramaDeEmbarque';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  animations: [
    trigger('deleteItem', [
      state('expanded', style({  })),
      state('collapsed', style({  opacity: '-1', margin: '-90px 0px 0px 0px' })),
      transition('expanded <=> collapsed', [animate('900ms cubic-bezier(0.08, 0.15, 0.20, 0.47)')]),
    ]),
  ],
})
export class NotificacionesComponent implements AfterViewInit {

  deletedElement: any;
  selectedItem = [];
  eliminando: boolean = false;
  router: Router;
  @Input() notificaciones: NotificacionProgramaDeEmbarque[] = []
  @Output() showNotifications = new EventEmitter<boolean>();
  @Output() eliminarNotificacion = new EventEmitter<NotificacionProgramaDeEmbarque>();

  ngAfterViewInit() {
    this.setNotificationsDialogHeight();
  }

  public text: String;
  firstTime: boolean = true;
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if(!this.eRef.nativeElement.contains(event.target) && !this.firstTime) {      
      this.showNotifications.emit(false);
    }
    this.firstTime = false;
  }

  constructor(private eRef: ElementRef) {
    this.text = 'no clicks yet';
  }

  setNotificationsDialogHeight(trEliminadoIndex: number = 10) {
    var cantidadNotificaciones: number = this.notificaciones.length;
    if (cantidadNotificaciones != null || cantidadNotificaciones != undefined) {
      if (cantidadNotificaciones > 0) {
        if (cantidadNotificaciones > 3) cantidadNotificaciones = 3
        var tableChilds = document.getElementById("tableNotificaciones").childNodes;
        var notificationDialogHeight = 0;
        var trIndex = 0;
        tableChilds.forEach((element: Element) => {
          if (cantidadNotificaciones > 0) {
            if (element.nodeName == "TR") {
              if (trIndex != trEliminadoIndex) {
                notificationDialogHeight += element.getBoundingClientRect().height;
                document.getElementById("notificationDialog").style.height = "" + notificationDialogHeight + "px"
                cantidadNotificaciones--;
              }
              trIndex += 1;
            }
          } else {
            return;
          }
        })
      }
    }
  }

  onEliminarNotificacion(item: NotificacionProgramaDeEmbarque) {
    if(!this.eliminando){
      this.eliminando = true;
      this.deletedElement = this.notificaciones.find(e => e.id === item.id);
      setTimeout(() => {
        var index = this.notificaciones.findIndex((e) => e.id == item.id);
        this.notificaciones = this.notificaciones.filter(e => e.id != item.id)
        this.eliminarNotificacion.emit(item);
        this.setNotificationsDialogHeight(index);
        if (this.notificaciones.length == 0) {
          this.showNotifications.emit(false);
        }
        this.eliminando = false;
      }, 900);      
    }
  }

}
