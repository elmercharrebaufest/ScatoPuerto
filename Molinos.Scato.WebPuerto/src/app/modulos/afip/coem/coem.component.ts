import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoemAfipComponent } from './coem-afip/coem-afip.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coem',
  templateUrl: './coem.component.html',
  styleUrls: ['./coem.component.css']
})
export class CoemComponent implements OnInit {

  @ViewChild(CoemAfipComponent) coemAfipComponent: CoemAfipComponent;

  public caratulaId: number;

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => this.caratulaId = Number(params['id']));
  }

  openModalCrearCaratula(modal: any) {
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  crearFinish(event) {
    this.coemAfipComponent.cargarDatos();
  }

}
