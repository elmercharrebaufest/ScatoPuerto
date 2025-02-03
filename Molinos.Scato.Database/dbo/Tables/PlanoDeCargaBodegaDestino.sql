CREATE TABLE [dbo].[PlanoDeCargaBodegaDestino]
(
	[Id] INT IDENTITY (1,1) NOT NULL,
	[PlanoDeCargaBodega_Id] INT NOT NULL,
	[Destino_Id] INT NOT NULL,
	[Cantidad] DECIMAL(18, 3) NOT NULL DEFAULT 0 , 
    [Exportador_Id] INT NULL, 
    CONSTRAINT [PK_PlanoDeCargaBodegaDestino] PRIMARY KEY ([Id]),
	CONSTRAINT [FK_dbo.PlanoDeCargaBodegaDestino_dbo_PlanoDeCargaBodega_Id] FOREIGN KEY ([PlanoDeCargaBodega_Id]) REFERENCES [PlanoDeCargaBodega]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.PlanoDeCargaBodegaDestino_dbo_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [Destino]([Id]) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.PlanoDeCargaBodegaDestino_dbo_Exportador_Id] FOREIGN KEY (Exportador_Id) REFERENCES [Exportador]([Id])
)	