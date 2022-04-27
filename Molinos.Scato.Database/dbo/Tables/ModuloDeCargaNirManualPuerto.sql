CREATE TABLE [dbo].[ModuloDeCargaNirManualPuerto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
    [Fecha] DATETIME NULL, 
    [Hora] VARCHAR(8) NULL, 
    [Ritmo] NVARCHAR(50) NULL, 
    [HD] NVARCHAR(50) NULL, 
    [ProtBase] NVARCHAR(50) NULL, 
    [Prot_BS] NVARCHAR(50) NULL, 
    [PH] NVARCHAR(50) NULL, 
    [Origen] NVARCHAR(50) NULL, 
    --[Bodega] NVARCHAR(50) NULL, 
    [Mano] NVARCHAR(50) NULL,
    [ModuloDeCarga_Id] INT NOT NULL,
    [Material_id] INT NULL,
    [Bodega_id] INT NULL, 
    --[Bodega_id] INT NULL,
    CONSTRAINT [PK_dbo.ModuloDeCargaNirManualPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaNirManualPuerto_dbo.ModuloDeCarga_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade,
    --CONSTRAINT [FK_dbo.ModuloDeCargaNirManualPuerto_dbo.Bodega_Bodega_Id] FOREIGN KEY ([Bodega_Id]) REFERENCES [dbo].[Bodega] ([Id]),

)
