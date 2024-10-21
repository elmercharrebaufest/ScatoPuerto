import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ClienteDestino {
  cliente: string;
  destino: string;
  id: number;  
}

@Component({
  selector: 'app-administracion-documentos',
  templateUrl: './administracion-documentos.component.html',
  styleUrls: ['./administracion-documentos.component.css']
})

export class AdministracionDocumentosComponent implements OnInit {

  private destroy$ = new Subject();
  private listaClienteDestino: ClienteDestino [];
  public buque: string;
  public fechaNominacion: Date;
  public producto: string;

  constructor(private nominacionService: NominacionService,
    private route: ActivatedRoute,
  ) { 
    this.obtenerNominacion();
  }

  ngOnInit(): void {
  }

  private obtenerNominacion(){
    const nominacionId = Number(this.route.snapshot.paramMap.get('idnominacion'));
    this.nominacionService.obtenerNominacion(nominacionId).pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log("nom:", data);
      this.fechaNominacion = data.fechaCreacion;
      this.buque = data.nominacionDatoTecnico.vaporInformacion.nombreBuque;
      this.producto = data.nominacionDatoTecnico.materialPuerto.descripcion;
    });      

  }
}
