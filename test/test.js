const chai = require('chai');
//const assert = require('assert');
const expect = chai.expect;
const test = require('supertest')
const server = require('../server')
const fs = require("fs")
const userModel = require("../model/userModel")
var token = "";
var OAuth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjoiNWNlN2IxZTYwZjBiODg0MDY2ZTA2MDEzIiwiZmlyc3RuYW1lIjoicHJhc2FubmFtb3JlIiwiaWF0IjoxNTU4Njg4MjMwfQ.y4eThAyG-iKW7s3omYlDjJvHIMRflwKtSvSt1umkbYw"


function test1() {

    var data = fs.readFileSync('test/testData.JSON');
    var data1 = JSON.parse(data);
    return data1;
}
function negativetest() {

    var negativedata = fs.readFileSync('test/negativetestdata.JSON');
    var negativedata1 = JSON.parse(negativedata);
    return negativedata1;
}


//positive registration and login
describe('Register and Login', () => {
    before(async function(){
       await userModel.findOneAndDelete({email:"test@gmail.com"})
    })
    it('Registration', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: test1().registration })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.registration.success).to.be.true
                done();
            })
    });

    it('login', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: test1().login })
            .expect(200)
            .end((err, res) => {

                if (err) {
                    return done(err)
                }
                expect(JSON.parse(res.text).data.login.success).to.be.true
                token = JSON.parse(res.text).data.login.token
                done();
            })
    });
})

// negative registration and login
describe('negative Register and Login', () => {
    it('user already Registerd', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: negativetest().negativeregistration })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.registration.success).to.be.false
                done();
            })
    });
    
    it('wrong login password', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: negativetest().negativelogin })
            .expect(200)
            .end((err, res) => {

                if (err) {
                    return done(err)
                }
                expect(JSON.parse(res.text).data.login.success).to.be.false
                done();
            })
    });
    it('login - email not verify ', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: negativetest().emailnotverifylogin })
            .expect(200)
            .end((err, res) => {

                if (err) {
                    return done(err)
                }
                expect(JSON.parse(res.text).data.login.success).to.be.false
                done();
            })
    });
})

describe('forgot email not exits', () => {
    it('forgot', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: negativetest().forgotemailnotexists })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(JSON.parse(res.text).data.forgotpassword.success).to.be.false
                done();
            })
    })
})

describe('forgot and reset', () => {
    it('forgot', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .send({ query: test1().forgot })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(JSON.parse(res.text).data.forgotpassword.success).to.be.true
                done();
            })
    })
})

describe('nagative labels', () => {
    before('label already exits',function(){
        
    })
    it('add label mininum length', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().labelnamemin3 })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addLabel.success).to.be.false
                done();
            })
    });
    it('label already exits', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().labelalreadyexits })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addLabel.success).to.be.false
                done();
            })
    });
    it('nagative update label', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().negativeupdatelabel })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.updateLable.success).to.be.false
                done();
            })
    });
    it('remove label', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().removelabelnotexists })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.removeLabel.success).to.be.false
                done();
            })
    });
})



describe('labels', () => {


    it('add label', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().createlabel })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addLabel.success).to.be.true
                done();
            })
    });
    it('update label', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().updatelabel })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.updateLable.success).to.be.true
                done();
            })
    });
    it('remove label', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: 'mutation {removeLabel( labelID:"5cdd4a5dcf8aac4e73246c44") {message success }}' })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.removeLabel.success).to.be.true
                done();
            })
    });
})


//negative notes

describe('nagative notes testing', () => {


    it('add note already exits', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().negativeaddnote })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addnote.success).to.be.false
                done();
            })
    });
    it('update note not exits', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().negativeeditnote })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.editnote.success).to.be.false
                done();
            })
    });
    it('remove note', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().removenoteexists })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.removenote.success).to.be.false
                done();
            })
    });
    it('add label to note', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().addLabelToNotelabelnotexits })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.addLabelToNote.success).to.be.false
                done();
            })
    });
})

describe('notes', () => {


    it('add note', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().addnote })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addnote.success).to.be.true
                done();
            })
    });
    it('update note', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().editnote })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.editnote.success).to.be.true
                done();
            })
    });
    it('remove note', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().removenote })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.removenote.success).to.be.true
                done();
            })
    });
    it('add label to note', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().addLabelToNote })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.addLabelToNote.success).to.be.true
                done();
            })
    });
})


describe('nagative watch and unwatch', () => {
    it('watch reposiroty not exits', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": OAuth_token })
            .send({ query: negativetest().negativewatchRepository })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.watchrepository.success).to.be.false
                done();
            })
    });
    it('unWatch repository not exits', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": OAuth_token })
            .send({ query: negativetest().negativeUnwatchRepository })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.unwatchrepository.success).to.be.false
                done();
            })
    });
})



describe('watch and unwatch', () => {
    it('watch', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": OAuth_token })
            .send({ query: test1().watchRepository })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.watchrepository.success).to.be.true
                done();
            })
    });
    it('unWatch', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": OAuth_token })
            .send({ query: test1().UnwatchRepository })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.unwatchrepository.success).to.be.true
                done();
            })
    });
})

describe('star and unstar', () => {
    it('star', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": OAuth_token })
            .send({ query: test1().star })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.star.success).to.be.true
                done();
            })
    });
    it('unstar', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": OAuth_token })
            .send({ query: test1().unstar })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.unstar.success).to.be.true
                done();
            })
    });
})

describe('addCollaborator remove Collaborator', () => {
    it('addCollaborator', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().addCollaborator })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addCollaborator.success).to.be.true
                done();
            })
    });
    it('remove collaborator', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token})
            .send({ query: test1().removeCollaborator })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.removeCollaborator.success).to.be.true
                done();
            })
    });
})




describe('trash untrash', () => {
    it('trash', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().trashNote })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.trash.success).to.be.true
                done();
            })
    });
    it('untrash', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token})
            .send({ query: test1().unTrashNote })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.untrash.success).to.be.true
                done();
            })
    });
})



describe('archive unarchive', () => {
    it('archive', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().archiveNote })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.archive.success).to.be.true
                done();
            })
    });
    it('unarchive', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token})
            .send({ query: test1().unarchiveNote })
            .expect(200)
            .end((err, res) => {

                if (err) return done(err);
                expect(JSON.parse(res.text).data.unarchive.success).to.be.true
                done();
            })
    });
})


describe('nagative Reminder date not valid', () => {
    it('Reminder date not valid', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: negativetest().negativereminder })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addReminder.success).to.be.false
                done();
            })
    });
})

describe('Reminder', () => {
    it('Reminder', (done) => {
        test("http://localhost:4000")
            .post('/graphql')
            .query({ "token": token })
            .send({ query: test1().reminder })
            .expect(200)
            .end((err, res) => {
                console.log(token)
                if (err) return done(err);
                expect(JSON.parse(res.text).data.addReminder.success).to.be.true
                done();
            })
    });
})