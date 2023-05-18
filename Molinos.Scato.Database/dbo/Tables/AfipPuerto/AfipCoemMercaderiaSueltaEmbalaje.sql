CREATE TABLE [dbo].[AfipCoemMercaderiaSueltaEmbalaje]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [AfipCoemMercaderiaSuelta_Id] INT NOT NULL, 
    [CodigoEmbalaje] NVARCHAR(2) NOT NULL, 
    [ Peso] INT NOT NULL, 
    [CantidadBultos] INT NOT NULL, 
    CONSTRAINT [FK_dbo.AfipCoemMercaderiaSueltaEmbalaje_dbo.AfipCoemMercaderiaSuelta_Id] FOREIGN KEY ([AfipCoemMercaderiaSuelta_Id]) REFERENCES [AfipCoemMercaderiaSuelta]([Id]) ON DELETE CASCADE
)
