using System.IO;
using System.Xml.Serialization;

namespace Molinos.Scato.Utils
{
	public static class XmlConverter<T>
    {
		// Convertir un objeto a XML string
		public static string Serialize(T obj)
		{
			if (obj == null)
			{
				return string.Empty;
			}

			var serializer = new XmlSerializer(typeof(T));
			using (var writer = new StringWriter())
			{
				serializer.Serialize(writer, obj);
				return writer.ToString();
			}
		}

		// Convertir un XML string a objeto
		public static T Deserialize(string xmlString)
		{
			if (string.IsNullOrEmpty(xmlString))
			{
				return default(T);
			}

			var serializer = new XmlSerializer(typeof(T));
			using (var reader = new StringReader(xmlString))
			{
				return (T)serializer.Deserialize(reader);
			}
		}
	}
}
