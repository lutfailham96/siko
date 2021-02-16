$(document).ready(function () {
    /* GLOBAL VARIABLES */
    // menu
    const menu_dashboard = $('#menu-dashboard');
    const menu_product = $('#menu-product');
    const menu_category = $('#menu-category');
    const menu_report = $('#menu-report');
    const menu_transaction = $('#menu-sale');
    // table data
    const category_data = $('#category-data');
    const product_data = $('#product-data');
    // initializer variable
    let report_from = '';
    let report_to = '';
    let getUrlParameter = function getUrlParameter(sParam) {
        let sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    if (getUrlParameter('from')) {
        report_from = getUrlParameter('from');
    }
    if (getUrlParameter('to')) {
        report_to = getUrlParameter('to');
    }
    let report_income = 0;
    // datatable
    const table_category = $('#table-category').DataTable({
        'ajax': '/ajax/category',
        'columns': [
            {
                'data': 'number'
            },
            {
                'data': 'category_code'
            },
            {
                'data': 'category_name'
            },
            {
                'data': 'product_total'
            },
            {
                'data': null,
                'render': function (data) {
                    return '<div class="text-center">' +
                                '<button type="button" class="btn btn-danger item-delete" data-id="' + data['category_code'] + '"><i class="fa fa-trash"></i></button>' +
                                ' ' +
                                '<button type="button" class="btn btn-primary item-update" data-id="' + data['category_code'] +'"><i class="fa fa-pencil"></i></button>' +
                            '</div>'
                }
            }
        ]
    });
    const table_product = $('#table-product').DataTable({
        'ajax': '/ajax/product',
        dom: '<"html5buttons">Bfrtip',
        buttons: [
            'copy', 'print'
        ],
        'columns': [
            {
                'data': 'number'
            },
            {
                'data': 'product_code'
            },
            {
                'data': 'product_name'
            },
            {
                'data': 'category_name'
            },
            {
                'data': null,
                'render': function (data) {
                    return formatRupiah(data['product_stock_price'].toString(), 'Rp')
                }
            },
            {
                'data': null,
                'render': function (data) {
                    return formatRupiah(data['product_price'].toString(), 'Rp')
                }
            },
            {
                'data': 'product_stock'
            },
            {
                'data': null,
                'render': function (data) {
                    return '<div class="text-center">' +
                        '<button type="button" class="btn btn-danger item-delete" data-id="' + data['product_code'] + '"><i class="fa fa-trash"></i></button>' +
                        ' ' +
                        '<button type="button" class="btn btn-primary item-update" data-id="' + data['product_code'] +'"><i class="fa fa-pencil"></i></button>' +
                        '</div>'
                }
            }
        ]
    });
    const table_transaction = $('#table-transaction').DataTable({
        'ajax': '/ajax/transaction',
        'columns': [
            {
                'data': 'number'
            },
            {
                'data': 'product_code'
            },
            {
                'data': 'product_name'
            },
            {
                'data': 'transaction_count'
            },
            {
                'data': null,
                'render': function (data) {
                    if (data['transaction_type'] === 0) {
                        return '<label class="label label-info">Masuk</label>'
                    } else if (data['transaction_type'] === 1) {
                        return '<label class="label label-success">Keluar</label>'
                    }
                }
            },
            {
                'data': 'transaction_date'
            }
        ]
    });
    const table_report = $('#table-report').DataTable({
        'ajax': '/ajax/report?from='+ report_from + '&to=' + report_to ,
        'columns': [
            {
                'data': 'number'
            },
            {
                'data': 'product_code'
            },
            {
                'data': 'product_name'
            },
            {
                'data': null,
                'render': function (data) {
                    return '<label class="label label-primary">' + formatRupiah(data['product_stock_price'].toString(), 'Rp') + '</label>';
                }
            },
            {
                'data': null,
                'render': function (data) {
                    return '<label class="label label-info">' + formatRupiah(data['product_price'].toString(), 'Rp') + '</label>';
                }
            },
            {
                'data': 'transaction_count'
            },
            {
                'data': null,
                'render': function (data) {
                    let income = data['transaction_count'] * (data['product_price'] - data['product_stock_price']);
                    return '<label class="label label-warning">' + formatRupiah(income.toString(), 'Rp') + '</label>';
                }
            },
            {
                'data': 'transaction_date'
            }
        ],
        'drawCallback': function() {
            generate_income();
        }
    });
    // custom
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    // initialize view
    initialize();
    function initialize() {
        activate_menu();
        show_date_now();
        $('.select2').select2();
    }

    /* CATEGORY EVENTS */
    // category | add
    $('#add-category').on('click', function () {
        $('#category-name').val('');
        $('#category-code').val('');
        $('#modal-category_add').modal('show');
    });
    // modal | add
    $('#category-btn_add').on('click', function () {
        category_add();
    });
    // modal | update
    $('#category-btn_update').on('click', function () {
        category_update();
    });
    // table | update category
    category_data.on('click', '.item-update', function () {
        let category_code = $(this).data('id');
        $.ajax({
            url: '/ajax/category/' + category_code,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data['status'] === 'OK') {
                    $('#category-code2').val(data['data']['category_code']);
                    $('#category-name2').val(data['data']['category_name']);
                    $('#modal-category_update').modal('show');
                }
            }
        });
    });
    // table | delete category
    category_data.on('click', '.item-delete', function () {
        let category_code = $(this).data('id');
        Swal.fire({
            title: 'Apa anda yakin?',
            text: "Menghapus kategori sacara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Tidak',
            confirmButtonText: 'Ya'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/ajax/category/' + category_code,
                    method: 'DELETE',
                    dataType: 'json',
                    success: function (data) {
                        if (data['status'] === 'OK') {
                            // refresh table category
                            table_category.ajax.reload();
                            // push notification
                            toastr['success']('Berhasil menghapus kategori!')
                        } else {
                            toastr['error']('Gagal menghapus kategori!')
                        }
                    }
                });
            }
        });
    });
    /* CATEGORY FUNCTIONS */
    // modal | add category
    function category_add() {
        let category_code = $('#category-code').val();
        let category_name = $('#category-name').val();
        if (validate_category()) {
            $.ajax({
                url: '/ajax/category',
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    category_code: category_code,
                    category_name: category_name
                }),
                success: function (data) {
                    if (data['status'] === 'OK') {
                        // hide modal
                        $('#modal-category_add').modal('hide');
                        // refresh table category
                        table_category.ajax.reload()
                        // push notification
                        toastr['success']('Berhasil menambah kategori baru!');
                    } else {
                        console.log('Error add new category!')
                    }
                }
            });
        }
    }
    // modal | update category
    function category_update() {
        let category_code = $('#category-code2').val();
        let category_name = $('#category-name2').val();
        if (validate_category2()) {
            $.ajax({
                url: '/ajax/category/' + category_code,
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    category_name: category_name
                }),
                success: function (data) {
                    if (data['status'] === 'OK') {
                        // hide modal
                        $('#modal-category_update').modal('hide');
                        // refresh table category
                        table_category.ajax.reload();
                        // push notification
                        toastr['success']('Berhasil memperbarui kategori!');
                    } else {
                        console.log('Error updating category!')
                    }
                }
            });
        }
    }
    // category | validator
    function validate_category() {
        let category_code = $('#category-code');
        let category_name = $('#category-name');
        if (category_code.val().trim().length <= 0) {
            category_code.parent().parent().addClass('has-error');
            return false
        }
        category_code.parent().parent().removeClass('has-error');
        if (category_name.val().trim().length <= 0) {
            category_name.parent().parent().addClass('has-error');
            return false;
        }
        category_name.parent().parent().addClass('has-error');
        return true;
    }
    function validate_category2() {
        let category_code = $('#category-code2');
        let category_name = $('#category-name2');
        if (category_code.val().trim().length <= 0) {
            category_code.parent().parent().addClass('has-error');
            return false
        }
        category_code.parent().parent().removeClass('has-error');
        if (category_name.val().trim().length <= 0) {
            category_name.parent().parent().addClass('has-error');
            return false;
        }
        category_name.parent().parent().removeClass('has-error');
        return true;
    }

    /* PRODUCT EVENTS */
    // product | add
    $('#add-product').on('click', function () {
        $('#product-code').val('');
        $('#product-name').val('');
        $('#product-price').val('');
        $('#product-stock').val('');
        $('#category-code').val('');
        $.ajax({
            url: '/ajax/category',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data['status'] === 'OK') {
                    let html = ''
                    $.each(data['data'], function (i) {
                        html += '<option value="' + data['data'][i]['category_code'] + '">' + data['data'][i]['category_name'] + ' (' + data['data'][i]['category_code'] + ')</option>'
                    });
                    $('#category-code').html(html);
                    $('#modal-product_add').modal('show');
                }
            }
        });
    });
    // modal | add
    $('#product-btn_add').on('click', function () {
        product_add();
    });
    // modal | update
    $('#product-btn_update').on('click', function () {
        product_update();
    });
    // table | update product
    product_data.on('click', '.item-update', function () {
        let product_code = $(this).data('id');
        $.ajax({
            url: '/ajax/product/' + product_code,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data['status'] === 'OK') {
                    let category_code = data['data']['category_code'];
                    let category_code2 = $('#category-code2');
                    let html = '';
                    $('#product-code2').val(data['data']['product_code']);
                    $('#product-name2').val(data['data']['product_name']);
                    $('#product-price2').val(data['data']['product_price']);
                    $('#product-stock-price2').val(data['data']['product_stock_price']);
                    $('#product-stock2').val(data['data']['product_stock']);
                    $.ajax({
                        url: '/ajax/category',
                        method: 'GET',
                        dataType: 'json',
                        success: function (data) {
                            if (data['status'] === 'OK') {
                                $.each(data['data'], function (i) {
                                    if (data['data'][i]['category_code'] === category_code) {
                                        html += '<option value="' + data['data'][i]['category_code'] + '" selected>' + data['data'][i]['category_name'] + ' (' + data['data'][i]['category_code'] + ')</option>';
                                    } else {
                                        html += '<option value="' + data['data'][i]['category_code'] + '">' + data['data'][i]['category_name'] + ' (' + data['data'][i]['category_code'] + ')</option>';
                                    }
                                });
                                category_code2.html(html);
                            }
                        }
                    });
                    $('#modal-product_update').modal('show');
                }
            }
        });
    });
    // table | delete product
    product_data.on('click', '.item-delete', function () {
        let product_code = $(this).data('id');
        Swal.fire({
            title: 'Apa anda yakin?',
            text: "Menghapus produk sacara permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Tidak',
            confirmButtonText: 'Ya'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/ajax/product/' + product_code,
                    method: 'DELETE',
                    dataType: 'json',
                    success: function (data) {
                        if (data['status'] === 'OK') {
                            // refresh table category
                            table_product.ajax.reload();
                            // push notification
                            toastr['success']('Berhasil menghapus produk!');
                        } else {
                            toastr['error']('Gagal menghapus produk!');
                        }
                    }
                });
            }
        });
    });
    /* PRODUCT FUNCTIONS */
    // modal | add product
    function product_add() {
        let product_code = $('#product-code').val();
        let product_name = $('#product-name').val();
        let product_price = $('#product-price').val();
        let product_stock_price = $('#product-stock-price').val();
        let product_stock = $('#product-stock').val();
        let category_code = $('#category-code').val();
        if (validate_product()) {
            $.ajax({
                url: '/ajax/product',
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    product_code: product_code,
                    product_name: product_name,
                    product_price: product_price,
                    product_stock_price: product_stock_price,
                    product_stock: product_stock,
                    category_code: category_code
                }),
                success: function (data) {
                    if (data['status'] === 'OK') {
                        // hide modal
                        $('#modal-product_add').modal('hide');
                        // refresh table category
                        table_product.ajax.reload()
                        // push notification
                        toastr['success']('Berhasil menambah produk baru!');
                    } else {
                        console.log('Error add new category!')
                    }
                }
            });
        }
    }
    // modal | update product
    function product_update() {
        let product_code = $('#product-code2').val();
        let product_name = $('#product-name2').val();
        let product_price = $('#product-price2').val();
        let product_stock_price = $('#product-stock-price2').val();
        let product_stock = $('#product-stock2').val();
        let category_code = $('#category-code2').val();
        if (validate_product2()) {
            $.ajax({
                url: '/ajax/product/' + product_code,
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    product_name: product_name,
                    product_price: product_price,
                    product_stock_price: product_stock_price,
                    product_stock: product_stock,
                    category_code: category_code
                }),
                success: function (data) {
                    if (data['status'] === 'OK') {
                        // hide modal
                        $('#modal-product_update').modal('hide');
                        // refresh table category
                        table_product.ajax.reload();
                        // push notification
                        toastr['success']('Berhasil memperbarui produk!');
                    } else {
                        console.log('Error updating product!')
                    }
                }
            });
        }
    }
    // product | validator
    function validate_product() {
        let product_code = $('#product-code');
        let product_name = $('#product-name');
        let category_code = $('#category-code');
        let product_price = $('#product-price');
        let product_stock_price = $('#product-stock-price');
        let product_stock = $('#product-stock');
        if (product_code.val().trim().length <= 0 || product_code.val().length > 10) {
            product_code.parent().parent().addClass('has-error');
            return false;
        }
        product_code.parent().parent().removeClass('has-error');
        if (product_name.val().trim().length <= 0) {
            product_name.parent().parent().addClass('has-error');
            return false;
        }
        product_name.parent().parent().removeClass('has-error');
        if (category_code.val().trim().length <=0) {
            category_code.parent().parent().addClass('has-error');
            return false;
        }
        category_code.parent().parent().removeClass('has-error');
        if (product_stock_price.val().trim().length <= 0 || parseInt(product_stock_price.val()) <= 0) {
            product_stock_price.parent().parent().addClass('has-error');
            return false;
        }
        product_stock_price.parent().parent().removeClass('has-error');
        if (product_price.val().trim().length <= 0 || parseInt(product_price.val()) <= 0) {
            product_price.parent().parent().addClass('has-error');
            return false;
        }
        product_price.parent().parent().removeClass('has-error');
        if (product_stock.val().trim().length <= 0 || parseInt(product_stock.val()) <= 0) {
            product_stock.parent().parent().addClass('has-error');
            return false;
        }
        product_stock.parent().parent().removeClass('has-error');
        return true
    }
    function validate_product2() {
        let product_code = $('#product-code2');
        let product_name = $('#product-name2');
        let category_code = $('#category-code2');
        let product_price = $('#product-price2');
        let product_stock_price = $('#product-stock-price2');
        let product_stock = $('#product-stock2');
        if (product_code.val().trim().length <= 0 || product_code.val().length > 10) {
            product_code.parent().parent().addClass('has-error');
            return false;
        }
        product_code.parent().parent().removeClass('has-error');
        if (product_name.val().trim().length <= 0) {
            product_name.parent().parent().addClass('has-error');
            return false;
        }
        product_name.parent().parent().removeClass('has-error');
        if (category_code.val().trim().length <=0) {
            category_code.parent().parent().addClass('has-error');
            return false;
        }
        category_code.parent().parent().removeClass('has-error');
        if (product_stock_price.val().trim().length <= 0 || parseInt(product_stock_price.val()) <= 0) {
            product_stock_price.parent().parent().addClass('has-error');
            return false;
        }
        product_stock_price.parent().parent().removeClass('has-error');
        if (product_price.val().trim().length <= 0 || parseInt(product_price.val()) <= 0) {
            product_price.parent().parent().addClass('has-error');
            return false;
        }
        product_price.parent().parent().removeClass('has-error');
        if (product_stock.val().trim().length <= 0 || parseInt(product_stock.val()) <= 0) {
            product_stock.parent().parent().addClass('has-error');
            return false;
        }
        product_stock.parent().parent().removeClass('has-error');
        return true
    }

    /* TRANSACTION EVENTS */
    // transaction | save
    $('#transaction-save').on('click', function () {
        let transaction_count = $('#transaction-count').val();
        let transaction_type = $('#transaction-type').val();
        let product_code = $('#transaction-product-code').val();
        if (validate_transaction()) {
            $.ajax({
                url: '/ajax/transaction',
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    transaction_count: transaction_count,
                    transaction_type: transaction_type,
                    product_code: product_code
                }),
                success: function (data) {
                    if (data['status'] === 'OK') {
                        // hide modal
                        $('#modal-product_update').modal('hide');
                        // refresh table transaction
                        table_transaction.ajax.reload();
                        // reinitialize view
                        $('#transaction-count').val(0);
                        // push notification
                        toastr['success']('Berhasil menyimpan transaksi!');
                    } else {
                        toastr['error']('Gagal menyimpan transaksi!');
                    }
                }
            });
        }
    });
    // transaction | initializer
    function initialize_transaction() {
        let html = '';
        $.ajax({
            url: '/ajax/product',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data['status'] === 'OK') {
                    $.each(data['data'], function (i) {
                        html += '<option value="' + data['data'][i]['product_code'] + '">' + data['data'][i]['product_name'] + ' (' + data['data'][i]['product_code'] + ')</option>';
                    });
                    $('#transaction-product-code').html(html);
                }
            }
        });
    }
    // transaction | validator
    function validate_transaction() {
        let transaction_count = $('#transaction-count');
        let transaction_product_code = $('#transaction-product-code');
        let transaction_type = $('#transaction-type');
        if (transaction_count.val().trim().length <= 0 || parseInt(transaction_count.val()) <= 0) {
            transaction_count.parent().parent().addClass('has-error');
            return false;
        }
        transaction_count.parent().parent().removeClass('has-error');
        if (transaction_product_code.val().trim().length <= 0) {
            transaction_product_code.parent().parent().addClass('has-error');
            return false;
        }
        transaction_product_code.parent().parent().removeClass('has-error');
        if (transaction_type.val().trim().length <= 0) {
            transaction_type.parent().parent().addClass('has-error');
            return false;
        }
        transaction_type.parent().parent().removeClass('has-error');
        return true;
    }

    /* REPORT EVENTS */
    // report | search
    $('#report-submit').on('click', function () {
        let date_range = $('#report-date').val();
        let date_arr = date_range.split(' - ')
        let date_from = date_arr[0];
        let date_to = date_arr[1];
        let date_from_arr = date_from.split('/');
        let date_to_arr = date_to.split('/');
        let f_y = date_from_arr[2];
        let f_m = date_from_arr[0];
        let f_d = date_from_arr[1];
        let t_y = date_to_arr[2];
        let t_m = date_to_arr[0];
        let t_d = date_to_arr[1];
        report_from = f_y + '-' + f_m + '-' + f_d;
        report_to = t_y + '-' + t_m + '-' + t_d;
        report_income = 0;
        table_report.ajax.url('/ajax/report?from='+ report_from + '&to=' + report_to).load();
        // generate_income();
    });
    // report | initializer
    function initialize_report() {
        let report_date = $('#report-date');
        if (report_from.trim().length > 0 && report_to.trim().length > 0) {
            let date_from_arr = report_from.split('-');
            let f_y = date_from_arr[0];
            let f_m = date_from_arr[1];
            let f_d = date_from_arr[2];
            let date_to_arr = report_to.split('-');
            let t_y = date_to_arr[0];
            let t_m = date_to_arr[1];
            let t_d = date_to_arr[2];
            let date_now = f_m + '/' + f_d + '/' + f_y + ' - ' + t_m + '/' + t_d + '/' + t_y;
            report_date.val(date_now);
        }
        report_date.daterangepicker();
        // chart
        const chartReport = new Chart($('#chart-income').get(0).getContext('2d'))
        const areaChartData = {
            labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
            datasets: [
                {
                    label: 'Pendapatan',
                    fillColor: 'rgba(60,141,188,0.9)',
                    strokeColor: 'rgba(60,141,188,0.8)',
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: []
                }
            ]
        }
        const areaChartOptions = {
            //Boolean - If we should show the scale at all
            showScale: true,
            //Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines: false,
            //String - Colour of the grid lines
            scaleGridLineColor: 'rgba(0,0,0,.05)',
            //Number - Width of the grid lines
            scaleGridLineWidth: 1,
            //Boolean - Whether to show horizontal lines (except X axis)
            scaleShowHorizontalLines: true,
            //Boolean - Whether to show vertical lines (except Y axis)
            scaleShowVerticalLines: true,
            //Boolean - Whether the line is curved between points
            bezierCurve: true,
            //Number - Tension of the bezier curve between points
            bezierCurveTension: 0.3,
            //Boolean - Whether to show a dot for each point
            pointDot: false,
            //Number - Radius of each point dot in pixels
            pointDotRadius: 4,
            //Number - Pixel width of point dot stroke
            pointDotStrokeWidth: 1,
            //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
            pointHitDetectionRadius: 20,
            //Boolean - Whether to show a stroke for datasets
            datasetStroke: true,
            //Number - Pixel width of dataset stroke
            datasetStrokeWidth: 2,
            //Boolean - Whether to fill the dataset with a color
            datasetFill: true,
            //String - A legend template
            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].lineColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
            //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: true,
            //Boolean - whether to make the chart responsive to window resizing
            responsive: true
        }
        areaChartOptions.datasetFill = false
        $.ajax({
            url: '/ajax/graph',
            method: 'GET',
            dataType: 'json'
        }).then(response => {
            areaChartData.datasets[0].data = response.data.profit_per_month
            chartReport.Line(areaChartData, areaChartOptions)
        })
    }

    /* DASHBOARD */
    $('#dashboard-submit').on('click', function () {
        let date_range = $('#dashboard-date').val();
        let date_arr = date_range.split(' - ')
        let date_from = date_arr[0];
        let date_to = date_arr[1];
        let date_from_arr = date_from.split('/');
        let date_to_arr = date_to.split('/');
        let f_y = date_from_arr[2];
        let f_m = date_from_arr[0];
        let f_d = date_from_arr[1];
        let t_y = date_to_arr[2];
        let t_m = date_to_arr[0];
        let t_d = date_to_arr[1];
        report_from = f_y + '-' + f_m + '-' + f_d;
        report_to = t_y + '-' + t_m + '-' + t_d;
        window.location.replace(window.location.origin + '/report?from=' + report_from + '&to=' + report_to);
    });
    function initialize_dashboard() {
        $('#dashboard-date').daterangepicker();
    }

    /* WRAPPER */
    function formatRupiah(angka, prefix){
        let number_string = angka.replace(/[^,\d]/g, '').toString(),
            split = number_string.split(','),
            sisa = split[0].length % 3,
            rupiah = split[0].substr(0, sisa),
            ribuan = split[0].substr(sisa).match(/\d{3}/gi);
        if (ribuan) {
            separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }
        rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
        return prefix === undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
    }
    function generate_income() {
        let total_income = 0;
        try {
            table_report.rows().every(function () {
                let transaction_count = this.data()['transaction_count'];
                let product_price = this.data()['product_price'];
                let product_stock_price = this.data()['product_stock_price'];
                total_income += transaction_count * (product_price - product_stock_price);
            })
            let html = '<label class="label label-success">' + formatRupiah(total_income.toString(), 'Rp') + '</label>';
            $('#total-income').html(html);
        } catch (e) {
            console.log(e);
        }
    }
    function activate_menu() {
        const endpoint = window.location.pathname;
        if (endpoint === '/dashboard') {
            menu_dashboard.addClass('active');
            initialize_dashboard();
        } else if (endpoint === '/product') {
            menu_product.addClass('active');
        } else if (endpoint === '/category') {
            menu_category.addClass('active');
        } else if (endpoint === '/report') {
            menu_report.addClass('active');
            initialize_report();
        } else if (endpoint === '/transaction') {
            menu_transaction.addClass('active');
            initialize_transaction();
        } else if (endpoint === '/profile') {
            initialize_profile();
        }
    }
    function show_date_now() {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const myDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum&#39;at', 'Sabtu'];
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        let thisDay = date.getDay();
        thisDay = myDays[thisDay];
        const yy = date.getYear();
        const year = (yy < 1000) ? yy + 1900 : yy;
        $('.date-now').html(thisDay + ', ' + day + ' ' + months[month] + ' ' + year);
    }

    /* PROFILE */
    function initialize_profile() {
        let d_fullname = $('#d-fullname');
        let username = $('#username');
        let fullname = $('#fullname');
        let password = $('#password');
        let password2 = $('#password-confirmation');
        username.val('');
        d_fullname.val('');
        fullname.val('');
        password2.val('');
        password.val('');
        $.ajax({
            url: '/ajax/profile',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data['status'] === 'OK') {
                    d_fullname.html(data['data']['fullname']);
                    username.val(data['data']['username']);
                    fullname.val(data['data']['fullname']);
                }
            }
        });
    }
    $('#save-profile').on('click', function () {
        if (validate_profile()) {
            let fullname = $('#fullname').val();
            let password = $('#password').val();
            $.ajax({
                url: '/ajax/profile',
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    password: password,
                    fullname: fullname
                }),
                success: function (data) {
                    if (data['status'] === 'OK') {
                        // refresh profile
                        initialize_profile();
                        // push notification
                        toastr['success']('Berhasil memperbarui profile!');
                    } else {
                        toastr['error']('Gagal memperbarui profile!');
                    }
                }
            });
        }
    });
    function validate_profile() {
        // let username = $('#username');
        let fullname = $('#fullname');
        let password = $('#password');
        let password2 = $('#password-confirmation');
        if (fullname.val().trim().length <= 0 ) {
            fullname.parent().parent().addClass('has-error');
            return false;
        }
        fullname.parent().parent().removeClass('has-error');
        if ((password.val() !== password2.val()) || (password.val().trim().length <= 0 || password2.val().trim().length <= 0)) {
            password.parent().parent().addClass('has-error');
            password2.parent().parent().addClass('has-error');
            return false;
        }
        password.parent().parent().removeClass('has-error');
        password2.parent().parent().removeClass('has-error');
        return true;
    }
});