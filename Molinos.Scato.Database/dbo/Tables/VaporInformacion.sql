CREATE TABLE [dbo].[VaporInformacion]
(
	[Id] INT NOT NULL  IDENTITY , 


    [vapor_Id] INT NOT NULL, 
    [PaisPuerto_id] INT NOT NULL, 
    [nombreBuque] VARCHAR(50) NOT NULL, 
    [tipoBuque] VARCHAR(50) NOT NULL, 
    [categoriaBuque] VARCHAR(50) NULL, 
    [imoVapor] VARCHAR(50) NULL, 
    [freeboard] DECIMAL(18, 2) NULL, 
    [eslora] DECIMAL(18, 2) NULL, 
    [porteNeto] DECIMAL(18, 2) NULL, 
    [porteBruto] DECIMAL(18, 2) NULL, 
    [manga] DECIMAL(18, 2) NULL, 
    [puntual] DECIMAL(18, 2) NULL, 
    [cantidadBodegasTks] INT NULL, 
    CONSTRAINT [PK_VaporInformacion] PRIMARY KEY ([Id]) 


)
