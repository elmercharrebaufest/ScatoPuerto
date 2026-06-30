import { Component, HostListener, OnInit } from '@angular/core';
import { CamaraAduanaDto, CamarasService } from '../servicios/camaras.service';

@Component({
  selector: 'app-camaras',
  templateUrl: './camaras.component.html',
  styleUrls: ['./camaras.component.css']
})
export class CamarasComponent implements OnInit {
  camaras: CamaraAduanaDto[] = [];
  camaraExpandida: CamaraAduanaDto | null = null;
  cargando = true;
  error = '';

  constructor(private camarasService: CamarasService) { }

  ngOnInit(): void {
    this.camarasService.listar().subscribe(
      data => {
        this.camaras = (data || []).sort((a, b) => a.posicion - b.posicion);
        this.cargando = false;
      },
      () => {
        this.cargando = false;
        this.error = 'No fue posible obtener el listado de cámaras.';
      }
    );
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.camaraExpandida = null;
  }

  onDobleClickCamara(camara: CamaraAduanaDto): void {
    if (this.camaraExpandida?.id === camara.id) {
      this.camaraExpandida = null;
      return;
    }
    this.camaraExpandida = camara;
  }
}
