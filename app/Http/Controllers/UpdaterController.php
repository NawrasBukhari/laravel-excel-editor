<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UpdaterController extends Controller
{
    public string $baseUrl;
    public array $files;


    public function __construct()
    {
        $this->baseUrl = 'https://raw.githubusercontent.com/NawrasBukhari/laravel-excel-editor/main/';
        $this->files = [
            'applicationJson'       =>      $this->baseUrl . 'application.json',
            'excelController'       =>      $this->baseUrl . 'app/Http/Controllers/ExcelController.php',
            'excelHelper'           =>      $this->baseUrl . 'app/Helpers.php',
            'excelJsScript'         =>      $this->baseUrl . 'public/assets/javascript/script.js',
            'excelJsScriptHelper'   =>      $this->baseUrl . 'public/assets/javascript/helpers.js',
        ];
    }

    private function read()
    {
        return file_get_contents($this->files['applicationJson']);
    }

    public function index()
    {

    }
}
