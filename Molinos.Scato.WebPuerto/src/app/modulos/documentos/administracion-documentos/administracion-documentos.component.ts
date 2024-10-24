import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { ConfiguracionDocumento } from '@ScatoModels/digitalizacion-documentos/documento';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-administracion-documentos',
  templateUrl: './administracion-documentos.component.html',
  styleUrls: ['./administracion-documentos.component.css']
})

export class AdministracionDocumentosComponent implements OnInit {

  private destroy$ = new Subject();
  public configIdSeleccionada: number;
  public buque: string;
  public producto: string;
  public fechaNominacion: string;
  public configuraciones: ConfiguracionDocumento [];
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(private nominacionService: NominacionService,
              private documentoService: DocumentoService,
              private route: ActivatedRoute,
              private datePipe: DatePipe
  ) { 
  }

  ngOnInit(): void {
    this.obtenerNominacion();
  }

  private obtenerNominacion() {
    const nominacionId = Number(this.route.snapshot.paramMap.get('idnominacion'));
    this.nominacionService.obtenerNominacion(nominacionId).pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.fechaNominacion = this.datePipe.transform(data.fechaCreacion, 'dd/MM/yyyy');
      this.buque = data.nominacionDatoTecnico.vaporInformacion.nombreBuque;
      this.producto = data.nominacionDatoTecnico.materialPuerto.descripcion;
      this.configuraciones = data.configuracionDocumentos;
      this.configIdSeleccionada = this.configuraciones[0].id;
      this.documentoService.actualizarConfiguracion(this.configIdSeleccionada);
    });
  }

  public onSeleccionarConfiguracion(event: any) {
    const idConfig: number = Number(event.target.value);
    this.documentoService.actualizarConfiguracion(idConfig);
  }

  public tienePermisoVisualizarDocumentosMOC() {
    return this.user.permisos.find(p => p === this.permisosScato.Moc_Documentos_Visualizar);
  }

  public tienePermisoVisualizarDocumentosComex() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Documentos_Visualizar);
  }
}
