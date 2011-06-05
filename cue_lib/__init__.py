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

def get_weights(langs, all_langs):
    m, n = len(langs), len(all_langs)
    t = sum(my_langs.values())
    weights = []
    for lang in langs:
        count, = [my_langs[l] for l in my_langs if l == lang] # count of lang
        weights.append((float(count)*n)/(t*m))

    return weights
                 
def searchGitHub(langs, tags, weights):
    """Search GitHub and return suggestions"""
    found = []
    if None in tags:
        tags.remove(None)

    for i, lang in enumerate(langs):
        for j, tag in enumerate(tags):
            query = tag.string
            wt = weights[i]
            print "Searching %s in %s" %(query, lang)
            found.extend(gh.repos.search(query, language=lang \
                                         if ' ' not in lang else ' ')[:int(wt*18)])

    suggest = {r for r in found if project(r)
               not in [project(p) for p in my_repos]}
    return suggest


def pick_tag(repo):
    if repo['tags']:
        m = max([t.rating for t in repo['tags']])
        return random.sample([t for t in repo['tags'] if t.rating == m], 1)[0]
    else:
        return 

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
    my_langs = map(get_language, my_repos)
    my_langs = dict(zip(set(my_langs), [my_langs.count(l) for l in set(my_langs)]))
    # Randomly picking an arbit number of languages and tags.
    # The API rate limit...
    langs = random.sample(my_langs, min(3, len(my_langs)))
    repos = parse_repos(random.sample(my_repos, min(12, len(my_repos))))
    tags = set(map(pick_tag, repos))
    weights = get_weights(langs, my_langs)
    print "Done!"
    
    suggest = searchGitHub(langs, tags, weights)

    print "Found %s relevant repos" % len(suggest)
    print [p.url for p in random.sample(suggest, min(9, len(suggest)))]
