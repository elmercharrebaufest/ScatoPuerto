CREATE TABLE [dbo].[VaporInformacion]
(
	[Id] INT NOT NULL  IDENTITY , 


    [Vapor_Id] INT NOT NULL, 
    [Bandera_Id] INT NOT NULL, 
    [NombreBuque] VARCHAR(50) NOT NULL, 
    [TipoBuque] VARCHAR(50) NOT NULL, 
    [CategoriaBuque] VARCHAR(50) NULL, 
    [ImoVapor] VARCHAR(50) NULL, 
    [Freeboard] DECIMAL(18, 2) NULL, 
    [Eslora] DECIMAL(18, 2) NULL, 
    [PorteNeto] DECIMAL(18, 2) NULL, 
    [PorteBruto] DECIMAL(18, 2) NULL, 
    [Manga] DECIMAL(18, 2) NULL, 
    [Puntual] DECIMAL(18, 2) NULL, 
    [CantidadBodegasTks] INT NULL, 
    CONSTRAINT [PK_VaporInformacion] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.VaporInformacion_dbo.Vapor_Vapor_Id] FOREIGN KEY ([Vapor_Id]) REFERENCES [dbo].[Vapor] ([Id]),
    CONSTRAINT [FK_dbo.VaporInformacion_dbo.Bandera_Bandera_Id] FOREIGN KEY ([Bandera_Id]) REFERENCES [dbo].[Bandera] ([Id]),

)
