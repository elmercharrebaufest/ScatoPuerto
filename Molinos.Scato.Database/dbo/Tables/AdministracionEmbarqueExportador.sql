CREATE TABLE [dbo].[AdministracionEmbarqueExportador]
(
	[Id]  INT IDENTITY (1, 1) NOT NULL, 
    [AdministracionEmbarque_Id] INT NOT NULL, 
    [Exportador_Id] INT NOT NULL, 
    CONSTRAINT [FK_dbo.AdministracionEmbarqueExportador_dbo.AdministracionEmbarque_AdministracionEmbarque_Id] FOREIGN KEY ([AdministracionEmbarque_Id]) REFERENCES [dbo].[AdministracionEmbarque] ([Id]),
    CONSTRAINT [FK_dbo.AdministracionEmbarqueExportador_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
)
