import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PdfPrinter from 'pdfmake';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fonts = {
    Roboto: {
        normal: path.resolve(__dirname, '../assets/fonts/Roboto-Regular.ttf'),
        bold: path.resolve(__dirname, '../assets/fonts/Roboto-Bold.ttf'),
    }
};

const printer = new PdfPrinter(fonts);

const frontBoxes = {
    '1': { t: 42, l: 77.5 },  // Cognome
    '2': { t: 56, l: 77.5 },  // Nome
    '3': { t: 70, l: 77.5 },  //  Data e luogo di nascita
    '4a': { t: 85, l: 77.5 },  // Data di rilascio
    '4b': { t: 100, l: 77.5 }, // Data di scadenza
    '4c': { t: 85, l: 170.0 }, // Autorità
    '5a': { t: 99, l: 170.0 }, // Numero patente civile
    '7': { t: 112, l: 82.5 },  // Firma
    '5b': { t: 128, l: 77.5 },  // Numero patente di servizio
    '9': { t: 128, l: 35 },  // Categoria
    'photo': { t: 45.0, l: 4.0, w: 55.0, h: 67.5 } // Foto
};

const backBoxes = {
    // Categoría I
    'I_10': { t: 20, l: 132 },
    'I_11': { t: 20, l: 185 },

    // Categoría I IV
    'I_IV_10': { t: 37, l: 132 },
    'I_IV_11': { t: 37, l: 185 },

    // Categoría II
    'II_10': { t: 54, l: 132 },
    'II_11': { t: 54, l: 185 },

    // Categoría II IV
    'II_IV_10': { t: 72, l: 132 },
    'II_IV_11': { t: 72, l: 185 },

    // Categoría III
    'III_10': { t: 89, l: 132 },
    'III_11': { t: 89, l: 185 },

    // Categoría III IV
    'III_IV_10': { t: 106, l: 132 },
    'III_IV_11': { t: 106, l: 185 },
};

const badgeWidth = 8.602 * 28.35;
const badgeHeight = 5.486 * 28.35;

const pos = (box, isY = false) => (isY ? box.t : box.l);

export const generateLicenseBuffer = async (request) => {

    const imgToBase64 = (filePath) => {
        if (!filePath) return null;
        const fullPath = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(process.cwd(), filePath);

        if (!fs.existsSync(fullPath)) {
            console.error("File not found:", fullPath);
            return null;
        }

        return `data:image/jpeg;base64,${fs.readFileSync(fullPath).toString('base64')}`;
    };

    const coords10 = backBoxes[`${request.id_categoria}_10`];
    const coords11 = backBoxes[`${request.id_categoria}_11`];

    const frontBackground = imgToBase64(path.join(__dirname, '../assets/templates/Fronte_finale.jpg'));
    const backBackground = imgToBase64(path.join(__dirname, '../assets/templates/Retro_finale.jpg'));

    const holderPhoto = imgToBase64(request.fototessera?.path);
    const holderSignature = imgToBase64(request.firma_scansionata?.path);

    const civilLicense = request.persona.patente_civile[0];

    const docDefinition = {
        pageSize: {
            width: badgeWidth,
            height: badgeHeight
        },
        pageMargins: 0,
        content: [
            // --- FRONTE ---
            {
                image: frontBackground,
                width: badgeWidth,
                height: badgeHeight,
                absolutePosition: { x: 0, y: 0 }
            },

            { text: request.persona.cognome.toUpperCase(), absolutePosition: { x: pos(frontBoxes['1']), y: pos(frontBoxes['1'], true) }, fontSize: 9 },

            { text: request.persona.nome.toUpperCase(), absolutePosition: { x: pos(frontBoxes['2']), y: pos(frontBoxes['2'], true) }, fontSize: 9 },

            { text: `${new Date(request.persona.data_nascita).toLocaleDateString('it-IT')} ${request.persona.luogo_nascita.toUpperCase()}`, absolutePosition: { x: pos(frontBoxes['3']), y: pos(frontBoxes['3'], true) }, fontSize: 9 },

            { text: new Date(request.data_rilascio).toLocaleDateString('it-IT'), absolutePosition: { x: pos(frontBoxes['4a']), y: pos(frontBoxes['4a'], true) }, fontSize: 9 },

            { text: new Date(civilLicense.data_scadenza).toLocaleDateString('it-IT'), absolutePosition: { x: pos(frontBoxes['4b']), y: pos(frontBoxes['4b'], true) }, fontSize: 9 },

            { text: civilLicense?.autorita?.toUpperCase(), absolutePosition: { x: pos(frontBoxes['4c']), y: pos(frontBoxes['4c'], true) }, fontSize: 9 },

            { text: civilLicense?.numero || '', absolutePosition: { x: pos(frontBoxes['5a']), y: pos(frontBoxes['5a'], true) }, fontSize: 9 },

            { text: request.numero, absolutePosition: { x: pos(frontBoxes['5b']), y: pos(frontBoxes['5b'], true) }, fontSize: 9 },

            { text: request.id_categoria || '', absolutePosition: { x: pos(frontBoxes['9']), y: pos(frontBoxes['9'], true) }, fontSize: 9 },

            holderPhoto ? {
                image: holderPhoto,
                width: frontBoxes.photo.w,
                height: frontBoxes.photo.h,
                absolutePosition: { x: pos(frontBoxes.photo), y: pos(frontBoxes.photo, true) }
            } : {},

            holderSignature ? {
                image: holderSignature,
                width: 40,
                absolutePosition: { x: pos(frontBoxes['7']), y: pos(frontBoxes['7'], true) }
            } : {},

            // --- RETRO ---
            {
                image: backBackground,
                width: badgeWidth,
                height: badgeHeight,
                absolutePosition: { x: 0, y: 0 },
                pageBreak: 'before'
            },

            { text: new Date(request.data_rilascio).toLocaleDateString('it-IT'), absolutePosition: { x: pos(coords10), y: pos(coords10, true) }, fontSize: 9 },

            { text: new Date(civilLicense.data_scadenza).toLocaleDateString('it-IT'), absolutePosition: { x: pos(coords11), y: pos(coords11, true) }, fontSize: 9 }
        ]
    };

    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            let chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();
        } catch (err) {
            reject(err);
        }
    });
};