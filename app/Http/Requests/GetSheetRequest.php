<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetSheetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sheetName' => 'required|string',
            'fileName' => 'required|string',
            'folderName' => 'required|string'
        ];
    }
}
