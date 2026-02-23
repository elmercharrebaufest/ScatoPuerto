CREATE TABLE [dbo].[OtroMuelleCarga]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Observacion] NVARCHAR(500) NOT NULL, 
    [FumigacionPreventiva] BIT NOT NULL, 
    [FumigacionCurativa] BIT NOT NULL, 
    [Senasa] BIT NOT NULL, 
	CONSTRAINT [PK_OtroMuelleCarga] PRIMARY KEY ([Id])
)
