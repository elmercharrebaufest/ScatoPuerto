import { EventEmitter, Injectable, Input, Output } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProcesoGuardarService {
    @Output() sendGuardar = new EventEmitter<boolean[]>();   
    public planoCargaOk = new Subject<boolean>();
}