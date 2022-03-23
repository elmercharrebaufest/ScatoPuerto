// import { Balanzada, ListadoTotalBalanzadas } from '@ScatoModels/balanzadas/balanza';

// export class BalanzadasCompletas {
//     balanzadasAgrupadas: BalanzadasAgrupadas[];
//     balanzadasBajaCarga: BalanzadasBajaCarga[];
// }

// export class BalanzadasAgrupadas {
//     balanzadas: Balanzada[];
//     bodega: string;
//     fechaFin: Date; //fecha de fin de la balanzada, tabla registroPuertoBalanzas
//     fechaInicio: Date; //fecha de inicio de la balanzada, tabla registroPuertoBalanzas
//     grupoCompleto: boolean;
//     horaFin: string; //Hora de fin de la balanzada
//     horaInicio: string; //Hora de inicio de la balanzada
//     // id?: number;
//     kilos: number;
//     listadoTotalBalanzadas: ListadoTotalBalanzadas;
//     nombreBuque: string;
//     numeroBalanza: string;
//     porcentajeCarga: number;
//     producto: string;
//     seleccionado: boolean;
//     toneladas: number;
//     totalProducto: number;
// }

// export class BalanzadasBajaCarga {
//     bodega: string;
//     fechaFin: Date;
//     fechaInicio: Date; //fecha de inicio de la balanzada, tabla registroPuertoBalanzas
//     horaFin: string;
//     horaInicio: string; //Hora de inicio de la balanzada
//     kilos: number; //tn
//     listadoTotalBalanzadas: ListadoTotalBalanzadas;
//     nombreBuque: string; //nombre de la tabla vapor
//     numeroBalanza: string; //tabla balanza puerto
//     producto: string;
//     toneladas: number; //tn
// }

// let balanzadasCompletas = {
// // let balanzadasCompletas: BalanzadasCompletas = {
//     balanzadasAgrupadas: [],
//     balanzadasBajaCarga: [
//         {
//             "nombreBuque": "Buque01",
//             "numeroBalanza": "BLZA07",
//             "fechaInicio": "2021-10-20",
//             "horaInicio": "11:00",
//             "toneladas": 1500,
//             "listadoTotalBalanzadas": {
//                 "motivosFallasBalanza": {
//                     "id": 0,
//                     "nombre": "Falla",
//                     "siglas": "F",
//                 },
//                 "observaciones": "Prueba de observaciones",
//                 // "balanzadas": {},
//             },
//             "producto": "HDS",
//             "bodega": "Bodega02",
//         },
//         {
//             "nombreBuque": "Buque01",
//             "numeroBalanza": "BLZA08",
//             "fechaInicio": "2021-10-21",
//             "horaInicio": "11:45",
//             "toneladas": 500,
//             "listadoTotalBalanzadas": {
//                 "motivosFallasBalanza": {
//                     "id": 0,
//                     "nombre": "Falla",
//                     "siglas": "F",
//                 },
//                 "observaciones": "Prueba de observaciones",
//                 // "balanzadas": {},
//             },
//             "producto": "HDS",
//             "bodega": "Bodega03",
//         },
//         {
//             "nombreBuque": "Buque01",
//             "numeroBalanza": "BLZA07",
//             "fechaInicio": "2021-10-21",
//             "horaInicio": "11:45",
//             "toneladas": 0,
//             "listadoTotalBalanzadas": {
//                 "motivosFallasBalanza": {
//                     "id": 0,
//                     "nombre": "",
//                     "siglas": "",
//                 },
//                 "observaciones": "Prueba de observaciones",
//                 // "balanzadas": {},
//             },
//             "producto": "TRIGO",
//             "bodega": "Bodega02",
//         }
//     ]
// }