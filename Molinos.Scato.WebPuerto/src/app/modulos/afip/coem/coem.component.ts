import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoemAfipComponent } from './coem-afip/coem-afip.component';

@Component({
  selector: 'app-coem',
  templateUrl: './coem.component.html',
  styleUrls: ['./coem.component.css']
})
export class CoemComponent implements OnInit {

  @ViewChild(CoemAfipComponent) coemAfipComponent: CoemAfipComponent;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openModalCrearCaratula(modal: any) {
    // this.errorMessage = false;
    
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  crearFinish(event) {
    this.coemAfipComponent.listarEstados();
    this.coemAfipComponent.listarCoems();
  }

}
