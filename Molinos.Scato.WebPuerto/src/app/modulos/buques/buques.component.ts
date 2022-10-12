import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-buques',
  templateUrl: './buques.component.html',
  styleUrls: ['./buques.component.css']
})
export class BuquesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
