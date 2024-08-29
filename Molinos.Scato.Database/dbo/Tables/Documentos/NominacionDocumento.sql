CREATE TABLE [dbo].[NominacionDocumento]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	Documento_Id INT NOT NULL,
    Nominacion_Id INT NOT NULL,
    Cliente_Id INT NOT NULL,
    Destino_Id INT NOT NULL,
    NominacionDocumentoEstado_Id INT NOT NULL,
    CantidadDeJuegos INT NOT NULL,
    CONSTRAINT [PK_NominacionDocumento] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.Documento_Id] FOREIGN KEY (Documento_Id) REFERENCES Documento(Id),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.Nominacion_Id] FOREIGN KEY (Nominacion_Id) REFERENCES Nominacion(Id),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.Cliente_Id] FOREIGN KEY (Cliente_Id) REFERENCES Cliente(Id),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.Destino_Id] FOREIGN KEY (Destino_Id) REFERENCES Destino(Id),
    CONSTRAINT [FK_dbo.NominacionDocumento_dbo.NominacionDocumentoEstado_Id] FOREIGN KEY (NominacionDocumentoEstado_Id) REFERENCES NominacionDocumentoEstado(Id)
)
