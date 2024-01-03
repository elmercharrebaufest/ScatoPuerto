CREATE TABLE [dbo].[PlanoDeCargaBodegaDestinoHistorico]
(
	[Id] INT IDENTITY (1,1) NOT NULL,
	[PlanoDeCargaBodegaHistorico_Id] INT NOT NULL,
	[Destino_Id] INT NOT NULL,
	CONSTRAINT [PK_PlanoDeCargaBodegaDestinoHistorico] PRIMARY KEY ([Id]),
	CONSTRAINT [FK_dbo.PlanoDeCargaBodegaDestinoHistorico_dbo_PlanoDeCargaBodegaHistorico_Id] FOREIGN KEY ([PlanoDeCargaBodegaHistorico_Id]) REFERENCES [PlanoDeCargaBodegaHistorico]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.PlanoDeCargaBodegaDestinoHistorico_dbo_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [Destino]([Id]) ON DELETE CASCADE
)	