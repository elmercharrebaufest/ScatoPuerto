CREATE TABLE [dbo].[NominacionDocumento]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	[Documento_Id] INT NOT NULL,
    [NominacionDocumentoEstado_Id] INT NOT NULL,
    [ConfiguracionDocumento_Id] INT NOT NULL, 
    CONSTRAINT [PK_NominacionDocumento] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.Documento_Id] FOREIGN KEY (Documento_Id) REFERENCES Documento(Id),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.NominacionDocumentoEstado_Id] FOREIGN KEY (NominacionDocumentoEstado_Id) REFERENCES NominacionDocumentoEstado(Id),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.ConfiguracionDocumento_Id] FOREIGN KEY (ConfiguracionDocumento_Id) REFERENCES ConfiguracionDocumento([Id]) ON DELETE CASCADE
)
