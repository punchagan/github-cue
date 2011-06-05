var username;

// http://stackoverflow.com/questions/1208067/wheres-my-json-data-in-my-incoming-django-request

var run = function() {
    var gh_user = gh.user(username);

    var watch = gh_user.watching(function(data) {
        var repos = data.repositories;
        
        var languages = {};
        var descriptions = [];
        repos.forEach(function(elm, i, arr) {
            
            // Get language count for user 
            if (arr[i].language) {
                if (arr[i].language in languages) {
                    languages[arr[i].language]++;
                } else {
                    languages[arr[i].language] = 1;
                }
            }

            // Get descriptions of all the watched repos
            if (arr[i].description) {
                descriptions.push(arr[i].description)
            }
        })

        var userData = {languages: languages, descriptions: descriptions};
        console.log(JSON.stringify(userData));

        $.ajax({
            url: '/user-data',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(userData),
            dataType: 'text',
            success: function(result) {
                alert(result.Result);
            }
        });
    });
};


var search = gh.repo.search("machine learning", {language:"Python"}, 
                            function(data) {
                                var repos = data.repositories;
                                var sorted = [];
                                var languages = {};

                                repos.forEach(function(elm, i, arr) {
                                    alert(arr[i].name);
                                });
                                   
                            });

