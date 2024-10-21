CREATE TABLE [dbo].[DocumentoDestino]
(
	Id INT IDENTITY(1,1) NOT NULL,
    Documento_Id INT NOT NULL,
    Destino_Id INT NOT NULL,
    CONSTRAINT [PK_DocumentoDestino] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.DocumentoDestino_dbo.Documento_Id] FOREIGN KEY (Documento_Id) REFERENCES Documento(Id),
    CONSTRAINT [FK_dbo.DocumentoDestino_dbo.Destino_Id] FOREIGN KEY (Destino_Id) REFERENCES Destino(Id)
)
