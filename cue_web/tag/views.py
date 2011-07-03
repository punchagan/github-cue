# Create your views here.
from jsonpdecorator import AllowJSONPCallback
from django.http import HttpResponse
from simplejson import dumps
from cue_lib import recommends


@AllowJSONPCallback
def repo_tags( request , username) :
    """ dummy view for the time being """

    tags = {'tags':recommends.user_repos(username)}
    
    return HttpResponse(dumps(tags) , mimetype='application/json')


