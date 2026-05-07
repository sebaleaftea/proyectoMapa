package cl.accesimap.service;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.enums.EstadoReporte;
import cl.accesimap.repository.ReporteRepository;
import lombok.RequiredArgsConstructor;
import org.geotools.data.collection.ListFeatureCollection;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.api.data.SimpleFeatureSource;
import org.geotools.api.data.SimpleFeatureStore; // Importación corregida
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.referencing.CRS;
import org.locationtech.jts.geom.Point;
import org.geotools.api.feature.simple.SimpleFeature;
import org.geotools.api.feature.simple.SimpleFeatureType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils; // Utilidad de Spring para borrar carpetas

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ExportacionService {

    @Autowired
    private ReporteRepository reporteRepository;

    public File generarShapefile(Integer comunaId) throws Exception {

        // CORRECCIÓN: Uso de Enum en lugar de "VALIDADO" quemado como String
        List<Reporte> reportes = reporteRepository.findByComunaIdAndEstado(comunaId, EstadoReporte.VALIDADO.name());

        SimpleFeatureTypeBuilder typeBuilder = new SimpleFeatureTypeBuilder();
        typeBuilder.setName("Reportes");
        typeBuilder.setCRS(CRS.decode("EPSG:4326")); // WGS 84
        typeBuilder.add("geom", Point.class);
        typeBuilder.add("id", String.class);
        typeBuilder.add("categoria", String.class);
        typeBuilder.add("estado", String.class);

        SimpleFeatureType featureType = typeBuilder.buildFeatureType();
        SimpleFeatureBuilder featureBuilder = new SimpleFeatureBuilder(featureType);
        ListFeatureCollection collection = new ListFeatureCollection(featureType);

        for (Reporte reporte : reportes) {
            featureBuilder.add(reporte.getUbicacion());
            featureBuilder.add(reporte.getId().toString());
            featureBuilder.add(reporte.getCategoria().name());
            featureBuilder.add(reporte.getEstado().name());
            SimpleFeature feature = featureBuilder.buildFeature(reporte.getId().toString());
            collection.add(feature);
        }

        File tempDir = java.nio.file.Files.createTempDirectory("shapefile_").toFile();
        File shpFile = new File(tempDir, "reportes.shp");

        Map<String, Serializable> params = new HashMap<>();
        params.put("url", shpFile.toURI().toURL());
        params.put("create spatial index", Boolean.TRUE);

        ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();
        ShapefileDataStore dataStore = (ShapefileDataStore) dataStoreFactory.createNewDataStore(params);
        dataStore.createSchema(featureType);

        String typeName = dataStore.getTypeNames()[0];
        SimpleFeatureSource featureSource = dataStore.getFeatureSource(typeName);

        // CORRECCIÓN CRÍTICA: El cast correcto para escribir es SimpleFeatureStore
        if (featureSource instanceof SimpleFeatureStore featureStore) {
            featureStore.addFeatures(collection);
        } else {
            // Previene el error silencioso si ocurre un problema interno en GeoTools
            throw new IOException("El origen de datos de GeoTools no permite escritura.");
        }

        // CORRECCIÓN CRÍTICA: Liberar el lock de archivos antes de comprimirlos
        dataStore.dispose();

        File zipFile = createZipFromDirectory(tempDir);

        // CORRECCIÓN CRÍTICA: Eliminar la carpeta temporal pesada para evitar fugar el
        // disco del servidor
        FileSystemUtils.deleteRecursively(tempDir);

        return zipFile;
    }

    private File createZipFromDirectory(File dir) throws IOException {
        File zipFile = File.createTempFile("export_gis_", ".zip");
        try (FileOutputStream fos = new FileOutputStream(zipFile);
                ZipOutputStream zos = new ZipOutputStream(fos)) {

            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (!file.isDirectory()) {
                        ZipEntry zipEntry = new ZipEntry(file.getName());
                        zos.putNextEntry(zipEntry);
                        java.nio.file.Files.copy(file.toPath(), zos);
                        zos.closeEntry();
                    }
                }
            }
        }
        return zipFile;
    }
}