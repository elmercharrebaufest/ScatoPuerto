import { Component, OnDestroy, OnInit } from '@angular/core';
import { DocumentosEstadoService } from './documentos-estado-service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-administracion-documentos-estado',
  templateUrl: './administracion-documentos-estado.component.html',
  styleUrls: ['./administracion-documentos-estado.component.css']
})
export class AdministracionDocumentosEstadoComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();
  public nominacionId: number = 0;
  constructor(private _documentosEstadoService: DocumentosEstadoService,
              private _router: Router,
              private _route: ActivatedRoute) {
    const nominacionSel = this._route.snapshot.paramMap.get('idnominacion');
    this.nominacionId = nominacionSel != null ? parseInt(nominacionSel) : 0;
    this._documentosEstadoService.NominacionSeleccionada = this.nominacionId
  }

  ngOnInit(): void {
  }
  
  public onRegresarNominacion() {
    this._router.navigate([`programa`]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}
