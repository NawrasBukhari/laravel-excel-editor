<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExportRequest;
use App\Http\Requests\GetSheetRequest;
use App\Http\Requests\ImportRequest;
use App\Http\Requests\RecentFilesRequest;
use App\Http\Requests\UpdateRequest;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Exception;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Str;

class ExcelController extends Controller
{
    public function index()
    {
        $recentFiles = json_decode(file_get_contents(public_path('memory.json')), true, flags: JSON_PRETTY_PRINT);
        if (empty($recentFiles)) {
            $recentFiles = [];
        }
        usort($recentFiles, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return view('index', compact('recentFiles'));
    }

    /**
     * @throws Exception
     * @throws \PhpOffice\PhpSpreadsheet\Exception
     */
    public function import(ImportRequest $request)
    {
        $allowedExtensions = ['xlsx', 'xls', 'csv', 'zip', 'txt'];
        $file = $request->file('file');

        if ($file->isValid() && in_array($file->extension(), $allowedExtensions)) {

            if ($file->extension() === 'zip') {
                $this->handleExcelZip($file);
            } else {
                $newFileName = $file->getClientOriginalName();
                $folderName = Str::slug(pathinfo($newFileName, PATHINFO_FILENAME)) . '_' . time();
                Storage::disk('excel')->makeDirectory($folderName);

                // Move the file to the created folder
                Storage::disk('excel')->put($folderName . '/' . $newFileName, file_get_contents($file));

                $recentFiles = json_decode(file_get_contents(public_path('memory.json')), true, flags: JSON_PRETTY_PRINT);
                $recentFiles[] = [
                    'file_name' => $newFileName,
                    'folder_name' => $folderName,
                    'timestamp' => now()->toIso8601String(),
                ];

                file_put_contents(public_path('memory.json'), json_encode($recentFiles, JSON_PRETTY_PRINT));

                $spreadsheet = IOFactory::load((excel_path($folderName . '/' . $newFileName)));
                $sheetData = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);
                $allSheets = $spreadsheet->getSheetNames();
                $activeSheet = $spreadsheet->getSheet(0)->getTitle();
                $data = [];

                foreach ($sheetData as $key => $value) {
                    $data[] = [
                        'data_keys' => $key,
                        'data_values' => $value,
                        'sheets' => $allSheets,
                        'active_sheet' => $activeSheet,
                    ];
                }

                return response()->json([
                    'data' => $data,
                    'file_name' => $newFileName,
                    'folder_name' => $folderName
                ], 200);
            }
        } else {
            flash()->addError('Invalid file type. Allowed file types: .xlsx, .xls, .csv');
            return response()->json(['error' => 'Invalid file type. Allowed file types: .xlsx, .xls, .csv ' . 'current file type: ' . $file->extension()], 422);
        }

        return response()->json(['success' => 'File uploaded successfully'], 200);
    }


    /**
     * @throws \PhpOffice\PhpSpreadsheet\Exception
     */
    public function getSheet(GetSheetRequest $request)
    {
        $sheetName = $request->get('sheetName');
        $fileName = $request->get('fileName');
        $folderName = $request->get('folderName');

        try {
            $spreadsheet = IOFactory::load(Storage::disk('excel')->path($folderName . '/' . $fileName));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }

        // Find the sheet index by name
        $sheetIndex = $spreadsheet->getIndex(
            $spreadsheet->getSheetByName($sheetName)
        );

        // Set the active sheet index
        $spreadsheet->setActiveSheetIndex($sheetIndex);

        // Get the active sheet
        $activeSheet = $spreadsheet->getActiveSheet();

        // Get the data range of the active sheet
        $data = $activeSheet->toArray();

        // Convert the data to a more standardized format
        $formattedData = [];
        foreach ($data as $row) {
            $rowData = ['data_values' => []];
            foreach ($row as $key => $value) {
                $rowData['data_values'][$key] = $value;
            }
            $formattedData[] = $rowData;
        }

        return response()->json(['data' => $formattedData], 200);
    }

    /**
     * @throws Exception
     */
    private function handleExcelZip($file): void
    {
        $zip = new \ZipArchive();
        $zip->open($file);
        $folderName = time() . '-' . $file->getClientOriginalName();
        $zip->extractTo(excel_path($folderName));
        $zip->close();

        $files = Storage::disk('excel')->files($folderName);
        // at this point, we have the excel zip with all xml files extracted

        // we need to get the xml files and convert them to xlsx
        $spreadsheet = new Spreadsheet();
        $writer = new Xlsx($spreadsheet);
        $writer->setOffice2003Compatibility(true);
        $writer->setPreCalculateFormulas(false);
        $writer->setIncludeCharts(true);

        foreach ($files as $file) {
            $xml = simplexml_load_file(excel_path($file));
            $json = json_encode($xml);
            $array = json_decode($json, true);
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->fromArray($array);
            $newFileName = date('d_m_Y_H_i_s') . '_' . $file;
            $writer->save(excel_path($newFileName));
        }

        response()->json(['success' => 'File uploaded successfully'], 200);
    }

    /**
     * @throws \PhpOffice\PhpSpreadsheet\Exception
     */

    public function update(UpdateRequest $request)
    {
        $fileName = $request->get('fileName');
        $data = $request->get('data');
        $folderName = $request->get('folderName');

        // Load the Excel file
        $filePath = Storage::disk('excel')->path($folderName . '/' . $fileName);
        $spreadsheet = IOFactory::load($filePath);

        // update the memory file with the new timestamp
        $recentFiles = json_decode(file_get_contents(public_path('memory.json')), true, flags: JSON_PRETTY_PRINT);
        $recentFiles[] = [
            'file_name' => $fileName,
            'folder_name' => $folderName,
            'timestamp' => now()->toIso8601String(),
        ];

        file_put_contents(public_path('memory.json'), json_encode($recentFiles, JSON_PRETTY_PRINT));

        // Iterate through all sheets
        foreach ($spreadsheet->getSheetNames() as $sheetName) {
            // Set the active sheet index
            $spreadsheet->setActiveSheetIndexByName($sheetName);

            // Get the active sheet
            $activeSheet = $spreadsheet->getActiveSheet();

            // Clear existing data in the active sheet
            $activeSheet->setCellValue('A1', null);

            // Write the new data to the active sheet
            foreach ($data as $rowIndex => $rowData) {
                foreach ($rowData as $columnIndex => $cellValue) {
                    $activeSheet->setCellValueByColumnAndRow($columnIndex + 1, $rowIndex + 1, $cellValue);
                }
            }
        }

        // Save the updated Excel file
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($filePath);

        return response()->json(['message' => 'File updated successfully'], 200);
    }


    /**
     * @throws \PhpOffice\PhpSpreadsheet\Exception
     */
    public function recentFiles(RecentFilesRequest $request)
    {
        $fileName = $request->get('fileName');
        $folderName = $request->get('folderName');

        $filePath = Storage::disk('excel')->path($folderName . '/' . $fileName);
        $spreadsheet = IOFactory::load($filePath);
        $sheetData = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);
        $allSheets = $spreadsheet->getSheetNames();
        $activeSheet = $spreadsheet->getSheet(0)->getTitle();
        $data = [];

        foreach ($sheetData as $key => $value) {
            $data[] = [
                'data_keys' => $key,
                'data_values' => $value,
                'sheets' => $allSheets,
                'active_sheet' => $activeSheet
            ];
        }

        return response()->json(['data' => $data], 200);
    }

    public function export(ExportRequest $request)
    {
        $fileName = $request->get('fileName');
        $folderName = $request->get('folderName');
        $exportFileName = 'exported.xlsx';

        try {
            $filePath = Storage::disk('excel')->path($folderName . '/' . $fileName);
            $spreadsheet = IOFactory::load($filePath);

            $exportSpreadsheet = new Spreadsheet();

            // Remove the default 'Worksheet' sheet from the export spreadsheet
            $exportSpreadsheet->removeSheetByIndex(0);

            foreach ($spreadsheet->getSheetNames() as $sheetName) {
                $originalSheet = $spreadsheet->getSheetByName($sheetName);

                // Clone the original sheet
                $exportSheet = clone $originalSheet;

                // Set a unique title for the cloned sheet
                $exportSheet->setTitle('Exported_' . $sheetName);

                // Add the cloned sheet to the export spreadsheet
                $exportSpreadsheet->addSheet($exportSheet);
            }

            $exportWriter = new Xlsx($exportSpreadsheet);
            $exportWriter->setOffice2003Compatibility(true);
            $exportWriter->setPreCalculateFormulas(false);
            $exportWriter->setIncludeCharts(true);

            // Save to a temporary file
            $tempFilePath = storage_path('app/temp_export.xlsx');
            $exportWriter->save($tempFilePath);

            // Set headers for download
            $headers = [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $exportFileName . '"',
                'Cache-Control' => 'max-age=0',
            ];

            // Return the download response
            return response()->download($tempFilePath, $exportFileName, $headers)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            // Log the detailed error
            \Log::error("Export Error: " . $e->getMessage());
            \Log::error("File: " . $e->getFile());
            \Log::error("Line: " . $e->getLine());

            // Return a generic error response
            return response()->json([
                'success' => false,
                'error' => "An error occurred while processing the data. Please check the data format.",
            ], 500);
        }
    }





}
