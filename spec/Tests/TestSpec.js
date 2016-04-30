describe("Tests", function () {

    var request = require("request");
    var app = require("../../app.js");
    var base_url = "http://localhost:3000/";

    var bearerToken;

    var loginToken = {
        auth: {
            'bearer': bearerToken
        }
    };

    beforeEach(function (done) {
        request.post(base_url + 'login', {
            form: {
                email: "test1@test.com",
                password: "testpass"
            }
        }, function (error, response, body) {
            bearerToken = body;
            done();
        });
    });

    describe('Test Auth', function () {

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
                    email: "test1@test.com",
                    password: "testpass"
                }
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });


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

    });

    //USE JSON PARSE FOR CHECKING JSON THINGS

    //it('updates Users assigned task info',function(done){
    //    request.get(base_url,function(error,respons,body){
    //
    //        done();
    //    });
    //});

    //
    //  it('gets a specific task sucessfully',function(done){
    //      request.get(base_url,function(error,response,body){
    //
    //          done();
    //      });
    //  });
    //
    //  it('formats data correctly',function(done){
    //      request.get(base_url,function(error,response,body){
    //          done();
    //      });
    //  });


});
