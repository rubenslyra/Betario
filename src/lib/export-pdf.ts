import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LabStateSnapshot } from "./report-snapshot";

export function exportReportPdf(snap: LabStateSnapshot) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header band
  doc.setFillColor(16, 27, 43);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(245, 196, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BET-RAY Lab", margin, 32);
  doc.setTextColor(244, 247, 250);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório educacional · @assincronamente", margin, 50);
  doc.setFontSize(8);
  doc.text(
    `Emitido em ${new Date().toLocaleString("pt-BR")} · Sem dinheiro real · Sem apostas reais`,
    margin,
    62,
  );

  y = 90;
  doc.setTextColor(34, 34, 34);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const disclaimer =
    "Aplicação educacional. Este relatório usa saldo fictício e resultados simulados para discutir probabilidade, UX persuasiva e fricções de saque.";
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - margin * 2), margin, y);
  y += 28;

  // Balances
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Saldos fictícios", margin, y);
  y += 6;
  autoTable(doc, {
    startY: y + 4,
    head: [["Tipo", "Valor (R$)"]],
    body: [
      ["Depositado", snap.balances.deposited.toFixed(2)],
      ["Bônus simulado", snap.balances.bonus.toFixed(2)],
      ["Saldo visual", snap.balances.visual.toFixed(2)],
      ["Saldo sacável", snap.balances.withdrawable.toFixed(2)],
      ["Bloqueado", snap.balances.blocked.toFixed(2)],
      ["Fracionado", snap.balances.fractional.toFixed(2)],
    ],
    headStyles: { fillColor: [34, 167, 240], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  // Experiments
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Experimentos — parâmetros, preset e resultados", margin, y);
  autoTable(doc, {
    startY: y + 6,
    head: [
      ["Experimento", "Preset ativo", "Rodadas", "Acertos", "Quase", "Perdas", "P(win)", "Limite", "Bônus"],
    ],
    body: snap.experiments.map((e) => [
      e.label,
      e.activePresetName ?? "personalizado",
      e.stats.rounds.toString(),
      e.stats.wins.toString(),
      e.stats.nearMisses.toString(),
      e.stats.losses.toString(),
      `${(e.params.winChance * 100).toFixed(0)}%`,
      e.params.roundLimit === 0 ? "—" : String(e.params.roundLimit),
      `R$ ${e.params.bonusFraction.toFixed(2)}`,
    ]),
    headStyles: { fillColor: [16, 27, 43], textColor: 245 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  // Saved presets catalogue
  if (snap.presets.length > 0) {
    if (y > 680) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Presets salvos", margin, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Experimento", "Nome", "P(win)", "P(quase)", "Limite", "Bônus", "Criado em"]],
      body: snap.presets.map((p) => [
        p.experimentLabel,
        p.name,
        `${(p.params.winChance * 100).toFixed(0)}%`,
        `${(p.params.nearMissChance * 100).toFixed(0)}%`,
        p.params.roundLimit === 0 ? "—" : String(p.params.roundLimit),
        `R$ ${p.params.bonusFraction.toFixed(2)}`,
        new Date(p.createdAt).toLocaleString("pt-BR"),
      ]),
      headStyles: { fillColor: [245, 196, 0], textColor: 30 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
  }


  // Friction events
  if (y > 700) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Fricções de saque detectadas", margin, y);
  autoTable(doc, {
    startY: y + 6,
    head: [["Horário", "Mensagem"]],
    body:
      snap.frictions.length > 0
        ? snap.frictions.map((f) => [
            new Date(f.timestamp).toLocaleString("pt-BR"),
            f.message,
          ])
        : [["—", "Nenhuma fricção registrada."]],
    headStyles: { fillColor: [255, 107, 107], textColor: 255 },
    styles: { fontSize: 8, cellWidth: "wrap" },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: pageWidth - margin * 2 - 110 } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  // Ledger
  doc.addPage();
  y = margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ledger educacional", margin, y);
  autoTable(doc, {
    startY: y + 6,
    head: [["Tempo", "Tipo", "Valor", "Antes", "Depois", "Nota"]],
    body: snap.events.map((e) => [
      new Date(e.timestamp).toLocaleTimeString("pt-BR"),
      e.type,
      e.amount.toFixed(2),
      e.beforeBalance.toFixed(2),
      e.afterBalance.toFixed(2),
      e.note,
    ]),
    headStyles: { fillColor: [16, 27, 43], textColor: 245 },
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 90 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
      4: { cellWidth: 45 },
      5: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `BET-RAY Lab · Educacional · Página ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 16,
      { align: "center" },
    );
  }

  doc.save(`bet-ray-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`);
}
