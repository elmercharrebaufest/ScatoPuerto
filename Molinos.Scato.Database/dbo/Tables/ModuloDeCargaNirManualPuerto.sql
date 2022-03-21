CREATE TABLE [dbo].[ModuloDeCargaNirManualPuerto]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [Fecha] DATETIME NULL, 
    [Hora] VARCHAR(8) NULL, 
    [Ritmo] NVARCHAR(50) NULL, 
    [HD] NVARCHAR(50) NULL, 
    [ProtBase] NVARCHAR(50) NULL, 
    [Prot_BS] NVARCHAR(50) NULL, 
    [PH] NVARCHAR(50) NULL, 
    [Origen] NVARCHAR(50) NULL, 
    [Bodega] NVARCHAR(50) NULL, 
    [ModuloDeCarga_Id] INT NOT NULL,
    CONSTRAINT [FK_dbo.ModuloDeCargaNirManualPuerto_dbo.ModuloDeCarga_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade

)
