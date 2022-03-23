import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FuncionesGeneralesService {

  constructor() { }

  /**
   * Ajuste decimal de un número.
   *
   * @param {String}  tipo  El tipo de ajuste.
   * @param {Number}  valor El numero.
   * @param {Integer} exp   El exponente (el logaritmo 10 del ajuste base).
   * @returns {Number} El valor ajustado.
   * @example this.decimalAdjust('round', porcentajeCarga, -2)
   */
   decimalAdjust(type = 'round', value, exp = -2) {
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  /**
   * De New Date() a formato 'DD-MM-YYYY HH:MM'
   *
   * @param {Date}  date  New Date().
   * @param {String}  formato  'ES' | 'EN'.
   * @returns {String} Fecha y hora en formato 'DD-MM-YYYY HH:MM'.
   */
  getFechaHora(date: any, formato: string = 'ES'){
    let fechaHora = '';

    let dd = date.getDate();
    let mm = date.getMonth()+1; 
    let yyyy = date.getFullYear();
    let hora = date.getHours();
    let minutos = date.getMinutes();

    if(dd<10) dd=`0${dd}`;
    if(mm<10) mm=`0${mm}`;
    if(hora<10) hora=`0${hora}`;
    if(minutos<10) minutos=`0${minutos}`;

    if( formato == 'EN' ){
      fechaHora = `${yyyy}-${mm}-${dd} ${hora}:${minutos}`;
    } else {
      fechaHora = `${dd}-${mm}-${yyyy} ${hora}:${minutos}`;
    }

    return fechaHora;
  }

  /**
   * Extraer números de un campo.
   *
   * @param {String}  campo  Campo del cual extraer los números.
   * @param {String}  tipo Tipo de retorno.
   * @returns {Number | String} 
   */
  getNumbersInString(campo: string, tipo: string) {
    var tmp = campo.split("");
    var map = tmp.map(function(current) {
      if (!isNaN(parseInt(current))) {
        return current;
      }
    });
  
    var numbers = map.filter(function(value) {
      return value != undefined;
    });
  
    if(tipo=='number'){
      return parseInt(numbers.join(""));
    } else {
      return numbers.join("");
    }
  }

  
}
