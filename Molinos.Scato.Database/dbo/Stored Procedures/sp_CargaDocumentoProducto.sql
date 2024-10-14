CREATE PROCEDURE [dbo].[sp_CargaDocumentoProducto]
AS
SET NOCOUNT ON 

declare @tbl_documentos table( 
	Id int,
	Documento varchar(500),
	Documento_Id int
)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(1,'Aflatoxin cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(2,'B/L',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(3,'Cargo Manifest',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(4,'Conformity certificate',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(5,'Declaration Statement from shipper',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(6,'Draft Survey',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(7,'Export Certificate for Plant Processed Products ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(8,'Export declaration',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(9,'Free Sale ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(10,'Fumigation',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(11,'GMO certificate (surveyor) ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(12,'GMO Official',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(13,'GMP +',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(14,'Health',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(15,'Hold Cleanliness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(16,'Hold Inspection',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(17,'Hold Sealing',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(18,'Human Consumption',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(19,'ISCC EU',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(20,'ISCC EU cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(21,'Isotopic analysis cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(22,'Labelling statement from shipper',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(23,'M/R',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(24,'Melamine Free Certificate',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(25,'MSDS',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(26,'Non Radiation cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(27,'Origin',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(28,'OrigIn SACU',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(29,'Packing List',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(30,'Phyto',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(31,'PNF',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(32,'PoS',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(33,'Producer declaration',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(34,'Quality',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(35,'Quality / Condition',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(36,'Quantity',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(37,'Readiness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(38,'Safety certificate ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(39,'Sanitary',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(40,'Sanitary certificate including Annex note ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(41,'Tank Cleanliness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(42,'Veterinary',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(43,'Weight ',0)

      update doc_temp
         set doc_temp.Documento_Id = doc.Id 
        from @tbl_documentos doc_temp 
  inner join Documento doc on doc.Nombre = doc_temp.Documento
  
declare @tbl_documentos_destino_config table( 
	Documento_Id    int,
	Material_Puerto varchar(100)
)

insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(2,'BIODIESEL')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(19,'BIODIESEL')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(27,'BIODIESEL')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(32,'BIODIESEL')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(34,'BIODIESEL')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(36,'BIODIESEL')

insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(1,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(2,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(5,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(6,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(7,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(9,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(10,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(11,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(12,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(13,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(15,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(16,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(17,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(22,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(23,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(24,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(26,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(28,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(27,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(29,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(30,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(34,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(35,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(36,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(39,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(42,'Harina de Soja')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(43,'Harina de Soja')

insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(2,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(12,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(13,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(15,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(23,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(27,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(34,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(35,'PECASO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(43,'PECASO')

insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(1,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(2,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(6,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(8,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(9,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(10,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(11,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(12,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(14,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(15,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(16,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(17,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(23,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(24,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(26,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(27,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(29,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(30,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(34,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(35,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(36,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(39,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(42,'CORN')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(43,'CORN')

insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(2,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(14,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(23,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(27,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(30,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(34,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(41,'CSBO')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(43,'CSBO')

insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(2,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(8,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(10,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(23,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(27,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(30,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(34,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(35,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(36,'WHEAT')
insert into @tbl_documentos_destino_config(Documento_Id, Material_Puerto)values(43,'WHEAT')

Declare @Documento_Id   int
Declare @Material_Puerto varchar(100)

Declare @SelDocumento_Id int
Declare @SelMaterialPuerto_Id int

DECLARE cursor_destino CURSOR FOR 
SELECT Documento_Id, Material_Puerto 
  FROM @tbl_documentos_destino_config
OPEN cursor_destino  
FETCH NEXT FROM cursor_destino INTO @Documento_Id, @Material_Puerto
WHILE @@FETCH_STATUS = 0  
BEGIN  
      DECLARE @temp_destino_Id int = 0
      select @SelDocumento_Id = Documento_Id from @tbl_documentos where Id = @Documento_Id
	  select @SelMaterialPuerto_Id = Id from MaterialPuerto where DescripcionCorta = @Material_Puerto

	  IF NOT EXISTS(SELECT 1 FROM DocumentoMaterialPuerto WHERE Documento_Id = @SelDocumento_Id AND MaterialPuerto_Id = @SelMaterialPuerto_Id)
	     BEGIN
			insert into DocumentoMaterialPuerto(Documento_Id,MaterialPuerto_Id)values(@SelDocumento_Id,@SelMaterialPuerto_Id)
		 END

FETCH NEXT FROM cursor_destino INTO @Documento_Id, @Material_Puerto
END 

CLOSE cursor_destino  
DEALLOCATE cursor_destino

declare @Documentos table (
        Documento_Id int,
		Liquido int,
		Solido int
)

insert into @Documentos 
select doc.Id,
       Liquido = (select top 1 mpu.EsLiquido 
	                    from DocumentoMaterialPuerto dma (nolock) 
				  inner join MaterialPuerto mpu (nolock) on mpu.Id = dma.MaterialPuerto_Id and mpu.EsLiquido = 1
	                   where dma.Documento_Id = doc.Id 
                 ),
	   Solido = (select top 1 mpu.EsLiquido from DocumentoMaterialPuerto dma (nolock) 
				  inner join MaterialPuerto mpu (nolock) on mpu.Id = dma.MaterialPuerto_Id and mpu.EsLiquido = 0
	                   where dma.Documento_Id = doc.Id )
  from Documento doc


     update doc
	    set doc.Solido = (case when tmp.Solido is not null then tmp.Solido else 0 end),
			doc.Liquido= (case when tmp.Liquido is not null then tmp.Liquido else 0 end)
	   from Documento doc
 inner join @Documentos tmp on doc.Id = tmp.Documento_Id

SET NOCOUNT OFF
RETURN 0
