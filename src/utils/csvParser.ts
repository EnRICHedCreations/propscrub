import Papa from 'papaparse';
import { RawRow } from '../types';

export const parseCSV = (file: File): Promise<RawRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as RawRow[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
