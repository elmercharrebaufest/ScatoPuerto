CREATE TABLE [dbo].[DocumentoMaterialPuerto]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	Documento_Id INT NOT NULL,
    MaterialPuerto_Id INT NOT NULL,
	Activo BIT NOT NULL DEFAULT 0
	CONSTRAINT [PK_DocumentoMaterialPuerto] PRIMARY KEY ([Id]),
	CONSTRAINT [FK_dbo.DocumentoProducto_dbo.Documento_Id] FOREIGN KEY (Documento_Id) REFERENCES Documento(Id),
    CONSTRAINT [FK_dbo.DocumentoProducto_dbo.MaterialPuerto_Id] FOREIGN KEY (MaterialPuerto_Id) REFERENCES MaterialPuerto(Id)

)
