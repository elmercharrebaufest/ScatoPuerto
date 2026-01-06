CREATE TABLE [dbo].[Acuerdo]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[AcuerdoTipo_Id] INT NOT NULL, 
    [Descripcion] NVARCHAR(100) NOT NULL, 
    [MuelleDeCarga_Id] INT NOT NULL, 
    [Exportador_Id] INT NOT NULL, 
    [FechaInicio] DATETIME NOT NULL, 
    [FechaFin] DATETIME NOT NULL, 
    [FechaEliminacion] DATETIME NULL, 
    [UsuarioEliminacion] NVARCHAR(100) NULL, 
    [NombreArchivo] NVARCHAR(255) NULL, 
    [UbicacionArchivo] NVARCHAR(300) NULL, 
    CONSTRAINT [Pk_Acuerdo] PRIMARY KEY ([Id]),
    CONSTRAINT [Fk_Acuerdo_AcuerdoTipo] FOREIGN KEY ([AcuerdoTipo_Id]) REFERENCES [dbo].[AcuerdoTipo]([Id]),
    CONSTRAINT [Fk_Acuerdo_MuelleDeCarga] FOREIGN KEY ([MuelleDeCarga_Id]) REFERENCES [dbo].[MuelleDeCarga]([Id]),
    CONSTRAINT [Fk_Acuerdo_Exportador] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador]([Id])
)
