CREATE TABLE [dbo].[DocumentoMotivoAlerta]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	Motivo NVARCHAR(50)
	CONSTRAINT [PK_DocumentoMotivoAlerta] PRIMARY KEY ([Id])
)
