import ExcelJS from 'exceljs';

export const importExcelToModel = async (filePath, model, mapping, transformFn = null) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    const results = { success: 0, errors: [] };

    const headerRow = worksheet.getRow(1);
    const colMap = {};

    headerRow.eachCell((cell, colNumber) => {
        colMap[cell.value] = colNumber;
    });

    for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        if (!row.values.length || row.getCell(1).value === null) continue;

        try {
            const payload = {};

            for (const [excelHeader, modelAttribute] of Object.entries(mapping)) {
                const colIndex = colMap[excelHeader];
                if (colIndex) {
                    let value = row.getCell(colIndex).value;

                    if (value && typeof value === 'object' && value.result !== undefined) {
                        value = value.result;
                    }

                    if (transformFn && value !== null && value !== undefined) {
                        value = transformFn(value, modelAttribute);
                    }

                    payload[modelAttribute] = value;
                }
            }

            await model.upsert(payload);
            results.success++;
        } catch (error) {
            const detailedError = error.errors
                ? error.errors.map(e => `${e.path}: ${e.message} (Value: ${e.value})`).join(', ')
                : error.message;

            results.errors.push({ fila: i, error: detailedError });
        }
    }

    return results;
};