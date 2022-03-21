import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PDFService {

  @Output() sendGenerarPDF = new EventEmitter();
  constructor() {}
}
