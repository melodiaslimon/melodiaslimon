const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuración
const CONFIG = {
  inputDir: './assets',           // Carpeta con imágenes originales
  outputDir: './assets-optimized', // Carpeta de salida
  sizes: [400, 800, 1200],        // Tamaños a generar
  quality: {
    webp: 80,
    jpeg: 85
  },
  formats: ['webp', 'jpeg']       // Formatos a generar
};

// Formatos de imagen soportados
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.webp'];

async function createDirectories() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    console.log(`✓ Directorio de salida creado: ${CONFIG.outputDir}`);
  } catch (error) {
    console.error('Error creando directorios:', error);
  }
}

async function getImageFiles(dir, basePath = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Recursivamente buscar en subdirectorios
      const subFiles = await getImageFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      files.push({
        fullPath: fullPath,
        relativePath: relativePath,
        fileName: entry.name,
        subDir: basePath
      });
    }
  }

  return files;
}

async function optimizeImage(imageInfo) {
  const { fullPath, relativePath, fileName, subDir } = imageInfo;
  const nameWithoutExt = path.parse(fileName).name;
  const optimizedImages = [];
  let processedCount = 0;
  let skippedCount = 0;

  console.log(`\nProcesando: ${relativePath}`);

  // Crear subdirectorio en output si es necesario
  const outputSubDir = path.join(CONFIG.outputDir, subDir);
  await fs.mkdir(outputSubDir, { recursive: true });

  for (const size of CONFIG.sizes) {
    for (const format of CONFIG.formats) {
      const outputFilename = `${nameWithoutExt}-${size}w.${format}`;
      const outputPath = path.join(outputSubDir, outputFilename);

      // Verificar si el archivo ya existe
      const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);
      if (outputExists) {
        console.log(`  ⊘ ${outputFilename} ya existe, saltando...`);
        skippedCount++;
        
        // Agregar a la lista aunque no se procesó (para los snippets HTML)
        optimizedImages.push({
          filename: outputFilename,
          size: size,
          format: format,
          subDir: subDir
        });
        
        continue; // Saltar al siguiente formato/tamaño
      }

      try {
        const image = sharp(fullPath);
        const metadata = await image.metadata();

        // Solo redimensionar si la imagen es más grande que el tamaño objetivo
        if (metadata.width > size) {
          image.resize(size, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
        }

        // Aplicar formato y calidad
        if (format === 'webp') {
          await image.webp({ quality: CONFIG.quality.webp }).toFile(outputPath);
        } else if (format === 'jpeg') {
          await image.jpeg({ quality: CONFIG.quality.jpeg, progressive: true }).toFile(outputPath);
        }

        const stats = await fs.stat(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`  ✓ ${outputFilename} (${sizeKB} KB)`);
        processedCount++;
        
        optimizedImages.push({
          filename: outputFilename,
          size: size,
          format: format,
          subDir: subDir
        });
      } catch (error) {
        console.error(`  ✗ Error con ${outputFilename}:`, error.message);
      }
    }
  }

  return { 
    original: relativePath, 
    optimized: optimizedImages, 
    subDir: subDir,
    processed: processedCount,
    skipped: skippedCount
  };
}

async function generateHTMLSnippets(results) {
  let html = '<!-- SNIPPETS HTML GENERADOS -->\n\n';

  results.forEach(result => {
    const nameWithoutExt = path.parse(result.original).name;
    const outputPath = result.subDir ? `images-optimized/${result.subDir}` : 'images-optimized';
    
    // Generar srcset para WebP
    const webpSrcset = result.optimized
      .filter(img => img.format === 'webp')
      .map(img => {
        const imgPath = img.subDir ? `${outputPath}/${img.filename}` : `images-optimized/${img.filename}`;
        return `${imgPath} ${img.size}w`;
      })
      .join(',\n          ');
    
    // Generar srcset para JPEG (fallback)
    const jpegSrcset = result.optimized
      .filter(img => img.format === 'jpeg')
      .map(img => {
        const imgPath = img.subDir ? `${outputPath}/${img.filename}` : `images-optimized/${img.filename}`;
        return `${imgPath} ${img.size}w`;
      })
      .join(',\n          ');

    const defaultSrc = result.subDir 
      ? `${outputPath}/${nameWithoutExt}-800w.jpeg`
      : `images-optimized/${nameWithoutExt}-800w.jpeg`;

    html += `<!-- ${result.original} -->\n`;
    html += `<picture>\n`;
    html += `  <source type="image/webp"\n          srcset="${webpSrcset}">\n`;
    html += `  <source type="image/jpeg"\n          srcset="${jpegSrcset}">\n`;
    html += `  <img src="${defaultSrc}"\n`;
    html += `       alt="Descripción de la imagen"\n`;
    html += `       loading="lazy"\n`;
    html += `       sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px">\n`;
    html += `</picture>\n\n`;
  });

  await fs.writeFile('html-snippets.txt', html);
  console.log('\n✓ Snippets HTML guardados en: html-snippets.txt');
}

async function main() {
  console.log('🖼️  Iniciando optimización de imágenes...\n');

  try {
    await createDirectories();
    
    const imageFiles = await getImageFiles(CONFIG.inputDir);
    
    if (imageFiles.length === 0) {
      console.log(`\n⚠️  No se encontraron imágenes en: ${CONFIG.inputDir}`);
      return;
    }

    console.log(`\nEncontradas ${imageFiles.length} imágenes para procesar`);

    const results = [];
    let totalProcessed = 0;
    let totalSkipped = 0;

    for (const imageInfo of imageFiles) {
      const result = await optimizeImage(imageInfo);
      results.push(result);
      totalProcessed += result.processed;
      totalSkipped += result.skipped;
    }

    await generateHTMLSnippets(results);

    console.log('\n✅ ¡Optimización completada!');
    console.log(`\nResumen:`);
    console.log(`- Imágenes originales: ${imageFiles.length}`);
    console.log(`- Variantes nuevas generadas: ${totalProcessed}`);
    console.log(`- Variantes ya existentes (saltadas): ${totalSkipped}`);
    console.log(`- Total de variantes: ${results.reduce((acc, r) => acc + r.optimized.length, 0)}`);
    console.log(`- Directorio de salida: ${CONFIG.outputDir}`);

  } catch (error) {
    console.error('\n❌ Error durante la optimización:', error);
  }
}

// Ejecutar
main();