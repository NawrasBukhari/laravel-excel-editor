<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="d-flex">
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true">
                <i class="fas fa-file"></i> @lang('File')
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li>
                    <input type="file" id="file-input" class="d-none" name="file" accept=".csv, .xls, .xlsx">
                    <label for="file-input" class="dropdown-item pointer">
                        <img height="32px" width="32px" src="{{asset('assets/images/import.png')}}"
                             alt=""> @lang('Open File')
                    </label>
                </li>
                {!! divide() !!}

                @if($recentFiles != null)
                    <li class="dropdown-submenu position-static">
                        <a class="dropdown-item dropdown-toggle" href="javascript:void(0)" id="recentFilesMenu">
                            <img height="32px" width="32px" src="{{asset('assets/images/recent.png')}}"
                                 alt=""> @lang('Recent Files')
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="recentFilesMenu" id="recentFilesMenu"></ul>
                    </li>
                @endif

                {!! divide() !!}
                <li>
                    <label id="exportButton" for="file-export" class="dropdown-item pointer">
                        <img height="32px" width="32px" src="{{asset('assets/images/export.png')}}"
                             alt=""> @lang('Export')
                    </label>
                </li>
            </ul>
        </div>

        {{--    Save    --}}
        <button class="ml-2 btn btn-outline-info hidden" type="button" id="saveButton"
                aria-haspopup="true"
                aria-expanded="false">
            <i class="fas fa-save"></i> @lang('Save')
        </button>

    </div>

    {{--  Search  --}}
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
        <div class="d-flex justify-content-end">
            <input class="form-control me-2"
                   type="search"
                   placeholder="Search"
                   aria-label="Search"
                   autocomplete="off"
                   id="search-input">
        </div>
    </div>
</nav>
