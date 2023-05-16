import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-coem',
  templateUrl: './coem.component.html',
  styleUrls: ['./coem.component.css']
})
export class CoemComponent implements OnInit {

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openModalCrearCaratula(modal: any) {
    // this.errorMessage = false;
    
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

}
