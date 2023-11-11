<?php

namespace App\Imports;

use App\Models\Excel;
use Maatwebsite\Excel\Concerns\ToModel;

class ExcelImport implements ToModel
{
    public function model(array $row): Excel
    {
        return new Excel([
            'data_keys' => $row[0],
            'data_values' => $row[1],
        ]);
    }
}
