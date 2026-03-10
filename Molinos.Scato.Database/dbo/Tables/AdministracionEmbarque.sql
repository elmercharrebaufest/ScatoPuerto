CREATE TABLE [dbo].[AdministracionEmbarque]
(
	[Id]  INT IDENTITY (1, 1) NOT NULL, 
    [Embarque_Id] INT NOT NULL,
    [EstadoEmbarque_Id] INT NOT NULL, 
    [NetoTonnage] DECIMAL NULL, 
    [MuelleProp] VARCHAR(100) NULL, 
    [AmarroMuelleProp] DATETIME NULL, 
    [DesamarroMuelleProp] DATETIME NULL, 
    [FechaFacturado] DATETIME NULL,
    [FechaAplicado] DATETIME NULL,
    CONSTRAINT [PK_AdministracionEmbarque] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.AdministracionEmbarque_dbo.EstadoEmbarque_EstadoEmbarque_Id] FOREIGN KEY ([EstadoEmbarque_Id]) REFERENCES [dbo].[EstadoEmbarque] ([Id]),
    CONSTRAINT [FK_dbo.AdministracionEmbarque_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id])
)