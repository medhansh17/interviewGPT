import time
from functools import wraps


def retry(max_retries=3, delay=2):
    def decorator_retry(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    retries += 1
                    if retries == max_retries:
                        raise e
                    time.sleep(delay)  # Delay in seconds between retries
        return wrapper
    return decorator_retry
