/**
 * ============================================================================
 * Fruit Valley Patagonia — Google Apps Script REST API Backend
 * Base de Datos Simplificada: Google Sheets (Documento con 3 Hojas)
 * 1. Productos
 * 2. Consultas
 * 3. Usuarios
 * ============================================================================
 * 
 * INSTRUCCIONES RÁPIDAS:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a: Extensiones > Apps Script.
 * 3. Reemplaza el código por este contenido completo.
 * 4. Ejecuta "inicializarBaseDeDatos" desde el editor, o usa el menú "🌱 Fruit Valley".
 * 5. Implementar > Nueva implementación > Tipo: Aplicación web > Acceso: Cualquier usuario.
 * 6. Copia la URL terminada en /exec y pégala en el panel de control de tu web.
 */

// Nombres oficiales de las 3 hojas
const SHEET_NAMES = {
  PRODUCTS: 'Productos',
  INQUIRIES: 'Consultas',
  USERS: 'Usuarios'
};

/**
 * Agrega un menú personalizado en la barra superior de Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌱 Fruit Valley')
    .addItem('🚀 Inicializar Base de Datos (Crear las 3 hojas)', 'inicializarBaseDeDatos')
    .addItem('📦 Re-cargar Productos Originales', 'cargarProductosOficiales')
    .addToUi();
}

/**
 * Inicializa automáticamente las 3 hojas en el mismo documento
 */
function inicializarBaseDeDatos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Hoja: Productos
  let sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  if (!sheetProd) {
    sheetProd = ss.insertSheet(SHEET_NAMES.PRODUCTS);
  }
  if (sheetProd.getLastRow() === 0) {
    cargarProductosOficiales(sheetProd);
  }

  // 2. Hoja: Consultas
  let sheetInq = ss.getSheetByName(SHEET_NAMES.INQUIRIES);
  if (!sheetInq) {
    sheetInq = ss.insertSheet(SHEET_NAMES.INQUIRIES);
    const headers = ['ID', 'Fecha', 'Nombre', 'Email', 'Telefono', 'Tipo', 'Asunto', 'Mensaje', 'Estado'];
    sheetInq.appendRow(headers);
    sheetInq.appendRow(['INQ-201', new Date().toISOString(), 'Martín Rivas', 'mrivas@dieteticaspatagonia.com', '+54 9 299 443211', 'mayorista', 'Cotización Harina Durazno x 25kg', 'Deseamos lista de precios por bulto cerrado para dietéticas.', 'Pendiente']);
    sheetInq.appendRow(['INQ-202', new Date().toISOString(), 'Lucía Fernández', 'lucia.f@gmail.com', '+54 9 11 55667788', 'minorista', 'Consulta sobre certificación sin TACC', '¿Los productos son aptos para celíacos?', 'Respondida']);
    formatHeaderRow(sheetInq, headers.length);
  }

  // 3. Hoja: Usuarios
  let sheetUsers = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_NAMES.USERS);
    const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'TipoNegocio', 'FechaRegistro', 'Estado'];
    sheetUsers.appendRow(headers);
    sheetUsers.appendRow(['USR-101', 'Carolina Gómez', 'carolina@ejemplo.com', '+54 9 11 44556677', 'Consumidor Final', new Date().toISOString(), 'Activo']);
    sheetUsers.appendRow(['USR-102', 'Martín Rivas', 'mrivas@dieteticaspatagonia.com', '+54 9 299 443211', 'Dietética / Comercio Natural', new Date().toISOString(), 'Activo']);
    formatHeaderRow(sheetUsers, headers.length);
  }

  // Eliminar hojas obsoletas si existen (para mantener estrictamente 3 hojas)
  const obsoleteNames = ['Categorias', 'Configuracion', 'Administradores', 'Hoja 1', 'Sheet1'];
  obsoleteNames.forEach(name => {
    const s = ss.getSheetByName(name);
    if (s && ss.getSheets().length > 3) {
      try { ss.deleteSheet(s); } catch (e) {}
    }
  });
}

/**
 * Carga los productos oficiales en la hoja 'Productos'
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
    ['Barritas de frutas:', 9200, '30g pack x 6. Barras prensadas con fruta deshidratada y semillas o frutos secos.', 'Barritas.jpg', 1, ''],
    ['Polvo de fruta para batidos:', 6500, '150g. Fruta molida para sumar a yogures, licuados y bebidas.', 'PolvodeFrutaparabatidos.jpg', 1, ''],
    ['Mermelada o pasta de fruta (fase futura):', 6500, '500g. Variedad de sabores, ideales para acompañar los desayunos o meriendas.', 'Mermelada.jpg', 1, '']
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

    // Asegurar que las 3 hojas existen
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
          message: 'Las 3 hojas oficiales (Productos, Consultas, Usuarios) han sido configuradas.',
          sheets: ss.getSheets().map(s => s.getName())
        };
        break;

      case 'getProducts':
        const sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
        const rawProducts = readAllRows(sheetProd);

        const products = rawProducts.map((p, idx) => {
          const rawName = String(p.Producto || p.Nombre || '').replace(/:$/, '').trim();
          const rawPrice = Number(p.Precio) || 0;
          const rawDesc = String(p.Descripción || p.Descripcion || '');
          const rawImg = String(p.Imagen || '');
          const rawStock = Number(p.Stock) || 1;
          const rawOffer = String(p.Oferta || p.Badge || '');

          let netWeight = 'Unidad';
          const matchWeight = rawDesc.match(/^(\d+\s*[gkgGKG]+(\s*pack?\s*x\s*\d+)?)\.?/i);
          if (matchWeight) {
            netWeight = matchWeight[1].trim();
          }

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
            category: category,
            categoryName: categoryName,
            price: rawPrice,
            unit: netWeight,
            netWeight: netWeight,
            image: rawImg,
            description: rawDesc,
            badge: rawOffer || (idx === 0 ? '100% Pura' : ''),
            stock: rawStock,
            featured: idx < 6
          };
        });

        const categoryFilter = e && e.parameter ? e.parameter.category : null;
        const searchFilter = e && e.parameter ? e.parameter.search : null;

        let filtered = products;
        if (categoryFilter && categoryFilter !== 'all') {
          filtered = filtered.filter(p => p.category === categoryFilter);
        }
        if (searchFilter) {
          const s = searchFilter.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
        }

        result = { status: 'success', data: filtered, count: filtered.length };
        break;

      case 'getInquiries':
        const sheetInq = ss.getSheetByName(SHEET_NAMES.INQUIRIES);
        const inquiries = readAllRows(sheetInq);
        result = { status: 'success', data: inquiries, count: inquiries.length };
        break;

      case 'getUsers':
        const sheetUsers = ss.getSheetByName(SHEET_NAMES.USERS);
        const users = readAllRows(sheetUsers);
        result = { status: 'success', data: users, count: users.length };
        break;

      default:
        result = { status: 'error', message: 'Acción GET no reconocida: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString(),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    inicializarBaseDeDatos();

    let result = {};

    switch (action) {
      case 'saveInquiry':
        const sheetInq = ss.getSheetByName(SHEET_NAMES.INQUIRIES);
        const inq = payload.data || {};
        const inqRow = [
          inq.id || ('INQ-' + Date.now()),
          inq.date || new Date().toISOString(),
          inq.name || '',
          inq.email || '',
          inq.phone || '',
          inq.type || 'consulta',
          inq.subject || '',
          inq.message || '',
          inq.status || 'Pendiente'
        ];
        sheetInq.appendRow(inqRow);
        result = { status: 'success', message: 'Consulta registrada correctamente.', id: inqRow[0] };
        break;

      case 'saveProduct':
        const sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
        const prod = payload.data || {};
        const prodRow = [
          prod.name || '',
          Number(prod.price) || 0,
          prod.description || '',
          prod.image || '',
          Number(prod.stock) || 1,
          prod.badge || ''
        ];
        sheetProd.appendRow(prodRow);
        result = { status: 'success', message: 'Producto guardado en Google Sheets.', product: prodRow[0] };
        break;

      case 'saveUser':
        const sheetUsers = ss.getSheetByName(SHEET_NAMES.USERS);
        const u = payload.data || {};
        const uRow = [
          u.id || ('USR-' + Date.now()),
          u.name || '',
          u.email || '',
          u.phone || '',
          u.businessType || 'Consumidor Final',
          new Date().toISOString(),
          'Activo'
        ];
        sheetUsers.appendRow(uRow);
        result = { status: 'success', message: 'Usuario registrado en Google Sheets.', id: uRow[0] };
        break;

      default:
        result = { status: 'error', message: 'Acción POST no reconocida: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function readAllRows(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h).trim());
  const rows = [];

  for (let r = 1; r < values.length; r++) {
    const rowObj = {};
    let hasData = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      const val = values[r][c];
      if (val !== '' && val !== null && val !== undefined) hasData = true;
      rowObj[key] = val;
    }
    if (hasData) {
      rows.push(rowObj);
    }
  }

  return rows;
}
