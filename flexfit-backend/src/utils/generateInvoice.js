const PDFDocument = require('pdfkit');

// ─── Brand Palette ───────────────────────────────────────────────────────────
const BRAND    = '#db2777';   // FlexFit pink
const BRAND_DK = '#be185d';   // Darker pink for accents
const SLATE    = '#1e293b';   // Deep slate for headings
const BODY     = '#374151';   // Body text
const MUTED    = '#6b7280';   // Muted / labels
const LIGHT    = '#f8fafc';   // Light row bg
const RULE     = '#e2e8f0';   // Divider lines
const SUCCESS  = '#059669';   // Paid green
const WARN     = '#d97706';   // Unpaid amber
const PAGE_W   = 595.28;      // A4 width in pts
const MARGIN   = 50;
const COL_W    = PAGE_W - MARGIN * 2; // 495.28

/**
 * Draws a horizontal rule across the content width.
 */
function hRule(doc, y, color = RULE, width = 0.5) {
    doc.save()
        .moveTo(MARGIN, y)
        .lineTo(MARGIN + COL_W, y)
        .strokeColor(color)
        .lineWidth(width)
        .stroke()
        .restore();
}

/**
 * Draws a filled rectangle.
 */
function fillRect(doc, x, y, w, h, color) {
    doc.save().fillColor(color).rect(x, y, w, h).fill().restore();
}

/**
 * Returns a status badge color pair [bg, text].
 */
function statusColors(status) {
    const map = {
        Delivered:  ['#d1fae5', '#065f46'],
        Shipped:    ['#dbeafe', '#1e40af'],
        Processing: ['#fef3c7', '#92400e'],
        Pending:    ['#fee2e2', '#991b1b'],
        Cancelled:  ['#f3f4f6', '#374151'],
    };
    return map[status] || ['#f3f4f6', '#374151'];
}

// ─── Main Function ────────────────────────────────────────────────────────────
const generateInvoice = (order, res) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, compress: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=FlexFit_Invoice_${order.orderNumber}.pdf`
    );
    doc.pipe(res);

    // ── 1. HEADER BANNER ─────────────────────────────────────────────────────
    // Full-width brand gradient banner (simulated with two rects)
    fillRect(doc, 0, 0, PAGE_W, 110, BRAND);
    fillRect(doc, 0, 90, PAGE_W, 20, BRAND_DK);

    // Brand name
    doc.save()
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(32)
        .text('FlexFit', MARGIN, 22)
        .restore();

    // Tagline below brand
    doc.save()
        .fillColor('rgba(255,255,255,0.75)')
        .font('Helvetica')
        .fontSize(9)
        .text('AI-Powered Multi-Vendor Fashion Marketplace', MARGIN, 58)
        .restore();

    // Contact info on right side of banner
    doc.save()
        .fillColor('#ffffff')
        .font('Helvetica')
        .fontSize(8.5)
        .text('support@flexfit.lk', 0, 28, { align: 'right', width: PAGE_W - MARGIN })
        .text('www.flexfit.lk', 0, 42, { align: 'right', width: PAGE_W - MARGIN })
        .text('Colombo, Sri Lanka', 0, 56, { align: 'right', width: PAGE_W - MARGIN })
        .restore();

    // "INVOICE" label bottom-right of banner
    doc.save()
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(11)
        .opacity(0.85)
        .text('TAX INVOICE', 0, 94, { align: 'right', width: PAGE_W - MARGIN })
        .restore();

    // ── 2. INVOICE META STRIP (below banner) ─────────────────────────────────
    const metaY = 125;
    fillRect(doc, MARGIN, metaY, COL_W, 56, LIGHT);

    // Draw thin brand top-border on meta strip
    doc.save()
        .moveTo(MARGIN, metaY)
        .lineTo(MARGIN + COL_W, metaY)
        .strokeColor(BRAND)
        .lineWidth(2)
        .stroke()
        .restore();

    const col1 = MARGIN + 12;
    const col2 = MARGIN + 130;
    const col3 = MARGIN + 280;
    const col4 = MARGIN + 380;
    const metaLabelY = metaY + 10;
    const metaValY   = metaY + 22;

    // Labels
    doc.save().fillColor(MUTED).font('Helvetica-Bold').fontSize(7.5)
        .text('INVOICE NUMBER',  col1, metaLabelY)
        .text('ISSUE DATE',      col2, metaLabelY)
        .text('ORDER STATUS',    col3, metaLabelY)
        .text('PAYMENT',         col4, metaLabelY)
        .restore();

    // Values
    doc.save().fillColor(SLATE).font('Helvetica-Bold').fontSize(10)
        .text(order.orderNumber, col1, metaValY)
        .restore();

    doc.save().fillColor(BODY).font('Helvetica').fontSize(9.5)
        .text(new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }), col2, metaValY)
        .restore();

    // Status badge
    const [badgeBg, badgeFg] = statusColors(order.status);
    const statusTxt = order.status.toUpperCase();
    const badgeX = col3;
    const badgeY = metaValY - 2;
    fillRect(doc, badgeX, badgeY, 72, 16, badgeBg);
    doc.save().fillColor(badgeFg).font('Helvetica-Bold').fontSize(7.5)
        .text(statusTxt, badgeX, badgeY + 4, { width: 72, align: 'center' })
        .restore();

    // Paid / Unpaid badge
    const paidBg  = order.isPaid ? '#d1fae5' : '#fef3c7';
    const paidFg  = order.isPaid ? SUCCESS    : WARN;
    const paidTxt = order.isPaid ? 'PAID' : 'UNPAID';
    fillRect(doc, col4, badgeY, 55, 16, paidBg);
    doc.save().fillColor(paidFg).font('Helvetica-Bold').fontSize(7.5)
        .text(paidTxt, col4, badgeY + 4, { width: 55, align: 'center' })
        .restore();

    if (order.isPaid && order.paidAt) {
        doc.save().fillColor(MUTED).font('Helvetica').fontSize(7.5)
            .text(`Paid on ${new Date(order.paidAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            })}`, col4, metaValY + 18)
            .restore();
    }

    // Payment method (shown below the badge)
    doc.save().fillColor(BODY).font('Helvetica').fontSize(8.5)
        .text((order.paymentMethod || 'Card').toUpperCase(), col4, badgeY + 20)
        .restore();

    // ── 3. BILL TO / SHIP TO BLOCK ───────────────────────────────────────────
    const billY = metaY + 72;
    hRule(doc, billY - 2, RULE, 0.5);

    // "BILL TO" label
    doc.save().fillColor(BRAND).font('Helvetica-Bold').fontSize(8)
        .text('BILL TO', MARGIN, billY + 6)
        .restore();

    const addr = order.shippingAddress;
    const addressLines = [
        [addr.street, addr.street2].filter(Boolean).join(', '),
        [addr.city, addr.district || addr.state].filter(Boolean).join(', '),
        [addr.country, addr.postalCode].filter(Boolean).join(' '),
        addr.phone ? `Tel: ${addr.phone}` : null,
    ].filter(Boolean);

    doc.save()
        .fillColor(SLATE).font('Helvetica-Bold').fontSize(11)
        .text(order.user?.name || 'Customer', MARGIN, billY + 20)
        .restore();
    doc.save()
        .fillColor(MUTED).font('Helvetica').fontSize(9)
        .text(order.user?.email || '', MARGIN, billY + 35)
        .restore();

    let addrY = billY + 48;
    doc.save().fillColor(BODY).font('Helvetica').fontSize(9);
    addressLines.forEach(line => {
        doc.text(line, MARGIN, addrY);
        addrY += 13;
    });
    doc.restore();

    // ── 4. ITEMS TABLE ───────────────────────────────────────────────────────
    const tableY = Math.max(addrY + 18, billY + 130);

    // Table header background
    fillRect(doc, MARGIN, tableY, COL_W, 22, SLATE);

    // Column positions
    const C = {
        item:  MARGIN + 8,
        color: MARGIN + 220,
        size:  MARGIN + 275,
        qty:   MARGIN + 325,
        price: MARGIN + 370,
        total: MARGIN + 440,
    };

    doc.save().fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
        .text('ITEM / DESCRIPTION', C.item,  tableY + 7)
        .text('COLOR',              C.color,  tableY + 7)
        .text('SIZE',               C.size,   tableY + 7)
        .text('QTY',                C.qty,    tableY + 7)
        .text('UNIT PRICE',         C.price,  tableY + 7)
        .text('AMOUNT',             C.total,  tableY + 7)
        .restore();

    // Rows
    let rowY = tableY + 22;
    let rowIdx = 0;

    order.items.forEach((item) => {
        const rowH = 24;
        // Alternating row bg
        if (rowIdx % 2 === 0) {
            fillRect(doc, MARGIN, rowY, COL_W, rowH, LIGHT);
        }

        const itemTotal = (item.price || 0) * (item.quantity || 1);

        doc.save().fillColor(SLATE).font('Helvetica-Bold').fontSize(8.5)
            .text(item.name.substring(0, 30), C.item, rowY + 7, { width: 200, ellipsis: true })
            .restore();

        doc.save().fillColor(BODY).font('Helvetica').fontSize(8.5)
            .text(item.color || '—',        C.color,  rowY + 7)
            .text(item.size  || '—',        C.size,   rowY + 7)
            .text(String(item.quantity),    C.qty,    rowY + 7)
            .text(`LKR ${(item.price || 0).toLocaleString()}`, C.price, rowY + 7)
            .restore();

        doc.save().fillColor(SLATE).font('Helvetica-Bold').fontSize(8.5)
            .text(`LKR ${itemTotal.toLocaleString()}`, C.total, rowY + 7)
            .restore();

        // Row bottom rule
        doc.save()
            .moveTo(MARGIN, rowY + rowH)
            .lineTo(MARGIN + COL_W, rowY + rowH)
            .strokeColor(RULE).lineWidth(0.4).stroke()
            .restore();

        rowY += rowH;
        rowIdx++;
    });

    // ── 5. TOTALS BLOCK ──────────────────────────────────────────────────────
    rowY += 12;
    hRule(doc, rowY, BRAND, 1.5);
    rowY += 14;

    const totLabelX = MARGIN + 310;
    const totValX   = MARGIN + 430;
    const totW      = 65;

    const writeTotal = (label, value, bold = false, color = BODY, size = 9) => {
        doc.save()
            .fillColor(MUTED).font('Helvetica').fontSize(size)
            .text(label, totLabelX, rowY, { width: 115 })
            .restore();
        doc.save()
            .fillColor(color)
            .font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(size)
            .text(value, totValX, rowY, { width: totW, align: 'right' })
            .restore();
        rowY += size + 8;
    };

    writeTotal('Subtotal',        `LKR ${(order.itemsPrice || 0).toLocaleString()}`);
    writeTotal('Shipping',        `LKR ${(order.shippingPrice || 0).toLocaleString()}`);
    writeTotal('Tax (8%)',        `LKR ${(order.taxPrice || 0).toLocaleString()}`);

    if (order.discount && order.discount > 0) {
        writeTotal('Discount / Promo', `- LKR ${order.discount.toLocaleString()}`, false, SUCCESS);
    }

    rowY += 4;
    hRule(doc, rowY, SLATE, 0.75);
    rowY += 10;

    // Grand total highlight box — wide enough for large values
    const grandBoxX = totLabelX - 8;
    const grandBoxW = (MARGIN + COL_W) - grandBoxX;   // stretches to right margin
    fillRect(doc, grandBoxX, rowY - 4, grandBoxW, 28, BRAND);
    doc.save()
        .fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
        .text('TOTAL DUE', grandBoxX + 8, rowY + 5)
        .restore();
    doc.save()
        .fillColor('#ffffff').font('Helvetica-Bold').fontSize(12)
        .text(
            `LKR ${(order.totalPrice || 0).toLocaleString()}`,
            grandBoxX, rowY + 4,
            { width: grandBoxW - 8, align: 'right' }
        )
        .restore();

    rowY += 40;

    // ── 6. PAYMENT METHOD NOTE ───────────────────────────────────────────────
    if (order.paymentResult?.id) {
        doc.save().fillColor(MUTED).font('Helvetica').fontSize(8)
            .text(`Transaction ID: ${order.paymentResult.id}`, MARGIN, rowY)
            .restore();
        rowY += 14;
    }

    // ── 7. THANK YOU NOTE ────────────────────────────────────────────────────
    rowY += 10;
    fillRect(doc, MARGIN, rowY, COL_W, 42, LIGHT);
    doc.save()
        .moveTo(MARGIN, rowY).lineTo(MARGIN + COL_W, rowY)
        .strokeColor(BRAND).lineWidth(2).stroke()
        .restore();

    doc.save().fillColor(SLATE).font('Helvetica-Bold').fontSize(10)
        .text('Thank you for shopping with FlexFit!', MARGIN + 12, rowY + 10)
        .restore();
    doc.save().fillColor(MUTED).font('Helvetica').fontSize(8)
        .text('Questions? Reach us at support@flexfit.lk  ·  www.flexfit.lk', MARGIN + 12, rowY + 24)
        .restore();

    // ── 8. FOOTER ────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 38;
    hRule(doc, footerY - 6, RULE, 0.5);

    doc.save().fillColor(MUTED).font('Helvetica').fontSize(7.5)
        .text(
            `FlexFit · Colombo, Sri Lanka · support@flexfit.lk · Generated ${new Date().toLocaleString('en-GB')}`,
            MARGIN, footerY,
            { align: 'center', width: COL_W }
        )
        .restore();

    // Page number
    doc.save().fillColor(MUTED).font('Helvetica').fontSize(7.5)
        .text('Page 1 of 1', MARGIN, footerY + 12, { align: 'center', width: COL_W })
        .restore();

    doc.end();
};

module.exports = generateInvoice;