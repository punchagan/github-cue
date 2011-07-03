from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'cue_web.views.home', name='home'),
    # url(r'^cue_web/', include('cue_web.foo.urls')),
    url(r'^tags/(?P<username>[\w]+)/$', 'cue_web.tag.views.repo_tags', name='tags'),
                       

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
