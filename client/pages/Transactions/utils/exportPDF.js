import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDateRangeText } from './dateHelpers';
import { calculateDueAmount } from './formatters';

/**
 * Generate and download PDF report for transactions
 */
export const exportTransactionsPDF = async (
    transactions,
    business,
    filterType,
    dateFilter,
    customDateRange,
    totalCredit,
    totalDebit
) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        let yPos = 12;

        /* =========================
           HEADER (TIGHT & DYNAMIC)
        ========================= */

        const startY = yPos;
        let headerY = startY;

        // Logo (small, top-right)
        if (business?.logo) {
            try {
                doc.addImage(
                    business.logo,
                    'PNG',
                    pageWidth - margin - 18,
                    startY,
                    18,
                    18
                );
            } catch (e) {
                console.error('Logo error', e);
            }
        }

        // Business Name (always)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(
            business?.name || business?.businessName || 'Business Name',
            margin,
            headerY + 6
        );

        headerY += 10;

        // Optional business fields
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        if (business?.address) {
            doc.text(business.address, margin, headerY);
            headerY += 5;
        }

        if (business?.gstin) {
            doc.text(`GSTIN: ${business.gstin}`, margin, headerY);
            headerY += 5;
        }

        if (business?.ownerName || business?.owner) {
            doc.text(
                `Owner: ${business.ownerName || business.owner}`,
                margin,
                headerY
            );
            headerY += 5;
        }

        // Divider right after real content
        headerY += 3;
        doc.setDrawColor(220);
        doc.line(margin, headerY, pageWidth - margin, headerY);

        yPos = headerY + 8;

        /* =========================
           TITLE + META
        ========================= */

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('Transaction Report', margin, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const dateRangeText = formatDateRangeText(dateFilter, customDateRange);
        const subtitle =
            filterType !== 'All'
                ? `${filterType} Transactions • ${dateRangeText}`
                : dateRangeText;

        doc.text(subtitle, margin, yPos + 6);

        doc.setTextColor(120);
        doc.text(
            `Generated: ${new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`,
            pageWidth - margin,
            yPos + 6,
            { align: 'right' }
        );

        doc.setTextColor(0);
        yPos += 14;

        /* =========================
           SUMMARY BOX
        ========================= */

        const netBalance = totalCredit - totalDebit;

        doc.setDrawColor(220);
        doc.rect(margin, yPos, pageWidth - margin * 2, 18);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);

        doc.setTextColor(34, 197, 94);
        doc.text(
            `Total Credit: Rs. ${totalCredit.toLocaleString()}`,
            margin + 4,
            yPos + 11
        );

        doc.setTextColor(220, 38, 38);
        doc.text(
            `Total Debit: Rs. ${totalDebit.toLocaleString()}`,
            margin + 70,
            yPos + 11
        );

        doc.setTextColor(
            ...(netBalance >= 0 ? [34, 197, 94] : [220, 38, 38])
        );
        doc.text(
            `Net Balance: ${netBalance >= 0 ? '+' : '-'}Rs. ${Math.abs(
                netBalance
            ).toLocaleString()}`,
            pageWidth - margin - 4,
            yPos + 11,
            { align: 'right' }
        );

        doc.setTextColor(0);
        yPos += 26;

        /* =========================
           TABLE (DATE + TIME)
        ========================= */

        const tableData = transactions.map(trx => [
            trx.type,
            trx.party,
            trx.date,
            trx.time || '',
            trx.status,
            `Rs. ${Number(trx.amount).toLocaleString()}`,
            `Rs. ${Number(trx.paidAmount || 0).toLocaleString()}`,
            `Rs. ${calculateDueAmount(trx).toLocaleString()}`
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Type', 'Party', 'Date', 'Time', 'Status', 'Amount', 'Paid', 'Due']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [55, 65, 81],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 32 },
                2: { cellWidth: 18 },
                3: { cellWidth: 16 },
                4: { cellWidth: 18 },
                5: { halign: 'right', cellWidth: 20 },
                6: { halign: 'right', cellWidth: 20 },
                7: { halign: 'right', cellWidth: 20 }
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        /* =========================
           FOOTER
        ========================= */

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        /* =========================
           SAVE
        ========================= */

        const dateStr = new Date().toISOString().split('T')[0];
        const sanitizedDateRange = dateRangeText.replace(/[\/\s]/g, '_');

        doc.save(`transactions_${filterType}_${sanitizedDateRange}_${dateStr}.pdf`);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert(`Failed to generate PDF: ${error.message}`);
        return false;
    }
};
