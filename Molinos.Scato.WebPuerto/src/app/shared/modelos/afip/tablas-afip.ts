interface AfipTabla {
  id: number;
  codigo: string;
  descripcion: string;
}

interface AfipTablaExtra extends AfipTabla {
  vigenciaDesde: number;
  vigenciaHasta: number;
  pais: number;
  aduana: string;
}

export interface AfipTipoEmbalaje extends AfipTabla { }         // TIPEMB_DESC
export interface AfipPuntoAduanero extends AfipTabla { }        // BUR_DESC
export interface AfipPuerto extends AfipTablaExtra { }          // POR_PAIS
export interface AfipPais extends AfipTablaExtra { }            // PAY_PAIS
export interface AfipTipoDocumento extends AfipTabla { }        // DOCIDE_DESC
export interface AfipNaturalezaEmbalaje extends AfipTabla { }   // NEB_DESC
export interface AfipLugarOperativo extends AfipTablaExtra { }  // LOT_ADUA
export interface AfipCondicionContenedor extends AfipTabla { }  // CONCTD_DESC
export interface AfipMotivoSolicitudCambio extends AfipTabla { }  // MOTIVO_SOL
export interface AfipMotivoNoABordo extends AfipTabla { } // MOTIVO_NAB

