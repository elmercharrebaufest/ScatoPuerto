CREATE TABLE [dbo].[NominacionEmbarque]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[Nominacion_Id] INT NOT NULL,
	[Embarque_Id] INT NOT NULL,

	CONSTRAINT [FK_dbo.NominacionEmbarque_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
	CONSTRAINT [FK_dbo.NominacionEmbarque_dbo.Nominacion_Nominacion_Id] FOREIGN KEY ([Nominacion_Id]) REFERENCES [dbo].[Nominacion] ([Id]) ON DELETE CASCADE,
	CONSTRAINT [UK_NominacionEmbarque] UNIQUE ([Embarque_Id], [Nominacion_Id])
)
