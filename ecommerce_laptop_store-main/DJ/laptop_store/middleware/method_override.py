class MethodOverrideMiddleware:
    """
    Middleware to handle _method field in POST requests (FormData).
    Laravel-style method spoofing: frontend sends POST with _method=PUT.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'POST' and request.content_type and 'multipart/form-data' in request.content_type:
            method = request.POST.get('_method', '').upper()
            if method in ('PUT', 'PATCH', 'DELETE'):
                request.method = method
                request._method = method
        response = self.get_response(request)
        return response
