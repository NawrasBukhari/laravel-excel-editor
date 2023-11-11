<?php

use App\Http\Controllers\ExcelController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [ExcelController::class, 'index'])->name('excel.index');
Route::post('import', [ExcelController::class, 'import'])->name('excel.import');
Route::match(['get', 'post'], 'export', [ExcelController::class, 'export'])->name('excel.export');
Route::match(['get', 'post'], 'open-sheet', [ExcelController::class, 'getSheet'])->name('excel.getSheet');
Route::post('update', [ExcelController::class, 'update'])->name('excel.update');
Route::post('recent-files', [ExcelController::class, 'recentFiles'])->name('excel.recentFiles');
