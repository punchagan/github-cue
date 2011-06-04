#!/usr/bin/env python
"""A recommendation system prototype for GitHub repositories. It
recommends repositories to a user, based on the repositories she is
already following. Uses the apresta/tagger library from github.

Copyright (C) 2011 Puneeth Chaganti <punchagan@muse-amuse.in>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.
"""

import random, sys
import pickle, tagger
from tagger import Tagger # https://github.com/apresta/tagger

from github import github # py-github

def parse_repos(repos):
    """Returns a list of repos, in more usable format."""
    return [{'name': "%s/%s" %(r.owner,r.name),
             'description': get_description(r),
             'tags': taggify(get_description(r)),
             'language': get_language(r),
             'repo': r}
            for r in repos]

def get_language(repo):
    try:
        return repo.language
    except:
        return ''

def get_description(repo):
    try:
        return repo.description
    except:
        return ''

def taggify(text):
    """Get tags from a text_string. Presently using the tagger module."""
    weights = pickle.load(open('data/dict.pkl', 'rb')) # or your own dict
    myreader = tagger.Reader() # or your own reader class
    mystemmer = tagger.Stemmer() # or your own stemmer class
    myrater = tagger.Rater(weights) # or your own... (you got the idea)
    mytagger = Tagger(myreader, mystemmer, myrater)
    return mytagger(text, 3)

def project(repo):
    return "%s/%s" %(repo.owner, repo.name)

def searchGitHub(my_langs, my_tags, n_langs=3, n_tags=12):
    """Search GitHub and return suggestions"""
    # Randomly picking an arbit number of languages and tags.
    # The API rate limit...
    langs = random.sample(my_langs, min(n_langs, len(my_langs)))
    tags = random.sample(my_tags, min(n_tags, len(my_tags)))

    found = []

    for i, lang in enumerate(langs):
        for j, tag in enumerate(tags):
            query, = tag.keys()
            wt = (sum([my_langs[l] for l in my_langs if l == lang])*15)/\
                 sum(my_langs.values())
            print "Searching %s in %s" %(query, lang)
            found.extend(gh.repos.search(query, language=lang \
                                         if ' ' not in lang else ' ')[:wt])

    suggest = [r for r in found if project(r)
               not in [project(p) for p in my_repos]]

    return suggest


if __name__ == '__main__':
    if len(sys.argv)>1:
        me = sys.argv[1]
    else:
        me = u"punchagan"

    gh = github.GitHub()

    print "Fetching list of all repos, %s is watching..." %me
    my_repos = gh.repos.watched(me)
    print "Done!"

    print "Parsing Repos, for tags, langs, etc..."
    my_repos_parsed = parse_repos(my_repos)
    my_tags = [{j.string:j.rating} for r in my_repos_parsed \
               for j in r['tags'] if j.rating > 0.05]
    my_langs = [r['language'] for r in my_repos_parsed]
    my_langs = dict(zip(set(my_langs), [my_langs.count(l) for l in set(my_langs)]))
    print "Done!"

    suggest = searchGitHub(my_langs, my_tags)

    print [p.url for p in random.sample(suggest, 9)]
