import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionSharingService {
    
    private puntosInteresSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null); 
    private buquesLineUpSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null); 
    private buqueSeleccionadoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null); 

    getBuqueSeleccionado(){
        return this.buqueSeleccionadoSubject.asObservable();
    }
    setBuqueSeleccionado(buqueSeleccionado: any){
        this.buqueSeleccionadoSubject.next(buqueSeleccionado);
    }
    getPuntosInteres(){
        return this.puntosInteresSubject.asObservable();
    }
    setPuntosInteres(puntosInteres: any){
        this.puntosInteresSubject.next(puntosInteres);
    }
    getBuquesLineUp(){
        return this.buquesLineUpSubject.asObservable();
    }
    setBuquesLineUp(buquesLineUp: any){
        this.buquesLineUpSubject.next(buquesLineUp);
    }
    
    
}