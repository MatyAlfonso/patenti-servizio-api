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
    'I_10': { t: 20, l: 132 },
    'I_11': { t: 20, l: 185 },
};

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

    const frontBackground = imgToBase64(path.join(__dirname, '../assets/templates/Fronte_finale.jpg'));
    const backBackground = imgToBase64(path.join(__dirname, '../assets/templates/Retro_finale.jpg'));

    const holderPhoto = imgToBase64(request.fototessera?.path);
    const holderSignature = imgToBase64(request.firma_scansionata?.path);

    const civilLicense = request.persona.patente_civile[0];

    const docDefinition = {
        pageSize: { width: 242.6, height: 153 },
        pageMargins: [0, 0, 0, 0],
        content: [
            { image: frontBackground, width: 242.6, absolutePosition: { x: 0, y: 0 } },

            { text: request.persona.cognome.toUpperCase(), absolutePosition: { x: frontBoxes['1'].l, y: frontBoxes['1'].t }, fontSize: 9 },

            { text: request.persona.nome.toUpperCase(), absolutePosition: { x: frontBoxes['2'].l, y: frontBoxes['2'].t }, fontSize: 9 },

            { text: `${new Date(request.persona.data_nascita).toLocaleDateString('it-IT')} ${request.persona.luogo_nascita.toUpperCase()}`, absolutePosition: { x: frontBoxes['3'].l, y: frontBoxes['3'].t }, fontSize: 9 },

            { text: new Date(request.data_rilascio).toLocaleDateString('it-IT'), absolutePosition: { x: frontBoxes['4a'].l, y: frontBoxes['4a'].t }, fontSize: 9 },

            { text: new Date(civilLicense.data_scadenza).toLocaleDateString('it-IT'), absolutePosition: { x: frontBoxes['4b'].l, y: frontBoxes['4b'].t }, fontSize: 9 },

            { text: civilLicense?.autorita?.toUpperCase(), absolutePosition: { x: frontBoxes['4c'].l, y: frontBoxes['4c'].t }, fontSize: 9 },

            { text: civilLicense?.numero || '', absolutePosition: { x: frontBoxes['5a'].l, y: frontBoxes['5a'].t }, fontSize: 9 },

            { text: request.numero, absolutePosition: { x: frontBoxes['5b'].l, y: frontBoxes['5b'].t }, fontSize: 9 },

            { text: request.id_categoria || '', absolutePosition: { x: frontBoxes['9'].l, y: frontBoxes['9'].t }, fontSize: 9 },

            holderPhoto ? {
                image: holderPhoto,
                width: frontBoxes.photo.w,
                height: frontBoxes.photo.h,
                absolutePosition: { x: frontBoxes.photo.l, y: frontBoxes.photo.t }
            } : {},

            holderSignature ? {
                image: holderSignature,
                width: 40,
                absolutePosition: { x: frontBoxes['7'].l, y: frontBoxes['7'].t }
            } : {},

            { image: backBackground, width: 242.6, absolutePosition: { x: 0, y: 0 }, pageBreak: 'before' },

            { text: new Date(request.data_rilascio).toLocaleDateString('it-IT'), absolutePosition: { x: backBoxes['I_10'].l, y: backBoxes['I_10'].t }, fontSize: 9 },

            { text: new Date(civilLicense.data_scadenza).toLocaleDateString('it-IT'), absolutePosition: { x: backBoxes['I_11'].l, y: backBoxes['I_11'].t }, fontSize: 9 }
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