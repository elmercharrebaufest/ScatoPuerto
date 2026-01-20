CREATE TABLE [dbo].[AcuerdoEmbarque](
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[Acuerdo_Id] INT NOT NULL,
	[Embarque_Id] INT NOT NULL,
	[MaterialPuerto_Id] INT NOT NULL,
	[Cantidad] DECIMAL(18, 3) NOT NULL,
	CONSTRAINT [Pk_AcuerdoEmbarque] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoEmbarque_Acuerdo] FOREIGN KEY ([Acuerdo_Id]) REFERENCES [dbo].[Acuerdo]([Id]),
	CONSTRAINT [Fk_AcuerdoEmbarque_Embarque] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque]([Id]),
	CONSTRAINT [Fk_AcuerdoEmbarque_MaterialPuerto] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto]([Id])
);