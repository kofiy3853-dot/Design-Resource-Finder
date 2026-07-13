const PDFDocument = require('pdfkit');
const path = require('path');

exports.generateAnalysisReport = async (analysis) => {
  return new Promise((resolve, reject) => {
    try {
      const buffers = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryBlue = '#0066FF';
      const darkBg = '#1a1a1a';
      const textColor = '#333333';

      doc.rect(0, 0, doc.page.width, 120).fill(darkBg);
      doc
        .fillColor('#FFFFFF')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Design Resource Finder', 40, 30);
      doc
        .fillColor('#b3c5ff')
        .fontSize(12)
        .font('Helvetica')
        .text('AI-Powered Design Analysis Report', 40, 60);
      doc
        .fillColor('#999')
        .fontSize(9)
        .text(`Generated: ${new Date().toLocaleDateString()}`, 40, 80);

      doc
        .fillColor(textColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(analysis.title || 'Design Analysis', 40, 150);

      doc.moveTo(40, 175).lineTo(550, 175).strokeColor('#ddd').stroke();

      let y = 200;
      const margin = 40;
      const pageWidth = 525;
      const col1 = margin;
      const col2 = margin + 200;

      function section(title, x, yPos) {
        doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text(title, x, yPos);
        return yPos + 18;
      }

      function field(label, value, x, yPos) {
        doc.fillColor('#666').fontSize(9).font('Helvetica').text(label, x, yPos);
        doc
          .fillColor(textColor)
          .fontSize(10)
          .font('Helvetica')
          .text(String(value || 'N/A'), x, yPos + 11);
        return yPos + 28;
      }

      if (analysis.fonts && analysis.fonts.length > 0) {
        y = section('Detected Fonts', col1, y);
        analysis.fonts.slice(0, 4).forEach((f) => {
          y = field(
            'Font',
            `${f.name || 'Unknown'} (${f.family || ''} ${f.weight || ''})`,
            col1,
            y
          );
        });
        y = Math.max(y, 200);
      }

      doc
        .fillColor(primaryBlue)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Design Style', col2, 200);
      let styleY = 218;
      if (analysis.design_style) {
        Object.entries(analysis.design_style).forEach(([style, score]) => {
          doc.fillColor('#666').fontSize(9).font('Helvetica').text(style, col2, styleY);
          doc
            .fillColor(textColor)
            .fontSize(10)
            .text(`${score}%`, col2 + 120, styleY);
          styleY += 18;
        });
      }

      if (analysis.ai_explanation) {
        if (y < styleY) y = styleY;
        y += 20;
        if (y > 650) {
          doc.addPage();
          y = 50;
        }
        y = section('AI Analysis', col1, y);
        doc
          .fillColor(textColor)
          .fontSize(9)
          .font('Helvetica')
          .text(analysis.ai_explanation, col1, y, {
            width: pageWidth - margin,
            align: 'left',
            lineGap: 4,
          });
      }

      if (analysis.confidence_score) {
        y = Math.max(y + 100, 550);
        doc.rect(margin, y, pageWidth - margin, 30).fill('#f0f4ff');
        doc
          .fillColor(primaryBlue)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(`AI Confidence Score: ${analysis.confidence_score}%`, margin + 10, y + 8);
      }

      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(darkBg);
      doc
        .fillColor('#999')
        .fontSize(8)
        .font('Helvetica')
        .text('Design Resource Finder - AI-Powered Design Analysis', 40, doc.page.height - 28);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
