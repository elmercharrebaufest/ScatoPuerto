CREATE TABLE [dbo].[EmbarqueCoordinador]
(
	
	[CoordinadorPuerto_Id]	INT		NOT NULL,
	[Embarque_Id]			INT		NOT NULL,
	
	CONSTRAINT [FK_dbo.EmbarqueCoordinador_dbo.CoordinadorPuerto_CoordinadorPuerto_Id] FOREIGN KEY ([CoordinadorPuerto_Id]) REFERENCES [dbo].[CoordinadorPuerto] ([Id]),
	CONSTRAINT [FK_dbo.EmbarqueCoordinador_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]) ON DELETE CASCADE,

	CONSTRAINT [UK_EmbarqueCoordinador] UNIQUE ([CoordinadorPuerto_Id], [Embarque_Id])
)
