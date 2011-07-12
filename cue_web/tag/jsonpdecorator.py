from django.http import HttpResponse
#from django.contrib.auth.decorators import login_required

class AllowJSONPCallback(object):
    """This decorator function wraps a normal view function                                                                                      
    so that it can be read through a jsonp callback.                                                                                             
                                                                                                                                                 
    Usage:                                                                                                                                       
                                                                                                                                                 
    @AllowJSONPCallback                                                                                                                          
    def my_view_function(request):                                                                                                               
        return HttpResponse('this should be viewable through jsonp')                                                                             
                                                                                                                                                 
    It looks for a GET parameter called "callback", and if one exists,                                                                           
    wraps the payload in a javascript function named per the value of callback.                                                                  
                                                                                                                                                 
    Using AllowJSONPCallback implies that the user must be logged in                                                                             
    (and applies automatically the login_required decorator).                                                                                    
    If callback is passed and the user is logged out, "notLoggedIn" is                                                                           
    returned instead of a normal redirect, which would be hard to interpret                                                                      
    through jsonp.                                                                                                                               
                                                                                                                                                 
    If the input does not appear to be json, wrap the input in quotes                                                                            
    so as not to throw a javascript error upon receipt of the response."""
    def __init__(self, f):
        self.f = f

    def __call__(self, *args, **kwargs):
        request = args[0]
        callback = request.GET.get('callback')
        # if callback parameter ispresent,                                                                                                      
        # this is going to be a jsonp callback.                                                                                                  
        if callback:
            try:
                response = self.f(*args, **kwargs)
	    except:
                response = HttpResponse('error', status=500)
            if response.status_code / 100 != 2:
                response.content = 'error'

            if response.content[0] not in ['"', '[', '{'] \
                    or response.content[-1] not in ['"', ']', '}']:
                response.content =  response.content
            response.content = "%s(%s)" % (callback, response.content)
            response['Content-Type'] = 'application/javascript'
            print response.content
        else:
            response = self.f(*args, **kwargs)
        return response
