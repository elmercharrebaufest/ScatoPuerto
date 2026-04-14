CREATE TABLE [dbo].[AcuerdoPeriodo]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Periodo] DATETIME NOT NULL, 
    [FechaActualizacion] DATETIME NULL, 
    [UsuarioActualizacion] NVARCHAR(50) NULL, 
    [Cerrado] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [Pk_AcuerdoPeriodo] PRIMARY KEY ([Id])
)
