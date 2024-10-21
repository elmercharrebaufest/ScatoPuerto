CREATE TABLE [dbo].[NominacionDocumentoEstado]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	Estado NVARCHAR(50),
	CONSTRAINT [PK_NominacionDocumentoEstado] PRIMARY KEY ([Id])
)
