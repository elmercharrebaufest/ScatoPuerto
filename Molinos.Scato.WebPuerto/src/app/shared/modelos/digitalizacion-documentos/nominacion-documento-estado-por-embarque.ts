export interface NominacionDocumentoEstadoPorEmbarque {
    documentoId: number;
    documento: string;
    esBorradorSolicitado: boolean;
    esBorradorEnviado: boolean;
    esBorradorModificado: boolean;
    esBorradorAprobado: boolean;
    esDocumentoEnviado: boolean;
    esDocumentoCerrado: boolean;
}