let md5 = require('crypto-js/md5');
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    database: 'test',
    user: 'root',
    password: '',
    charset: 'UTF8MB4_UNICODE_CI' // 解决贡献者名称有表情符号无法保存的问题
});
connection.connect(); //连接

let clientMap = {};   // 用于多个应用同时连接
module.exports = {
  // 模块介绍
  summary: 'tonaowangzhe',
  // 发送请求前拦截处理
  *beforeSendRequest(requestDetail) { /* ... */ },
  // 发送响应前处理
  *beforeSendResponse(requestDetail, responseDetail) {
    let response = responseDetail.response;
    let remoteAddress = requestDetail._req.client.remoteAddress || '';
    let clientIp = remoteAddress.trim().replace('::ffff:', '');
    console.info('clientIp: ' + clientIp);  // clientId: 192.168.100.101
    if (requestDetail.url == 'https://question.hortor.net/question/fight/findQuiz') {   // 请求问题
      return new Promise(function(resolve, reject) {
        let responseBody = response.body;
        let jsonBody = JSON.parse(responseBody);
        let quizTitle = jsonBody.data.quiz;
        let quizId = md5(quizTitle) + '';
        let originalOptioins = JSON.parse(JSON.stringify(jsonBody.data.options));
        let originalOptioins2 = JSON.parse(JSON.stringify(jsonBody.data.options));
        let currentQuiz = {id: quizId, quiz: quizTitle, options: originalOptioins};
        connection.query('select * from tounaowangzhe where id = ?', [quizId], function(error, results, fields) {
          let hasAnswer = false;
          if (results.length) {
            var data = results[0];
            if (data && data.answer.length) {
              currentQuiz = data;
              currentQuiz.options = originalOptioins;
              for (let i = 0; i < jsonBody.data.options.length; i++) {
                if (jsonBody.data.options[i] == data.answer) {
                  jsonBody.data.options[i] = '【√】' + jsonBody.data.options[i];
                  jsonBody.data.quiz = '【有答案】' + jsonBody.data.quiz;
                  hasAnswer = true;
                } else {
                  jsonBody.data.options[i] = ' ';
                }
              }
            }
          }
          clientMap[clientIp] = currentQuiz;
          if (hasAnswer) {
            response.body = JSON.stringify(jsonBody);
            resolve(responseDetail);
            return;
          }
          resolve(responseDetail);
          let q = {
            id: quizId, 
            quiz: quizTitle, 
            options: JSON.stringify(originalOptioins2.sort()), 
            school: jsonBody.data.school,
            type: jsonBody.data.type,
            contributor: jsonBody.data.contributor
          };
          let params = [q.id, q.quiz, q.options, q.school, q.type, q.contributor, q.options, q.school, q.type, q.contributor];
          let query = connection.query('INSERT INTO tounaowangzhe(id, quiz, options, school, type, contributor) values(?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE options = ?, school = ?, type = ?, contributor = ?', params, function (error, results, fields) {
            if (error) throw error;
            // Neat!
          });
        });
      });

    } else if (requestDetail.url == 'https://question.hortor.net/question/fight/choose') {    // 提交答案
      let currentQuiz = clientMap[clientIp];
      let responseBody = response.body;
      let jsonBody = JSON.parse(responseBody);
      let answerIndex = jsonBody.data.answer - 1;
      let answerText = currentQuiz.options[answerIndex];
      let currentQuizId = currentQuiz.id;
      let params = [answerText, currentQuizId];
      let query = connection.query('UPDATE tounaowangzhe SET answer = ? WHERE id = ?', params, function (error, results, fields) {
        if (error) throw error;
        // Neat!
      });
    }
    return responseDetail;
  },
  // 是否处理https请求
  *beforeDealHttpsRequest(requestDetail) {
    if (requestDetail.host == 'question.hortor.net:443') {
      return true;
    }
    return false;
  },
  // 请求出错的事件
  *onError(requestDetail, error) { /* ... */ },
  // https连接服务器出错
  *onConnectError(requestDetail, error) { /* ... */ }
};