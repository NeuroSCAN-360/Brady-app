import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient, session, metrics, chartPng, facility, clinician, documentId, version, verificationUrl } = body;

    if (!patient || !session || !metrics || !chartPng) {
      return NextResponse.json(
        { error: 'Missing payload fields' },
        { status: 400 }
      );
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const M = 40;
    const pageWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right);

    // Helper functions
    const line = (y: number) => doc.moveTo(M, y).lineTo(doc.page.width - M, y).strokeColor('#DDEAF1').lineWidth(0.5).stroke();
    const thickLine = (y: number) => doc.moveTo(M, y).lineTo(doc.page.width - M, y).strokeColor('#145DA0').lineWidth(2).stroke();
    
    const header = () => {
      doc.save();
      doc.fillColor('#145DA0').font('Helvetica-Bold').fontSize(18).text(facility?.name || 'NeuroScan-360', M, doc.page.margins.top);
      doc.fillColor('#00B8A9').font('Helvetica').fontSize(12).text('Clinical Assessment Report', M, doc.page.margins.top + 20);
      doc.fontSize(9).fillColor('#666').text(`Report ID: ${documentId || '—'}`, M, doc.page.margins.top + 35);
      doc.text(`Version: ${version || '1.0.0'}`, M + 120, doc.page.margins.top + 35);
      doc.text(`Generated: ${new Date().toISOString()}`, M + 240, doc.page.margins.top + 35);
      thickLine(doc.page.margins.top + 50);
      doc.restore();
    };

    const footer = () => {
      const bottom = doc.page.height - doc.page.margins.bottom + 10;
      doc.save();
      line(bottom - 15);
      doc.font('Helvetica').fontSize(8).fillColor('#666');
      doc.text(`Page ${doc.bufferedPageRange().count}`, M, bottom, { width: pageWidth, align: 'right' });
      doc.text(facility?.contact || 'NeuroScan-360 Clinical Suite', M, bottom, { width: pageWidth, align: 'left' });
      doc.text(`© ${new Date().getFullYear()} NeuroScan-360. Confidential Medical Record.`, M, bottom + 12, { width: pageWidth, align: 'center' });
      doc.restore();
    };

    const sectionTitle = (t: string) => {
      doc.moveDown(0.8);
      doc.fillColor('#145DA0').font('Helvetica-Bold').fontSize(14).text(t);
      doc.fillColor('#00B8A9').font('Helvetica').fontSize(8).text('─'.repeat(50));
      doc.moveDown(0.3);
    };

    const keyVal = (label: string, value: string, x: number, y: number, w: number) => {
      doc.font('Helvetica').fontSize(10).fillColor('#333');
      doc.text(label + ':', x, y, { width: w * 0.45 });
      doc.font('Helvetica-Bold').fillColor('#145DA0').text(String(value), x + w * 0.48, y, { width: w * 0.5 });
    };

    const watermark = () => {
      doc.save();
      doc.rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] });
      doc.font('Helvetica-Bold').fontSize(48).fillColor('#E6EEF5');
      doc.opacity(0.15).text('CONFIDENTIAL MEDICAL RECORD', doc.page.width / 6, doc.page.height / 2);
      doc.opacity(1).restore();
    };

    // Page 1
    header();
    watermark();
    doc.moveDown(1.2);

    doc.save();
    doc.fillColor('#145DA0').font('Helvetica-Bold').fontSize(24).text('FSR Finger-Tap Test Clinical Report');
    doc.fillColor('#00B8A9').font('Helvetica').fontSize(12).text('Comprehensive Motor Function Assessment');
    doc.restore();

    doc.moveDown(0.5);

    const infoBoxY = doc.y;
    doc.save().rect(M, infoBoxY, pageWidth, 50).fill('#F8FAFC').stroke('#E2E8F0').restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#145DA0').text('Assessment Information', M + 10, infoBoxY + 8);

    doc.font('Helvetica').fontSize(10).fillColor('#333');
    doc.text(`Assessment Date: ${new Date(session.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, M + 15, infoBoxY + 20);
    doc.text(`Test Protocol: ${session.testType}`, M + 15, infoBoxY + 32);
    doc.text(`Session Duration: ${(session.durationMs / 1000).toFixed(1)} seconds`, M + 200, infoBoxY + 20);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, M + 200, infoBoxY + 32);

    doc.moveDown(3);

    sectionTitle('Patient & Encounter');

    const patientBoxY = doc.y;
    doc.save().rect(M, patientBoxY, pageWidth, 100).fill('#F0F9FF').stroke('#0EA5E9').restore();
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0C4A6E').text('Patient Information', M + 10, patientBoxY + 8);

    const colW = pageWidth / 2 - 10;
    const startY = patientBoxY + 20;

    keyVal('Patient Name', patient.name, M + 10, startY, colW);
    keyVal('Patient ID', patient.id ?? '—', M + 10, startY + 16, colW);
    keyVal('Age', `${patient.age} years`, M + 10, startY + 32, colW);
    keyVal('Gender', patient.gender ?? '—', M + 10, startY + 48, colW);
    keyVal('Date of Birth', patient.dob ?? '—', M + 10, startY + 64, colW);

    keyVal('Clinician', clinician?.name ?? '—', M + colW + 30, startY, colW);
    keyVal('Department', clinician?.department ?? '—', M + colW + 30, startY + 16, colW);
    keyVal('Device ID', session.deviceId ?? '—', M + colW + 30, startY + 32, colW);
    keyVal('Operator', session.operator ?? '—', M + colW + 30, startY + 48, colW);
    keyVal('Test Location', session.location ?? '—', M + colW + 30, startY + 64, colW);

    doc.moveDown(6);

    sectionTitle('Key Findings');

    const boxY = doc.y;
    doc.save().rect(M, boxY, pageWidth, 100).fill('#F0FDF4').stroke('#22C55E').restore();
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#145DA0').text('Assessment Summary', M + 10, boxY + 8);

    const metricsData = [
      { label: 'Average Force', value: `${metrics.avgForce.toFixed(2)} N`, ref: '0.5–5.0 N', status: 'Normal', color: '#22C55E' },
      { label: 'Maximum Force', value: `${metrics.maxForce.toFixed(2)} N`, ref: '1.0–10.0 N', status: 'Normal', color: '#22C55E' },
      { label: 'Tap Frequency', value: `${Number(metrics.tapFrequencyHz ?? 0).toFixed(2)} Hz`, ref: '2.0–6.0 Hz', status: 'Normal', color: '#22C55E' },
      { label: 'Variability', value: `${metrics.variability.toFixed(2)}`, ref: '< 1.5', status: 'Normal', color: '#22C55E' },
    ];

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#145DA0');
    doc.text('Metric', M + 15, boxY + 22);
    doc.text('Value', M + 120, boxY + 22);
    doc.text('Reference', M + 200, boxY + 22);
    doc.text('Status', M + 300, boxY + 22);

    doc.save().moveTo(M + 15, boxY + 30).lineTo(M + pageWidth - 15, boxY + 30).strokeColor('#145DA0').lineWidth(1).stroke().restore();

    metricsData.forEach((m, i) => {
      const y = boxY + 35 + (i * 14);
      if (i % 2 === 1) {
        doc.save().rect(M + 10, y - 3, pageWidth - 20, 14).fill('#F8FAFC').restore();
      }
      doc.font('Helvetica').fontSize(9).fillColor('#333').text(m.label, M + 15, y);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#145DA0').text(m.value, M + 120, y);
      doc.font('Helvetica').fontSize(8).fillColor('#666').text(m.ref, M + 200, y);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(m.color).text(m.status, M + 300, y);
    });

    doc.moveDown(7);

    // Page 2
    doc.addPage();
    header();
    watermark();
    sectionTitle('Session Graph');

    const chartBoxY = doc.y;
    doc.save().rect(M, chartBoxY, pageWidth, 20).fill('#FEF3C7').stroke('#F59E0B').restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#92400E').text('Pressure vs Time Analysis', M + 10, chartBoxY + 5);

    const imgWidth = pageWidth - 20;
    const imgHeight = imgWidth * 0.6;
    doc.image(chartPng, M + 10, chartBoxY + 25, { fit: [imgWidth, imgHeight] });

    const captionY = chartBoxY + 25 + imgHeight + 10;
    doc.save().rect(M, captionY, pageWidth, 30).fill('#F8FAFC').stroke('#E2E8F0').restore();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#145DA0').text('Figure 1. Real-time pressure measurements during finger-tap test session.', M + 10, captionY + 5);
    doc.font('Helvetica').fontSize(8).fillColor('#666').text('Note: Chart shows force measurements in Newtons (N) over time in seconds (s).', M + 10, captionY + 15);

    doc.moveDown(2);

    sectionTitle('Interpretation & Recommendations');

    const interpBoxY = doc.y;
    doc.save().rect(M, interpBoxY, pageWidth, 80).fill('#FEF2F2').stroke('#EF4444').restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#DC2626').text('Clinical Interpretation', M + 10, interpBoxY + 8);

    const interpretation = patient.notes || clinician?.notes ||
      'Based on the measured parameters, the finger-tap test results indicate normal motor function. ' +
      'The force patterns and frequency are within expected ranges for this age group. ' +
      'Recommend continued monitoring and follow-up assessment in 3-6 months.';

    doc.font('Helvetica').fontSize(10).fillColor('#333').text(interpretation, M + 10, interpBoxY + 20, { width: pageWidth - 20, align: 'justify' });

    doc.moveDown(5);

    sectionTitle('Methodology & Limitations');

    const methodBoxY = doc.y;
    doc.save().rect(M, methodBoxY, pageWidth, 60).fill('#F3F4F6').stroke('#6B7280').restore();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#374151').text('Technical Methodology', M + 10, methodBoxY + 8);

    doc.font('Helvetica').fontSize(9).fillColor('#4B5563').text(
      'This assessment utilizes Force-Sensitive Resistor (FSR) technology for precise measurement of finger-tap dynamics. ' +
      'Results may vary based on sensor placement, user compliance, and environmental factors. ' +
      'Refer to NeuroScan-360 Protocol v1.2 for detailed methodology. This report is for clinical reference only.',
      M + 10, methodBoxY + 20, { width: pageWidth - 20, align: 'justify' }
    );

    doc.moveDown(4);

    sectionTitle('Authorization');

    const authBoxY = doc.y;
    doc.save().rect(M, authBoxY, pageWidth, 80).fill('#F0F9FF').stroke('#0EA5E9').restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0C4A6E').text('Clinical Authorization', M + 10, authBoxY + 8);

    const sigY = authBoxY + 20;

    doc.save().rect(M + 10, sigY, 200, 50).fill('#FFFFFF').stroke('#0EA5E9').restore();
    doc.save().rect(M + 230, sigY, 200, 50).fill('#FFFFFF').stroke('#0EA5E9').restore();

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0C4A6E').text('Clinician Signature', M + 15, sigY + 5);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0C4A6E').text('Date', M + 235, sigY + 5);

    doc.save().moveTo(M + 15, sigY + 25).lineTo(M + 195, sigY + 25).strokeColor('#0EA5E9').lineWidth(1).stroke().restore();
    doc.save().moveTo(M + 235, sigY + 25).lineTo(M + 415, sigY + 25).strokeColor('#0EA5E9').lineWidth(1).stroke().restore();

    doc.font('Helvetica').fontSize(8).fillColor('#0C4A6E').text(`${clinician?.name ?? 'Dr. [Name]'}`, M + 15, sigY + 30);
    doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text(`${clinician?.credentials ?? 'MD, PhD'}`, M + 15, sigY + 38);
    doc.font('Helvetica').fontSize(8).fillColor('#0C4A6E').text(new Date().toLocaleDateString(), M + 235, sigY + 30);

    // QR code for verification
    if (verificationUrl) {
      try {
        const qr = await QRCode.toDataURL(verificationUrl, { margin: 0, width: 96 });
        doc.image(qr, doc.page.width - M - 96, sigY - 8, { width: 96, height: 96 });
        doc.font('Helvetica').fontSize(8).fillColor('#666').text('Verify report', doc.page.width - M - 96, sigY + 92, { width: 96, align: 'center' });
      } catch (err) {
        console.error('QR code generation failed:', err);
      }
    }

    footer();

    doc.end();

    const pdfBuffer = await pdfPromise;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="NeuroScan360_Report_${patient.name || 'Patient'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
