import React, { useMemo, useState } from 'react';
import { CleanedRow } from '../types';
import { CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  data: CleanedRow[];
  numberOfPhones: number;
  numberOfEmails: number;
  isPrisonScrub?: boolean;
}

const RECORDS_PER_PAGE = 50;

export const DataTable: React.FC<DataTableProps> = ({ data, numberOfPhones, numberOfEmails, isPrisonScrub = false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (data.length === 0) {
    return <div className="no-data">No data to display</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(data.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, data.length);
  const paginatedData = data.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Generate column headers matching export format
  const columns = useMemo(() => {
    const cols: string[] = ["Status", "First Name", "Last Name"];

    // Add phone columns with HLR data for Prison Scrub
    for (let i = 1; i <= numberOfPhones; i++) {
      const phoneLabel = numberOfPhones === 1 ? "Phone" : `Phone ${i}`;
      cols.push(phoneLabel);
      if (isPrisonScrub) {
        cols.push(`${phoneLabel} Status`);
        cols.push(`${phoneLabel} Type`);
        cols.push(`${phoneLabel} Carrier`);
        cols.push(`${phoneLabel} Ported`);
        cols.push(`${phoneLabel} Roaming`);
      }
    }

    // Add email columns
    for (let i = 1; i <= numberOfEmails; i++) {
      cols.push(numberOfEmails === 1 ? "Email" : `Email ${i}`);
    }

    // Add remaining columns
    cols.push("Property Address", "Contact Type", "Opportunity Name", "Stage", "Pipeline", "Tags");

    return cols;
  }, [numberOfPhones, numberOfEmails, isPrisonScrub]);

  const getValidationIcon = (row: CleanedRow) => {
    if (row["Missing Phone"]) {
      return <AlertCircle size={16} className="icon-warning" />;
    }
    if (row["Duplicate Phone"]) {
      return <AlertCircle size={16} className="icon-warning" />;
    }
    if (row["Phone Valid"]) {
      return <CheckCircle size={16} className="icon-success" />;
    }
    return <XCircle size={16} className="icon-error" />;
  };

  const getRowClassName = (row: CleanedRow) => {
    const classes = ['data-row'];
    if (row["Missing Phone"]) classes.push('missing-phone');
    if (row["Duplicate Phone"]) classes.push('duplicate-phone');
    if (!row["Phone Valid"] && !row["Missing Phone"]) classes.push('invalid-phone');
    return classes.join(' ');
  };

  const renderCell = (row: CleanedRow, column: string) => {
    if (column === "Status") {
      return <td className="status-cell">{getValidationIcon(row)}</td>;
    }
    return <td>{String(row[column] || "")}</td>;
  };

  return (
    <div className="data-table-container">
      <div className="pagination-controls">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages} | Showing {startIndex + 1}-{endIndex} of {data.length} records
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={startIndex + index} className={getRowClassName(row)}>
              {columns.map((col, colIndex) => (
                <React.Fragment key={colIndex}>
                  {renderCell(row, col)}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <ChevronLeft size={20} />
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages} | Showing {startIndex + 1}-{endIndex} of {data.length} records
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
