CREATE TABLE [dbo].[TransaccionesSAPDetallesEmbarque]
(
	[Id]                  BIGINT IDENTITY(1,1) NOT NULL,
    [TransaccionesSAP_Id] BIGINT NOT NULL,
    [NominacionId]        INT NOT NULL,
    [NroNom_SAP]          NVARCHAR(20) NOT NULL,
    [TipoDeContratoId]    INT NOT NULL,
    [ExportadorSap]       NVARCHAR(20) NULL,
    [MaterialSap]         NVARCHAR(20) NULL,
    [DestinoSap]          NVARCHAR(10) NULL,
    [Cantidad]            DECIMAL(18,2) NOT NULL,
    [OperacionItem]       NVARCHAR(1) NOT NULL, -- 'A', 'M', 'B'
    
    CONSTRAINT [PK_TransaccionesSAP_Detalle] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TransaccionesSAP_Detalle_Cabecera] FOREIGN KEY ([TransaccionesSAP_Id]) REFERENCES [dbo].[TransaccionesSAP] ([Id])
)
