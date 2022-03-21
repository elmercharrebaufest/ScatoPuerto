
// export class ListadoTotalBalanzadas {
//     id: number; // de que?
//     motivosFallasBalanza: MotivosFallasBalanza;
//     observaciones: string;
//     balanzadas: Balanzada[];
// }

// export class MotivosFallasBalanza {
//     id: number;
//     nombre: string;
//     siglas: string;
// }

// export class Balanzada {
//     id: number; // Balanzada
//     numeroBalanza: string;
//     pesoBruto: number; // Balanzada
//     pesoTara: number; // Balanzada
//     pesoNeto: number; // Balanzada
//     capacidad: string; // Balanzada
//     fecha: Date; // RegistroBalanzaPuerto
//     enviadoASap: boolean; // RegistroBalanzaPuerto
//     cargaInicial: CargaInicial;
//     cargaInicial_Id: number; // Balanzada
//     cargaInicial_NumeroBalanza: string; // Balanzada
    
//     listadoTotalBalanzadas: ListadoTotalBalanzadas;
// }

// export class CargaInicial{
//     id: number; // Carga
//     numeroBalanza: string;
//     vapor: string; // Carga
//     material: string; // Carga
//     bodega: string; // Carga
//     exportador: string; // Carga
//     destino: string; // Carga
//     pesoProgramado: number; // Carga
//     toneladasAW: number; // Carga
//     fecha: Date; // RegistroBalanzaPuerto
//     fechaInicio: Date; // Carga
//     idFin: number;
//     error: number;
//     errorMensaje: string;
//     enviadoASap: boolean; // RegistroBalanzaPuerto
//     tipo: string; // RegistroBalanzaPuerto
//     porcentajeDeCarga: number;
//     pediente: boolean;
//     materialId: number; // Carga
// }

let listadoTotalBalanzadas = [
    {
      "id": 1,
      "motivosFallasBalanza": {
        "id": 1,
        "nombre": "sample string 2",
        "siglas": "sample string 3"
      },
      "observaciones": "sample string 2",
      "balanzadas": [
        {
          "id": 1,
          "numeroBalanza": "sample string 2",
          "pesoBruto": 3,
          "pesoTara": 4,
          "pesoNeto": 5,
          "capacidad": "sample string 6",
          "fecha": "2021-10-21T11:45:46.7419302-03:00",
          "enviadoASap": true,
          "cargaInicial": {
            "id": 1,
            "numeroBalanza": "sample string 2",
            "vapor": "sample string 3",
            "material": "sample string 4",
            "bodega": "sample string 5",
            "exportador": "sample string 6",
            "destino": "sample string 7",
            "pesoProgramado": 8,
            "toneladasAW": 9,
            "fecha": "2021-10-21T11:45:46.7429291-03:00",
            "fechaInicio": "2021-10-21T11:45:46.7429291-03:00",
            "idFin": 1,
            "error": 1,
            "errorMensaje": "sample string 10",
            "enviadoASap": true,
            "vaporId": 12,
            "materialId": 13,
            "bodegaId": 14,
            "exportadorId": 15,
            "destinoId": 16,
            "cargaOpuesta_Id": 1,
            "cargaOpuesta_NumeroBalanza": "sample string 17",
            "tipo": "sample string 18",
            "porcentajeDeCarga": 19,
            "pediente": true
          },
          "cargaInicial_Id": 8,
          "cargaInicial_NumeroBalanza": "sample string 9"
        },
        {
          "id": 1,
          "numeroBalanza": "sample string 2",
          "pesoBruto": 3,
          "pesoTara": 4,
          "pesoNeto": 5,
          "capacidad": "sample string 6",
          "fecha": "2021-10-21T11:45:46.7419302-03:00",
          "enviadoASap": true,
          "cargaInicial": {
            "id": 1,
            "numeroBalanza": "sample string 2",
            "vapor": "sample string 3",
            "material": "sample string 4",
            "bodega": "sample string 5",
            "exportador": "sample string 6",
            "destino": "sample string 7",
            "pesoProgramado": 8,
            "toneladasAW": 9,
            "fecha": "2021-10-21T11:45:46.7429291-03:00",
            "fechaInicio": "2021-10-21T11:45:46.7429291-03:00",
            "idFin": 1,
            "error": 1,
            "errorMensaje": "sample string 10",
            "enviadoASap": true,
            "vaporId": 12,
            "materialId": 13,
            "bodegaId": 14,
            "exportadorId": 15,
            "destinoId": 16,
            "cargaOpuesta_Id": 1,
            "cargaOpuesta_NumeroBalanza": "sample string 17",
            "tipo": "sample string 18",
            "porcentajeDeCarga": 19,
            "pediente": true
          },
          "cargaInicial_Id": 8,
          "cargaInicial_NumeroBalanza": "sample string 9"
        }
      ]
    }
]