import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css']
})
export class CodeComponent implements OnInit {

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }
  openModalEditarCrearCode(modal: any) {
    // this.errorMessage = false;
    
    this.modalService.open(modal, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
  }

}
