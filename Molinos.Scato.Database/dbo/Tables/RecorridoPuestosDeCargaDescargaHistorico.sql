CREATE TABLE [dbo].[RecorridoPuestosDeCargaDescargaHistorico] (
    [Recorrido_Id]              INT NOT NULL,
    [PuestosDeCargaDescarga_Id] INT NOT NULL,
    CONSTRAINT [PK_dbo.RecorridoPuestosDeCargaDescargaHistorico] PRIMARY KEY CLUSTERED ([Recorrido_Id] ASC, [PuestosDeCargaDescarga_Id] ASC),
    CONSTRAINT [FK_dbo.RecorridoPuestosDeCargaDescargaHistoricoco_dbo.PuestosDeCargaDescarga_PuestosDeCargaDescarga_Id] FOREIGN KEY ([PuestosDeCargaDescarga_Id]) REFERENCES [dbo].[PuestosDeCargaDescarga] ([Id]) ON DELETE CASCADE
);
GO

