import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoemAfipComponent } from './coem-afip/coem-afip.component';
import { ActivatedRoute } from '@angular/router';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
import { Caratula } from '@ScatoModels/afip/caratula';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coem',
  templateUrl: './coem.component.html',
  styleUrls: ['./coem.component.css']
})
export class CoemComponent implements OnInit, OnDestroy {

  @ViewChild(CoemAfipComponent) coemAfipComponent: CoemAfipComponent;

  public caratulaId: number;
  public caratula: Caratula;
  public suscripciones: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private caratulaService: CaratulaAfipService
  ) { }

  ngOnInit(): void {
    const susRuta = this.route.params.subscribe(params => this.caratulaId = Number(params['id']));
    const susCaratula = this.caratulaService.$caratula.subscribe(caratula => this.caratula = caratula);
    this.suscripciones.push(susRuta, susCaratula);
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(s => s.unsubscribe());
  }

  openModalCrearCaratula(modal: any) {
    this.modalService.open(modal, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  crearFinish(event) {
    this.coemAfipComponent.cargarDatos();
  }

}
