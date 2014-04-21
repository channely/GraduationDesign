var crypto = require('crypto'),
    User = require('../models/user.js');

module.exports = function(app) {
    app.get('/', function (req, res) {
        res.render('sign', {
            title: '登录/注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/', function (req, res) {
        if(req.body.signin){
            //生成密码的 md5 值
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.body.signin).digest('hex');
            //检查用户是否存在
            User.get(req.body.email, function (err, user) {
                if (!user) {
                    req.flash('error', '用户不存在!');
                    return res.redirect('/');//用户不存在则跳转到登录页
                }
                //检查密码是否一致
                if (user.password != password) {
                    req.flash('error', '密码错误!');
                    return res.redirect('/');//密码错误则跳转到登录页
                }
                //用户名密码都匹配后，将用户信息存入 session
                req.session.user = user;
                req.flash('success', '登陆成功!');
                res.redirect('/index');//登陆成功后跳转到主页
            });

        }else{
            var password = req.body.signup,
                password_re = req.body['signup-repeat'];
            //检验用户两次输入的密码是否一致
            if (password_re != password) {
                req.flash('error', '两次输入的密码不一致!');
                return res.redirect('/');//返回注册页
            }
            //生成密码的 md5 值
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.body.signup).digest('hex');
            var newUser = new User({
                password: password,
                email: req.body.email
            });
            //检查用户邮箱是否已经存在
            User.get(newUser.email, function (err, user) {
                if (user) {
                    req.flash('error', '邮箱已存在!');
                    return res.redirect('/');//返回注册页
                }
                //如果不存在则新增用户
                newUser.save(function (err, user) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/');//注册失败返回主册页
                    }
                    req.session.user = user;//用户信息存入 session
                    req.flash('success', '注册成功!');
                    res.redirect('/index');//注册成功后返回主页
                });
            });
        };
    });

    app.get('/index', function (req, res) {
        res.render('index', {
            title: 'index page',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.get('/post', function (req, res) {
        res.render('post', { title: '发表' });
    });
    app.post('/post', function (req, res) {
    });
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');//登出成功后跳转到主页
    });
};