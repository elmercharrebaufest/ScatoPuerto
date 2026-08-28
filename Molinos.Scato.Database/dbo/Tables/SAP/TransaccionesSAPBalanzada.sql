CREATE TABLE [dbo].[TransaccionesSAPBalanzada]
(
	[Id]                  BIGINT IDENTITY(1,1) NOT NULL,
	[TransaccionesSAP_Id] BIGINT NOT NULL,
	[BalanzadaId]         INT NOT NULL,
	[NumeroBalanza]       NVARCHAR(20) NULL,
	[MaterialSap]         NVARCHAR(40) NULL,
	[ExportadorSap]       NVARCHAR(20) NULL,
	[AlmacenOrigenSap]    NVARCHAR(20) NULL,
	[AlmacenDestinoSap]   NVARCHAR(20) NULL,
	[PesoNeto]            DECIMAL(18,3) NOT NULL,
	[Fecha]               DATETIME NOT NULL,
	[Estado]              NVARCHAR(20) NULL, -- 'Enviado', 'Error'

	CONSTRAINT [PK_TransaccionesSAPBalanzada] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_TransaccionesSAPBalanzada_Cabecera] FOREIGN KEY ([TransaccionesSAP_Id]) REFERENCES [dbo].[TransaccionesSAP] ([Id])
)
