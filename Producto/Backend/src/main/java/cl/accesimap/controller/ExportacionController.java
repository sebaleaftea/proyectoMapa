package cl.accesimap.controller;

import cl.accesimap.service.ExportacionService;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileInputStream;

import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportacionController {

    @Autowired
    private ExportacionService exportacionService;

    @GetMapping("/shapefile")
    @PreAuthorize("hasAnyRole('MUNICIPALIDAD', 'ADMINISTRADOR')")
    public ResponseEntity<InputStreamResource> exportarShapefile(@RequestParam Integer comunaId) {
        try {
            File zipFile = exportacionService.generarShapefile(comunaId);
            InputStreamResource resource = new InputStreamResource(new FileInputStream(zipFile));

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + zipFile.getName())
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .contentLength(zipFile.length())
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
