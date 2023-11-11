<?php

use Flasher\Prime\Notification\Envelope;

/***
 * function memory_file_path is a json file which will be used to save the recently opened files
 ***/
function memory_file_path(): string
{
    return public_path('memory.json');
}

function icon_handler($file_name): string
{
    $extension = pathinfo($file_name, PATHINFO_EXTENSION);
    $extension = strtolower($extension);
    return match ($extension) {
        'pdf' => 'fa-file-pdf',
        'doc', 'docx' => 'fa-file-word',
        'xls', 'xlsx' => 'fa-file-excel',
        'ppt', 'pptx' => 'fa-file-powerpoint',
        'txt' => 'fa-file-alt',
        'zip', 'rar' => 'fa-file-archive',
        'jpg', 'jpeg', 'png', 'gif' => 'fa-file-image',
        default => 'fa-file',
    };
}

function diffForHumans($date): string
{
    return Carbon\Carbon::parse($date)->diffForHumans();
}

function memory_file(): array
{
    return json_decode(file_get_contents(memory_file_path()), true, flags: JSON_PRETTY_PRINT);
}

function save_memory_file($data): void
{
    file_put_contents(memory_file_path(), json_encode($data));
}

function get_memory_file($key): string
{
    $memory_file = memory_file();
    return $memory_file[$key] ?? '';
}

function set_memory_file($key, $value): void
{
    $memory_file = memory_file();
    $memory_file[$key] = $value;
    save_memory_file($memory_file);
}


function divide(): string
{
    return '<div class="divider"></div>';
}


if (!function_exists('excel_path')) {
    /**
     * Get the path to the excel directory.
     *
     * @param string $path
     * @return string
     */
    function excel_path(string $path = ''): string
    {
        return app()->basePath('public/excel') . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }
}

function init_application_data(): array
{
    $url = 'https://raw.githubusercontent.com/NawrasBukhari/laravel-excel-editor/main/application.json';
    return json_decode(file_get_contents($url), true, flags: JSON_PRETTY_PRINT);
}

function check_for_update()
{
    $current_version = init_application_data()['version'];

    if (config('app.version') !== $current_version) {
        return flash()->addWarning('Update available. Please update the application.');
    } else {
        return flash()->addSuccess('You are using the latest version of the application.');
    }
}
