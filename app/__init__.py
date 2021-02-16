from flask import Flask, render_template, redirect, url_for, request, flash
from flask_login import logout_user, login_required, login_user, current_user
from app.databases.db_sql import db_sql
from app.databases.models.category import Category
from app.databases.models.product import Product
from app.databases.models.transaction import Transaction
from app.databases.models.user import User
from app.forms.user import UserForm
from app.utils.time_utils import date_jakarta
from config import Config
from app.managers import init_managers
from app.databases import init_databases
from werkzeug.security import check_password_hash, generate_password_hash
import datetime
import calendar

app = Flask(__name__)
app.config.from_object(Config)
# jinja strip & trim code blocks
app.jinja_env.lstrip_blocks = True
app.jinja_env.trim_blocks = True
# init managers and databases
init_managers(app)
init_databases(app)


def ajax_success_add_w():
    return {
        'status': 'OK',
        'msg': 'Success add data!'
    }


def ajax_failed_add_w():
    return {
        'status': 'ERROR',
        'msg': 'Failed add data!'
    }


def ajax_success_del_w():
    return {
        'status': 'OK',
        'msg': 'Success delete data!'
    }


def ajax_failed_del_w():
    return {
        'status': 'ERROR',
        'msg': 'Failed delete data!'
    }


def ajax_success_up_w():
    return {
        'status': 'OK',
        'msg': 'Success update data!'
    }


def ajax_failed_up_w():
    return {
        'status': 'ERROR',
        'msg': 'Failed update data!'
    }


def ajax_no_item_w():
    return {
        'status': 'ERROR',
        'msg': 'No such data!'
    }


def ajax_item_w(item):
    return {
        'status': 'OK',
        'data': item.to_dict()
    }


def ajax_items_w(items):
    return {
        'status': 'OK',
        'data': [item.to_dict() for item in items]
    }


# @app.after_request
# def add_header(r):
#     """
#     Add headers to both force latest IE rendering engine or Chrome Frame,
#     and also to cache the rendered page for 10 minutes.
#     """
#     r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#     r.headers["Pragma"] = "no-cache"
#     r.headers["Expires"] = "0"
#     r.headers['Cache-Control'] = 'public, max-age=0'
#     return r


@app.route('/')
def index():
    return redirect(url_for('r_dashboard'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('r_dashboard'))
    form = UserForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        user = User.query.filter(User.username == username).first()
        if user is not None and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('r_dashboard'))
        flash('Kombinasi username dan password salah')
        return redirect(url_for('login'))
    return render_template('login.html', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def r_dashboard():
    product_total = Product.query.count()
    category_total = Category.query.count()
    products = Product.query.all()
    stock_total = 0
    for product in products:
        stock_total += product.product_stock
    transaction_total = Transaction.query.count()
    data = {
        'product_total': product_total,
        'category_total': category_total,
        'stock_total': stock_total,
        'transaction_total': transaction_total
    }
    return render_template('dashboard.html', data=data)


@app.route('/profile')
@login_required
def r_profile():
    return render_template('profile.html')


@app.route('/category')
@login_required
def r_category():
    return render_template('category.html')


@app.route('/transaction')
@login_required
def r_transaction():
    return render_template('transaction.html')


@app.route('/product')
@login_required
def r_product():
    return render_template('product.html')


@app.route('/report')
@login_required
def r_report():
    return render_template('report.html')


# AJAX #
@app.route('/ajax/category', methods=['GET', 'POST'])
def ajax_category():
    if request.method == 'POST':
        json = request.get_json()
        category_code = json['category_code']
        category_name = json['category_name']
        item = Category(
            category_code=category_code,
            category_name=category_name
        )
        if Category.add(item):
            return ajax_success_add_w()
        else:
            return ajax_failed_add_w()
    data = []
    items = Category.query.order_by(Category.category_code.asc()).all()
    for index, item in enumerate(items):
        product_total = Product.query.filter(Product.category_code == item.category_code).count()
        data.append(item.to_table(index, product_total))
    return {
        'status': 'OK',
        'data': data
    }


@app.route('/ajax/category/<category_code>', methods=['GET', 'POST', 'DELETE'])
def ajax_category_id(category_code):
    if request.method == 'POST':
        json = request.get_json()
        category_name = json['category_name']
        item = Category.query.filter(Category.category_code == category_code).first()
        if item is not None:
            item.category_name = category_name
            if Category.update(item):
                return ajax_success_up_w()
            else:
                return ajax_failed_up_w()
    if request.method == 'DELETE':
        if Category.delete(category_code):
            return ajax_success_del_w()
        else:
            return ajax_failed_del_w()
    item = Category.query.filter(Category.category_code == category_code).first()
    if item is not None:
        return ajax_item_w(item)
    return ajax_no_item_w()


@app.route('/ajax/product', methods=['GET', 'POST'])
def ajax_product():
    if request.method == 'POST':
        json = request.get_json()
        product_code = json['product_code']
        product_name = json['product_name']
        product_price = json['product_price']
        product_stock_price = json['product_stock_price']
        product_stock = json['product_stock']
        category_code = json['category_code']
        item = Product(
            product_code=product_code,
            product_name=product_name,
            product_price=product_price,
            product_stock_price=product_stock_price,
            product_stock=product_stock,
            category_code=category_code
        )
        if Product.add(item):
            return ajax_success_add_w()
        else:
            return ajax_failed_add_w()
    data = []
    items = db_sql.session.query(Product, Category).join(Category, Product.category_code == Category.category_code)\
        .order_by(Product.product_code.asc()).all()
    for index, item in enumerate(items):
        data.append(item[0].to_table(index, item[1].category_name))
    return {
        'status': 'OK',
        'data': data
    }


@app.route('/ajax/product/<product_code>', methods=['GET', 'POST', 'DELETE'])
def ajax_product_id(product_code):
    if request.method == 'POST':
        json = request.get_json()
        product_name = json['product_name']
        product_price = json['product_price']
        product_stock_price = json['product_stock_price']
        product_stock = json['product_stock']
        category_code = json['category_code']
        item = Product.query.filter(Product.product_code == product_code).first()
        if item is not None:
            item.product_name = product_name
            item.product_price = product_price
            item.product_stock_price = product_stock_price
            item.product_stock = product_stock
            item.category_code = category_code
            if Product.update(item):
                return ajax_success_up_w()
            else:
                return ajax_failed_up_w()
    if request.method == 'DELETE':
        if Product.delete(product_code):
            return ajax_success_del_w()
        else:
            return ajax_failed_del_w()
    item = Product.query.filter(Product.product_code == product_code).first()
    if item is not None:
        return ajax_item_w(item)
    return ajax_no_item_w()


@app.route('/ajax/transaction', methods=['GET', 'POST'])
def ajax_transaction():
    if request.method == 'POST':
        json = request.get_json()
        product_code = json['product_code']
        transaction_count = int(json['transaction_count'])
        transaction_type = int(json['transaction_type'])
        item = Transaction.query.filter((Transaction.product_code == product_code) &
                                        (Transaction.transaction_date == date_jakarta()) &
                                        (Transaction.transaction_type == transaction_type)).first()
        if item is not None:
            product = Product.query.filter(Product.product_code == item.product_code).first()
            if item.transaction_type == 0:
                product.product_stock += transaction_count
                item.transaction_count += transaction_count
            elif item.transaction_type == 1:
                product.product_stock -= transaction_count
                if product.product_stock < 0:
                    return ajax_failed_up_w()
                item.transaction_count += transaction_count
            if Transaction.update(item) and Product.update(product):
                return ajax_success_up_w()
            return ajax_failed_up_w()
        item = Transaction(
            product_code=product_code,
            transaction_count=transaction_count,
            transaction_type=transaction_type
        )
        product = Product.query.filter(Product.product_code == product_code).first()
        if transaction_type == 0:
            product.product_stock += transaction_count
        elif transaction_type == 1:
            product.product_stock -= transaction_count
            if product.product_stock < 0:
                return ajax_failed_up_w()
        if Transaction.add(item):
            item.product_price = product.product_price
            item.product_stock_price = product.product_stock_price
            if Product.update(product) and Transaction.update(item):
                return ajax_success_add_w()
        return ajax_failed_add_w()
    # data = []
    # items = db_sql.session.query(Product, Category).join(Category, Product.category_code == Category.category_code) \
    #     .order_by(Product.product_code.asc()).all()
    # for index, item in enumerate(items):
    #     data.append(item[0].to_table(index, item[1].category_name))
    # item = Transaction(product_code='AA0', transaction_sold=4)
    # Transaction.add(item)
    data = []
    items = db_sql.session.query(Transaction, Product)\
        .join(Product, Transaction.product_code == Product.product_code)\
        .order_by(Transaction.transaction_date.desc())\
        .order_by(Product.product_code.asc()).all()
    for index, item in enumerate(items):
        data.append(item[0].to_table(index, item[1].product_name))
    return {
        'status': 'OK',
        'data': data
    }


@app.route('/ajax/report')
def ajax_report():
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    data = []
    # has filter
    if date_to != '' and date_from != '':
        items = db_sql.session.query(Transaction, Product) \
            .join(Product, Transaction.product_code == Product.product_code) \
            .filter((Transaction.transaction_date >= date_from) & (Transaction.transaction_date <= date_to) & (Transaction.transaction_type == 1)) \
            .order_by(Transaction.product_code.asc())\
            .order_by(Transaction.product_price.asc()).all()
            # .order_by(Transaction.transaction_date.asc()) \
            # .order_by(Product.product_code.asc()) \
            # .order_by(Product.product_name.asc()).all()
    else:
        items = db_sql.session.query(Transaction, Product)\
            .join(Product, Transaction.product_code == Product.product_code) \
            .filter((Transaction.transaction_date == date_jakarta()) & (Transaction.transaction_type == 1))\
            .order_by(Transaction.product_code.asc())\
            .order_by(Transaction.product_price.asc()).all()
            # .order_by(Transaction.transaction_date.asc()) \
            # .order_by(Product.product_code.asc())\
            # .order_by(Product.product_name.asc()).all()
    for index, item in enumerate(items):
        # if duplicated record based on product code
        if index > 0 and items[index][0].product_code == items[index - 1][0].product_code:
            # has different price
            if items[index][0].product_price != items[index - 1][0].product_price:
                report = item[0].to_table(index, item[1].product_name)
                data.append(report)
            else:
                item[0].transaction_count += data[index - 1]['transaction_count']
                report = item[0].to_table(index, item[1].product_name)
                data.append(report)
                data[index - 1]['transaction_count'] = 0
        else:
            report = item[0].to_table(index, item[1].product_name)
            data.append(report)

    # remove duplication
    # cursor = 0
    # for i in range(len(data)):
    #     if data[cursor]['transaction_count'] <= 0:
    #         del data[cursor]
    #         cursor -= 1
    #     else:
    #         cursor -= 1
    data_filter = []
    for i in range(len(data)):
        if data[i]['transaction_count'] > 0:
            data_filter.append(data[i])

    # rearrange number
    for i in range(len(data_filter)):
        data_filter[i]['number'] = i + 1

    return {
        'status': 'OK',
        'data': data_filter
    }


@app.route('/ajax/profile', methods=['GET', 'POST'])
def ajax_profile():
    if request.method == 'POST':
        item = User.query.filter(User.username == current_user.username).first()
        if item is not None:
            json = request.get_json()
            fullname = json['fullname']
            password = json['password']
            item.fullname = fullname
            item.password = generate_password_hash(password)
            if User.update(item):
                return ajax_success_up_w()
        return ajax_failed_up_w()
    item = User.query.filter(User.username == current_user.username).first()
    if item is not None:
        return {
            'status': 'OK',
            'data': item.to_dict()
        }
    return {
        'status': 'ERROR',
        'msg': 'Cannot find user!'
    }


@app.route('/ajax/graph')
@login_required
def ajax_graph():
    y_now = datetime.date.today().year
    # m_now = datetime.date.today().month
    # w_now = datetime.date.today() - datetime.timedelta(days=7)
    profit_per_month = []
    # profit_today = 0
    # transactions_today = Transaction.query.filter(Transaction.transaction_date == datetime.date.today()).all()
    # for item in transactions_today:
    #     profit_today += item.product_price - item.product_stock_price
    for i in range(12):
        month = i + 1
        num_days = calendar.monthrange(y_now, month)[1]
        start_date = datetime.date(y_now, month, 1)
        end_date = datetime.date(y_now, month, num_days)
        transactions = Transaction.query.filter(
            (Transaction.transaction_date >= start_date) &
            (Transaction.transaction_date <= end_date) &
            (Transaction.transaction_type == 1)
        ).all()
        profit_total = 0
        for item in transactions:
            print(item.product_price)
            profit = (item.product_price - item.product_stock_price) * item.transaction_count
            profit_total += profit
        profit_per_month.append(profit_total)
    return {
        'status': 'OK',
        'data': {
            'profit_per_month': profit_per_month,
            # 'profit_today': profit_today
        }
    }
