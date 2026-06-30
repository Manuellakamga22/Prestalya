const router  = require("express").Router();
const auth    = require("../middleware/auth");
const db      = require("../config/db");
const PDFDocument = require("pdfkit");

// GET /api/factures/:bookingId  — génère la facture PDF
router.get("/:bookingId", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, u.prenom, u.nom, u.email,
             p.service, p.price, p.city,
             pu.prenom AS p_prenom, pu.nom AS p_nom, pu.email AS p_email
      FROM bookings b
      JOIN users u ON u.id = b.client_id
      JOIN providers p ON p.id = b.provider_id
      JOIN users pu ON pu.id = p.user_id
      WHERE b.id = ?
    `, [req.params.bookingId]);

    const b = rows[0];
    if (!b) return res.status(404).json({ message: "Réservation introuvable." });
    if (b.client_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Non autorisé." });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="facture_${b.id.slice(0,8).toUpperCase()}.pdf"`);
    doc.pipe(res);

    // ── En-tête ──────────────────────────────────────────────────────────
    doc.rect(0, 0, 595, 120).fill("#7C3AED");
    doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold").text("Prestalya", 50, 35);
    doc.fontSize(11).font("Helvetica").text("La marketplace des services à domicile", 50, 70);
    doc.text("contact@prestalya.fr · www.prestalya.fr", 50, 88);

    doc.fillColor("#1F2937").fontSize(22).font("Helvetica-Bold").text("FACTURE", 400, 40, { align: "right" });
    doc.fontSize(11).font("Helvetica").fillColor("#6B7280")
      .text(`N° ${b.id.slice(0,8).toUpperCase()}`, 400, 70, { align: "right" })
      .text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, 400, 86, { align: "right" });

    // ── Parties ──────────────────────────────────────────────────────────
    doc.moveDown(4);
    const y = 160;

    doc.fillColor("#7C3AED").fontSize(10).font("Helvetica-Bold").text("ÉMETTEUR", 50, y);
    doc.fillColor("#1F2937").font("Helvetica").fontSize(11)
      .text(`${b.p_prenom} ${b.p_nom}`, 50, y + 16)
      .text(b.p_email, 50, y + 32)
      .text(b.city || "", 50, y + 48);

    doc.fillColor("#7C3AED").fontSize(10).font("Helvetica-Bold").text("DESTINATAIRE", 320, y);
    doc.fillColor("#1F2937").font("Helvetica").fontSize(11)
      .text(`${b.prenom} ${b.nom}`, 320, y + 16)
      .text(b.email, 320, y + 32);

    // ── Séparateur ───────────────────────────────────────────────────────
    doc.moveTo(50, y + 80).lineTo(545, y + 80).strokeColor("#E5E7EB").lineWidth(1).stroke();

    // ── Tableau prestation ───────────────────────────────────────────────
    const ty = y + 100;
    doc.rect(50, ty, 495, 30).fill("#F4F3FF");
    doc.fillColor("#7C3AED").fontSize(10).font("Helvetica-Bold")
      .text("DESCRIPTION", 60, ty + 9)
      .text("DATE", 270, ty + 9)
      .text("MONTANT HT", 390, ty + 9, { width: 100, align: "right" });

    const montantHT = parseFloat(b.montant_ht) || parseFloat(b.montant_net) || 0;
    const tva = montantHT * 0.2;
    const ttc = montantHT + tva;

    doc.rect(50, ty + 30, 495, 36).fill("#FAFAFA");
    doc.fillColor("#1F2937").font("Helvetica").fontSize(11)
      .text(b.service, 60, ty + 40)
      .text(b.date ? new Date(b.date).toLocaleDateString("fr-FR") : "-", 270, ty + 40)
      .text(`${montantHT.toFixed(2)} €`, 390, ty + 40, { width: 100, align: "right" });

    // ── Totaux ────────────────────────────────────────────────────────────
    const totY = ty + 100;
    doc.moveTo(50, totY).lineTo(545, totY).strokeColor("#E5E7EB").lineWidth(1).stroke();

    const totals = [
      ["Sous-total HT",   `${montantHT.toFixed(2)} €`],
      ["TVA (20%)",       `${tva.toFixed(2)} €`],
    ];
    totals.forEach(([label, val], i) => {
      doc.fillColor("#6B7280").font("Helvetica").fontSize(11)
        .text(label, 350, totY + 16 + i * 22)
        .fillColor("#1F2937")
        .text(val, 445, totY + 16 + i * 22, { width: 100, align: "right" });
    });

    doc.rect(345, totY + 68, 200, 32).fill("#7C3AED");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13)
      .text("TOTAL TTC", 355, totY + 77)
      .text(`${ttc.toFixed(2)} €`, 445, totY + 77, { width: 95, align: "right" });

    // ── Statut paiement ──────────────────────────────────────────────────
    const paidY = totY + 120;
    const paid  = b.status === "termine" || b.status === "confirme";
    doc.rect(50, paidY, 200, 36).fill(paid ? "#D1FAE5" : "#FEF3C7");
    doc.fillColor(paid ? "#065F46" : "#92400E").font("Helvetica-Bold").fontSize(12)
      .text(paid ? "✓ PAYÉ" : "⏳ EN ATTENTE", 60, paidY + 11, { width: 180, align: "center" });

    // ── Mentions légales ─────────────────────────────────────────────────
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(8)
      .text(
        "Prestalya — Marketplace de services à domicile · TVA non applicable si auto-entrepreneur (art. 293B du CGI)\nConservez ce document pour vos archives.",
        50, 760, { align: "center", width: 495 }
      );

    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;
