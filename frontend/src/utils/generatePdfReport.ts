import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export function generatePdfReport(report: any) {
  const content: any[] = [
    { text: 'Полный отчёт', style: 'header' },
    { text: `Метод: ${report.method}`, margin: [0, 5] },

    { text: 'Критерии', style: 'subheader' },
    {
      ul: report.criteria.map((c: any) => `${c.name} (${c.direction})`)
    },

    { text: 'Веса', style: 'subheader' },
    {
      table: {
        widths: ['*', '*'],
        body: [
          ['Критерий', 'Вес'],
          ...Object.entries(report.weights).map(([k, v]) => [k, v.toFixed(3)])
        ]
      }
    },

    { text: 'Пороговые значения', style: 'subheader' },
    {
      table: {
        widths: [100, 30, 30, 30, 70],
        body: [
          ['Критерий', 'q', 'p', 'v', 'Тип'],
          ...Object.entries(report.thresholds).map(([name, t]: any) => [
            name,
            t.q ?? '-',
            t.p ?? '-',
            t.v ?? '-',
            t.function ?? '-'
          ])
        ]
      }
    },

    { text: 'Матрица решений', style: 'subheader' },
    {
      table: {
        body: report.matrix.map((row: number[]) =>
          row.map((v) => v.toFixed(2))
        )
      }
    },

    { text: 'Альтернативы', style: 'subheader' },
    {
      ul: report.alternatives.map((a: any) => `${a.name} (${a.company})`)
    }
  ];
  if (report.scores && report.scores.length === report.alternatives.length) {
  content.push(
    { text: 'Итоговое ранжирование', style: 'subheader' },
    {
      table: {
        widths: ['*', '*', 50],
        body: [
          ['Компания', 'Программа', 'Оценка'],
          ...report.alternatives.map((alt: any, i: number) => [
            alt.company,
            alt.name,
            report.scores[i].toFixed(3)
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 5]
    }
  );
}

  // Промежуточные данные
  if (report.intermediate) {
    content.push({ text: 'Промежуточные вычисления', style: 'subheader' });

    if (report.method === 'electre_iii') {
      content.push(
        { text: 'Матрица согласия', bold: true },
        {
          table: {
            body: report.intermediate.concordance.map((row: number[]) =>
              row.map((v) => v.toFixed(2))
            )
          }
        },
        { text: 'Матрица доверия', bold: true },
        {
          table: {
            body: report.intermediate.credibility.map((row: number[]) =>
              row.map((v) => v.toFixed(2))
            )
          }
        },
        { text: 'Нисходящее ранжирование', bold: true },
        { ul: report.intermediate.descending },
        { text: 'Восходящее ранжирование', bold: true },
        { ul: report.intermediate.ascending },
        { text: 'Матрица парных итоговых бинарных отношений', bold: true },
        {
          table: {
            body: report.intermediate.poMatrix
          }
        }
      );
    }

    if (report.method === 'promethee_ii' && report.intermediate) {
      content.push(
        { text: 'Матрица агрегированных индексов предпочтения', bold: true },
        {
          table: {
            body: report.intermediate.pdMatrix.map((row: number[]) =>
              row.map((v) => v.toFixed(2))
            )
          }
        },
        { text: 'Phi+', bold: true },
        {
          table: {
            body: [report.intermediate.phiPlus.map((v: number) => v.toFixed(3))]
          }
        },
        { text: 'Phi-', bold: true },
        {
          table: {
            body: [report.intermediate.phiMinus.map((v: number) => v.toFixed(3))]
          }
        }
      );
    }
  }

  const docDefinition = {
    content,
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, margin: [0, 10, 0, 5] }
    }
  };

  pdfMake.createPdf(docDefinition).download("report.pdf");
}
