class Helpers {
    constructor() {
        this.token = document.querySelector('meta[name="csrf_token"]').getAttribute('content');
    }

    static get(url) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf_token"]').getAttribute('content'),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
    }

    static post(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf_token"]').getAttribute('content'),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }

    static postFile(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf_token"]').getAttribute('content'),
                'Accept': 'application/json',
                'enctype': 'multipart/form-data'
            },
            body: data
        });
    }

    static showLoading() {
        const loading = document.getElementById('loader-container');
        loading.classList.remove('hidden');
    }

    static hideLoading() {
        const loading = document.getElementById('loader-container');
        loading.classList.add('hidden');
    }

    static postJson(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf_token"]').getAttribute('content'),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }

    static toast(title = 'unhandled title', message = 'unhandled message', type = 'success') {
        if (type === 'success') {
            iziToast.show({
                title: title,
                message: message,
                theme: 'dark',
                backgroundColor: '#329332',
                balloon: false,
                close: true,
                closeOnClick: true,
                position: 'topCenter',
                timeout: 5000,
                animateInside: true,
            });
        } else if (type === 'error') {
            iziToast.show({
                title: title,
                message: message,
                theme: 'light',
                backgroundColor: '#8a2430',
                balloon: false,
                close: true,
                closeOnClick: true,
                position: 'topCenter',
                timeout: 5000,
                animateInside: true,
            });
        } else if (type === 'warning') {
            iziToast.show({
                title: title,
                message: message,
                theme: 'light',
                backgroundColor: '#a9a11c',
                balloon: false,
                close: true,
                closeOnClick: true,
                position: 'topCenter',
                timeout: 5000,
                animateInside: true,
            });
        } else {
            iziToast.show({
                title: title,
                message: message,
                theme: 'light',
                backgroundColor: '#142462',
                balloon: false,
                close: true,
                closeOnClick: true,
                position: 'topCenter',
                timeout: 5000,
                animateInside: true,
            });
        }
    }

    static diffForHumans(timestamp) {
        const currentDate = new Date();
        const fileDate = new Date(timestamp);

        // Calculate the time difference in milliseconds
        const timeDifference = currentDate - fileDate;

        // Define time intervals in milliseconds
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const month = 30 * day;
        const year = 365 * day;

        // Calculate the human-readable difference
        if (timeDifference < minute) {
            const seconds = Math.floor(timeDifference / 1000);
            return seconds === 1 ? 'a second ago' : `${seconds} seconds ago`;
        } else if (timeDifference < hour) {
            const minutes = Math.floor(timeDifference / minute);
            return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
        } else if (timeDifference < day) {
            const hours = Math.floor(timeDifference / hour);
            return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
        } else if (timeDifference < month) {
            const days = Math.floor(timeDifference / day);
            return days === 1 ? 'a day ago' : `${days} days ago`;
        } else if (timeDifference < year) {
            const months = Math.floor(timeDifference / month);
            return months === 1 ? 'a month ago' : `${months} months ago`;
        } else {
            const years = Math.floor(timeDifference / year);

            return years === 1 ? 'a year ago' : `${years} years ago`;
        }
    }

    static iconHandler(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();

        switch (extension) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fa-file-powerpoint';
            case 'txt':
                return 'fa-file-alt';
            case 'zip':
            case 'rar':
                return 'fa-file-archive';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'fa-file-image';
            default:
                return 'fa-file';
        }
    }

    static log(environment){
        if (environment === 'production') {
            console.log = () => {};
        }
    }
}


export default Helpers;


