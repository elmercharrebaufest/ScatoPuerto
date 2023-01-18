CREATE TABLE [dbo].[NominacionRecibo](
	[Id] [int] IDENTITY (1, 1) NOT NULL,
	[NumeroRecibo] [int] NULL,
	[Nominacion_Id] [int] NOT NULL,
	[Exportador_Id] [int] NULL,
	[Formato] [varchar](10) NULL,
	[Cantidad] [int] NULL,
	[Unidad] [varchar](10) NULL,
	[Ajuste] [varchar](10) NULL,
	[PuertoDeCarga] [varchar](250) NULL,
	[PuertoDeDescarga] [varchar](250) NULL,
	[DescripcionesBienes] [varchar](250) NULL,
	[RecibosPorDia] BIT NULL,
	[MostrarDestinos] BIT NULL,
	[MostrarBodegas] BIT NULL,
 CONSTRAINT [PK_dbo.NominacionRecibo] PRIMARY KEY CLUSTERED ([Id] ASC),
 CONSTRAINT [FK_dbo.NominacionRecibo_dbo.Exportador_Exportador_Id] FOREIGN KEY([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
 CONSTRAINT [FK_dbo.NominacionRecibo_dbo.Nominacion_Nominacion_Id] FOREIGN KEY([Nominacion_Id]) REFERENCES [dbo].[Nominacion] ([Id]),
)



GO

CREATE TRIGGER [dbo].[Trigger_NominacionRecibo]
    ON [dbo].[NominacionRecibo]
    FOR UPDATE
    AS
    BEGIN

        IF((select Exportador_Id from deleted) <> (select Exportador_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'Exportador_Id', d.Exportador_Id,
	        i.Exportador_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
        IF((select Formato from deleted) <> (select Formato from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'Formato', d.Formato,
	        i.Formato , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          IF((select Cantidad from deleted) <> (select Cantidad from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'Cantidad', d.Cantidad,
	        i.Cantidad , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          IF((select Unidad from deleted) <> (select Unidad from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'Unidad', d.Unidad,
	        i.Unidad , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          IF((select Ajuste from deleted) <> (select Ajuste from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'Ajuste', d.Ajuste,
	        i.Ajuste , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          IF((select PuertoDeDescarga from deleted) <> (select PuertoDeDescarga from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'PuertoDeDescarga', d.PuertoDeDescarga,
	        i.PuertoDeDescarga , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
           IF((select DescripcionesBienes from deleted) <> (select DescripcionesBienes from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'DescripcionesBienes', d.DescripcionesBienes,
	        i.DescripcionesBienes , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
           IF((select RecibosPorDia from deleted) <> (select RecibosPorDia from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'RecibosPorDia', d.RecibosPorDia,
	        i.RecibosPorDia , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
           IF((select MostrarDestinos from deleted) <> (select MostrarDestinos from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'MostrarDestinos', d.MostrarDestinos,
	        i.MostrarDestinos , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

             IF((select MostrarBodegas from deleted) <> (select MostrarBodegas from inserted) )
        BEGIN
       insert into Auditoria
        SELECT d.Nominacion_Id , d.id, 'NominacionRecibo', 'MostrarBodegas', d.MostrarBodegas,
	        i.MostrarBodegas , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
    END