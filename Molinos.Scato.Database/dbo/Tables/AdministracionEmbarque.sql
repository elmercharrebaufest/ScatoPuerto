CREATE TABLE [dbo].[AdministracionEmbarque]
(
	[Id]  INT IDENTITY (1, 1) NOT NULL, 
    [Estado_Id] INT NOT NULL, 
    [NetoTonnage] DECIMAL NULL, 
    [MuelleProp] VARCHAR(100) NULL, 
    [AmarroMuelleProp] DATETIME NULL, 
    [DesamarroMuelleProp] DATETIME NULL, 
    CONSTRAINT [PK_AdministracionEmbarque] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.AdministracionEmbarque_dbo.EstadoEmbarque_Estado_Id] FOREIGN KEY ([Estado_Id]) REFERENCES [dbo].[EstadoEmbarque] ([Id]),
)
