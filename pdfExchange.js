const express = require('express');
const multer = require('multer');
const fs = require('fs');
const PDFParser = require('pdf2json');
const sbd = require('sbd');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('pdf'), function(req, res) {
    // Get the uploaded file
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const pdfParser = new PDFParser(this, 1);

    pdfParser.on("pdfParser_dataError", function(errData) {
        console.error(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", function(pdfData) {
        // Extracted text from PDF
        let extractedText = pdfParser.getRawTextContent();

        // Preprocess text: remove extra newline characters
        extractedText = extractedText.replace(/\n{2,}/g, '\n'); // Replace 2 or more consecutive newline characters with a single newline

        // Split text into sentences
        const sentences = sbd.sentences(extractedText);

        // Join sentences into a single string with each sentence on a new line
        const formattedText = sentences.join('\n');

        // Write formatted text to a file
        const filePath = `./uploads/${file.filename}.txt`;
        fs.writeFile(filePath, formattedText, function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing file.');
            }
            console.log("File written successfully.");
            res.download(filePath, function() {
                // Delete the uploaded file after downloading
                fs.unlinkSync(file.path);
                // Delete the generated text file after downloading
                fs.unlinkSync(filePath);
            });
        });
    });

    pdfParser.loadPDF(file.path);
});

// Start the server
const port = 3000;
app.listen(port, function() {
    console.log(`Server is listening on port ${port}`);
});
