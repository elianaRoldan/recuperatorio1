/**
 * ============================================================================
 * Fruit Valley Patagonia — Google Apps Script REST API Backend
 * Base de Datos: Google Sheets (Mismo Documento con 6 Hojas)
 * ============================================================================
 * 
 * Hojas incluidas en el documento:
 * 1. Productos: Catálogo con columnas [Producto, Precio, Descripción, Imagen, Stock, Oferta]
 * 2. Usuarios: Registro de clientes y comercios
 * 3. Consultas: Mensajes recibidos desde el formulario de contacto
 * 4. Categorias: Clasificación de productos
 * 5. Configuracion: Parámetros del sitio y WhatsApp
 * 6. Administradores: Usuarios autorizados y niveles de acceso
 * 
 * INSTRUCCIONES RÁPIDAS:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a: Extensiones > Apps Script.
 * 3. Pega este código completo.
 * 4. Ejecuta una vez la función "inicializarBaseDeDatos" desde el editor,
 *    o usa el menú "🌱 Fruit Valley" que aparecerá en tu hoja de cálculo.
 * 5. Implementar > Nueva implementación > Tipo: Aplicación web > Acceso: Cualquier usuario.
 * 6. Copia la URL terminada en /exec y pégala en el panel de control de tu web.
 */

// Nombres de las hojas
const SHEET_NAMES = {
  PRODUCTS: 'Productos',
  USERS: 'Usuarios',
  INQUIRIES: 'Consultas',
  CATEGORIES: 'Categorias',
  CONFIG: 'Configuracion',
  ADMINS: 'Administradores'
};

/**
 * Agrega un menú personalizado en la barra superior de Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌱 Fruit Valley')
    .addItem('🚀 Inicializar Base de Datos (Crear todas las hojas)', 'inicializarBaseDeDatos')
    .addItem('📦 Re-cargar Productos Originales', 'cargarProductosOficiales')
    .addToUi();
}

/**
 * Inicializa automáticamente todas las 6 hojas en el mismo documento
 */
function inicializarBaseDeDatos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Hoja: Productos (con las columnas exactas solicitadas)
  let sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  if (!sheetProd) {
    sheetProd = ss.insertSheet(SHEET_NAMES.PRODUCTS);
  }
  if (sheetProd.getLastRow() === 0) {
    cargarProductosOficiales(sheetProd);
  }

  // 2. Hoja: Usuarios
  let sheetUsers = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_NAMES.USERS);
    const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'TipoNegocio', 'FechaRegistro', 'Estado'];
    sheetUsers.appendRow(headers);
    sheetUsers.appendRow(['USR-101', 'Carolina Gómez', 'carolina@ejemplo.com', '+54 9 11 44556677', 'Consumidor Final', new Date().toISOString(), 'Activo']);
    sheetUsers.appendRow(['USR-102', 'Martín Rivas', 'mrivas@dieteticaspatagonia.com', '+54 9 299 443211', 'Dietética / Comercio Natural', new Date().toISOString(), 'Activo']);
    formatHeaderRow(sheetUsers, headers.length);
  }

  // 3. Hoja: Consultas
  let sheetInq = ss.getSheetByName(SHEET_NAMES.INQUIRIES);
  if (!sheetInq) {
    sheetInq = ss.insertSheet(SHEET_NAMES.INQUIRIES);
    const headers = ['ID', 'Fecha', 'Nombre', 'Email', 'Telefono', 'Tipo', 'Asunto', 'Mensaje', 'Estado'];
    sheetInq.appendRow(headers);
    sheetInq.appendRow(['INQ-201', new Date().toISOString(), 'Martín Rivas', 'mrivas@dieteticaspatagonia.com', '+54 9 299 443211', 'mayorista', 'Cotización Harina Durazno x 25kg', 'Deseamos lista de precios por bulto cerrado para dietéticas.', 'Pendiente']);
    sheetInq.appendRow(['INQ-202', new Date().toISOString(), 'Lucía Fernández', 'lucia.f@gmail.com', '+54 9 11 55667788', 'minorista', 'Consulta sobre certificación sin TACC', '¿Los productos son aptos para celíacos?', 'Respondida']);
    formatHeaderRow(sheetInq, headers.length);
  }

  // 4. Hoja: Categorías
  let sheetCat = ss.getSheetByName(SHEET_NAMES.CATEGORIES);
  if (!sheetCat) {
    sheetCat = ss.insertSheet(SHEET_NAMES.CATEGORIES);
    const headers = ['ID', 'Nombre', 'Slug', 'Descripcion', 'Orden', 'Activo'];
    sheetCat.appendRow(headers);
    sheetCat.appendRow(['CAT-01', 'Harinas de Fruta', 'harinas', 'Harinas 100% de fruta molidas a baja temperatura sin gluten', 1, 'SI']);
    sheetCat.appendRow(['CAT-02', 'Chips & Deshidratados', 'chips-deshidratadas', 'Rodajas finas crocantes sin azúcares añadidos', 2, 'SI']);
    sheetCat.appendRow(['CAT-03', 'Granolas & Barritas', 'granolas-barritas', 'Mezclas energéticas con cereales integrales y fruta', 3, 'SI']);
    sheetCat.appendRow(['CAT-04', 'Polvos & Mermeladas', 'polvos-mermeladas', 'Fruta molida soluble y mermeladas con trozos visibles', 4, 'SI']);
    sheetCat.appendRow(['CAT-05', 'Packs Especiales', 'packs', 'Combos de degustación y ahorro', 5, 'SI']);
    formatHeaderRow(sheetCat, headers.length);
  }

  // 5. Hoja: Configuración
  let sheetConf = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!sheetConf) {
    sheetConf = ss.insertSheet(SHEET_NAMES.CONFIG);
    const headers = ['Clave', 'Valor', 'Descripcion', 'UltimaActualizacion'];
    sheetConf.appendRow(headers);
    sheetConf.appendRow(['storeName', 'Fruit Valley Patagonia', 'Nombre comercial de la tienda', new Date().toISOString()]);
    sheetConf.appendRow(['whatsappNumber', '+5492984926445', 'Número oficial para checkout de pedidos', new Date().toISOString()]);
    sheetConf.appendRow(['contactEmail', 'elianaenoriega@gmail.com', 'Correo oficial de atención y recepción de consultas', new Date().toISOString()]);
    sheetConf.appendRow(['freeShippingMin', '18000', 'Monto mínimo para envío gratis en ARS', new Date().toISOString()]);
    sheetConf.appendRow(['activePromoCode', 'PATAGONIA10', 'Cupón vigente con 10% de descuento', new Date().toISOString()]);
    formatHeaderRow(sheetConf, headers.length);
  }

  // 6. Hoja: Administradores
  let sheetAdm = ss.getSheetByName(SHEET_NAMES.ADMINS);
  if (!sheetAdm) {
    sheetAdm = ss.insertSheet(SHEET_NAMES.ADMINS);
    const headers = ['ID', 'Nombre', 'Email', 'Rol', 'NivelAcceso', 'UltimoIngreso'];
    sheetAdm.appendRow(headers);
    sheetAdm.appendRow(['ADM-01', 'Administrador General', 'admin@fruitvalley.com', 'SuperAdmin', 'Total (CRUD + Consultas + Config)', new Date().toISOString()]);
    sheetAdm.appendRow(['ADM-02', 'Gerencia de Producción', 'produccion@fruitvalley.com', 'Editor', 'Stock y Catálogo', new Date().toISOString()]);
    formatHeaderRow(sheetAdm, headers.length);
  }

  // Eliminar la "Hoja 1" vacía si existe
  const defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

/**
 * Carga los productos oficiales provistos por el usuario en la hoja 'Productos'
 */
function cargarProductosOficiales(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAMES.PRODUCTS);
  }

  sheet.clear();

  const headers = ['Producto', 'Precio', 'Descripción', 'Imagen', 'Stock', 'Oferta'];
  sheet.appendRow(headers);

  const rows = [
    ['Harina de manzana', 11500, '500g. Harina fina de sabor suave y dulzor natural. Sirve para panificados, galletitas y mezclas sin gluten.', 'Empaque rústico de harina de manzana Patagonia.png', 1, ''],
    ['Harina de pera:', 12000, '500g. De sabor delicado y color claro. Va bien en pastelería, papillas y preparaciones infantiles.', 'Mockup de Harina de Pera Patagónica.png', 1, ''],
    ['Harina de durazno', 12000, '500g. Aromática y de sabor intenso. Se usa en repostería, batidos y granolas.', 'Empaque de Harina de Durazno Patagónica.png', 1, ''],
    ['Mix de harinas de frutas:', 12500, '500g. Combinación de las tres frutas, lista para preparar panqueques, muffins y budines.', 'MixdeHarina.jpg', 1, ''],
    ['Chips de manzana', 8500, '150g. Rodajas finas y crocantes, sin azúcar añadida. Son el snack más fácil de consumir en el día a día.', 'Chipsdemanzana.jpg', 1, ''],
    ['Rodajas de pera deshidratada', 8800, '150g. Textura tierna y sabor dulce natural, en porciones individuales.', 'Chipsdepera.jpg', 1, ''],
    ['Granolas de Fruta deshidratada', 9500, '150g. Blandos y de sabor intenso, ideales para llevar.', 'Granolas.jpg', 1, ''],
    ['Mix de frutas deshidratadas:', 9200, '400g. Mezcla natural de cereales, semillas, frutos secos y frutas deshidratadas.', 'Chipsmixtos.jpg', 1, ''],
    ['Barritas de frutas:', 9200, '30g paxk x 6. Barras prensadas con fruta deshidratada y semillas o frutos secos.', 'Barritas.jpg', 1, ''],
    ['Polvo de fruta para batidos:', 6500, '150g. Fruta molida para sumar a yogures, licuados y bebidas.', 'PolvodeFrutaparabatidos.jpg', 1, ''],
    ['Mermelada o pasta de fruta (fase futura):', 6500, '500g. Variedad de sabores, ideales para compañar los desayunos o meriendas.', 'Mermelada.jpg', 1, '']
  ];

  rows.forEach(r => sheet.appendRow(r));
  formatHeaderRow(sheet, headers.length);
}

function formatHeaderRow(sheet, numCols) {
  const range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground('#1C3A27')
       .setFontColor('#FFFFFF')
       .setFontWeight('bold')
       .setFontFamily('Arial');
  sheet.setFrozenRows(1);
  for (let c = 1; c <= numCols; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * ============================================================================
 * ENDPOINTS REST (doGet y doPost)
 * ============================================================================
 */

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getProducts';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Asegurar que las hojas existen
    inicializarBaseDeDatos();

    let result = {};

    switch (action) {
      case 'ping':
        result = {
          status: 'success',
          message: 'Fruit Valley API activa y conectada a Google Sheets.',
          documentName: ss.getName(),
          sheets: ss.getSheets().map(s => s.getName()),
          timestamp: new Date().toISOString()
        };
        break;

      case 'setupSheets':
        inicializarBaseDeDatos();
        result = {
          status: 'success',
          message: 'Todas las 6 hojas han sido creadas y verificadas en el documento.',
          sheets: ss.getSheets().map(s => s.getName())
        };
        break;

      case 'getProducts':
        const sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
        const rawProducts = readAllRows(sheetProd);

        // Mapear según las columnas de la hoja del usuario (Producto, Precio, Descripción, Imagen, Stock, Oferta)
        const products = rawProducts.map((p, idx) => {
          const rawName = String(p.Producto || p.Nombre || '').replace(/:$/, '').trim();
          const rawPrice = Number(p.Precio) || 0;
          const rawDesc = String(p.Descripción || p.Descripcion || '');
          const rawImg = String(p.Imagen || '');
          const rawStock = Number(p.Stock) || 1;
          const rawOffer = String(p.Oferta || p.Badge || '');

          // Extraer gramaje / peso de la descripción si comienza con "500g.", "150g.", etc.
          let netWeight = 'Unidad';
          const matchWeight = rawDesc.match(/^(\d+\s*[gkgGKG]+(\s*pax?k?\s*x\s*\d+)?)\.?/);
          if (matchWeight) {
            netWeight = matchWeight[1].trim();
          }

          // Deducir categoría según nombre
          let category = 'harinas';
          let categoryName = 'Harinas de Fruta';
          const lower = rawName.toLowerCase();
          if (lower.includes('chip') || lower.includes('rodaja')) {
            category = 'chips-deshidratadas';
            categoryName = 'Chips & Deshidratados';
          } else if (lower.includes('granola') || lower.includes('barrita')) {
            category = 'granolas-barritas';
            categoryName = 'Granolas & Barritas';
          } else if (lower.includes('polvo') || lower.includes('mermelada')) {
            category = 'polvos-mermeladas';
            categoryName = 'Polvos & Mermeladas';
          } else if (lower.includes('mix de fruta') && !lower.includes('harina')) {
            category = 'chips-deshidratadas';
            categoryName = 'Chips & Deshidratados';
          }

          return {
            id: 'prod-' + (idx + 1),
            name: rawName,
            price: rawPrice,
            description: rawDesc,
            image: rawImg,
            stock: rawStock,
            unit: netWeight,
            netWeight: netWeight,
            category: category,
            categoryName: categoryName,
            badge: rawOffer || (lower.includes('durazno') ? 'Sin Gluten' : (lower.includes('barrita') ? 'Más Vendido' : '')),
            featured: idx < 6
          };
        });

        result = { status: 'success', count: products.length, data: products };
        break;

      case 'getInquiries':
        const sheetInq = ss.getSheetByName(SHEET_NAMES.INQUIRIES);
        result = { status: 'success', data: readAllRows(sheetInq) };
        break;

      case 'getCategories':
        const sheetCat = ss.getSheetByName(SHEET_NAMES.CATEGORIES);
        result = { status: 'success', data: readAllRows(sheetCat) };
        break;

      default:
        result = { status: 'error', message: 'Accion no reconocida: ' + action };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (err) { payload = e.parameter || {}; }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    inicializarBaseDeDatos();

    let result = {};

    switch (action) {
      case 'saveInquiry':
        const inqData = payload.data || {};
        const inqSheet = ss.getSheetByName(SHEET_NAMES.INQUIRIES);
        const inqId = 'INQ-' + Date.now();
        
        inqSheet.appendRow([
          inqId,
          inqData.date || new Date().toISOString(),
          inqData.name || '',
          inqData.email || '',
          inqData.phone || '',
          inqData.type || 'minorista',
          inqData.subject || '',
          inqData.message || '',
          'Pendiente'
        ]);

        // Enviar notificación instantánea por correo electrónico a Eliana
        try {
          MailApp.sendEmail({
            to: 'elianaenoriega@gmail.com',
            subject: `🌱 [Fruit Valley] Nueva consulta: ${inqData.subject || 'Sin asunto'} (${inqData.name || 'Cliente'})`,
            body: `Hola Eliana,\n\nHas recibido una nueva consulta a través del sitio web de Fruit Valley Patagonia:\n\n` +
                  `• Remitente: ${inqData.name || 'No especificado'}\n` +
                  `• Email de contacto: ${inqData.email || 'No especificado'}\n` +
                  `• Teléfono/WhatsApp: ${inqData.phone || 'No especificado'}\n` +
                  `• Tipo de cliente: ${inqData.type || 'minorista'}\n` +
                  `• Asunto: ${inqData.subject || 'Sin asunto'}\n\n` +
                  `Mensaje:\n"${inqData.message || ''}"\n\n` +
                  `• Fecha: ${new Date().toLocaleString('es-AR')}\n` +
                  `• ID Registro: ${inqId}\n\n` +
                  `La consulta ya quedó asentada en la hoja "Consultas" de tu Google Sheets.`
          });
        } catch (mailError) {
          Logger.log('Aviso: no se pudo despachar el correo automático: ' + mailError.toString());
        }

        result = { status: 'success', message: 'Consulta guardada en Google Sheets y notificada por email', id: inqId };
        break;

      case 'saveProduct':
        const p = payload.data || {};
        const pSheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
        pSheet.appendRow([
          p.name || '',
          p.price || 0,
          p.description || '',
          p.image || '',
          p.stock || 1,
          p.badge || ''
        ]);
        result = { status: 'success', message: 'Producto agregado a la hoja Productos' };
        break;

      default:
        result = { status: 'error', message: 'Acción POST no reconocida: ' + action };
        break;
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function readAllRows(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}
