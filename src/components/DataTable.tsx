import React, { useMemo } from 'react';
import { CleanedRow } from '../types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DataTableProps {
  data: CleanedRow[];
  numberOfPhones: number;
  numberOfEmails: number;
  isPrisonScrub?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({ data, numberOfPhones, numberOfEmails, isPrisonScrub = false }) => {
  if (data.length === 0) {
    return <div className="no-data">No data to display</div>;
  }

  // Generate column headers matching export format
  const columns = useMemo(() => {
    const cols: string[] = ["Status", "First Name", "Last Name", "Contact Type"];

    // Add phone columns with Type and Carrier for Prison Scrub
    for (let i = 1; i <= numberOfPhones; i++) {
      cols.push(`Phone ${i}`);
      if (isPrisonScrub) {
        cols.push(`Phone ${i} Type`);
        cols.push(`Phone ${i} Carrier`);
      }
    }

    // Add email columns
    for (let i = 1; i <= numberOfEmails; i++) {
      cols.push(`Email ${i}`);
    }

    // Add remaining columns
    cols.push("Property Address", "Opportunity Name", "Stage", "Pipeline", "Tags");

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
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={getRowClassName(row)}>
              {columns.map((col, colIndex) => (
                <React.Fragment key={colIndex}>
                  {renderCell(row, col)}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
