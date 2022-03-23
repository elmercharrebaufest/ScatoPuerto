import { FormControl, FormGroup } from "@angular/forms";

export class FormUmap{
    formulario: FormGroup;

    constructor(){
        this.formulario = new FormGroup({
            fechaEncendido: new FormControl(),
            horaEncendido: new FormControl(),
            fechaApagado: new FormControl(),
            horaApagado: new FormControl(),
            velocidadDelViento: new FormControl(),
            direccionDelViento: new FormControl(),
        });
    }
}