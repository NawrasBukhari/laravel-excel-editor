<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="base_url" content="{{ url('/') }}">
    <meta name="csrf_token" content="{{ csrf_token() }}">

    <title>{{ config('app.name') }}</title>

    <script>
        let recentFilesJson = @json($recentFiles);
        let environment = '{{ app()->environment() }}';
    </script>

    {{--  Styles  --}}
    <link type="text/css" rel="stylesheet" href="{{ asset('assets/css/bootstrap.min.css') }}">
    <link type="text/css" rel="stylesheet" href="{{ asset('assets/css/bootstrap-grid.css') }}">
    <link type="text/css" rel="stylesheet" href="{{ asset('assets/fontawesome/css/all.min.css') }}">
    <link type="text/css" rel="stylesheet" href="{{ asset('lib/handsontable/handsontable.full.css')}}">
    <link type="text/css" rel="stylesheet" href="{{ asset('assets/toast/css/iziToast.min.css')}}">
    <link type="text/css" rel="stylesheet" href="{{ asset('assets/css/style.css')}}">
    @stack('styles')
</head>

@include('loader')
<body>

@include('navbar')

@yield('content')

@include('footer')

@stack('scripts')


{{--  JavaScript  --}}
<script src="{{ asset('assets/javascript/jquery.min.js') }}"></script>
<script src="{{ asset('assets/javascript/bootstrap.min.js') }}"></script>
<script src="{{ asset('assets/javascript/bootstrap.bundle.js') }}"></script>
<script src="{{ asset('assets/fontawesome/js/all.min.js') }}"></script>
<script src="{{ asset('lib/handsontable/handsontable.full.min.js') }}"></script>
<script src="{{ asset('assets/toast/js/iziToast.min.js') }}"></script>
<script type="module" src="{{ asset('assets/javascript/helpers.js') }}"></script>
<script type="module" src="{{ asset('assets/javascript/script.js') }}"></script>

</body>
</html>
