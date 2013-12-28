from flask import redirect, request, session, url_for
from functools import wraps
from urlparse import urlparse, urljoin


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login', forward_to=request.url))
        return f(*args, **kwargs)
    return decorated_function


def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and \
        ref_url.netloc == test_url.netloc


def get_redirect_target():
    for target in request.args.get('forward_to'), request.referrer:
        if not target:
            continue
        if is_safe_url(target):
            return target
