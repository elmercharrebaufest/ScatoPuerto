import { EventEmitter, Injectable, Output } from '@angular/core';
import { ManosDeEmbarque } from '@ScatoModels/mano-embarque';


@Injectable({
    providedIn: 'root'
})
export class ManosEmbarqueService {
    @Output() removerManoDeEmbarque = new EventEmitter<object>();
    @Output() removerResaltadoSilos = new EventEmitter<object>();
    @Output() resaltarSilo = new EventEmitter<string>();
    @Output() agregarManoDeEmbarque = new EventEmitter<object>();
    @Output() obtenerManosDeEmbarque = new EventEmitter<ManosDeEmbarque>();
    @Output() agregarTabique = new EventEmitter<object>();
    @Output() removerTabique = new EventEmitter<string>();
}
