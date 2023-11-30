import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  parsedData;

  constructor(private papa: Papa) { }
  exportToCsv(data: any[], filename: string): void {
    // Flatten nested objects
    const flatData = data.map(item => this.flattenObject(item));

    // Extract headers from the flattened data
    const headers = this.extractHeaders(flatData);

    // Convert array of objects to CSV
    const csv = this.papa.unparse({
      fields: headers,
      data: flatData,
    });

    // Create a Blob with the CSV data
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private flattenObject(obj: any, prefix: string = ''): any {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          result[newKey] = JSON.stringify(obj[key]);
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  }

  private extractHeaders(data: any[]): string[] {
    const headers = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => headers.add(key));
    });
    return Array.from(headers);
  }


  unflattenObject(flatObj: any): any {
    const result: any = {};

    // Remove backslashes from the response
    const cleanedCsvString = flatObj.replace(/\\/g, '');

    // Parse the cleaned CSV string into a JavaScript object
    this.parsedData = this.papa.parse(cleanedCsvString, {
      header: true, // Treat the first row as headers
      dynamicTyping: false, // Convert numeric values to numbers
      skipEmptyLines: true, // Skip empty lines
      complete: function (results) {
        // The parsed data is available in results.data
        this.parsedData = results.data
        return this.parsedData

      },
      error: function (error) {
        console.error('CSV Parsing Error:', error.message);
      }
    });
    return this.parsedData.data
  }

}