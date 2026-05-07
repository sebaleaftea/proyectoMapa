package cl.accesimap.service.ai;

import com.microsoft.azure.cognitiveservices.vision.computervision.ComputerVisionClient;
import com.microsoft.azure.cognitiveservices.vision.computervision.ComputerVisionManager;
import com.microsoft.azure.cognitiveservices.vision.computervision.models.ImageAnalysis;
import com.microsoft.azure.cognitiveservices.vision.computervision.models.ImageTag;
import com.microsoft.azure.cognitiveservices.vision.computervision.models.VisualFeatureTypes;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AzureVisionFacade {

    @Value("${azure.vision.subscription-key}")
    private String subscriptionKey;

    @Value("${azure.vision.endpoint}")
    private String endpoint;

    private ComputerVisionClient client;

    @PostConstruct
    public void init() {
        client = ComputerVisionManager.authenticate(subscriptionKey).withEndpoint(endpoint);
    }

    public ImageAnalysisResult analizarImagen(String fotoUrl) {
        List<VisualFeatureTypes> featuresToExtractFromLocalImage = Collections.singletonList(VisualFeatureTypes.TAGS);

        try {
            ImageAnalysis analysis = client.computerVision().analyzeImage()
                    .withUrl(fotoUrl)
                    .withVisualFeatures(featuresToExtractFromLocalImage)
                    .execute();

            return new ImageAnalysisResult(analysis.tags());
        } catch (Exception e) {
            // Manejo de errores 500, timeous, limitación de capa free etc (Azure_VISION_TIMEOUT)
            throw new RuntimeException("Error al comunicarse con Azure Vision AI: " + e.getMessage());
        }
    }

    // Clase interna para el resultado
    public static class ImageAnalysisResult {
        private final List<ImageTag> tags;

        public ImageAnalysisResult(List<ImageTag> tags) {
            this.tags = tags;
        }

        public Float getConfidenceForCategory(String expectedCategory) {
            if (tags == null) return 0f;

            // Traducción o matching muy simple (MVP)
            // Se debe definir la lógica de matching según el negocio
            String englishWord = mapCategoryToEnglish(expectedCategory);
            
            for (ImageTag tag : tags) {
                if (tag.name().equalsIgnoreCase(englishWord)) {
                    return (float) tag.confidence();
                }
            }
            return 0f; // No coincidencia encontrada
        }

        private String mapCategoryToEnglish(String categoria) {
            return switch (categoria.toUpperCase()) {
                case "RAMPA" -> "ramp";
                case "ASCENSOR" -> "elevator";
                case "BAÑO" -> "toilet";
                default -> categoria;
            };
        }
    }
}
