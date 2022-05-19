import { NumericLiteral } from 'typescript';
import { DateNFOption } from 'xlsx';
import { Bandera } from './bandera';

export class EmbarqueInformacion {
            id :number;
           embarqueId: number;
            imo:string;
            mmsi :string;
            bandera : Bandera;
            tonelaje :number;
            tonelajePesoMuerto:number; 
            largoxAnchoExtremo :string;
            fotoEmbarque:string;
            fechaRegistro:DateNFOption;


            constructor(id,embarque_id,imo,mmsi,bandera,tonelaje,tonelajePesoMuerto,largoxAnchoExtremo,fotoembarque,fecharegistro){
                this.id = id;
                this.embarqueId = embarque_id;
                this.imo = imo;
                this.mmsi = mmsi;
                this.bandera = bandera;
                this.tonelaje = tonelaje;
                this.tonelajePesoMuerto = tonelajePesoMuerto;
                this.largoxAnchoExtremo = largoxAnchoExtremo;
                this.fotoEmbarque = fotoembarque;
                this.fechaRegistro = fecharegistro;
            }
}
