package cl.accesimap.service.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ValidacionGeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ValidacionGeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * DTO interno para mapear la respuesta JSON de Gemini.
     */
    public record ResultadoValidacionIaDTO(
            @JsonProperty("categoriaDetectada") String categoriaDetectada,
            @JsonProperty("nivelConfianza") Float nivelConfianza,
            @JsonProperty("estadoElemento") String estadoElemento,
            @JsonProperty("justificacion") String justificacion
    ) {}

    /**
     * Analiza la imagen utilizando Gemini Flash pidiendo una estructura JSON estricta.
     * Nota: Gemini requiere la imagen en Base64 o mediante su File API. Asumiendo que
     * descargas temporalmente la imagen de Azure Storage a un byte[] o Base64.
     */
    public ResultadoValidacionIaDTO analizarImagen(String imagenBase64, String categoriaEsperada) {
        
        String promptEstructural = """
                Eres un inspector experto en accesibilidad urbana. Analiza la imagen adjunta y verifica si corresponde a la categoría: %s.
                Evalúa la fiabilidad de lo que se presenta (ej. si es una rampa, un ascensor, escaleras, etc.) y su estado actual.
                
                Debes responder EXCLUSIVAMENTE con un objeto JSON válido, sin markdown ni texto adicional, con la siguiente estructura:
                {
                  "categoriaDetectada": "RAMPA | ASCENSOR | BAÑO | OTRO",
                  "nivelConfianza": 0.0 a 1.0 (float, donde 1.0 es certeza absoluta),
                  "estadoElemento": "BUEN_ESTADO | MAL_ESTADO | NO_APLICA",
                  "justificacion": "Breve explicación técnica de por qué se asignó ese estado y confianza."
                }
                """.formatted(categoriaEsperada);

        // Construcción del Payload para la API de Gemini
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", promptEstructural),
                                Map.of("inline_data", Map.of(
                                        "mime_type", "image/jpeg", // Ajustar dinámicamente si es png
                                        "data", imagenBase64
                                ))
                        ))
                ),
                // Forzar el formato de salida a JSON (Structured Outputs)
                "generationConfig", Map.of(
                        "response_mime_type", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        // ESTE ES EL ESPÍA:
        System.out.println("==== DEBUG GEMINI ====");
        System.out.println("URL: [" + apiUrl + "]");
        System.out.println("API KEY: [" + apiKey + "]");
        System.out.println("======================");

        try {
            // Llamada síncrona a la API de Gemini
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);
            
            // Extracción del contenido JSON de la respuesta
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String jsonSalida = (String) parts.get(0).get("text");
            // --- NUEVO ESPÍA: Imprimir la respuesta cruda de Gemini ---
            System.out.println("==== RESPUESTA JSON DE GEMINI ====");
            System.out.println(jsonSalida);
            System.out.println("==================================");

            // Mapeo del JSON crudo al DTO
            return objectMapper.readValue(jsonSalida, ResultadoValidacionIaDTO.class);

        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la imagen con Gemini IA: " + e.getMessage(), e);
        }
    }
}
