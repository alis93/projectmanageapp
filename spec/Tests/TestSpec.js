describe("Tests", function () {

    var request = require("request");
    var app = require("../../app.js");
    var base_url = "http://localhost:3000/";


    describe('Authentication tests', function () {


        it('rejects invalid User Details', function (done) {
            request.post(base_url + 'login', {
                form: {
                    email: "test1dsfd@test.com",
                    password: "1"
                }
            }, function (error, response, body) {
                expect(response.statusCode).toBe(401);
                done();
            });
        });

        it('Registers a User', function (done) {
            var randomString = Math.random().toString(36).substring(7);
            request.post(base_url + "register", {
                form: {
                    name: "test",
                    email: randomString,
                    password: "testpass"
                }
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });

        it('validates User Details Succesfully', function (done) {
            request.post(base_url + 'login', {
                form: {
                    email: "elena@test.com",
                    password: "elena"
                }
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });


    });

    describe('functionality tests', function () {
        var bearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzI5M2RiNWQ3Zjk3NTQyNjkwNTEyMjUiLCJlbWFpbCI6ImRza2xmamtsZHNmanNkZkB0ZXN0LmNvbSIsIm5hbWUiOiJ0ZXN0cGVyc29uIiwiZXhwIjoxNDY3NTA0NTY1LCJpYXQiOjE0NjIzMjA1NjV9.sJATznaZxAczTee1J-J1jBfnzV7geCGtEf3cGIQIg5A';

        var loginToken = {
            'auth': {
                'bearer': bearerToken
            }
        };

        //beforeEach(function (done) {
        //    request.post(base_url + 'login', {
        //        form: {
        //            email: "elena@test.com",
        //            password: "elena"
        //        }
        //    }, function (error, response, body) {
        //        var token = JSON.parse(body);
        //        bearerToken = token.token;
        //        done();
        //    });
        //});


        var project_id = '572634f8d4cbab84c069fd5f';
        var task_id = '572944ecda2457096f65749f';

        it('creates a new task sucessfully', function (done) {

            request.post(base_url + 'projects/' + project_id + '/pages', function (error, response, body) {
                    expect(response.statusCode).toBe(200);
                    expect(body).toBeTruthy();
                done();
                })
                .auth(null, null, true, bearerToken)
                .form({title: "some test task"});
        });

        //it('retrieves a specific task sucessfully',function(done){
        //    request.get(base_url+'projects/'+project_id+'/pages/'+task_id,function(error,response,body){
        //        expect(response.statusCode).toBe(200);
        //        expect(body).toBeTruthy();
        //        expect(JSON.parse(body)._id).toBe('572944ecda2457096f65749f');
        //        done();
        //    }).auth(null, null, true,bearerToken);
        //});

        it('formats data correctly', function (done) {
            request.get(base_url + 'project/' + project_id + '/aggregate/totalHoursByUser', function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeTruthy();
                var data = JSON.parse(body);
                expect(data.length >= 1).toBeTruthy();
                var firstIndex = data[0];
                expect(firstIndex._id).toBeTruthy();
                expect(firstIndex.info).toBeTruthy();
                done();
            }).auth(null, null, true, bearerToken);
        });

        //it('Deletes a task correctly from a project',function(done){
        //    request.delete(base_url+'projects/'+project_id+'/pages/'+task_id,function(error,response,body){
        //        expect(response.statusCode).toBe(200);
        //        expect(body).toBeTruthy();
        //        done();
        //    })
        //    .auth(null, null, true,bearerToken);
        //});


    });




});
