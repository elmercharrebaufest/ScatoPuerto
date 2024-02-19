using Newtonsoft.Json;

namespace Molinos.Scato.Utils
{
	public static class JsonConverter<T>
	{
		// Convertir un objeto a JSON string
		public static string Serialize(T obj)
		{
			return JsonConvert.SerializeObject(obj);
		}

		// Convertir un JSON string a objeto
		public static T Deserialize(string jsonString)
		{
			return JsonConvert.DeserializeObject<T>(jsonString);
		}
	}
}
