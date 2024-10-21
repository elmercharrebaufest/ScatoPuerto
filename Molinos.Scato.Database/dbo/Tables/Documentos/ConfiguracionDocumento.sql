CREATE TABLE [dbo].[ConfiguracionDocumento]
(
	[Id] INT IDENTITY(1,1) NOT NULL, 
    [Nominacion_Id] INT NOT NULL, 
    [CoordinadorPuerto_Id] INT NOT NULL, 
    [Destino_Id] INT NOT NULL, 
    [CantidadDeJuegos] INT NOT NULL,
    CONSTRAINT [PK_ConfiguracionDocumento] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.ConfigruacionDocumento_dbo.Nominacion_Id] FOREIGN KEY (Nominacion_Id) REFERENCES Nominacion(Id) ON DELETE CASCADE,
    CONSTRAINT [FK_dbo.ConfigruacionDocumento_dbo.CoordinadorPuerto_Id] FOREIGN KEY ([CoordinadorPuerto_Id]) REFERENCES CoordinadorPuerto(Id),
    CONSTRAINT [FK_dbo.ConfigruacionDocumento_dbo.Destino_Id] FOREIGN KEY (Destino_Id) REFERENCES Destino(Id)
)
