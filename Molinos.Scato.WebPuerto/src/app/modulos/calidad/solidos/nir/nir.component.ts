import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-nir',
  templateUrl: './nir.component.html',
  styleUrls: ['./nir.component.css']
})
export class NIRComponent implements OnInit {
  @Input() tipoMaterial: string;
  headersTabla: string[];
  formControlNames: string[];

  nirForm: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initHeadersTabla();
    this.initFormulario();
  }

  initHeadersTabla(){
    if(this.tipoMaterial == 'Trigo'){
      this.headersTabla = ['Fecha', 'Hora', 'Ritmo Tn/h', '%HD', 'Prot. Base 13;50',
      'Prot. B/S', 'PH', 'Origen', 'Bodega', 'Mano'];
      this.formControlNames = ['fecha','hora','ritmoTnH','porcentajeHD','protBase','protBS','ph',
      'origen','bodega', 'mano'];
    }else{
      this.headersTabla = ['Fecha', 'Hora', '%HD', 'PH', 'Origen', 'Bodega', 'Mano'];
      this.formControlNames = ['fecha','hora','porcentajeHD','ph',
      'origen','bodega', 'mano'];
    }
  }

  initFormulario(){
    this.nirForm = this.initDatosMano();
  }

  initDatosMano(){
    return this.tipoMaterial == 'Trigo' ?
      this.formBuilder.group({
        id: '',
        fecha: '',
        hora: '',
        ritmoTnH: '',
        porcentajeHD: '',
        protBase: '',
        protBS: '',
        ph: '',
        origen: '',
        bodega: '',
        mano: ''
      }) :
      this.formBuilder.group({
        id: '',
        fecha: '',
        hora: '',
        porcentajeHD: '',
        ph: '',
        origen: '',
        bodega: '',
        mano: ''
      });
  }
}